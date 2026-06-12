/* shared-components.js — inject navbar, footer, chatbot on every page */

/* ─── NAVBAR HTML ─── */
const NAVBAR_HTML = `
<a href="https://wa.me/919424317121" class="wa-float" target="_blank" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>

<div id="chat-launcher" onclick="toggleChat()" title="Ask about bulk orders">
  <i class="fas fa-comments"></i>
  <span class="chat-badge">1</span>
</div>

<div id="chat-window">
  <div class="chat-header">
    <div class="chat-avatar">BM</div>
    <div class="chat-header-info">
      <div class="chat-header-name">M/s Balaghat Minerals Export Desk</div>
      <div class="chat-header-status">Online — Bulk Enquiries</div>
    </div>
    <button class="chat-close" onclick="toggleChat()"><i class="fas fa-times"></i></button>
  </div>
  <div class="chat-messages" id="chatMessages"></div>
  <div class="chat-quick-btns" id="quickBtns">
    <button class="quick-btn" onclick="quickSend('Manganese Ore price per MT')">Mn Ore Price</button>
    <button class="quick-btn" onclick="quickSend('MnO2 bulk availability')">MnO₂ Stock</button>
    <button class="quick-btn" onclick="quickSend('Export documentation help')">Export Docs</button>
    <button class="quick-btn" onclick="quickSend('Minimum order quantity')">MOQ</button>
  </div>
  <div class="chat-input-area">
    <textarea class="chat-input" id="chatInput" placeholder="Ask about products, pricing, export..." rows="1"
      onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendMessage();}"></textarea>
    <button class="chat-send" onclick="sendMessage()"><i class="fas fa-paper-plane"></i></button>
  </div>
</div>

<nav class="navbar">
  <a class="nav-brand" href="/index.html">
    <div class="nav-logo-mark">BM</div>
    <span class="nav-brand-text">M/s Balaghat Minerals</span>
  </a>
  <ul class="nav-links">
    <li><a href="/index.html">Home</a></li>
    <li><a href="/products/manganese-ore.html">Products</a></li>
    <li><a href="/export.html">Export</a></li>
    <li><a href="/faq.html">FAQ</a></li>
    <li><a href="/about.html">About</a></li>
  </ul>
  <a href="/export.html#enquiry" class="nav-cta">Get Quote</a>
  <div class="hamburger" id="hamburger" onclick="toggleMobileMenu()">
    <span></span><span></span><span></span>
  </div>
</nav>
<div class="mobile-menu" id="mobileMenu">
  <a href="/index.html" onclick="closeMobileMenu()">Home</a>
  <a href="/products/manganese-ore.html" onclick="closeMobileMenu()">Products</a>
  <a href="/export.html" onclick="closeMobileMenu()">Export</a>
  <a href="/faq.html" onclick="closeMobileMenu()">FAQ</a>
  <a href="/about.html" onclick="closeMobileMenu()">About</a>
  <a href="/export.html#enquiry" onclick="closeMobileMenu()">Get a Quote →</a>
</div>
`;

/* ─── FOOTER HTML ─── */
const FOOTER_HTML = `
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <div class="nav-logo-mark" style="width:32px;height:32px;font-size:0.9rem;">BM</div>
          <span style="color:#fff;font-family:'Barlow Condensed',sans-serif;font-size:1.1rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">M/s Balaghat Minerals</span>
        </div>
        <p class="footer-brand-text">Direct manufacturer & global bulk exporter of Manganese Ore, Mn Oxide & MnO₂ from Balaghat, MP, India.</p>
        <p class="footer-brand-text" style="margin-top:10px;">GST: 23XXXXX | IEC: XXXXXXX</p>
      </div>
      <div class="footer-col">
        <div class="footer-col-title">Products</div>
        <a href="/products/manganese-ore.html">Manganese Ore</a>
        <a href="/products/manganese-oxide.html">Manganese Oxide</a>
        <a href="/products/manganese-dioxide.html">Manganese Dioxide</a>
        <a href="/export.html#enquiry">Request COA</a>
      </div>
      <div class="footer-col">
        <div class="footer-col-title">Company</div>
        <a href="/about.html">About Us</a>
        <a href="/export.html">Export Programme</a>
        <a href="/faq.html">FAQ</a>
        <a href="/about.html#certifications">Certifications</a>
      </div>
      <div class="footer-col">
        <div class="footer-col-title">Contact</div>
        <p><i class="fas fa-map-marker-alt" style="color:var(--amber);margin-right:6px;"></i>Balaghat, MP, India – 481001</p>
        <p><i class="fas fa-envelope" style="color:var(--amber);margin-right:6px;"></i>sales@balaghatminerals.com</p>
        <p><i class="fab fa-whatsapp" style="color:var(--amber);margin-right:6px;"></i>Monish Ali — +91 9424317121</p>
      </div>
    </div>
    <div class="footer-bottom">
      <span class="footer-copy">© 2025 M/s Balaghat Minerals. Reliable Partners in Manganese Supply.</span>
      <span class="footer-schema-note">Manufacturer · Exporter · Balaghat · Madhya Pradesh · India</span>
    </div>
  </div>
</footer>
`;

/* ─── INJECT ON DOM READY ─── */
document.addEventListener('DOMContentLoaded', () => {
  document.body.insertAdjacentHTML('afterbegin', NAVBAR_HTML);
  document.body.insertAdjacentHTML('beforeend', FOOTER_HTML);
  highlightActiveNav();
  initChat();
});

function highlightActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') && path.includes(a.getAttribute('href').replace('/','').split('/')[0])) {
      a.classList.add('active');
    }
  });
}

/* ─── MOBILE NAV ─── */
function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}
function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
}

/* ─── CHATBOT ─── */
let chatHistory = [];
let chatOpen = false;
let leadCollected = false;
let leadData = {};

const SYSTEM_PROMPT = `You are "Arjun", the export sales executive at M/s Balaghat Minerals — a manganese ore manufacturer and bulk exporter based in Balaghat, Madhya Pradesh, India.

COMPANY FACTS:
- Products: Manganese Ore (30-44% Mn, lumps/fines), Manganese Oxide (20-55% MnO), Manganese Dioxide/MnO2 (30-80% MnO2)
- Location: Balaghat, MP, India – 481001 (India's top manganese belt)
- Email: sales@balaghatminerals.com | WhatsApp: +91 9424317121
- Capacity: 500+ MT/month
- Export: FCL and LCL worldwide, COA provided with every shipment
- Pricing: Factory-direct (no broker margins), competitive ex-works and CIF pricing
- MOQ: 5 MT for trial orders, 50+ MT for regular contracts
- Payment: TT/LC at sight for export, advance + credit for domestic
- Packaging: 25kg/50kg HDPE bags or bulk jumbo bags
- Lead time: 7-10 days for domestic, 15-21 days for export after LC/advance

YOUR GOAL: Qualify export leads and collect: buyer name, company, country, product needed, quantity/month, destination port. Once collected, tell them the team will contact them within 4 hours.

TONE: Professional, concise, confident. Not pushy. International B2B style. Answer technical questions directly. If asked pricing, give a range and ask for their requirement to give a firm quote.

LEAD COLLECTION: After answering 2-3 questions, naturally ask: "To send you a firm quote, may I know your name, company, and monthly requirement?"

If buyer shares contact info, acknowledge warmly and say: "Perfect — our export desk will reach you within 4 business hours with pricing and availability."`;

function initChat() {
  const greetings = [
    "Hello! I'm Arjun from M/s Balaghat Minerals export desk. How can I help you today? 👋",
    "Looking for bulk manganese? Ask me about pricing, grades, or export terms."
  ];
  setTimeout(() => {
    addBotMessage(greetings[0]);
    setTimeout(() => addBotMessage(greetings[1]), 800);
  }, 500);
}

function toggleChat() {
  chatOpen = !chatOpen;
  const win = document.getElementById('chat-window');
  const badge = document.querySelector('.chat-badge');
  win.classList.toggle('open', chatOpen);
  if (chatOpen && badge) badge.style.display = 'none';
}

function addBotMessage(text) {
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = 'msg bot';
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  chatHistory.push({ role: 'assistant', content: text });
}

function addUserMessage(text) {
  const msgs = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'msg user';
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function showTyping() {
  const msgs = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'msg typing';
  div.id = 'typingIndicator';
  div.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById('typingIndicator');
  if (t) t.remove();
}

function quickSend(text) {
  document.getElementById('quickBtns').style.display = 'none';
  document.getElementById('chatInput').value = text;
  sendMessage();
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  addUserMessage(text);
  chatHistory.push({ role: 'user', content: text });
  showTyping();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatHistory, systemPrompt: SYSTEM_PROMPT })
    });
    const data = await res.json();
    removeTyping();
    const reply = data.reply || "Let me connect you with our export team. Please email sales@balaghatminerals.com";
    addBotMessage(reply);

    // Extract lead if contact info detected
    if (!leadCollected && (text.match(/\d{10,}/) || text.includes('@') || (text.length > 20 && chatHistory.length > 6))) {
      leadCollected = true;
      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation: chatHistory.slice(-10), userMessage: text, timestamp: new Date().toISOString() })
      }).catch(() => {});
    }
  } catch (e) {
    removeTyping();
    addBotMessage("Connection issue. Please WhatsApp us directly: +91 9424317121");
  }
}
