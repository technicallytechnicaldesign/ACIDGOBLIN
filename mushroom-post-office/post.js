(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const front = $('postcard'), back = $('writing'), keepsake = $('keepsake');
  const fonts={story:'Georgia,serif',book:"'Palatino Linotype','Book Antiqua',serif",bold:"'Arial Black',Impact,sans-serif",type:"'Courier New',monospace",hand:"'Segoe Print','Comic Sans MS',cursive"};
  const chosenFont=id=>fonts[$(id).value]||fonts.story;
  const ink = '#211820', paper = '#fffaf0', pink = '#f4479a', teal = '#078c8c', violet = '#74439a';
  const scenes = [
    ['MOONLIT MUSHROOMS', 'postcard-moonlit-v2.webp'], ['CLOUD COURIER', 'postcard-cloud-v2.webp'],
    ['MOSSY WINDOW', 'postcard-window-v2.webp']
  ];
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
  function paragraph(c,value,x,y,width,height,size=40,min=16,color=ink,font=chosenFont('back-font')) {
    let rows,initialSize=size;
    // Keep intentional line breaks unless they alone would push the note off the paper.
    for(let attempt=0;attempt<2;attempt++) {
      for(size=initialSize;size>=min;size--){c.font=`500 ${size}px ${font}`;rows=wrap(c,value,width);if(rows.length*size*1.28<=height)break;}
      if(size>=min)break;
      value=value.replace(/\s+/g,' ');
    }
    size=Math.max(size,min);c.font=`500 ${size}px ${font}`;
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
  const supplySources=['post-office-v2.webp','bookshop.webp','newsstand.webp','oracle.webp','gossip-well-v2.webp','rummage-yard-v2.webp','merch.webp','side-street-keepers-v2.webp',null,'bookshop-keeper-v1.webp','merch-keeper-v1.webp','rummage-objects-v2.webp','moon-v1.webp',null,'postcard-flags-v3.png',null,null,null,'postcard-autumn-sprites-v1.png'];
  const catalog=[];
  ['Post Office','Bookshop','Newsstand','Oracle','Gossip Well','Rummage Yard','Merch Stall'].forEach((name,source)=>catalog.push({name,source,group:'town',size:310}));
  ['Bix','Wisp','Dot'].forEach((name,i)=>catalog.push({name,source:7,group:'goblins',crop:[i/3,0,1/3,1],size:200}));
  ['Trippa','Bookshop goblin','Printmaker'].forEach((name,i)=>catalog.push({name,source:8+i,group:'goblins',size:200}));
  ['Bent spoon','Unemployed boot','Tiny bell','Wrong key','Teacup','Mushroom','Clock','Lantern'].forEach((name,i)=>catalog.push({name,source:11,group:'rummage',crop:[i%4/4,Math.floor(i/4)/2,1/4,1/2],size:160}));
  ['Moon','Stars','Festival flags'].forEach((name,i)=>catalog.push({name,source:12+i,group:'magic',size:i===2?700:200}));
  ['Solve the wave print','Chaos compass print','Living the dream print'].forEach((name,i)=>catalog.push({name,source:15+i,group:'merch',size:180}));
  // Crop only the Post Office's view of the shared moon; the Town atlas stays intact.
  catalog[21].crop=[1090/1536,30/1024,345/1536,375/1024];
  Object.assign(catalog[22],{name:'Golden sparkle',source:18,crop:[0,0,1/3,1/3],size:85,trim:true});
  ['Crooked turquoise star','Violet wish-star'].forEach((name,i)=>catalog.push({name,source:18,group:'magic',crop:[(i+1)/3,0,1/3,1/3],size:85,trim:true}));
  ['Pumpkin lantern','Harvest leaf bunting','Little bonfire','Harvest basket','Drifting maple leaf','Acorn keepsake'].forEach((name,i)=>catalog.push({name,source:18,group:'autumn',crop:[(i%3)/3,(1+Math.floor(i/3))/3,1/3,1/3],size:[170,600,180,180,85,90][i],trim:true}));
  // The generated leaf bunting extends outside its nominal cell; isolate its full silhouette.
  catalog[29].crop=[0,408/1280,390/1280,428/1280];
  catalog[30].crop=[390/1280,490/1280,510/1280,307/1280];
  catalog[30].mask=[[0,0],[1,0],[1,158/307],[446/510,278/307],[242/510,1],[100/510,280/307],[0,205/307]];
  catalog[31].crop=[887/1280,408/1280,373/1280,430/1280];
  catalog[31].mask=[[65/373,0],[1,0],[1,1],[0,1],[0,215/430],[65/373,215/430]];
  // Keep legacy numeric slots stable so existing drafts retain their objects.
  catalog.forEach((a,i)=>{a.retired=[10,24,25,26].includes(i);});
  let supplyImages=[],things=[],active=-1,supplyGroup='town',sceneDrag=null,lastScene='0';
  let words={x:600,y:115,size:68,angle:-3,flip:false},undoScenes=[],redoScenes=[],draftTimer;
  const loadSupply=path=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error(`Scene supply missing: ${path}`));img.src=path.startsWith('../free-')?path:`../town-assets/${path}`;});
  const snapshot=()=>JSON.stringify({things,words,scene:$('scene').value,headline:$('headline').value,color:$('word-color').value,frontFont:$('front-font').value,backFont:$('back-font').value,format,note:$('message').value,to:$('recipient').value,from:$('sender').value,marks,noteKind:$('note-kind').value,keepsakeKind:$('keepsake-kind').value,keepsakeChoice:$('keepsake-choice').value,caption:$('keepsake-caption').value});
  function applySnapshot(value){const data=JSON.parse(value);things=data.things.filter(t=>!catalog[t.asset].retired);words=data.words;applyExtras(data);$('scene').value=data.scene;lastScene=data.scene;$('headline').value=data.headline;$('word-color').value=data.color;active=-1;syncSelection();draw();remember();}
  function checkpoint(){undoScenes.push(snapshot());if(undoScenes.length>60)undoScenes.shift();redoScenes=[];}
  function remember(){clearTimeout(draftTimer);draftTimer=setTimeout(()=>{try{localStorage.setItem('goblin-post-scene-v3',snapshot());}catch{say('Your scene works, but this browser cannot keep a draft. Save it before leaving.');}},180);}
  function restoreDraft(){try{const value=localStorage.getItem('goblin-post-scene-v3');if(value){const d=JSON.parse(value);if(!Array.isArray(d.things)||d.things.length>60||!d.words||!['0','1','2'].includes(d.scene))return;for(const t of d.things){if(!catalog[t.asset]||![t.x,t.y,t.size,t.angle].every(Number.isFinite))return;}if(![d.words.x,d.words.y,d.words.size,d.words.angle].every(Number.isFinite))return;things=d.things.filter(t=>!catalog[t.asset].retired);words=d.words;applyExtras(d);$('scene').value=d.scene;lastScene=d.scene;$('headline').value=String(d.headline||'').slice(0,64);if(/^#[0-9a-f]{6}$/i.test(d.color))$('word-color').value=d.color;}}catch{say('That old draft went wandering. Here is fresh paper.');}}
  // Tight sprite bounds keep transparent atlas gutters out of placement and selection.
  function trimSupplies(){catalog.filter(a=>a.trim).forEach(a=>{const im=supplyImages[a.source];if(!im)return;const r=a.crop;const x=Math.round(r[0]*im.width),y=Math.round(r[1]*im.height),w=Math.floor(r[2]*im.width),h=Math.floor(r[3]*im.height);const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const c=canvas.getContext('2d',{willReadFrequently:true});if(a.mask){c.beginPath();a.mask.forEach(([px,py],i)=>i?c.lineTo(px*w,py*h):c.moveTo(px*w,py*h));c.closePath();c.clip();}c.drawImage(im,x,y,w,h,0,0,w,h);const pixels=c.getImageData(0,0,w,h).data;let left=w,top=h,right=-1,bottom=-1;for(let row=0;row<h;row++)for(let col=0;col<w;col++)if(pixels[(row*w+col)*4+3]>32){left=Math.min(left,col);top=Math.min(top,row);right=Math.max(right,col);bottom=Math.max(bottom,row);}if(right<0)throw new Error(`Empty scene sprite: ${a.name}`);const pad=3;left=Math.max(0,left-pad);top=Math.max(0,top-pad);right=Math.min(w-1,right+pad);bottom=Math.min(h-1,bottom+pad);a.source=supplyImages.length;supplyImages.push(canvas);a.crop=[left/w,top/h,(right-left+1)/w,(bottom-top+1)/h];});}
  function sprite(c,asset,x,y,w){const image=supplyImages[asset.source];if(!image)return;const crop=asset.crop||[0,0,1,1],sw=image.width*crop[2],sh=image.height*crop[3];c.drawImage(image,image.width*crop[0],image.height*crop[1],sw,sh,x-w/2,y-w*sh/sw/2,w,w*sh/sw);}
  function dimensions(t){if(t===words){const c=front.getContext('2d');c.font=`900 ${t.size}px ${chosenFont('front-font')}`;const rows=wrap(c,$('headline').value.trim(),1000);return{w:Math.min(1050,Math.max(80,...rows.map(r=>c.measureText(r).width))),h:Math.max(1,rows.length)*t.size*1.12};}const a=catalog[t.asset],im=supplyImages[a.source];if(!im)return{w:t.size,h:t.size};const crop=a.crop||[0,0,1,1];return{w:t.size,h:t.size*(im.height*crop[3])/(im.width*crop[2])};}
  function drawThing(c,t){c.save();c.translate(t.x,t.y);c.rotate(t.angle*Math.PI/180);c.scale(t.flip?-1:1,1);sprite(c,catalog[t.asset],0,0,t.size);c.restore();}
  function drawWords(c){const value=$('headline').value.trim();if(!value)return;c.save();c.translate(words.x,words.y);c.rotate(words.angle*Math.PI/180);c.scale(words.flip?-1:1,1);c.font=`900 ${words.size}px ${chosenFont('front-font')}`;c.textAlign='center';c.textBaseline='middle';const rows=wrap(c,value,1000);c.lineJoin='round';c.lineWidth=Math.max(3,words.size*.08);c.strokeStyle=$('word-color').value===ink?'#fff3bd':ink;c.fillStyle=$('word-color').value;rows.forEach((row,i)=>{const y=(i-(rows.length-1)/2)*words.size*1.12;c.strokeText(row,0,y);c.fillText(row,0,y);});c.restore();}
  function drawFront(clean=false){const c=front.getContext('2d'),scene=Number($('scene').value);c.clearRect(0,0,1200,800);box(c,0,0,1200,800,paper);if(artwork[scene])imageFit(c,artwork[scene],0,0,1200,800,true);things.forEach(t=>drawThing(c,t));drawWords(c);if(!clean&&active!==-1){const t=active==='words'?words:things[active];if(t){const d=dimensions(t);c.save();c.translate(t.x,t.y);c.rotate(t.angle*Math.PI/180);c.strokeStyle='#fffaf0';c.lineWidth=3;c.setLineDash([9,6]);c.strokeRect(-d.w/2-8,-d.h/2-8,d.w+16,d.h+16);c.strokeStyle=violet;c.lineWidth=1;c.strokeRect(-d.w/2-10,-d.h/2-10,d.w+20,d.h+20);c.restore();}}front.setAttribute('aria-label',`Scene on ${scenes[scene][0].toLowerCase()}: ${things.map(t=>catalog[t.asset].name).join(', ')}. ${$('headline').value}. Use the scene controls to arrange objects.`);}
  function renderClean(){drawFront(true);}
  function syncSelection(){const t=active==='words'?words:things[active];$('transform-tools').disabled=!t;$('selected-name').textContent=t?(active==='words'?'Your words':catalog[t.asset].name):'Pick something on your card.';if(t){$('object-x').value=t.x;$('object-y').value=t.y;$('object-size').max=active==='words'?140:1000;$('object-size').min=active==='words'?20:40;$('object-size').value=t.size;$('object-angle').value=t.angle;}$('scene-undo').disabled=!undoScenes.length;$('scene-redo').disabled=!redoScenes.length;}
  function pick(value){active=value;syncSelection();drawFront();}
  function addThing(asset){if(!loaded||catalog[asset]?.retired)return;if(things.length>=60){say('Sixty things. Even the goblins need a path through.');return;}checkpoint();const a=catalog[asset];things.push({asset,x:600+(things.length%5-2)*70,y:a.group==='magic'||a.name==='Harvest leaf bunting'?230:530,size:a.size,angle:0,flip:false});pick(things.length-1);showSide(false);remember();say(`${a.name} has entered the situation.`);}
  function renderSupplies(){$('supplies').replaceChildren();catalog.forEach((a,i)=>{if(a.retired||a.group!==supplyGroup)return;const b=document.createElement('button');b.type='button';b.className='supply';b.setAttribute('aria-label',`Add ${a.name} to your scene`);const canvas=document.createElement('canvas');canvas.width=180;canvas.height=180;const im=supplyImages[a.source],crop=a.crop||[0,0,1,1],ratio=im.height*crop[3]/(im.width*crop[2]);sprite(canvas.getContext('2d'),a,90,90,Math.min(160,160/ratio));const label=document.createElement('span');label.textContent=a.name;b.append(canvas,label);b.addEventListener('click',()=>addThing(i));$('supplies').append(b);});}
  document.querySelectorAll('[data-supply]').forEach(b=>b.addEventListener('click',()=>{supplyGroup=b.dataset.supply;document.querySelectorAll('[data-supply]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(loaded)renderSupplies();}));
  $('select-words').addEventListener('click',()=>{showSide(false);pick('words');});
  ['object-x','object-y','object-size','object-angle'].forEach(id=>{const el=$(id),key={'object-x':'x','object-y':'y','object-size':'size','object-angle':'angle'}[id];el.addEventListener('pointerdown',checkpoint);el.addEventListener('keydown',e=>{if(e.key.startsWith('Arrow'))checkpoint();});el.addEventListener('input',()=>{const t=active==='words'?words:things[active];if(!t)return;t[key]=Number(el.value);drawFront();remember();syncSelection();});});
  $('word-color').addEventListener('pointerdown',checkpoint);
  $('word-color').addEventListener('change',()=>{drawFront();remember();});
  function changeActive(fn){const t=active==='words'?words:things[active];if(!t)return;checkpoint();fn(t);syncSelection();drawFront();remember();showSide(false);}
  $('object-flip').addEventListener('click',()=>changeActive(t=>{t.flip=!t.flip;}));
  $('object-remove').addEventListener('click',()=>changeActive(()=>{if(active==='words')$('headline').value='';else things.splice(active,1);active=-1;}));
  $('object-copy').addEventListener('click',()=>{if(active==='words'||active<0||things.length>=60)return;changeActive(t=>{things.push({...t,x:Math.min(1170,t.x+45),y:Math.min(770,t.y+25)});active=things.length-1;});});
  for(const [id,step] of [['object-back',-1],['object-forward',1]])$(id).addEventListener('click',()=>{if(typeof active!=='number'||active<0)return;const next=active+step;if(next<0||next>=things.length)return;changeActive(()=>{[things[active],things[next]]=[things[next],things[active]];active=next;});});
  $('scene-clear').addEventListener('click',()=>{checkpoint();things=[];pick(-1);remember();showSide(false);say('The backdrop is yours again. Something suspicious will fit here.');});
  $('scene-undo').addEventListener('click',()=>{if(!undoScenes.length)return;redoScenes.push(snapshot());applySnapshot(undoScenes.pop());syncSelection();showSide(false);});
  $('scene-redo').addEventListener('click',()=>{if(!redoScenes.length)return;undoScenes.push(snapshot());applySnapshot(redoScenes.pop());syncSelection();showSide(false);});
  $('chaos').addEventListener('click',()=>{if(!loaded)return;checkpoint();if(!things.length){[0,8,14,15,23].forEach((asset,i)=>things.push({asset,x:220+i*180,y:480+(i%2)*95,size:catalog[asset].size,angle:0,flip:false}));}things.forEach(t=>{t.x=120+Math.random()*960;t.y=200+Math.random()*490;t.angle=Math.round(Math.random()*36-18);});pick(-1);remember();showSide(false);say('The goblin denies any involvement. Undo is available.');});
  const frontPoint=e=>{const r=front.getBoundingClientRect();return{x:(e.clientX-r.left)*1200/r.width,y:(e.clientY-r.top)*800/r.height};};
  function hits(t,p){const d=dimensions(t),angle=-t.angle*Math.PI/180,dx=p.x-t.x,dy=p.y-t.y,x=dx*Math.cos(angle)-dy*Math.sin(angle),y=dx*Math.sin(angle)+dy*Math.cos(angle);if(Math.abs(x)>d.w/2||Math.abs(y)>d.h/2)return false;if(t===words)return true;const a=catalog[t.asset],im=supplyImages[a.source],crop=a.crop||[0,0,1,1];const test=document.createElement('canvas');test.width=test.height=1;const sx=im.width*crop[0]+((t.flip?-x:x)/d.w+.5)*im.width*crop[2],sy=im.height*crop[1]+(y/d.h+.5)*im.height*crop[3];test.getContext('2d').drawImage(im,sx,sy,1,1,0,0,1,1);return test.getContext('2d').getImageData(0,0,1,1).data[3]>30;}
  front.addEventListener('pointerdown',e=>{if(opened||!loaded||e.button!==0)return;const p=frontPoint(e);let found=$('headline').value.trim()&&hits(words,p)?'words':-1;if(found===-1)for(let i=things.length-1;i>=0;i--)if(hits(things[i],p)){found=i;break;}pick(found);front.focus({preventScroll:true});if(found===-1)return;checkpoint();const t=found==='words'?words:things[found];sceneDrag={dx:p.x-t.x,dy:p.y-t.y};front.setPointerCapture(e.pointerId);e.preventDefault();});
  front.addEventListener('pointermove',e=>{if(!sceneDrag||!front.hasPointerCapture(e.pointerId))return;const p=frontPoint(e),t=active==='words'?words:things[active];t.x=Math.max(30,Math.min(1170,p.x-sceneDrag.dx));t.y=Math.max(30,Math.min(770,p.y-sceneDrag.dy));drawFront();syncSelection();});
  ['pointerup','pointercancel','lostpointercapture'].forEach(name=>front.addEventListener(name,()=>{if(sceneDrag)remember();sceneDrag=null;}));
  front.addEventListener('keydown',e=>{if(active===-1)return;if(e.key==='Escape'){pick(-1);return;}const moves={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(moves[e.key]){e.preventDefault();changeActive(t=>{const [x,y]=moves[e.key],step=e.shiftKey?25:5;t.x=Math.max(30,Math.min(1170,t.x+x*step));t.y=Math.max(30,Math.min(770,t.y+y*step));});}else if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();$('object-remove').click();}});

  let oracleImages=[];
  const loadOracle=path=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error(`Oracle keepsake missing: ${path}`));image.src=`../tarot/${path}`;});
  const memories=[
    {name:'A ticket to somewhere-ish',line:'One return journey to Goblin Town. No expiry. The mushrooms will remember you.',asset:0},
    {name:'The pebble that picked you',line:'Found beside the Gossip Well. Slightly warm. Probably listening. Yours now.',asset:4},
    {name:'Officially got a bit lost',line:'Awarded for taking the scenic route, asking a goblin, and becoming more lost in a useful way.',asset:1},
    {name:'Proof of a very small adventure',line:'You were here. The kettle boiled. Something improbable happened. Keep this as evidence.',asset:8}
  ];
  const optionsFor=kind=>kind==='fortune'?window.GOBLIN_DECK.map(c=>c.title):kind==='invention'?window.GOBLIN_INVENTIONS.map(c=>c.name):kind==='memory'?memories.map(c=>c.name):[];
  function updateKeepsakeChoices(value='0'){const names=optionsFor($('keepsake-kind').value);$('keepsake-choice').replaceChildren(...names.map((name,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=name;return option;}));$('keepsake-choice').value=names[Number(value)]?value:'0';$('keepsake-choice-wrap').hidden=!names.length;$('keepsake-shuffle').disabled=!names.length;$('keepsake-choice-label').textContent=$('keepsake-kind').value==='fortune'?'A card from the Oracle':$('keepsake-kind').value==='invention'?'An invention from the Yard':'Your town souvenir';}
  function updateFoldControls(){$('keepsake-controls').hidden=format!=='fold';$('flat-layout').querySelector('[value=back]').textContent=format==='fold'?'Inside spread (keepsake + note)':'Writing side only';$('flat-layout').querySelector('[value=both]').textContent=format==='fold'?'Cover + whole inside spread':'Both sides, side by side';}
  function applyExtras(d){for(const [key,id] of [['frontFont','front-font'],['backFont','back-font']])if(fonts[d[key]])$(id).value=d[key];if(['fold','postcard'].includes(d.format)){format=d.format;$('viewer').dataset.format=format;document.querySelectorAll('[data-format].choice').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.format===format)));}for(const [key,id,max] of [['note','message',240],['to','recipient',40],['from','sender',40],['caption','keepsake-caption',140]])if(typeof d[key]==='string')$(id).value=d[key].slice(0,max);if(['goblin','fortune','invention','memory'].includes(d.noteKind))$('note-kind').value=d.noteKind;if(['plain','fortune','invention','memory'].includes(d.keepsakeKind))$('keepsake-kind').value=d.keepsakeKind;updateKeepsakeChoices(d.keepsakeChoice||'0');if(Array.isArray(d.marks)&&d.marks.length<=9&&d.marks.every(m=>icons.includes(m.kind)&&Number.isFinite(m.x)&&Number.isFinite(m.y)))marks=d.marks;$('counter').textContent=`${$('message').value.length} / 240`;updateFoldControls();}
  function notePool(){const kind=$('note-kind').value,index=Number($('keepsake-choice').value)||0;
    if(kind==='fortune'){const card=window.GOBLIN_DECK[$('keepsake-kind').value==='fortune'?index:2];return [`The Oracle sent a small omen for you: ${card.upright} I thought you might like a little magic in your pocket.`,`I asked the fortune teller about you. They said, “${card.upright}” Then they stole my biscuit. Sending both the wisdom and my love.`,`A card from the moon-puddle court, kept just for you. No fixed fate. Just a strange little nudge toward something good.`,`The cards predict a visitor, a warm kettle, and one spectacularly unnecessary detour. I hope the visitor is you.`];}
    if(kind==='invention'){const inv=window.GOBLIN_INVENTIONS[$('keepsake-kind').value==='invention'?index:0];return [`I made you a ${inv.name}. ${inv.line} The goblin called it progress. I called it a souvenir.`,`A little invention from the Rummage Yard, and a little thought of you. ${inv.opinion} Please accept this highly questionable evidence of affection.`,`We combined two bad ideas and got a useful one. Mostly. Keeping you a memento from the bench; the warranty is a mushroom.`,`This town understands our kind of nonsense. I made something ridiculous and immediately wished you were here to make it worse.`];}
    if(kind==='memory')return ['A little proof that I was here, and that you came along in my thoughts. The town is strange. The missing you is ordinary.','We took the long way, found a warm window, and stayed for one more cup. Keep this little piece of the day.','I brought back a very small adventure. It smells faintly of moss and bad decisions. There is room for you on the next one.','The mushrooms waved goodbye. The Well pretended not to care. I saved you a bit of town for whenever you need somewhere kinder.'];
    return format==='fold'?[...suggestions,'This card contains one small visit to Goblin Town. Open carefully: a goblin may have packed the feelings sideways.','A little piece of our kind of strange, kept just for you. No occasion necessary.','If the world gets a bit much, imagine us here: kettle on, boots off, one improbable plan on the table.']:suggestions;
  }
  function drawKeepsake(){const c=keepsake.getContext('2d'),kind=$('keepsake-kind').value,index=Number($('keepsake-choice').value)||0;c.clearRect(0,0,1200,800);box(c,0,0,1200,800,'#fff2d5');box(c,28,28,1144,744,'#fff8e7',ink,3);text(c,'A BIT OF GOBLIN TOWN / KEPT JUST FOR YOU',64,83,23,violet);line(c,64,105,1136,105,ink,2);let title,body,tag;
    if(kind==='fortune'){const card=window.GOBLIN_DECK[index]||window.GOBLIN_DECK[0];title=card.title;body=card.upright;tag=`ORACLE / ${card.number} / ${card.keywords.toUpperCase()}`;box(c,82,143,358,491,'#ecd99d',ink,3);if(oracleImages[index])imageFit(c,oracleImages[index],101,170,320,390);text(c,`✦ ${card.number} ✦`,198,603,28,violet);}
    else if(kind==='invention'){const inv=window.GOBLIN_INVENTIONS[index]||window.GOBLIN_INVENTIONS[0];title=inv.name;body=inv.line+'\n\n'+inv.opinion;tag=`RUMMAGE YARD / INVENTION ${index+1} OF 28`;sprite(c,catalog[13+inv.pair[0]],220,354,275);sprite(c,catalog[13+inv.pair[1]],320,423,275);text(c,'ASSEMBLED WITH CONFIDENCE',91,626,18,teal);}
    else if(kind==='memory'){const item=memories[index]||memories[0];title=item.name;body=item.line;tag='TOWN SOUVENIR / NO EXPIRY';sprite(c,catalog[item.asset],265,390,340);text(c,'ADMIT ONE STRANGE LITTLE SOUL',69,625,18,teal);}
    else {title='A little piece of here.';body='For the person I thought of\nwhen the town got wonderfully weird.\n\nKept just for you.';tag='MUSHROOM POST OFFICE / SOMEWHERE-ISH';sprite(c,catalog[9],260,380,335);}
    line(c,476,156,476,632,'#c8b7a5',2);paragraph(c,title,516,160,595,145,46,26,violet);paragraph(c,body,516,322,590,300,34,21);fit(c,tag,64,669,1070,18,teal);line(c,64,685,1136,685,ink,2);paragraph(c,$('keepsake-caption').value.trim()||'Kept this for you. It felt like our kind of strange.',64,697,1070,70,28,16);keepsake.setAttribute('aria-label',`${title}. ${body.replace(/\n/g,' ')}. ${$('keepsake-caption').value}`);
  }
  function insideSpread(){const canvas=document.createElement('canvas');canvas.width=2400;canvas.height=800;const c=canvas.getContext('2d');c.drawImage(keepsake,0,0);c.drawImage(back,1200,0);return canvas;}
  ['front-font','back-font'].forEach(id=>$(id).addEventListener('change',()=>{draw();remember();if(id==='front-font')showSide(false);else showSide(true);}));
  $('note-kind').addEventListener('change',()=>{lastSuggestion=-1;remember();say('Shuffle a note from this corner of town, then make it yours.');});
  $('keepsake-kind').addEventListener('change',()=>{updateKeepsakeChoices();drawKeepsake();remember();showSide(true);});
  $('keepsake-choice').addEventListener('change',()=>{drawKeepsake();remember();showSide(true);});
  $('keepsake-caption').addEventListener('input',()=>{drawKeepsake();remember();showSide(true);});
  $('keepsake-shuffle').addEventListener('click',()=>{const count=optionsFor($('keepsake-kind').value).length;if(!count)return;const current=Number($('keepsake-choice').value),next=(current+1+Math.floor(Math.random()*Math.max(1,count-1)))%count;$('keepsake-choice').value=String(next);drawKeepsake();remember();showSide(true);say('A little souvenir from an unreasonable place.');});
  updateKeepsakeChoices();updateFoldControls();

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
  function draw(){drawFront();drawBack();drawKeepsake();}
  function showSide(value) {
    opened=value;dragging=-1;$('viewer').classList.toggle('is-open',opened);
    $('turn').textContent=opened?'Back to the picture ↻':format==='fold'?'Open the card ↗':'Turn it over ↻';
    $('turn').setAttribute('aria-expanded',String(opened));
    $('side-label').textContent=opened?(format==='fold'?'Inside, just for you':'The writing side'):'The picture side';
    $('preview-help').textContent=opened?'Tap the postage strip to add a stamp. Drag stamps within the strip; your words stay clear.':'Drag your scene around. Tap empty space to admire it. '+(format==='fold'?'Open it for the note.':'Turn it over for the note.');
    front.tabIndex=opened?-1:0;back.tabIndex=opened?0:-1;$('viewer').querySelector('.cover-inside').setAttribute('aria-hidden',String(!opened||format!=='fold'));back.setAttribute('aria-hidden',String(!opened));front.setAttribute('aria-hidden',String(opened));
  }
  function controls(){['download','gift'].forEach(id=>{$(id).disabled=!loaded||busy;});}
  $('turn').addEventListener('click',()=>showSide(!opened));
  document.querySelectorAll('[data-format].choice').forEach(button=>button.addEventListener('click',()=>{
    format=button.dataset.format;$('viewer').dataset.format=format;
    document.querySelectorAll('[data-format].choice').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    updateFoldControls();drawBack();drawKeepsake();remember();showSide(false);
  }));
  $('scene').addEventListener('change',()=>{const next=$('scene').value;$('scene').value=lastScene;checkpoint();$('scene').value=next;lastScene=next;syncSelection();drawFront();remember();showSide(false);});
  $('headline').addEventListener('focus',checkpoint);
  $('headline').addEventListener('input',()=>{drawFront();remember();showSide(false);});
  ['message','recipient','sender'].forEach(id=>$(id).addEventListener('input',()=>{$('counter').textContent=`${$('message').value.length} / 240`;drawBack();remember();showSide(true);}));
  $('suggest').addEventListener('click',()=>{
    const pool=notePool();let next=Math.floor(Math.random()*pool.length);if(next===lastSuggestion)next=(next+1)%pool.length;
    lastSuggestion=next;$('message').value=pool[next];$('message').dispatchEvent(new Event('input'));say('That sounds like a message worth keeping.');
  });
  icons.forEach(kind=>{
    const button=document.createElement('button');button.type='button';button.className='decor';button.dataset.kind=kind;
    button.setAttribute('aria-label',`Select ${kind} stamp`);button.setAttribute('aria-pressed',String(kind===selected));
    button.innerHTML=`<span class="stamp-art stamp-art--${kind}" aria-hidden="true"></span><small>${kind}</small>`;
    button.addEventListener('click',()=>{selected=kind;$('drawer').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));showSide(true);say(`${kind[0].toUpperCase()+kind.slice(1)} postage, ready for the writing side.`);});
    $('drawer').append(button);
  });
  function add(x,y){if(marks.length>=9){say('Nine stamps is a full postbag. Undo a stamp to make room.');return false;}marks.push({kind:selected,x,y});drawBack();remember();say('A little more magic in the post.');return true;}
  $('add-stamp').addEventListener('click',()=>{showSide(true);let slot=0;while(slot<9&&marks.some(m=>Math.abs(m.x-(1060-slot*118))<65))slot++;add(1060-Math.min(slot,8)*118,158);});
  $('undo').addEventListener('click',()=>{marks.pop();showSide(true);drawBack();remember();say('Last stamp lifted.');});
  $('clear').addEventListener('click',()=>{marks=[];showSide(true);drawBack();remember();say('Fresh postage strip. Your note is still here.');});
  const point=e=>{const r=back.getBoundingClientRect();return{x:(e.clientX-r.left)*1200/r.width,y:(e.clientY-r.top)*800/r.height};};
  back.addEventListener('pointerdown',e=>{
    if(!opened||e.button!==0)return;const p=point(e);if(p.y<95||p.y>226)return;
    dragging=marks.findLastIndex(m=>Math.abs(p.x-m.x)<57&&Math.abs(p.y-m.y)<64);
    if(dragging<0&&add(Math.max(99,Math.min(1101,p.x)),158))dragging=marks.length-1;
    if(dragging>=0)back.setPointerCapture(e.pointerId);
  });
  back.addEventListener('pointermove',e=>{if(dragging<0||!back.hasPointerCapture(e.pointerId))return;const p=point(e);marks[dragging].x=Math.max(99,Math.min(1101,p.x));drawBack();});
  ['pointerup','pointercancel','lostpointercapture'].forEach(event=>back.addEventListener(event,()=>{dragging=-1;remember();}));
  back.addEventListener('keydown',e=>{if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();marks.pop();drawBack();}});
  function flatCanvas() {
    const layout=$('flat-layout').value;if(layout==='front')return front;if(layout==='back')return format==='fold'?insideSpread():back;
    if(format==='fold'){const canvas=document.createElement('canvas');canvas.width=2440;canvas.height=1680;const c=canvas.getContext('2d');box(c,0,0,2440,1680,'#eadfc7');c.drawImage(front,620,10);c.drawImage(keepsake,10,850);c.drawImage(back,1230,850);text(c,'FRONT COVER',620,836,16,violet);text(c,'INSIDE / KEEPSAKE',10,1672,16,violet);text(c,'INSIDE / YOUR NOTE',1230,1672,16,violet);return canvas;}
    const canvas=document.createElement('canvas');canvas.width=2440;canvas.height=840;const c=canvas.getContext('2d');
    box(c,0,0,2440,840,'#eadfc7');c.drawImage(front,10,10);c.drawImage(back,1230,10);
    text(c,'PICTURE SIDE',10,832,16,violet);text(c,format==='fold'?'INSIDE / WRITING SIDE':'REVERSE / WRITING SIDE',1230,832,16,violet);return canvas;
  }
  const png=canvas=>new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Image export failed.')),'image/png'));
  function save(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
  async function exporting(work){if(!loaded||busy)return;busy=true;controls();try{await work();}catch(error){console.error(error);say('The postbag hit a snag. Please try again.');}finally{busy=false;controls();drawFront();}}
  $('download').addEventListener('click',()=>exporting(async()=>{renderClean();save(await png(flatCanvas()),`goblin-town-${format}-${$('flat-layout').value}.png`);say('Both worlds, packed flat. Your picture is in Downloads.');}));
  $('gift').addEventListener('click',()=>exporting(async()=>{
    const response=await fetch('./post.css');if(!response.ok)throw new Error('Could not load gift styling.');
    renderClean();const css=await response.text(),frontImage=front.toDataURL('image/png'),backImage=back.toDataURL('image/png'),keepsakeImage=keepsake.toDataURL('image/png');
    const frontAlt=front.getAttribute('aria-label'),backAlt=back.getAttribute('aria-label');
    const escape=value=>value.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
    const verb=format==='fold'?'Open your card':'Turn your postcard over';
    const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>A little post from Goblin Town</title><style>${css}
      :root{--ink:#211820;--paper:#fffaf0;--pink:#f4479a}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:#ece1c7;color:#211820;font:16px/1.5 Georgia,serif;display:grid;place-items:center;padding:24px}main{width:min(100%,1000px);text-align:center}h1{font-size:clamp(24px,5vw,38px);margin:12px}p{margin:12px 0 24px}.gift-frame{padding:18px;background:#d7c7a2;border:3px solid #211820;border-radius:8px;overflow:hidden}button{margin-top:25px;padding:13px 20px;background:#f7da76;color:#211820;border:2px solid #211820;border-radius:6px;font:bold 15px monospace;cursor:pointer;box-shadow:3px 3px 0 #211820}button:focus-visible{outline:3px solid #f4479a;outline-offset:5px}small{display:block;margin-top:24px} .card-viewer{cursor:pointer}@media(max-width:500px){body{padding:12px}.gift-frame{padding:5px}}</style></head><body><main><small>MUSHROOM POST OFFICE · GOBLIN TOWN</small><h1>Someone thought of you.</h1><p>A little piece of here, delivered to wherever you are.</p><div class="gift-frame"><div class="card-viewer" id="viewer" data-format="${format}"><div class="card-body"><div class="card-face writing-face" aria-hidden="true"><img alt="${escape(backAlt)}" src="${backImage}"></div><div class="card-face cover-face"><img alt="${escape(frontAlt)}" src="${frontImage}"><div class="cover-inside" aria-hidden="true"><img alt="${escape(keepsake.getAttribute('aria-label'))}" src="${keepsakeImage}"></div></div></div></div></div><button id="turn" aria-expanded="false">${verb} ↻</button><small id="status" role="status">The picture side</small><noscript><p>Your note is below.</p><img style="width:100%" alt="${escape(backAlt)}" src="${backImage}"></noscript></main><script>const viewer=document.getElementById('viewer'),button=document.getElementById('turn');function turn(){const open=viewer.classList.toggle('is-open');button.setAttribute('aria-expanded',String(open));button.textContent=open?'Back to the picture ↻':'${verb} ↻';viewer.querySelector('.writing-face').setAttribute('aria-hidden',String(!open));viewer.querySelector('.cover-face>img').setAttribute('aria-hidden',String(open));viewer.querySelector('.cover-inside').setAttribute('aria-hidden',String(!open||viewer.dataset.format!=='fold'));document.getElementById('status').textContent=open?'A note, just for you':'The picture side';}button.addEventListener('click',turn);viewer.addEventListener('click',turn);<\/script></body></html>`;
    save(new Blob([html],{type:'text/html;charset=utf-8'}),`a-little-goblin-${format}-gift.html`);say('Gift wrapped! Send the HTML file; its pictures and note work offline.');
  }));
  if(navigator.share&&navigator.canShare){$('share').hidden=false;$('share').addEventListener('click',()=>exporting(async()=>{
    renderClean();const file=new File([await png(flatCanvas())],'goblin-town-card.png',{type:'image/png'});
    if(!navigator.canShare({files:[file]})){say('This device prefers a downloaded postcard.');return;}
    try{await navigator.share({files:[file],title:'A little post from Goblin Town'});}catch(error){if(error.name!=='AbortError')throw error;}
  }));}
  draw();showSide(false);
  Promise.all([...scenes.map(([,path])=>loadImage(path)),loadImage('postcard-stamps-v2.webp'),...supplySources.map(path=>path?loadSupply(path):Promise.resolve(null)),...window.GOBLIN_DECK.map(card=>loadOracle(card.source))]).then(images=>{
    artwork=images.slice(0,scenes.length);stamps=images[scenes.length];supplyImages=images.slice(scenes.length+1,scenes.length+1+supplySources.length);oracleImages=images.slice(scenes.length+1+supplySources.length);trimSupplies();loaded=true;restoreDraft();updateFoldControls();renderSupplies();syncSelection();draw();controls();say('All destinations are accepted, including “somewhere nicer.”');
  }).catch(error=>{console.error(error);say('The postbag lost its pictures. Please reload before saving.');});
  document.fonts.ready.then(draw);
})();
