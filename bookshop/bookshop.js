(() => {
  const books = [
    {
      title:'Wavy Days', category:'Book 01 · pocket weather report',
      lede:'An illustrated, interactive field guide for hard weeks and mixed skies.',
      activities:['Choose your internal weather', 'Take one unproductive breath', 'Keep a pocket reminder'],
      href:'../wavy-days-issue-01/', cover:'wavy', note:'9 illustrated pages · interactive',
      peeks:[
        {title:'Both belong', question:'What is your internal weather today?', hash:'#page-2', x:'33.333%', y:'0%', art:'A smiling sun and friendly rain cloud water a flower'},
        {title:'Pause participates', question:'Can you take one unproductive breath?', hash:'#page-4', x:'100%', y:'0%', art:'A ghost rests under a patchwork blanket beside a moon and mug'},
        {title:'Stay by changing', question:'What if this version of you is a verb?', hash:'#page-5', x:'0%', y:'100%', art:'A snail carries a moon shrine as its shell changes shape'}
      ],
      moss:[
        'Ah, Wavy Days. Some skies have six feelings before lunch; this book brings a little umbrella.',
        'Psst, this one says a storm can be a story without becoming your entire name.',
        'The weather shelf keeps changing its mind. I find that very polite of it.'
      ]
    },
    {
      title:'Not My Fucking Fire', category:'Book 02 · field guide to boundaries',
      lede:'A practical, interactive field guide for caring without carrying the whole emergency.',
      activities:['Name what was actually asked of you', 'Sort what is yours to touch', 'Find one clean next action'],
      href:'../not-my-fucking-fire-zine/', cover:'fire', note:'8 illustrated pages · interactive',
      peeks:[
        {title:'The pit is real', question:'What was actually asked of me?', hash:'#name-the-pit', x:'33.333%', y:'0%', art:'A small goblin takes notes while gears and paperwork burn'},
        {title:'Accurate ownership', question:'Mine to touch, or not mine to carry?', hash:'#not-my-fire', x:'66.667%', y:'0%', art:'A goblin draws a calm circle while the fire stays outside'},
        {title:'Find the cool center', question:'What is one next move?', hash:'#cool-center', x:'100%', y:'0%', art:'A goblin sits calmly in the eye of a fire and water vortex'}
      ],
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
  let peek = 0;
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
    byId('peek-question').setAttribute('aria-live', playing ? 'off' : 'polite');
  }
  function showPeek() {
    const book = books[selected];
    const page = book.peeks[peek];
    const art = byId('inside-art');
    art.className = `inside-art inside-art--${book.cover}`;
    art.style.setProperty('--peek-x', page.x);
    art.style.setProperty('--peek-y', page.y);
    art.setAttribute('aria-label', page.art);
    byId('peek-title').textContent = page.title;
    byId('peek-question').textContent = page.question;
    byId('peek-count').textContent = `${String(peek + 1).padStart(2, '0')} / ${String(book.peeks.length).padStart(2, '0')}`;
    byId('peek-link').href = book.href + page.hash;
    byId('peek-link').setAttribute('aria-label', `Open ${page.title} inside ${book.title}`);
  }
  function show(index) {
    selected = index;
    thought = 0;
    peek = 0;
    const book = books[index];
    const cover = byId('cover-link');
    cover.className = `book-cover book-cover--${book.cover}`;
    cover.href = book.href;
    cover.setAttribute('aria-label', `Open ${book.title}`);
    cover.querySelector('.sr-only').textContent = `${book.title} illustrated cover`;
    byId('book-category').textContent = book.category;
    title.textContent = book.title;
    byId('book-lede').textContent = book.lede;
    byId('book-activities').replaceChildren(...book.activities.map(activity => {
      const item = document.createElement('li');
      item.textContent = activity;
      return item;
    }));
    byId('open-book').href = book.href;
    byId('open-book').setAttribute('aria-label', `Open ${book.title}`);
    byId('book-note').textContent = book.note;
    moss.textContent = book.moss[0];
    showPeek();
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
  byId('peek-next').addEventListener('click', () => {
    playing = false;
    updateRotation();
    peek = (peek + 1) % books[selected].peeks.length;
    showPeek();
    schedule();
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
