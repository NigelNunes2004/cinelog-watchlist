import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  r: number;
  warm: boolean;
  alpha: number;
};

export function AntigravityField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999, active: false });
  const smooth = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let particles: Particle[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(80, Math.floor((w * h) / 18000));
      particles = Array.from({ length: count }, () => {
        const x = Math.random() * w;
        const y = Math.random() * h;
        return {
          x,
          y,
          ox: x,
          oy: y,
          vx: (Math.random() - 0.5) * 0.1,
          vy: (Math.random() - 0.5) * 0.1,
          r: 0.6 + Math.random() * 1.6,
          warm: Math.random() > 0.55,
          alpha: 0.15 + Math.random() * 0.35,
        };
      });
    };

    const onMove = (e: PointerEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      mouse.current.active = true;
    };
    const onLeave = () => {
      mouse.current.active = false;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      const mx = mouse.current.x;
      const my = mouse.current.y;
      const active = mouse.current.active;

      smooth.current.x += (mx - smooth.current.x) * 0.07;
      smooth.current.y += (my - smooth.current.y) * 0.07;
      const sx = smooth.current.x;
      const sy = smooth.current.y;

      if (active || sx > 0) {
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.min(w, h) * 0.36);
        g.addColorStop(0, "rgba(210, 175, 90, 0.055)");
        g.addColorStop(0.5, "rgba(180, 160, 120, 0.025)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.save();
      ctx.strokeStyle = "rgba(255,245,230,0.022)";
      ctx.lineWidth = 1;
      const gap = 76;
      for (let x = 0; x < w; x += gap) {
        ctx.beginPath();
        for (let y = 0; y <= h; y += 10) {
          let dx = 0;
          let dy = 0;
          if (active) {
            const dist = Math.hypot(x - mx, y - my);
            const force = Math.max(0, 1 - dist / 250);
            dx = (x - mx) * force * 0.08;
            dy = (y - my) * force * 0.08;
          }
          if (y === 0) ctx.moveTo(x + dx, y + dy);
          else ctx.lineTo(x + dx, y + dy);
        }
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gap) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 10) {
          let dx = 0;
          let dy = 0;
          if (active) {
            const dist = Math.hypot(x - mx, y - my);
            const force = Math.max(0, 1 - dist / 250);
            dx = (x - mx) * force * 0.08;
            dy = (y - my) * force * 0.08;
          }
          if (x === 0) ctx.moveTo(x + dx, y + dy);
          else ctx.lineTo(x + dx, y + dy);
        }
        ctx.stroke();
      }
      ctx.restore();

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx += (p.ox - p.x) * 0.0007;
        p.vy += (p.oy - p.y) * 0.0007;

        if (active) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.hypot(dx, dy) || 1;
          const influence = Math.max(0, 1 - dist / 200);
          const mag = influence > 0.55 ? -0.42 : 0.14;
          p.vx += (dx / dist) * mag * influence;
          p.vy += (dy / dist) * mag * influence;
        }

        p.vx *= 0.965;
        p.vy *= 0.965;

        if (p.x < -40) p.x = w + 40;
        if (p.x > w + 40) p.x = -40;
        if (p.y < -40) p.y = h + 40;
        if (p.y > h + 40) p.y = -40;
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > 105) continue;
          const midDist = active
            ? Math.hypot((a.x + b.x) / 2 - mx, (a.y + b.y) / 2 - my)
            : 9999;
          const boost = midDist < 170 ? 0.2 : 0.045;
          const alpha = (1 - d / 105) * boost;
          ctx.strokeStyle = a.warm
            ? `rgba(210, 175, 90, ${alpha})`
            : `rgba(200, 195, 185, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const p of particles) {
        const near = active ? Math.max(0, 1 - Math.hypot(p.x - mx, p.y - my) / 180) : 0;
        const glow = p.r + near * 2;
        const core = p.warm ? "230, 200, 130" : "210, 205, 195";
        const mid = p.warm ? "190, 160, 80" : "160, 155, 145";
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glow * 3.2);
        grad.addColorStop(0, `rgba(${core}, ${0.35 + near * 0.25})`);
        grad.addColorStop(0.45, `rgba(${mid}, ${0.08 + near * 0.1})`);
        grad.addColorStop(1, `rgba(${mid}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glow * 3.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(${core}, ${p.alpha + near * 0.25})`;
        ctx.arc(p.x, p.y, glow * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,oklch(0.28_0.04_82_/_0.14),transparent_45%),radial-gradient(ellipse_at_80%_100%,oklch(0.22_0.02_55_/_0.2),transparent_50%),linear-gradient(180deg,oklch(0.12_0.012_55),oklch(0.1_0.01_50))]" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/85" />
    </div>
  );
}
