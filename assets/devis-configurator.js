(() => {
  const summaryEls = {
    nom: document.querySelector('[data-summary="nom"]'),
    telephone: document.querySelector('[data-summary="telephone"]'),
    email: document.querySelector('[data-summary="email"]'),
    bien: document.querySelector('[data-summary="bien"]'),
    travaux: document.querySelector('[data-summary="travaux"]'),
    etat: document.querySelector('[data-summary="etat"]'),
    delai: document.querySelector('[data-summary="delai"]'),
    ville: document.querySelector('[data-summary="ville"]'),
    contact: document.querySelector('[data-summary="contact"]'),
    details: document.querySelector('[data-summary="details"]')
  };

  const nameInput = document.getElementById('quoteName');
  const phoneInput = document.getElementById('quotePhone');
  const emailInput = document.getElementById('quoteEmail');
  const bienSelect = document.getElementById('quoteBien');
  const etatSelect = document.getElementById('quoteEtat');
  const delaiSelect = document.getElementById('quoteDelai');
  const cityInput = document.getElementById('quoteCity');
  const contactSelect = document.getElementById('quoteContactMethod');
  const detailsInput = document.getElementById('quoteDetails');
  const workSummary = document.getElementById('quoteWorkSummary');
  const workInputs = Array.from(document.querySelectorAll('[data-work]'));
  const waLink = document.getElementById('quoteWhatsapp');
  const mailLink = document.getElementById('quoteEmailButton');
  const quickEmail = document.getElementById('quickEmail');
  const previewButton = document.getElementById('quotePreviewButton');
  const modal = document.getElementById('quotePreviewModal');
  const closeButtons = Array.from(document.querySelectorAll('[data-close-preview]'));
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  function valueOrDefault(input, fallback = 'À préciser') {
    return input?.value?.trim() || fallback;
  }

  function checkedWorks() {
    const values = workInputs.filter(input => input.checked).map(input => input.value);
    return values.length ? values : ['Non précisé'];
  }

  function updateWorkSummary(values = checkedWorks()) {
    if (!workSummary) return;
    workSummary.textContent = values.length === 1 ? values[0] : `${values.length} types sélectionnés`;
  }

  function buildMessage() {
    const nom = valueOrDefault(nameInput);
    const telephone = valueOrDefault(phoneInput);
    const email = valueOrDefault(emailInput);
    const bien = bienSelect?.value || 'À préciser';
    const travaux = checkedWorks().join(', ');
    const etat = etatSelect?.value || 'À préciser';
    const delai = delaiSelect?.value || 'À préciser';
    const ville = valueOrDefault(cityInput);
    const contact = contactSelect?.value || 'WhatsApp';
    const details = valueOrDefault(detailsInput, 'Je peux envoyer des photos et dimensions du chantier.');
    return [
      'Bonjour JFC Rénovation,',
      '',
      'Je souhaite obtenir un devis personnalisé pour un projet de rénovation intérieure.',
      '',
      'Mes coordonnées :',
      `- Nom : ${nom}`,
      `- Téléphone : ${telephone}`,
      `- Email : ${email}`,
      `- Contact préféré : ${contact}`,
      '',
      'Voici ma demande :',
      `- Type de bien : ${bien}`,
      `- Travaux souhaités : ${travaux}`,
      `- État du projet : ${etat}`,
      `- Délai souhaité : ${delai}`,
      `- Ville / secteur : ${ville}`,
      `- Message : ${details}`,
      '',
      'Pouvez-vous me dire si vous pouvez intervenir et me proposer une estimation ou un rendez-vous ?',
      '',
      'Je peux vous envoyer des photos du chantier.',
      'Merci.'
    ].join('\n');
  }

  function updateSummary() {
    const works = checkedWorks();
    updateWorkSummary(works);
    if (summaryEls.nom) summaryEls.nom.textContent = valueOrDefault(nameInput);
    if (summaryEls.telephone) summaryEls.telephone.textContent = valueOrDefault(phoneInput);
    if (summaryEls.email) summaryEls.email.textContent = valueOrDefault(emailInput);
    if (summaryEls.bien) summaryEls.bien.textContent = bienSelect?.value || 'À préciser';
    if (summaryEls.travaux) summaryEls.travaux.textContent = works.join(', ');
    if (summaryEls.etat) summaryEls.etat.textContent = etatSelect?.value || 'À préciser';
    if (summaryEls.delai) summaryEls.delai.textContent = delaiSelect?.value || 'À préciser';
    if (summaryEls.ville) summaryEls.ville.textContent = valueOrDefault(cityInput);
    if (summaryEls.contact) summaryEls.contact.textContent = contactSelect?.value || 'WhatsApp';
    if (summaryEls.details) summaryEls.details.textContent = valueOrDefault(detailsInput, 'Photos + dimensions à envoyer');
    const encoded = encodeURIComponent(buildMessage());
    if (waLink) {
      waLink.href = isMobile
        ? `whatsapp://send?phone=33607721633&text=${encoded}`
        : `https://api.whatsapp.com/send?phone=33607721633&text=${encoded}`;
    }
    const mailHref = `mailto:jonatanfc97@gmail.com?subject=${encodeURIComponent('Demande de devis JFC Rénovation')}&body=${encoded}`;
    if (mailLink) mailLink.href = mailHref;
    if (quickEmail) quickEmail.href = mailHref;
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

  [nameInput, phoneInput, emailInput, bienSelect, etatSelect, delaiSelect, cityInput, contactSelect, detailsInput, ...workInputs].forEach(input => {
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
