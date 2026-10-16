// Labyrinth - grid model, randomized DFS carving, animated reveal, BFS + A* solvers
const canvas = document.getElementById('maze');
const ctx = canvas.getContext('2d');
const sizeSel = document.getElementById('size');
const algoSel = document.getElementById('algo');
const newBtn = document.getElementById('new');
const solveBtn = document.getElementById('solve');
const lookedEl = document.getElementById('looked');
const pathEl = document.getElementById('pathlen');

let N = 20;            // cells per side
let cell = 0;          // pixel size of a cell
let grid = [];         // grid[y][x] = {n,e,s,w,visited}
let carveStack = [];
let carveTimer = null;
let path = [];
let looked = 0;

function idx(x, y) { return y * N + x; }

function makeGrid() {
  grid = [];
  for (let y = 0; y < N; y++) {
    const row = [];
    for (let x = 0; x < N; x++) row.push({ n: true, e: true, s: true, w: true, visited: false });
    grid.push(row);
  }
}

function neighbours(x, y) {
  const out = [];
  if (y > 0) out.push([x, y - 1, 'n', 's']);
  if (x < N - 1) out.push([x + 1, y, 'e', 'w']);
  if (y < N - 1) out.push([x, y + 1, 's', 'n']);
  if (x > 0) out.push([x - 1, y, 'w', 'e']);
  return out;
}

function startCarve() {
  if (carveTimer) { clearInterval(carveTimer); carveTimer = null; }
  N = parseInt(sizeSel.value, 10);
  cell = Math.floor(canvas.width / N);
  makeGrid();
  path = [];
  looked = 0;
  lookedEl.textContent = '0';
  pathEl.textContent = '0';
  carveStack = [[0, 0]];
  grid[0][0].visited = true;
  draw();
  carveTimer = setInterval(carveStep, 12);
}

function carveStep() {
  if (carveStack.length === 0) {
    clearInterval(carveTimer);
    carveTimer = null;
    draw();
    return;
  }
  const [x, y] = carveStack[carveStack.length - 1];
  const options = neighbours(x, y).filter(([nx, ny]) => !grid[ny][nx].visited);
  if (options.length === 0) { carveStack.pop(); draw(); return; }
  const [nx, ny, dir, back] = options[Math.floor(Math.random() * options.length)];
  grid[y][x][dir] = false;
  grid[ny][nx][back] = false;
  grid[ny][nx].visited = true;
  carveStack.push([nx, ny]);
  draw();
}

function openNeighbours(x, y) {
  const c = grid[y][x];
  const out = [];
  if (!c.n && y > 0) out.push([x, y - 1]);
  if (!c.e && x < N - 1) out.push([x + 1, y]);
  if (!c.s && y < N - 1) out.push([x, y + 1]);
  if (!c.w && x > 0) out.push([x - 1, y]);
  return out;
}

function bfs() {
  const start = [0, 0], goal = [N - 1, N - 1];
  const prev = new Map();
  const seen = new Set([idx(0, 0)]);
  const queue = [start];
  let count = 0;
  while (queue.length) {
    const [x, y] = queue.shift();
    count++;
    if (x === goal[0] && y === goal[1]) break;
    for (const [nx, ny] of openNeighbours(x, y)) {
      const k = idx(nx, ny);
      if (seen.has(k)) continue;
      seen.add(k);
      prev.set(k, [x, y]);
      queue.push([nx, ny]);
    }
  }
  return { count, path: rebuild(prev, goal) };
}

function astar() {
  const goal = [N - 1, N - 1];
  const h = (x, y) => Math.abs(goal[0] - x) + Math.abs(goal[1] - y);
  const prev = new Map();
  const gScore = new Map([[idx(0, 0), 0]]);
  const open = [[0, 0]];
  const closed = new Set();
  let count = 0;
  while (open.length) {
    let best = 0;
    for (let i = 1; i < open.length; i++) {
      const [ax, ay] = open[i], [bx, by] = open[best];
      const fa = (gScore.get(idx(ax, ay)) || 0) + h(ax, ay);
      const fb = (gScore.get(idx(bx, by)) || 0) + h(bx, by);
      if (fa < fb) best = i;
    }
    const [x, y] = open.splice(best, 1)[0];
    const k = idx(x, y);
    if (closed.has(k)) continue;
    closed.add(k);
    count++;
    if (x === goal[0] && y === goal[1]) break;
    const g = gScore.get(k) || 0;
    for (const [nx, ny] of openNeighbours(x, y)) {
      const nk = idx(nx, ny);
      if (closed.has(nk)) continue;
      const tentative = g + 1;
      if (!gScore.has(nk) || tentative < gScore.get(nk)) {
        gScore.set(nk, tentative);
        prev.set(nk, [x, y]);
        open.push([nx, ny]);
      }
    }
  }
  return { count, path: rebuild(prev, goal) };
}

function rebuild(prev, goal) {
  const out = [];
  let cur = goal;
  while (cur) {
    out.push(cur);
    const p = prev.get(idx(cur[0], cur[1]));
    if (!p) break;
    cur = p;
  }
  return out.reverse();
}

function solve() {
  if (carveStack.length) return;
  const res = algoSel.value === 'astar' ? astar() : bfs();
  looked = res.count;
  path = res.path;
  lookedEl.textContent = String(looked);
  pathEl.textContent = String(path.length);
  draw();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0b0e13';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (path.length > 1) {
    ctx.strokeStyle = '#6fd3a0';
    ctx.lineWidth = Math.max(2, cell * 0.22);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    path.forEach(([x, y], i) => {
      const cx = x * cell + cell / 2, cy = y * cell + cell / 2;
      if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    });
    ctx.stroke();
  }

  ctx.strokeStyle = '#8fa3b8';
  ctx.lineWidth = Math.max(1, cell * 0.12);
  ctx.beginPath();
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const c = grid[y][x];
      if (!c) continue;
      const px = x * cell, py = y * cell;
      if (c.n) { ctx.moveTo(px, py); ctx.lineTo(px + cell, py); }
      if (c.w) { ctx.moveTo(px, py); ctx.lineTo(px, py + cell); }
      if (x === N - 1 && c.e) { ctx.moveTo(px + cell, py); ctx.lineTo(px + cell, py + cell); }
      if (y === N - 1 && c.s) { ctx.moveTo(px, py + cell); ctx.lineTo(px + cell, py + cell); }
    }
  }
  ctx.stroke();
}

newBtn.addEventListener('click', startCarve);
solveBtn.addEventListener('click', solve);
sizeSel.addEventListener('change', startCarve);

grid = [];
N = parseInt(sizeSel.value, 10);
cell = Math.floor(canvas.width / N);
makeGrid();
draw();
startCarve();
