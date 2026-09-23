(() => {
  const deck = window.GOBLIN_DECK || [];
  const slots = ['Situation', 'Complication', 'Unreasonable Way Through'];
  const disguises = [
    'a calendar problem',
    'a personality flaw with paperwork',
    'something that needs one more tab open',
    'a test you can pass by thinking harder',
    'an emergency hat you have to keep wearing'
  ];
  const observers = [
    'a pocket moth with a clipboard',
    'a tiny focus group of three mushrooms',
    'a pigeon wearing a ceremonial lanyard',
    'a spoon that has learned to say no',
    'one extremely calm snail'
  ];
  const nextMoves = [
    'send the small message',
    'put one useful thing where your hands can find it',
    'take a proper pause before inventing a new obligation',
    'choose the kindest available next step',
    'stop polishing the doorway and walk through it'
  ];
  const state = { cards: [], revealed: 0, fortune: null };
  const byId = (id) => document.getElementById(id);
  const grid = byId('card-grid');
  const heading = document.querySelector('#reading-title');
  const live = byId('live');
  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const shuffle = (items) => {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
    }
    return shuffled;
  };

  function cardWords(entry) {
    return entry.card.keywords.split(',').map((word) => word.trim());
  }

  function cardMessage(entry) {
    return entry.reversed ? entry.card.reversed : entry.card.upright;
  }

  function buildFortune() {
    return { disguise: pick(disguises), observer: pick(observers), nextMove: pick(nextMoves) };
  }

  function postureLine(entry, observer) {
    if (entry.reversed) return pick([
      'It has appeared upside down, which is its impolite little way of asking whether you have mistaken motion for meaning.',
      'Upside down, it refuses to let your old habits cosplay as a compass.',
      'It arrives backwards and wonders whether the thing you keep postponing is already trying to help you.'
    ]);
    return pick([
      `Right-way-up, it notices that ${observer} has already been guarding the answer in your quieter pocket.`,
      `It stands very still while ${observer} demonstrates that your gentler instinct is not lost, only wearing a funny hat.`,
      `Facing you plainly, it lets ${observer} remind you that a pause is also part of the dance.`
    ]);
  }

  function makeBeat(entry, position) {
    const fortune = state.fortune;
    const card = entry.card;
    const message = cardMessage(entry);
    const messageStem = message.replace(/[.!?]+$/, '');
    const [theme] = cardWords(entry);
    if (position === 0) {
      return `${card.title} reveals that you have been treating ${theme} like ${fortune.disguise}, when it is really a living thing with crumbs in its pockets. ${postureLine(entry, fortune.observer)} It rings a tiny bell for you: “${message}”`;
    }
    if (position === 1) {
      const first = state.cards[0];
      const [firstTheme] = cardWords(first);
      return `${card.title} catches you trying to make ${firstTheme} and ${theme} agree before either has had a biscuit. ${postureLine(entry, fortune.observer)} It exchanges a knowing look with ${first.card.title} and says: “${message}”`;
    }
    const [firstTheme] = cardWords(state.cards[0]);
    const [secondTheme] = cardWords(state.cards[1]);
    return `${card.title} points to the small place where ${firstTheme}, ${secondTheme}, and ${theme} are already talking to one another. ${postureLine(entry, fortune.observer)} It says, “${messageStem},” and suggests one small move: ${fortune.nextMove}.`;
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
    button.innerHTML = `<span class="card-inner"><span class="card-back"><span class="back-eye">◉</span><span>${slots[index]}</span><small>Goblin oracle</small></span><span class="card-face" hidden aria-hidden="true"><span class="card-number">${entry.card.number}</span><span class="card-art"><img src="${entry.card.source}" alt="${entry.card.artAlt}"><span class="missing-art">${entry.card.title}</span></span><span class="card-title">${entry.card.title}</span><span class="orientation">${orientation}</span><span class="keywords">${entry.card.keywords}</span></span></span>`;
    button.addEventListener('click', () => reveal(index));
    const img = button.querySelector('img');
    if (img) img.addEventListener('error', () => imageFailed(img), { once: true });
    grid.append(button);
  }

  function deal() {
    const chosen = shuffle(deck).slice(0, 3).map((card) => ({ card, reversed: Math.random() < 0.34 }));
    state.cards = chosen;
    state.revealed = 0;
    state.fortune = buildFortune();
    grid.replaceChildren();
    chosen.forEach(renderCard);
    byId('reading-copy').hidden = true;
    byId('actions').hidden = true;
    byId('setting').textContent = 'A small fortune for the creature currently holding the mouse.';
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
    face.setAttribute('aria-hidden', 'false');
    button.classList.add('is-revealed');
    button.disabled = true;
    button.setAttribute('aria-label', `${slots[index]}: ${state.cards[index].card.title}, ${state.cards[index].reversed ? 'reversed' : 'upright'}`);
    const beat = document.createElement('p');
    beat.className = 'beat';
    beat.textContent = makeBeat(state.cards[index], index);
    byId('beats').append(beat);
    byId('reading-copy').hidden = false;
    state.revealed += 1;
    live.textContent = `${slots[index]} revealed: ${beat.textContent}`;
    if (state.revealed < state.cards.length) {
      const next = grid.querySelector(`[data-index="${state.revealed}"]`);
      next.disabled = false;
      byId('instruction').textContent = `Now turn over ${slots[state.revealed]}.`;
    } else {
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
