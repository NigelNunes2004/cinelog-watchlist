import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  r: number;
  hue: number;
  alpha: number;
};

/**
 * Cursor-reactive particle field inspired by Antigravity's interactive void —
 * soft orbs, connecting lines, and a magnetic spotlight that follows the pointer.
 */
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

      const count = Math.min(110, Math.floor((w * h) / 14000));
      particles = Array.from({ length: count }, () => {
        const x = Math.random() * w;
        const y = Math.random() * h;
        return {
          x,
          y,
          ox: x,
          oy: y,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          r: 0.8 + Math.random() * 2.2,
          hue: Math.random() > 0.55 ? 85 : 265,
          alpha: 0.25 + Math.random() * 0.55,
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

      smooth.current.x += (mx - smooth.current.x) * 0.08;
      smooth.current.y += (my - smooth.current.y) * 0.08;
      const sx = smooth.current.x;
      const sy = smooth.current.y;

      // Soft spotlight following cursor
      if (active || sx > 0) {
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.min(w, h) * 0.42);
        g.addColorStop(0, "rgba(232, 196, 90, 0.09)");
        g.addColorStop(0.35, "rgba(120, 100, 255, 0.05)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // Subtle grid that warps near cursor
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.035)";
      ctx.lineWidth = 1;
      const gap = 64;
      for (let x = 0; x < w; x += gap) {
        ctx.beginPath();
        for (let y = 0; y <= h; y += 8) {
          let dx = 0;
          let dy = 0;
          if (active) {
            const dist = Math.hypot(x - mx, y - my);
            const force = Math.max(0, 1 - dist / 280);
            dx = (x - mx) * force * 0.12;
            dy = (y - my) * force * 0.12;
          }
          if (y === 0) ctx.moveTo(x + dx, y + dy);
          else ctx.lineTo(x + dx, y + dy);
        }
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gap) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 8) {
          let dx = 0;
          let dy = 0;
          if (active) {
            const dist = Math.hypot(x - mx, y - my);
            const force = Math.max(0, 1 - dist / 280);
            dx = (x - mx) * force * 0.12;
            dy = (y - my) * force * 0.12;
          }
          if (x === 0) ctx.moveTo(x + dx, y + dy);
          else ctx.lineTo(x + dx, y + dy);
        }
        ctx.stroke();
      }
      ctx.restore();

      // Particles + magnetic pull
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Soft drift back to origin
        p.vx += (p.ox - p.x) * 0.0008;
        p.vy += (p.oy - p.y) * 0.0008;

        if (active) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.hypot(dx, dy) || 1;
          const influence = Math.max(0, 1 - dist / 220);
          // Repulse near, attract farther — Antigravity feel
          const mag = influence > 0.55 ? -0.55 : 0.18;
          p.vx += (dx / dist) * mag * influence;
          p.vy += (dy / dist) * mag * influence;
        }

        p.vx *= 0.96;
        p.vy *= 0.96;

        if (p.x < -40) p.x = w + 40;
        if (p.x > w + 40) p.x = -40;
        if (p.y < -40) p.y = h + 40;
        if (p.y > h + 40) p.y = -40;
      }

      // Connection lines near cursor / between close particles
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > 120) continue;
          const midDist = active ? Math.hypot((a.x + b.x) / 2 - mx, (a.y + b.y) / 2 - my) : 9999;
          const boost = midDist < 200 ? 0.35 : 0.08;
          const alpha = (1 - d / 120) * boost;
          ctx.strokeStyle =
            a.hue === 85
              ? `rgba(232, 196, 90, ${alpha})`
              : `rgba(140, 130, 255, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const p of particles) {
        const near = active ? Math.max(0, 1 - Math.hypot(p.x - mx, p.y - my) / 200) : 0;
        const glow = p.r + near * 3;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glow * 4);
        if (p.hue === 85) {
          grad.addColorStop(0, `rgba(255, 220, 120, ${0.55 + near * 0.4})`);
          grad.addColorStop(0.4, `rgba(232, 196, 90, ${0.15 + near * 0.2})`);
          grad.addColorStop(1, "rgba(232, 196, 90, 0)");
        } else {
          grad.addColorStop(0, `rgba(180, 170, 255, ${0.5 + near * 0.4})`);
          grad.addColorStop(0.4, `rgba(120, 110, 255, ${0.12 + near * 0.2})`);
          grad.addColorStop(1, "rgba(120, 110, 255, 0)");
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glow * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle =
          p.hue === 85
            ? `rgba(255, 230, 150, ${p.alpha + near * 0.4})`
            : `rgba(200, 195, 255, ${p.alpha + near * 0.4})`;
        ctx.arc(p.x, p.y, glow * 0.45, 0, Math.PI * 2);
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,oklch(0.28_0.06_265_/_0.45),transparent_50%),radial-gradient(ellipse_at_80%_90%,oklch(0.22_0.05_85_/_0.25),transparent_45%),linear-gradient(180deg,oklch(0.11_0.02_265),oklch(0.08_0.015_260))]" />
      <div className="absolute inset-0 opacity-[0.35] mix-blend-screen [background-image:radial-gradient(oklch(1_0_0_/_0.04)_1px,transparent_1px)] [background-size:28px_28px]" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
    </div>
  );
}
