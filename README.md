# 🏥 HealthSync AI — AI-Powered Healthcare Assistant

> A fullstack AI-powered web application that helps the general public access health information quickly and reliably — powered by **Google Gemini 2.5 Flash**.

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Important Notes](#important-notes)

---

## About the Project

**HealthSync AI** is a fullstack capstone project that integrates Google Gemini AI to provide health education across 6 domains: symptom analysis, medication information, multi-turn health chatbot, preventive care, medical terminology, and mental wellness support.

The application features an **automatic emergency detection system** — when a user enters critical symptoms (e.g., chest pain, severe shortness of breath), a full-screen red overlay immediately appears with direct emergency contact buttons for **119 (Ambulance)** and **118 (PMI)**.

> ⚠️ **Medical Disclaimer:** HealthSync AI is for **educational purposes only** and is NOT a substitute for professional medical consultation. Always consult a qualified doctor for medical advice.

---

## Key Features

| # | Feature | Description |
|---|---|---|
| 1 | 🏠 **Dashboard** | Dynamic time-based greeting and AI-generated Daily Wellness Tips loaded automatically each session |
| 2 | 🩺 **Symptom Checker** | AI symptom analysis with urgency badge (Low/Medium/High/Emergency) and automatic emergency detection overlay |
| 3 | 💊 **Medication Info** | Catalog of 20 drugs × 5 categories × 4 dedicated query types (General Info, Dosage, Side Effects, Interactions) |
| 4 | 💬 **Health Chatbot** | Multi-turn conversational AI with persistent conversation history stored in SQLite database |
| 5 | 🛡️ **Preventive Care** | Personalized prevention tips, routine health screening schedules, and daily tips by category |
| 6 | 🧠 **Mental Wellness** | Mood tracking, 8 mental health topics, 4-7-8 breathing exercise timer, and always-visible crisis hotlines |

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11 / 3.12 | Runtime |
| FastAPI | 0.136.1 | Web framework & REST API |
| Uvicorn | 0.46.0 | ASGI server |
| SQLAlchemy | 2.0.49 | Database ORM |
| SQLite | Built-in | Consultation history database |
| Pydantic | 2.13.4 | Request/response schema validation |
| pydantic-settings | 2.14.0 | Environment variable management |
| google-genai | 2.0.0 | Official Google Gemini AI SDK |
| python-dotenv | 1.2.2 | Reading `.env` file |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.5 | UI library |
| Vite | 8.0.10 | Build tool & dev server |
| Tailwind CSS | 4.2.4 | Utility-first CSS framework |
| react-markdown | 9.0.1 | Render AI Markdown responses as HTML |

### AI
| Component | Detail |
|---|---|
| Provider | Google AI (Gemini) |
| Model | `gemini-2.5-flash` |
| SDK | `google-genai` v2.0.0 |
| Temperature | `0.3` — consistent, factual responses |
| Max Output Tokens | `8192` |
| Async Strategy | `asyncio.to_thread()` — non-blocking |

---

## Project Structure

```
HEALTHCARE-ASSISTANT/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS config, router registration
│   │   ├── config.py            # App settings via pydantic-settings (.env)
│   │   ├── database.py          # SQLAlchemy engine, models, session factory
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic request/response schemas
│   │   ├── routers/
│   │   │   ├── symptom.py       # /api/v1/symptom
│   │   │   ├── medication.py    # /api/v1/medication
│   │   │   ├── chatbot.py       # /api/v1/chatbot
│   │   │   ├── preventive.py    # /api/v1/preventive
│   │   │   ├── terminology.py   # /api/v1/terminology
│   │   │   └── history.py       # /api/v1/history
│   │   └── services/
│   │       └── gemini_service.py  # Gemini client + 7 system prompts + emergency logic
│   ├── healthcare.db            # SQLite database (auto-created on startup)
│   ├── requirements.txt
│   ├── run.py                   # Entry point: uvicorn on port 8000
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx              # Root: SPA routing state + health check on load
    │   ├── main.jsx
    │   ├── components/
    │   │   └── UI.jsx           # Shared: Navbar, ToastProvider, Skeleton
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── SymptomChecker.jsx
    │   │   ├── MedicationInfo.jsx
    │   │   ├── HealthChatbot.jsx
    │   │   ├── PreventiveCare.jsx
    │   │   └── MentalWellness.jsx
    │   └── services/
    │       └── api.js           # All fetch() calls to backend (BASE_URL: localhost:8000)
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Prerequisites

Make sure the following are installed before proceeding:

- **Python** 3.11 or 3.12
- **Node.js** 18+ and **npm**
- **Google Gemini API Key** — get one for free at [aistudio.google.com](https://aistudio.google.com/app/apikey)

---

## Installation & Setup

### 1. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file inside the `backend/` folder:

```bash
# backend/.env

# === GOOGLE GEMINI AI ===
GEMINI_API_KEY=your_gemini_api_key_here    # Required — from aistudio.google.com
GEMINI_MODEL=gemini-2.5-flash
MAX_TOKENS=8192

# === APPLICATION ===
APP_NAME=AI-Powered Healthcare Assistant
APP_VERSION=2.0.0
DEBUG=False

# === DATABASE ===
DATABASE_URL=sqlite:///./healthcare.db
```

> ⚠️ **Never commit your `.env` file to a public repository.** Add it to `.gitignore`.

### 3. Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install
```

---

## Running the Application

### Start Backend

```bash
cd backend

# Make sure virtual environment is active, then:
python run.py
```

Backend runs at: **http://127.0.0.1:8000**

The `healthcare.db` SQLite database is created automatically on first startup.

### Start Frontend

Open a new terminal:

```bash
cd frontend

npm run dev
```

Frontend runs at: **http://localhost:5173**

### Verify Everything is Working

1. Open **http://localhost:5173** in your browser
2. The **● API Online** indicator should appear in the top-right navbar
3. Health check endpoint: **http://127.0.0.1:8000/health** → `{"status": "healthy"}`
4. Interactive API docs: **http://127.0.0.1:8000/docs** (Swagger UI)

---

## API Documentation

Base URL: `http://localhost:8000/api/v1`

### Symptom Checker
| Method | Endpoint | Description |
|---|---|---|
| POST | `/symptom/check` | Symptom analysis with automatic emergency detection |
| POST | `/symptom/followup` | Follow-up question within the same session |

### Medication Information
| Method | Endpoint | Description |
|---|---|---|
| POST | `/medication/info` | Drug info — `query_type`: `general` / `dosage` / `side_effects` / `interaction` |
| GET | `/medication/search/{name}` | Quick drug summary by name |

**Medication query types — each uses a dedicated AI system prompt:**
- `general` → Drug description, uses, and mechanism of action
- `dosage` → Adult/child/elderly doses, max dose, missed dose guide
- `side_effects` → Common/serious effects, allergic reactions, special group warnings
- `interaction` → Risk level (Low/Medium/High), mechanism, food interactions

### Health Chatbot
| Method | Endpoint | Description |
|---|---|---|
| POST | `/chatbot/chat` | Multi-turn chat with conversation history |
| GET | `/chatbot/topics` | List of 10 available health topics |
| POST | `/chatbot/topic/{topic_id}` | Start conversation on a specific topic |

### Preventive Care
| Method | Endpoint | Description |
|---|---|---|
| POST | `/preventive/suggest` | Personalized preventive suggestions |
| GET | `/preventive/screening-schedule` | Routine health screening schedule by age |
| GET | `/preventive/health-tips/daily` | Daily health tips by category |

### Medical Terminology
| Method | Endpoint | Description |
|---|---|---|
| POST | `/terminology/explain` | Explain a medical term |
| POST | `/terminology/explain-report` | Explain a medical report or lab result |
| GET | `/terminology/common-terms` | Common medical terms by category |

### Consultation History
| Method | Endpoint | Description |
|---|---|---|
| GET | `/history/session/{session_id}` | Consultation history by session |
| GET | `/history/user/{user_id}` | Consultation history by user |
| DELETE | `/history/session/{session_id}` | Delete a session history |
| GET | `/history/stats/summary` | Overall usage statistics |
| POST | `/history/profile` | Create or update user profile |
| GET | `/history/profile/{user_id}` | Get user profile |

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | **Yes** | — | API Key from [Google AI Studio](https://aistudio.google.com) |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Gemini model name |
| `MAX_TOKENS` | No | `8192` | Maximum output tokens per response |
| `APP_NAME` | No | `AI-Powered Healthcare Assistant` | Application name |
| `APP_VERSION` | No | `2.0.0` | Application version |
| `DEBUG` | No | `False` | FastAPI debug mode |
| `DATABASE_URL` | No | `sqlite:///./healthcare.db` | Database connection URL |

---

## Important Notes

### 🚨 Emergency Numbers
- **119** — National Ambulance
- **118** — Indonesian Red Cross (PMI)
- **119 ext 8** — Kemenkes RI Mental Health Hotline
- **021-500-454** — Into The Light Indonesia (mental health crisis)

### 🔒 Security
- Never commit `.env` to a public repository
- Keep your `GEMINI_API_KEY` private
- `healthcare.db` contains user consultation history — handle with care

### ⚠️ Known Limitations
- API response time depends on Gemini API latency (average 2–5 seconds)
- Emergency detection is keyword-based — unusual phrasing may not trigger the overlay
- SQLite is not suitable for production-scale concurrent access
- Frontend `BASE_URL` is hardcoded to `http://localhost:8000` — update for deployment
- Mental Wellness system prompt is sent from the frontend — consider moving server-side for production

---

## Developer

**Muhammad Azrul Ihwan**
📧 muhammadazrulihwan@students.amikom.ac.id
🎓 Google Gemini AI Developer by Lastmile Indonesia
🏛️ Universitas Amikom Yogyakarta

---

*Built with ❤️ using FastAPI + React + Google Gemini AI*
