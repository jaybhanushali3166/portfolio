(function () {
  const container = document.querySelector(".thinking-orb-wrap");
  const orb = document.getElementById("thinking-orb");
  if (!container || !orb) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let targetScale = 1;
  let currentScale = 1;
  let isHovered = false;
  let rafId = null;

  // Max push distance in px - kept subtle
  const MAX_DEFLECTION = 24;
  const INFLUENCE_RADIUS = 110;

  function onMouseMove(e) {
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist < INFLUENCE_RADIUS) {
      isHovered = true;
      // Gentle repulsion: push away from cursor
      const force = (1 - dist / INFLUENCE_RADIUS);
      const angle = Math.atan2(dy, dx);
      targetX = -Math.cos(angle) * force * MAX_DEFLECTION;
      targetY = -Math.sin(angle) * force * MAX_DEFLECTION;
      targetScale = 1 + force * 0.1;
    } else {
      if (isHovered) {
        isHovered = false;
        targetX = 0;
        targetY = 0;
        targetScale = 1;
      }
    }
  }

  function onMouseLeave() {
    isHovered = false;
    targetX = 0;
    targetY = 0;
    targetScale = 1;
  }

  function update() {
    // Smooth lerp damping (0.08 = soft, organic inertia)
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    currentScale += (targetScale - currentScale) * 0.08;

    orb.style.setProperty("--orb-x", `${currentX.toFixed(2)}px`);
    orb.style.setProperty("--orb-y", `${currentY.toFixed(2)}px`);
    orb.style.setProperty("--orb-scale", `${currentScale.toFixed(3)}`);

    rafId = requestAnimationFrame(update);
  }

  window.addEventListener("pointermove", onMouseMove, { passive: true });
  container.addEventListener("pointerleave", onMouseLeave, { passive: true });

  rafId = requestAnimationFrame(update);
})();
