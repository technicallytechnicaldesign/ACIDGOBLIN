(() => {
  const canvas = document.getElementById('postcard');
  const c = canvas.getContext('2d');
  const message = document.getElementById('message');
  const drawer = document.getElementById('drawer');
  const master = document.getElementById('postmaster-line');
  const sceneNames = ['MOONLIT MUSHROOMS','CLOUD COURIER','MOSSY WINDOW'];
  const scenePaths = ['postcard-moonlit-v2.webp','postcard-cloud-v2.webp','postcard-window-v2.webp'];
  const icons = ['mushroom','moon','star','heart','key','leaf','eye','letter','bolt','snail'];
  const suggestions = [
    'Dear you, the moon says your strange little route still counts.',
    'Found a good pebble. Thought you should know.',
    'Wish you were here-ish. The mushrooms are excellent listeners.',
    'The path was longer than expected and kinder than predicted.',
    'I saved you the brightest cloud. It may arrive sideways.',
    'Nothing urgent. Just proof that I thought of you today.',
    'The kettle remembers your favourite song. Come by soon.',
    'Tiny news: a lantern found its way home. So can we.'
  ];
  const color = {ink:'#211820',paper:'#fffaf0',pink:'#f4479a',teal:'#078c8c',violet:'#74439a'};
  let scene = 0, selected = 'mushroom';
  let marks = [{kind:'star',x:1060,y:125},{kind:'mushroom',x:105,y:420}];
  let dragging = -1, lastSuggestion = -1;
  let scenes = [], stampSheet = null;
  const loadImage = path => new Promise((resolve,reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Postcard art did not load: ${path}`));
    image.src = path;
  });
  const ready = Promise.all([
    ...scenePaths.map(path => loadImage(`../town-assets/${path}`)),
    loadImage('../town-assets/postcard-stamps-v2.webp')
  ]).then(images => {
    scenes = images.slice(0,3);
    stampSheet = images[3];
    draw();
  }).catch(error => {
    console.error(error);
    master.textContent = 'The postbag lost its pictures. Please reload the page.';
    document.getElementById('download').disabled = true;
    document.getElementById('share').hidden = true;
    throw error;
  });

  function box(x,y,w,h,fill,stroke=color.ink,lw=4) {
    c.fillStyle=fill; c.fillRect(x,y,w,h);
    if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.strokeRect(x,y,w,h);}
  }
  function line(x1,y1,x2,y2,stroke=color.ink,lw=3) {
    c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();
  }
  function label(text,x,y,size=20,fill=color.ink) {
    c.fillStyle=fill;c.font=`900 ${size}px 'Courier New',monospace`;c.fillText(text,x,y);
  }
  function icon(kind,x,y,size=76) {
    if(!stampSheet)return;
    const index=icons.indexOf(kind);
    if(index<0)return;
    const sw=stampSheet.width/5,sh=stampSheet.height/2;
    c.drawImage(stampSheet,(index%5)*sw,Math.floor(index/5)*sh,sw,sh,x-size/2,y-size/2,size,size);
  }
  function wrap(text,maxWidth,maxLines) {
    const words=text.split(/\s+/).filter(Boolean),lines=[];let row='';
    for(const word of words){const next=row?row+' '+word:word;if(c.measureText(next).width>maxWidth&&row){lines.push(row);row=word;}else row=next;}
    if(row)lines.push(row);return lines.slice(0,maxLines);
  }
  function draw() {
    c.clearRect(0,0,1200,800);
    if(scenes[scene]) c.drawImage(scenes[scene],0,0,1200,530);
    else box(0,0,1200,530,color.paper,null);
    marks.forEach((mark,i) => {
      c.save();c.translate(mark.x,mark.y);c.rotate((i%5-2)*.08);
      box(-47,-47,94,94,color.paper,color.ink,4);icon(mark.kind,0,0,76);c.restore();
    });
    box(0,530,1200,270,color.paper,null);
    line(0,530,1200,530,color.ink,8);
    label('POSTCARD FROM GOBLIN TOWN',42,580,23,color.violet);
    label(sceneNames[scene],875,580,16,color.teal);
    line(42,598,1158,598,color.ink,3);
    c.fillStyle=color.ink;c.font='700 38px Georgia,serif';
    const note=message.value.trim()||'Dear whoever finds this, there is still room for a little magic.';
    wrap(note.replace(/\n/g,' '),870,3).forEach((row,i)=>c.fillText(row,48,655+i*45));
    label('POSTMASTER DOT  /  NO RETURN ADDRESS NEEDED',48,778,17,color.violet);
    c.beginPath();c.arc(1100,713,55,0,Math.PI*2);c.strokeStyle=color.pink;c.lineWidth=5;c.stroke();
    label('GT',1074,720,29,color.pink);line(1040,743,1168,743,color.pink,4);
    c.strokeStyle=color.ink;c.lineWidth=8;c.strokeRect(4,4,1192,792);
    canvas.setAttribute('aria-label',`Postcard preview: ${sceneNames[scene].toLowerCase()}, ${marks.length} decorations, message: ${note}`);
  }
  function announce() {
    master.textContent=marks.length>5?'That is premium postage. I may have to invent a higher rate.':marks.length>2?'Every extra stamp improves the odds of arriving somewhere interesting.':'All destinations are accepted, including “somewhere nicer.”';
  }
  icons.forEach(kind => {
    const button=document.createElement('button');button.className='decor';button.type='button';button.dataset.kind=kind;
    button.setAttribute('aria-label',`Select ${kind} decoration`);button.setAttribute('aria-pressed',String(kind===selected));
    button.innerHTML=`<span class="stamp-art stamp-art--${kind}" aria-hidden="true"></span><small>${kind}</small>`;
    button.addEventListener('click',()=>{selected=kind;drawer.querySelectorAll('.decor').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));master.textContent=`${kind[0].toUpperCase()+kind.slice(1)} stamp ready. Place it on the card.`;});
    drawer.append(button);
  });
  function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*1200/r.width,y:(e.clientY-r.top)*800/r.height};}
  canvas.addEventListener('pointerdown',e=>{
    const p=point(e);dragging=marks.findLastIndex(mark=>Math.hypot(p.x-mark.x,p.y-mark.y)<52);
    if(dragging<0&&p.y<520&&p.x>45&&p.x<1155){marks.push({kind:selected,x:p.x,y:p.y});dragging=marks.length-1;draw();announce();}
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove',e=>{
    if(dragging<0||!canvas.hasPointerCapture(e.pointerId))return;
    const p=point(e),mark=marks[dragging];mark.x=Math.max(52,Math.min(1148,p.x));mark.y=Math.max(54,Math.min(475,p.y));draw();
  });
  canvas.addEventListener('pointerup',()=>{dragging=-1;});canvas.addEventListener('pointercancel',()=>{dragging=-1;});
  canvas.tabIndex=0;canvas.addEventListener('keydown',e=>{if((e.key==='Delete'||e.key==='Backspace')&&marks.length){marks.pop();draw();announce();e.preventDefault();}});
  document.querySelectorAll('.scene-choice').forEach(button=>button.addEventListener('click',()=>{scene=Number(button.dataset.scene);document.querySelectorAll('.scene-choice').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));master.textContent=`${sceneNames[scene].toLowerCase()} has lovely delivery weather.`;draw();}));
  message.addEventListener('input',()=>{document.getElementById('counter').textContent=`${message.value.length} / 110`;draw();});
  document.getElementById('suggest').addEventListener('click',()=>{let next=Math.floor(Math.random()*suggestions.length);if(next===lastSuggestion)next=(next+1)%suggestions.length;lastSuggestion=next;message.value=suggestions[next];message.dispatchEvent(new Event('input'));master.textContent='That sounds like a message worth keeping.';});
  document.getElementById('add-stamp').addEventListener('click',()=>{const i=marks.length;marks.push({kind:selected,x:130+(i%6)*170,y:115+(Math.floor(i/6)%3)*135});draw();announce();});
  document.getElementById('undo').addEventListener('click',()=>{marks.pop();draw();announce();});
  document.getElementById('clear').addEventListener('click',()=>{marks=[];draw();master.textContent='Fresh card. There is no wrong first mark.';});
  const blob=()=>new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  document.getElementById('download').addEventListener('click',async()=>{
    try{await ready;}catch{return;}
    const image=await blob();if(!image)return;
    const url=URL.createObjectURL(image),a=document.createElement('a');a.href=url;a.download=`goblin-town-postcard-${Date.now()}.png`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);master.textContent='Posted to your downloads. Extremely efficient mushroom.';
  });
  const share=document.getElementById('share');
  if(navigator.share&&navigator.canShare){share.hidden=false;share.addEventListener('click',async()=>{
    try{await ready;}catch{return;}
    const image=await blob();if(!image)return;
    const file=new File([image],'goblin-town-postcard.png',{type:'image/png'});
    if(!navigator.canShare({files:[file]})){master.textContent='This device prefers a downloaded postcard.';return;}
    try{await navigator.share({files:[file],title:'A postcard from Goblin Town'});}catch(e){if(e.name!=='AbortError')master.textContent='Sharing took a detour. The download button still works.';}
  });}
  draw();document.fonts.ready.then(draw);
})();
