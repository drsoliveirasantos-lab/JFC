(() => {
  // One record per source photo, shared by gallery and specialty pages.
  // Evidence and attribution are documented in docs/project-photo-descriptions.md.
  const projects = {
    'cuisine-blanche-plan-bois.webp': {
      category: 'cuisine',
      title: 'Cuisine blanche en L', kind: 'Aménagement visible',
      summary: 'Plan de travail en L, évier et rangements blancs.',
      description: 'Le plan de travail suit les deux murs et accueille l’évier sur le retour. Meubles bas, rangements hauts et four s’organisent autour de cette implantation en L, en laissant le centre de la pièce dégagé.'
    },
    'cuisine-renovee-angle.webp': {
      category: 'cuisine',
      title: 'Cuisine en angle', kind: 'Aménagement visible',
      summary: 'Un plan continu autour de l’angle, avec évier et cuisson.',
      description: 'Le plan de travail relie les deux côtés de la cuisine. L’évier se situe sur le grand linéaire ; la plaque et le four occupent le retour. Les meubles hauts et bas suivent cette disposition pour utiliser les deux murs.'
    },
    'cuisine-renovee-marbre.webp': {
      category: 'cuisine',
      title: 'Cuisine au décor veiné', kind: 'Aménagement visible',
      summary: 'Plan, évier et crédence à décor veiné.',
      description: 'Le plan de travail et la crédence présentent un décor veiné. L’évier et la plaque sont disposés sur le même linéaire, avec le four en dessous et des rangements hauts et bas. Une colonne complète l’aménagement près de l’ouverture.'
    },
    'cuisine-ouverte-sejour.webp': {
      category: 'cuisine',
      title: 'Cuisine ouverte sur le séjour', kind: 'Aménagement visible',
      summary: 'Une implantation en angle ouverte sur le coin repas.',
      description: 'La cuisine occupe l’angle de la pièce : plan de travail, évier, rangements et colonne de cuisson y sont regroupés. Cette disposition laisse une place au coin repas et un passage vers les ouvertures.'
    },
    'salle-bain-vasque.webp': {
      category: 'bain',
      title: 'Salle de bain avec baignoire', kind: 'Travaux réalisés',
      summary: 'Baignoire conservée ; paroi vitrée, vasque, douche et miroir ajoutés.',
      description: 'La baignoire était déjà présente. Les travaux ont ajouté la séparation vitrée de baignoire, le meuble vasque avec lavabo, l’équipement de douche et le miroir. L’aménagement du reste de cette salle de bain s’organise autour de la baignoire conservée.'
    },
    'salle-bain-vasque-douche.webp': {
      category: 'bain',
      title: 'Vasque et rangements', kind: 'Aménagement visible',
      summary: 'Un meuble vasque, un miroir et une colonne de rangement.',
      description: 'Le meuble vasque à tiroirs, le miroir et la colonne de rangement sont réunis sur un même mur. L’ensemble associe des façades d’aspect bois à un habillage mural au décor veiné, dans un espace resserré.'
    },
    'buanderie-plan-travail.webp': {
      category: 'buanderie',
      title: 'Buanderie adaptée à l’espace', kind: 'Aménagement adapté',
      summary: 'Un plan au-dessus du lave-linge et un rangement ouvert.',
      description: 'L’aménagement est adapté à l’espace existant : un plan de travail passe au-dessus du lave-linge et se prolonge jusqu’au rangement ouvert. Il crée une surface utile en conservant l’accès aux équipements voisins.'
    },
    'kitchenette-blanche.webp': {
      category: 'cuisine',
      title: 'Kitchenette compacte', kind: 'Aménagement visible',
      summary: 'Évier, cuisson et rangements réunis sur un seul mur.',
      description: 'L’évier et la plaque sont intégrés au plan de travail d’un linéaire compact. Les meubles hauts et bas sont complétés par une colonne, pour regrouper les fonctions de la cuisine sur un seul mur, à côté de la fenêtre.'
    },
    'cuisine-bois-blanc.webp': {
      category: 'cuisine',
      title: 'Cuisine en longueur', kind: 'Aménagement visible',
      summary: 'Un long plan clair entre meubles bas et rangements hauts.',
      description: 'Un long plan de travail clair suit le mur entre le réfrigérateur et l’ouverture du fond. Le four, les meubles bas et les rangements hauts s’alignent sur ce côté de la pièce. Les façades d’aspect bois contrastent avec le plan et la crédence clairs.'
    },
    'cuisine-lineaire-angle.webp': {
      category: 'cuisine',
      title: 'Cuisine à deux linéaires', kind: 'Aménagement visible',
      summary: 'Deux côtés aménagés avec un passage central.',
      description: 'Deux linéaires se font face : un long plan avec rangements et four d’un côté, l’évier et la zone de cuisson de l’autre. Cette implantation utilise les deux murs tout en gardant un passage central vers l’ouverture du fond.'
    },
    'cuisine-plan-travail-ilot.webp': {
      category: 'cuisine',
      title: 'Cuisine et plans de travail', kind: 'Aménagement visible',
      summary: 'Meubles bas et éléments de plan disposés le long des murs.',
      description: 'La photo montre des meubles bas répartis le long des murs, avec plusieurs éléments de plan de travail visibles. Leur disposition suit les angles de la pièce et la fenêtre, en préservant l’espace central.'
    },
    'douche-marbre.webp': {
      category: 'bain',
      title: 'Douche avec parois vitrées', kind: 'Aménagement visible',
      summary: 'Receveur, parois vitrées et équipement de douche.',
      description: 'Le receveur et les parois vitrées délimitent la douche. L’équipement de douche et l’habillage mural au décor veiné sont visibles à l’intérieur ; l’ensemble prend place près du meuble de rangement.'
    }
  };
  const links = [...document.querySelectorAll('.js-lightbox')];
  const filterBar = document.querySelector('.gallery-filters');
  if (filterBar) {
    const cards = [...document.querySelectorAll('.project-grid .project')];
    cards.forEach(card => { const name = card.querySelector('.js-lightbox').getAttribute('href').split('/').at(-1); card.dataset.category = projects[name]?.category || 'autre'; });
    const buttons = [...filterBar.querySelectorAll('[data-filter]')];
    const result = document.getElementById('galleryResult');
    const empty = document.getElementById('galleryEmpty');
    buttons.forEach(button => {
      const count = cards.filter(card => button.dataset.filter === 'tout' || card.dataset.category === button.dataset.filter).length;
      button.querySelector('.filter-count').textContent = `(${count})`;
    });
    function applyFilter(category, updateUrl = false) {
      const active = buttons.find(button => button.dataset.filter === category) || buttons[0];
      let count = 0;
      cards.forEach(card => { card.hidden = active.dataset.filter !== 'tout' && card.dataset.category !== active.dataset.filter; if (!card.hidden) count++; });
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button === active)));
      result.textContent = `${count} photo${count === 1 ? '' : 's'}${active.dataset.filter === 'tout' ? '' : ' — ' + active.dataset.label}`;
      empty.hidden = count !== 0;
      if (updateUrl) {
        const url = new URL(location.href);
        if (active.dataset.filter === 'tout') url.searchParams.delete('categorie'); else url.searchParams.set('categorie', active.dataset.filter);
        history.replaceState(null, '', url);
      }
    }
    buttons.forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.filter, true)));
    filterBar.hidden = false;
    applyFilter(new URLSearchParams(location.search).get('categorie'));
  }
  if (!links.length) return;
  const modal = document.createElement('div');
  modal.className = 'lightbox'; modal.id = 'lightbox';
  modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'lightboxTitle'); modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = '<div class="lightbox-inner"><div class="lightbox-top"><h2 class="lightbox-title" id="lightboxTitle">Réalisation</h2><button class="lightbox-close" id="lightboxClose" type="button">Fermer</button></div><div class="lightbox-body" tabindex="0" role="region" aria-label="Photo et description de la réalisation"><div class="lightbox-media"><img id="lightboxImg" alt="" decoding="async"></div><div class="lightbox-description"><p class="kicker" id="lightboxKind"></p><p id="lightboxDescription"></p><a class="lightbox-open-original" id="lightboxOriginal" target="_blank" rel="noopener">Ouvrir en taille réelle</a></div></div></div>';
  document.body.append(modal);
  const image = modal.querySelector('#lightboxImg');
  image.src = links[0].href; image.alt = links[0].querySelector('img').alt;
  const title = modal.querySelector('#lightboxTitle');
  const kind = modal.querySelector('#lightboxKind');
  const description = modal.querySelector('#lightboxDescription');
  const original = modal.querySelector('#lightboxOriginal');
  const close = modal.querySelector('#lightboxClose');
  const body = modal.querySelector('.lightbox-body');
  let trigger, previousOverflow, inertStates = [];
  links.forEach(link => {
    const photo = link.querySelector('img');
    const project = projects[link.getAttribute('href').split('/').at(-1)];
    if (!project) return;
    link.setAttribute('aria-label', `Voir la réalisation : ${project.title}`);
    const card = link.closest('.project');
    if (card) { card.querySelector('h3').textContent = project.title; card.querySelector('.project-body p').textContent = project.summary; }
    const caption = link.closest('.specialty-photo')?.querySelector('figcaption');
    if (caption) caption.textContent = `${project.title} · ${project.summary}`;
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); trigger = link;
      image.src = link.getAttribute('href'); image.alt = photo.alt;
      image.width = photo.naturalWidth || Number(photo.getAttribute('width'));
      image.height = photo.naturalHeight || Number(photo.getAttribute('height'));
      title.textContent = project.title; kind.textContent = project.kind; description.textContent = project.description;
      original.href = link.href;
      previousOverflow = document.body.style.overflow;
      inertStates = [...document.body.children].filter(el => el !== modal && el.tagName !== 'SCRIPT').map(el => [el, el.inert]);
      inertStates.forEach(([el]) => { el.inert = true; });
      modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden';
      body.scrollTop = 0; close.focus();
    });
  });
  function closeModal() {
    modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = previousOverflow;
    inertStates.forEach(([el, wasInert]) => { el.inert = wasInert; });
    trigger?.focus();
  }
  close.addEventListener('click', closeModal);
  modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', event => {
    if (!modal.classList.contains('open')) return;
    if (event.key === 'Escape') { event.preventDefault(); closeModal(); }
    if (event.key === 'Tab') {
      if (event.shiftKey && document.activeElement === close) { event.preventDefault(); original.focus(); }
      else if (!event.shiftKey && document.activeElement === original) { event.preventDefault(); close.focus(); }
    }
  });
})();
