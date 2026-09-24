(() => {
  const deck = window.GOBLIN_DECK || [];
  const voices = window.GOBLIN_VOICE || {};
  const pairLines = window.GOBLIN_PAIR_LINES || {};
  const slots = ['Situation', 'Complication', 'Unreasonable Way Through'];
  const state = { cards: [], revealed: 0, speakingTimer: null };
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

  function voiceFor(entry) {
    return voices[entry.card.title]?.[entry.reversed ? 'reversed' : 'upright'];
  }

  function speak(message) {
    const speaker = document.querySelector('.oracle-speaker');
    byId('oracle-bubble').textContent = message;
    speaker.classList.remove('is-speaking');
    void speaker.offsetWidth;
    speaker.classList.add('is-speaking');
    clearTimeout(state.speakingTimer);
    state.speakingTimer = setTimeout(() => speaker.classList.remove('is-speaking'), 800);
  }

  function pairBeat(first, second) {
    const special = !first.reversed && !second.reversed && (
      pairLines[`${first.card.title}|${second.card.title}`] ||
      pairLines[`${second.card.title}|${first.card.title}`]
    );
    if (special) return special;
    const firstVoice = voiceFor(first);
    const secondVoice = voiceFor(second);
    const turn = second.reversed ? 'upside down' : 'upright';
    return pick([
      `Oh my, ${second.card.title} ${turn} beside ${first.card.title}: ${firstVoice.echo} meets ${secondVoice.echo}; ${secondVoice.bridge}.`,
      `Interesting, interesting: ${firstVoice.echo} and ${secondVoice.echo} are speaking together; ${secondVoice.bridge}.`,
      `I see ${firstVoice.echo} touching ${secondVoice.echo}; ${second.card.title} says to ${secondVoice.bridge}.`
    ]);
  }

  function makeBeat(entry, position) {
    const voice = voiceFor(entry);
    if (position === 0) return pick(voice.lines);
    if (position === 1) return pairBeat(state.cards[0], entry);
    const [first, second] = state.cards;
    return `Shhh, ${entry.card.title} ${entry.reversed ? 'upside down' : 'upright'} answers ${voiceFor(first).echo} and ${voiceFor(second).echo}: ${voice.bridge}.`;
  }

  function makeSummary() {
    const [first, second, third] = state.cards;
    const a = voiceFor(first);
    const b = voiceFor(second);
    const c = voiceFor(third);
    return `${first.card.title} sees that you ${a.situation}, while ${second.card.title} warns that you ${b.complication}. ${third.card.title} asks you to ${c.way}.`;
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
    grid.replaceChildren();
    chosen.forEach(renderCard);
    byId('reading-copy').hidden = true;
    byId('actions').hidden = true;
    byId('setting').textContent = 'What the goblin told you:';
    byId('beats').replaceChildren();
    byId('conclusion').hidden = true;
    byId('conclusion').textContent = '';
    heading.innerHTML = 'The cards are <em>listening.</em>';
    byId('instruction').textContent = 'Turn over Situation to begin. The other cards will wait their turn.';
    live.textContent = 'Three cards dealt. Situation is ready to reveal.';
    speak('Shhh. Three cards have landed. Turn the Situation card, my curious creature.');
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
    live.textContent = `${slots[index]} revealed: ${state.cards[index].card.title}.`;
    if (state.revealed < state.cards.length) {
      speak(beat.textContent);
      const next = grid.querySelector(`[data-index="${state.revealed}"]`);
      next.disabled = false;
      byId('instruction').textContent = `Now turn over ${slots[state.revealed]}.`;
    } else {
      heading.innerHTML = 'The oracle has <em>spoken.</em>';
      byId('instruction').textContent = 'Keep what is useful. Leave the glitter on the table.';
      byId('conclusion').textContent = makeSummary();
      byId('conclusion').hidden = false;
      speak(byId('conclusion').textContent);
      byId('actions').hidden = false;
    }
  }

  function copyReading() {
    const text = [heading.textContent, byId('setting').textContent, ...[...document.querySelectorAll('#beats p')].map((p) => p.textContent), byId('conclusion').textContent].join('\n\n');
    navigator.clipboard?.writeText(text).then(() => { live.textContent = 'Reading copied to your clipboard.'; }).catch(() => { live.textContent = 'Copy did not work here; the reading remains visible.'; });
  }

  byId('shuffle').addEventListener('click', deal);
  byId('again').addEventListener('click', deal);
  byId('copy').addEventListener('click', copyReading);
  deal();
})();
