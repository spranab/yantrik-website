// Yantrik Live: play the relay's HLS while it is really live, and say so plainly when it is not.
// Moved from yantrik-os deploy/live/relay/www/live.js; the logic is the same, the states named as
// the site's plan names them: Checking · Live · Offline · Cannot play.
//
// Never a frozen frame: when the picture stops moving, the video is hidden and the card says so.
// It says "since" only for an outage this page saw begin; one already under way when it opened
// has no start time the page could know.
(function () {
  "use strict";
  var SRC = "/live/hls/index.m3u8";
  var RETRY_MS = 15000;   // how often an offline page looks for the stream again
  var STALL_MS = 20000;   // this long without a new frame is offline, not "buffering"
  var SLOW_MS = 3000;     // after this, Checking says why it can take a moment

  var video = document.getElementById("video");
  var card = document.getElementById("card");
  var status = document.getElementById("status");
  var statusText = document.getElementById("status-text");
  var title = document.getElementById("card-title");
  var detail = document.getElementById("card-detail");
  var full = document.getElementById("full");
  var screen = document.getElementById("screen");
  var dots = document.querySelectorAll(".dot");

  var hls = null, retry = null, slow = null, lastMove = 0, lastTime = -1, offlineSince = null, sawLive = false;

  function clock(d) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function show(state, heading, text) {
    status.setAttribute("data-state", state);
    for (var i = 0; i < dots.length; i++) dots[i].setAttribute("data-state", state);
    statusText.textContent = state === "live" ? "Live" : heading;
    var live = state === "live";
    video.hidden = !live;
    card.hidden = live;
    if (full) full.hidden = !live || !screen.requestFullscreen;
    title.textContent = heading;
    detail.textContent = text;
  }

  function checking() {
    show("checking", "Checking", "Looking for the stream.");
    clearTimeout(slow);
    slow = setTimeout(function () {
      if (status.getAttribute("data-state") === "checking") {
        detail.textContent = "Still looking. At three frames a second the first picture can take a few seconds to arrive.";
      }
    }, SLOW_MS);
  }

  function offline() {
    if (sawLive && !offlineSince) offlineSince = new Date();
    show("offline", offlineSince ? "Offline since " + clock(offlineSince) : "Offline",
      "The machine is not streaming right now: an update, maintenance, or a fault. This page looks again every 15 seconds.");
    stop();
    clearTimeout(retry);
    retry = setTimeout(start, RETRY_MS);
  }

  function cannotPlay() {
    show("cannot", "Cannot play here",
      "This browser cannot play the stream: it needs Media Source Extensions, or Safari's own HLS. Nothing is wrong with the machine.");
  }

  function stop() {
    if (hls) { hls.destroy(); hls = null; }
    video.removeAttribute("src");
    video.load();
  }

  function start() {
    stop();
    lastTime = -1;
    lastMove = Date.now();
    if (status.getAttribute("data-state") !== "offline") checking();
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ liveDurationInfinity: true, manifestLoadingMaxRetry: 1, levelLoadingMaxRetry: 2 });
      hls.on(window.Hls.Events.ERROR, function (_e, data) { if (data.fatal) offline(); });
      hls.loadSource(SRC);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = SRC;  // Safari plays HLS itself
    } else {
      cannotPlay();
      return;
    }
    var p = video.play();
    if (p && p.catch) p.catch(function () { /* autoplay waits for the first frame */ });
  }

  video.addEventListener("error", function () {
    if (status.getAttribute("data-state") !== "cannot") offline();
  });

  if (full) {
    full.addEventListener("click", function () {
      if (screen.requestFullscreen) screen.requestFullscreen().catch(function () {});
    });
  }

  // Live means frames are arriving: the playhead moves.
  setInterval(function () {
    if (status.getAttribute("data-state") === "cannot") return;
    if (!hls && !video.src) return;
    if (video.currentTime !== lastTime && !video.paused) {
      lastTime = video.currentTime;
      lastMove = Date.now();
      offlineSince = null;
      sawLive = true;
      if (status.getAttribute("data-state") !== "live") show("live", "Live", "");
    } else if (Date.now() - lastMove > STALL_MS) {
      offline();
    }
  }, 1000);

  start();
})();
