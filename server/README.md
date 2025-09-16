# Crawler-Bot Server with Inngest Integration

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- Inngest CLI (for development)

### Installation
```bash
pnpm install
```

### Development

#### Run with Inngest Development Server
```bash
pnpm run dev:inngest
```

This will start both:
1. The Inngest development server (on port 8288)
2. The crawler-bot server (on port 3000)

#### Run without Inngest Development Server
```bash
pnpm run dev
```

This will start just the crawler-bot server.

### Testing Inngest Integration
```bash
node tests/test-inngest.js
```

### Environment Variables
Create a `.env` file with the following variables:
```env
INNGEST_APP_ID=crawler-bot
INNGEST_ENV=development
PORT=3000
NODE_ENV=development
```

### API Endpoints
- `POST /api/profiles/:profileId/launch` - Launch a profile via Inngest workflow
- `GET /api/inngest` - Inngest endpoint (for Inngest service communication)

### Inngest Dashboard
When running the development server, you can access the Inngest dashboard at:
http://localhost:8288