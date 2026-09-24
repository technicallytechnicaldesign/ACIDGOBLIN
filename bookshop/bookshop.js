(() => {
  const books = [
    {
      title:'Wavy Days', category:'Book 01 · pocket weather report',
      lede:'A pocket forecast for feelings, systems and finding your way through the fog.',
      aside:'For the creature whose inner weather refuses to choose just one sky.',
      href:'../wavy-days-issue-01/', cover:'wavy', note:'Interactive zine · Read in your browser',
      moss:[
        'Ah, Wavy Days. Some skies have six feelings before lunch; this book brings a little umbrella.',
        'Psst, this one says a storm can be a story without becoming your entire name.',
        'The weather shelf keeps changing its mind. I find that very polite of it.'
      ]
    },
    {
      title:'Not My Fucking Fire', category:'Book 02 · field guide to boundaries',
      lede:'A field guide for helping without becoming the whole emergency department.',
      aside:'For the generous goblin who has been handed one too many buckets.',
      href:'../not-my-fucking-fire-zine/', cover:'fire', note:'Interactive zine · Read in your browser',
      moss:[
        'Oho, the fire guide! You can lend a hand without becoming the entire bucket brigade.',
        'The bucket is optional, dear creature. Even the flames know whose job this is.',
        'I shelved this one beside the tea. Boundaries read better with a warm cup.'
      ]
    }
  ];

  const byId = id => document.getElementById(id);
  const strip = byId('book-strip');
  const title = byId('book-title');
  const moss = byId('moss-line');
  const rotation = byId('rotation');
  let selected = 0;
  let thought = 0;
  let playing = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let pausedForFocus = false;
  let pausedForHover = false;
  let timer;

  books.forEach((book, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'shelf-book';
    button.setAttribute('aria-label', `Show ${book.title}`);
    button.setAttribute('aria-pressed', String(index === 0));
    const image = document.createElement('span');
    image.className = `shelf-cover shelf-cover--${book.cover}`;
    image.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    const number = document.createElement('small');
    number.textContent = `No. 0${index + 1}`;
    label.append(number, document.createTextNode(book.title));
    button.append(image, label);
    button.addEventListener('click', () => choose(index));
    button.addEventListener('keydown', event => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const next = (index + 1) % books.length;
      strip.children[next].focus();
      choose(next);
    });
    strip.append(button);
  });

  function updateRotation() {
    rotation.textContent = playing ? 'Pause browsing Ⅱ' : 'Browse for me ▶';
    rotation.setAttribute('aria-pressed', String(playing));
    title.setAttribute('aria-live', playing ? 'off' : 'polite');
    moss.setAttribute('aria-live', playing ? 'off' : 'polite');
  }
  function show(index) {
    selected = index;
    thought = 0;
    const book = books[index];
    const cover = byId('cover-link');
    cover.className = `book-cover book-cover--${book.cover}`;
    cover.href = book.href;
    cover.setAttribute('aria-label', `Open ${book.title}`);
    cover.querySelector('.sr-only').textContent = `${book.title} illustrated cover`;
    byId('book-category').textContent = book.category;
    title.textContent = book.title;
    byId('book-lede').textContent = book.lede;
    byId('book-aside').textContent = book.aside;
    byId('open-book').href = book.href;
    byId('open-book').setAttribute('aria-label', `Open ${book.title}`);
    byId('book-note').textContent = book.note;
    moss.textContent = book.moss[0];
    [...strip.children].forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  }
  function schedule() {
    clearTimeout(timer);
    if (!playing || pausedForFocus || pausedForHover || document.hidden) return;
    timer = setTimeout(() => { show((selected + 1) % books.length); schedule(); }, 10000);
  }
  function choose(index) {
    playing = false;
    updateRotation();
    show(index);
    schedule();
  }
  rotation.addEventListener('click', () => { playing = !playing; pausedForFocus = false; updateRotation(); schedule(); });
  byId('moss-more').addEventListener('click', () => {
    thought = (thought + 1) % books[selected].moss.length;
    moss.textContent = books[selected].moss[thought];
  });
  const viewer = strip.closest('.reading-room');
  viewer.addEventListener('focusin', event => { pausedForFocus = event.target !== rotation; schedule(); });
  viewer.addEventListener('focusout', () => { setTimeout(() => { pausedForFocus = viewer.contains(document.activeElement) && document.activeElement !== rotation; schedule(); }, 0); });
  byId('cover-link').addEventListener('pointerenter', () => { pausedForHover = true; schedule(); });
  byId('cover-link').addEventListener('pointerleave', () => { pausedForHover = false; schedule(); });
  strip.addEventListener('pointerenter', () => { pausedForHover = true; schedule(); });
  strip.addEventListener('pointerleave', () => { pausedForHover = false; schedule(); });
  document.addEventListener('visibilitychange', schedule);
  updateRotation();
  schedule();
})();
