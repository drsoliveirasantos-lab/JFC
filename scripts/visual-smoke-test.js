#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';

const root = process.cwd();
const dist = path.join(root, 'dist');
const reportsDir = path.join(root, 'reports');
const shotsDir = path.join(reportsDir, 'screenshots');
fs.mkdirSync(shotsDir, { recursive: true });

const pages = [
  { name: 'home', path: '/' },
  { name: 'services', path: '/services/' },
  { name: 'realisations', path: '/realisations/' },
  { name: 'avant-apres', path: '/avant-apres/' },
  { name: 'a-propos', path: '/a-propos/' },
  { name: 'contact', path: '/contact/' },
  { name: 'devis', path: '/devis/' }
];

const viewports = [
  { name: 'mobile', width: 390, height: 844, isMobile: true },
  { name: 'desktop', width: 1440, height: 1000, isMobile: false }
];

function contentType(file) {
  if (file.endsWith('.html')) return 'text/html; charset=utf-8';
  if (file.endsWith('.css')) return 'text/css; charset=utf-8';
  if (file.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (file.endsWith('.webp')) return 'image/webp';
  if (file.endsWith('.png')) return 'image/png';
  if (file.endsWith('.jpg') || file.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
}

function safeResolve(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  const rel = clean === '/' ? 'index.html' : clean.replace(/^\//, '');
  let filePath = path.join(dist, rel);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
  if (!fs.existsSync(filePath)) filePath = path.join(dist, rel, 'index.html');
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(dist))) return null;
  return resolved;
}

function startServer() {
  const server = http.createServer((req, res) => {
    const resolved = safeResolve(req.url || '/');
    if (!resolved || !fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'content-type': contentType(resolved), 'cache-control': 'no-store' });
    fs.createReadStream(resolved).pipe(res);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

function assert(condition, message, failures) {
  if (!condition) failures.push(message);
}

const server = await startServer();
const port = server.address().port;
const baseUrl = `http://127.0.0.1:${port}`;
const browser = await chromium.launch({ headless: true });
const failures = [];
const report = [];

try {
  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, deviceScaleFactor: vp.isMobile ? 2 : 1 });
    for (const route of pages) {
      const page = await context.newPage();
      const consoleErrors = [];
      page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
      const response = await page.goto(`${baseUrl}${route.path}?visual-test=1`, { waitUntil: 'networkidle', timeout: 30000 });
      assert(response && response.ok(), `${vp.name} ${route.path} did not return HTTP 200`, failures);
      await page.screenshot({ path: path.join(shotsDir, `${vp.name}-${route.name}.png`), fullPage: true });

      const metrics = await page.evaluate(() => {
        const brokenImages = [...document.images].filter(img => !img.complete || img.naturalWidth === 0).map(img => img.getAttribute('src'));
        const overflow = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
        const navLinks = [...document.querySelectorAll('nav a')].map(a => a.textContent?.trim()).filter(Boolean);
        const visibleText = document.body.innerText || '';
        return {
          title: document.title,
          imageCount: document.images.length,
          brokenImages,
          overflow,
          navLinks,
          hasPhone: visibleText.includes('06 07 72 16 33') || !!document.querySelector('a[href^="tel:"]'),
          hasWhatsapp: !!document.querySelector('a[href*="wa.me"]'),
          hasMain: !!document.querySelector('main')
        };
      });

      assert(metrics.title.length > 0, `${vp.name} ${route.path} has no title`, failures);
      assert(metrics.hasMain, `${vp.name} ${route.path} has no main element`, failures);
      assert(metrics.brokenImages.length === 0, `${vp.name} ${route.path} has broken images: ${metrics.brokenImages.join(', ')}`, failures);
      assert(metrics.overflow <= 8, `${vp.name} ${route.path} has horizontal overflow of ${metrics.overflow}px`, failures);
      assert(metrics.navLinks.length >= 5, `${vp.name} ${route.path} navigation is incomplete`, failures);
      assert(metrics.hasPhone, `${vp.name} ${route.path} has no visible phone/tel link`, failures);
      assert(metrics.hasWhatsapp, `${vp.name} ${route.path} has no WhatsApp link`, failures);
      assert(consoleErrors.length === 0, `${vp.name} ${route.path} console errors: ${consoleErrors.join(' | ')}`, failures);

      report.push(`${vp.name} ${route.path} OK - images=${metrics.imageCount}, overflow=${metrics.overflow}px`);
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}

const reportText = [
  'JFC visual smoke test report',
  `Base URL: ${baseUrl}`,
  `Screenshots: reports/screenshots`,
  '',
  ...report,
  '',
  failures.length ? 'Failures:' : 'Failures: none',
  ...failures.map(item => ` - ${item}`)
].join('\n');
fs.writeFileSync(path.join(reportsDir, 'visual-smoke-test-report.txt'), `${reportText}\n`);
console.log(reportText);
if (failures.length) process.exit(1);
