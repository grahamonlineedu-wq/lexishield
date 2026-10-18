# LexiShield

LexiShield is a Node.js Express application for analyzing contract risk using Groq-based AI responses. It is a learning-oriented project that helps demonstrate secure-by-default patterns for a SaaS app that processes sensitive documents.

## Features

- Express API with security headers and JSON limits
- Document analysis endpoint with authentication
- Request rate limiting
- Startup database initialization for Neon SQL
- Health endpoint for deployment checks
- Example tests for API security and health checks
- Fincra payment integration (sandbox support)

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a local environment file:
   ```bash
   cp .env.example .env
   ```

3. Add the required variables:
   ```bash
   PORT=3000
   API_SECRET_KEY=your-development-key
   DATABASE_URL=postgresql://user:pass@host/dbname
   GROQ_API_KEY=your-groq-key
   FINCRA_SECRET_KEY=your-fincra-secret
   FINCRA_WEBHOOK_SECRET=your-fincra-webhook-secret
   FINCRA_BASE_URL=https://sandbox.fincra.com
   ```

4. Run the app:
   ```bash
   npm start
   ```

5. Run tests:
   ```bash
   npm test
   ```

## Security notes

This project is intentionally structured to avoid treating sensitive document text as harmless. Use this as a foundation, then add:

- real user authentication and authorization
- encrypted document storage
- per-user access control
- retention policies and delete flows
- proper webhook verification from your payment provider
- monitoring and alerting

## API usage example

```bash
curl -X POST http://localhost:3000/api/v1/analyze \
  -H "Authorization: Bearer your-development-key" \
  -H "Content-Type: application/json" \
  -d '{"documentText":"This is a long legal agreement..."}'
```
