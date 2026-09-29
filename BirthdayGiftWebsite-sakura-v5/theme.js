(()=>{
const $=s=>document.querySelector(s);
const rm=false; // efek selalu aktif
const fx=document.createElement('div');fx.id='fx';fx.setAttribute('aria-hidden','true');document.body.appendChild(fx);
const rnd=(a,b)=>a+Math.random()*(b-a);
const EASE='cubic-bezier(.2,.7,.25,1)',SOFT='cubic-bezier(.4,0,.2,1)';
const PINK='#ff8cc0',ROSE='#ff5ca8',SKY='#7cc8ff',GOLD='#ffd58a';

// ---- bentuk SVG ----
const heart=c=>`<svg viewBox="0 0 24 24" style="color:${c}"><path fill="${c}" d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 5 6.2 5c2 0 3.6 1.1 4.6 2.7h.4C12.2 6.1 13.8 5 15.8 5 19 5 21.1 8.4 19.6 11.8 17.5 16.4 12 21 12 21z"/></svg>`;
const star=c=>`<svg viewBox="-10 -10 20 20" style="color:${c}"><path fill="${c}" d="M0-9C1 -3 3 -1 9 0C3 1 1 3 0 9C-1 3-3 1-9 0C-3-1-1-3 0-9Z"/></svg>`;
const lips=c=>`<svg viewBox="0 0 64 44" style="color:${c}"><path fill="${c}" d="M2 22C10 12 20 10 26 13C29 14.5 30.5 15.5 32 17C33.5 15.5 35 14.5 38 13C44 10 54 12 62 22C50 26 40 26 32 25C24 26 14 26 2 22Z"/><path fill="${c}" fill-opacity=".88" d="M2 22C14 26 24 26 32 25C40 26 50 26 62 22C56 36 44 42 32 42C20 42 8 36 2 22Z"/><ellipse cx="32" cy="34" rx="10" ry="3" fill="#fff" fill-opacity=".22"/></svg>`;
const lantern=c=>`<svg viewBox="0 0 40 56" style="color:${c}"><rect x="12" y="2" width="16" height="5" rx="2" fill="#2b3e63"/><ellipse cx="20" cy="30" rx="16" ry="22" fill="${c}" fill-opacity=".85" stroke="#fff" stroke-opacity=".5"/><path d="M20 8V52M9 14Q20 30 9 46M31 14Q20 30 31 46" stroke="#fff" stroke-opacity=".35" fill="none"/><rect x="12" y="50" width="16" height="4" rx="2" fill="#2b3e63"/></svg>`;

// ---- helper ----
function spawn(html,x,y,w,h,keyframes,opts,cls=''){
  const e=document.createElement('div');e.className='f '+cls;
  e.style.width=w+'px';e.style.height=h+'px';e.style.left=(x-w/2)+'px';e.style.top=(y-h/2)+'px';
  if(html)e.innerHTML=html;
  fx.appendChild(e);
  const a=e.animate(keyframes,{fill:'both',easing:EASE,...opts});
  a.onfinish=()=>e.remove();
  return a;
}
const center=el=>{const r=el.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2,r]};
function ripple(x,y,color,size=44,dur=1000,delay=0){
  spawn('',x,y,size,size,[{transform:'scale(.2)',opacity:.65},{transform:'scale(3.2)',opacity:0}],{duration:dur,delay,easing:SOFT},'ring').effect.target.style.color=color;
}
function once(el,cls,ms){el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);clearTimeout(el['_'+cls]);el['_'+cls]=setTimeout(()=>el.classList.remove(cls),ms)}

// ====== 1) tap for a tiny hug: dua hati (pink & biru) berpelukan jadi satu ======
$('#heartBtn').addEventListener('click',e=>{
  const b=e.currentTarget;once(b,'beat',900);
  const[cx,cy]=center(b);
  if(rm)return;
  const gap=78,size=24,dur=720,y0=cy-8;
  spawn(heart(ROSE),cx,y0,size,size,[{transform:`translate(${-gap}px,10px) scale(.5) rotate(-18deg)`,opacity:0},{transform:'translate(-8px,0) scale(1) rotate(-8deg)',opacity:1,offset:.75},{transform:'translate(0,0) scale(.9) rotate(0)',opacity:1}],{duration:dur});
  spawn(heart(SKY),cx,y0,size,size,[{transform:`translate(${gap}px,10px) scale(.5) rotate(18deg)`,opacity:0},{transform:'translate(8px,0) scale(1) rotate(8deg)',opacity:1,offset:.75},{transform:'translate(0,0) scale(.9) rotate(0)',opacity:1}],{duration:dur});
  setTimeout(()=>{
    ripple(cx,y0,PINK,40,1100);ripple(cx,y0,SKY,40,1300,140);
    spawn(heart(PINK),cx,y0,40,40,[{transform:'translateY(0) scale(.5)',opacity:1},{transform:'translateY(-26px) scale(1.35)',opacity:1,offset:.3},{transform:'translateY(-120px) scale(1)',opacity:0}],{duration:1700});
    for(let i=0;i<9;i++){
      const a=rnd(-2.5,-.64),d=rnd(50,120),c=i%3?PINK:SKY;
      spawn(i%2?heart(c):star(c),cx,y0,rnd(9,15),rnd(9,15),[{transform:'translate(0,0) scale(.4)',opacity:0},{opacity:1,offset:.2},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px) scale(1)`,opacity:0}],{duration:rnd(1200,1900),delay:rnd(0,200)});
    }
  },dur-40);
  const card=$('.letter-card');
  if(card)card.animate([{transform:'scale(1)',boxShadow:'0 25px 80px rgba(0,0,0,.48)'},{transform:'scale(.984)',boxShadow:'0 25px 80px rgba(0,0,0,.48),0 0 60px rgba(255,92,168,.3)',offset:.5},{transform:'scale(1)',boxShadow:'0 25px 80px rgba(0,0,0,.48)'}],{duration:1000,delay:dur-120,easing:SOFT});
  showToast('sending a 999999999% strength hug 🫂');
});

// ====== 2) open my fortune: lentera menyala, cahaya, kertas ramalan terbuka ======
$('#wishBtn').addEventListener('click',e=>{
  const r=$('#wishResult'),l=$('.lantern');
  r.classList.remove('slip');void r.offsetWidth;r.classList.add('slip');
  if(l)once(l,'flare',1500);
  if(rm)return;
  const[lx,ly]=l?center(l):[innerWidth/2,innerHeight/3];
  spawn('',lx,ly,120,120,[{transform:'scale(.2)',opacity:.75},{transform:'scale(3)',opacity:0}],{duration:1500,easing:SOFT},'glow').effect.target.style.background='radial-gradient(circle,rgba(255,196,120,.55),rgba(255,92,168,.25) 45%,transparent 70%)';
  ripple(lx,ly,GOLD,50,1400);
  for(let i=0;i<12;i++){
    const a=rnd(0,6.28),d=rnd(45,120),c=[GOLD,PINK,SKY][i%3],s=rnd(9,17);
    spawn(star(c),lx,ly,s,s,[{transform:'translate(0,0) scale(0) rotate(0)',opacity:0},{opacity:1,offset:.25},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d-40}px) scale(1) rotate(90deg)`,opacity:0}],{duration:rnd(1400,2200),delay:rnd(0,300)});
  }
  const[bx,by]=center(e.currentTarget);
  [ROSE,'#4fb0ff'].forEach((c,i)=>{
    const dx=i?60:-60,y1=-(innerHeight+80);
    spawn(lantern(c),bx+dx*.4,by,30,42,[{transform:'translate(0,0)',opacity:0},{transform:`translate(${dx*.3}px,${y1*.12}px)`,opacity:1,offset:.1},{transform:`translate(${-dx*.5}px,${y1*.5}px)`,opacity:.9,offset:.55},{transform:`translate(${dx}px,${y1}px)`,opacity:0}],{duration:6200+i*700,delay:200+i*350,easing:'ease-in-out'});
  });
});

// ====== 3) claim your birthday kiss: bekas ciuman, hati melayang, semburat pink ======
const fb=$('#finalBtn'),fbHTML=fb.innerHTML;
fb.addEventListener('click',()=>{
  fb.classList.add('sent');fb.innerHTML='mwah! delivered 💋';
  clearTimeout(fb._t);fb._t=setTimeout(()=>{fb.classList.remove('sent');fb.innerHTML=fbHTML},2800);
  showToast('mwah 💋 — birthday kiss delivered');
  burstSakura(26);
  const h=$('.final-heart');
  if(h)h.animate([{transform:'scale(1)'},{transform:'scale(1.32)',offset:.3},{transform:'scale(.96)',offset:.6},{transform:'scale(1)'}],{duration:1100,easing:SOFT});
  if(rm)return;
  const[cx,cy]=center(fb);
  spawn('',innerWidth/2,innerHeight/2,innerWidth,innerHeight,[{opacity:0},{opacity:1,offset:.25},{opacity:0}],{duration:1600,easing:SOFT},'glow').effect.target.style.background='radial-gradient(circle at 50% 55%,rgba(255,92,168,.22),transparent 60%)';
  ripple(cx,cy,PINK,50,1300);
  const spots=[[.5,.33],[.3,.5],[.7,.48],[.42,.68],[.62,.7],[.2,.3],[.8,.3]];
  spots.forEach(([px,py],i)=>{
    const w=rnd(46,72),rot=rnd(-28,28),x=innerWidth*px+rnd(-20,20),y=innerHeight*py+rnd(-20,20),c=i%3===2?'#ff7fb5':ROSE;
    spawn(lips(c),x,y,w,w*.69,[{transform:`scale(1.9) rotate(${rot}deg)`,opacity:0},{transform:`scale(1) rotate(${rot}deg)`,opacity:.9,offset:.18},{transform:`scale(1.04) rotate(${rot}deg)`,opacity:.85,offset:.6},{transform:`scale(1.1) rotate(${rot}deg)`,opacity:0}],{duration:2300,delay:i*230,easing:EASE});
  });
  for(let i=0;i<16;i++){
    const c=[PINK,ROSE,SKY][i%3],s=rnd(12,24),x=rnd(.06,.94)*innerWidth,sway=rnd(-40,40);
    spawn(heart(c),x,innerHeight+30,s,s,[{transform:'translate(0,0) scale(.6)',opacity:0},{opacity:.95,offset:.15},{transform:`translate(${sway}px,${-innerHeight*.5}px) scale(1)`,opacity:.8,offset:.6},{transform:`translate(${-sway}px,${-innerHeight-60}px) scale(1.1)`,opacity:0}],{duration:rnd(2800,4200),delay:i*130,easing:'ease-out'});
  }
});
})();
