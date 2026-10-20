/**
 * 3D Thinking Orb — Dotted Sphere Lattice
 * Inspired by Jakub Antalik's Thinking Orbs
 * Custom-tuned for Jay Bhanushali's dark warm palette.
 */
(function () {
  const container = document.querySelector(".thinking-orb-wrap");
  const canvas = document.getElementById("thinking-orb-canvas");
  if (!container || !canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let size = 200;
  let dpr = Math.min(2, window.devicePixelRatio || 1);

  function resize() {
    const isMobile = window.innerWidth <= 640;
    size = isMobile ? 140 : 200;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  // Physics & Interaction variables
  let currentOffsetX = 0;
  let currentOffsetY = 0;
  let targetOffsetX = 0;
  let targetOffsetY = 0;

  let currentMouseYaw = 0;
  let currentMousePitch = 0;
  let targetMouseYaw = 0;
  let targetMousePitch = 0;

  let isNear = false;
  let hoverEnergy = 0;
  let targetHoverEnergy = 0;

  const INFLUENCE_RADIUS = 160;
  const MAX_DEFLECTION = 24;

  function onPointerMove(e) {
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist < INFLUENCE_RADIUS) {
      isNear = true;
      targetHoverEnergy = 1;
      const force = 1 - dist / INFLUENCE_RADIUS;
      const angle = Math.atan2(dy, dx);

      // Subtle repulsion away from pointer
      targetOffsetX = -Math.cos(angle) * force * MAX_DEFLECTION;
      targetOffsetY = -Math.sin(angle) * force * MAX_DEFLECTION;

      // 3D tilt towards pointer
      targetMouseYaw = (dx / INFLUENCE_RADIUS) * 0.45;
      targetMousePitch = -(dy / INFLUENCE_RADIUS) * 0.35;
    } else {
      if (isNear) {
        isNear = false;
        targetHoverEnergy = 0;
        targetOffsetX = 0;
        targetOffsetY = 0;
        targetMouseYaw = 0;
        targetMousePitch = 0;
      }
    }
  }

  function onPointerLeave() {
    isNear = false;
    targetHoverEnergy = 0;
    targetOffsetX = 0;
    targetOffsetY = 0;
    targetMouseYaw = 0;
    targetMousePitch = 0;
  }

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  container.addEventListener("pointerleave", onPointerLeave, { passive: true });

  // 3D Sphere geometry settings
  const latRings = 17;
  const lonDensity = 42;

  let rafId = null;
  let isRunning = false;
  let lastTime = performance.now();
  let timeAccum = 0;

  function renderFrame(now) {
    const delta = Math.min(0.1, (now - lastTime) / 1000);
    lastTime = now;

    // Gentle time speed, subtly reacts to hover
    const speed = 0.55 + hoverEnergy * 0.2;
    timeAccum += delta * speed;
    const t = timeAccum;

    // Lerp smooth damping
    currentOffsetX += (targetOffsetX - currentOffsetX) * 0.08;
    currentOffsetY += (targetOffsetY - currentOffsetY) * 0.08;
    currentMouseYaw += (targetMouseYaw - currentMouseYaw) * 0.07;
    currentMousePitch += (targetMousePitch - currentMousePitch) * 0.07;
    hoverEnergy += (targetHoverEnergy - hoverEnergy) * 0.06;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2 + currentOffsetX;
    const cy = size / 2 + currentOffsetY;
    const R = (size / 2) * 0.76;

    // Ambient background dark amber aura on canvas
    const bgGrad = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.15);
    bgGrad.addColorStop(0, "rgba(90, 58, 22, 0.20)");
    bgGrad.addColorStop(0.5, "rgba(55, 35, 14, 0.08)");
    bgGrad.addColorStop(1, "rgba(20, 16, 12, 0)");
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2);
    ctx.fill();

    // 3D Angles
    const spin = 0.45;
    const yaw = t * spin + currentMouseYaw;
    const tilt = 0.38 + 0.08 * Math.sin(t * 0.4) + currentMousePitch;

    const sy = Math.sin(yaw);
    const cyw = Math.cos(yaw);
    const st = Math.sin(tilt);
    const ct = Math.cos(tilt);

    const dots = [];

    // Waveform undulation through rings
    for (let ri = 0; ri <= latRings; ri++) {
      const lat = -Math.PI / 2 + (ri / latRings) * Math.PI;
      const cosLat = Math.cos(lat);
      const sinLat = Math.sin(lat);

      // Organic dual wave
      const w = 0.58 * Math.sin(t * 1.85 - ri * 0.52) + 0.42 * Math.sin(t * 1.12 + ri * 0.78);
      const rr = R * (0.88 + 0.11 * w);

      const lonCount = Math.max(1, Math.round(Math.abs(cosLat) * lonDensity));
      for (let lj = 0; lj < lonCount; lj++) {
        const lon = (lj / lonCount) * 2 * Math.PI;

        const x = cosLat * Math.cos(lon) * rr;
        const y = sinLat * rr;
        const z = cosLat * Math.sin(lon) * rr;

        // 3D Rotation (yaw around Y, tilt around X)
        const x1 = x * cyw + z * sy;
        const z1 = -x * sy + z * cyw;
        const y1 = y * ct - z1 * st;
        const z2 = y * st + z1 * ct;

        // Projected 2D screen coordinates
        const px = cx + x1;
        const py = cy - y1;

        // Depth in [0, 1]
        const depth = Math.max(0, Math.min(1, (z2 / R + 1) / 2));

        // Radius scaling: back dots are small (~0.8px), front dots grow up to ~2.6px
        const r = (0.75 + 1.85 * Math.pow(depth, 1.25)) * (1 + 0.15 * Math.max(0, w));

        // Dark theme color matching:
        // Back: muted smoke/dark amber
        // Front: rich warm amber gold
        const red = Math.round(135 + depth * 95);
        const green = Math.round(90 + depth * 85);
        const blue = Math.round(40 + depth * 45);
        const alpha = 0.16 + Math.pow(depth, 1.4) * 0.74;

        dots.push({ px, py, z: z2, r, red, green, blue, alpha });
      }
    }

    // Z-Sort: render far dots first, near dots last
    dots.sort((a, b) => a.z - b.z);

    // Draw all dots
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      ctx.fillStyle = `rgba(${d.red},${d.green},${d.blue},${d.alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(d.px, d.py, d.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (isRunning && !prefersReduced) {
      rafId = requestAnimationFrame(renderFrame);
    }
  }

  // IntersectionObserver to sleep when off-screen
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && document.visibilityState !== "hidden") {
      if (!isRunning) {
        isRunning = true;
        lastTime = performance.now();
        rafId = requestAnimationFrame(renderFrame);
      }
    } else {
      isRunning = false;
      if (rafId) cancelAnimationFrame(rafId);
    }
  });

  observer.observe(canvas);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      isRunning = false;
      if (rafId) cancelAnimationFrame(rafId);
    } else if (container.getBoundingClientRect().bottom > 0) {
      isRunning = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(renderFrame);
    }
  });

  if (prefersReduced) {
    // Single static representative frame for reduced motion users
    renderFrame(1.5);
  } else {
    isRunning = true;
    lastTime = performance.now();
    rafId = requestAnimationFrame(renderFrame);
  }
})();
