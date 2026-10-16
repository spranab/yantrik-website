(function () {
  'use strict';
  var N = 32;
  var PALETTE = [
    '#000000','#ffffff','#7f7f7f','#c0c0c0',
    '#ff0000','#ff7f00','#ffff00','#00ff00',
    '#00ffff','#0000ff','#7f00ff','#ff00ff',
    '#7f3f00','#ffb6c1','#006400','#1e3a8a'
  ];
  var board = document.getElementById('board');
  var bctx = board.getContext('2d');
  var preview = document.getElementById('preview');
  var pctx = preview.getContext('2d');
  var paletteEl = document.getElementById('palette');
  var gridBtn = document.getElementById('grid');

  var pixels = new Array(N * N).fill('#ffffff');
  var colour = '#000000';
  var tool = 'pencil';
  var showGrid = true;
  var STORE = 'pixelsmith.v1';
  var undoStack = [];
  var redoStack = [];
  var drawing = false;
  var lastCell = null;

  function idx(x, y) { return y * N + x; }

  function snapshot() { return pixels.slice(); }

  function pushUndo() {
    undoStack.push(snapshot());
    if (undoStack.length > 60) undoStack.shift();
    redoStack.length = 0;
  }

  function render() {
    for (var y = 0; y < N; y++) {
      for (var x = 0; x < N; x++) {
        bctx.fillStyle = pixels[idx(x, y)];
        bctx.fillRect(x, y, 1, 1);
      }
    }
    if (showGrid) {
      bctx.strokeStyle = 'rgba(0,0,0,0.18)';
      bctx.lineWidth = 0.04;
      for (var i = 1; i < N; i++) {
        bctx.beginPath(); bctx.moveTo(i, 0); bctx.lineTo(i, N); bctx.stroke();
        bctx.beginPath(); bctx.moveTo(0, i); bctx.lineTo(N, i); bctx.stroke();
      }
    }
    pctx.clearRect(0, 0, N, N);
    pctx.drawImage(board, 0, 0);
    save();
  }

  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(pixels)); } catch (e) {}
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORE);
      if (!raw) return false;
      var arr = JSON.parse(raw);
      if (!Array.isArray(arr) || arr.length !== N * N) return false;
      pixels = arr;
      return true;
    } catch (e) { return false; }
  }

  function example() {
    pixels = new Array(N * N).fill('#ffffff');
    var art = [
      '................................',
      '................................',
      '..........####..................',
      '.........######.................',
      '........###..###................',
      '........###..###................',
      '.........######.................',
      '..........####..................',
      '................................',
      '................................',
      '....########........####........',
      '....########.......######.......',
      '....########......########......',
      '....########......########......',
      '....########.......######.......',
      '....########........####........',
      '................................',
      '................................',
      '..........########..............',
      '..........########..............',
      '..........########..............',
      '..........########..............',
      '................................',
      '................................',
      '....####....####....####....####',
      '....####....####....####....####',
      '....####....####....####....####',
      '....####....####....####....####',
      '................................',
      '................................',
      '................................',
      '................................'
    ];
    var cols = { '.': '#ffffff', '#': '#000000' };
    for (var y = 0; y < N; y++) {
      var row = art[y] || '';
      for (var x = 0; x < N; x++) {
        var ch = row.charAt(x) || '.';
        pixels[idx(x, y)] = cols[ch] || '#ffffff';
      }
    }
  }

  function buildPalette() {
    PALETTE.forEach(function (c) {
      var b = document.createElement('button');
      b.className = 'swatch' + (c === colour ? ' active' : '');
      b.style.background = c;
      b.title = c;
      b.addEventListener('click', function () {
        colour = c;
        Array.prototype.forEach.call(paletteEl.children, function (el) { el.classList.remove('active'); });
        b.classList.add('active');
      });
      paletteEl.appendChild(b);
    });
  }

  function floodFill(x0, y0, to) {
    var from = pixels[idx(x0, y0)];
    if (from === to) return;
    var stack = [[x0, y0]];
    while (stack.length) {
      var p = stack.pop();
      var x = p[0], y = p[1];
      if (x < 0 || y < 0 || x >= N || y >= N) continue;
      if (pixels[idx(x, y)] !== from) continue;
      pixels[idx(x, y)] = to;
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
  }

  function cellFromEvent(e) {
    var r = board.getBoundingClientRect();
    var cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    var cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
    var x = Math.floor(cx / r.width * N);
    var y = Math.floor(cy / r.height * N);
    if (x < 0 || y < 0 || x >= N || y >= N) return null;
    return [x, y];
  }

  function applyAt(x, y, first) {
    if (tool === 'pencil') pixels[idx(x, y)] = colour;
    else if (tool === 'eraser') pixels[idx(x, y)] = '#ffffff';
    else if (tool === 'fill') { if (first) floodFill(x, y, colour); }
    else if (tool === 'picker') {
      colour = pixels[idx(x, y)];
      Array.prototype.forEach.call(paletteEl.children, function (el) {
        el.classList.toggle('active', el.title === colour);
      });
    }
  }

  function pointerDown(e) {
    var c = cellFromEvent(e);
    if (!c) return;
    e.preventDefault();
    pushUndo();
    drawing = true;
    lastCell = c;
    applyAt(c[0], c[1], true);
    render();
  }

  function pointerMove(e) {
    if (!drawing) return;
    var c = cellFromEvent(e);
    if (!c) return;
    e.preventDefault();
    if (lastCell && c[0] === lastCell[0] && c[1] === lastCell[1]) return;
    lastCell = c;
    applyAt(c[0], c[1], false);
    render();
  }

  function pointerUp() { drawing = false; lastCell = null; }

  board.addEventListener('mousedown', pointerDown);
  board.addEventListener('mousemove', pointerMove);
  window.addEventListener('mouseup', pointerUp);
  board.addEventListener('touchstart', pointerDown, { passive: false });
  board.addEventListener('touchmove', pointerMove, { passive: false });
  window.addEventListener('touchend', pointerUp);

  document.querySelectorAll('.tool').forEach(function (b) {
    b.addEventListener('click', function () {
      tool = b.id;
      document.querySelectorAll('.tool').forEach(function (o) { o.classList.remove('active'); });
      b.classList.add('active');
    });
  });

  document.getElementById('undo').addEventListener('click', function () {
    if (!undoStack.length) return;
    redoStack.push(snapshot());
    pixels = undoStack.pop();
    render();
  });

  document.getElementById('redo').addEventListener('click', function () {
    if (!redoStack.length) return;
    undoStack.push(snapshot());
    pixels = redoStack.pop();
    render();
  });

  gridBtn.addEventListener('click', function () {
    showGrid = !showGrid;
    gridBtn.textContent = 'Grid: ' + (showGrid ? 'on' : 'off');
    render();
  });

  document.getElementById('clear').addEventListener('click', function () {
    pushUndo();
    pixels = new Array(N * N).fill('#ffffff');
    render();
  });

  buildPalette();
  if (!load()) example();
  render();
})();
