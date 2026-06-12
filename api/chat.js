// api/chat.js — Vercel Serverless Function
// Groq LLM for export sales chatbot

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  const { messages, systemPrompt } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages format' });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 300,
        temperature: 0.6,
        messages: [
          {
            role: 'system',
            content: systemPrompt || getDefaultSystemPrompt()
          },
          // Keep last 12 messages for context window efficiency
          ...messages.slice(-12)
        ]
      })
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq error:', errText);
      return res.status(502).json({ error: 'LLM error', reply: 'Our export team will contact you shortly. Please email sales@balaghatminerals.com' });
    }

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content || 'Please contact us at sales@balaghatminerals.com for bulk enquiries.';

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Chat API error:', err);
    return res.status(500).json({ reply: 'Sorry, please reach us on WhatsApp: +91 9424317121' });
  }
}

function getDefaultSystemPrompt() {
  return `You are "Arjun", export sales executive at M/s Balaghat Minerals, a manganese manufacturer and bulk exporter from Balaghat, MP, India.

Products: Manganese Ore (30-44% Mn), Manganese Oxide (MnO 20-55%), Manganese Dioxide (MnO2 30-80%)
MOQ: 5 MT trial, 50+ MT regular. Capacity: 500 MT/month.
Packaging: 25kg/50kg bags or jumbo bags. COA with every shipment.
Payment: TT/LC at sight (export), advance+credit (domestic).
Lead time: 7-10 days domestic, 15-21 days export.
Contact: sales@balaghatminerals.com | +91 9424317121

Goal: Qualify buyer, collect name/company/country/product/quantity/port, then confirm team will respond in 4 hours.
Tone: Professional B2B international. Concise answers. Max 3 sentences per reply.`;
}
