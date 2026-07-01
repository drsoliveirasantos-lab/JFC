(() => {
  const summaryEls = {
    bien: document.querySelector('[data-summary="bien"]'),
    travaux: document.querySelector('[data-summary="travaux"]'),
    etat: document.querySelector('[data-summary="etat"]'),
    delai: document.querySelector('[data-summary="delai"]'),
    ville: document.querySelector('[data-summary="ville"]'),
    details: document.querySelector('[data-summary="details"]')
  };

  const bienSelect = document.getElementById('quoteBien');
  const etatSelect = document.getElementById('quoteEtat');
  const delaiSelect = document.getElementById('quoteDelai');
  const cityInput = document.getElementById('quoteCity');
  const detailsInput = document.getElementById('quoteDetails');
  const workSummary = document.getElementById('quoteWorkSummary');
  const workInputs = Array.from(document.querySelectorAll('[data-work]'));
  const waLink = document.getElementById('quoteWhatsapp');
  const mailLink = document.getElementById('quoteEmail');
  const previewButton = document.getElementById('quotePreviewButton');
  const modal = document.getElementById('quotePreviewModal');
  const closeButtons = Array.from(document.querySelectorAll('[data-close-preview]'));

  function checkedWorks() {
    const values = workInputs.filter(input => input.checked).map(input => input.value);
    return values.length ? values : ['Non precise'];
  }

  function updateWorkSummary(values = checkedWorks()) {
    if (!workSummary) return;
    workSummary.textContent = values.length === 1 ? values[0] : `${values.length} types selectionnes`;
  }

  function buildMessage() {
    const bien = bienSelect?.value || 'A preciser';
    const travaux = checkedWorks().join(', ');
    const etat = etatSelect?.value || 'A preciser';
    const delai = delaiSelect?.value || 'A preciser';
    const ville = cityInput?.value.trim() || 'A preciser';
    const details = detailsInput?.value.trim() || 'Je peux envoyer des photos du chantier.';
    return [
      'Bonjour JFC, je souhaite un devis.',
      '',
      `Type de bien : ${bien}`,
      `Travaux : ${travaux}`,
      `Etat du projet : ${etat}`,
      `Delai souhaite : ${delai}`,
      `Ville / secteur : ${ville}`,
      '',
      `Details : ${details}`,
      '',
      'Je peux vous envoyer des photos du chantier.'
    ].join('\n');
  }

  function updateSummary() {
    const works = checkedWorks();
    updateWorkSummary(works);
    if (summaryEls.bien) summaryEls.bien.textContent = bienSelect?.value || 'A preciser';
    if (summaryEls.travaux) summaryEls.travaux.textContent = works.join(', ');
    if (summaryEls.etat) summaryEls.etat.textContent = etatSelect?.value || 'A preciser';
    if (summaryEls.delai) summaryEls.delai.textContent = delaiSelect?.value || 'A preciser';
    if (summaryEls.ville) summaryEls.ville.textContent = cityInput?.value.trim() || 'A preciser';
    if (summaryEls.details) summaryEls.details.textContent = detailsInput?.value.trim() || 'Photos + dimensions a envoyer';
    const encoded = encodeURIComponent(buildMessage());
    if (waLink) waLink.href = `https://api.whatsapp.com/send?phone=33607721633&text=${encoded}`;
    if (mailLink) mailLink.href = `mailto:jonatanfc97@gmail.com?subject=${encodeURIComponent('Demande de devis JFC')}&body=${encoded}`;
  }

  function openPreview() {
    updateSummary();
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closePreview() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  [bienSelect, etatSelect, delaiSelect, cityInput, detailsInput, ...workInputs].forEach(input => {
    input?.addEventListener('change', updateSummary);
    input?.addEventListener('input', updateSummary);
  });

  previewButton?.addEventListener('click', openPreview);
  closeButtons.forEach(button => button.addEventListener('click', closePreview));
  modal?.addEventListener('click', event => {
    if (event.target === modal) closePreview();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal && !modal.hidden) closePreview();
  });

  updateSummary();
})();