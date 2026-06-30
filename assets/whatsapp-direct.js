(() => {
  const phone = '33607721633';
  const fallback = `https://wa.me/${phone}`;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  document.querySelectorAll('a[href*="wa.me"], a[href^="whatsapp://"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!isMobile) return;
      event.preventDefault();

      let pageHidden = false;
      const markHidden = () => { pageHidden = true; };
      window.addEventListener('pagehide', markHidden, { once: true });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) pageHidden = true;
      }, { once: true });

      const appUrl = /Android/i.test(navigator.userAgent)
        ? `intent://send?phone=${phone}#Intent;scheme=whatsapp;package=com.whatsapp;S.browser_fallback_url=${encodeURIComponent(fallback)};end`
        : `whatsapp://send?phone=${phone}`;

      window.location.href = appUrl;
      window.setTimeout(() => {
        if (!pageHidden) window.location.href = fallback;
      }, 1100);
    });
  });
})();
