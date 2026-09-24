(() => {
  const scraps = [
    ['spoon','Bent Spoon'],['boot','Left Boot'],['bell','Tiny Bell'],['key','Wrong Key'],
    ['teacup','Teacup'],['mushroom','Mushroom'],['clock','Clock'],['lantern','Lantern']
  ];
  // Every unordered pair is authored; the two icon layers supply the picture.
  const recipeLines = [
    '0,1|Puddle Ladle|A boot that serves soup only when it rains.|A dinner shoe. Finally, formal wear I understand.|slosh',
    '0,2|Supper Alarm|Rings whenever somebody says they are not hungry.|Keep it by the kettle. It knows.|clang',
    '0,3|Lockpick for Lunch|Opens any cupboard that already contains biscuits.|Unethical? It is lunch.|click',
    '0,4|Second Opinion Soup|Stirs your tea until it agrees with you.|I tasted it. It is mostly confidence.|swirl',
    '0,5|Spore Serving Wand|Plants a tiny forest in every bowl of porridge.|Breakfast should have terrain.|sprout',
    '0,6|Minute Scooper|Steals exactly one minute back from a boring meeting.|This one pays rent in time.|tick',
    '0,7|Glow Gravy Paddle|Makes every meal look like a campfire story.|Do not lick the light. I did.|glow',
    '1,2|Arrival Boot|Announces you three steps before you arrive.|Subtlety was never its size.|stomp',
    '1,3|Door-Finding Boot|Walks to the wrong door with impressive certainty.|It has leadership energy. Bad kind.|march',
    '1,4|Teatime Wader|Keeps your feet dry while the cup floods.|We call that hospitality.|slosh',
    '1,5|Compost Stomper|Grows mushrooms in every footprint.|Excellent for dinner; terrible for carpets.|sprout',
    '1,6|Late-Early Boot|Gets there yesterday and apologises tomorrow.|Punctuality is a rumour.|tick',
    '1,7|Night-Shift Slipper|Lights the path but refuses to wake the moths.|A surprisingly considerate shoe.|glow',
    '2,3|Keynote Bell|Rings only when the key is in your other pocket.|Cruel. Accurate. Keep it.|clang',
    '2,4|Tea Is Ready Siren|Gives the entire town a very small alert.|I heard it in my dreams.|clang',
    '2,5|Spore Chime|Summons one mushroom and its legal adviser.|The adviser is also a mushroom.|sprout',
    '2,6|Appointment With Now|Rings at the only useful moment: this one.|I would set it. I cannot.|tick',
    '2,7|Beacon Belltower|Blinks whenever a secret is about to escape.|Hide it from the Well.|glow',
    '3,4|Cupboard Cup|Unlocks the tea tin but cannot keep a secret.|A lock with loose lips. Family trait.|click',
    '3,5|Mycelium Master Key|Opens doors that grow where doors should not.|Please knock before entering the tree.|sprout',
    '3,6|Tomorrow Key|Unlocks an hour you have not wasted yet.|Use gently; the hour is shy.|tick',
    '3,7|Lost-Light Latch|Opens the lantern to let one star out.|That star owes me three buttons.|glow',
    '4,5|Toadstool Teapot|Brews rainwater into extremely local weather.|Forecast: biscuits with a chance of moss.|swirl',
    '4,6|Five-O-Clock Forever|Keeps tea warm until time gives up.|I endorse this whole clock.|tick',
    '4,7|Moonbrew Cup|Catches a lantern glow and serves it as tea.|It tastes like an encouraging window.|glow',
    '5,6|Seasonal Stopwatch|Counts down to the next mysterious mushroom.|It never reaches zero when watched.|tick',
    '5,7|Glowcap Escort|A portable mushroom that knows the way home.|More reliable than the signpost.|glow',
    '6,7|Nightlight Overtime|A clock that dims when you should stop working.|Offensive. Necessary. Approved.|tick'
  ];
  const recipes = new Map(recipeLines.map(entry => { const [pair,name,line,opinion,verb] = entry.split('|'); return [pair,{name,line,opinion,verb}]; }));
  if (recipes.size !== 28) throw new Error('All 28 rummage pairings are required.');
  const tray = document.getElementById('scraps');
  const slots = [document.getElementById('slot-a'), document.getElementById('slot-b')];
  const lever = document.getElementById('lever');
  const invention = document.getElementById('invention');
  const picked = [null,null];
  const art = id => `<span class="scrap-art scrap-art--${id}" aria-hidden="true"></span>`;
  const say = line => { document.getElementById('goblin-line').textContent = line; };
  function renderSlots() {
    slots.forEach((slot,i) => {
      const index = picked[i];
      slot.classList.toggle('filled',index !== null);
      slot.innerHTML = index === null ? `Drop ${i ? 'second' : 'first'} scrap` : `${art(scraps[index][0])}<span>${scraps[index][1]} ×</span>`;
      slot.setAttribute('aria-label',index === null ? `${i ? 'Second' : 'First'} scrap, empty` : `${scraps[index][1]} in ${i ? 'second' : 'first'} slot; click to clear`);
    });
    tray.querySelectorAll('.scrap').forEach((button,i) => button.setAttribute('aria-pressed',String(picked.includes(i))));
    lever.disabled = picked.includes(null);
  }
  function choose(index, preferred = -1) {
    if (picked.includes(index)) { say('We already have that scrap. Two different mistakes, please.'); return; }
    const slot = preferred >= 0 ? preferred : picked.indexOf(null);
    if (slot < 0) { picked[0] = picked[1]; picked[1] = index; }
    else picked[slot] = index;
    renderSlots();
    say(picked.includes(null) ? 'A beginning. Now find it an accomplice.' : 'That is a terrible idea. Pull the lever.');
  }
  scraps.forEach(([id,name],index) => {
    const button = document.createElement('button');
    button.className = 'scrap'; button.type = 'button'; button.dataset.index = index;
    button.setAttribute('aria-label',`Choose ${name}`); button.setAttribute('aria-pressed','false');
    button.innerHTML = `${art(id)}<span>${name}</span>`;
    button.addEventListener('click',() => { if (button.dataset.dragged === '1') { button.dataset.dragged = ''; return; } choose(index); });
    button.addEventListener('pointerdown',event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      button.setPointerCapture(event.pointerId);
      const start = {x:event.clientX,y:event.clientY}; let ghost = null;
      const move = e => {
        if (!ghost && Math.hypot(e.clientX-start.x,e.clientY-start.y) > 8) {
          ghost = document.createElement('div'); ghost.className = 'drag-ghost'; ghost.innerHTML = art(id); document.body.append(ghost);
        }
        if (ghost) { ghost.style.left = `${e.clientX}px`; ghost.style.top = `${e.clientY}px`; slots.forEach(s => s.classList.toggle('over',s.getBoundingClientRect().left <= e.clientX && s.getBoundingClientRect().right >= e.clientX && s.getBoundingClientRect().top <= e.clientY && s.getBoundingClientRect().bottom >= e.clientY)); }
      };
      const up = e => {
        button.removeEventListener('pointermove',move); button.removeEventListener('pointerup',up); button.removeEventListener('pointercancel',up);
        if (!ghost) return;
        ghost.remove(); slots.forEach(s=>s.classList.remove('over')); button.dataset.dragged = '1'; window.setTimeout(() => { button.dataset.dragged = ''; }, 350);
        const target = slots.findIndex(s => {const r=s.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;});
        if (target >= 0) choose(index,target);
      };
      button.addEventListener('pointermove',move); button.addEventListener('pointerup',up); button.addEventListener('pointercancel',up);
    });
    tray.append(button);
  });
  slots.forEach((slot,i) => slot.addEventListener('click',() => { if (picked[i] === null) return; picked[i] = null; renderSlots(); say('Back in the pile. The bench remembers.'); }));
  let last = null;
  lever.addEventListener('click',() => {
    const key = [...picked].sort((a,b)=>a-b).join(',');
    const result = recipes.get(key); if (!result) return;
    last = result;
    invention.innerHTML = art(scraps[picked[0]][0]) + art(scraps[picked[1]][0]); invention.disabled = false;
    document.getElementById('result-tag').textContent = `Invention no. ${[...recipes.keys()].indexOf(key)+1} / 28`;
    document.getElementById('result-name').textContent = result.name;
    document.getElementById('result-line').textContent = result.line;
    document.getElementById('result-action').textContent = `Tap it to ${result.verb} again.`;
    say(result.opinion);
    wobble();
  });
  function wobble() { invention.classList.remove('misbehave'); void invention.offsetWidth; invention.classList.add('misbehave'); }
  invention.addEventListener('click',() => { if (!last) return; wobble(); say(`${last.opinion} Again!`); });
  renderSlots();
})();
