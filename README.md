# EvalForge

### Production-Grade LLM Evaluation, Multi-Model Benchmarking, and Hallucination Detection Matrix

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Tests](https://img.shields.io/badge/Pytest-100%25_Passing-brightgreen?style=flat-square&logo=pytest&logoColor=white)](https://pytest.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

---

## Executive Overview

EvalForge is an automated evaluation and observability platform engineered to benchmark, audit, and validate Large Language Model (LLM) generations with quantitative precision. Designed for machine learning engineers and LLMOps pipelines, the platform combines localized NLP scoring algorithms with interactive telemetry:

- **Hallucination Detection:** Deconstructs generated text into discrete atomic claims and cross-verifies each statement against reference context using dense semantic embeddings (`all-MiniLM-L6-v2`).
- **Semantic Fidelity Scoring:** Measures composite cosine similarity, query relevance, factual consistency, and output groundedness across heterogeneous models.
- **RAG Pipeline Auditing:** Evaluates retrieval precision, context relevance, sentence-level faithfulness, and answer relevance across multi-step retrieval workflows.
- **Multi-Model Benchmarking:** Executes concurrent head-to-head evaluation runs comparing response accuracy, inference latency (milliseconds), and token expenditure ($/1K tokens) across Google Gemini, GPT-4o, and GPT-3.5.
- **Corpus Ingestion & Batch Testing:** Ingests standard evaluation datasets (.csv, .json) with pre-configured seed pipelines for benchmark corpora like SQuAD and TruthfulQA.
- **Telemetry Export:** Enables single-click data export in CSV and JSON formats for continuous integration (CI) quality gates and performance audits.

---

## System Architecture

```
+-------------------------------------------------------------------------+
|                       React 19 + TypeScript + Vite                      |
|              Interactive Dashboard | Real-Time Telemetry Gauges         |
+-------------------------------------------------------------------------+
                                    |
                           REST API / Bearer JWT
                                    v
+-------------------------------------------------------------------------+
|                          FastAPI Backend 0.115                          |
|             Rate Limiter | JWT BCrypt Auth | CORS Middleware            |
+-------------------------------------------------------------------------+
          |                         |                         |
          v                         v                         v
+-------------------+     +-------------------+     +-------------------+
| Evaluation Engine |     | Hallucination Hub |     | Model Benchmark   |
| Semantic Scoring  |     | Claim Deconstruct |     | Latency & Cost    |
+-------------------+     +-------------------+     +-------------------+
          |                         |                         |
          +-------------------------+-------------------------+
                                    |
             +---------------------------------------------+
             | Dense Vectors: all-MiniLM-L6-v2 (PyTorch)   |
             | Model Providers: Google Gemini & OpenAI GPT |
             +---------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                    SQLite / PostgreSQL via SQLAlchemy                   |
|           Evaluations | Benchmarks | Hallucinations | Datasets          |
+-------------------------------------------------------------------------+
```

---

## Quick Start

### Option 1: Docker Compose (Automated Stack)

Deploy both the backend API and frontend client in isolated containers:

```bash
git clone https://github.com/Ma-nas/EvalForge.git
cd EvalForge
docker-compose up --build
```

- Frontend Application: `http://localhost:3000`
- Backend API Service: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

---

### Option 2: Local Development Environment

#### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install pytest pytest-asyncio

# Configure environment variables
cp .env.example .env

# Start application server
uvicorn app.main:app --reload --port 8000
```

#### Frontend Setup

```bash
cd frontend

# Install Node modules
npm install

# Start Vite development server
npm run dev
```

---

## Automated Verification Suite

The backend contains automated test coverage for authentication flows, evaluation routines, hallucination verification, RAG audits, and dataset management:

```bash
cd backend
pytest tests/ -v
```

```text
tests/test_auth.py::test_register_and_login_flow PASSED                 [12%]
tests/test_datasets.py::test_dataset_seed_and_batch_evaluate PASSED       [25%]
tests/test_datasets.py::test_export_endpoints PASSED                    [37%]
tests/test_evaluation.py::test_evaluate_single PASSED                   [50%]
tests/test_evaluation.py::test_evaluate_batch PASSED                    [62%]
tests/test_hallucination.py::test_detect_hallucination_factual PASSED     [75%]
tests/test_hallucination.py::test_detect_hallucination_fabricated PASSED  [87%]
tests/test_rag.py::test_rag_evaluation PASSED                           [100%]

============================= 8 passed in 21.40s =============================
```

---

## API Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register operator credentials with BCrypt hashing |
| `POST` | `/api/v1/auth/login` | Authenticate user and issue JWT bearer token |
| `GET` | `/api/v1/auth/me` | Retrieve authenticated identity metadata |
| `GET` | `/api/v1/dashboard/summary` | Aggregate evaluation metrics and throughput metrics |
| `POST` | `/api/v1/evaluation/evaluate` | Execute single-instance semantic validation |
| `POST` | `/api/v1/evaluation/evaluate/batch` | Execute batch evaluation on tabular prompt sets |
| `POST` | `/api/v1/hallucination/detect` | Deconstruct text into atomic assertions and score context match |
| `GET` | `/api/v1/hallucination/history` | Query historical hallucination audit trails |
| `POST` | `/api/v1/benchmark/run` | Benchmark models for accuracy, latency, and token cost |
| `POST` | `/api/v1/benchmark/run/batch` | Run matrix evaluations across multiple model endpoints |
| `POST` | `/api/v1/rag/evaluate` | Calculate retrieval precision, faithfulness, and answer relevance |
| `GET` | `/api/v1/rag/history` | Retrieve logs of historical RAG evaluation sessions |
| `POST` | `/api/v1/datasets/upload` | Upload benchmark corpora in CSV or JSON format |
| `POST` | `/api/v1/datasets/seed` | Seed standard reference datasets (SQuAD, TruthfulQA) |
| `GET` | `/api/v1/datasets/{id}/data` | Paginated tabular inspection of dataset entries |
| `POST` | `/api/v1/datasets/{id}/evaluate` | Trigger batch evaluations against a persisted dataset ID |
| `GET` | `/api/v1/export/evaluations` | Export evaluation history (`?format=csv` or `?format=json`) |
| `GET` | `/api/v1/export/benchmarks` | Export multi-model benchmark records (`?format=csv` or `?format=json`) |

---

## Key Technical Implementations

- **Atomic Claim Extraction:** Parses complex generation outputs into standalone declarative sentences, eliminating compound assertion ambiguity prior to vector comparison.
- **Localized Vector Operations:** Employs PyTorch and `sentence-transformers/all-MiniLM-L6-v2` locally to deliver zero-cost, zero-latency-leak embedding computation without external API dependencies.
- **Production Defense Patterns:** Implements SlowAPI client rate-limiting, CORS origin isolation, and strict Pydantic v2 data models for input sanitation.
- **Full-Stack Separation:** FastAPI backend decoupled from React 19 frontend, containerized via multi-stage Docker configurations.

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for full legal text.
