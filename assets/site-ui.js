(() => {
  const button = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  document.documentElement.classList.add('js');
  function closeMenu() { button.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); button.focus(); } });
  document.addEventListener('click', event => { if (!event.target.closest('.nav')) closeMenu(); });
  matchMedia('(min-width: 901px)').addEventListener('change', closeMenu);
})();
