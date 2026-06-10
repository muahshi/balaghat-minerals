// api/lead.js — Lead capture & notification
// Sends email via Resend + WhatsApp via WhatsApp Business API (or simple webhook)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { conversation, userMessage, timestamp } = req.body;

  // Build a readable conversation summary
  const summary = conversation
    .map(m => `${m.role === 'user' ? '👤 Buyer' : '🤖 Arjun'}: ${m.content}`)
    .join('\n');

  const emailBody = `
NEW EXPORT LEAD — Balaghat Minerals Chatbot
===========================================
Time: ${timestamp}
Last Message: ${userMessage}

CONVERSATION:
${summary}

---
Reply to this lead: sales@balaghatminerals.com
`;

  const results = { email: false, whatsapp: false };

  // ── EMAIL via Resend ──
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (RESEND_API_KEY) {
    try {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'leads@balaghatminerals.com',
          to: ['sales@balaghatminerals.com'],
          subject: `🔔 New Export Lead — ${new Date(timestamp).toLocaleString('en-IN')}`,
          text: emailBody,
          html: `<pre style="font-family:monospace;font-size:14px;line-height:1.6;">${emailBody}</pre>`
        })
      });
      results.email = emailRes.ok;
    } catch (e) {
      console.error('Email error:', e);
    }
  }

  // ── WHATSAPP via WhatsApp Business Cloud API ──
  // Set WHATSAPP_TOKEN and WHATSAPP_PHONE_ID in Vercel env vars
  const WA_TOKEN = process.env.WHATSAPP_TOKEN;
  const WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
  const WA_NOTIFY_NUMBER = process.env.WHATSAPP_NOTIFY_NUMBER; // your number e.g. 919100000000

  if (WA_TOKEN && WA_PHONE_ID && WA_NOTIFY_NUMBER) {
    try {
      const waMessage = `🔔 *New Export Lead*\n\nTime: ${timestamp}\n\nLast message:\n_${userMessage}_\n\nCheck email for full conversation.\n\n_Balaghat Minerals Bot_`;

      const waRes = await fetch(`https://graph.facebook.com/v18.0/${WA_PHONE_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WA_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: WA_NOTIFY_NUMBER,
          type: 'text',
          text: { body: waMessage }
        })
      });
      results.whatsapp = waRes.ok;
    } catch (e) {
      console.error('WhatsApp error:', e);
    }
  }

  return res.status(200).json({ success: true, ...results });
}
