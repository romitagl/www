/* Whole-page localisation and progressive enhancement. All translations live in
   HTML; these messages cover only dynamic status text. Static locale pages work
   without scripts. No content is fetched from the retired wiki. */
(() => {
  'use strict';
  const root = document.documentElement;
  const cards = [...document.querySelectorAll('.guide-card')];
  const topics = [...document.querySelectorAll('.guide-topic')];
  const search = document.querySelector('#guide-search');
  const status = document.querySelector('#search-status');
  const choices = [...document.querySelectorAll('[data-language-choice]')];
  const pages = { en: 'fiat500l-wiki.html', it: 'fiat500l-wiki-it.html' };
  const storageKey = 'fiat500l-guide-preferences';
  const messages = {
    en: {
      count: n => `${n} sections · Open a heading to read its guidance.`,
      matches: (n, total) => `${n} of ${total} sections match. Clear search to see the full guide.`,
      language: 'The whole page is in English.',
      both: 'Showing English and Italian guidance. Navigation remains in English.'
    },
    it: {
      count: n => `${n} sezioni · Apri un titolo per leggere le indicazioni.`,
      matches: (n, total) => `${n} sezioni su ${total} corrispondono. Cancella la ricerca per vedere tutta la guida.`,
      language: 'Tutta la pagina è in italiano.',
      both: 'Indicazioni in italiano e inglese. La navigazione resta in italiano.'
    }
  };
  let language = root.dataset.readingLanguage;
  let uiLanguage = root.dataset.uiLanguage;
  let beforeSearch = null;
  let beforePrint = null;
  const validLanguage = value => ['en', 'it', 'both'].includes(value);
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  const textIndex = new Map(cards.map(card => [card, Object.fromEntries(['en', 'it'].map(locale => {
    const heading = card.querySelector(`summary [data-ui-language="${locale}"]`).textContent;
    const body = card.querySelector(`[data-language="${locale}"]`).textContent;
    return [locale, normalize(`${heading} ${body}`)];
  }))]));

  function filter() {
    const terms = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
    if (terms.length && !beforeSearch) beforeSearch = new Map(cards.map(card => [card, card.open]));
    let matches = 0;
    cards.forEach(card => {
      const text = textIndex.get(card);
      const haystack = language === 'both' ? `${text.en} ${text.it}` : text[language];
      card.hidden = !terms.every(term => haystack.includes(term));
      if (!card.hidden) matches++;
      if (terms.length && !card.hidden) card.open = true;
      if (!terms.length && beforeSearch) card.open = beforeSearch.get(card);
    });
    if (!terms.length) beforeSearch = null;
    topics.forEach(topic => { topic.hidden = [...topic.querySelectorAll('.guide-card')].every(card => card.hidden); });
    document.querySelector('#no-results').hidden = matches !== 0;
    status.textContent = terms.length
      ? messages[uiLanguage].matches(matches, cards.length)
      : messages[uiLanguage].count(cards.length);
  }

  function updateLinks() {
    choices.filter(choice => choice.tagName === 'A').forEach(choice => {
      const target = new URL(pages[choice.dataset.languageChoice], location.href);
      target.hash = location.hash;
      choice.href = target.href;
    });
  }

  function languageUrl() {
    const url = new URL(pages[uiLanguage], location.href);
    // Preserve unrelated parameters and legacy ?page= bookmarks.
    url.search = location.search;
    url.searchParams.set('lang', language);
    if (language === 'both') url.searchParams.set('ui', uiLanguage);
    else url.searchParams.delete('ui');
    url.hash = location.hash;
    return url;
  }

  function applyLanguage(next, { remember = false, historyMode = null } = {}) {
    if (!validLanguage(next)) return;
    language = next;
    if (next !== 'both') uiLanguage = next;
    root.lang = uiLanguage;
    root.dataset.uiLanguage = uiLanguage;
    root.dataset.readingLanguage = language;
    // Explicit hidden states also keep inactive translations out of the
    // accessibility tree; CSS provides the same defaults without JavaScript.
    document.querySelectorAll('.ui-copy').forEach(el => { el.hidden = el.dataset.uiLanguage !== uiLanguage; });
    document.querySelectorAll('[data-language]').forEach(el => {
      el.hidden = language !== 'both' && el.dataset.language !== language;
    });
    for (const attribute of ['aria-label', 'placeholder', 'title', 'alt']) {
      document.querySelectorAll(`[data-${attribute}-${uiLanguage}]`).forEach(el => {
        el.setAttribute(attribute, el.getAttribute(`data-${attribute}-${uiLanguage}`));
      });
    }
    const title = document.querySelector('title');
    document.title = title.getAttribute(`data-title-${uiLanguage}`);
    document.querySelectorAll('meta[data-content-en]').forEach(el => {
      el.content = el.getAttribute(`data-content-${uiLanguage}`);
    });
    const canonical = `https://romitagl.com/${pages[uiLanguage]}`;
    document.querySelector('link[rel="canonical"]').href = canonical;
    document.querySelector('meta[property="og:url"]').content = canonical;
    document.querySelector('meta[property="og:locale"]').content = uiLanguage === 'it' ? 'it_IT' : 'en_GB';
    choices.forEach(choice => {
      const selected = choice.dataset.languageChoice === language;
      if (choice.tagName === 'BUTTON') choice.setAttribute('aria-pressed', String(selected));
      else if (selected) choice.setAttribute('aria-current', 'true');
      else choice.removeAttribute('aria-current');
    });
    search.value = ''; // A query from the previous language should not hide the new content.
    filter();
    const languageStatus = document.querySelector('#language-status');
    languageStatus.lang = uiLanguage;
    languageStatus.textContent = messages[uiLanguage][language === 'both' ? 'both' : 'language'];
    if (remember) {
      try { localStorage.setItem(storageKey, JSON.stringify({ language, uiLanguage })); } catch { /* Optional storage. */ }
    }
    if (historyMode) {
      try { history[historyMode]({ language, uiLanguage }, '', languageUrl()); } catch { /* File previews may restrict history. */ }
    }
    updateLinks();
  }

  function revealHash() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (target?.closest('.guide-topic')) {
      search.value = '';
      filter();
      const card = target.closest('.guide-card');
      if (card) card.open = true;
      requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
    }
    updateLinks();
  }

  search.addEventListener('input', filter);
  document.querySelector('#clear-search').addEventListener('click', () => { search.value = ''; filter(); search.focus(); });
  choices.forEach(choice => choice.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || (event.button && event.button !== 0)) return;
    event.preventDefault();
    applyLanguage(choice.dataset.languageChoice, { remember: true, historyMode: 'pushState' });
  }));
  document.querySelector('#expand-all').addEventListener('click', () => cards.filter(card => !card.hidden).forEach(card => { card.open = true; }));
  document.querySelector('#collapse-all').addEventListener('click', () => cards.filter(card => !card.hidden).forEach(card => { card.open = false; }));
  document.querySelector('#print-guide').addEventListener('click', () => window.print());
  window.addEventListener('beforeprint', () => {
    if (!beforePrint) beforePrint = new Map(cards.map(card => [card, card.open]));
    cards.filter(card => !card.hidden).forEach(card => { card.open = true; });
  });
  window.addEventListener('afterprint', () => {
    if (beforePrint) cards.forEach(card => { card.open = beforePrint.get(card); });
    beforePrint = null;
  });
  window.addEventListener('hashchange', revealHash);
  window.addEventListener('popstate', () => {
    const params = new URLSearchParams(location.search);
    uiLanguage = params.get('ui') === 'it' || location.pathname.endsWith(pages.it) ? 'it' : 'en';
    applyLanguage(validLanguage(params.get('lang')) ? params.get('lang') : uiLanguage);
    revealHash();
  });

  const params = new URLSearchParams(location.search);
  // Each canonical URL always starts in its declared language. Preferences
  // must not change crawlable content or metadata on initial page load.
  if (validLanguage(params.get('lang'))) language = params.get('lang');
  if (language === 'both' && ['en', 'it'].includes(params.get('ui'))) uiLanguage = params.get('ui');
  const legacyPage = params.get('page') === 'hub' ? 'start' : params.get('page');
  if (!location.hash && topics.some(topic => topic.id === legacyPage)) {
    const url = new URL(location.href);
    url.hash = legacyPage;
    try { history.replaceState(null, '', url); } catch { /* Keep the readable page. */ }
  }
  document.querySelector('.guide-controls').hidden = false;
  document.querySelector('[data-language-choice="both"]').hidden = false;
  applyLanguage(language);
  if (location.hash) revealHash();

  if ('IntersectionObserver' in window) {
    const links = [...document.querySelectorAll('.guide-sidebar nav a')];
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (!visible.length) return;
      links.forEach(link => {
        if (link.hash === '#' + visible[0].target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-5% 0px -60% 0px' });
    topics.forEach(topic => observer.observe(topic));
  }
})();
