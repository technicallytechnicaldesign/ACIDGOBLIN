(() => {
'use strict';
const root=new URL('./',document.currentScript.src), key='acid-goblin-journey-v1';
const secrets={
 mushroom:{name:'Grudging mushroom',line:'After three pokes, the mushroom surrendered one tiny spore. Permission to grow at your own speed.',asset:18,clue:'The mushroom beside the crossroads claims to hate visitors. Three gentle pokes may change its mind.',path:'',keeper:'town'},
 bookmark:{name:'Rain bookmark',line:'Moss found the missing B tucked under a book. A bookmark for days when the weather needs another chapter.',asset:16,clue:'Moss lost the letter B while shelving the rain. Look for the little thing peeking out beneath a book.',path:'bookshop/',keeper:'bookshop'},
 star:{name:'Lantern’s lost star',line:'Bix opened the lantern twice. The light was a star on its lunch break. Keep it somewhere kind.',asset:27,clue:'Bix keeps a spare star in the little lantern above his bench. It dislikes being asked only once.',path:'rummage-yard/',keeper:'rummage-yard'}
};
let state={found:[],heard:[],inventions:[],inventionNames:{},reading:null}, persistent=true;
function read(value){if(!value||typeof value!=='object')return;state.found=Array.isArray(value.found)?value.found.filter(id=>Object.hasOwn(secrets,id)):[];state.heard=Array.isArray(value.heard)?value.heard.filter(id=>Object.hasOwn(secrets,id)):[];state.inventions=Array.isArray(value.inventions)?value.inventions.filter(i=>Number.isInteger(i)&&i>=0&&i<28):[];state.inventionNames={};if(value.inventionNames&&typeof value.inventionNames==='object')for(const [k,v] of Object.entries(value.inventionNames)){if(/^\d{1,2}$/.test(k)&&Number(k)<28&&typeof v==='string'&&v.length<100)state.inventionNames[k]=v;}const r=value.reading;state.reading=r&&typeof r.summary==='string'&&r.summary.length<=1200&&typeof r.card==='string'&&r.card.length<=100?{summary:r.summary,card:r.card}:null;}
try{read(JSON.parse(localStorage.getItem(key)));}catch{persistent=false;}
function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch{persistent=false;}window.dispatchEvent(new Event('town-pocket-change'));}
const url=path=>path==='https://technicallytechnicaldesign.github.io/acidgoblin-tripper/'&&root.pathname.includes('/LOCAL_ACIDGOBLIN/')?new URL('../LOCAL_ACIDGOBLIN-TRIPPER/',root).href:new URL(path,root).href;
const place=document.body.dataset.townPlace||'town';
const query=new URLSearchParams(location.search), clue=query.get('rumour');
if(Object.hasOwn(secrets,clue)&&!state.heard.includes(clue)){state.heard.push(clue);save();}
function greeting(p){
 if(p==='bookshop'&&state.found.includes('bookmark'))return 'Moss says: You found my missing B! The rain is back in alphabetical order. Mostly.';
 if(p==='bookshop'&&state.heard.includes('bookmark'))return 'Moss says: Wisp told you about the missing B? Something is peeking out beneath a book. The rain refuses to be shelved without it.';
 if(p==='rummage-yard'&&state.found.includes('star'))return 'Bix says: That lantern is lighter without its star. I expect it will invent something about gravity next.';
 if(p==='rummage-yard'&&state.heard.includes('star'))return 'Bix says: A spare star? In MY little lantern? Ask it twice. It is a bit hard of hearing.';
 if(p==='mushroom-post-office'&&state.found.length)return 'Dot says: Oh, you found something the town was keeping quiet! We have a little envelope for that.';
 if(p==='newsstand'&&state.found.length)return 'Pip says: A visitor has found something the town was hiding. I am calling it a very small scoop.';
 if(p==='tarot'&&state.found.includes('star'))return 'The Oracle says: Bix’s escaped star has been expected. Small lights have a habit of finding their people.';
 if(p==='free-chaos-merch'&&state.found.includes('mushroom'))return 'Dot says: The grumpy mushroom gave you a spore? I have never seen it sign anything before.';
 return '';
}
window.TownJourney={root:root.href,secrets,url,greeting,has:id=>state.found.includes(id),found:()=>[...state.found],reading:()=>state.reading,
 hear(id){if(Object.hasOwn(secrets,id)&&!state.heard.includes(id)){state.heard.push(id);save();}},
 keepInvention(i,name){if(!Number.isInteger(i)||i<0||i>=28)return;if(!state.inventions.includes(i))state.inventions.push(i);if(typeof name==='string'&&name.length<100)state.inventionNames[i]=name;save();},
 keepReading(r){read({...state,reading:r});save();},
 find(id){if(!Object.hasOwn(secrets,id))return;const again=state.found.includes(id);if(!again){state.found.push(id);save();window.dispatchEvent(new Event('town-discovery'));}showDiscovery(id,again);}
};
const destinations=[['bookshop/','Bookshop'],['newsstand/','Newsstand'],['tarot/','Oracle'],['rummage-yard/','Rummage Yard'],['gossip-well/','Gossip Well'],['mushroom-post-office/','Post Office'],['free-chaos-merch/','Chaos Merch'],['https://technicallytechnicaldesign.github.io/acidgoblin-tripper/','Trippa']];
const nav=document.createElement('nav');nav.className='town-nav';nav.setAttribute('aria-label','Town pathways');
if(place!=='town'){const home=document.createElement('a');home.href=url('?return=1');home.textContent='← Crossroads';nav.append(home);}
const doors=document.createElement('details');doors.className='town-doors';const summary=document.createElement('summary');summary.textContent='Other doors +';const links=document.createElement('div');links.className='town-door-list';
for(const [path,name] of destinations){if(path===place+'/')continue;const a=document.createElement('a');a.href=url(path);a.textContent=name;links.append(a);}
doors.append(summary,links);nav.append(doors);
const pocket=document.createElement('button');pocket.type='button';pocket.textContent='Your pocket';nav.append(pocket);
const host=document.querySelector('.pressline,.door-line');
if(host){host.querySelectorAll('.town-link,.other-doors').forEach(el=>el.remove());host.prepend(nav);}
else {const old=place==='free-chaos-merch'?document.querySelector('.topbar'):place==='tarot'?document.querySelector('.site-header'):null;if(old)old.replaceWith(nav);else {document.querySelector('.street-home')?.remove();document.querySelector('.shelf-back')?.remove();document.querySelectorAll('.utility-actions>.utility-link').forEach(el=>el.remove());(document.querySelector('.street,.page,.zine-shell')||document.body).prepend(nav);}}
if(place==='fire-guide')document.querySelector('.utility-bar')?.prepend(nav);
document.querySelectorAll('a[href="https://technicallytechnicaldesign.github.io/acidgoblin-tripper/"]').forEach(a=>a.href=url(a.href));
const bag=document.createElement('dialog');bag.className='town-dialog';bag.setAttribute('aria-label','Things in your pocket');document.body.append(bag);
function closeButton(dialog){const b=document.createElement('button');b.type='button';b.className='town-dialog-close';b.textContent='Back to wandering ×';b.addEventListener('click',()=>dialog.close());return b;}
function bagRender(){bag.replaceChildren(closeButton(bag));const h=document.createElement('h2');h.textContent='A few things from here.';bag.append(h);
const p=document.createElement('p');p.textContent=state.found.length?'Small discoveries. No expiry date.':'Just some lint, for now. Wisp at the Well knows where the town keeps its little secrets.';bag.append(p);
for(const id of state.found){const item=secrets[id],a=document.createElement('a');a.href=url('mushroom-post-office/?souvenir='+id);a.textContent=item.name+' · tuck it into a card ↗';bag.append(a);}
if(state.inventions.length){const p=document.createElement('p');p.textContent='Evidence from Bix’s bench';bag.append(p);for(const i of state.inventions){const a=document.createElement('a');a.href=url('mushroom-post-office/?invention='+i);a.textContent=(state.inventionNames[i]||'Invention '+(i+1))+' · prepare a card ↗';bag.append(a);}}
if(state.reading){const a=document.createElement('a');a.href=url('mushroom-post-office/?oracle=latest');a.textContent='Your last Oracle reading · keep it in a card ↗';bag.append(a);}
if(!persistent){const p=document.createElement('p');p.textContent='This browser cannot keep your pocket between pages. The card links still carry your discoveries.';bag.append(p);}}
window.TownJourney.openPocket=()=>{bagRender();if(!bag.open)bag.showModal();};pocket.addEventListener('click',window.TownJourney.openPocket);
function badge(){pocket.textContent='Your pocket'+(state.found.length?' · '+state.found.length:'');}badge();window.addEventListener('town-pocket-change',badge);
function showDiscovery(id,again){const item=secrets[id],d=document.createElement('dialog');d.className='town-dialog discovery-dialog';d.setAttribute('aria-label',item.name);const h=document.createElement('h2');h.textContent=item.name;const p=document.createElement('p');p.textContent=again?'Still yours. '+item.line:item.line;const a=document.createElement('a');a.href=url('mushroom-post-office/?souvenir='+id);a.textContent='Dot should see this. Make a card ↗';const relic=document.createElement('span');relic.className='discovery-relic relic-'+id;relic.setAttribute('aria-hidden','true');d.append(closeButton(d),relic,h,p,a);if(state.heard.includes(id)){const echo=document.createElement('small');echo.textContent='Wisp’s rumour had a little truth tucked inside.';d.append(echo);}document.body.append(d);d.addEventListener('close',()=>d.remove());d.showModal();}
function hotspot(host,id,kind,label,taps){if(!host)return;const b=document.createElement('button');b.type='button';b.className='town-secret secret-'+kind;b.setAttribute('aria-label',label);b.title=label;let n=0;const note=document.createElement('span');note.className='secret-mutter';note.setAttribute('role','status');b.append(note);b.addEventListener('click',e=>{e.stopPropagation();n++;if(state.found.includes(id)||n>=taps){note.textContent='';window.TownJourney.find(id);}else {note.textContent=id==='mushroom'?(n===1?'I am BUSY being a mushroom.':'Fine. One more. Then we discuss rent.'):'There is a very small knock from inside.';}});host.append(b);}
hotspot(document.querySelector('.map-stage'),'mushroom','mushroom','Poke the little mushroom beside the crossroads',3);
hotspot(document.querySelector('.book-display'),'bookmark','bookmark','Examine the little bookmark beneath the book',1);
hotspot(document.querySelector('.work'),'star','lantern','Ask the little lantern above Bix’s bench',2);
function greet(){const line=greeting(place);if(!line)return;const target=document.querySelector('#moss-line,#pip-line,#oracle-bubble,.keeper-bubble,#goblin-line');if(target)target.textContent=line.replace(/^.*? says: /,'');}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',greet);else greet();window.addEventListener('town-discovery',greet);
document.addEventListener('pointerdown',e=>{if(!doors.contains(e.target))doors.open=false;});
window.addEventListener('pageshow',()=>{try{read(JSON.parse(localStorage.getItem(key)));badge();}catch{}});
})();
