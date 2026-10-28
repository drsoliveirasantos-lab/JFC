#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium, firefox, webkit } from 'playwright';
import { checkProjectGallery } from './project-gallery-checks.js';

const mode = process.argv[2] || 'all';
const root = process.cwd();
const dist = path.join(root, 'dist');
const reportsDir = path.join(root, 'reports');
const shotsDir = path.join(reportsDir, 'screenshots');
fs.mkdirSync(reportsDir, { recursive: true });
fs.mkdirSync(shotsDir, { recursive: true });

const specialties = [{"slug": "cuisine", "label": "Cuisine", "query": "cuisine", "work": "Cuisine"}, {"slug": "plans-de-travail", "label": "Plans de travail", "query": "plan", "work": "Plan de travail"}, {"slug": "salle-de-bain", "label": "Salle de bain", "query": "bain", "work": "Salle de bain"}, {"slug": "douche", "label": "Douche", "query": "douche", "work": "Douche"}, {"slug": "parquet-sols", "label": "Parquet et sols", "query": "sol", "work": "Parquet / sol"}, {"slug": "placo-cloisons", "label": "Placo et cloisons", "query": "cloisons", "work": "Placo / cloison"}, {"slug": "peinture", "label": "Peinture", "query": "peinture", "work": "Peinture"}, {"slug": "petits-travaux", "label": "Petits travaux", "query": "petits-travaux", "work": "Petits travaux"}, {"slug": "finitions", "label": "Finitions", "query": "finitions", "work": "Finitions"}];
const pages = [
  { name: 'home', path: '/', must: ['JFC Renovation', 'Demander un devis'] },
  { name: 'services', path: '/services/', must: ['Des solutions concrètes', 'Cuisine'] },
  { name: 'realisations', path: '/realisations/', must: ['Réalisations', 'Touchez une photo'] },
  { name: 'a-propos', path: '/a-propos/', must: ['Jonatan Ferreira Coelho', 'Artisan'] },
  { name: 'contact', path: '/contact/', must: ['Contacter JFC', 'WhatsApp'] },
  { name: 'devis', path: '/devis/', must: ['Demander un devis', 'WhatsApp'] },
  ...specialties.map(item => ({ name: item.slug, path: `/services/${item.slug}/`, must: [item.label, 'Demander un devis'] }))
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
  if (file.endsWith('.ico')) return 'image/x-icon';
  return 'application/octet-stream';
}
function cleanRequestPath(urlPath) {
  return decodeURIComponent((urlPath || '/').split('?')[0]);
}
function safeResolve(urlPath) {
  const clean = cleanRequestPath(urlPath);
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
    const clean = cleanRequestPath(req.url);
    if (clean === '/favicon.ico') {
      res.writeHead(204, { 'cache-control': 'no-store' });
      res.end();
      return;
    }
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
function isIgnoredConsoleError(text) {
  return /favicon\.ico/i.test(text) || /ResizeObserver loop/i.test(text);
}
async function browserVisit(browserType, viewport, label, checks = {}) {
  const failures = [];
  const lines = [];
  const server = await startServer();
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[${label}] launching browser`);
  const browser = await browserType.launch({ headless: true });
  const watchdog = setTimeout(() => { console.error(`[${label}] browser suite exceeded 4 minutes; last progress line identifies the pending operation`); process.exit(1); }, 240000);
  try {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: !!viewport.isMobile, deviceScaleFactor: viewport.isMobile ? 2 : 1, userAgent: viewport.userAgent });
    context.setDefaultTimeout(10000);
    context.setDefaultNavigationTimeout(15000);
    for (const route of pages) {
      console.log(`[${label}] page ${route.path}`);
      const page = await context.newPage();
      const consoleErrors = [];
      page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error' && !isIgnoredConsoleError(text)) consoleErrors.push(text);
      });
      page.on('pageerror', error => consoleErrors.push(`pageerror: ${error.message}`));
      try {
        const response = await page.goto(`${baseUrl}${route.path}?test=${label}`, { waitUntil: 'networkidle', timeout: 30000 });
        assert(response && response.ok(), `${label} ${route.path} HTTP not OK`, failures);
        for (const photo of await page.locator('img[loading="lazy"]').all()) {
          await photo.scrollIntoViewIfNeeded();
          // Firefox can reject decode() before a lazy request starts after scrolling.
          // Wait for actual loaded pixels; broken/missing images still fail this check.
          await page.waitForFunction(image => image.complete && image.naturalWidth > 0, await photo.elementHandle(), { timeout: 10000 });
        }
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
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
            croppedPhotos: [...document.images].filter(img => img.src.includes("/assets/photos/") && getComputedStyle(img).objectFit !== "contain").map(img => img.getAttribute("src")),
            emptyLinks,
            usefulMicrotext: [...document.querySelectorAll('.brand small,.hero .kicker,.hero-frame small')].map(el => parseFloat(getComputedStyle(el).fontSize)),
            overflow,
            navLinks: [...document.querySelectorAll('nav a')].map(a => a.getAttribute('href')).filter(Boolean),
            hasMain: !!document.querySelector('main'),
            hasPhone: visibleText.includes('06 07 72 16 33') || !!document.querySelector('a[href^="tel:"]'),
            hasWhatsapp: !!document.querySelector('a[href*="wa.me"], a[href^="whatsapp://"]'),
            text: visibleText
          };
        });
        assert(metrics.usefulMicrotext.every(size => size >= 12), `${label} ${route.path} useful microtext below 12px`, failures);
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
        assert(metrics.croppedPhotos.length === 0, `${label} ${route.path} photos must preserve full framing: ${metrics.croppedPhotos}`, failures);
        for (const text of route.must) assert(metrics.text.includes(text), `${label} ${route.path} missing visible text: ${text}`, failures);
        lines.push(`${label} ${route.path} OK images=${metrics.brokenImages.length === 0 ? 'ok' : 'broken'} overflow=${metrics.overflow}px`);
      } catch (error) {
        fail(`${label} ${route.path} threw: ${error?.message || error}`, failures);
      } finally {
        await page.close().catch(() => {});
      }
    }
    await checkSpecialtyRoutes(context, baseUrl, lines, failures);
    await checkProjectGallery(context, baseUrl, lines, failures);
    const uiPage = await context.newPage();
    try {
      await uiPage.goto(`${baseUrl}/devis/`, { waitUntil: 'networkidle' });
      if (viewport.width <= 900) {
        await uiPage.click('.menu-toggle');
        assert(await uiPage.getAttribute('.menu-toggle', 'aria-expanded') === 'true', 'mobile menu did not open', failures);
        assert(await uiPage.locator('#navigation a').count() === 5, 'mobile menu must retain five routes', failures);
        await uiPage.keyboard.press('Escape');
        assert(await uiPage.getAttribute('.menu-toggle', 'aria-expanded') === 'false', 'Escape did not close menu', failures);
        await uiPage.click('.menu-toggle');
        await uiPage.locator('#navigation a[href="/services/"]').click();
        await uiPage.waitForURL('**/services/');
        await uiPage.goto(`${baseUrl}/devis/`, { waitUntil: 'networkidle' });
        lines.push('mobile menu: open, Escape, route navigation OK');
      }
      const fieldContrast = await uiPage.locator('#quoteEmail').evaluate(input => {
        const style = getComputedStyle(input);
        const luminance = value => {
          const c = value.match(/[\d.]+/g).slice(0, 3).map(Number).map(n => n / 255).map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4);
          return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
        };
        const values = [luminance(style.borderTopColor), luminance(style.backgroundColor)].sort((a, b) => a - b);
        return (values[1] + .05) / (values[0] + .05);
      });
      assert(fieldContrast >= 3, `form boundary contrast below 3:1 (${fieldContrast.toFixed(2)})`, failures);
      assert(await uiPage.locator('[data-work]:checked').count() === 0, 'generic quote must not impose Cuisine', failures);
      await uiPage.click('#quotePreviewButton');
      assert(await uiPage.locator('#quotePreviewModal').isHidden(), 'empty quote must not open preview', failures);
      assert(await uiPage.locator('#quoteWorkError').isVisible(), 'empty quote needs a project error', failures);
      await uiPage.evaluate(() => document.addEventListener('click', event => {
        if (event.target.closest('#quickEmail')) {
          window.quoteEmailWasBlocked = event.defaultPrevented;
          event.preventDefault(); // Never launch an email client during tests.
        }
      }));
      await uiPage.click('#quickEmail');
      assert(await uiPage.evaluate(() => window.quoteEmailWasBlocked), 'quick email bypasses empty quote validation', failures);
      await uiPage.fill('#quoteDetails', 'Rénovation à préciser');
      await uiPage.fill('#quotePhone', 'abc');
      await uiPage.fill('#quoteEmail', 'pas-un-email');
      await uiPage.click('#quotePreviewButton');
      assert(await uiPage.locator('#quotePreviewModal').isHidden(), 'invalid contact must not open preview', failures);
      assert(await uiPage.getAttribute('#quoteEmail', 'aria-invalid') === 'true', 'invalid email needs an associated error', failures);
      assert(await uiPage.getAttribute('#quotePhone', 'aria-invalid') === 'true', 'invalid phone needs an associated error', failures);
      await uiPage.click('#quickEmail');
      assert(await uiPage.evaluate(() => window.quoteEmailWasBlocked), 'quick email bypasses invalid contact validation', failures);
      await uiPage.fill('#quotePhone', '');
      await uiPage.fill('#quoteEmail', '');
      await uiPage.click('#quotePreviewButton');
      assert(await uiPage.locator('#quotePreviewModal').isVisible(), 'contact fields must remain optional for a described project', failures);
      await uiPage.keyboard.press('Escape');
      await uiPage.click('#quickEmail');
      assert(!await uiPage.evaluate(() => window.quoteEmailWasBlocked), 'valid quick email should remain available', failures);
      await uiPage.goto(`${baseUrl}/services/`, { waitUntil: 'networkidle' });
      await uiPage.locator('.service-grid a[href="/services/parquet-sols/"]').click();
      await uiPage.locator('.specialty-quote').first().click();
      await uiPage.waitForURL('**/devis/?travaux=sol');
      assert(await uiPage.locator('[data-work][value="Parquet / sol"]').isChecked(), 'floor CTA must select Parquet / sol', failures);
      assert(!await uiPage.locator('[data-work][value="Cuisine"]').isChecked(), 'floor CTA must not select Cuisine', failures);
      await uiPage.goto(`${baseUrl}/devis/?travaux=inconnu`, { waitUntil: 'networkidle' });
      assert(await uiPage.locator('[data-work]:checked').count() === 0, 'unknown service query must not select a work type', failures);
      lines.push('quote audit regressions: empty/invalid blocked on preview and email, optional contact retained, floor context preserved');
      await uiPage.fill('#quoteName', 'Test rénovation');
      await uiPage.fill('#quoteCity', 'Ville test');
      await uiPage.fill('#quoteEmail', 'test@example.com');
      await uiPage.fill('#quoteDetails', 'Cuisine & finitions — demande de test');
      await uiPage.click('.multi-dropdown summary');
      await uiPage.check('[data-work][value="Salle de bain"]');
      await uiPage.click('#quotePreviewButton');
      assert(await uiPage.locator('#quotePreviewModal').isVisible(), 'quote preview did not open', failures);
      assert((await uiPage.textContent('[data-summary="travaux"]')).includes('Salle de bain'), 'quote lost selected work', failures);
      const wa = new URL(await uiPage.getAttribute('#quoteWhatsapp', 'href'));
      assert(wa.searchParams.get('phone') === '33607721633', 'quote WhatsApp recipient changed', failures);
      assert(wa.searchParams.get('text')?.includes('Cuisine & finitions — demande de test'), 'quote WhatsApp text incomplete', failures);
      const mail = await uiPage.getAttribute('#quoteEmailButton', 'href');
      assert(mail.startsWith('mailto:jonatanfc97@gmail.com?') && decodeURIComponent(mail).includes('Ville test'), 'quote email recipient or body incorrect', failures);
      await uiPage.locator('.quote-back').click();
      assert(await uiPage.locator('#quotePreviewModal').isHidden(), 'quote back did not close preview', failures);
      assert(await uiPage.inputValue('#quoteName') === 'Test rénovation', 'quote back lost form values', failures);
      await uiPage.click('#quotePreviewButton');
      await uiPage.keyboard.press('Escape');
      assert(await uiPage.locator('#quotePreviewModal').isHidden(), 'quote Escape did not close preview', failures);
      lines.push('quote: multiple works, preview, encoded WhatsApp/email, back/edit and Escape OK (no message sent)');
    } catch (error) { fail(`menu/quote regression: ${error.message}`, failures); }
    finally { await uiPage.close(); }
    const zoomMenu = await context.newPage();
    try {
      await zoomMenu.setViewportSize({ width: 844, height: 390 });
      for (const route of ['/contact/', '/devis/']) {
        await zoomMenu.goto(baseUrl, { waitUntil: 'networkidle' });
        await zoomMenu.addStyleTag({ content: 'html{font-size:200%}' });
        await zoomMenu.click('.menu-toggle');
        const link = zoomMenu.locator(`#navigation a[href="${route}"]`);
        await link.scrollIntoViewIfNeeded();
        const box = await link.boundingBox();
        assert(box && box.y >= 0 && box.y + box.height <= 390, `landscape 200% ${route} outside viewport`, failures);
        if (route === '/devis/') await zoomMenu.screenshot({ path: path.join(shotsDir, `${label}-lot1-landscape-menu.png`) });
        await link.click({ timeout: 5000 });
        assert(new URL(zoomMenu.url()).pathname === route, `landscape 200% ${route} navigation failed`, failures);
      }
      lines.push('landscape 844x390 text 200%: Contact and Devis visible, clickable and navigable');
      await zoomMenu.setViewportSize({ width: 320, height: 844 });
      for (const route of ['/realisations/', '/devis/']) {
        await zoomMenu.goto(baseUrl + route, { waitUntil: 'networkidle' });
        await zoomMenu.addStyleTag({ content: 'html{font-size:200%}' });
        const overflow = await zoomMenu.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        assert(overflow === 0, `320px text 200% ${route} overflow ${overflow}px`, failures);
      }
      lines.push('320px text 200%: gallery and quote headings wrap without overflow');
    } catch (error) { fail(`landscape enlarged menu: ${error.message}`, failures); }
    finally { await zoomMenu.close(); }
    console.log(`[${label}] closing context`);
    await context.close();
    console.log(`[${label}] context closed`);
    if (checks.carousel) {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
      try {
        await page.goto(`${baseUrl}/?test=carousel`, { waitUntil: 'networkidle' });
        const first = await page.textContent('#slide');
        await page.waitForTimeout(3900);
        const second = await page.textContent('#slide');
        assert(first !== second, 'home carousel label did not change', failures);
        lines.push('carousel OK');
      } catch (error) {
        fail(`carousel threw: ${error?.message || error}`, failures);
      } finally {
        await page.close().catch(() => {});
      }
    }
  } finally {
    console.log(`[${label}] closing browser`);
    await browser.close();
    clearTimeout(watchdog);
    server.close();
    console.log(`[${label}] browser closed`);
  }
  return { lines, failures };
}


async function checkSpecialtyRoutes(context, baseUrl, lines, failures) {
  const page = await context.newPage();
  try {
    for (const item of specialties) {
      const route = `/services/${item.slug}/`;
      console.log(`[specialty] ${route}: quote and return`);
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
      assert(await page.locator('.specialty-links [aria-current="page"]').getAttribute('href') === route, `${route} current specialty incorrect`, failures);
      await page.locator('.specialty-quote').first().click();
      await page.waitForURL(`**/devis/?travaux=${item.query}`);
      const checked = await page.locator('[data-work]:checked').evaluateAll(inputs => inputs.map(input => input.value));
      assert(checked.length === 1 && checked[0] === item.work, `${route} wrong quote selection ${checked}`, failures);
      await page.goBack({ waitUntil: 'networkidle' });
      assert(new URL(page.url()).pathname === route, `${route} back navigation lost`, failures);
      await page.locator('.specialty-hero a[href="/services/"]').click();
      await page.waitForURL('**/services/');
      await page.locator(`.service-grid a[href="${route}"]`).click();
      await page.waitForURL(`**${route}`);
      for (const [width,height,scale] of [[320,740,100],[390,844,100],[320,740,200],[844,390,200]]) {
        await page.setViewportSize({ width,height });
        await page.evaluate(scale => document.documentElement.style.fontSize = `${scale}%`, scale);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        assert(overflow <= 1, `${route} overflow ${overflow}px at ${width}/${scale}%`, failures);
        assert(await page.locator('.specialty-picker').isVisible(), `${route} mobile specialty picker missing`, failures);
      }
      await page.evaluate(() => document.documentElement.style.fontSize = '100%');
      await page.setViewportSize({width:390,height:844});
      console.log(`[specialty] ${route}: mobile keyboard picker`);
      await page.selectOption('#specialty-choice', '/services/');
      assert(new URL(page.url()).pathname === route, `${route} selection navigated without confirmation`, failures);
      await page.locator('#specialty-choice').focus();
      await page.keyboard.press('Tab');
      assert(await page.locator('.specialty-picker button').evaluate(button => button === document.activeElement), `${route} picker keyboard order broken`, failures);
      await page.keyboard.press('Enter');
      await page.waitForURL('**/services/');
      await page.setViewportSize({width:1440,height:1000});
      console.log(`[specialty] ${route}: desktop keyboard link`);
      const tab = page.locator(`.specialty-links a[href="${route}"]`);
      await tab.focus(); await page.keyboard.press('Enter');
      await page.waitForURL(`**${route}`);
      await page.reload({ waitUntil: 'networkidle' });
      assert(await page.locator('h1').textContent() === `${item.label}.`, `${route} deep link reload incorrect`, failures);
    }
    console.log('[specialty] no-JavaScript navigation');
    const noJs = await context.browser().newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 740 } });
    try {
      noJs.setDefaultTimeout(10000); noJs.setDefaultNavigationTimeout(15000);
      const fallback = await noJs.newPage();
      await fallback.goto(`${baseUrl}/services/`);
      for (const item of specialties) assert(await fallback.locator(`.specialty-links a[href="/services/${item.slug}/"]`).isVisible(), `no-JS link missing: ${item.slug}`, failures);
      await fallback.locator('.specialty-links a[href="/services/cuisine/"]').click();
      await fallback.waitForURL('**/services/cuisine/');
    } finally { console.log('[specialty] closing no-JavaScript context'); await noJs.close(); console.log('[specialty] no-JavaScript context closed'); }
    lines.push('specialties: nine direct pages, index/back/reload, keyboard links/picker, nine quote categories, 320/390/landscape 200%, no-JS navigation OK');
  } catch(error) { fail(`specialty navigation threw: ${error.message}`, failures); }
  finally { await page.close(); }
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
