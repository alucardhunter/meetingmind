# MeetingMind — Docker Development Setup

## Prerequisites
- Docker & Docker Compose installed
- OpenAI API key (get one at platform.openai.com)

## Quick Start

```bash
# 1. Clone the repo
git clone git@github.com:alucardhunter/meetingmind.git
cd meetingmind

# 2. Set your API key
echo "OPENAI_API_KEY=sk-..." >> backend/.env.docker

# 3. Start everything
docker compose up

# 4. Open the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

## What's Running

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Next.js dev server |
| Backend | http://localhost:3001 | Express API |
| PostgreSQL | localhost:5432 | Database |

## Common Commands

```bash
# Restart fresh (recreate DB)
docker compose down -v && docker compose up

# View backend logs
docker compose logs -f backend

# View frontend logs
docker compose logs -f frontend

# Stop everything
docker compose down

# Rebuild after package changes
docker compose build --no-cache
```

## Environment Variables

Edit `backend/.env.docker`:
- `OPENAI_API_KEY` — required for Whisper + GPT-4o
- `NOTION_API_KEY` — optional, for Notion export
- `SLACK_WEBHOOK_URL` — optional, for Slack export
- `JWT_SECRET` — change before production
