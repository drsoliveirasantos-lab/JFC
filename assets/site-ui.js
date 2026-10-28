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

// Selecting an option never navigates until the visitor activates Voir.
document.querySelector('.specialty-picker')?.addEventListener('submit', event => {
  event.preventDefault();
  const value = document.getElementById('specialty-choice').value;
  const allowed = [...document.querySelectorAll('.specialty-links a')].some(link => link.getAttribute('href') === value);
  if (allowed) window.location.assign(value);
});
