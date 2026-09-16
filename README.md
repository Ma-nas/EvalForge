# 🔥 EvalForge — LLM Evaluation Matrix

### Production-Grade LLM Evaluation, Multi-Model Benchmarking & Hallucination Detection Platform

```
  ███████╗██╗   ██╗ █████╗ ██╗     ███████╗ ██████╗ ██████╗  ██████╗ ███████╗
  ██╔════╝██║   ██║██╔══██╗██║     ██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝
  █████╗  ██║   ██║███████║██║     █████╗  ██║   ██║██████╔╝██║  ███╗█████╗  
  ██╔══╝  ╚██╗ ██╔╝██╔══██║██║     ██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝  
  ███████╗ ╚████╔╝ ██║  ██║███████╗██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗
  ╚══════╝  ╚═══╝  ╚═╝  ╚═╝╚══════╝╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝
                     RATE. ANALYZE. DOMINATE.
```

![Python](https://img.shields.io/badge/Python-3.11+-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-violet?style=for-the-badge&logo=tailwindcss)
![Pytest](https://img.shields.io/badge/Pytest-100%25_Passing-emerald?style=for-the-badge&logo=pytest)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

---

## 🎯 Overview

**EvalForge** is an industry-grade, developer-first platform built to benchmark, evaluate, and audit Large Language Model (LLM) outputs with military-precision scoring. Styled with a tactical GTA-menu aesthetic, it combines rigorous NLP metrics with real-time HUD visualizations:

- 🎯 **Detect Hallucinations** — Breaks text into atomic claims, cross-examining against reference ground-truth with semantic embeddings (`all-MiniLM-L6-v2`).
- 📊 **Measure Semantic Accuracy** — Computes composite similarity, prompt relevance, and groundedness ratings across models.
- 🔗 **Audit RAG Pipelines** — Measures retrieval precision, context relevance, sentence-level faithfulness, and answer relevance.
- ⚡ **Multi-Model Warzones** — Head-to-head benchmarking comparing accuracy, latency (ms), and cost estimates ($/1K tokens) across Gemini, GPT-4o, and GPT-3.5.
- 💾 **Armored Data Management** — Ingest CSV and JSON benchmark corpora, with instant batch evaluation directly from datasets.
- 📤 **Enterprise Reporting** — 1-click CSV & JSON telemetry export for CI/CD evaluation gates and performance audits.

---

## 🎮 Visual Style & HUD Matrix

The frontend pairs high-octane GTA loading screen typography (`Bebas Neue`, `Chakra Petch`, `JetBrains Mono`) with tactical game HUD elements:

```
+-------------------------------------------------------------------------+
| [01] EVALUATION MATRIX                                                  |
| RATE. ANALYZE. DOMINATE.                                                |
| PROJECTS | EVALUATIONS | ANALYTICS | LEADERBOARD                        |
+-------------------------------------------------------------------------+
| PROJECT #042: AI RESUME ANALYZER                                        |
| OVERALL SCORE: 92 / 100  [RANK: A+]                                     |
|                                                                         |
| UI/UX          █████████░ 94                                            |
| FUNCTIONALITY  ██████████ 98                                            |
| PERFORMANCE    ████████░░ 87                                            |
| CODE QUALITY   █████████░ 91                                            |
|                                                                         |
| [ START EVALUATION -> ]                 [ EXPORT CSV ]                  |
+-------------------------------------------------------------------------+
```

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│             React 19 + TypeScript + Vite               │
│      GTA HUD Dashboard • Block Meters • Recharts       │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (JSON / Bearer JWT)
┌───────────────────────────▼────────────────────────────┐
│                  FastAPI Backend 0.115                 │
│      SlowAPI Rate Limiter • BCrypt Auth • CORS         │
└──────┬────────────────────┬────────────────────┬───────┘
       │                    │                    │
┌──────▼──────┐      ┌──────▼──────┐      ┌──────▼───────┐
│ Evaluation  │      │ Hallucin.   │      │ Multi-Model  │
│  Engine     │      │   Radar     │      │   Warzone    │
└──────┬──────┘      └──────┬──────┘      └──────┬───────┘
       │                    │                    │
       ├────────────────────┴────────────────────┤
       │   Embeddings: all-MiniLM-L6-v2 (Torch) │
       │   APIs: Google Gemini & OpenAI GPT      │
       └────────────────────┬────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│            SQLite / PostgreSQL (SQLAlchemy)            │
│  evaluations • benchmarks • hallucinations • datasets   │
└────────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Start

### Option 1: Docker Compose (Recommended)

Spin up both the FastAPI backend and React frontend with a single command:

```bash
# Clone the repository
git clone https://github.com/Ma-nas/EvalForge.git
cd EvalForge

# Launch the entire stack
docker-compose up --build
```
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs

---

### Option 2: Local Development

#### 1. Backend Setup

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # macOS / Linux

# Install dependencies
pip install -r requirements.txt
pip install pytest pytest-asyncio

# Configure environment variables
copy .env.example .env

# Run server
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```

---

## 🧪 Automated Test Suite

EvalForge includes a 100% passing automated test suite covering all authentication, evaluation, hallucination, RAG, and dataset endpoints:

```bash
cd backend
pytest tests/ -v
```

```
tests/test_auth.py::test_register_and_login_flow PASSED           [12%]
tests/test_datasets.py::test_dataset_seed_and_batch_evaluate PASSED [25%]
tests/test_datasets.py::test_export_endpoints PASSED              [37%]
tests/test_evaluation.py::test_evaluate_single PASSED             [50%]
tests/test_evaluation.py::test_evaluate_batch PASSED              [62%]
tests/test_hallucination.py::test_detect_hallucination_factual PASSED [75%]
tests/test_hallucination.py::test_detect_hallucination_fabricated PASSED [87%]
tests/test_rag.py::test_rag_evaluation PASSED                     [100%]

======================= 8 passed in 21.40s =======================
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Register new operator with hashed credentials |
| `POST` | `/api/v1/auth/login` | Authenticate & retrieve Bearer JWT |
| `GET`  | `/api/v1/auth/me` | Fetch active operator identity |
| `GET`  | `/api/v1/dashboard/summary` | Real-time aggregate telemetry & weekly trends |
| `POST` | `/api/v1/evaluation/evaluate` | Single LLM semantic & quality evaluation |
| `POST` | `/api/v1/evaluation/evaluate/batch` | Batch evaluation across sample sets |
| `POST` | `/api/v1/hallucination/detect` | Deconstruct claims & audit context support |
| `GET`  | `/api/v1/hallucination/history` | Audit log of previous hallucination scans |
| `POST` | `/api/v1/benchmark/run` | Multi-model shootout (accuracy, latency, cost) |
| `POST` | `/api/v1/benchmark/run/batch` | Batch benchmarking across multiple models |
| `POST` | `/api/v1/rag/evaluate` | Audit RAG pipeline precision & faithfulness |
| `GET`  | `/api/v1/rag/history` | Audit log of previous RAG pipeline runs |
| `POST` | `/api/v1/datasets/upload` | Upload `.csv` or `.json` evaluation dataset |
| `POST` | `/api/v1/datasets/seed` | Auto-seed SQuAD and TruthfulQA test corpora |
| `GET`  | `/api/v1/datasets/{id}/data` | Tabular preview of dataset rows |
| `POST` | `/api/v1/datasets/{id}/evaluate`| Execute batch evaluation directly from dataset |
| `GET`  | `/api/v1/export/evaluations` | Export evaluation records (`?format=csv\|json`) |
| `GET`  | `/api/v1/export/benchmarks` | Export benchmark records (`?format=csv\|json`) |

---

## 💼 Resume & Engineering Highlights

- **Engineered an LLM Evaluation Matrix**: Designed an embedding-based evaluation engine quantifying semantic divergence, prompt relevance, and groundedness using Sentence Transformers.
- **Built Hallucination Detection Engine**: Developed an automated claim extractor and verification pipeline flagging fabricated assertions against reference passages with sentence-level citations.
- **Multi-Model Warzone Benchmarking**: Constructed real-time benchmarking architecture measuring latency, accuracy, and token economics across Google Gemini and OpenAI GPT models.
- **RAG Pipeline Auditing**: Implemented a 5-pillar RAG evaluation system calculating retrieval precision, context relevance, and output faithfulness.
- **Full-Stack Production Architecture**: Engineered FastAPI backend with SQLite persistence, BCrypt JWT authentication, rate limiting, and a custom React 19 / Tailwind CSS 4 frontend styled with an arcade GTA visual identity.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
