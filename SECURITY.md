# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 1.1.x (current) | ✅ |
| < 1.0 | ❌ |

## Reporting a Vulnerability

**Please do not open a public GitHub Issue for security vulnerabilities.**

Instead, email **mm7390180@gmail.com** with:

- Description of the vulnerability and its potential impact
- Steps to reproduce (proof of concept if possible)
- Affected versions
- Any suggested fix (optional)

I will acknowledge your report within **48 hours** and aim to release a patch within **7 days** for critical issues.

## Security Considerations

- All API secrets and keys are managed via `.env` files (never committed)
- The `.env.example` file contains only placeholder values
- JWT tokens are signed and expire after the configured TTL
- Rate limiting is applied via `slowapi` to prevent abuse
- CORS is configured to only allow trusted origins in production
