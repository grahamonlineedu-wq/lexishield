const OpenAI = require('openai');
const { SYSTEM_PROMPT } = require('../prompts/contractPrompt');

exports.analyzeDocument = async (req, res) => {
  try {
    // Instantiate inside the function to ensure process.env is fully loaded
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { documentText, documentType } = req.body;

    if (!documentText || documentText.trim().length < 50) {
      return res.status(400).json({ error: 'Please provide valid document text (min 50 characters).' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { 
          role: 'user', 
          content: `Document Type: ${documentType || 'General Contract'}\n\nDocument Text:\n${documentText}` 
        }
      ],
      temperature: 0.2,
    });

    const parsedReport = JSON.parse(completion.choices[0].message.content);

    return res.status(200).json({
      success: true,
      data: parsedReport
    });

  } catch (error) {
    console.error('Analysis Error:', error.message);
    return res.status(500).json({ 
      error: 'Failed to process document analysis.',
      details: error.message 
    });
  }
};

