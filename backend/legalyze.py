import PyPDF2
import google.generativeai as genai
import os
import json
import re

# Google Gemini setup
os.environ["GOOGLE_API_KEY"] = "AIzaSyA9VivDebCbh_DrzxkVwDYRnW16doU6iis"
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

# CHANGED: Using 1.5-flash for speed. It is much faster than Pro or experimental versions.
model = genai.GenerativeModel("gemini-2.5-pro") 

# ---------------- PDF Extraction ----------------
def extract_pdf_text_from_path(pdf_path):
    text = ""
    with open(pdf_path, 'rb') as f:
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

# ---------------- HELPER: CLEAN JSON ----------------
def clean_json_string(json_str):
    """Removes markdown code blocks if Gemini adds them"""
    if "```json" in json_str:
        json_str = json_str.split("```json")[1].split("```")[0]
    elif "```" in json_str:
        json_str = json_str.split("```")[1].split("```")[0]
    return json_str.strip()

# ---------------- LLM FUNCTIONS ----------------

def identify_parties(text):
    prompt = f"""
    Identify all parties in this contract.
    Return a simple numbered list. Do not use bullets, symbols, markdown, or headings.
    
    Contract:
    {text[:15000]}
    """
    response = model.generate_content(prompt)
    return getattr(response, "text", str(response))

def risk_analysis(text, perspective):
    prompt = f"""
    You are a senior legal contract risk assessor.
    Analyze the contract from the perspective of: "{perspective}".
    
    Output purely valid JSON. Do not add markdown formatting or introductory text.
    
    The JSON structure must be:
    {{
        "risk_score": <integer 0-100 representing overall safety for the selected party>,
        "favorability": {{
            "selected_party_score": <integer 0-100>,
            "counter_party_score": <integer 0-100 (should roughly sum to 100 with selected)>
        }},
        "high_risks": [
            {{
                "clause": "<The exact text of the risky clause or a summary of it>",
                "severity": "<High or Medium>",
                "risk_explanation": "<Why this is risky for {perspective}>",
                "suggested_change": "<Specific legal language or demand to make this favorable>"
            }}
        ],
        "safe_clauses": [
            "<List of safe or standard clauses>"
        ]
    }}

    Contract:
    {text[:15000]}
    """
    response = model.generate_content(prompt)
    raw_text = getattr(response, "text", str(response))
    return clean_json_string(raw_text)

def get_contract_synopsis(text, perspective):
    prompt = f"""
    Summarize the contract from the perspective of: "{perspective}".
    
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
    {text[:15000]}
    """
    response = model.generate_content(prompt)
    return getattr(response, "text", str(response))

def ask_chatbot(query, context_text):
    # OPTIMIZED PROMPT FOR SPEED
    prompt = f"""
    You are Legalyze AI, a legal assistant.
    Answer the user's question based on the Contract Context provided below.
    Keep the answer concise and helpful.

    Contract Context:
    {context_text[:25000]} 

    User Question:
    {query}
    """
    response = model.generate_content(prompt)
    return getattr(response, "text", str(response))