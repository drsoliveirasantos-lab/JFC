(() => {
  const phone = '33607721633';
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  function getTextFromLink(link) {
    try {
      const href = link.getAttribute('href') || '';
      const url = new URL(href, window.location.href);
      return url.searchParams.get('text') || '';
    } catch (_) {
      return '';
    }
  }

  function buildUrls(text) {
    const suffix = text ? `?text=${encodeURIComponent(text)}` : '';
    const appSuffix = text ? `&text=${encodeURIComponent(text)}` : '';
    const fallback = `https://wa.me/${phone}${suffix}`;
    const iosApp = `whatsapp://send?phone=${phone}${appSuffix}`;
    const androidIntent = `intent://send?phone=${phone}${appSuffix}#Intent;scheme=whatsapp;package=com.whatsapp;S.browser_fallback_url=${encodeURIComponent(fallback)};end`;
    return { fallback, iosApp, androidIntent };
  }

  document.querySelectorAll('a[href*="wa.me"], a[href^="whatsapp://"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!isMobile) return;
      event.preventDefault();

      const text = getTextFromLink(link);
      const { fallback, iosApp, androidIntent } = buildUrls(text);

      let pageHidden = false;
      const markHidden = () => { pageHidden = true; };
      window.addEventListener('pagehide', markHidden, { once: true });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) pageHidden = true;
      }, { once: true });

      window.location.href = /Android/i.test(navigator.userAgent) ? androidIntent : iosApp;
      window.setTimeout(() => {
        if (!pageHidden) window.location.href = fallback;
      }, 1100);
    });
  });
})();