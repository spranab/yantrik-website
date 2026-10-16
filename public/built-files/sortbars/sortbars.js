// Sortbars — bar model, random array, canvas render, step engine, four algorithms
(function () {
  'use strict';

  var canvas = document.getElementById('stage');
  var ctx = canvas.getContext('2d');

  var els = {
    algo: document.getElementById('algo'),
    count: document.getElementById('count'),
    countVal: document.getElementById('countVal'),
    speed: document.getElementById('speed'),
    speedVal: document.getElementById('speedVal'),
    newBtn: document.getElementById('newBtn'),
    runBtn: document.getElementById('runBtn'),
    stepBtn: document.getElementById('stepBtn'),
    resetBtn: document.getElementById('resetBtn'),
    comparisons: document.getElementById('comparisons'),
    swaps: document.getElementById('swaps'),
    status: document.getElementById('status')
  };

  var state = {
    bars: [],          // array of values
    n: 40,
    comparing: [],     // indices lit up this step
    sortedFrom: 0,     // for a little end-of-run glow
    comparisons: 0,
    swaps: 0,
    running: false,
    timer: null,
    steps: null,       // generator of steps
    done: false
  };

  function randomArray(n) {
    var a = [], i;
    for (i = 0; i < n; i++) a.push(Math.floor(Math.random() * (n - 1)) + 1);
    return a;
  }

  function resize() {
    var r = canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(r.width * dpr));
    canvas.height = Math.max(1, Math.floor(r.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function draw() {
    var r = canvas.getBoundingClientRect();
    var W = r.width, H = r.height;
    ctx.clearRect(0, 0, W, H);

    var bars = state.bars;
    if (!bars.length) return;

    var pad = 8;
    var gap = bars.length > 60 ? 1 : 2;
    var slot = (W - pad * 2) / bars.length;
    var bw = Math.max(1, slot - gap);
    var maxV = Math.max.apply(null, bars) || 1;
    var base = H - pad;

    for (var i = 0; i < bars.length; i++) {
      var h = (bars[i] / maxV) * (H - pad * 2);
      var x = pad + i * slot;
      var lit = state.comparing.indexOf(i) !== -1;
      ctx.fillStyle = lit ? '#ffd166' : (state.done ? '#7ee0a0' : '#4da3ff');
      ctx.fillRect(x, base - h, bw, h);
    }
  }

  function setCounters() {
    els.comparisons.textContent = state.comparisons;
    els.swaps.textContent = state.swaps;
  }

  function setStatus(s) {
    els.status.textContent = s;
  }

  function stopTimer() {
    if (state.timer) { clearTimeout(state.timer); state.timer = null; }
    state.running = false;
    els.runBtn.textContent = 'Start';
  }

  function delay() {
    var s = Number(els.speed.value);       // 1 slow .. 100 fast
    return Math.max(0, Math.round(220 - s * 2.1));
  }

  function newArray() {
    stopTimer();
    state.n = Number(els.count.value);
    state.bars = randomArray(state.n);
    state.comparing = [];
    state.comparisons = 0;
    state.swaps = 0;
    state.done = false;
    state.steps = null;
    setCounters();
    setStatus('idle');
    draw();
  }

  // ---- algorithms as step generators -------------------------------------
  // each yields {compare:[i,j]} or {swap:[i,j]} or {set:[i,value]}

  function* bubbleSort(a) {
    var n = a.length, i, j, t;
    for (i = 0; i < n - 1; i++) {
      for (j = 0; j < n - 1 - i; j++) {
        yield { compare: [j, j + 1] };
        if (a[j] > a[j + 1]) {
          t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
          yield { swap: [j, j + 1] };
        }
      }
    }
  }

  function* insertionSort(a) {
    var n = a.length, i, j, key;
    for (i = 1; i < n; i++) {
      key = a[i];
      j = i - 1;
      while (j >= 0) {
        yield { compare: [j, j + 1] };
        if (a[j] > key) {
          a[j + 1] = a[j];
          yield { swap: [j, j + 1] };
          j--;
        } else break;
      }
      a[j + 1] = key;
      yield { set: [j + 1, key] };
    }
  }

  function* mergeSort(a) {
    var n = a.length;
    var buf = a.slice();
    yield* msort(a, buf, 0, n - 1);
  }

  function* msort(a, buf, lo, hi) {
    if (lo >= hi) return;
    var mid = (lo + hi) >> 1;
    yield* msort(a, buf, lo, mid);
    yield* msort(a, buf, mid + 1, hi);
    var i = lo, j = mid + 1, k;
    for (k = lo; k <= hi; k++) buf[k] = a[k];
    for (k = lo; k <= hi; k++) {
      if (i > mid) { a[k] = buf[j++]; }
      else if (j > hi) { a[k] = buf[i++]; }
      else {
        yield { compare: [i, j] };
        if (buf[j] < buf[i]) a[k] = buf[j++];
        else a[k] = buf[i++];
      }
      yield { set: [k, a[k]] };
    }
  }

  function* quickSort(a) {
    yield* qsort(a, 0, a.length - 1);
  }

  function* qsort(a, lo, hi) {
    if (lo >= hi) return;
    var p = yield* partition(a, lo, hi);
    yield* qsort(a, lo, p - 1);
    yield* qsort(a, p + 1, hi);
  }

  function* partition(a, lo, hi) {
    var pivot = a[hi], i = lo - 1, j, t;
    for (j = lo; j < hi; j++) {
      yield { compare: [j, hi] };
      if (a[j] < pivot) {
        i++;
        if (i !== j) {
          t = a[i]; a[i] = a[j]; a[j] = t;
          yield { swap: [i, j] };
        }
      }
    }
    if (i + 1 !== hi) {
      t = a[i + 1]; a[i + 1] = a[hi]; a[hi] = t;
      yield { swap: [i + 1, hi] };
    }
    return i + 1;
  }

  function makeSteps() {
    var copy = state.bars.slice();
    var name = els.algo.value;
    if (name === 'bubble') return bubbleSort(copy);
    if (name === 'insertion') return insertionSort(copy);
    if (name === 'merge') return mergeSort(copy);
    return quickSort(copy);
  }

  // ---- the step engine ----------------------------------------------------

  function oneStep() {
    if (!state.steps) state.steps = makeSteps();
    var r = state.steps.next();
    if (r.done) {
      state.comparing = [];
      state.done = true;
      stopTimer();
      setStatus('sorted');
      draw();
      return false;
    }
    var s = r.value;
    if (s.compare) {
      state.comparisons++;
      state.comparing = s.compare.slice();
    } else if (s.swap) {
      state.swaps++;
      var i = s.swap[0], j = s.swap[1], t = state.bars[i];
      state.bars[i] = state.bars[j]; state.bars[j] = t;
      state.comparing = s.swap.slice();
    } else if (s.set) {
      state.bars[s.set[0]] = s.set[1];
      state.comparing = [s.set[0]];
    }
    setCounters();
    draw();
    return true;
  }

  function tick() {
    if (!state.running) return;
    var more = oneStep();
    if (!more) return;
    state.timer = setTimeout(tick, delay());
  }

  function toggleRun() {
    if (state.done) { newArray(); }
    if (state.running) {
      stopTimer();
      setStatus('paused');
      return;
    }
    state.running = true;
    els.runBtn.textContent = 'Pause';
    setStatus('running');
    tick();
  }

  function stepOnce() {
    stopTimer();
    if (state.done) { setStatus('sorted'); return; }
    oneStep();
    if (!state.done) setStatus('paused');
  }

  function reset() {
    stopTimer();
    state.bars = randomArray(state.n);
    state.comparing = [];
    state.comparisons = 0;
    state.swaps = 0;
    state.done = false;
    state.steps = null;
    setCounters();
    setStatus('idle');
    draw();
  }

  // ---- wiring -------------------------------------------------------------

  els.newBtn.addEventListener('click', newArray);
  els.runBtn.addEventListener('click', toggleRun);
  els.stepBtn.addEventListener('click', stepOnce);
  els.resetBtn.addEventListener('click', reset);

  els.count.addEventListener('input', function () {
    els.countVal.textContent = els.count.value;
    newArray();
  });

  els.speed.addEventListener('input', function () {
    els.speedVal.textContent = els.speed.value;
  });

  els.algo.addEventListener('change', reset);

  window.addEventListener('resize', resize);

  els.countVal.textContent = els.count.value;
  els.speedVal.textContent = els.speed.value;
  resize();
  newArray();
})();
