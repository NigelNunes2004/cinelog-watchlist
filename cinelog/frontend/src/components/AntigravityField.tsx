import { useEffect, useRef } from "react";

type Tone = "amber" | "teal" | "rose" | "steel";

type Particle = {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  r: number;
  tone: Tone;
  alpha: number;
};

const TONES: Record<Tone, { core: string; mid: string; line: string }> = {
  amber: {
    core: "255, 214, 120",
    mid: "232, 180, 70",
    line: "232, 180, 70",
  },
  teal: {
    core: "140, 220, 220",
    mid: "70, 180, 185",
    line: "70, 180, 185",
  },
  rose: {
    core: "255, 170, 150",
    mid: "220, 120, 100",
    line: "220, 120, 100",
  },
  steel: {
    core: "180, 195, 220",
    mid: "120, 140, 175",
    line: "120, 140, 175",
  },
};

function pickTone(): Tone {
  const r = Math.random();
  if (r < 0.32) return "amber";
  if (r < 0.62) return "teal";
  if (r < 0.82) return "rose";
  return "steel";
}

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

      const count = Math.min(95, Math.floor((w * h) / 16000));
      particles = Array.from({ length: count }, () => {
        const x = Math.random() * w;
        const y = Math.random() * h;
        return {
          x,
          y,
          ox: x,
          oy: y,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          r: 0.7 + Math.random() * 1.8,
          tone: pickTone(),
          alpha: 0.2 + Math.random() * 0.45,
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
        g.addColorStop(0, "rgba(232, 180, 70, 0.07)");
        g.addColorStop(0.4, "rgba(70, 180, 185, 0.05)");
        g.addColorStop(0.7, "rgba(220, 120, 100, 0.03)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.save();
      ctx.strokeStyle = "rgba(255,240,220,0.028)";
      ctx.lineWidth = 1;
      const gap = 72;
      for (let x = 0; x < w; x += gap) {
        ctx.beginPath();
        for (let y = 0; y <= h; y += 10) {
          let dx = 0;
          let dy = 0;
          if (active) {
            const dist = Math.hypot(x - mx, y - my);
            const force = Math.max(0, 1 - dist / 260);
            dx = (x - mx) * force * 0.1;
            dy = (y - my) * force * 0.1;
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
            const force = Math.max(0, 1 - dist / 260);
            dx = (x - mx) * force * 0.1;
            dy = (y - my) * force * 0.1;
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
          const influence = Math.max(0, 1 - dist / 210);
          const mag = influence > 0.55 ? -0.48 : 0.16;
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
          if (d > 110) continue;
          const midDist = active
            ? Math.hypot((a.x + b.x) / 2 - mx, (a.y + b.y) / 2 - my)
            : 9999;
          const boost = midDist < 180 ? 0.28 : 0.06;
          const alpha = (1 - d / 110) * boost;
          const c = TONES[a.tone].line;
          ctx.strokeStyle = `rgba(${c}, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const p of particles) {
        const near = active ? Math.max(0, 1 - Math.hypot(p.x - mx, p.y - my) / 190) : 0;
        const glow = p.r + near * 2.4;
        const t = TONES[p.tone];
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glow * 3.5);
        grad.addColorStop(0, `rgba(${t.core}, ${0.45 + near * 0.35})`);
        grad.addColorStop(0.45, `rgba(${t.mid}, ${0.12 + near * 0.15})`);
        grad.addColorStop(1, `rgba(${t.mid}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glow * 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(${t.core}, ${p.alpha + near * 0.35})`;
        ctx.arc(p.x, p.y, glow * 0.4, 0, Math.PI * 2);
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,oklch(0.32_0.07_82_/_0.22),transparent_42%),radial-gradient(ellipse_at_85%_15%,oklch(0.35_0.07_195_/_0.18),transparent_40%),radial-gradient(ellipse_at_70%_90%,oklch(0.3_0.07_25_/_0.14),transparent_45%),linear-gradient(180deg,oklch(0.12_0.02_55),oklch(0.1_0.015_40))]" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/80" />
    </div>
  );
}
