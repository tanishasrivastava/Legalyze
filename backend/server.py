from fastapi import FastAPI, UploadFile, File, Form, Body
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from dotenv import load_dotenv
import io
import uuid
import traceback
import json
import os
from docx import Document

from legalyze import (
    extract_pdf_text_from_bytes,
    identify_parties,
    get_contract_synopsis,
    risk_analysis,
    ask_chatbot,
    generate_contract_timeline,
    generate_suggested_questions,
    detect_ambiguities,
    negotiation_strategy,
    analyze_voice_query,
    generate_certificate_analysis,
    generate_executive_summary,
    generate_financial_exposure,
    generate_escape_routes,
    generate_scenario_simulations,
    generate_compliance_check,       # ← NEW
)

load_dotenv()

app = FastAPI(title="Legalyze API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

SESSIONS = {}
TEMP_DIR = "temp_downloads"
if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)

# ─── DB CONNECTION ───
MONGO_URI = os.getenv("MONGO_URI")

client = AsyncIOMotorClient(MONGO_URI)

database = client["legalyze_db"]

user_collection     = database.get_collection("users")
contract_collection = database.get_collection("contracts")
teams_collection    = database.get_collection("teams")

# ─── PYDANTIC MODELS ───
class WorkspaceUpdate(BaseModel):
    email: EmailStr
    workspaceType: str

class ProfileUpdate(BaseModel):
    fullName: str
    email: EmailStr
    company: str = ""
    role: str = ""
    workspaceType: str

class TeamCreate(BaseModel):
    name: str
    owner_email: str


# ─── HELPER: log team activity ───
async def log_team_activity(team_id: str, actor_email: str, actor_name: str, description: str):
    try:
        await database.team_activity.insert_one({
            "team_id":     team_id,
            "actor_email": actor_email,
            "actor_name":  actor_name,
            "description": description,
            "created_at":  datetime.utcnow(),
        })
    except Exception as e:
        print(f"Activity log error: {e}")


# ════════════════════════════════════════════
#  COMPLIANCE CHECK  ← FIXED (uses adv_llm, no raw genai)
# ════════════════════════════════════════════

@app.post("/api/compliance-check")
async def compliance_check(data: dict = Body(...)):
    """
    AI Compliance Checker.
    Routes through adv_llm (Gemini → Groq fallback).
    No raw genai.configure calls — no auth errors.
    """
    try:
        contract_text = data.get("contract_text", "")
        if not contract_text:
            return JSONResponse(status_code=400, content={"error": "No contract text provided"})
        result = generate_compliance_check(contract_text)
        return result
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})


# ════════════════════════════════════════════
#  TEAMS ENDPOINTS
# ════════════════════════════════════════════

@app.get("/api/teams/{email}")
async def get_user_teams(email: str):
    try:
        cursor = teams_collection.find({"$or": [{"owner_email": email}, {"members.email": email}]})
        teams  = await cursor.to_list(length=100)
        for team in teams:
            team["_id"] = str(team["_id"])
            if "created_at" in team and team["created_at"]:
                team["created_at"] = team["created_at"].isoformat()
        return teams
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/api/teams/create")
async def create_team(data: TeamCreate):
    try:
        existing = await teams_collection.find_one({"name": data.name, "owner_email": data.owner_email})
        if existing:
            return JSONResponse(status_code=400, content={"error": "Team name already exists"})
        new_team = {
            "name": data.name, "owner_email": data.owner_email,
            "created_at": datetime.utcnow(),
            "members": [{"email": data.owner_email, "role": "Admin", "name": "You (Owner)", "status": "confirmed"}]
        }
        result = await teams_collection.insert_one(new_team)
        await log_team_activity(str(result.inserted_id), data.owner_email, "Owner", f"Team \"{data.name}\" was created")
        return {"status": "success", "team_id": str(result.inserted_id)}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/api/teams/invite")
async def invite_to_team(data: dict = Body(...)):
    try:
        team_id_str  = data.get("team_id")
        invite_email = data.get("email", "").strip()
        role         = data.get("role", "Viewer")
        inviter_name = data.get("inviter_name", "Admin")
        inviter_email= data.get("inviter_email", "")
        if not invite_email:
            return JSONResponse(status_code=400, content={"error": "Email is required"})
        team_id = ObjectId(team_id_str)
        team = await teams_collection.find_one({"_id": team_id})
        if not team:
            return JSONResponse(status_code=404, content={"error": "Team not found"})
        if any(m["email"] == invite_email for m in team.get("members", [])):
            return JSONResponse(status_code=400, content={"error": "User already invited or in team"})
        new_member = {"email": invite_email, "role": role, "name": invite_email.split("@")[0].capitalize(), "status": "pending"}
        await teams_collection.update_one({"_id": team_id}, {"$push": {"members": new_member}})
        await database.notifications.insert_one({
            "recipient_email": invite_email, "type": "invite", "title": "Invitation Sent",
            "message": f"Invitation sent to {invite_email} for team \"{team['name']}\"",
            "team_id": team_id_str, "team_name": team["name"], "role": role,
            "status": "pending", "read": False, "created_at": datetime.utcnow(),
        })
        await log_team_activity(team_id_str, inviter_email, inviter_name, f"{inviter_name} invited {invite_email} as {role}")
        return {"status": "success", "message": "Invitation sent"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.delete("/api/teams/{team_id}")
async def delete_team(team_id: str, admin_email: str):
    try:
        team = await teams_collection.find_one({"_id": ObjectId(team_id)})
        if not team:
            return JSONResponse(status_code=404, content={"error": "Team not found"})
        if team["owner_email"] != admin_email:
            return JSONResponse(status_code=403, content={"error": "Only the admin can delete this team"})
        for member in team.get("members", []):
            if member["email"] != admin_email:
                await database.notifications.insert_one({
                    "recipient_email": member["email"], "type": "team_deleted", "title": "Team Deleted",
                    "message": f"The team \"{team['name']}\" was deleted by the admin.",
                    "team_id": team_id, "team_name": team["name"], "read": False, "created_at": datetime.utcnow(),
                })
        await teams_collection.delete_one({"_id": ObjectId(team_id)})
        await database.team_activity.delete_many({"team_id": team_id})
        await database.team_contracts.delete_many({"team_id": team_id})
        return {"status": "success", "message": "Team deleted"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/api/teams/remove-member")
async def remove_member(data: dict = Body(...)):
    try:
        team_id      = ObjectId(data["team_id"])
        member_email = data["member_email"]
        admin_email  = data["admin_email"]
        team = await teams_collection.find_one({"_id": team_id})
        if not team:
            return JSONResponse(status_code=404, content={"error": "Team not found"})
        if team["owner_email"] != admin_email:
            return JSONResponse(status_code=403, content={"error": "Only admin can remove members"})
        await teams_collection.update_one({"_id": team_id}, {"$pull": {"members": {"email": member_email}}})
        await database.notifications.insert_one({
            "recipient_email": member_email, "type": "removed", "title": "Removed from Team",
            "message": f"You were removed from the team \"{team['name']}\".",
            "team_id": str(team_id), "team_name": team["name"], "read": False, "created_at": datetime.utcnow(),
        })
        await log_team_activity(str(team_id), admin_email, "Admin", f"Admin removed {member_email} from the team")
        return {"status": "success"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/api/teams/share-contract")
async def share_contract_with_team(data: dict = Body(...)):
    try:
        team_id         = data.get("team_id", "")
        contract_id     = data.get("contract_id", "")
        shared_by_email = data.get("shared_by_email", "")
        shared_by_name  = data.get("shared_by_name", "")
        contract_name   = data.get("contract_name", "Unnamed Contract")
        if not team_id or not contract_id:
            return JSONResponse(status_code=400, content={"error": "team_id and contract_id are required"})
        contract = await contract_collection.find_one({"_id": ObjectId(contract_id)})
        if not contract:
            return JSONResponse(status_code=404, content={"error": "Contract not found"})
        existing = await database.team_contracts.find_one({"team_id": team_id, "contract_id": contract_id})
        if existing:
            return JSONResponse(status_code=400, content={"error": "Contract already shared with this team"})
        analysis_result = contract.get("analysis_result", {})
        risk_level      = contract.get("risk_level", "Unknown")
        await database.team_contracts.insert_one({
            "team_id": team_id, "contract_id": contract_id, "contract_name": contract_name,
            "shared_by_email": shared_by_email, "shared_by_name": shared_by_name,
            "analysis_result": analysis_result, "risk_level": risk_level, "shared_at": datetime.utcnow(),
        })
        await log_team_activity(team_id, shared_by_email, shared_by_name, f"{shared_by_name} shared \"{contract_name}\" with the team")
        team = await teams_collection.find_one({"_id": ObjectId(team_id)})
        if team:
            for member in team.get("members", []):
                if member["email"] != shared_by_email and member.get("status") != "pending":
                    await database.notifications.insert_one({
                        "recipient_email": member["email"], "type": "contract_shared", "title": "Contract Shared",
                        "message": f"{shared_by_name} shared \"{contract_name}\" with you. Click to view the analysis.",
                        "team_id": team_id, "team_name": team.get("name", ""), "contract_name": contract_name,
                        "analysis_result": analysis_result, "read": False, "created_at": datetime.utcnow(),
                    })
        return {"status": "success"}
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/api/teams/{team_id}/contracts")
async def get_team_contracts(team_id: str):
    try:
        cursor    = database.team_contracts.find({"team_id": team_id}).sort("shared_at", -1)
        contracts = await cursor.to_list(length=50)
        for c in contracts:
            c["_id"] = str(c["_id"])
            if c.get("shared_at"): c["shared_at"] = c["shared_at"].isoformat()
        return contracts
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/api/teams/{team_id}/activity")
async def get_team_activity(team_id: str):
    try:
        cursor     = database.team_activity.find({"team_id": team_id}).sort("created_at", -1).limit(50)
        activities = await cursor.to_list(length=50)
        for a in activities:
            a["_id"] = str(a["_id"])
            if a.get("created_at"): a["created_at"] = a["created_at"].isoformat()
        return activities
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# ════════════════════════════════════════════
#  NOTIFICATIONS
# ════════════════════════════════════════════

@app.get("/api/notifications/{email}")
async def get_notifications(email: str):
    try:
        cursor = database.notifications.find({"recipient_email": email}).sort("created_at", -1).limit(50)
        notifs = await cursor.to_list(length=50)
        for n in notifs:
            n["_id"] = str(n["_id"])
            if n.get("created_at"): n["created_at"] = n["created_at"].isoformat()
        return notifs
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/api/notifications/accept-invite")
async def accept_invite(data: dict = Body(...)):
    try:
        notif_id = data["notification_id"]
        team_id  = data["team_id"]
        email    = data["email"]
        await teams_collection.update_one({"_id": ObjectId(team_id), "members.email": email}, {"$set": {"members.$.status": "confirmed"}})
        await database.notifications.update_one({"_id": ObjectId(notif_id)}, {"$set": {"status": "accepted", "read": True}})
        member_name = email.split("@")[0].capitalize()
        await log_team_activity(team_id, email, member_name, f"{member_name} accepted the invitation")
        team = await teams_collection.find_one({"_id": ObjectId(team_id)})
        if team:
            await database.notifications.insert_one({
                "recipient_email": team["owner_email"], "type": "invite_accepted", "title": "Invite Accepted",
                "message": f"{email} accepted your invitation to join \"{team['name']}\".",
                "team_id": team_id, "read": False, "created_at": datetime.utcnow(),
            })
        return {"status": "success"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/api/notifications/decline-invite")
async def decline_invite(data: dict = Body(...)):
    try:
        notif_id = data["notification_id"]
        team_id  = data["team_id"]
        email    = data["email"]
        await teams_collection.update_one({"_id": ObjectId(team_id)}, {"$pull": {"members": {"email": email, "status": "pending"}}})
        await database.notifications.update_one({"_id": ObjectId(notif_id)}, {"$set": {"status": "declined", "read": True}})
        return {"status": "success"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/api/notifications/mark-read")
async def mark_notification_read(data: dict = Body(...)):
    try:
        await database.notifications.update_one({"_id": ObjectId(data["notification_id"])}, {"$set": {"read": True}})
        return {"status": "success"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/api/notifications/mark-all-read")
async def mark_all_read(data: dict = Body(...)):
    try:
        await database.notifications.update_many({"recipient_email": data["email"], "read": False}, {"$set": {"read": True}})
        return {"status": "success"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# ════════════════════════════════════════════
#  USER / PROFILE
# ════════════════════════════════════════════

@app.post("/api/user/update-profile")
async def update_profile(data: ProfileUpdate):
    try:
        result = await user_collection.find_one_and_update(
            {"email": data.email},
            {"$set": {"name": data.fullName, "company": data.company, "role": data.role, "workspaceType": data.workspaceType}},
            return_document=True
        )
        if not result:
            return JSONResponse(status_code=404, content={"error": "User not found"})
        return {"status": "success", "message": "Profile updated"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/api/user/update-workspace")
async def update_workspace(data: WorkspaceUpdate):
    try:
        result = await user_collection.find_one_and_update(
            {"email": data.email}, {"$set": {"workspaceType": data.workspaceType}}, return_document=True
        )
        if not result:
            return JSONResponse(status_code=404, content={"error": "User not found"})
        return {"status": "success", "workspaceType": data.workspaceType}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/api/user/dashboard-stats/{email}")
async def get_dashboard_stats(email: str):
    try:
        user = await user_collection.find_one({"email": email})
        if not user:
            return JSONResponse(status_code=404, content={"error": "User not found"})
        return {
            "name": user.get("name"), "workspaceType": user.get("workspaceType", "individual"),
            "stats": [
                {"label": "Contracts Analyzed", "value": "12", "color": "blue"},
                {"label": "Risks Detected",     "value": "34", "color": "red"},
                {"label": "Tools Used",          "value": "8",  "color": "orange"},
                {"label": "Time Saved",          "value": "6h", "color": "green"},
            ]
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/api/user/dashboard-data/{email}")
async def get_dashboard_data(email: str):
    cursor      = contract_collection.find({"user_email": email}).sort("created_at", -1).limit(5)
    contracts   = await cursor.to_list(length=5)
    total_count = await contract_collection.count_documents({"user_email": email})
    formatted_contracts = []
    total_risks = 0
    for c in contracts:
        total_risks += len(c["analysis_result"]["risk_report"].get("high_risks", []))
        formatted_contracts.append({
            "id":        str(c["_id"]),
            "name":      c["filename"],
            "date":      c["created_at"].strftime("%b %d, %Y"),
            "risk":      c["risk_level"],
            "status":    c["status"],
            "full_data": c["analysis_result"]
        })
    return {
        "stats": [
            {"label": "Contracts Analyzed", "value": str(total_count),         "color": "blue"},
            {"label": "Risks Detected",     "value": str(total_risks),         "color": "red"},
            {"label": "Tools Used",          "value": "8",                      "color": "orange"},
            {"label": "Time Saved",          "value": f"{total_count * 0.5}h", "color": "green"},
        ],
        "recent_contracts": formatted_contracts
    }


# ════════════════════════════════════════════
#  CONTRACT ANALYSIS
# ════════════════════════════════════════════

@app.post("/analyze")
async def analyze(file: UploadFile = File(None), contract_text: str = Form(None)):
    try:
        if file:
            filename = file.filename.lower()
            contents = await file.read()
            bytes_io = io.BytesIO(contents)
            if filename.endswith(".pdf"):
                text = extract_pdf_text_from_bytes(bytes_io)
            else:
                return JSONResponse(status_code=400, content={"error": "Only .pdf currently supported."})
        elif contract_text:
            text = contract_text
        else:
            return JSONResponse(status_code=400, content={"error": "No file or contract_text provided."})
        raw_parties = identify_parties(text)
        parties = []
        for line in raw_parties.splitlines():
            line = line.strip()
            if not line: continue
            import re
            line = re.sub(r'^\s*\d+[\.\)]\s*', '', line)
            line = re.sub(r'^\s*[-•]\s*', '', line)
            parties.append(line)
        session_id = str(uuid.uuid4())
        SESSIONS[session_id] = {"text": text, "parties": parties}
        return {"session_id": session_id, "parties": parties, "text": text}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e), "trace": traceback.format_exc()})


@app.post("/analyze/{session_id}/finalize")
async def finalize(session_id: str, perspective: str = Form(...), email: str = Form(...), filename: str = Form("Contract.pdf")):
    try:
        sess = SESSIONS.get(session_id)
        if not sess:
            return JSONResponse(status_code=404, content={"error": "session_id not found"})
        text          = sess["text"]
        synopsis      = get_contract_synopsis(text, perspective)
        risk_json_str = risk_analysis(text, perspective)
        try:
            risk_data = json.loads(risk_json_str)
        except:
            risk_data = {"risk_score": 50, "high_risks": [], "safe_clauses": [], "favorability": {"selected_party_score": 50, "counter_party_score": 50}}
        score      = risk_data.get("risk_score", 0)
        risk_level = "Low" if score > 70 else "Medium" if score > 40 else "High"
        analysis_record = {
            "user_email": email, "filename": filename, "risk_level": risk_level, "risk_score": score,
            "analysis_result": {
                "session_id": session_id, "synopsis": synopsis, "risk_report": risk_data,
                "full_text": text, "selected": perspective, "parties": sess.get("parties", [])
            },
            "status": "Analyzed", "created_at": datetime.utcnow()
        }
        await contract_collection.insert_one(analysis_record)
        return {"session_id": session_id, "synopsis": synopsis, "risk_report": risk_data,
                "full_text": text, "selected": perspective, "parties": sess.get("parties", [])}
    except Exception as e:
        print(traceback.format_exc())
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/ambiguity")
async def ambiguity(data: dict = Body(...)):
    try:
        contract_text = data.get("contract_text", "")
        if not contract_text:
            return JSONResponse(status_code=400, content={"error": "No contract text provided"})
        return detect_ambiguities(contract_text)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/timeline")
async def get_timeline(data: dict = Body(...)):
    try:
        contract_text = data.get("contract_text", "")
        if not contract_text:
            return JSONResponse(status_code=400, content={"error": "No contract text provided"})
        timeline = generate_contract_timeline(contract_text)
        return {"timeline": timeline}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e), "trace": traceback.format_exc()})


@app.post("/negotiation-strategy")
async def get_negotiation(data: dict = Body(...)):
    contract_text = data.get("contract_text", "")
    perspective   = data.get("perspective", "The User")
    if not contract_text:
        return JSONResponse(status_code=400, content={"error": "Missing text"})
    return negotiation_strategy(contract_text, perspective)


@app.post("/executive-summary")
async def get_executive_summary(data: dict = Body(...)):
    try:
        contract_text = data.get("contract_text", "")
        perspective   = data.get("perspective", "The User")
        if not contract_text:
            return JSONResponse(status_code=400, content={"error": "Missing text"})
        return generate_executive_summary(contract_text, perspective)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/financial-exposure")
async def get_financial_exposure(data: dict = Body(...)):
    contract_text = data.get("contract_text", "")
    perspective   = data.get("perspective", "The User")
    return generate_financial_exposure(contract_text, perspective)


@app.post("/certificate")
async def generate_certificate(data: dict = Body(...)):
    try:
        contract_text = data.get("contract_text", "")
        perspective   = data.get("perspective", "The User")
        if not contract_text:
            return JSONResponse(status_code=400, content={"error": "No contract text provided"})
        analysis           = generate_certificate_analysis(contract_text, perspective)
        risk_val           = analysis.get("risk_score", 60)
        display_risk_score = 100 - risk_val
        compliance_score   = max(50, 100 - (risk_val // 2))
        verdict = "CONDITIONALLY APPROVED"
        if display_risk_score < 40:   verdict = "HIGH RISK"
        elif display_risk_score > 75: verdict = "SAFE TO SIGN"
        return {"risk_score": display_risk_score, "compliance_score": compliance_score, "verdict": verdict, "findings": analysis.get("findings", [])}
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": "Analysis failed", "details": str(e)})


@app.post("/escape-routes")
async def get_escape_routes(data: dict = Body(...)):
    try:
        contract_text = data.get("contract_text", "")
        perspective   = data.get("perspective", "The User")
        if not contract_text:
            return JSONResponse(status_code=400, content={"error": "No contract text provided"})
        return generate_escape_routes(contract_text, perspective)
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": "Failed to analyze escape routes", "details": str(e)})


@app.post("/scenario-simulator")
async def run_scenario_simulator(data: dict = Body(...)):
    try:
        contract_text = data.get("contract_text", "")
        perspective   = data.get("perspective", "The User")
        if not contract_text:
            return JSONResponse(status_code=400, content={"error": "No contract text provided"})
        result = generate_scenario_simulations(contract_text, perspective)
        return result
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/download-docx")
async def download_docx(content: str = Form(...), filename: str = Form("edited_contract.docx")):
    try:
        document = Document()
        for line in content.split("\n"):
            document.add_paragraph(line)
        filepath = os.path.join(TEMP_DIR, filename)
        document.save(filepath)
        return FileResponse(path=filepath, filename=filename,
                            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/voice-suggestions")
async def get_voice_suggestions(data: dict = Body(...)):
    contract_text = data.get("contract_text", "")
    if not contract_text:
        return JSONResponse(status_code=400, content={"error": "No contract text provided"})
    return {"suggestions": generate_suggested_questions(contract_text)}


@app.post("/voice-ask")
async def ask_voice_question(data: dict = Body(...)):
    contract_text = data.get("contract_text", "")
    query         = data.get("query", "")
    if not contract_text or not query:
        return JSONResponse(status_code=400, content={"error": "Missing contract text or query"})
    return {"answer": analyze_voice_query(contract_text, query)}


@app.get("/")
def root():
    return {"status": "Legalyze backend running"}