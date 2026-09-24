(() => {
  const host = document.querySelector('[data-shopkeeper]');
  if (!host) return;
  const bubble = host.querySelector('.keeper-bubble');
  const shop = host.dataset.shopkeeper;
  const greetings = {
    books: [
      'Psst, the books are standing very still so you think they cannot hear you.',
      'Pick a spine, dear creature. The one that wobbles back is yours.',
      'The weather shelf and the fire shelf do not agree on tea.'
    ],
    news: [
      'Extra! Extra! A tiny event has become everyone’s business!',
      'The papers are free. The opinions of the newsprint are also free.',
      'I folded the headlines myself. They keep unfolding the truth.'
    ],
    prints: [
      'Fresh ink! Please keep your elbows, omens, and expectations inside the stall.',
      'Everything here is free. The squeegee negotiated very badly.',
      'If a print stares back, it has chosen your wall.'
    ]
  };
  const details = {
    books: {
      'Wavy Days': 'Ah, Wavy Days. Some skies have six feelings before lunch; this book brings a little umbrella.',
      'Not My Fucking Fire': 'Oho, the fire guide! You can lend a hand without becoming the entire bucket brigade.'
    },
    news: {
      'The Right Key': 'The Right Key is fresh off the press. Try the patient door; the loud key has had its turn.',
      'The Steeping Hour': 'A town meeting shorter than tea? I nearly dropped my hat over this scoop.',
      'Small Magic': 'Small Magic made the front page. One warm kettle can start an unreasonable chain reaction.',
      'The Gentle Detour': 'A sideways arrival counts as arriving, according to every pebble I interviewed.',
      'The Small Weather': 'The Small Weather is our founding scandal: one sky, several feelings, no apology.'
    },
    prints: {
      'You do not need to solve the wave.': 'This one keeps splashing the drying line. You may let the wave be a wave.',
      'Small magic, large consequences.': 'A small spell escaped the print press and now the kettle has ambitions.',
      'Chaos is a kind of compass.': 'The compass print points somewhere new every time I hang it. Typical.',
      'Rest is part of the ritual.': 'This one is a permit to put the squeegee down. Officially unofficial.',
      'Everything is awesome.': 'The ink is screaming “awesome” while the dumpster smoulders. A workplace classic.',
      'Everything is cool, team.': 'The poster says cool. The thermometer has submitted a correction.',
      'Living the dream.': 'I printed this one while the machine questioned whose dream we mean.',
      'Blessed are the overcommitted.': 'A holy card for the goblin who said yes again. Please sit down.',
      'Thy deadline come.': 'The deadline approached the stall. I hid behind a stack of posters.',
      'Deliver us from scope creep.': 'I cut this print to size. The scope immediately grew another corner.'
    }
  };
  let greeting = 0;
  const say = line => { if (line && bubble.textContent !== line) bubble.textContent = line; };
  host.querySelector('.keeper-again').addEventListener('click', () => {
    greeting = (greeting + 1) % greetings[shop].length;
    say(greetings[shop][greeting]);
  });
  const selector = shop === 'books' ? '.book' : shop === 'news' ? '.copy' : '.artifact';
  document.querySelectorAll(selector).forEach(item => {
    const title = item.querySelector('h2,h3')?.textContent.trim();
    const type = item.querySelector('.type')?.textContent.trim() || '';
    const line = details[shop][title] || (shop === 'prints'
      ? type.includes('omen') ? `Oho, “${title}” wants the bright corner of your wall.` : `Look at “${title}”. Even the print press made a face.`
      : 'This one has a story tucked in its sleeve.');
    item.addEventListener('pointerenter', () => say(line));
    item.addEventListener('focusin', () => say(line));
  });
})();
