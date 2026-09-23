(() => {
  const deck = window.GOBLIN_DECK || [];
  const slots = ['Situation', 'Complication', 'Unreasonable Way Through'];
  const scenes = [
    { place: 'Moon-puddle Court', detail: 'The vending machine had begun accepting compliments instead of coins' },
    { place: 'the goblin bookshop back room', detail: 'Three receipts for one suspiciously cheap moon were arguing under a chair' },
    { place: 'the town crossroads', detail: 'A tiny bell kept ringing whenever nobody was looking' },
    { place: 'the laundrette behind the newsstand', detail: 'Every lost sock had formed a union and elected a moth' },
    { place: 'the roof of the bookshop', detail: 'The chimney was quietly teaching a kettle how to whistle' }
  ];
  const errands = [
    'return a borrowed moon before tea went cold',
    'make one small plan stop wearing such a large hat',
    'find the off-switch for a very polite emergency',
    'rescue a useful thing from the drawer marked someday',
    'untangle a tender administrative knot with three unnecessary tabs open'
  ];
  const heroes = [
    'Midge, a goblin with one warm sock and a ceremonial pencil',
    'Pip, who could hear a biscuit thinking from across the room',
    'Aunt Crumb, carrying a handbag full of unlabelled buttons',
    'Nibs, a pocket-sized goblin determined to look busy without rushing',
    'Mossy June, who had recently apologised to a lamp and meant it'
  ];
  const props = [
    'a lavender receipt',
    'one determined thimble',
    'a biscuit shaped like a small weather system',
    'a tiny flag reading MAYBE LATER',
    'a teaspoon with excellent boundaries'
  ];
  const witnesses = [
    'Three pigeons in little bureaucrat hats',
    'A cat who had not been invited but had brought opinions',
    'The night-shift librarian, pretending not to listen',
    'A row of very impressed mushrooms',
    'One toddler dragon on a municipal leash'
  ];
  const entrances = [
    'slid from beneath the oracle cloth and landed with a polite thump',
    'appeared in a puff of pink dust, already halfway through an argument',
    'arrived late, carrying the calm of something that had missed the meeting on purpose',
    'tumbled out of a pocket nobody remembered having',
    'drifted down from the ceiling as if gravity had written it a personal invitation'
  ];
  const wisdoms = [
    'Nothing had been solved forever, which was a relief: forever is far too long to hold a cup of tea.',
    'The path had not been hiding somewhere else. It had been happening under their feet each time they stopped demanding it look like a path.',
    'The town did not become less strange; they simply stopped treating strangeness as a clerical error.',
    'A small true movement turned out to be more useful than a grand promise wearing a cape.',
    'The mess was still a mess, but it had become a place where something living could happen.'
  ];
  const state = { cards: [], revealed: 0, narrative: null };
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

  function buildNarrative(cards) {
    const scene = pick(scenes);
    const narrative = {
      scene,
      hero: pick(heroes),
      errand: pick(errands),
      prop: pick(props),
      witness: pick(witnesses),
      arrivals: cards.map(() => pick(entrances)),
      wisdom: pick(wisdoms)
    };
    const firstWord = cardWords(cards[0])[0];
    const secondWord = cardWords(cards[1])[0];
    narrative.interaction = pick([
      `${cards[0].card.title} offered ${narrative.prop} to ${cards[1].card.title}, which turned it into a very small hat for the problem.`,
      `${cards[1].card.title} borrowed the ${firstWord} from ${cards[0].card.title} and returned it wearing a moustache of ${secondWord}.`,
      `${cards[0].card.title} and ${cards[1].card.title} disagreed so gently that the disagreement became a bench for tired people.`,
      `${cards[1].card.title} asked ${cards[0].card.title} to hold the wobbly end, and together they made the trouble small enough to inspect.`
    ]);
    return narrative;
  }

  function makeBeat(entry, position) {
    const story = state.narrative;
    const card = entry.card;
    const message = cardMessage(entry);
    const posture = entry.reversed ? 'upside down' : 'right-way-up';
    if (position === 0) {
      const firstPosture = entry.reversed
        ? `It had arrived upside down, so ${story.hero} had to lean their head sideways to notice its quiet suggestion: ${message}`
        : `It settled right-way-up and waited until ${story.hero} noticed its quiet suggestion: ${message}`;
      return `Once, in ${story.scene.place}, ${story.hero} was trying to ${story.errand}. ${story.scene.detail}. Then ${card.title} ${story.arrivals[0]}. ${firstPosture}`;
    }
    if (position === 1) {
      const secondPosture = entry.reversed
        ? `Being upside down, it made its own awkward truth clear: ${message}`
        : `It made its own awkward truth clear: ${message}`;
      return `Just as ${story.hero} thought the errand might be behaving itself, ${card.title} ${story.arrivals[1]}. ${story.interaction} ${story.witness} watched this with the solemn attention usually reserved for a dropped cake. ${secondPosture}`;
    }
    const [firstWord] = cardWords(state.cards[0]);
    const [secondWord] = cardWords(state.cards[1]);
    const [thirdWord] = cardWords(entry);
    const finalPosture = entry.reversed ? 'It remained upside down and seemed to agree' : 'It remained right-way-up and seemed to agree';
    return `At the last possible moment, ${card.title} ${story.arrivals[2]}. It did not defeat the errand or make a heroic speech. Instead, it placed ${firstWord}, ${secondWord}, and ${thirdWord} beside each other and waited for a useful shape to emerge. ${story.hero} took one small next step, which was more than enough. ${finalPosture}: ${message}`;
  }

  function makeConclusion() {
    const [first, second, third] = state.cards;
    const [firstWord] = cardWords(first);
    const [secondWord] = cardWords(second);
    const [thirdWord] = cardWords(third);
    return `By closing time, nobody had conquered anything. ${first.card.title} held a little ${firstWord}, ${second.card.title} made room for ${secondWord}, and ${third.card.title} let ${thirdWord} ride home in its imaginary pockets. ${storyName(first, second, third)} ${state.narrative.wisdom}`;
  }

  function storyName(first, second, third) {
    const upsideDown = [first, second, third].filter((entry) => entry.reversed).length;
    if (!upsideDown) return 'All three cards nodded as if they had planned this, which they absolutely had not.';
    if (upsideDown === 1) return 'One card was still upside down, which gave the whole scene an unexpectedly useful perspective.';
    return 'Several cards were upside down, so the town agreed to call it a different kind of map.';
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
    state.narrative = buildNarrative(chosen);
    grid.replaceChildren();
    chosen.forEach(renderCard);
    byId('reading-copy').hidden = true;
    byId('actions').hidden = true;
    byId('setting').textContent = `A little tale from ${state.narrative.scene.place}.`;
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
      const conclusion = document.createElement('p');
      conclusion.className = 'conclusion';
      conclusion.textContent = makeConclusion();
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
