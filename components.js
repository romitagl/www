(function () {
  const groups = [
    { label: 'Tools', section: 'digital-services', links: [
      ['All Web Tools', 'https://web-tools.romitagl.com/'],
      ['PDF & Image Merger', 'https://web-tools.romitagl.com/pdf-merger/'],
      ['PDF Compressor', 'https://web-tools.romitagl.com/pdf-compressor/'],
      ['Animated GIF Maker', 'https://web-tools.romitagl.com/gif-maker/'],
      ['Video Speed Controller', 'https://web-tools.romitagl.com/video-speed-controller/'],
      ['QR Code Generator & Scanner', 'https://web-tools.romitagl.com/qr-code-tool/'],
      ['Code Formatter', 'https://web-tools.romitagl.com/code-formatter/'],
      ['Base64 Encoder/Decoder', 'https://web-tools.romitagl.com/base64-encoder-decoder/'],
      ['CIDR Subnet Calculator', 'https://web-tools.romitagl.com/cidr-calculator/'],
      ['Website Scraper · Beta', 'https://web-tools.romitagl.com/website-scraper/'],
    ] },
    { label: 'Fitness', section: 'fitness', links: [
      ['Rider Fit', 'fitness.html'],
      ['Workout circuits', 'fitness.html#circuits'],
      ['Exercise library', 'fitness.html#library'],
      ['My progress', 'fitness.html#progress'],
    ] },
    { label: 'Learn & play', section: 'learn-play', links: [
      ['Word Association Challenge', 'https://web-games.romitagl.com/word-association-challenge/'],
    ] },
    { label: 'Local', section: 'local-services', links: [
      ['FIAT 500 Experience', 'fiat500L.html'],
    ] },
    { label: 'Wiki & guides', section: 'knowledge-base', links: [
      ['Knowledge Wiki', 'wiki.html'],
      ['FIAT 500 L Owner Guide · EN', 'fiat500l-wiki.html'],
      ['Guida FIAT 500 L · IT', 'fiat500l-wiki-it.html'],
    ] },
  ];

  document.addEventListener('DOMContentLoaded', function () {
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    const isHome = currentPage === 'index.html';
    const bilingual = currentPage.startsWith('fiat500l-wiki');
    const uiLanguage = document.documentElement?.dataset?.uiLanguage || 'en';
    const italian = {
      'Tools': 'Strumenti', 'Learn & play': 'Impara e gioca', 'Local': 'Esperienze',
      'Wiki & guides': 'Wiki e guide', 'About': 'Chi sono', 'All Web Tools': 'Tutti gli strumenti',
      'PDF & Image Merger': 'Unisci PDF e immagini', 'PDF Compressor': 'Comprimi PDF',
      'Animated GIF Maker': 'Crea GIF animate', 'Video Speed Controller': 'Velocità video',
      'QR Code Generator & Scanner': 'Genera e leggi codici QR', 'Code Formatter': 'Formatta codice',
      'Base64 Encoder/Decoder': 'Codifica e decodifica Base64', 'CIDR Subnet Calculator': 'Calcolatore CIDR',
      'Website Scraper · Beta': 'Archivia siti · Beta', 'Word Association Challenge': 'Associazioni di parole',
      'FIAT 500 Experience': 'Esperienza FIAT 500', 'Knowledge Wiki': 'Wiki delle conoscenze',
      'Fitness': 'Fitness', 'Rider Fit': 'Rider Fit', 'Workout circuits': 'Circuiti di allenamento', 'Exercise library': 'Esercizi', 'My progress': 'I miei progressi', 'Explore fitness →': 'Scopri il fitness →', 'About & contact': 'Chi sono e contatti',
      'Privacy': 'Privacy', 'Support the projects': 'Sostieni i progetti',
      'Built with curiosity.': 'Creato con curiosità.',
      'Explore tools →': 'Esplora gli strumenti →', 'Explore learn & play →': 'Impara e gioca →',
      'Explore local →': 'Scopri le esperienze →', 'Explore wiki & guides →': 'Esplora wiki e guide →',
    };
    const copy = text => !bilingual ? text :
      `<span class="ui-copy" data-ui-language="en" lang="en"${uiLanguage !== 'en' ? ' hidden' : ''}>${text}</span><span class="ui-copy" data-ui-language="it" lang="it"${uiLanguage !== 'it' ? ' hidden' : ''}>${italian[text] || text}</span>`;

    const activeHref = currentPage + location.hash;
    const link = ([label, href]) => {
      const active = !isHome && (href === activeHref || (!location.hash && href === currentPage));
      return `<a href="${href}"${active ? ' class="active" aria-current="page"' : ''}>${copy(label)}</a>`;
    };
    const navigation = `
      <nav class="site-nav" aria-label="${bilingual && uiLanguage === 'it' ? 'Navigazione principale' : 'Main navigation'}" data-aria-label-en="Main navigation" data-aria-label-it="Navigazione principale">
        <a href="/" class="logo"><span class="site-logo-mark" aria-hidden="true">r.</span>romitagl.com</a>
        <ul class="nav-links" id="site-nav-links">
          ${groups.map(group => `<li class="site-nav-group"><details><summary>${copy(group.label)}<span aria-hidden="true">⌄</span></summary><ul class="site-nav-dropdown"><li><a href="${isHome ? '' : '/'}#${group.section}" data-section="${group.section}">${copy(`Explore ${group.label.toLowerCase()} →`)}</a></li>${group.links.map(item => `<li>${link(item)}</li>`).join('')}</ul></details></li>`).join('')}
          <li>${link(['About', 'about.html'])}</li>
        </ul>
        <button class="mobile-menu-btn" type="button" aria-label="Toggle navigation" aria-controls="site-nav-links" aria-expanded="false"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>
      </nav>`;
    const footer = `<footer class="site-footer"><div class="site-footer-directory">${groups.map(group => `<section><h3>${copy(group.label)}</h3><ul>${group.links.map(item => `<li>${link(item)}</li>`).join('')}</ul></section>`).join('')}</div><div class="site-footer-bottom"><p>© ${new Date().getFullYear()} romitagl.com · ${copy('Built with curiosity.')}</p><div><a href="about.html">${copy('About & contact')}</a><a href="privacy.html">${copy('Privacy')}</a><a href="https://github.com/romitagl">GitHub</a><a href="https://github.com/sponsors/romitagl">${copy('Support the projects')}</a></div></div></footer>`;
    document.querySelectorAll('[data-component]').forEach(element => {
      if (element.dataset.component === 'navigation') element.innerHTML = navigation;
      if (element.dataset.component === 'footer') element.innerHTML = footer;
    });
    const nav = document.querySelector('.site-nav');
    if (nav) {
      const button = nav.querySelector('.mobile-menu-btn');
      const links = nav.querySelector('.nav-links');
      const disclosures = [...nav.querySelectorAll('details')];
      const close = () => {
        disclosures.forEach(detail => detail.open = false);
        links.classList.remove('active');
        button.setAttribute('aria-expanded', 'false');
      };
      button.addEventListener('click', () => {
        const expanded = links.classList.toggle('active');
        button.setAttribute('aria-expanded', String(expanded));
      });
      disclosures.forEach(detail => detail.addEventListener('toggle', () => {
        if (detail.open) disclosures.filter(other => other !== detail).forEach(other => other.open = false);
      }));
      nav.addEventListener('click', event => {
        if (event.target.closest('a')) close();
      });
      document.addEventListener('click', event => { if (!nav.contains(event.target)) close(); });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && (links.classList.contains('active') || disclosures.some(detail => detail.open))) {
          const opened = disclosures.find(detail => detail.open);
          close();
          (window.innerWidth <= 950 ? button : opened?.querySelector('summary'))?.focus();
        }
      });
      window.matchMedia('(min-width: 951px)').addEventListener('change', close);
      const activeLink = nav.querySelector('[aria-current="page"]');
      if (activeLink) activeLink.closest('details')?.querySelector('summary').classList.add('active');
      if (currentPage === 'fitness.html') nav.querySelector('[data-section="fitness"]')?.closest('details')?.querySelector('summary').classList.add('active');
      if (isHome && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            const summary = nav.querySelector(`[data-section="${entry.target.id}"]`)?.closest('details')?.querySelector('summary');
            summary?.classList.toggle('active', entry.isIntersecting);
          });
        }, { rootMargin: '-10% 0px -45% 0px' });
        groups.forEach(group => {
          const section = document.getElementById(group.section);
          if (section) observer.observe(section);
        });
      }
    }
    const canonical = document.querySelector('link[rel="canonical"]');
    if (location.hostname === 'romitagl.com' && canonical) {
      canonical.href = `https://romitagl.com${isHome ? '/' : location.pathname}`;
    }
  });
})();
