const Groq = require('groq-sdk');
const crypto = require('crypto');
const sql = require('../config/db');
const { SYSTEM_PROMPT } = require('../prompts/contractPrompt');
require('dotenv').config();

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

const normalizeString = (value, fallback = '') => {
  if (typeof value !== 'string') return fallback;
  return value.trim();
};

const normalizeArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item !== null && item !== undefined)
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, 20);
};

const sanitizeDocumentPreview = (documentText) => {
  return String(documentText || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 2000);
};

const validateAnalysisResult = (payload) => {
  const riskScore = normalizeString(payload?.risk_score, 'Low');
  const summary = normalizeString(payload?.summary, 'No summary available.');
  const flags = normalizeArray(payload?.flags);
  const missingClauses = normalizeArray(payload?.missing_clauses);

  return {
    risk_score: ['High', 'Medium', 'Low'].includes(riskScore) ? riskScore : 'Low',
    summary: summary.length > 500 ? `${summary.slice(0, 497)}...` : summary,
    flags,
    missing_clauses: missingClauses
  };
};

exports.analyzeDocument = async (req, res) => {
  try {
    const { documentText } = req.body;
    const text = typeof documentText === 'string' ? documentText.trim() : '';

    if (!text || text.length < 20) {
      return res.status(400).json({ error: 'Provide sufficient document text.' });
    }

    if (text.length > 20000) {
      return res.status(400).json({ error: 'Document text is too long. Please provide a shorter excerpt.' });
    }

    if (!groq) {
      return res.status(503).json({ error: 'AI analysis is not configured. Set GROQ_API_KEY.' });
    }

    const prompt = `Analyze this legal text and return valid JSON only.\n\n${text}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      model: 'openai/gpt-oss-120b',
      max_tokens: 500,
      temperature: 0.2
    });

    const rawContent = completion?.choices?.[0]?.message?.content || '';
    if (!rawContent) {
      throw new Error('No response returned from Groq.');
    }

    const cleanedContent = rawContent.replace(/```json|```/gi, '').trim();
    const parsedData = JSON.parse(cleanedContent);
    const safeData = validateAnalysisResult(parsedData);

    if (sql) {
      const documentPreview = sanitizeDocumentPreview(text);
      const documentHash = crypto.createHash('sha256').update(text).digest('hex');

      try {
        await sql`
          INSERT INTO contract_analyses (user_id, document_preview, document_hash, risk_score, summary, flags, missing_clauses)
          VALUES (
            ${req.user?.id || null},
            ${documentPreview},
            ${documentHash},
            ${safeData.risk_score},
            ${safeData.summary},
            ${JSON.stringify(safeData.flags)},
            ${JSON.stringify(safeData.missing_clauses)}
          )
        `;
      } catch (dbErr) {
        console.error('DB Insert Warning:', dbErr.message);
      }
    }

    return res.status(200).json({ status: 'success', data: safeData });
  } catch (error) {
    console.error('API Error:', error.message);
    return res.status(500).json({
      error: 'Failed to process document analysis.',
      details: 'The analysis service encountered an internal error.'
    });
  }
};
