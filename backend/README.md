# MeetingMind Backend

AI-powered meeting intelligence backend: upload/record audio → transcribe via Whisper API → extract action items, dates, dollar amounts → export to Notion/Linear/Slack.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** JWT (jsonwebtoken + bcrypt)
- **File uploads:** multer (local disk)
- **Transcription:** OpenAI Whisper API
- **Extraction:** GPT-4o + regex heuristics

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/meetingmind?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
OPENAI_API_KEY="sk-..."
NOTION_API_KEY="secret_..."      # optional
NOTION_DATABASE_ID="..."         # optional
SLACK_WEBHOOK_URL="..."          # optional
PORT=3000
```

### 3. Setup database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations (recommended for production)
npm run db:migrate
```

### 4. Run the server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

## API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Meetings (all protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meetings` | List user's meetings (includes commitment counts) |
| POST | `/api/meetings` | Create meeting (multipart/form-data with `client` field) |
| GET | `/api/meetings/:id` | Get meeting details (includes commitments) |
| DELETE | `/api/meetings/:id` | Delete meeting |

### Transcription

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/meetings/:id/transcribe` | Trigger Whisper transcription |
| GET | `/api/meetings/:id/transcript` | Get transcript |

### Summary/Extraction

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/meetings/:id/summarize` | Extract commitments from transcript |
| GET | `/api/meetings/:id/summary` | Get extracted summary (legacy format) |

### Commitments (NEW - first-class entities)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/commitments` | List all user's commitments |
| GET | `/api/commitments/:id` | Get single commitment |
| PATCH | `/api/commitments/:id` | Update commitment (status, deadline) |
| DELETE | `/api/commitments/:id` | Delete commitment |

#### Meeting-scoped Commitment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meetings/:id/commitments` | List commitments for a meeting |
| POST | `/api/meetings/:id/commitments` | Manually add a commitment |
| POST | `/api/meetings/:id/commitments/extract` | Re-run extraction from transcript |

### Export

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/meetings/:id/export/clipboard` | Get plain text summary with commitments |
| POST | `/api/meetings/:id/export/notion` | Push to Notion page (includes commitments) |
| POST | `/api/meetings/:id/export/slack` | Send to Slack webhook (includes commitments) |

## Usage Examples

### Signup

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123", "name": "John Doe"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Create Meeting with Audio and Client

```bash
curl -X POST http://localhost:3000/api/meetings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Weekly Standup" \
  -F "client=Acme Corp" \
  -F "meetingDate=2024-03-15T10:00:00Z" \
  -F "audio=@./meeting.mp3"
```

### List Meetings (with commitment counts)

```bash
curl -X GET http://localhost:3000/api/meetings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "meetings": [{
    "id": "...",
    "title": "Weekly Standup",
    "client": "Acme Corp",
    "status": "summarized",
    "_count": { "commitments": 5 },
    "openCommitments": 2,
    "fulfilledCommitments": 1,
    "overdueCommitments": 2
  }]
}
```

### Transcribe Meeting

```bash
curl -X POST http://localhost:3000/api/meetings/MEETING_ID/transcribe \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Summarize Meeting (creates Commitments)

```bash
curl -X POST http://localhost:3000/api/meetings/MEETING_ID/summarize \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### List All Commitments

```bash
curl -X GET "http://localhost:3000/api/commitments?status=open" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Mark Commitment as Fulfilled

```bash
curl -X PATCH http://localhost:3000/api/commitments/COMMITMENT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "fulfilled"}'
```

### Update Commitment Deadline

```bash
curl -X PATCH http://localhost:3000/api/commitments/COMMITMENT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deadline": "2024-03-20T00:00:00Z"}'
```

### Manually Add Commitment

```bash
curl -X POST http://localhost:3000/api/meetings/MEETING_ID/commitments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Send quarterly report",
    "deadline": "2024-03-20T00:00:00Z",
    "amountValue": 5000,
    "amountCurrency": "$",
    "owner": "John"
  }'
```

### Re-extract Commitments

```bash
curl -X POST http://localhost:3000/api/meetings/MEETING_ID/commitments/extract \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Export to Notion

```bash
curl -X POST http://localhost:3000/api/meetings/MEETING_ID/export/notion \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notionApiKey": "secret_...", "parentPageId": "..."}'
```

### Export to Slack

```bash
curl -X POST http://localhost:3000/api/meetings/MEETING_ID/export/slack \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"webhookUrl": "https://hooks.slack.com/..."}'
```

## Meeting Status Flow

```
pending → transcribed → summarized
    ↓
pending_no_audio (no audio attached)
```

## Commitment Status Flow

```
open → fulfilled (manually marked)
open → overdue (deadline passed, auto-detected)
```

## Commitment Entity

```typescript
{
  id: string;
  meetingId: string;
  text: string;           // the commitment text
  deadline: Date | null; // extracted or set deadline
  amountValue: number | null;  // extracted $ amount
  amountCurrency: "$" | "€" | "£" | null;
  owner: string | null;  // who made the commitment
  status: "open" | "fulfilled" | "overdue";
  createdAt: Date;
  fulfilledAt: Date | null;
}
```

## Development

```bash
# Run in development with hot reload
npm run dev

# Open Prisma Studio
npm run db:studio

# Generate Prisma client after schema changes
npm run db:generate

# Build for production
npm run build
```

## License

MIT
