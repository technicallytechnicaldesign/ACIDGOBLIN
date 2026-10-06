(() => {
'use strict';
const cards=[...document.querySelectorAll('.artifact')].map(card=>({href:card.querySelector('.poster').href,title:card.querySelector('h3').textContent,alt:card.querySelector('.poster img').alt}));
const button=document.getElementById('pull-print'),image=document.getElementById('counter-image'),open=document.getElementById('counter-open'),take=document.getElementById('counter-take'),label=document.getElementById('counter-title'),status=document.getElementById('stall-status');
let selected=cards.findIndex(card=>card.href===open.href);
button.addEventListener('click',()=>{
 const next=(selected+1+Math.floor(Math.random()*(cards.length-1)))%cards.length,item=cards[next],probe=new Image();
 button.disabled=true;status.textContent='Dot is rummaging beneath the drying line…';
 probe.onload=()=>{selected=next;image.src=item.href;image.alt=item.alt;open.href=take.href=item.href;open.setAttribute('aria-label','Open '+item.title+' at full size');take.download=item.href.split('/').pop();label.textContent=item.title;status.textContent='A print escaped the pile. It is yours to keep.';document.querySelector('.keeper-bubble').textContent='Oho, “'+item.title+'” came to the top. I think it has chosen your wall.';button.disabled=false;};
 probe.onerror=()=>{status.textContent='That print is still drying. Try another one.';button.disabled=false;};
 probe.src=item.href;
});
})();