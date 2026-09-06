const Groq = require('groq-sdk');
const sql = require('../config/db');
require('dotenv').config();

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

exports.analyzeDocument = async (req, res) => {
  try {
    const { documentText } = req.body;

    if (!documentText || documentText.trim().length < 20) {
      return res.status(400).json({ error: 'Provide sufficient document text.' });
    }

    const prompt = `Analyze this legal text and respond ONLY with a raw valid JSON object. Do not include markdown formatting or extra text.
Structure:
{
  "risk_score": "Low",
  "summary": "Brief summary",
  "flags": ["Flag 1"],
  "missing_clauses": ["Clause 1"]
}

Text:
${documentText}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'openai/gpt-oss-120b',
      max_tokens: 500
    });

    let content = completion.choices[0].message.content.trim();
    content = content.replace(/```json|```/g, '').trim();

    const parsedData = JSON.parse(content);

    if (sql) {
      try {
        await sql`
          INSERT INTO contract_analyses (raw_text, risk_score, summary, flags, missing_clauses)
          VALUES (
            ${documentText}, 
            ${parsedData.risk_score}, 
            ${parsedData.summary}, 
            ${JSON.stringify(parsedData.flags)}, 
            ${JSON.stringify(parsedData.missing_clauses)}
          )
        `;
      } catch (dbErr) {
        console.error('DB Insert Warning:', dbErr.message);
      }
    }

    return res.status(200).json({ status: 'success', data: parsedData });

  } catch (error) {
    console.error('API Error:', error.message);
    return res.status(500).json({ 
      error: 'Failed to process document analysis.', 
      details: error.message 
    });
  }
};
