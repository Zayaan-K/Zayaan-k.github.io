(() => {
  const canvas = document.getElementById("sierpinski");
  const button = document.getElementById("sierpinski-pause");

  if (!canvas || !button) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const motion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const maximumDepth = 5;
  const stageDuration = 1100;
  const cycleDuration = maximumDepth * 2 * stageDuration;

  let paused = motion.matches;
  let elapsed = paused ? maximumDepth * stageDuration : 0;
  let lastTime = null;
  let frameId = null;
  let visible = true;

  function midpoint(a, b) {
    return [
      (a[0] + b[0]) / 2,
      (a[1] + b[1]) / 2
    ];
  }

  function triangle(a, b, c, depth) {
    if (depth > 0) {
      const ab = midpoint(a, b);
      const bc = midpoint(b, c);
      const ca = midpoint(c, a);

      triangle(a, ab, ca, depth - 1);
      triangle(ab, b, bc, depth - 1);
      triangle(ca, bc, c, depth - 1);
      return;
    }

    ctx.beginPath();
    ctx.moveTo(...a);
    ctx.lineTo(...b);
    ctx.lineTo(...c);
    ctx.closePath();
    ctx.stroke();
  }

  function draw() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const scale = Math.min(window.devicePixelRatio || 1, 2);

    const pixelWidth = Math.round(width * scale);
    const pixelHeight = Math.round(height * scale);

    if (
      canvas.width !== pixelWidth ||
      canvas.height !== pixelHeight
    ) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // Match the cube's grid background.
    ctx.strokeStyle = "#273139";
    ctx.lineWidth = 1;

    for (let x = 16; x < width; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 10);
      ctx.lineTo(x, height - 10);
      ctx.stroke();
    }

    for (let y = 15; y < height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const side = Math.min(
      width - 48,
      (height - 40) / (Math.sqrt(3) / 2)
    );

    if (side <= 0) return;

    const triangleHeight = side * Math.sqrt(3) / 2;
    const top = (height - triangleHeight) / 2;

    const a = [width / 2, top];
    const b = [(width - side) / 2, top + triangleHeight];
    const c = [(width + side) / 2, top + triangleHeight];

    // Count up to the maximum depth, then back down.
    const phase = elapsed % cycleDuration;
    const step = Math.floor(phase / stageDuration);

    const depth = step <= maximumDepth
      ? step
      : maximumDepth * 2 - step;

    ctx.strokeStyle = "#cdf86f";
    ctx.lineWidth = depth > 3 ? 0.8 : 1.3;
    ctx.lineJoin = "round";
    ctx.globalAlpha = 0.9;

    triangle(a, b, c, depth);

    ctx.globalAlpha = 1;
  }

  function updateButton() {
    button.textContent = paused
      ? "Resume animation"
      : "Pause animation";

    button.setAttribute("aria-pressed", String(paused));
  }

  function frame(now) {
    frameId = null;

    if (!paused && lastTime !== null) {
      elapsed += now - lastTime;
    }

    lastTime = now;
    draw();

    if (!paused && visible && !document.hidden) {
      frameId = requestAnimationFrame(frame);
    }
  }

  function restart() {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }

    lastTime = null;
    draw();

    if (!paused && visible && !document.hidden) {
      frameId = requestAnimationFrame(frame);
    }
  }

  button.addEventListener("click", () => {
    paused = !paused;
    updateButton();
    restart();
  });

  motion.addEventListener("change", (event) => {
    paused = event.matches;

    if (paused) {
      elapsed = maximumDepth * stageDuration;
    }

    updateButton();
    restart();
  });

  new ResizeObserver(restart).observe(canvas);

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    restart();
  }).observe(canvas);

  document.addEventListener("visibilitychange", restart);

  updateButton();
  restart();
})();