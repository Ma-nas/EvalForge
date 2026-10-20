# Contributing to EvalForge

Thank you for your interest in contributing to EvalForge! This document will help you get set up quickly.

---

## Development Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- Git

### 1. Fork and Clone
```bash
git clone https://github.com/YOUR_USERNAME/EvalForge.git
cd EvalForge
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install ruff pytest httpx   # dev dependencies
cp .env.example .env
# Fill in API keys in .env
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Run Tests
```bash
cd backend
pytest tests/ -v --tb=short
```

---

## Contribution Workflow

1. Create a branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make changes with clear, atomic commits using Conventional Commits:
   - `feat:` — new feature
   - `fix:` — bug fix
   - `test:` — adding or improving tests
   - `docs:` — documentation only
   - `refactor:` — code change that neither fixes a bug nor adds a feature
   - `chore:` — build process or dependency updates
3. Push your branch and open a Pull Request with a clear description.

---

## Code Style

- **Python:** PEP 8 enforced by `ruff`. Run `ruff check backend/` before committing.
- **TypeScript:** ESLint config included. Run `npm run lint` in `frontend/`.
- **Tests:** All new features or bug fixes should be accompanied by a test.

---

## Reporting Issues

Use [GitHub Issues](https://github.com/Ma-nas/EvalForge/issues). Please include:
- OS and Python/Node version
- Steps to reproduce
- Expected vs actual behavior
- Relevant logs or screenshots

---

## Security Issues

**Do not open a public issue for security vulnerabilities.** Email mm7390180@gmail.com directly.
