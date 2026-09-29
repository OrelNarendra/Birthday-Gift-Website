const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const pages=[...$$('.page')];
let current=0, introDone=false;
const music=$('#bg-music'), toast=$('#toast'), musicBtn=$('#musicBtn');
// Efek di sini murni dekoratif dan sengaja dibuat halus, jadi selalu aktif
// (sebelumnya mati otomatis kalau perangkat memakai mode 'kurangi animasi').
const reduceMotion=false;

function showToast(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(window.t);window.t=setTimeout(()=>toast.classList.remove('show'),2200)}

function goTo(index){
  index=Math.max(0,Math.min(pages.length-1,index));
  if(index===current)return;
  pages[current].classList.remove('active');
  current=index;
  pages[current].classList.add('active');
  window.scrollTo(0,0);
  burstSakura(6);
}

// Navigation uses event delegation so every page button remains clickable.
document.addEventListener('click',(event)=>{
  const next=event.target.closest('[data-next]');
  const prev=event.target.closest('[data-prev]');
  if(next){event.preventDefault();goTo(current+1);return}
  if(prev){event.preventDefault();goTo(current-1);return}
});

$('#replayBtn').addEventListener('click',(event)=>{
  event.preventDefault();
  goTo(0);
  startTyping();
});

// ---------- Opening text ----------
const openingLines=[
  'Ada seseorang yang hari ini harus dibuat tersenyum...',
  'Seseorang yang sudah berjalan sejauh ini dengan hebat...',
  'Seseorang yang diam-diam selalu punya tempat di doaku...',
  'Dan seseorang itu bernama... Siti Nafsiyah Hasana ♡'
];
const typing=$('#typingText'), startBtn=$('#startBtn');
let typingRun=0;
const wait=ms=>new Promise(r=>setTimeout(r,ms));

function setStartEnabled(on){
  startBtn.disabled=!on;
  startBtn.setAttribute('aria-disabled',String(!on));
  startBtn.classList.toggle('disabled',!on);
}

async function startTyping(){
  const run=++typingRun;
  introDone=false;
  setStartEnabled(false);
  typing.textContent='';
  await wait(1200);

  for(let i=0;i<openingLines.length;i++){
    const line=openingLines[i], isLast=i===openingLines.length-1;
    if(run!==typingRun)return;
    typing.textContent='';

    for(const ch of line){
      if(run!==typingRun)return;
      typing.textContent+=ch;
      await wait(ch===' ' ? 38 : 48);
    }

    // The final sentence stays on screen; earlier ones fade out.
    if(isLast)break;
    await wait(1800);
    if(run!==typingRun)return;
    typing.classList.add('fade-left');
    await wait(500);
    typing.classList.remove('fade-left');
    typing.textContent='';
    await wait(350);
  }

  if(run===typingRun){
    introDone=true;
    setStartEnabled(true);
    showToast('the message is ready 🌸');
  }
}
startTyping();

// ---------- Music ----------
// Never block navigation on audio: the file may be missing, still loading,
// or blocked by the browser. play() can stay pending forever in those cases.
let musicOk=true;
function musicFailed(){
  musicOk=false;
  musicBtn.hidden=true;
}
music.addEventListener('error',musicFailed);
const musicSource=music.querySelector('source');
if(musicSource)musicSource.addEventListener('error',musicFailed);

function updateMusicBtn(){
  const playing=!music.paused;
  musicBtn.textContent=playing?'♪ music on':'♪ music off';
  musicBtn.setAttribute('aria-pressed',String(playing));
}
function tryPlayMusic(){
  if(!musicOk)return;
  const p=music.play();
  if(p&&p.then)p.then(()=>{musicBtn.hidden=false;updateMusicBtn()}).catch(()=>{});
}
music.addEventListener('play',updateMusicBtn);
music.addEventListener('pause',updateMusicBtn);
musicBtn.addEventListener('click',()=>{
  if(music.paused)tryPlayMusic();else music.pause();
});
music.volume=.35;

startBtn.addEventListener('click',(e)=>{
  e.preventDefault();
  if(startBtn.disabled)return;
  tryPlayMusic();
  burstSakura(14);
  goTo(1);
});

// ---------- Sakura canvas: kelopak jatuh terus-menerus ----------
const canvas=$('#sakura-canvas'),ctx=canvas.getContext('2d');
const PETAL=new Path2D('M0 0C-4-2-6.5-7-3.5-10.5L0-8.4L3.5-10.5C6.5-7 4-2 0 0Z');
const PALETTE=['#ffb3d3','#ff9ac8','#ffd1e6','#ff7db8','#ffc2dd'];
let petals=[],W=0,H=0;

function newPetal(anywhere,temp){
  const size=.75+Math.random()*.85;
  return{
    x:Math.random()*W, y:anywhere?Math.random()*H:-20-Math.random()*H*.25,
    size, vy:(temp?95+Math.random()*80:26+Math.random()*34)*(.8+size*.25),
    amp:16+Math.random()*30, freq:.35+Math.random()*.55, ph:Math.random()*6.28,
    rot:Math.random()*6.28, rotV:(Math.random()-.5)*1.2,
    flip:Math.random()*6.28, flipV:1+Math.random()*1.8,
    color:Math.random()<.12?'#a8d8ff':PALETTE[(Math.random()*PALETTE.length)|0],
    alpha:.45+Math.random()*.4, temp:!!temp, t:0
  };
}
function targetCount(){return reduceMotion?0:Math.max(22,Math.min(58,Math.round(W*H/24000)))}
function resize(){
  const dpr=Math.min(devicePixelRatio||1,2);
  W=innerWidth;H=innerHeight;
  canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
  const base=petals.filter(p=>!p.temp),want=targetCount();
  petals=petals.filter(p=>p.temp);
  for(let i=0;i<want;i++)petals.push(base[i]||newPetal(true,false));
}
addEventListener('resize',resize);resize();

function burstSakura(n=20){
  if(reduceMotion)return;
  for(let i=0;i<n;i++){const p=newPetal(false,true);p.y=-10-Math.random()*40;petals.push(p)}
}

let last=0,clock=0;
function frame(now){
  const dt=Math.min((now-last)/1000||0,.05);last=now;clock+=dt;
  if(!document.hidden){
    ctx.clearRect(0,0,W,H);
    const wind=14+Math.sin(clock*.18)*10;
    for(let i=petals.length-1;i>=0;i--){
      const p=petals[i];
      p.t+=dt;p.y+=p.vy*dt;p.x+=wind*dt;
      p.rot+=p.rotV*dt;p.flip+=p.flipV*dt;
      const px=p.x+Math.sin(p.t*p.freq*2+p.ph)*p.amp;
      if(p.y>H+24){
        if(p.temp){petals.splice(i,1);continue}
        Object.assign(p,newPetal(false,false));continue;
      }
      if(p.x>W+40)p.x=-40;
      ctx.save();
      ctx.translate(px,p.y);ctx.rotate(p.rot+Math.sin(p.t*p.freq*2+p.ph)*.5);
      const s=p.size*1.1;
      ctx.scale(s,s*(.3+.7*Math.abs(Math.cos(p.flip))));
      ctx.globalAlpha=p.alpha;ctx.fillStyle=p.color;ctx.fill(PETAL);
      ctx.restore();
    }
    ctx.globalAlpha=1;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ---------- Interactions ----------

const fortunes=[
  '「 Tahun ini kamu akan punya lebih banyak alasan untuk tersenyum. 」',
  '「 Plot twist: orang yang paling sayang kamu sedang membuat website ini. 」',
  '「 Your next legendary achievement: mimpi Jepang kamu jadi nyata. 」',
  '「 Compatibility update: you + me = still my favorite duo. 」',
  '「 Fortune says: satu peluk sekarang akan memperbaiki 87% masalah. 」',
  '「 Reminder dari semesta: kamu pantas mendapat hal-hal baik. 」'
];
let lastFortune=-1;
$('#wishBtn').addEventListener('click',()=>{
  let i;
  do{i=Math.floor(Math.random()*fortunes.length)}while(i===lastFortune&&fortunes.length>1);
  lastFortune=i;
  $('#wishResult').textContent=fortunes[i];
  showToast('fortune unlocked ✦');
});

$$('.memory').forEach(card=>card.addEventListener('click',()=>{
  card.classList.toggle('selected');
  showToast(card.classList.contains('selected')?'memory pinned 📌':'memory unpinned');
}));

// Photos that are missing or corrupt get a soft placeholder instead of a broken-image icon.
function markMissing(img){
  const fig=img.closest('.memory');
  if(!fig||fig.classList.contains('missing'))return;
  fig.classList.add('missing');
  img.removeAttribute('alt');
  img.style.display='none';
  const ph=document.createElement('div');
  ph.className='memory-ph';
  ph.innerHTML='<span>🌸</span><small>'+(img.getAttribute('src')||'').split('/').pop()+' belum ditambahkan</small>';
  fig.insertBefore(ph,fig.firstChild);
}
$$('.memory img').forEach(img=>{
  img.addEventListener('error',()=>markMissing(img));
  if(img.complete&&img.naturalWidth===0)markMissing(img);
});


// Keyboard: arrows navigate between pages, but the opening page must be
// passed through its Continue button (so the intro and music start properly).
document.addEventListener('keydown',(event)=>{
  if(current===0)return;
  if(/^(INPUT|TEXTAREA|SELECT)$/.test((event.target||{}).tagName))return;
  if(event.key==='ArrowRight')goTo(current+1);
  if(event.key==='ArrowLeft')goTo(current-1);
});
