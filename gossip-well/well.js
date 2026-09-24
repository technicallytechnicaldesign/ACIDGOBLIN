(() => {
  const rumours = [
    ['Moss alphabetised the rain and says the letter B is still missing.','../bookshop/','Ask Moss at the Bookshop'],
    ['Pip printed tomorrow’s headline on yesterday’s wrapping paper.','../newsstand/','Inspect the Newsstand'],
    ['The Oracle knows which card you nearly chose, but is being polite.','../tarot/','Visit the Oracle'],
    ['A poster left the Merch stall and came back with a different slogan.','../free-chaos-merch/','Browse Chaos Merch'],
    ['Trippa taught a streetlamp three new colours and one bad habit.','https://technicallytechnicaldesign.github.io/acidgoblin-tripper/','Meet Trippa'],
    ['Bix built a clock from a boot and now every Tuesday limps.','../rummage-yard/','See Bix’s workbench'],
    ['The Post Office has a stamp for letters that have not been written yet.','../mushroom-post-office/','Find the Post Office'],
    ['Moss keeps a tiny index of all the books that are secretly doors.','../bookshop/','Ask Moss'],
    ['Pip’s next issue contains an interview with a very shy spoon.','../newsstand/','Check the paper'],
    ['A mushroom sent itself a postcard from the other side of the path.','../mushroom-post-office/','Send a postcard'],
    ['The moon borrowed a step ladder and has not returned it.'],
    ['One of the cobblestones is practising for a part in a mountain.'],
    ['The bench at the crossroads has joined a union of one.'],
    ['Three teacups voted to call a drizzle “indoor weather.”'],
    ['A moth has been appointed night shift manager of the lanterns.'],
    ['The old signpost points home no matter where it faces.'],
    ['Someone planted a question mark. It has begun to sprout.'],
    ['The puddle near the bakery reflects a different Tuesday.'],
    ['A snail has requested a faster postcode, for irony.'],
    ['Every lost button in Town is attending the same secret meeting.'],
    ['The north arrow is on holiday and left a polite note.'],
    ['Two clouds traded shadows and both got the better deal.'],
    ['The kettle whistles only when nobody is in a hurry.'],
    ['A tiny ladder appeared behind the moss. No one can reach it.'],
    ['The mayoral pebble has declined a second term.'],
    ['A biscuit was seen crossing the bridge without a plate.'],
    ['The afternoon has been folded and put in a coat pocket.'],
    ['A very small thunderstorm has rented the shed for rehearsals.'],
    ['The stars are rearranging themselves into an apology.'],
    ['One houseplant claims to remember the island before it floated.'],
    ['The map has added a road that only exists on rainy days.'],
    ['A pair of socks has been named cultural attaché to the moon.'],
    ['The well is certain it heard a secret from a silent stone.'],
    ['A window is practising how to be a doorway, slowly.'],
    ['The mushroom choir has cancelled practice to hear the wind.'],
    ['A lantern gave directions to a firefly and got corrected.'],
    ['The bakery sells “almost yesterday” in a paper bag.'],
    ['Someone has been leaving compliments under the wrong doormat.'],
    ['A clock caught itself daydreaming and missed its own hour.'],
    ['The path around Town grows half a step when no one looks.']
  ];
  if (rumours.length !== 40) throw new Error('The Gossip Well needs exactly 40 rumours.');
  const text = document.getElementById('rumour-text');
  const link = document.getElementById('rumour-link');
  const count = document.getElementById('rumour-count');
  const keeper = document.getElementById('keeper-line');
  const scene = document.getElementById('scene');
  const toss = document.getElementById('toss');
  const hear = document.getElementById('hear');
  const now = new Date();
  const day = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
  let hash = 17; for (const char of day) hash = ((hash * 31) + char.charCodeAt(0)) >>> 0;
  const daily = hash % rumours.length;
  let current = daily; let shown = 0;
  const queue = rumours.map((_,i)=>i).filter(i=>i!==daily);
  for (let i=queue.length-1;i>0;i--) {const j=Math.floor(Math.random()*(i+1));[queue[i],queue[j]]=[queue[j],queue[i]];}
  const keeperLines = [
    'I was not supposed to tell you that one.',
    'The pebble told me. I am merely quoting it.',
    'Please do not tell Pip where I got this.',
    'That is only mostly untrue.',
    'I can keep a secret for almost six seconds.',
    'If anyone asks, the well is closed.'
  ];
  function show(index, featured=false) {
    const [rumour,href,label] = rumours[index]; current=index;
    text.textContent = `“${rumour}”`;
    count.textContent = featured ? 'Featured rumour · today' : `Pebble ${shown} · from the deep`;
    if (href) {link.hidden=false;link.href=href;link.textContent=`Follow this path ↗ ${label}`;if (href.startsWith('https:')) {link.target='_blank';link.rel='noopener';} else {link.removeAttribute('target');link.removeAttribute('rel');}}
    else {link.hidden=true;link.removeAttribute('href');}
    keeper.textContent=featured?'I was not supposed to tell you any of these.':keeperLines[(shown-1)%keeperLines.length];
  }
  show(daily,true);
  toss.addEventListener('click',() => {
    toss.disabled=true; scene.classList.remove('tossing'); void scene.offsetWidth; scene.classList.add('tossing');
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    window.setTimeout(() => {if (!queue.length) {for(let i=0;i<rumours.length;i++) if(i!==daily) queue.push(i);for(let i=queue.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[queue[i],queue[j]]=[queue[j],queue[i]];}}shown++;show(queue.pop());toss.disabled=false;},window.matchMedia('(prefers-reduced-motion: reduce)').matches?100:900);
  });
  if ('speechSynthesis' in window) {
    hear.hidden=false;
    hear.addEventListener('click',() => {speechSynthesis.cancel();const voice=new SpeechSynthesisUtterance(rumours[current][0]);voice.rate=.92;voice.pitch=1.17;speechSynthesis.speak(voice);});
  }
})();
