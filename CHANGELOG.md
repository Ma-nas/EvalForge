# Changelog

All notable changes to EvalForge are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). Versioning follows [SemVer](https://semver.org/).

---

## [Unreleased]

### Planned
- Semantic cache for repeated evaluation queries
- Support for Claude and Mistral model runners
- Export to CSV/Excel from the React dashboard
- Embedding model selection (BGE, E5, etc.)

---

## [1.1.0] — 2026-10-20

### Added
- `CONTRIBUTING.md` — development setup guide and contribution workflow
- `SECURITY.md` — responsible disclosure policy
- `CHANGELOG.md` — this file
- `backend/tests/test_api.py` — core API coverage: health, root, 404 handling, input validation tests

### Changed
- Gemini runner upgraded to `gemini-2.5-flash` with `gemini-1.5-flash` fallback
- CORS config: allow all `*.vercel.app` subdomains via `allow_origin_regex`

---

## [1.0.0] — 2026-09-15

### Added
- FastAPI backend with evaluation, hallucination detection, RAG evaluation, and benchmarking endpoints
- JWT authentication (register, login, `/auth/me`)
- React + TypeScript dashboard
- SQLite persistence via SQLAlchemy ORM
- Rate limiting via `slowapi`
- Docker and Fly.io deployment config
- Test suite: `test_auth`, `test_evaluation`, `test_hallucination`, `test_rag`, `test_datasets`
- 24/7 keep-alive GitHub Actions daemon
