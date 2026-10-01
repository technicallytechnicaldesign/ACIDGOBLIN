/* Shared Rummage invention art: one distinct illustrated hybrid per authored pairing. */
(() => {
  'use strict';
  const base=new URL('./assets/inventions/',document.currentScript.src);
  const sheets=[],frames=[];
  const ready=Promise.all(Array.from({length:7},(_,i)=>new Promise((resolve,reject)=>{
    const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error(`Invention art sheet ${i+1} failed to load.`));image.src=new URL(`inventions-${i+1}.png`,base).href;
  }))).then(images=>{
    sheets.push(...images);
    images.forEach((image,sheet)=>{
      for(let cell=0;cell<4;cell++){
        // Authored sheets have slightly offset gutters; preserve every object's silhouette.
        const gutters=[[640,690],[641,648],[653,560],[653,625],[628,690],[673,655],[626,635]], [gx,gy]=gutters[sheet];
        const x=cell%2?gx:0,y=sheet===5&&cell===2?640:cell>=2?gy:0,w=cell%2?image.width-gx:gx,h=sheet===5&&cell===0?660:cell>=2?image.height-y:gy;
        const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(image,x,y,w,h,0,0,w,h);
        if(sheet===5&&cell===0)c.clearRect(0,640,260,20);
        if(sheet===5&&cell===2)c.clearRect(260,0,w-260,20);
        const rgba=c.getImageData(0,0,w,h).data;
        let left=w,top=h,right=-1,bottom=-1;
        for(let row=0;row<h;row++)for(let col=0;col<w;col++)if(rgba[(row*w+col)*4+3]>32){left=Math.min(left,col);top=Math.min(top,row);right=Math.max(right,col);bottom=Math.max(bottom,row);}
        if(right<0)throw new Error(`Empty invention illustration ${sheet*4+cell+1}.`);
        left=Math.max(0,left-4);top=Math.max(0,top-4);right=Math.min(w-1,right+4);bottom=Math.min(h-1,bottom+4);
        frames.push({image:canvas,sx:left,sy:top,sw:right-left+1,sh:bottom-top+1});
      }
    });
    return frames;
  });
  function get(index){return frames[index];}
  function draw(c,index,x,y,w,h){const f=get(index);if(!f)return;const scale=Math.min(w/f.sw,h/f.sh),dw=f.sw*scale,dh=f.sh*scale;c.drawImage(f.image,f.sx,f.sy,f.sw,f.sh,x+(w-dw)/2,y+(h-dh)/2,dw,dh);}
  window.GOBLIN_INVENTION_ART={ready,get,draw,count:28};
})();
