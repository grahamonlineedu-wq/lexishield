# LexiShield AI - Project Architecture & Setup

## 1. Database Schema (PostgreSQL/Supabase)

### users Table
* `id` (UUID, Primary Key) -> Unique identifier for each account.
* `email` (Text, Unique) -> Account registration email address.
* `subscription_status` (Text) -> Value representing access tiers ('free', 'premium', 'cancelled').
* `created_at` (Timestamp) -> Database insertion record time.

### documents Table
* `id` (UUID, Primary Key) -> Tracking identifier for each text submission.
* `user_id` (UUID, Foreign Key) -> Linked relation referencing `users.id`.
* `raw_text` (Text) -> The literal body text passed into the interface text block.
* `created_at` (Timestamp) -> Record creation timeframe.

### audit_results Table
* `id` (UUID, Primary Key) -> Unique tracking entry for an analysis run.
* `document_id` (UUID, Foreign Key) -> Linked relation referencing `documents.id`.
* `risk_score` (Integer) -> Aggregated threat metrics scaled from 1 to 100.
* `flagged_clauses` (JSONB) -> Structured array elements containing the identified problems.
* `status` (Text) -> Operational tracking states ('success', 'failed', 'processing').

---

## 2. Secure Backend API Endpoint Logic (Node.js Express example)

```javascript
app.post('/api/audit', async (req, res) => {
  try {
    const { contractText } = req.body;

    if (!contractText || contractText.trim().length === 0) {
      return res.status(400).json({ error: "Text area cannot be blank." });
    }

    // Connect securely to your LLM Engine API Endpoint
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [
        { role: "system", content: "You are a commercial compliance risk scanner..." },
        { role: "user", content: contractText }
      ],
    });

    res.json({ result: completion.choices.message.content });

  } catch (error) {
    console.error("Local Error Logged via Terminal Console:", error);
    res.status(500).json({ 
      error: "The processing backend failed to respond.", 
      details: error.message 
    });
  }
});
```

---

## 3. Recommended Local Optimization Blueprint
1. **Sanitize Inputs:** Clean complex markup from clipboard pastes before parsing strings to the upstream API.
2. **Network Retries:** Implement local retry strategies on the frontend logic to intercept intermittent client network dropouts.
3. **Environment Isolation:** Ensure your access keys reside strictly inside a hidden root environment configuration file (`.env`). Never commit raw platform secrets directly into tracking repositories.

