#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium, firefox, webkit } from 'playwright';

const mode = process.argv[2] || 'all';
const root = process.cwd();
const dist = path.join(root, 'dist');
const reportsDir = path.join(root, 'reports');
const shotsDir = path.join(reportsDir, 'screenshots');
fs.mkdirSync(reportsDir, { recursive: true });
fs.mkdirSync(shotsDir, { recursive: true });

const pages = [
  { name: 'home', path: '/', must: ['JFC Renovation', 'Demander un devis'] },
  { name: 'services', path: '/services/', must: ['Services', 'Cuisine'] },
  { name: 'realisations', path: '/realisations/', must: ['Realisations', 'Touchez une photo'] },
  { name: 'a-propos', path: '/a-propos/', must: ['Jonatan Ferreira Coelho', 'Artisan'] },
  { name: 'contact', path: '/contact/', must: ['Contacter JFC', 'WhatsApp'] },
  { name: 'devis', path: '/devis/', must: ['Demander un devis', 'WhatsApp'] }
];

function fail(msg, failures) { failures.push(msg); }
function assert(ok, msg, failures) { if (!ok) fail(msg, failures); }
function read(file) { return fs.readFileSync(file, 'utf8'); }
function exists(file) { return fs.existsSync(file); }
function pageFile(route) { return route === '/' ? path.join(dist, 'index.html') : path.join(dist, route.replace(/^\//, ''), 'index.html'); }
function reportPath(name) { return path.join(reportsDir, `${name}.txt`); }
function writeReport(name, lines, failures) {
  const out = [`JFC ${name}`, '', ...lines, '', failures.length ? 'Failures:' : 'Failures: none', ...failures.map(f => `- ${f}`)].join('\n');
  fs.writeFileSync(reportPath(name), `${out}\n`);
  console.log(out);
  if (failures.length) process.exitCode = 1;
}
function contentType(file) {
  if (file.endsWith('.html')) return 'text/html; charset=utf-8';
  if (file.endsWith('.css')) return 'text/css; charset=utf-8';
  if (file.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (file.endsWith('.webp')) return 'image/webp';
  if (file.endsWith('.svg')) return 'image/svg+xml';
  if (file.endsWith('.png')) return 'image/png';
  if (file.endsWith('.jpg') || file.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
}
function safeResolve(urlPath) {
  const clean = decodeURIComponent((urlPath || '/').split('?')[0]);
  const rel = clean === '/' ? 'index.html' : clean.replace(/^\//, '');
  let filePath = path.join(dist, rel);
  if (exists(filePath) && fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
  if (!exists(filePath)) filePath = path.join(dist, rel, 'index.html');
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(dist))) return null;
  return resolved;
}
function startServer() {
  const server = http.createServer((req, res) => {
    const resolved = safeResolve(req.url);
    if (!resolved || !exists(resolved) || !fs.statSync(resolved).isFile()) {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'content-type': contentType(resolved), 'cache-control': 'no-store' });
    fs.createReadStream(resolved).pipe(res);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}
function localRefToFile(ref, fromRoute = '/') {
  if (!ref || ref.startsWith('#') || ref.startsWith('tel:') || ref.startsWith('mailto:') || ref.startsWith('https://wa.me') || ref.startsWith('whatsapp://')) return null;
  if (/^(https?:)?\/\//i.test(ref) || ref.startsWith('data:')) return null;
  const clean = ref.split('?')[0].split('#')[0];
  if (!clean) return null;
  if (clean.startsWith('/')) {
    const rel = clean.replace(/^\//, '');
    let f = path.join(dist, rel);
    if (clean.endsWith('/')) f = path.join(dist, rel, 'index.html');
    return f;
  }
  const baseDir = fromRoute === '/' ? dist : path.dirname(pageFile(fromRoute));
  return path.join(baseDir, clean);
}
async function browserVisit(browserType, viewport, label, checks = {}) {
  const failures = [];
  const lines = [];
  const server = await startServer();
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  const browser = await browserType.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: !!viewport.isMobile, deviceScaleFactor: viewport.isMobile ? 2 : 1, userAgent: viewport.userAgent });
    for (const route of pages) {
      const page = await context.newPage();
      const consoleErrors = [];
      page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
      const response = await page.goto(`${baseUrl}${route.path}?test=${label}`, { waitUntil: 'networkidle', timeout: 30000 });
      assert(response && response.ok(), `${label} ${route.path} HTTP not OK`, failures);
      await page.screenshot({ path: path.join(shotsDir, `${label}-${route.name}.png`), fullPage: true });
      const metrics = await page.evaluate(() => {
        const brokenImages = [...document.images].filter(img => !img.complete || img.naturalWidth === 0).map(img => img.getAttribute('src'));
        const imageAltMissing = [...document.images].filter(img => !img.getAttribute('alt')).map(img => img.getAttribute('src'));
        const emptyLinks = [...document.querySelectorAll('a')].filter(a => !(a.textContent || '').trim() && !a.getAttribute('aria-label')).map(a => a.getAttribute('href'));
        const overflow = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
        const visibleText = document.body.innerText || '';
        return {
          title: document.title,
          brokenImages,
          imageAltMissing,
          emptyLinks,
          overflow,
          navLinks: [...document.querySelectorAll('nav a')].map(a => a.getAttribute('href')).filter(Boolean),
          hasMain: !!document.querySelector('main'),
          hasPhone: visibleText.includes('06 07 72 16 33') || !!document.querySelector('a[href^="tel:"]'),
          hasWhatsapp: !!document.querySelector('a[href*="wa.me"], a[href^="whatsapp://"]'),
          text: visibleText
        };
      });
      assert(metrics.title.length > 0, `${label} ${route.path} missing title`, failures);
      assert(metrics.hasMain, `${label} ${route.path} missing main`, failures);
      assert(metrics.brokenImages.length === 0, `${label} ${route.path} broken images: ${metrics.brokenImages.join(', ')}`, failures);
      assert(metrics.imageAltMissing.length === 0, `${label} ${route.path} images missing alt`, failures);
      assert(metrics.emptyLinks.length === 0, `${label} ${route.path} empty links`, failures);
      assert(metrics.overflow <= 12, `${label} ${route.path} horizontal overflow ${metrics.overflow}px`, failures);
      assert(!metrics.navLinks.includes('/avant-apres/'), `${label} ${route.path} still links to avant-apres`, failures);
      assert(metrics.hasPhone, `${label} ${route.path} missing phone`, failures);
      assert(metrics.hasWhatsapp, `${label} ${route.path} missing WhatsApp`, failures);
      assert(consoleErrors.length === 0, `${label} ${route.path} console errors: ${consoleErrors.join(' | ')}`, failures);
      for (const text of route.must) assert(metrics.text.includes(text), `${label} ${route.path} missing visible text: ${text}`, failures);
      lines.push(`${label} ${route.path} OK images=${metrics.brokenImages.length === 0 ? 'ok' : 'broken'} overflow=${metrics.overflow}px`);
      await page.close();
    }
    await context.close();
    if (checks.lightbox) {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
      await page.goto(`${baseUrl}/realisations/?test=lightbox`, { waitUntil: 'networkidle' });
      await page.click('.js-lightbox');
      await page.waitForSelector('.lightbox.open', { timeout: 5000 });
      const openSrc = await page.$eval('#lightboxImg', el => el.getAttribute('src'));
      assert(!!openSrc, 'lightbox opens without image source', failures);
      await page.click('#lightboxClose');
      await page.waitForFunction(() => !document.querySelector('.lightbox')?.classList.contains('open'));
      lines.push('lightbox OK');
      await page.close();
    }
    if (checks.carousel) {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
      await page.goto(`${baseUrl}/?test=carousel`, { waitUntil: 'networkidle' });
      const first = await page.textContent('#slide');
      await page.waitForTimeout(3900);
      const second = await page.textContent('#slide');
      assert(first !== second, 'home carousel label did not change', failures);
      lines.push('carousel OK');
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
  return { lines, failures };
}

async function runStatic() {
  const failures = [];
  const lines = [];
  assert(exists(dist), 'dist folder missing; run npm run build first', failures);
  for (const route of pages) {
    const f = pageFile(route.path);
    assert(exists(f), `missing page output ${route.path}`, failures);
    if (exists(f)) {
      const html = read(f);
      assert(html.includes('<main'), `${route.path} missing main`, failures);
      assert(!html.includes('/avant-apres/'), `${route.path} contains removed avant-apres link`, failures);
      assert(!html.includes('homme à tout faire') && !html.includes('homme a tout faire'), `${route.path} contains old positioning`, failures);
      const refs = [...html.matchAll(/(?:href|src)=["']([^"']+)["']/g)].map(m => m[1]);
      for (const ref of refs) {
        const file = localRefToFile(ref, route.path);
        if (file) assert(exists(file), `${route.path} references missing file ${ref}`, failures);
      }
      if (html.includes('wa.me')) assert(html.includes('/assets/whatsapp-direct.js'), `${route.path} has WhatsApp but no direct-open script`, failures);
      lines.push(`${route.path} static OK`);
    }
  }
  const pkg = JSON.parse(read(path.join(root, 'package.json')));
  assert(pkg.scripts?.build?.includes('assets'), 'build script must copy assets', failures);
  assert(exists(path.join(dist, 'assets/whatsapp-direct.js')), 'WhatsApp direct script missing from dist', failures);
  assert(exists(path.join(dist, 'assets/photos')), 'photos folder missing from dist', failures);
  writeReport('static-data-quality-validation', lines, failures);
}
async function runBrowser(name, browserType, viewport, checks = {}) {
  const result = await browserVisit(browserType, viewport, name, checks);
  writeReport(name, result.lines, result.failures);
}
async function runLot3() {
  const allLines = [];
  const allFailures = [];
  for (const [name, type] of [['chromium', chromium], ['firefox', firefox], ['webkit', webkit]]) {
    const r = await browserVisit(type, { width: 1280, height: 900, isMobile: false }, `lot3-${name}`);
    allLines.push(...r.lines);
    allFailures.push(...r.failures);
  }
  writeReport('browser-lot3-hardening', allLines, allFailures);
}

if (mode === 'static') await runStatic();
else if (mode === 'desktop-core') await runBrowser('desktop-core', chromium, { width: 1440, height: 1000, isMobile: false });
else if (mode === 'mobile-critical') await runBrowser('mobile-safari-shape', webkit, { width: 390, height: 844, isMobile: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' });
else if (mode === 'deployed-visual-a11y') await runBrowser('deployed-visual-a11y', chromium, { width: 390, height: 844, isMobile: true });
else if (mode === 'lot2-visible-features') await runBrowser('lot2-visible-features', chromium, { width: 390, height: 844, isMobile: true }, { lightbox: true, carousel: true });
else if (mode === 'lot3-hardening') await runLot3();
else {
  await runStatic();
  await runBrowser('desktop-core', chromium, { width: 1440, height: 1000, isMobile: false });
  await runBrowser('mobile-safari-shape', webkit, { width: 390, height: 844, isMobile: true });
  await runBrowser('deployed-visual-a11y', chromium, { width: 390, height: 844, isMobile: true });
  await runBrowser('lot2-visible-features', chromium, { width: 390, height: 844, isMobile: true }, { lightbox: true, carousel: true });
  await runLot3();
}
