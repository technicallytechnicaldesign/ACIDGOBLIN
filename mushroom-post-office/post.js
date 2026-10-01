(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const front = $('postcard'), back = $('writing');
  const ink = '#211820', paper = '#fffaf0', pink = '#f4479a', teal = '#078c8c', violet = '#74439a';
  const scenes = [
    ['MOONLIT MUSHROOMS', 'postcard-moonlit-v2.webp'], ['CLOUD COURIER', 'postcard-cloud-v2.webp'],
    ['MOSSY WINDOW', 'postcard-window-v2.webp'], ['MUSHROOM POST OFFICE', 'post-office-v2.webp'],
    ['THE BOOKSHOP', 'bookshop.webp'], ['THE NEWSSTAND', 'newsstand.webp'], ['THE ORACLE', 'oracle.webp'],
    ['THE GOSSIP WELL', 'gossip-well-v2.webp'], ['THE RUMMAGE YARD', 'rummage-yard-v2.webp'], ['THE MERCH STALL', 'merch.webp']
  ];
  const occasions = {everyday:'A LITTLE MAGIC, EVERY DAY', market:'MEET ME ON MARKET DAY', moon:'UNDER THE SAME STRANGE MOON', wish:'SENDING A LITTLE LUCK YOUR WAY'};
  const icons = ['mushroom','moon','star','heart','key','leaf','eye','letter','bolt','snail'];
  const suggestions = [
    'Dear you, the moon says your strange little route still counts.', 'Found a good pebble. Thought you should know.',
    'Wish you were here-ish. The mushrooms are excellent listeners.', 'The path was longer than expected and kinder than predicted.',
    'I saved you the brightest cloud. It may arrive sideways.', 'Nothing urgent. Just proof that I thought of you today.',
    'The kettle remembers your favourite song. Come by soon.', 'Tiny news: a lantern found its way home. So can we.'
  ];
  let format = 'postcard', selected = 'mushroom', opened = false, dragging = -1, lastSuggestion = -1;
  let marks = [{kind:'mushroom',x:1060,y:158}], artwork = [], stamps, loaded = false, busy = false;
  const say = text => { $('postmaster-line').textContent = text; };
  const loadImage = path => new Promise((resolve,reject) => {
    const image = new Image(); image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${path}`)); image.src = `../town-assets/${path}`;
  });
  function box(c,x,y,w,h,fill,stroke=null,width=3) {
    c.fillStyle=fill; c.fillRect(x,y,w,h);
    if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.strokeRect(x,y,w,h);}
  }
  function line(c,x,y,xx,yy,color=ink,width=3) {
    c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.strokeStyle=color;c.lineWidth=width;c.stroke();
  }
  function text(c,value,x,y,size=20,color=ink,font="'Courier New',monospace") {
    c.fillStyle=color;c.font=`700 ${size}px ${font}`;c.fillText(value,x,y);
  }
  // Wrap even uninterrupted words; preserve intentional blank lines.
  function wrap(c,value,width) {
    const lines=[];
    for(const paragraph of value.split('\n')) {
      let row='';
      for(const word of paragraph.split(/\s+/).filter(Boolean)) {
        const candidate=row?`${row} ${word}`:word;
        if(c.measureText(candidate).width<=width){row=candidate;continue;}
        if(row){lines.push(row);row='';}
        for(const char of word){if(row&&c.measureText(row+char).width>width){lines.push(row);row='';}row+=char;}
      }
      lines.push(row);
    }
    return lines;
  }
  function paragraph(c,value,x,y,width,height,size=40,min=16,color=ink) {
    let rows,initialSize=size;
    // Keep intentional line breaks unless they alone would push the note off the paper.
    for(let attempt=0;attempt<2;attempt++) {
      for(size=initialSize;size>=min;size--){c.font=`500 ${size}px Georgia,serif`;rows=wrap(c,value,width);if(rows.length*size*1.28<=height)break;}
      if(size>=min)break;
      value=value.replace(/\s+/g,' ');
    }
    size=Math.max(size,min);c.font=`500 ${size}px Georgia,serif`;
    c.fillStyle=color;rows.forEach((row,i)=>c.fillText(row,x,y+size+i*size*1.28));
  }
  function fit(c,value,x,y,width,size=30,color=ink) {
    while(size>12){c.font=`700 ${size}px 'Courier New',monospace`;if(c.measureText(value).width<=width)break;size--;}
    c.fillStyle=color;c.fillText(value,x,y);
  }
  function imageFit(c,image,x,y,w,h,cover=false) {
    const scale=(cover?Math.max:Math.min)(w/image.width,h/image.height);
    c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
    c.drawImage(image,x+(w-image.width*scale)/2,y+(h-image.height*scale)/2,image.width*scale,image.height*scale);c.restore();
  }
  function stamp(c,mark,i) {
    if(!stamps)return;
    const index=icons.indexOf(mark.kind),sw=stamps.width/5,sh=stamps.height/2;
    c.save();c.translate(mark.x,mark.y);c.rotate((i%5-2)*.04);
    box(c,-53,-61,106,122,paper,ink,3);
    c.drawImage(stamps,(index%5)*sw,Math.floor(index/5)*sh,sw,sh,-42,-49,84,84);
    text(c,'GOBLIN POST',-44,49,13,violet);c.restore();
  }
  function drawFront() {
    const c=front.getContext('2d'),scene=Number($('scene').value),occasion=$('occasion').value;
    c.clearRect(0,0,1200,800);box(c,0,0,1200,800,paper);
    box(c,18,18,1164,550,occasion==='moon'?'#282746':occasion==='market'?'#f6d38b':'#c0d9c4');
    if(artwork[scene])imageFit(c,artwork[scene],18,18,1164,550,scene<3);
    if(occasion==='market') {
      line(c,30,62,1170,62,ink,3);
      for(let i=0;i<14;i++){c.beginPath();c.moveTo(35+i*82,64);c.lineTo(104+i*82,64);c.lineTo(70+i*82,122);c.closePath();c.fillStyle=[pink,'#f8dc73',teal][i%3];c.fill();c.stroke();}
    } else if(occasion==='moon') {
      c.beginPath();c.arc(1030,133,67,0,Math.PI*2);c.fillStyle='#fff2ad';c.fill();
      c.beginPath();c.arc(1058,110,62,0,Math.PI*2);c.fillStyle='#282746';c.fill();
      [[96,128],[195,85],[920,72],[1100,251]].forEach(([x,y])=>text(c,'✦',x,y,39,'#fff2ad'));
    } else if(occasion==='wish') {
      [[90,110],[1040,132],[132,480],[1060,465]].forEach(([x,y],i)=>text(c,i%2?'✧':'✦',x,y,60,pink));
    }
    box(c,38,505,1124,44,paper,ink,2);fit(c,`${scenes[scene][0]}  /  GOBLIN TOWN`,60,535,1080,22,violet);
    const headline=$('headline').value.trim();
    if(headline)paragraph(c,headline,48,578,1104,142,64,28);
    text(c,occasions[occasion],48,760,23,teal);
    c.strokeStyle=ink;c.lineWidth=8;c.strokeRect(4,4,1192,792);
    front.setAttribute('aria-label',`Picture side: ${scenes[scene][0].toLowerCase()}, ${occasions[occasion].toLowerCase()}. ${headline}`);
  }
  function drawBack() {
    const c=back.getContext('2d');c.clearRect(0,0,1200,800);box(c,0,0,1200,800,paper);
    text(c,format==='fold'?'A LITTLE NOTE, JUST FOR YOU':'POSTCARD FROM GOBLIN TOWN',44,54,25,violet);
    c.setLineDash([7,7]);c.strokeStyle='#b8a895';c.lineWidth=2;c.strokeRect(40,83,1120,155);c.setLineDash([]);
    if(!marks.length)text(c,'QUESTIONABLE POSTAGE GOES HERE',66,170,23,'#a99989');
    marks.forEach((mark,i)=>stamp(c,mark,i));
    line(c,42,270,1158,270,ink,3);line(c,814,299,814,699,'#c8b7a5',2);
    const note=$('message').value.trim()||'Dear whoever finds this,\nthere is still room for a little magic.';
    paragraph(c,note,48,300,718,384,42,14);
    text(c,'TO',852,340,20,teal);paragraph(c,$('recipient').value.trim()||'Someone lovely',852,358,296,145,32,20);
    line(c,850,520,1150,520,'#c8b7a5',2);text(c,'FROM',852,563,20,teal);
    paragraph(c,$('sender').value.trim()||'A friend in Goblin Town',852,580,296,130,30,18);
    line(c,42,728,1158,728,ink,2);text(c,'POSTMASTER DOT / NO RETURN ADDRESS NEEDED',48,772,19,violet);
    text(c,'GT ✳',1050,776,30,pink);c.strokeStyle=ink;c.lineWidth=8;c.strokeRect(4,4,1192,792);
    back.setAttribute('aria-label',`Writing side. To ${$('recipient').value||'someone lovely'}. ${note} From ${$('sender').value||'a friend in Goblin Town'}. ${marks.length} stamps.`);
  }
  function draw(){drawFront();drawBack();}
  function showSide(value) {
    opened=value;dragging=-1;$('viewer').classList.toggle('is-open',opened);
    $('turn').textContent=opened?'Back to the picture ↻':format==='fold'?'Open the card ↗':'Turn it over ↻';
    $('turn').setAttribute('aria-expanded',String(opened));
    $('side-label').textContent=opened?(format==='fold'?'Inside, just for you':'The writing side'):'The picture side';
    $('preview-help').textContent=opened?'Tap the postage strip to add a stamp. Drag stamps within the strip; your words stay clear.':'Two sides, one tiny journey. '+(format==='fold'?'Open it to see your note.':'Turn it over to see your note.');
    back.tabIndex=opened?0:-1;back.setAttribute('aria-hidden',String(!opened));front.setAttribute('aria-hidden',String(opened));
  }
  function controls(){['download','gift'].forEach(id=>{$(id).disabled=!loaded||busy;});}
  $('turn').addEventListener('click',()=>showSide(!opened));
  document.querySelectorAll('[data-format].choice').forEach(button=>button.addEventListener('click',()=>{
    format=button.dataset.format;$('viewer').dataset.format=format;
    document.querySelectorAll('[data-format].choice').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    drawBack();showSide(false);
  }));
  ['scene','occasion','headline'].forEach(id=>$(id).addEventListener('input',()=>{drawFront();showSide(false);}));
  ['message','recipient','sender'].forEach(id=>$(id).addEventListener('input',()=>{$('counter').textContent=`${$('message').value.length} / 240`;drawBack();showSide(true);}));
  $('suggest').addEventListener('click',()=>{
    let next=Math.floor(Math.random()*suggestions.length);if(next===lastSuggestion)next=(next+1)%suggestions.length;
    lastSuggestion=next;$('message').value=suggestions[next];$('message').dispatchEvent(new Event('input'));say('That sounds like a message worth keeping.');
  });
  icons.forEach(kind=>{
    const button=document.createElement('button');button.type='button';button.className='decor';button.dataset.kind=kind;
    button.setAttribute('aria-label',`Select ${kind} stamp`);button.setAttribute('aria-pressed',String(kind===selected));
    button.innerHTML=`<span class="stamp-art stamp-art--${kind}" aria-hidden="true"></span><small>${kind}</small>`;
    button.addEventListener('click',()=>{selected=kind;$('drawer').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));showSide(true);say(`${kind[0].toUpperCase()+kind.slice(1)} postage, ready for the writing side.`);});
    $('drawer').append(button);
  });
  function add(x,y){if(marks.length>=9){say('Nine stamps is a full postbag. Undo a stamp to make room.');return false;}marks.push({kind:selected,x,y});drawBack();say('A little more magic in the post.');return true;}
  $('add-stamp').addEventListener('click',()=>{showSide(true);let slot=0;while(slot<9&&marks.some(m=>Math.abs(m.x-(1060-slot*118))<65))slot++;add(1060-Math.min(slot,8)*118,158);});
  $('undo').addEventListener('click',()=>{marks.pop();showSide(true);drawBack();say('Last stamp lifted.');});
  $('clear').addEventListener('click',()=>{marks=[];showSide(true);drawBack();say('Fresh postage strip. Your note is still here.');});
  const point=e=>{const r=back.getBoundingClientRect();return{x:(e.clientX-r.left)*1200/r.width,y:(e.clientY-r.top)*800/r.height};};
  back.addEventListener('pointerdown',e=>{
    if(!opened||e.button!==0)return;const p=point(e);if(p.y<95||p.y>226)return;
    dragging=marks.findLastIndex(m=>Math.abs(p.x-m.x)<57&&Math.abs(p.y-m.y)<64);
    if(dragging<0&&add(Math.max(99,Math.min(1101,p.x)),158))dragging=marks.length-1;
    if(dragging>=0)back.setPointerCapture(e.pointerId);
  });
  back.addEventListener('pointermove',e=>{if(dragging<0||!back.hasPointerCapture(e.pointerId))return;const p=point(e);marks[dragging].x=Math.max(99,Math.min(1101,p.x));drawBack();});
  ['pointerup','pointercancel','lostpointercapture'].forEach(event=>back.addEventListener(event,()=>{dragging=-1;}));
  back.addEventListener('keydown',e=>{if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();marks.pop();drawBack();}});
  function flatCanvas() {
    const layout=$('flat-layout').value;if(layout==='front')return front;if(layout==='back')return back;
    const canvas=document.createElement('canvas');canvas.width=2440;canvas.height=840;const c=canvas.getContext('2d');
    box(c,0,0,2440,840,'#eadfc7');c.drawImage(front,10,10);c.drawImage(back,1230,10);
    text(c,'PICTURE SIDE',10,832,16,violet);text(c,format==='fold'?'INSIDE / WRITING SIDE':'REVERSE / WRITING SIDE',1230,832,16,violet);return canvas;
  }
  const png=canvas=>new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Image export failed.')),'image/png'));
  function save(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
  async function exporting(work){if(!loaded||busy)return;busy=true;controls();try{await work();}catch(error){console.error(error);say('The postbag hit a snag. Please try again.');}finally{busy=false;controls();}}
  $('download').addEventListener('click',()=>exporting(async()=>{save(await png(flatCanvas()),`goblin-town-${format}-${$('flat-layout').value}.png`);say('Both worlds, packed flat. Your picture is in Downloads.');}));
  $('gift').addEventListener('click',()=>exporting(async()=>{
    const response=await fetch('./post.css');if(!response.ok)throw new Error('Could not load gift styling.');
    const css=await response.text(),frontImage=front.toDataURL('image/png'),backImage=back.toDataURL('image/png');
    const frontAlt=front.getAttribute('aria-label'),backAlt=back.getAttribute('aria-label');
    const escape=value=>value.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
    const verb=format==='fold'?'Open your card':'Turn your postcard over';
    const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>A little post from Goblin Town</title><style>${css}
      :root{--ink:#211820;--paper:#fffaf0;--pink:#f4479a}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:#ece1c7;color:#211820;font:16px/1.5 Georgia,serif;display:grid;place-items:center;padding:24px}main{width:min(100%,1000px);text-align:center}h1{font-size:clamp(24px,5vw,38px);margin:12px}p{margin:12px 0 24px}.gift-frame{padding:18px;background:#d7c7a2;border:3px solid #211820;border-radius:8px;overflow:hidden}button{margin-top:25px;padding:13px 20px;background:#f7da76;color:#211820;border:2px solid #211820;border-radius:6px;font:bold 15px monospace;cursor:pointer;box-shadow:3px 3px 0 #211820}button:focus-visible{outline:3px solid #f4479a;outline-offset:5px}small{display:block;margin-top:24px} .card-viewer{cursor:pointer}@media(max-width:500px){body{padding:12px}.gift-frame{padding:5px}}</style></head><body><main><small>MUSHROOM POST OFFICE · GOBLIN TOWN</small><h1>Someone thought of you.</h1><p>A little piece of here, delivered to wherever you are.</p><div class="gift-frame"><div class="card-viewer" id="viewer" data-format="${format}"><div class="card-body"><div class="card-face writing-face" aria-hidden="true"><img alt="${escape(backAlt)}" src="${backImage}"></div><div class="card-face cover-face"><img alt="${escape(frontAlt)}" src="${frontImage}"><div class="cover-inside" aria-hidden="true"><span>A little piece<br>of Goblin Town.<i>✳</i>Kept just for you.</span></div></div></div></div></div><button id="turn" aria-expanded="false">${verb} ↻</button><small id="status" role="status">The picture side</small><noscript><p>Your note is below.</p><img style="width:100%" alt="${escape(backAlt)}" src="${backImage}"></noscript></main><script>const viewer=document.getElementById('viewer'),button=document.getElementById('turn');function turn(){const open=viewer.classList.toggle('is-open');button.setAttribute('aria-expanded',String(open));button.textContent=open?'Back to the picture ↻':'${verb} ↻';viewer.querySelector('.writing-face').setAttribute('aria-hidden',String(!open));viewer.querySelector('.cover-face>img').setAttribute('aria-hidden',String(open));document.getElementById('status').textContent=open?'A note, just for you':'The picture side';}button.addEventListener('click',turn);viewer.addEventListener('click',turn);<\/script></body></html>`;
    save(new Blob([html],{type:'text/html;charset=utf-8'}),`a-little-goblin-${format}-gift.html`);say('Gift wrapped! Send the HTML file; its pictures and note work offline.');
  }));
  if(navigator.share&&navigator.canShare){$('share').hidden=false;$('share').addEventListener('click',()=>exporting(async()=>{
    const file=new File([await png(flatCanvas())],'goblin-town-card.png',{type:'image/png'});
    if(!navigator.canShare({files:[file]})){say('This device prefers a downloaded postcard.');return;}
    try{await navigator.share({files:[file],title:'A little post from Goblin Town'});}catch(error){if(error.name!=='AbortError')throw error;}
  }));}
  draw();showSide(false);
  Promise.all([...scenes.map(([,path])=>loadImage(path)),loadImage('postcard-stamps-v2.webp')]).then(images=>{
    artwork=images.slice(0,scenes.length);stamps=images[scenes.length];loaded=true;draw();controls();say('All destinations are accepted, including “somewhere nicer.”');
  }).catch(error=>{console.error(error);say('The postbag lost its pictures. Please reload before saving.');});
  document.fonts.ready.then(draw);
})();
