# EvalForge

### Production-Grade LLM Evaluation, Benchmarking & Hallucination Detection Platform

![Python](https://img.shields.io/badge/Python-3.11+-blue?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-blue?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## Overview

**EvalForge** is a comprehensive system designed to evaluate, benchmark, and improve Large Language Model (LLM) outputs by:

-  **Detecting Hallucinations** — Identifies unsupported claims using context grounding and embedding similarity
-  **Measuring Semantic Accuracy** — Computes similarity scores between expected and actual outputs
-  **Evaluating RAG Pipelines** — Measures retrieval precision, context relevance, and faithfulness
-  **Comparing Multiple LLMs** — Benchmarks models across accuracy, latency, and cost

---

##  Architecture

```
┌─────────────────────────┐
│   React + TypeScript     │    Frontend (Tailwind CSS + Recharts)
│   Dashboard UI           │
└──────────┬──────────────┘
           │ REST API
┌──────────▼──────────────┐
│   FastAPI Backend        │    API Layer
│   /api/v1/*              │
└──────────┬──────────────┘
           │
┌──────────▼──────────────┐
│   Evaluation Engine      │
│  ┌─────────────────────┐│
│  │ Embedding Model      ││    Sentence Transformers (all-MiniLM-L6-v2)
│  │ (Semantic Similarity)││
│  ├─────────────────────┤│
│  │ LLM APIs            ││    Gemini / OpenAI
│  │ (Benchmarking)      ││
│  ├─────────────────────┤│
│  │ Scoring Engine       ││    Composite scoring with weighted metrics
│  │ (Quality Assessment) ││
│  └─────────────────────┘│
└──────────┬──────────────┘
           │
┌──────────▼──────────────┐
│   SQLite Database        │    Evaluation results & metadata
└─────────────────────────┘
```

---

##  Features

### 1.  LLM Evaluation Engine
- **Input**: Prompt + Context + Expected Output + Actual Output
- **Output**: Semantic similarity, relevance score, hallucination score, composite quality rating
- Supports single and batch evaluation

### 2.  Hallucination Detection
- Extracts individual claims from LLM output
- Verifies each claim against source context using embedding similarity
- Flags unsupported/fabricated facts with confidence scores
- Provides evidence for supported claims

### 3.  Multi-Model Benchmarking
- Compare Gemini, OpenAI GPT, and other models
- Metrics: Accuracy, Latency (ms), Cost per 1K tokens
- Side-by-side output comparison
- Visual latency and accuracy charts

### 4.  RAG Evaluation System
- Retrieval Precision & Context Relevance
- Answer Relevance & Groundedness
- Faithfulness Score (sentence-level grounding)
- Composite RAG quality score

### 5.  Interactive Dashboard
- Real-time evaluation metrics
- Model comparison charts (Bar, Radar, Pie, Line)
- Quality distribution visualization
- Weekly trend analysis

### 6.  Dataset Management
- Upload CSV/JSON datasets
- Drag-and-drop file upload
- Dataset preview with tabular view
- Built-in SQuAD and TruthfulQA sample datasets

---

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.11+, FastAPI, Uvicorn |
| **ML/Embeddings** | Sentence Transformers, NumPy, scikit-learn |
| **LLM APIs** | Google Gemini API, OpenAI API |
| **Frontend** | React 18, TypeScript, Tailwind CSS 4, Vite |
| **Visualization** | Recharts |
| **Database** | SQLite (SQLAlchemy ORM) |
| **Containerization** | Docker |

---

##  Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- API keys for Gemini and/or OpenAI (optional for evaluation-only mode)

### 1. Clone the Repository
```bash
git clone https://github.com/Ma-nas/EvalForge.git
cd EvalForge
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env and add your API keys

# Start the server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### 4. Open the App
- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs
- **API Health**: http://localhost:8000/health

---

##  Project Structure

```
EvalForge/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI entry point
│   │   ├── api/routes/
│   │   │   ├── evaluation.py       # Evaluation endpoints
│   │   │   ├── hallucination.py    # Hallucination detection endpoints
│   │   │   ├── benchmark.py        # Benchmarking endpoints
│   │   │   ├── rag.py              # RAG evaluation endpoints
│   │   │   └── dataset.py          # Dataset management endpoints
│   │   ├── core/
│   │   │   ├── config.py           # Settings & environment
│   │   │   ├── embeddings.py       # Sentence Transformer embeddings
│   │   │   └── scoring.py          # Composite scoring engine
│   │   ├── models/
│   │   │   ├── schemas.py          # Pydantic request/response models
│   │   │   └── database.py         # SQLAlchemy ORM models
│   │   └── services/
│   │       ├── evaluator.py        # LLM evaluation logic
│   │       ├── hallucination.py    # Hallucination detection logic
│   │       ├── benchmark.py        # Multi-model benchmarking
│   │       └── rag_evaluator.py    # RAG pipeline evaluation
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   │   └── ScoreCard.tsx       # Circular gauge score card
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx       # Main dashboard with charts
│   │   │   ├── Evaluate.tsx        # LLM evaluation page
│   │   │   ├── Hallucination.tsx   # Hallucination detection page
│   │   │   ├── Benchmark.tsx       # Model benchmarking page
│   │   │   ├── RAG.tsx             # RAG evaluation page
│   │   │   └── Datasets.tsx        # Dataset management page
│   │   ├── api.ts                  # API client
│   │   ├── App.tsx                 # Main app with routing
│   │   └── index.css               # Design system & styles
│   └── package.json
├── datasets/
│   ├── squad_sample.json           # SQuAD-style QA dataset
│   └── truthfulqa_sample.csv       # TruthfulQA hallucination dataset
└── README.md
```

---

##  API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/evaluation/evaluate` | Single LLM evaluation |
| `POST` | `/api/v1/evaluation/evaluate/batch` | Batch evaluation |
| `POST` | `/api/v1/hallucination/detect` | Hallucination detection |
| `POST` | `/api/v1/benchmark/run` | Single benchmark run |
| `POST` | `/api/v1/benchmark/run/batch` | Batch benchmarking |
| `POST` | `/api/v1/rag/evaluate` | RAG pipeline evaluation |
| `POST` | `/api/v1/datasets/upload` | Upload dataset (CSV/JSON) |
| `GET` | `/api/v1/datasets/` | List all datasets |
| `GET` | `/api/v1/datasets/{id}` | Get dataset info |
| `GET` | `/api/v1/datasets/{id}/data` | Get dataset data |
| `DELETE` | `/api/v1/datasets/{id}` | Delete dataset |

---

##  Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Semantic evaluation accuracy | ≥ 85% | 
| Hallucination detection precision | ≥ 70% | 
| Average response latency | ≤ 300ms | 
| Dataset size support | ≥ 1,000 samples | 

---

## Resume Impact

After building this project, you can write:

> - Engineered an LLM evaluation platform that improved hallucination detection accuracy by implementing embedding-based scoring and retrieval validation
> - Built a multi-model benchmarking system comparing accuracy, latency, and cost across LLM APIs (Gemini, OpenAI)
> - Developed a RAG evaluation module quantifying retrieval relevance using semantic similarity techniques
> - Designed a scalable system with API-driven architecture and interactive dashboard for real-time evaluation

---

##  License

MIT License - feel free to use this project for learning and development.

---


