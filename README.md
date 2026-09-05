# AI Business Intelligence Copilot

An AI workspace for business questions, document search, persistent chat, voice interaction, and approval-gated actions in Google Calendar and Gmail.

## Features

- Business analysis and conversational assistance powered by Gemini
- Document upload, extraction, indexing, and semantic search
- Persistent conversations that can be reopened and continued
- Google Calendar and Gmail connections through OAuth
- Human approval before calendar events or emails are created
- Browser voice input and optional spoken responses
- Responsive React interface with calendar, documents, connections, and history views

## Technology

- **Frontend:** React, TypeScript, Vite, React Router, Lucide icons
- **Backend:** FastAPI, SQLAlchemy, Pydantic, SQLite by default
- **AI and integrations:** Gemini API and Google OAuth APIs
- **Testing:** Pytest, Vitest, Testing Library, and Playwright

## Project structure

```text
backend/             FastAPI application, tests, and configuration template
frontend/            React application and browser tests
docs/                Project documentation
scene.splinecode     Orb scene asset
```

Runtime databases, uploaded documents, vector indexes, test output, build output, local environments, and agent metadata are ignored by Git.

## Prerequisites

- Python 3.11 or newer
- Node.js 20 or newer
- A Gemini API key
- Google OAuth credentials for Calendar or Gmail connections

## Backend setup

From PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python -m uvicorn app.main:app --reload --port 8000
```

On macOS or Linux, activate the environment with `source .venv/bin/activate` and copy the environment file with `cp .env.example .env`.

The API is available at `http://127.0.0.1:8000`; interactive API documentation is at `http://127.0.0.1:8000/docs`.

## Frontend setup

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Vite serves the application at `http://localhost:5173` by default.

## Environment configuration

Create `backend/.env` from `backend/.env.example` and configure the values needed by your environment.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLAlchemy database connection; SQLite works for local development |
| `JWT_SECRET` | Secret used to sign authentication tokens |
| `GEMINI_API_KEY` | Gemini API credential |
| `GEMINI_MODEL` | Gemini model used by the assistant |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | Backend OAuth callback URL registered in Google Cloud |
| `OAUTH_TOKEN_ENCRYPTION_KEY` | Key used to encrypt stored OAuth tokens |
| `FRONTEND_URL` | Frontend URL used after OAuth completes |
| `CORS_ORIGINS` | Browser origins permitted to call the API |
| `DEVELOPMENT_AUTH_EMAIL` | Local development user identity |
| `VOICE_STT_MODEL` | Gemini model used for speech transcription |
| `VOICE_TTS_MODEL` | Gemini model used for speech generation |
| `VOICE_TTS_VOICE` | Voice selected for generated speech |

Do not commit `backend/.env`. If a credential has ever appeared in a commit, log, screenshot, or shared message, rotate it in the provider console.

## Google OAuth setup

1. Create or select a project in Google Cloud Console.
2. Enable the Google Calendar API and Gmail API.
3. Configure the OAuth consent screen and add your account as a test user while the app is in testing mode.
4. Create a Web application OAuth client.
5. Register the exact callback URL configured in `GOOGLE_REDIRECT_URI`, typically `http://127.0.0.1:8000/api/integrations/google/callback` for local development.
6. Add the client ID and secret to `backend/.env`, restart the API, and connect the service from the Connections screen.

Calendar events and email sends remain pending until the user approves the proposed action in chat.

## Voice interaction

Voice input requires microphone permission and a browser that supports media capture. Configure the voice model variables in `backend/.env`; the assistant still follows the same approval flow for external write actions issued by voice.

## Tests

Run backend tests from `backend`:

```powershell
python -m pytest
```

Run frontend unit tests and a production build from `frontend`:

```powershell
npm run test
npm run build
```

Run browser tests after installing Playwright's browser binaries:

```powershell
npx playwright install
npm run test:browser
```

## Repository hygiene

Keep credentials in local `.env` files and commit only the supplied example. Uploaded business documents, local databases, generated vector data, test artifacts, virtual environments, package installations, and production builds should remain outside version control.
