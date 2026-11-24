/* ============================================================
   PRSNL — cinematic starfield backdrop
   Twinkling star layers, faint constellation lines, occasional
   lime comet trails, pointer-responsive parallax depth.
   Respects prefers-reduced-motion (static frame, no loop).
   ============================================================ */
(function () {
  "use strict";

  var canvas = document.getElementById("p-stars");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");

  var reduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var W = 0, H = 0, DPR = 1;
  var stars = [];
  var comets = [];
  var running = true;
  var t0 = performance.now();

  /* Pointer parallax target (lerped each frame) */
  var px = 0, py = 0, tx = 0, ty = 0;

  var LIME = "198,241,53";

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildStars();
  }

  function buildStars() {
    stars = [];
    var count = Math.min(230, Math.max(90, Math.round((W * H) / 8500)));
    for (var i = 0; i < count; i++) {
      var depth = Math.random(); /* 0 = far, 1 = near */
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.4 + depth * 1.5,
        depth: depth,
        baseA: 0.25 + depth * 0.6,
        tw: 0.6 + Math.random() * 2.2,   /* twinkle speed */
        ph: Math.random() * Math.PI * 2, /* twinkle phase */
        /* a few stars carry a faint lime tint */
        lime: Math.random() < 0.12
      });
    }
  }

  function spawnComet() {
    /* Occasional lime comet streaking across the upper sky */
    var fromLeft = Math.random() < 0.5;
    comets.push({
      x: fromLeft ? -60 : W + 60,
      y: Math.random() * H * 0.45,
      vx: (fromLeft ? 1 : -1) * (260 + Math.random() * 320),
      vy: 60 + Math.random() * 90,
      life: 1.0,
      decay: 0.35 + Math.random() * 0.3
    });
  }

  function drawStars(t) {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var tw = 0.55 + 0.45 * Math.sin(s.ph + t * 0.001 * s.tw * 2);
      var a = s.baseA * tw;
      var ox = px * (8 + s.depth * 26);
      var oy = py * (6 + s.depth * 18);
      var x = s.x + ox, y = s.y + oy;
      if (x < -4 || x > W + 4 || y < -4 || y > H + 4) continue;
      if (s.lime) {
        ctx.fillStyle = "rgba(" + LIME + "," + (a * 0.9).toFixed(3) + ")";
        ctx.shadowColor = "rgba(" + LIME + ",0.7)";
        ctx.shadowBlur = 6;
      } else {
        ctx.fillStyle = "rgba(235,242,255," + a.toFixed(3) + ")";
        ctx.shadowBlur = 0;
      }
      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  function drawConstellations() {
    /* Faint lines between near-enough bright stars */
    ctx.lineWidth = 1;
    var near = [];
    for (var i = 0; i < stars.length; i++) {
      if (stars[i].depth > 0.45) near.push(stars[i]);
    }
    for (var a = 0; a < near.length; a++) {
      for (var b = a + 1; b < near.length; b++) {
        var dx = (near[a].x + px * 30) - (near[b].x + px * 30);
        var dy = (near[a].y + py * 22) - (near[b].y + py * 22);
        var d2 = dx * dx + dy * dy;
        if (d2 < 130 * 130) {
          var alpha = 0.09 * (1 - Math.sqrt(d2) / 130);
          ctx.strokeStyle = "rgba(220,232,255," + alpha.toFixed(3) + ")";
          ctx.beginPath();
          ctx.moveTo(near[a].x + px * 30, near[a].y + py * 22);
          ctx.lineTo(near[b].x + px * 30, near[b].y + py * 22);
          ctx.stroke();
        }
      }
    }
  }

  function drawComets(dt) {
    /* maybe spawn */
    if (Math.random() < dt * 0.12 && comets.length < 2) spawnComet();
    for (var i = comets.length - 1; i >= 0; i--) {
      var c = comets[i];
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.life -= c.decay * dt;
      if (c.life <= 0 || c.x < -200 || c.x > W + 200 || c.y > H + 120) {
        comets.splice(i, 1);
        continue;
      }
      /* trail */
      var tail = 90;
      var grad = ctx.createLinearGradient(c.x, c.y, c.x - Math.sign(c.vx) * tail, c.y - tail * 0.3);
      grad.addColorStop(0, "rgba(" + LIME + "," + (0.85 * c.life).toFixed(3) + ")");
      grad.addColorStop(1, "rgba(" + LIME + ",0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(c.x - Math.sign(c.vx) * tail, c.y - tail * 0.3);
      ctx.stroke();
      /* head */
      ctx.fillStyle = "rgba(255,255,255," + (0.9 * c.life).toFixed(3) + ")";
      ctx.shadowColor = "rgba(" + LIME + ",0.9)";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function frame(now) {
    if (!running) return;
    var dt = Math.min(0.05, (now - t0) / 1000);
    t0 = now;
    /* ease pointer toward target */
    px += (tx - px) * 0.045;
    py += (ty - py) * 0.045;

    ctx.clearRect(0, 0, W, H);
    drawConstellations();
    drawStars(now);
    drawComets(dt);

    requestAnimationFrame(frame);
  }

  function staticFrame() {
    /* Reduced motion: one calm frame, no loop */
    ctx.clearRect(0, 0, W, H);
    drawConstellations();
    drawStars(1200);
  }

  window.addEventListener("pointermove", function (e) {
    tx = (e.clientX / W - 0.5) * 2;
    ty = (e.clientY / H - 0.5) * 2;
  }, { passive: true });

  window.addEventListener("resize", function () {
    resize();
    if (reduced) staticFrame();
  });

  document.addEventListener("visibilitychange", function () {
    if (reduced) return;
    if (document.hidden) {
      running = false;
    } else if (!running) {
      running = true;
      t0 = performance.now();
      requestAnimationFrame(frame);
    }
  });

  resize();
  if (reduced) {
    staticFrame();
  } else {
    requestAnimationFrame(frame);
  }
})();
