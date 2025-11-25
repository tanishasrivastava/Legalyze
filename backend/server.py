from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
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
)

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
            line_clean = re.sub(r'^\s*\d+[\.\)]\s*', '', line)
            line_clean = re.sub(r'^\s*[-•]\s*', '', line_clean)
            parties.append(line_clean)

        session_id = str(uuid.uuid4())
        SESSIONS[session_id] = {
            "text": text,
            "parties": parties,
        }

        return {"session_id": session_id, "parties": parties, "text": text}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e), "trace": traceback.format_exc()})

@app.post("/analyze/{session_id}/finalize")
async def finalize(session_id: str, perspective: str = Form(...)):
    try:
        sess = SESSIONS.get(session_id)
        if not sess:
            return JSONResponse(status_code=404, content={"error": "session_id not found"})

        text = sess["text"]

        synopsis = get_contract_synopsis(text, perspective)
        
        # risk_analysis now returns a JSON string
        risk_json_str = risk_analysis(text, perspective)
        
        # Parse it safely
        try:
            risk_data = json.loads(risk_json_str)
        except json.JSONDecodeError:
            risk_data = {
                "risk_score": 50,
                "favorability": {"selected_party_score": 50, "counter_party_score": 50},
                "high_risks": [{"clause": "Error parsing AI response", "severity": "High", "risk_explanation": risk_json_str, "suggested_change": "N/A"}],
                "safe_clauses": []
            }

        SESSIONS[session_id].update({
            "perspective": perspective, 
            "synopsis": synopsis, 
            "risk_report": risk_data
        })

        # Return full_text for the editor
        return {"synopsis": synopsis, "risk_report": risk_data, "full_text": text}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e), "trace": traceback.format_exc()})

@app.post("/analyze/{session_id}/ask")
async def ask(session_id: str, query: str = Form(...)):
    try:
        sess = SESSIONS.get(session_id)
        if not sess:
            return JSONResponse(status_code=404, content={"error": "session_id not found"})
        text = sess["text"]
        answer = ask_chatbot(query, text)
        return {"answer": answer}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e), "trace": traceback.format_exc()})

@app.post("/download-docx")
async def download_docx(content: str = Form(...), filename: str = Form("edited_contract.docx")):
    try:
        document = Document()
        for line in content.split('\n'):
            document.add_paragraph(line)
        
        filepath = os.path.join(TEMP_DIR, filename)
        document.save(filepath)
        
        return FileResponse(path=filepath, filename=filename, media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/")
def root():
    return {"status": "Legalyze backend running"}