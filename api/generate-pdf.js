// api/generate-pdf.js — Vercel Serverless Function
// Generates pixel-perfect PDF of corporate-profile.html using Puppeteer

import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export const config = {
  maxDuration: 60,
  memory: 1024,
};

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let browser = null;

  try {
    const { url } = req.body;

    // Validate URL — must be same domain
    const allowedOrigins = [
      'https://balaghat-minerals.vercel.app',
      'https://www.balaghatminerals.com',
      'http://localhost:3000',
    ];
    const targetUrl = url || 'https://balaghat-minerals.vercel.app/corporate-profile.html';
    const urlObj = new URL(targetUrl);
    const isAllowed = allowedOrigins.some(o => targetUrl.startsWith(o));
    if (!isAllowed) {
      return res.status(403).json({ error: 'URL not allowed' });
    }

    // Launch Chromium
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // Set viewport for A4
    await page.setViewport({ width: 1200, height: 900, deviceScaleFactor: 1.5 });

    // Navigate and wait for all images/fonts
    await page.goto(targetUrl, {
      waitUntil: 'networkidle0',
      timeout: 45000,
    });

    // Wait for fonts and animations to settle
    await page.waitForTimeout(2000);

    // Inject print-specific overrides to make PDF look perfect
    await page.evaluate(() => {
      // Remove navbar, footer, FAB
      document.querySelectorAll('.navbar, .mobile-menu, .site-footer, .wa-float, #chat-launcher, #chat-window, .cp-fab, .no-print').forEach(el => {
        el.style.display = 'none';
      });

      // Force all animations to completed state
      document.querySelectorAll('[style*="opacity: 0"]').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });

      // Make sure images are visible
      document.querySelectorAll('img').forEach(img => {
        img.style.display = 'block';
      });
    });

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: false,
      displayHeaderFooter: false,
    });

    await browser.close();
    browser = null;

    // Return PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Balaghat-Minerals-Corporate-Profile.pdf"');
    res.setHeader('Content-Length', pdf.length);
    res.status(200).end(pdf);

  } catch (error) {
    if (browser) {
      try { await browser.close(); } catch(e) {}
    }
    console.error('PDF generation error:', error);
    res.status(500).json({
      error: 'PDF generation failed',
      message: error.message,
    });
  }
}
