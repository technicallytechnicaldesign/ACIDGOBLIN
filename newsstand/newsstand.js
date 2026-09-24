(() => {
  const issues = [
    {
      number:'05', date:'27 Sep 2026', title:'The Right Key', headline:'Locked door opens for the patient goblin',
      also:'Also: Shed key found, fits nothing · Toolbox reaches consensus · Garden gate closes itself, apologises',
      size:'3.1 MB', cover:'../gobbo-weekly/cover-05.jpg', pdf:'../gobbo-weekly/gobbo-weekly-issue-05.pdf', file:'the-gobbo-weekly-issue-05-the-right-key.pdf',
      pip:['The Right Key is fresh off the press. Try the patient door; the loud key has had its turn.', 'I interviewed the lock. It said the quiet key had been waiting politely all along.']
    },
    {
      number:'04', date:'20 Sep 2026', title:'The Steeping Hour', headline:'Town meeting ends before the tea does',
      also:'Also: Postbox agrees to wait · Windowsill reaches consensus · Hourglass runs early, apologises',
      size:'2.5 MB', cover:'../gobbo-weekly/cover-04.jpg', pdf:'../gobbo-weekly/gobbo-weekly-issue-04.pdf', file:'the-gobbo-weekly-issue-04-the-steeping-hour.pdf',
      pip:['A town meeting shorter than tea? I nearly dropped my hat over this scoop.', 'The teapot requested a follow-up interview. It is still steeping.']
    },
    {
      number:'03', date:'13 Sep 2026', title:'Small Magic', headline:'Small spell warms far more than one kettle',
      also:'Also: Streetlamp learns one trick · Houseplant issues verdict · Coin lands on its edge',
      size:'2.5 MB', cover:'../gobbo-weekly/cover-03.jpg', pdf:'../gobbo-weekly/gobbo-weekly-issue-03.pdf', file:'the-gobbo-weekly-issue-03-small-magic.pdf',
      pip:['Small Magic made the front page. One warm kettle can start an unreasonable chain reaction.', 'I asked the streetlamp for comment. It lit up. Journalism!']
    },
    {
      number:'02', date:'30 Aug 2026', title:'The Gentle Detour', headline:'Entire town arrives sideways and counts it',
      also:'Also: Pebble named interim mayor · Chair retires from corner · Kettle remembers one song',
      size:'3.1 MB', cover:'../gobbo-weekly/cover-02.jpg', pdf:'../gobbo-weekly/gobbo-weekly-issue-02.pdf', file:'the-gobbo-weekly-issue-02-the-gentle-detour.pdf',
      pip:['A sideways arrival counts as arriving, according to every pebble I interviewed.', 'The new mayor is a pebble. It has made no promises and broken none.']
    },
    {
      number:'01', date:'24 Aug 2026', title:'The Small Weather', headline:'Local sky experiences several emotions at once',
      also:'Also: Bench remains available · Moss index up 3% · Spoon declared enough',
      size:'3.4 MB', cover:'../gobbo-weekly/cover-01.jpg', pdf:'../gobbo-weekly/gobbo-weekly-issue-01.pdf', file:'the-gobbo-weekly-issue-01-the-small-weather.pdf',
      pip:['The Small Weather is our founding scandal: one sky, several feelings, no apology.', 'The bench remains available for anyone who needs a minute with the clouds.']
    }
  ];

  const byId = id => document.getElementById(id);
  const strip = byId('issue-strip');
  const title = byId('issue-title');
  const pip = byId('pip-line');
  const rotation = byId('rotation');
  let selected = 0;
  let pipThought = 0;
  let playing = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let pausedForFocus = false;
  let pausedForHover = false;
  let timer;

  issues.forEach((issue, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'thumb';
    button.setAttribute('aria-label', `Show issue ${issue.number}, ${issue.title}`);
    button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
    const image = document.createElement('img');
    image.src = issue.cover;
    image.alt = '';
    image.width = 708;
    image.height = 945;
    const label = document.createElement('span');
    const number = document.createElement('small');
    number.textContent = `No. ${issue.number}`;
    label.append(number, document.createTextNode(issue.title));
    button.append(image, label);
    button.addEventListener('click', () => choose(index));
    button.addEventListener('keydown', event => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const next = (index + (event.key === 'ArrowRight' ? 1 : issues.length - 1)) % issues.length;
      strip.children[next].focus();
      choose(next);
    });
    strip.append(button);
  });

  function updateRotation() {
    rotation.textContent = playing ? 'Pause rotation Ⅱ' : 'Play rotation ▶';
    rotation.setAttribute('aria-pressed', String(playing));
    title.setAttribute('aria-live', playing ? 'off' : 'polite');
    pip.setAttribute('aria-live', playing ? 'off' : 'polite');
  }
  function show(index) {
    selected = index;
    pipThought = 0;
    const issue = issues[index];
    const cover = byId('issue-cover');
    cover.src = issue.cover;
    cover.alt = `Front page of The Gobbo Weekly, issue ${issue.number}, ${issue.title}. Headline: ${issue.headline}.`;
    byId('cover-link').href = issue.pdf;
    byId('cover-link').setAttribute('aria-label', `Read issue ${issue.number}, ${issue.title}`);
    byId('issue-edition').textContent = `Issue ${issue.number} · ${issue.date}`;
    title.textContent = issue.title;
    byId('issue-headline').textContent = issue.headline;
    byId('issue-also').textContent = issue.also;
    byId('read-link').href = issue.pdf;
    byId('read-link').setAttribute('aria-label', `Read issue ${issue.number}, ${issue.title}, in a new tab`);
    byId('take-link').href = issue.pdf;
    byId('take-link').download = issue.file;
    byId('take-link').setAttribute('aria-label', `Download issue ${issue.number}, ${issue.title}`);
    byId('issue-spec').textContent = `8 pages · PDF · ${issue.size}`;
    pip.textContent = issue.pip[0];
    [...strip.children].forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  }
  function schedule() {
    clearTimeout(timer);
    if (!playing || pausedForFocus || pausedForHover || document.hidden) return;
    timer = setTimeout(() => { show((selected + 1) % issues.length); schedule(); }, 8500);
  }
  function choose(index) {
    playing = false;
    updateRotation();
    show(index);
    schedule();
  }
  rotation.addEventListener('click', () => { playing = !playing; pausedForFocus = false; updateRotation(); schedule(); });
  byId('pip-more').addEventListener('click', () => {
    pipThought = (pipThought + 1) % issues[selected].pip.length;
    pip.textContent = issues[selected].pip[pipThought];
  });
  const viewer = byId('issue-strip').closest('.viewer');
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
