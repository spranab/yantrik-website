'use strict';

// ---- Board model: 10 wide, 20 tall ----
const COLS = 10;
const ROWS = 20;
const CELL = 30; // canvas well is 300x600

// ---- Tetromino definitions (four squares each) ----
const SHAPES = {
  I: { color: '#4fd1c5', cells: [[0,1],[1,1],[2,1],[3,1]] },
  O: { color: '#f6e05e', cells: [[1,0],[2,0],[1,1],[2,1]] },
  T: { color: '#b794f4', cells: [[1,0],[0,1],[1,1],[2,1]] },
  S: { color: '#68d391', cells: [[1,0],[2,0],[0,1],[1,1]] },
  Z: { color: '#fc8181', cells: [[0,0],[1,0],[1,1],[2,1]] },
  J: { color: '#63b3ed', cells: [[0,0],[0,1],[1,1],[2,1]] },
  L: { color: '#f6ad55', cells: [[2,0],[0,1],[1,1],[2,1]] }
};
const KEYS = Object.keys(SHAPES);

function makeBoard() {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(null));
}

let board = makeBoard();

// ---- Canvas setup ----
const wellCanvas = document.getElementById('well');
const wellCtx = wellCanvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextCtx = nextCanvas.getContext('2d');

function drawCell(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * size, y * size, size, size);
  ctx.strokeStyle = 'rgba(0,0,0,0.45)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x * size + 0.5, y * size + 0.5, size - 1, size - 1);
}

function drawWell() {
  wellCtx.fillStyle = '#05070a';
  wellCtx.fillRect(0, 0, wellCanvas.width, wellCanvas.height);
  // faint grid
  wellCtx.strokeStyle = 'rgba(255,255,255,0.045)';
  wellCtx.lineWidth = 1;
  for (let c = 1; c < COLS; c++) {
    wellCtx.beginPath();
    wellCtx.moveTo(c * CELL + 0.5, 0);
    wellCtx.lineTo(c * CELL + 0.5, wellCanvas.height);
    wellCtx.stroke();
  }
  for (let r = 1; r < ROWS; r++) {
    wellCtx.beginPath();
    wellCtx.moveTo(0, r * CELL + 0.5);
    wellCtx.lineTo(wellCanvas.width, r * CELL + 0.5);
    wellCtx.stroke();
  }
  // settled blocks
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c]) drawCell(wellCtx, c, r, CELL, board[r][c]);
    }
  }
}

function drawNext() {
  nextCtx.fillStyle = '#05070a';
  nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
}


// ---- Active piece ----
let piece = null;

function spawn() {
  const key = KEYS[Math.floor(Math.random() * KEYS.length)];
  const shape = SHAPES[key];
  piece = {
    key: key,
    color: shape.color,
    cells: shape.cells.map(c => [c[0], c[1]]),
    x: 3,
    y: 0
  };
}

function drawPiece() {
  if (!piece) return;
  for (const [cx, cy] of piece.cells) {
    const x = piece.x + cx;
    const y = piece.y + cy;
    if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
      drawCell(wellCtx, x, y, CELL, piece.color);
    }
  }
}

function draw() {
  drawWell();
  drawPiece();
}


// ---- Gravity + controls ----
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const bestEl = document.getElementById('best');

let dropMs = 800;
let lastDrop = 0;
let running = false;

function collides(cells, ox, oy) {
  for (const [cx, cy] of cells) {
    const x = ox + cx;
    const y = oy + cy;
    if (x < 0 || x >= COLS || y >= ROWS) return true;
    if (y >= 0 && board[y][x]) return true;
  }
  return false;
}

function move(dx) {
  if (!piece) return;
  if (!collides(piece.cells, piece.x + dx, piece.y)) {
    piece.x += dx;
    draw();
  }
}

function rotate() {
  if (!piece) return;
  const rotated = piece.cells.map(([x, y]) => [3 - y, x]);
  for (const kick of [0, -1, 1, -2, 2]) {
    if (!collides(rotated, piece.x + kick, piece.y)) {
      piece.cells = rotated;
      piece.x += kick;
      draw();
      return;
    }
  }
}

function softDrop() {
  if (!piece) return;
  if (!collides(piece.cells, piece.x, piece.y + 1)) {
    piece.y += 1;
    draw();
  } else {
    lockPiece();
  }
}

function lockPiece() {
  for (const [cx, cy] of piece.cells) {
    const x = piece.x + cx;
    const y = piece.y + cy;
    if (y >= 0 && y < ROWS && x >= 0 && x < COLS) board[y][x] = piece.color;
  }
  spawn();
  draw();
}

function tick(ts) {
  if (!running) return;
  if (!lastDrop) lastDrop = ts;
  if (ts - lastDrop >= dropMs) {
    lastDrop = ts;
    softDrop();
  }
  requestAnimationFrame(tick);
}

function start() {
  if (running) return;
  running = true;
  lastDrop = 0;
  requestAnimationFrame(tick);
}

function pause() {
  running = false;
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') move(-1);
  else if (e.key === 'ArrowRight') move(1);
  else if (e.key === 'ArrowDown') softDrop();
  else if (e.key === 'ArrowUp') rotate();
  else if (e.key === ' ') { e.preventDefault(); running ? pause() : start(); }
});

document.getElementById('start').addEventListener('click', start);
document.getElementById('pause').addEventListener('click', pause);

document.querySelectorAll('#touch button').forEach((b) => {
  b.addEventListener('click', () => {
    const a = b.dataset.act;
    if (a === 'left') move(-1);
    else if (a === 'right') move(1);
    else if (a === 'down') softDrop();
    else if (a === 'rotate') rotate();
  });
});

// ---- Boot ----
spawn();
draw();
drawNext();
