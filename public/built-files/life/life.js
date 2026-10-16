// Life Lab - Conway's Game of Life. No libraries, no network.
(function () {
  'use strict';

  var COLS = 60;
  var ROWS = 40;
  var CELL = 14;

  var canvas = document.getElementById('board');
  var ctx = canvas.getContext('2d');
  canvas.width = COLS * CELL;
  canvas.height = ROWS * CELL;

  var grid = new Uint8Array(COLS * ROWS);
  var next = new Uint8Array(COLS * ROWS);
  var generation = 0;
  var running = false;
  var speed = 8;          // generations per second
  var acc = 0;
  var last = 0;
  var drawing = false;
  var erase = false;

  function idx(x, y) { return y * COLS + x; }

  function alive(x, y) {
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return 0;
    return grid[idx(x, y)];
  }

  function neighbours(x, y) {
    return alive(x - 1, y - 1) + alive(x, y - 1) + alive(x + 1, y - 1) +
           alive(x - 1, y)     +                    alive(x + 1, y) +
           alive(x - 1, y + 1) + alive(x, y + 1) + alive(x + 1, y + 1);
  }

  function step() {
    for (var y = 0; y < ROWS; y++) {
      for (var x = 0; x < COLS; x++) {
        var n = neighbours(x, y);
        var a = grid[idx(x, y)];
        // Conway: survive on 2 or 3, born on exactly 3, else dead.
        next[idx(x, y)] = (a && (n === 2 || n === 3)) || (!a && n === 3) ? 1 : 0;
      }
    }
    var t = grid; grid = next; next = t;
    generation++;
  }

  function liveCount() {
    var c = 0;
    for (var i = 0; i < grid.length; i++) c += grid[i];
    return c;
  }

  function render() {
    ctx.fillStyle = '#05070b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#101725';
    ctx.lineWidth = 1;
    for (var x = 0; x <= COLS; x++) {
      ctx.beginPath(); ctx.moveTo(x * CELL + 0.5, 0); ctx.lineTo(x * CELL + 0.5, canvas.height); ctx.stroke();
    }
    for (var y = 0; y <= ROWS; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * CELL + 0.5); ctx.lineTo(canvas.width, y * CELL + 0.5); ctx.stroke();
    }
    ctx.fillStyle = '#7fd1a6';
    for (var yy = 0; yy < ROWS; yy++) {
      for (var xx = 0; xx < COLS; xx++) {
        if (grid[idx(xx, yy)]) ctx.fillRect(xx * CELL + 1, yy * CELL + 1, CELL - 1, CELL - 1);
      }
    }
    var genEl = document.getElementById('gen');
    var liveEl = document.getElementById('live');
    if (genEl) genEl.textContent = String(generation);
    if (liveEl) liveEl.textContent = String(liveCount());
  }

  function loop(ts) {
    if (!last) last = ts;
    var dt = (ts - last) / 1000;
    last = ts;
    if (running) {
      acc += dt;
      var interval = 1 / speed;
      var guard = 0;
      while (acc >= interval && guard < 10) { step(); acc -= interval; guard++; }
      if (acc > interval) acc = 0;
    }
    render();
    requestAnimationFrame(loop);
  }

  function cellFromEvent(e) {
    var r = canvas.getBoundingClientRect();
    var px = (e.clientX - r.left) * (canvas.width / r.width);
    var py = (e.clientY - r.top) * (canvas.height / r.height);
    return { x: Math.floor(px / CELL), y: Math.floor(py / CELL) };
  }

  function paint(e) {
    var c = cellFromEvent(e);
    if (c.x < 0 || c.y < 0 || c.x >= COLS || c.y >= ROWS) return;
    grid[idx(c.x, c.y)] = erase ? 0 : 1;
  }

  canvas.addEventListener('pointerdown', function (e) {
    drawing = true;
    erase = (e.button === 2) || e.shiftKey;
    canvas.setPointerCapture(e.pointerId);
    paint(e);
  });
  canvas.addEventListener('pointermove', function (e) { if (drawing) paint(e); });
  canvas.addEventListener('pointerup', function () { drawing = false; });
  canvas.addEventListener('pointercancel', function () { drawing = false; });
  canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  function setRunning(v) {
    running = v;
    acc = 0;
    last = 0;
    var b = document.getElementById('play');
    if (b) { b.textContent = running ? 'Pause' : 'Start'; b.classList.toggle('active', running); }
  }

  function clearGrid() {
    grid.fill(0);
    generation = 0;
  }

  function stamp(cells, ox, oy) {
    for (var i = 0; i < cells.length; i++) {
      var x = ox + cells[i][0];
      var y = oy + cells[i][1];
      if (x >= 0 && y >= 0 && x < COLS && y < ROWS) grid[idx(x, y)] = 1;
    }
  }

  var PATTERNS = {
    glider: [[1,0],[2,1],[0,2],[1,2],[2,2]],
    lwss: [[1,0],[4,0],[0,1],[0,2],[4,2],[0,3],[1,3],[2,3],[3,3]],
    pulsar: [
      [2,0],[3,0],[4,0],[8,0],[9,0],[10,0],
      [0,2],[5,2],[7,2],[12,2],
      [0,3],[5,3],[7,3],[12,3],
      [0,4],[5,4],[7,4],[12,4],
      [2,5],[3,5],[4,5],[8,5],[9,5],[10,5],
      [2,7],[3,7],[4,7],[8,7],[9,7],[10,7],
      [0,8],[5,8],[7,8],[12,8],
      [0,9],[5,9],[7,9],[12,9],
      [0,10],[5,10],[7,10],[12,10],
      [2,12],[3,12],[4,12],[8,12],[9,12],[10,12]
    ],
    gosper: [
      [0,4],[0,5],[1,4],[1,5],
      [10,4],[10,5],[10,6],[11,3],[11,7],[12,2],[12,8],[13,2],[13,8],
      [14,5],[15,3],[15,7],[16,4],[16,5],[16,6],[17,5],
      [20,2],[20,3],[20,4],[21,2],[21,3],[21,4],[22,1],[22,5],
      [24,0],[24,1],[24,5],[24,6],
      [34,2],[34,3],[35,2],[35,3]
    ]
  };

  function drop(name) {
    var cells = PATTERNS[name];
    if (!cells) return;
    var w = 0, h = 0;
    for (var i = 0; i < cells.length; i++) {
      if (cells[i][0] > w) w = cells[i][0];
      if (cells[i][1] > h) h = cells[i][1];
    }
    var ox = Math.floor((COLS - w) / 2);
    var oy = Math.floor((ROWS - h) / 2);
    stamp(cells, ox, oy);
  }

  function wire() {
    var play = document.getElementById('play');
    var stepBtn = document.getElementById('step');
    var clearBtn = document.getElementById('clear');
    var speedEl = document.getElementById('speed');
    if (play) play.addEventListener('click', function () { setRunning(!running); });
    if (stepBtn) stepBtn.addEventListener('click', function () { setRunning(false); step(); });
    if (clearBtn) clearBtn.addEventListener('click', function () { setRunning(false); clearGrid(); });
    if (speedEl) {
      speed = Number(speedEl.value) || 8;
      speedEl.addEventListener('input', function () {
        speed = Number(speedEl.value) || 8;
        var out = document.getElementById('speedOut');
        if (out) out.textContent = speed + '/s';
      });
      var out0 = document.getElementById('speedOut');
      if (out0) out0.textContent = speed + '/s';
    }
    var buttons = document.querySelectorAll('[data-pattern]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (e) { drop(e.currentTarget.getAttribute('data-pattern')); });
    }
  }

  wire();
  requestAnimationFrame(loop);
})();
