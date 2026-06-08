import { useEffect, useRef } from "react";

export function NebulaBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number; da: number }[] = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: Math.random() * 1.5 + 0.5,
        a: Math.random(),
        da: (Math.random() - 0.5) * 0.004
      });
    }

    const draw = () => {
      t += 0.005;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep space gradient background
      const bg = ctx.createRadialGradient(
        canvas.width * 0.2, canvas.height * 0.1, 0,
        canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.8
      );
      bg.addColorStop(0, "rgba(0, 30, 60, 0.6)");
      bg.addColorStop(0.4, "rgba(0, 10, 25, 0.8)");
      bg.addColorStop(1, "rgba(0, 4, 12, 0.95)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle hex grid lines
      ctx.strokeStyle = "rgba(0, 212, 255, 0.025)";
      ctx.lineWidth = 0.5;
      const hexSize = 60;
      const hexH = hexSize * Math.sqrt(3);
      for (let row = -1; row < canvas.height / hexH + 2; row++) {
        for (let col = -1; col < canvas.width / (hexSize * 1.5) + 2; col++) {
          const cx = col * hexSize * 1.5;
          const cy = row * hexH + (col % 2 === 0 ? 0 : hexH / 2);
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const x = cx + hexSize * 0.85 * Math.cos(angle);
            const y = cy + hexSize * 0.85 * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }

      // Animated glow orbs
      const orbs = [
        { x: canvas.width * 0.15, y: canvas.height * 0.2, r: 200, color: "rgba(0,212,255,0.06)", phase: 0 },
        { x: canvas.width * 0.85, y: canvas.height * 0.15, r: 250, color: "rgba(26,159,255,0.05)", phase: Math.PI },
        { x: canvas.width * 0.5, y: canvas.height * 0.85, r: 180, color: "rgba(0,150,255,0.04)", phase: Math.PI / 2 },
      ];

      for (const orb of orbs) {
        const pulse = 1 + 0.15 * Math.sin(t + orb.phase);
        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r * pulse);
        grad.addColorStop(0, orb.color.replace("0.0", "0.1"));
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r * pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      // Floating particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.a += p.da;
        if (p.a < 0) p.a = 0, p.da = Math.abs(p.da);
        if (p.a > 1) p.a = 1, p.da = -Math.abs(p.da);
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${p.a * 0.5})`;
        ctx.fill();
      }

      // Horizon scan line
      const scanY = ((t * 30) % (canvas.height + 40)) - 20;
      const scanGrad = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 2);
      scanGrad.addColorStop(0, "rgba(0,212,255,0)");
      scanGrad.addColorStop(0.5, "rgba(0,212,255,0.04)");
      scanGrad.addColorStop(1, "rgba(0,212,255,0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 2, canvas.width, 4);

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ opacity: 0.9 }}
    />
  );
}
