(() => {
  const deck = window.GOBLIN_DECK || [];
  const slots = ['Situation', 'Complication', 'Unreasonable Way Through'];
  const settings = [
    'At the edge of Moon-puddle Court, the oracle spreads its cloth beside a vending machine that only accepts compliments.',
    'In the quiet back room of the goblin bookshop, three cards slide out from under a receipt for one suspiciously cheap moon.',
    'Near the town crossroads, a tiny bell rings once and the cards arrive with their own folding chair.'
  ];
  const missions = [
    'a small plan that has begun wearing a much larger hat',
    'the question of whether to move before certainty turns up',
    'a useful thing you keep saving for the ideal version of you',
    'a tender administrative knot with three unnecessary tabs open'
  ];
  const state = { cards: [], revealed: 0, setting: '', mission: '' };
  const byId = (id) => document.getElementById(id);
  const grid = byId('card-grid');
  const heading = document.querySelector('#reading-title');
  const live = byId('live');
  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

  function makeBeat(card, position, reversed) {
    const meaning = reversed ? card.reversed : card.upright;
    if (position === 0) return `For the situation, ${card.title} says: ${meaning}`;
    if (position === 1) return `The complication arrives as ${card.title}: ${meaning}`;
    return `The unreasonable way through is ${card.title}: ${meaning}`;
  }

  function imageFailed(image) {
    const art = image.closest('.card-art');
    if (art) art.classList.add('art-missing');
    image.remove();
  }

  function renderCard(entry, index) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tarot-card';
    if (entry.reversed) button.classList.add('is-reversed');
    button.disabled = index !== 0;
    button.setAttribute('aria-label', `${slots[index]}, face down`);
    button.dataset.index = index;
    const orientation = entry.reversed ? 'Reversed' : 'Upright';
    button.innerHTML = `<span class="card-inner"><span class="card-back"><span class="back-eye">◉</span><span>${slots[index]}</span><small>Goblin oracle</small></span><span class="card-face" hidden><span class="card-number">${entry.card.number}</span><span class="card-art"><img src="${entry.card.source}" alt="${entry.card.artAlt}"><span class="missing-art">${entry.card.title}</span></span><span class="card-title">${entry.card.title}</span><span class="orientation">${orientation}</span><span class="keywords">${entry.card.keywords}</span></span></span>`;
    button.addEventListener('click', () => reveal(index));
    const img = button.querySelector('img');
    if (img) img.addEventListener('error', () => imageFailed(img), { once: true });
    grid.append(button);
  }

  function deal() {
    const chosen = shuffle(deck).slice(0, 3).map((card) => ({ card, reversed: Math.random() < 0.34 }));
    state.cards = chosen;
    state.revealed = 0;
    state.setting = pick(settings);
    state.mission = pick(missions);
    grid.replaceChildren();
    chosen.forEach(renderCard);
    byId('reading-copy').hidden = true;
    byId('actions').hidden = true;
    byId('setting').textContent = state.setting;
    byId('beats').replaceChildren();
    heading.innerHTML = 'The cards are <em>listening.</em>';
    byId('instruction').textContent = 'Turn over Situation to begin. The other cards will wait their turn.';
    live.textContent = 'Three cards dealt. Situation is ready to reveal.';
  }

  function reveal(index) {
    if (index !== state.revealed || !state.cards[index]) return;
    const button = grid.querySelector(`[data-index="${index}"]`);
    if (!button || button.classList.contains('is-revealed')) return;
    const face = button.querySelector('.card-face');
    face.hidden = false;
    button.classList.add('is-revealed');
    button.disabled = true;
    button.setAttribute('aria-label', `${slots[index]}: ${state.cards[index].card.title}, ${state.cards[index].reversed ? 'reversed' : 'upright'}`);
    const beat = document.createElement('p');
    beat.className = 'beat';
    beat.textContent = makeBeat(state.cards[index].card, index, state.cards[index].reversed);
    byId('beats').append(beat);
    byId('reading-copy').hidden = false;
    state.revealed += 1;
    live.textContent = `${slots[index]} revealed: ${beat.textContent}`;
    if (state.revealed < state.cards.length) {
      const next = grid.querySelector(`[data-index="${state.revealed}"]`);
      next.disabled = false;
      byId('instruction').textContent = `Now turn over ${slots[state.revealed]}.`;
    } else {
      const conclusion = document.createElement('p');
      conclusion.className = 'conclusion';
      conclusion.textContent = `Taken together, the cards offer a route through ${state.mission}: carry the first card into the complication, then borrow the final card’s peculiar method for one real next move.`;
      byId('beats').append(conclusion);
      heading.innerHTML = 'The oracle has <em>spoken.</em>';
      byId('instruction').textContent = 'Keep what is useful. Leave the glitter on the table.';
      byId('actions').hidden = false;
    }
  }

  function copyReading() {
    const text = [heading.textContent, byId('setting').textContent, ...[...document.querySelectorAll('#beats p')].map((p) => p.textContent)].join('\n\n');
    navigator.clipboard?.writeText(text).then(() => { live.textContent = 'Reading copied to your clipboard.'; }).catch(() => { live.textContent = 'Copy did not work here; the reading remains visible.'; });
  }

  byId('shuffle').addEventListener('click', deal);
  byId('again').addEventListener('click', deal);
  byId('copy').addEventListener('click', copyReading);
})();
