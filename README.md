# **Legalyze – AI Contract Analysis Platform**

Legalyze is an AI-powered platform that helps users upload, analyze, edit, and understand legal contracts using advanced AI assistance.
<img width="1439" height="778" alt="Screenshot 2025-11-25 at 5 46 03 PM" src="https://github.com/user-attachments/assets/214d1192-c82b-46f1-97cd-847fc2d53dcb" />

---

## 🚀 Features

- **PDF Upload** – Drag & drop contracts for instant analysis
<img width="1439" height="778" alt="Screenshot 2025-11-25 at 5 46 57 PM" src="https://github.com/user-attachments/assets/8c820acb-4a7f-4014-8960-66147e76e45e" />
- **AI Risk Analysis** – Highlights High / Medium / Low risks with severity scores
 <img width="1439" height="778" alt="Screenshot 2025-11-25 at 5 47 41 PM" src="https://github.com/user-attachments/assets/d3618b03-6640-45fb-ac76-6529c7bfa984" />
- **AI Chat Assistant** – Ask contract-specific legal questions
 <img width="578" height="722" alt="Screenshot 2025-11-25 at 5 48 32 PM" src="https://github.com/user-attachments/assets/d3424d1f-761b-40b8-86dd-88648fc7f111" />
- **Interactive Dashboard** – Risk charts & party-favorability insights
 <img width="578" height="499" alt="Screenshot 2025-11-25 at 5 50 40 PM" src="https://github.com/user-attachments/assets/c4f75ce4-dc33-4eb0-8d61-b64493a486a6" />
- **Smart Editor** – Edit clauses, rewrite text with AI & download .docx
 <img width="578" height="722" alt="Screenshot 2025-11-25 at 5 52 23 PM" src="https://github.com/user-attachments/assets/3beced26-551a-44ac-a655-4c525bf6ea04" />
- **Blank Document Mode** – Create new legal documents from scratch  
- **History Management** – Store past analyses & edits (via Spring Boot + MongoDB)

---

## 🛠️ Tech Stack

### **Frontend**
- React.js  
- React Router DOM  
- CSS3  

### **Backend**
- **FastAPI (Python)** – AI analysis, PDF parsing, DOCX generation  
- **Spring Boot (Java)** – Authentication, user history, MongoDB  
- **Google Gemini 2.5 Pro** – AI model  
- PyPDF2, python-docx, python-multipart  

### **Database**
- MongoDB Atlas / Local MongoDB

---

## ⚙️ Setup Instructions

### **1. Clone Repository**
```bash
git clone https://github.com/tanishasrivastava/Legalyze.git
cd Legalyze
