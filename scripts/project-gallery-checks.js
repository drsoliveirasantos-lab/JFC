// Shared functional checks called by the consolidated runner and local visual review.
export async function checkProjectGallery(context, baseUrl, lines, failures) {
  const page = await context.newPage();
  page.setDefaultTimeout(10000); page.setDefaultNavigationTimeout(15000);
  const descriptions = new Map();
  const routes = ['/realisations/', '/services/cuisine/', '/services/plans-de-travail/', '/services/salle-de-bain/', '/services/douche/'];
  const check = (ok, message) => { if (!ok) failures.push(message); };
  try {
    for (const [width,height,scale] of [[1440,1000,100],[390,844,100],[320,740,100],[844,390,200]]) {
      console.log(`[gallery] ${width}x${height} text ${scale}%`);
      await page.setViewportSize({width,height});
      await page.goto(`${baseUrl}/realisations/`, {waitUntil:'networkidle'});
      await page.evaluate(scale => document.documentElement.style.fontSize=`${scale}%`,scale);
      for (const [filter,count] of [['cuisine',7],['bain',2],['buanderie',1],['tout',10],['bain',2],['tout',10]]) {
        const button=page.locator(`[data-filter="${filter}"]`);
        await button.focus(); await page.keyboard.press('Space');
        check(await page.locator('.project:visible').count()===count, `${width}: filter ${filter} wrong count`);
        check(await button.getAttribute('aria-pressed')==='true',`${width}: filter ${filter} state`);
        check((await page.locator('#galleryResult').textContent()).startsWith(String(count)),`${width}: filter ${filter} announcement`);
        const categories=await page.locator('.project:visible').evaluateAll(cards=>cards.map(card=>card.dataset.category));
        check(filter==='tout'||categories.every(c=>c===filter),`${width}: filter mixes categories`);
        await page.locator('.project:visible .js-lightbox').first().click();
        await page.keyboard.press('Escape');
        check(await button.getAttribute('aria-pressed')==='true'&&await page.locator('.project:visible').count()===count,`${width}: close lost filter`);
      }
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}: filter overflow at ${scale}%`);
      await page.locator('[data-filter="buanderie"]').click();
      await page.reload({waitUntil:'networkidle'});
      check(await page.locator('.project:visible').count()===1 && await page.locator('[data-filter="buanderie"]').getAttribute('aria-pressed')==='true',`${width}: reload lost filter`);
      await page.goto(`${baseUrl}/contact/`, {waitUntil:'networkidle'});
      await page.goBack({waitUntil:'networkidle'});
      check(await page.locator('.project:visible').count()===1 && await page.locator('[data-filter="buanderie"]').getAttribute('aria-pressed')==='true',`${width}: browser back lost filter`);
      for (const route of routes) {
        await page.goto(baseUrl+route,{waitUntil:'networkidle'});
        await page.evaluate(scale=>document.documentElement.style.fontSize=`${scale}%`,scale);
        const links=page.locator('.js-lightbox');
        for (let index=0;index<await links.count();index++) {
          const link=links.nth(index),source=await link.getAttribute('href');
          await link.click();
          await page.waitForFunction(()=>{const i=document.getElementById('lightboxImg');return i.complete&&i.naturalWidth>0;});
          const text=await page.locator('#lightboxDescription').textContent();
          check(text.length>70,`${source}: description missing`);
          check(await page.locator('#lightboxImg').getAttribute('src')===source,`${source}: wrong opened image`);
          if(descriptions.has(source))check(descriptions.get(source)===text,`${source}: description inconsistent across usages`);
          descriptions.set(source,text);
          check(source.endsWith('/salle-bain-vasque.webp')===text.includes('La baignoire était déjà présente.'),`${source}: bathroom user facts misattributed`);
          if(source.endsWith('/buanderie-plan-travail.webp'))check(text.includes('lave-linge')&&text.includes('espace existant'),`${source}: laundry context lost`);
          const boxes=await page.evaluate(()=>{
            const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
            return {image:box('#lightboxImg'),close:box('#lightboxClose'),text:box('.lightbox-description'),bodyOverflow:document.querySelector('.lightbox-body').scrollWidth>document.querySelector('.lightbox-body').clientWidth,fit:getComputedStyle(document.querySelector('#lightboxImg')).objectFit};
          });
          for(const key of ['image','close']) {const r=boxes[key];check(r.x>=0&&r.y>=0&&r.right<=width+1&&r.bottom<=height+1,`${source}: ${key} outside ${width}x${height}/${scale}%`);}
          check(boxes.text.y>=boxes.image.bottom-1||boxes.text.x>=boxes.image.right-1,`${source}: text overlays photo`);
          check(boxes.fit==='contain'&&!boxes.bodyOverflow,`${source}: cropped image or horizontal modal overflow`);
          await page.locator('#lightboxOriginal').focus();
          const original=await page.locator('#lightboxOriginal').boundingBox();
          const close=await page.locator('#lightboxClose').boundingBox();
          check(close.y>=0&&close.y+close.height<=height,`${source}: close moved out of view after scrolling`);
          check(original.y>=close.y+close.height&&original.y+original.height<=height,`${source}: original link not reachable by scroll`);
          await page.keyboard.press('Tab');
          check(await page.locator('#lightboxClose').evaluate(el=>el===document.activeElement),`${source}: Tab escaped viewer`);
          await page.keyboard.press('Shift+Tab');
          check(await page.locator('#lightboxOriginal').evaluate(el=>el===document.activeElement),`${source}: reverse Tab escaped viewer`);
          if(index%2===0) await page.locator('#lightboxClose').click(); else await page.keyboard.press('Escape');
          check(await link.evaluate(el=>el===document.activeElement),`${source}: focus not returned`);
          check(await page.locator('main').evaluate(el=>!el.inert),`${source}: background remained inert`);
        }
      }
    }
    check(descriptions.size===12 && new Set(descriptions.values()).size===12,'twelve distinct source descriptions expected');
    const noJs=await context.browser().newContext({javaScriptEnabled:false,viewport:{width:320,height:740}});
    try {
      noJs.setDefaultTimeout(10000);noJs.setDefaultNavigationTimeout(15000);
      const fallback=await noJs.newPage();await fallback.goto(`${baseUrl}/realisations/?categorie=bain`);
      check(await fallback.locator('.project:visible').count()===10,'no-JS gallery must stay complete');
      check(!await fallback.locator('.gallery-filters').isVisible(),'no-JS filters should not be shown');
      await fallback.locator('.js-lightbox').first().click();await fallback.waitForURL('**/cuisine-blanche-plan-bois.webp');
    }finally{await noJs.close();}
    lines.push('gallery descriptions/filters: 12 sources, 17 usages x4 viewports; category counts, repeat/close/reload, keyboard, 200% scroll, full images, attribution and no-JS PASS');
  }catch(error){failures.push(`gallery descriptions/filters: ${error.message}`);}
  finally{await page.close();}
}
