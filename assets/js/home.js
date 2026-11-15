/** Progressive enhancement: all tool links remain available without JavaScript. */
(() => {
  const search = document.getElementById('tool-search');
  if (!search) return;
  const cards = [...document.querySelectorAll('[data-category].tool')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  let category = 'All';
  function update() {
    const query = search.value.trim().toLocaleLowerCase();
    let count = 0;
    for (const card of cards) {
      const matches = (category === 'All' || card.dataset.category === category)
        && card.textContent.toLocaleLowerCase().includes(query);
      card.hidden = !matches;
      if (matches) count++;
    }
    document.getElementById('result-count').textContent = `${count} of ${cards.length} tools`;
    document.getElementById('empty').hidden = count !== 0;
  }
  search.addEventListener('input', update);
  for (const button of filters) button.addEventListener('click', () => {
    category = button.dataset.filter;
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    update();
  });
  update();
})();
