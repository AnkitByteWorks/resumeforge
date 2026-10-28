# ResumeForge

AI-assisted, ATS-friendly resume builder.

## Structure
- `backend/` Spring Boot 4 (Java 25), MongoDB
- `frontend/` React (coming soon)
- `infrastructure/` Docker Compose and deployment files
- `scripts/` helper scripts

## Run locally
1. Copy `.env.example` to `.env` and fill in the values.
2. Start the database: `.\scripts\db-up.ps1`
3. Set `GEMINI_API_KEY` in your IDE run configuration (never commit it).
4. Run `ResumeBackendApplication` from `backend/`.

## Test
`.\scripts\test-backend.ps1`
