import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  r: number;
  depth: number; // 0 bright amber → 1 deep amber
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

    const tone = (depth: number) => {
      // Self-gradient palette within amber only
      const r = Math.round(255 - depth * 55);
      const g = Math.round(220 - depth * 70);
      const b = Math.round(130 - depth * 40);
      return `${r}, ${g}, ${b}`;
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(88, Math.floor((w * h) / 16500));
      particles = Array.from({ length: count }, () => {
        const x = Math.random() * w;
        const y = Math.random() * h;
        return {
          x,
          y,
          ox: x,
          oy: y,
          vx: (Math.random() - 0.5) * 0.11,
          vy: (Math.random() - 0.5) * 0.11,
          r: 0.65 + Math.random() * 1.7,
          depth: Math.random(),
          alpha: 0.18 + Math.random() * 0.4,
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
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.min(w, h) * 0.38);
        g.addColorStop(0, "rgba(232, 196, 100, 0.07)");
        g.addColorStop(0.45, "rgba(180, 140, 60, 0.035)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.save();
      ctx.strokeStyle = "rgba(255, 230, 180, 0.025)";
      ctx.lineWidth = 1;
      const gap = 72;
      for (let x = 0; x < w; x += gap) {
        ctx.beginPath();
        for (let y = 0; y <= h; y += 10) {
          let dx = 0;
          let dy = 0;
          if (active) {
            const dist = Math.hypot(x - mx, y - my);
            const force = Math.max(0, 1 - dist / 255);
            dx = (x - mx) * force * 0.09;
            dy = (y - my) * force * 0.09;
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
            const force = Math.max(0, 1 - dist / 255);
            dx = (x - mx) * force * 0.09;
            dy = (y - my) * force * 0.09;
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
          const influence = Math.max(0, 1 - dist / 205);
          const mag = influence > 0.55 ? -0.45 : 0.15;
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
          if (d > 108) continue;
          const midDist = active
            ? Math.hypot((a.x + b.x) / 2 - mx, (a.y + b.y) / 2 - my)
            : 9999;
          const boost = midDist < 175 ? 0.24 : 0.05;
          const alpha = (1 - d / 108) * boost;
          ctx.strokeStyle = `rgba(${tone(a.depth)}, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const p of particles) {
        const near = active ? Math.max(0, 1 - Math.hypot(p.x - mx, p.y - my) / 185) : 0;
        const glow = p.r + near * 2.2;
        const c = tone(p.depth);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glow * 3.4);
        grad.addColorStop(0, `rgba(${c}, ${0.42 + near * 0.3})`);
        grad.addColorStop(0.45, `rgba(${c}, ${0.1 + near * 0.12})`);
        grad.addColorStop(1, `rgba(${c}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glow * 3.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(${c}, ${p.alpha + near * 0.3})`;
        ctx.arc(p.x, p.y, glow * 0.38, 0, Math.PI * 2);
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_0%,oklch(0.35_0.07_82_/_0.18),transparent_48%),radial-gradient(ellipse_at_85%_95%,oklch(0.28_0.05_70_/_0.16),transparent_50%),linear-gradient(180deg,oklch(0.125_0.016_60),oklch(0.1_0.014_55))]" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/35 via-transparent to-background/80" />
    </div>
  );
}
