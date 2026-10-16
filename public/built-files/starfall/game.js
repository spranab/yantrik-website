const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let W, H;
function resize(){ W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
window.addEventListener('resize', resize); resize();

let ship = {x: W/2, y: H-60, w:40, h:24};
let keys = {};
window.addEventListener('keydown', e=>{ keys[e.key]=true; if(e.key===' '||e.key==='Enter') startOrRestart(); if(e.key==='m'||e.key==='M') toggleSound(); });
window.addEventListener('keyup', e=>{ keys[e.key]=false; });
canvas.addEventListener('touchstart', e=>{ e.preventDefault(); ship.x = e.touches[0].clientX; startOrRestart(); }, {passive:false});
canvas.addEventListener('touchmove', e=>{ e.preventDefault(); ship.x = e.touches[0].clientX; }, {passive:false});

let stars = [], orbs = [], score = 0, level = 1, gameOver = false, started = false;
let soundOn = false, audioCtx = null;

function beep(freq, dur){
  if(!soundOn) return;
  if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.connect(g); g.connect(audioCtx.destination);
  o.frequency.value = freq; o.type = 'sine';
  g.gain.setValueAtTime(0.15, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
  o.start(); o.stop(audioCtx.currentTime + dur);
}

function startOrRestart(){
  if(started && !gameOver) return;
  stars=[]; orbs=[]; score=0; level=1; gameOver=false; started=true;
  ship.x = W/2;
}

function spawnStar(){ stars.push({x: Math.random()*W, y: -20, r: 8+Math.random()*8, vy: 2+Math.random()*2 + level*0.5}); }
function spawnOrb(){ orbs.push({x: Math.random()*W, y: -20, r: 10, vy: 1.5+Math.random() + level*0.3}); }

function update(){
  if(!started || gameOver) return;
  const speed = 5;
  if(keys['ArrowLeft']) ship.x -= speed;
  if(keys['ArrowRight']) ship.x += speed;
  ship.x = Math.max(ship.w/2, Math.min(W - ship.w/2, ship.x));
  if(Math.random() < 0.03) spawnStar();
  if(Math.random() < 0.02) spawnOrb();
  for(let i=stars.length-1;i>=0;i--){
    const s = stars[i]; s.y += s.vy;
    if(s.y > H+30){ stars.splice(i,1); continue; }
    if(Math.abs(s.y-ship.y) < (s.r+ship.h/2) && Math.abs(s.x-ship.x) < (s.r+ship.w/2)){
      gameOver = true; beep(150, 0.4);
    }
  }
  for(let i=orbs.length-1;i>=0;i--){
    const o = orbs[i]; o.y += o.vy;
    const caught = Math.abs(o.y-ship.y) < (o.r+ship.h/2) && Math.abs(o.x-ship.x) < (o.r+ship.w/2);
    if(caught){ score += 10; level = Math.floor(score/100)+1; orbs.splice(i,1); beep(800,0.08); continue; }
    if(o.y > H+30) orbs.splice(i,1);
  }
}

function draw(){
  ctx.fillStyle = '#050515'; ctx.fillRect(0,0,W,H);
  ctx.fillStyle = '#ff5';
  for(const s of stars){ ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill(); }
  ctx.fillStyle = '#0f8';
  for(const o of orbs){ ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI*2); ctx.fill(); }
  ctx.fillStyle = '#4af';
  ctx.beginPath(); ctx.moveTo(ship.x, ship.y - ship.h/2); ctx.lineTo(ship.x - ship.w/2, ship.y + ship.h/2); ctx.lineTo(ship.x + ship.w/2, ship.y + ship.h/2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '18px monospace';
  ctx.fillText('Score: ' + score + '  Level: ' + level, 10, 24);
  ctx.fillText('Sound: ' + (soundOn?'ON':'OFF'), 10, 48);
  if(!started){ ctx.font = '32px monospace'; ctx.fillText('STARFALL — press Space or tap to start', W/2-200, H/2); }
  if(gameOver){ ctx.font = '32px monospace'; ctx.fillText('GAME OVER — press Space or tap to restart', W/2-220, H/2); }
}

function toggleSound(){ soundOn = !soundOn; if(soundOn) beep(600,0.1); }

function loop(){ update(); draw(); requestAnimationFrame(loop); }
loop();
