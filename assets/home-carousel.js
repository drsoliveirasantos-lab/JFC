(() => {
  const slides = [
    ['cuisine-blanche-plan-bois.webp', 'Cuisine blanche et plan de travail bois'],
    ['salle-bain-vasque.webp', 'Salle de bain avec vasque et baignoire'],
    ['douche-marbre.webp', 'Douche rénovée'],
    ['cuisine-plan-travail-ilot.webp', 'Cuisine complète et plans de travail'],
    ['cuisine-ouverte-sejour.webp', 'Cuisine ouverte et finitions']
  ];
  const img = document.getElementById('heroPhoto');
  const label = document.getElementById('slide');
  const button = document.getElementById('carouselPause');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = motion.matches, index = 0;
  function updateButton() { button.textContent = paused ? 'Défiler' : 'Pause'; button.setAttribute('aria-label', paused ? 'Lancer le diaporama' : 'Mettre le diaporama en pause'); }
  button.addEventListener('click', () => { paused = !paused; updateButton(); });
  motion.addEventListener('change', () => { paused = motion.matches; updateButton(); });
  setInterval(() => { if (paused || document.hidden) return; index = (index + 1) % slides.length; img.src = '/assets/photos/' + slides[index][0]; img.alt = slides[index][1]; label.textContent = slides[index][1]; }, 3500);
  updateButton();
})();
