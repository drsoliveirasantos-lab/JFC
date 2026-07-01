(() => {
  const selected = {
    bien: 'Appartement',
    travaux: ['Cuisine'],
    etat: 'A renover',
    delai: 'Ce mois-ci'
  };

  const labels = {
    bien: 'Bien',
    travaux: 'Travaux',
    etat: 'Projet',
    delai: 'Delai'
  };

  const summaryEls = {
    bien: document.querySelector('[data-summary="bien"]'),
    travaux: document.querySelector('[data-summary="travaux"]'),
    etat: document.querySelector('[data-summary="etat"]'),
    delai: document.querySelector('[data-summary="delai"]'),
    ville: document.querySelector('[data-summary="ville"]'),
    details: document.querySelector('[data-summary="details"]')
  };

  const cityInput = document.getElementById('quoteCity');
  const detailsInput = document.getElementById('quoteDetails');
  const waLink = document.getElementById('quoteWhatsapp');
  const mailLink = document.getElementById('quoteEmail');

  function formatValue(value) {
    if (Array.isArray(value)) return value.length ? value.join(', ') : 'Non precise';
    return value || 'Non precise';
  }

  function buildMessage() {
    const ville = cityInput?.value.trim() || 'A preciser';
    const details = detailsInput?.value.trim() || 'Je peux envoyer des photos du chantier.';
    return [
      'Bonjour JFC, je souhaite un devis.',
      '',
      `Type de bien : ${formatValue(selected.bien)}`,
      `Travaux : ${formatValue(selected.travaux)}`,
      `Etat du projet : ${formatValue(selected.etat)}`,
      `Delai souhaite : ${formatValue(selected.delai)}`,
      `Ville / secteur : ${ville}`,
      '',
      `Details : ${details}`,
      '',
      'Je peux vous envoyer des photos du chantier.'
    ].join('\n');
  }

  function updateSummary() {
    Object.keys(labels).forEach(key => {
      if (summaryEls[key]) summaryEls[key].textContent = formatValue(selected[key]);
    });
    const ville = cityInput?.value.trim() || 'A preciser';
    const details = detailsInput?.value.trim() || 'Photos + dimensions a envoyer';
    if (summaryEls.ville) summaryEls.ville.textContent = ville;
    if (summaryEls.details) summaryEls.details.textContent = details;
    const encoded = encodeURIComponent(buildMessage());
    if (waLink) waLink.href = `https://wa.me/33607721633?text=${encoded}`;
    if (mailLink) mailLink.href = `mailto:jonatanfc97@gmail.com?subject=${encodeURIComponent('Demande de devis JFC')}&body=${encoded}`;
  }

  document.querySelectorAll('[data-choice]').forEach(button => {
    const group = button.dataset.choice;
    const value = button.dataset.value;
    const isMulti = button.dataset.multi === 'true';

    button.addEventListener('click', () => {
      if (isMulti) {
        const current = new Set(selected[group] || []);
        if (current.has(value)) current.delete(value);
        else current.add(value);
        selected[group] = Array.from(current);
        button.classList.toggle('is-selected', current.has(value));
        button.setAttribute('aria-pressed', current.has(value) ? 'true' : 'false');
      } else {
        selected[group] = value;
        document.querySelectorAll(`[data-choice="${group}"]`).forEach(other => {
          const active = other === button;
          other.classList.toggle('is-selected', active);
          other.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
      }
      updateSummary();
    });
  });

  [cityInput, detailsInput].forEach(input => input?.addEventListener('input', updateSummary));
  updateSummary();
})();
