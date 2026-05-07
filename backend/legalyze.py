import PyPDF2
import google.generativeai as genai
import os
import json
import re
import random
import time
from groq import Groq
from dotenv import load_dotenv


load_dotenv()

# ================== API KEY POOL ==================
GEMINI_KEYS = [
    os.getenv("GEMINI_API_KEY_1"), # Key 1 - SHERIN
    os.getenv("GEMINI_API_KEY_2"),  # Key 2 - TANISHA
]

GROQ_KEYS = [
    os.getenv("GROQ_API_KEY_1"),   # T
    os.getenv("GROQ_API_KEY_2"),  # P
    os.getenv("GROQ_API_KEY_3"),# P
    os.getenv("GROQ_API_KEY_4"), # S
]

# ==========================================
#  GROQ-ONLY MANAGER
#  Used for: identify_parties, risk_analysis, get_contract_synopsis, ask_chatbot, generate_suggested_questions, analyze_voice_query
# ==========================================
class GroqOnlyManager:
    """Rotates through all Groq keys. Never touches Gemini."""
    def __init__(self, groq_keys):
        self.groq_keys = groq_keys
        self.index = 0

    def generate(self, prompt, system="You are a senior legal analyst."):
        for _ in range(len(self.groq_keys)):
            key = self.groq_keys[self.index]
            try:
                print(f"[GROQ] Attempting key index {self.index}")
                client = Groq(api_key=key)
                resp = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "system", "content": system},
                        {"role": "user",   "content": prompt},
                    ],
                )
                self.index = (self.index + 1) % len(self.groq_keys)

                class _R:
                    def __init__(self, t): self.text = t
                return _R(resp.choices[0].message.content)

            except Exception as e:
                print(f"[GROQ] Key {self.index} failed: {e}")
                self.index = (self.index + 1) % len(self.groq_keys)
                time.sleep(0.3)

        raise Exception("CRITICAL: All Groq keys exhausted.")


# ==========================================
#  GEMINI-ONLY MANAGER
#  Used EXCLUSIVELY for the 10 Advanced AI tools: timeline, voice, ambiguity, negotiation, certificate, executive, financial, escape, compliance, simulator
# ==========================================
class GeminiOnlyManager:
    """Rotates through Gemini keys only. Falls back to Groq if all Gemini fail."""

    def __init__(self, gemini_keys, groq_keys):
        self.gemini_keys = gemini_keys
        self.groq_keys   = groq_keys
        self.gemini_idx  = 0
        self.groq_idx    = 0

    def generate(self, prompt):
        # 1. Try Gemini pool
        for _ in range(len(self.gemini_keys)):
            key = self.gemini_keys[self.gemini_idx]
            try:
                print(f"[GEMINI-ADVANCED] Attempting key index {self.gemini_idx}")
                genai.configure(api_key=key)
                model = genai.GenerativeModel("gemini-2.5-flash")
                resp  = model.generate_content(prompt)
                self.gemini_idx = (self.gemini_idx + 1) % len(self.gemini_keys)
                return resp
            except Exception as e:
                print(f"[GEMINI-ADVANCED] Key {self.gemini_idx} failed: {e}")
                self.gemini_idx = (self.gemini_idx + 1) % len(self.gemini_keys)
                time.sleep(0.5)

        # 2. Gemini exhausted → fall back to Groq for this call only
        print("[GEMINI-ADVANCED] All Gemini keys exhausted — falling back to Groq for this call")
        for _ in range(len(self.groq_keys)):
            key = self.groq_keys[self.groq_idx]
            try:
                print(f"[GEMINI-ADVANCED→GROQ] Attempting key index {self.groq_idx}")
                client = Groq(api_key=key)
                resp = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "system", "content": "You are a senior legal analyst."},
                        {"role": "user",   "content": prompt},
                    ],
                )
                self.groq_idx = (self.groq_idx + 1) % len(self.groq_keys)

                class _R:
                    def __init__(self, t): self.text = t
                return _R(resp.choices[0].message.content)

            except Exception as e:
                print(f"[GEMINI-ADVANCED→GROQ] Key {self.groq_idx} failed: {e}")
                self.groq_idx = (self.groq_idx + 1) % len(self.groq_keys)
                time.sleep(0.3)

        raise Exception("CRITICAL: All Gemini AND Groq keys exhausted for advanced tools.")

groq_llm    = GroqOnlyManager(GROQ_KEYS)          # for base analysis
adv_llm     = GeminiOnlyManager(GEMINI_KEYS, GROQ_KEYS)  # for 10 advanced tools

# ── PDF Extraction ─────────────────────────────────────────────
def extract_pdf_text_from_path(pdf_path):
    text = ""
    with open(pdf_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    return text


def extract_pdf_text_from_bytes(bytes_io):
    bytes_io.seek(0)
    reader = PyPDF2.PdfReader(bytes_io)
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + "\n"
    return text

# ── JSON helper ────────────────────────────────────────────────
def clean_json_string(json_str):
    if "```json" in json_str:
        json_str = json_str.split("```json")[1].split("```")[0]
    elif "```" in json_str:
        json_str = json_str.split("```")[1].split("```")[0]
    return json_str.strip()

# ══════════════════════════════════════════════════════════════
#  BASE FUNCTIONS — all use groq_llm (Groq only)
# ══════════════════════════════════════════════════════════════

def identify_parties(text):
    """GROQ — used during initial contract upload."""
    prompt = f"""Identify all parties in this contract.
Return a simple numbered list. Do not use bullets, symbols, markdown, or headings.

Contract:
{text[:15000]}"""
    resp = groq_llm.generate(prompt)
    return getattr(resp, "text", str(resp))


def risk_analysis(text, perspective):
    """GROQ — used on the Analysis Result page."""
    prompt = f"""You are a senior legal contract risk assessor.
Analyze the contract from the perspective of: "{perspective}".

Output purely valid JSON. Do not add markdown formatting or introductory text.

The JSON structure must be:
{{
    "risk_score": <integer 0-100 representing overall safety for the selected party>,
    "favorability": {{
        "selected_party_score": <integer 0-100>,
        "counter_party_score": <integer 0-100>
    }},
    "high_risks": [
        {{
            "clause": "<exact text or summary of risky clause>",
            "severity": "<High or Medium>",
            "risk_explanation": "<Why this is risky for {perspective}>",
            "suggested_change": "<Specific legal language to make this favorable>"
        }}
    ],
    "safe_clauses": [
        "<List of safe or standard clauses>"
    ]
}}

Contract:
{text[:15000]}"""
    resp = groq_llm.generate(prompt)
    return clean_json_string(getattr(resp, "text", str(resp)))


def get_contract_synopsis(text, perspective):
    """GROQ — used on the Analysis Result page."""
    prompt = f"""Summarize the contract from the perspective of: "{perspective}".

Write clean plain text only.
Do not use markdown (#, ##, ###), no bullet points, and no list symbols such as -, *, •.

Structure the summary into clear paragraphs covering:
1. Parties involved
2. Obligations affecting the chosen party
3. Rights and penalties
4. Termination or exit clauses
5. Jurisdiction

Each section must be plain sentences separated by blank lines.

Contract:
{text[:15000]}"""
    resp = groq_llm.generate(prompt)
    return getattr(resp, "text", str(resp))


def ask_chatbot(query, context_text):
    """GROQ — chatbot on the Analysis Result page."""
    prompt = f"""You are Legalyze AI, a legal assistant.
Answer the user's question based on the Contract Context provided below.
Keep the answer concise and helpful.

Contract Context:
{context_text[:25000]}

User Question:
{query}"""
    resp = groq_llm.generate(prompt)
    return getattr(resp, "text", str(resp))


def generate_suggested_questions(text):
    """GROQ — voice suggestions popup."""
    prompt = f"""You are a legal assistant. Based on the contract text provided, generate exactly 3-4
highly relevant, short, and conversational questions a user might ask via voice.

Return ONLY a valid JSON list of strings.
Example: ["What is the termination notice period?", "Are there any late fees?", "Is there a non-compete?"]

Contract:
{text[:10000]}"""
    try:
        resp = groq_llm.generate(prompt)
        raw  = getattr(resp, "text", str(resp))
        return json.loads(clean_json_string(raw))
    except Exception as e:
        print(f"[suggest_questions] Error: {e}")
        return [
            "What are the termination conditions?",
            "What are the payment obligations?",
            "Are there any penalty clauses?",
        ]


def analyze_voice_query(text, query):
    """GROQ — voice assistant answers."""
    prompt = f"""You are Legalyze AI, a voice legal assistant.
The user has asked a question about their contract via voice.
Provide a concise, professional, and clear answer based ONLY on the contract text provided.
Avoid using complex markdown or long lists.

Contract Context:
{text[:15000]}

User Question: {query}"""
    try:
        resp = groq_llm.generate(prompt)
        return getattr(resp, "text", str(resp)).strip()
    except Exception as e:
        return f"I'm sorry, I couldn't process that request right now. Error: {str(e)}"


# ══════════════════════════════════════════════════════════════
#  TIMELINE HELPERS (regex + Gemini for AI extraction)
# ══════════════════════════════════════════════════════════════

def extract_timeline_events(contract_text):
    """Pure regex — no LLM."""
    date_patterns = [
        r"\b\d{1,2}\s(?:January|February|March|April|May|June|July|August|September|October|November|December)\s\d{4}\b",
        r"\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s\d{1,2},\s\d{4}\b",
        r"\b\d{1,2}/\d{1,2}/\d{2,4}\b",
        r"\b\d{4}-\d{2}-\d{2}\b",
        r"\bwithin\s\d+\s(days?|months?|years?)\b",
        r"\bafter\s\d+\s(days?|months?|years?)\b",
        r"\b\d+\s(days?|months?|years?)\safter\b",
        r"\bprior\sto\b",
    ]
    timeline  = []
    sentences = re.split(r"(?<=[.!?])\s+", contract_text)
    for sentence in sentences:
        for pattern in date_patterns:
            match = re.search(pattern, sentence)
            if match:
                timeline.append({"date": match.group(), "event": sentence.strip()})
    return timeline


def ai_timeline_extraction(text):
    """GEMINI (advanced tool) — AI extraction of timeline events."""
    prompt = f"""Extract ALL timeline related events from the contract.

Return JSON ONLY.

Format:
{{
 "events":[
  {{
   "date":"15 March 2026",
   "event":"Initial payment must be made",
   "desc":"Client must pay the first milestone invoice",
   "urgency":"urgent"
  }}
 ]
}}

Urgency rules:
urgent = payment deadlines / penalties
warning = notice periods / renewal
normal = obligations during term
safe = expiry or completion

Contract:
{text[:15000]}"""
    resp = adv_llm.generate(prompt)
    raw  = getattr(resp, "text", str(resp))
    try:
        return json.loads(clean_json_string(raw))
    except Exception:
        return {"events": []}


# ══════════════════════════════════════════════════════════════
#  10 ADVANCED AI TOOLS — all use adv_llm (Gemini → Groq fallback)
# ══════════════════════════════════════════════════════════════

def detect_ambiguities(text):
    """GEMINI — Advanced Tool 1: Ambiguity Detector."""
    prompt = f"""You are a senior legal counsel. Analyze the contract for vague language.

CRITICAL INSTRUCTION: Identify at least 3 ambiguities.
For each, you must extract the SPECIFIC vague word or short phrase (the "term") that causes the issue.

Return ONLY a JSON object:
{{
    "ambiguities": [
        {{
            "term": "The specific word/phrase (e.g., 'Promptly' or 'Three (7)')",
            "original_clause": "The full sentence containing the term",
            "explanation": "Why this is a legal risk",
            "suggested_rewrite": "A precise, objective version of the clause",
            "risk_level": "High"
        }}
    ]
}}

Contract Text:
{text[:15000]}"""
    resp = adv_llm.generate(prompt)
    raw  = getattr(resp, "text", str(resp))
    cleaned = clean_json_string(raw)
    try:
        parsed = json.loads(cleaned)
        if parsed.get("ambiguities"):
            for item in parsed["ambiguities"]:
                if not item.get("term"):
                    item["term"] = "Vague Language"
                if "risk_level" not in item:
                    item["risk_level"] = "Medium"
        else:
            parsed = {"ambiguities": [{"term": "None", "original_clause": "No significant ambiguities detected.",
                                        "explanation": "The contract appears legally specific.",
                                        "suggested_rewrite": "N/A", "risk_level": "Low"}]}
        return parsed
    except Exception as e:
        print(f"[detect_ambiguities] Parsing error: {e}")
        return {"ambiguities": []}


def negotiation_strategy(text, perspective):
    """GEMINI — Advanced Tool 2: Negotiation Coach."""
    prompt = f"""You are a world-class contract negotiator. Analyze this contract from the perspective of: "{perspective}".
Identify the top 3 most important clauses that "{perspective}" should negotiate before signing.

For each item provide:
1. Title: Short name of the clause.
2. Issue: Why the current version is bad for {perspective}.
3. Script: A polite, professional "Suggested Negotiation Line" to use in an email or meeting.
4. Impact: An integer (0-100) representing how much this change benefits {perspective}.
5. Impact Level: "high" (70-100) or "medium" (40-69).

Return ONLY a JSON object:
{{
    "negotiations": [
        {{
            "title": "Clause Name",
            "issue": "Explanation of risk",
            "script": "The exact wording to say",
            "impact": 85,
            "impactLevel": "high"
        }}
    ]
}}

Contract:
{text[:15000]}"""
    resp = adv_llm.generate(prompt)
    raw  = getattr(resp, "text", str(resp))
    try:
        return json.loads(clean_json_string(raw))
    except Exception:
        return {"negotiations": []}


def generate_certificate_analysis(contract_text, perspective):
    """GEMINI — Advanced Tool 3: Pre-Signing Risk Certificate."""
    prompt = f"""Analyze this contract from the perspective of {perspective}.
Return ONLY a JSON object with this exact structure:
{{
    "risk_score": <int 0-100>,
    "findings": [
        {{"title": "Clause Type", "status": "pass", "desc": "Finding details"}},
        {{"title": "Clause Type", "status": "caution", "desc": "Finding details"}}
    ]
}}
Note: Provide exactly 8 findings.

Contract Text: {contract_text[:10000]}"""
    resp = adv_llm.generate(prompt)
    raw  = getattr(resp, "text", str(resp))
    return json.loads(clean_json_string(raw))


def generate_executive_summary(text, perspective):
    """GEMINI — Advanced Tool 4: Executive Summary Generator."""
    prompt = f"""You are a senior legal analyst. Conduct a deep-dive analysis of the provided contract text
from the perspective of: "{perspective}".

CRITICAL: All values must be extracted directly from the contract. If a specific value
(like contract value) is not mentioned, return "Not Specified" or "N/A".

Return ONLY a valid JSON object with this EXACT structure:
{{
    "header": {{
        "principal_party": "Extract full legal name of the party we represent",
        "counterparty": "Extract full legal name of the opposing party",
        "effective_date": "Date the contract starts",
        "expiry_date": "Date the contract ends or 'Perpetual'",
        "contract_value": "Total financial value, retainer, or 'Variable'",
        "governing_law": "The state or country laws governing the contract",
        "dispute_resolution": "Arbitration, Litigation, or Mediation terms"
    }},
    "risk_assessment": {{
        "level": "Assign LOW, MODERATE, or HIGH based on the clauses",
        "score": <Calculate a 0-100 safety score as an integer>
    }},
    "key_obligations": [
        {{
            "party": "Which party is responsible",
            "obligation": "Clear description of the task",
            "priority": "HIGH, MEDIUM, or LOW"
        }}
    ],
    "financial_schedule": [
        {{
            "description": "What is the payment for",
            "amount": "The specific dollar amount or percentage",
            "due_date": "The deadline for payment",
            "clause": "The clause number where this is found",
            "status": "pending"
        }}
    ],
    "critical_deadlines": [
        {{
            "title": "What is the deadline for",
            "deadline": "The specific date or trigger event",
            "impact": "Consequence of missing this deadline",
            "severity": "CRITICAL or WARNING"
        }}
    ],
    "risk_flags": [
        {{
            "title": "Clause name (e.g., Indemnification)",
            "status": "PASS, CAUTION, or DANGER",
            "desc": "Short explanation of the specific risk found"
        }}
    ],
    "legal_advisory": "A professional one-paragraph summary of the overall legal health of this deal for the user."
}}

CONTRACT TEXT:
{text[:15000]}"""
    try:
        resp = adv_llm.generate(prompt)
        raw  = getattr(resp, "text", str(resp))
        return json.loads(clean_json_string(raw))
    except Exception as e:
        print(f"[executive_summary] Error: {e}")
        return {
            "header": {"principal_party": "Error processing contract"},
            "risk_assessment": {"level": "Unknown", "score": 0},
            "key_obligations": [], "financial_schedule": [],
            "critical_deadlines": [], "risk_flags": [],
            "legal_advisory": "Could not generate summary due to processing error.",
        }


def generate_financial_exposure(text, perspective):
    """GEMINI — Advanced Tool 5: Financial Exposure Calculator."""
    prompt = f"""You are a Senior Financial Risk Auditor. Analyze this contract from the perspective of: "{perspective}".

INSTRUCTIONS:
1. Identify the primary currency used in the contract (e.g., INR, USD, EUR, GBP).
2. Extract and calculate specific financial data points. If exact numbers aren't stated, provide professional estimates.
3. Ensure ALL "cost" and "amount" fields in the JSON include the identified currency symbol (e.g., "₹50,000" or "$1,000").

Return ONLY a valid JSON object with this EXACT structure:
{{
    "currency_symbol": "₹",
    "kpis": {{
        "total_contract_value": 450000,
        "worst_case_exposure": 1250000,
        "exposure_multiple": "2.8x"
    }},
    "penalty_triggers": [
        {{
            "trigger": "Late Payment",
            "cost": "₹2,500/day",
            "max_exposure": "₹75,000",
            "probability": "Medium"
        }}
    ],
    "hidden_costs": [
        {{
            "title": "Annual Escalation",
            "amount": "₹22,500/yr",
            "explanation": "5% assumed inflation adjustment."
        }}
    ],
    "breakdown": {{
        "base_contract": 450000,
        "potential_penalties": 420000,
        "hidden_costs": 87500,
        "legal_costs": 50000
    }},
    "financial_advisory": "Provide a professional summary of the financial health of this deal."
}}

CONTRACT:
{text[:15000]}"""
    try:
        resp = adv_llm.generate(prompt)
        raw  = getattr(resp, "text", str(resp))
        return json.loads(clean_json_string(raw))
    except Exception as e:
        print(f"[financial_exposure] Error: {e}")
        return {
            "error": "Failed to analyze finances",
            "currency_symbol": "$",
            "kpis": {"total_contract_value": 0, "worst_case_exposure": 0, "exposure_multiple": "0x"},
            "penalty_triggers": [], "hidden_costs": [], "breakdown": {},
        }


def generate_escape_routes(contract_text, perspective):
    """GEMINI — Advanced Tool 6: AI Escape Route Mapper."""
    prompt = f"""You are a world-class contract attorney specializing in exit strategy analysis.
Analyze the contract from the perspective of: "{perspective}".

Your task: Identify and map EVERY possible exit route, termination right, escape clause,
or contract-ending mechanism in the contract.

Look for:
- Termination for Convenience (unilateral exit without cause)
- Termination for Cause / Material Breach
- Force Majeure exit rights
- Mutual Termination by Agreement
- Cooling-off / Right of Rescission
- Insolvency / Bankruptcy termination
- Change of Control clauses
- Non-renewal / Expiry exits
- Any other contractually defined exit mechanism

Return ONLY a valid JSON object with this EXACT structure:
{{
    "flexibility": "HIGH" | "MODERATE" | "LOW",
    "exits": [
        {{
            "id": "exit_1",
            "name": "Termination for Convenience",
            "status": "OPEN",
            "clause_ref": "§ 12.1 — Unilateral Termination Without Cause",
            "timeline": "90–120 days",
            "notice": "90 days written notice",
            "cost": "$47,500",
            "plain_english": "You can walk away from this contract at any time...",
            "best_for": "Businesses wanting a clean exit",
            "requirements": ["Must be invoked before auto-renewal date"],
            "steps": ["Draft termination notice", "Send via certified mail"],
            "legal_tip": "Send notice via certified mail and keep a copy.",
            "risks": ["30% early-exit penalty applies regardless of reason"]
        }}
    ],
    "summary": {{
        "fastest": "Force Majeure (immediate if triggered)",
        "cheapest": "Termination for Cause ($0 if breach proven)",
        "recommended": "Mutual Termination — lowest risk"
    }}
}}

CRITICAL RULES:
- Do NOT hardcode. Extract ALL data directly from the contract text.
- Provide at least 3 exits and at most 7.
- All monetary values must include the contract's actual currency.

CONTRACT TEXT:
{contract_text[:15000]}"""
    try:
        resp   = adv_llm.generate(prompt)
        raw    = getattr(resp, "text", str(resp))
        parsed = json.loads(clean_json_string(raw))
        for i, exit_item in enumerate(parsed.get("exits", [])):
            exit_item.setdefault("id",           f"exit_{i+1}")
            exit_item.setdefault("status",       "OPEN")
            exit_item.setdefault("requirements", [])
            exit_item.setdefault("steps",        [])
            exit_item.setdefault("risks",        [])
            exit_item.setdefault("plain_english", exit_item.get("name", "No description."))
        return parsed
    except Exception as e:
        print(f"[escape_routes] Error: {e}")
        return {
            "flexibility": "UNKNOWN",
            "exits": [{"id": "exit_1", "name": "Unable to extract exit routes",
                        "status": "CLOSED", "clause_ref": "Parsing Error",
                        "timeline": "N/A", "notice": "N/A", "cost": "N/A",
                        "plain_english": "There was an error. Please try again.",
                        "best_for": "N/A", "requirements": [], "steps": [],
                        "legal_tip": "", "risks": []}],
            "summary": {"fastest": "N/A", "cheapest": "N/A",
                         "recommended": "Consult a legal professional"},
        }


def generate_contract_timeline(contract_text):
    """GEMINI (AI part) + regex — Advanced Tool 7: Timeline Generator."""
    regex_events = extract_timeline_events(contract_text)
    ai_events    = ai_timeline_extraction(contract_text)   # uses adv_llm
    combined     = regex_events + ai_events.get("events", [])

    seen    = set()
    cleaned = []
    for event in combined:
        key = (event.get("date", ""), event.get("event", ""))
        if key in seen:
            continue
        seen.add(key)
        sentence = event.get("event", "")
        lower    = sentence.lower()
        urgency  = "normal"
        if any(k in lower for k in ["immediate", "breach", "penalty", "termination"]):
            urgency = "urgent"
        elif any(k in lower for k in ["prior", "notice", "deadline"]):
            urgency = "warning"
        elif any(k in lower for k in ["expire", "end", "completion"]):
            urgency = "safe"
        cleaned.append({
            "date":    event.get("date", ""),
            "event":   sentence.split(".")[0][:90],
            "desc":    sentence,
            "urgency": urgency,
        })

    import datetime
    def parse_date(ds):
        try:
            return datetime.datetime.strptime(ds, "%d %B %Y")
        except Exception:
            return datetime.datetime.max

    cleaned.sort(key=lambda x: parse_date(x["date"]))
    return cleaned

def generate_compliance_check(contract_text):
    """
    GEMINI — AI Compliance Checker.
    Checks the contract against major regulatory frameworks:
    GDPR, Labor Law, Financial Regulation, IP/NDA, Consumer Protection.
    Returns grouped results per framework with individual rule findings.
    """
 
    prompt = f"""You are a senior legal compliance auditor. Analyze this contract against major 
regulatory frameworks.
 
For each framework below, check the contract for compliance with its key requirements.
Be specific — reference actual contract language when you find it.
 
Frameworks to audit:
1. GDPR (Data Privacy)
2. Labor Law (Employment)  
3. Financial Regulation (Payments & Penalties)
4. IP & Confidentiality
5. Consumer Protection
 
Return ONLY a valid JSON object with this EXACT structure:
{{
    "frameworks": [
        {{
            "name": "GDPR",
            "score": 65,
            "status": "Partial",
            "rules": [
                {{
                    "title": "Data Processing",
                    "status": "fail",
                    "description": "No Data Processing Agreement (DPA) attached. Required under GDPR Article 28 for any contract involving EU personal data."
                }},
                {{
                    "title": "Data Retention",
                    "status": "fail",
                    "description": "No data retention period specified. GDPR requires clear retention limits and deletion procedures."
                }},
                {{
                    "title": "Right to Erasure",
                    "status": "pass",
                    "description": "Contract includes provisions for data deletion upon request."
                }},
                {{
                    "title": "Data Transfer",
                    "status": "warning",
                    "description": "International data transfer mechanisms not explicitly addressed. Required if data crosses EU borders."
                }}
            ]
        }},
        {{
            "name": "Labor Law",
            "score": 88,
            "status": "Compliant",
            "rules": [
                {{
                    "title": "Working Hours",
                    "status": "pass",
                    "description": "Working hours comply with statutory limits."
                }},
                {{
                    "title": "Termination Notice",
                    "status": "pass",
                    "description": "Notice periods meet minimum statutory requirements."
                }},
                {{
                    "title": "Non-Compete",
                    "status": "warning",
                    "description": "Non-compete duration of 24 months may exceed enforceable limits in several jurisdictions."
                }},
                {{
                    "title": "Payment Terms",
                    "status": "pass",
                    "description": "Payment schedules comply with prompt payment regulations."
                }}
            ]
        }},
        {{
            "name": "Financial Regulation",
            "score": 72,
            "status": "Partial",
            "rules": [
                {{
                    "title": "Late Payment Interest",
                    "status": "warning",
                    "description": "Interest rate on late payments not explicitly capped to statutory maximum."
                }},
                {{
                    "title": "Invoice Requirements",
                    "status": "pass",
                    "description": "Invoice terms and payment timelines are clearly specified."
                }},
                {{
                    "title": "Penalty Clauses",
                    "status": "fail",
                    "description": "Penalty clauses may exceed statutory limits and could be unenforceable."
                }}
            ]
        }},
        {{
            "name": "IP & Confidentiality",
            "score": 90,
            "status": "Compliant",
            "rules": [
                {{
                    "title": "IP Ownership",
                    "status": "pass",
                    "description": "Intellectual property ownership is clearly defined."
                }},
                {{
                    "title": "Confidentiality Scope",
                    "status": "pass",
                    "description": "Confidentiality obligations are clearly scoped and time-bound."
                }},
                {{
                    "title": "Trade Secret Protection",
                    "status": "warning",
                    "description": "Trade secret protections present but may benefit from more specific definition."
                }}
            ]
        }}
    ]
}}
 
STATUS RULES:
- score 85-100 → status: "Compliant"
- score 60-84  → status: "Partial"
- score below 60 → status: "Non-Compliant"
 
Rule status options:
- "pass"    → requirement is satisfied
- "fail"    → requirement is missing or violated  
- "warning" → requirement is partially met or ambiguous
 
CRITICAL: Base findings on what is actually in the contract. Do not invent clauses.
If a topic is not mentioned in the contract, mark it as "fail" with explanation.
Provide exactly 3–5 rules per framework.
 
CONTRACT TEXT:
{contract_text[:15000]}"""
 
    try:
        resp   = adv_llm.generate(prompt)
        raw    = getattr(resp, "text", str(resp))
        parsed = json.loads(clean_json_string(raw))
 
        # Validate/normalize
        for fw in parsed.get("frameworks", []):
            fw.setdefault("score", 50)
            fw.setdefault("status", "Partial")
            fw.setdefault("rules", [])
            for rule in fw["rules"]:
                rule.setdefault("status", "warning")
                rule.setdefault("title", "Unknown")
                rule.setdefault("description", "")
                # Normalize status values
                s = rule["status"].lower()
                if s in ("compliant", "pass", "ok", "yes"):
                    rule["status"] = "pass"
                elif s in ("fail", "non-compliant", "missing", "no"):
                    rule["status"] = "fail"
                else:
                    rule["status"] = "warning"
 
        return parsed
 
    except Exception as e:
        print(f"[compliance_check] Error: {e}")
        return {
            "frameworks": [
                {
                    "name": "Analysis Error",
                    "score": 0,
                    "status": "Non-Compliant",
                    "rules": [
                        {
                            "title": "Processing Error",
                            "status": "fail",
                            "description": f"Could not analyze compliance: {str(e)}. Please try again."
                        }
                    ]
                }
            ]
        }
    
def generate_scenario_simulations(contract_text, perspective):
    """
    GEMINI — Advanced Tool 10: What-If Scenario Simulator.
    Extracts real scenarios from the contract and simulates decision trees,
    escalation timelines, financial impact, and recommended actions.
    """
    prompt = f"""You are a senior contract risk analyst. Analyze this contract from the
perspective of: "{perspective}".
 
Your task: Identify the 4 most important real-world "What-If" scenarios that could
occur under this specific contract. For each, simulate the full decision tree and
escalation pathway based ONLY on what is written in the contract.
 
Scenarios to look for (pick the most relevant 4 based on the contract content):
- Missing a payment deadline
- Wanting to exit/leave the contract early
- The other party failing to deliver
- A data breach or IP violation
- Force majeure / natural disaster
- IP infringement or confidentiality breach
- Change of control / company acquisition
 
Return ONLY a valid JSON object:
{{
    "scenarios": [
        {{
            "id": "payment_miss",
            "title": "What if I miss a payment deadline?",
            "severity": "HIGH",
            "controllability": "Medium-High",
            "risk_score": 78,
            "max_exposure": "$75,000+",
            "clauses": ["§4.2 Payment Terms", "§7.1 Default & Remedies", "§9.3 Indemnification"],
            "decision_paths": [
                {{
                    "question": "Can you pay within 15 days?",
                    "yes_outcome": "No penalty — resolve immediately",
                    "no_outcome": "Late fees begin at $2,500/day"
                }},
                {{
                    "question": "Can you cure within 30 days?",
                    "yes_outcome": "Pay fees + late charges to resolve",
                    "no_outcome": "Default notice → termination risk"
                }}
            ],
            "escalation_timeline": [
                {{
                    "day_range": "Day 1-15",
                    "severity": "SAFE",
                    "title": "Grace period (informal)",
                    "description": "No contractual penalty yet, but counterparty may send a reminder notice."
                }},
                {{
                    "day_range": "Day 16",
                    "severity": "WARNING",
                    "title": "Late fee triggers",
                    "description": "Penalty of $2,500/day begins accruing. Maximum exposure: $75,000."
                }},
                {{
                    "day_range": "Day 30",
                    "severity": "DANGER",
                    "title": "Default notice",
                    "description": "Counterparty may issue formal default notice. 15-day cure period begins."
                }},
                {{
                    "day_range": "Day 45",
                    "severity": "CRITICAL",
                    "title": "Material breach",
                    "description": "If unpaid, constitutes material breach. Counterparty can terminate and seek damages."
                }},
                {{
                    "day_range": "Day 60+",
                    "severity": "CRITICAL",
                    "title": "Legal action",
                    "description": "Counterparty may pursue arbitration. You're liable for their legal costs under the indemnification clause."
                }}
            ],
            "bottom_line": "Missing payment by more than 30 days can cascade into contract termination and uncapped legal costs. Set up auto-payment reminders.",
            "recommended_action": "Set calendar alerts for payment deadlines. Negotiate a formal 30-day grace period before signing."
        }}
    ]
}}
 
CRITICAL RULES:
- Base EVERY data point on actual contract clauses. Do NOT make up clause numbers.
- If a clause number is not in the contract, use a descriptive name like "Payment Terms clause".
- max_exposure must include actual currency from the contract.
- risk_score: 75-100 = HIGH/CRITICAL, 50-74 = MEDIUM, below 50 = LOW.
- severity options: CRITICAL, HIGH, MEDIUM, LOW.
- escalation_timeline severity options: SAFE, WARNING, DANGER, CRITICAL.
- controllability: describe how much control "{perspective}" has (e.g. "Controllable", "Medium-High", "Low but catastrophic").
- Generate exactly 4 scenarios.
 
CONTRACT TEXT:
{contract_text[:15000]}"""
 
    try:
        resp   = adv_llm.generate(prompt)
        raw    = getattr(resp, "text", str(resp))
        parsed = json.loads(clean_json_string(raw))
 
        # Validation / defaults
        for sc in parsed.get("scenarios", []):
            sc.setdefault("id", "scenario")
            sc.setdefault("severity", "MEDIUM")
            sc.setdefault("controllability", "Controllable")
            sc.setdefault("risk_score", 50)
            sc.setdefault("max_exposure", "Variable")
            sc.setdefault("clauses", [])
            sc.setdefault("decision_paths", [])
            sc.setdefault("escalation_timeline", [])
            sc.setdefault("bottom_line", "")
            sc.setdefault("recommended_action", "")
 
        return parsed
 
    except Exception as e:
        print(f"[scenario_simulator] Error: {e}")
        return {
            "scenarios": [
                {
                    "id": "error",
                    "title": "Unable to simulate scenarios",
                    "severity": "MEDIUM",
                    "controllability": "Unknown",
                    "risk_score": 0,
                    "max_exposure": "N/A",
                    "clauses": [],
                    "decision_paths": [],
                    "escalation_timeline": [],
                    "bottom_line": "There was an error analyzing the contract. Please try again.",
                    "recommended_action": "Consult a legal professional.",
                }
            ]
        }
 
