/**
 * Holographic Shell Component
 * JARVIS-inspired main UI container with particle effects and glass-morphism
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface ParticleEffect {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface HolographicShellProps {
  children: React.ReactNode;
  active?: boolean;
  systemStatus?: 'online' | 'standby' | 'thinking' | 'executing';
}

export const HolographicShell: React.FC<HolographicShellProps> = ({
  children,
  active = true,
  systemStatus = 'standby',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ParticleEffect[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);

  // Particle system for holographic effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create particles
    const createParticles = (x: number, y: number, count: number = 5) => {
      const colors = ['#00d9ff', '#00ff88', '#ff006e', '#00d4ff'];
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          id: Math.random().toString(),
          x,
          y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    // Mouse tracking for particle generation
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (Math.random() > 0.7 && isDrawing) {
        createParticles(e.clientX, e.clientY, 2);
      }
    };

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(5, 10, 20, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const particle = particlesRef.current[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.01;
        particle.vy += 0.1; // Gravity

        if (particle.life <= 0) {
          particlesRef.current.splice(i, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = particle.life * 0.6;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Draw grid overlay
      drawGrid(ctx, canvas.width, canvas.height);

      // Draw connection lines between particles
      drawParticleConnections(ctx);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.strokeStyle = 'rgba(0, 217, 255, 0.05)';
      ctx.lineWidth = 1;

      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    const drawParticleConnections = (ctx: CanvasRenderingContext2D) => {
      const maxDistance = 200;
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i];
          const p2 = particlesRef.current[j];
          const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);

          if (distance < maxDistance) {
            ctx.save();
            ctx.strokeStyle = `rgba(0, 217, 255, ${0.2 * (1 - distance / maxDistance) * p1.life})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', () => setIsDrawing(true));
    window.addEventListener('mouseup', () => setIsDrawing(false));

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', () => setIsDrawing(true));
      window.removeEventListener('mouseup', () => setIsDrawing(false));
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDrawing]);

  // Generate scanlines effect
  const scanlineStyle = {
    backgroundImage: `repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 217, 255, 0.02) 2px,
      rgba(0, 217, 255, 0.02) 4px
    )`,
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          ...scanlineStyle,
          zIndex: 5,
          mixBlendMode: 'multiply',
        }}
      />

      {/* Ambient glow effect */}
      <motion.div
        animate={{
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
        className="absolute -top-1/2 -right-1/2 w-full h-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(0, 217, 255, 0.1) 0%, transparent 70%)`,
          zIndex: 1,
        }}
      />

      {/* Status Indicator */}
      <motion.div
        className="absolute top-4 right-4 z-20"
        animate={{
          boxShadow: active
            ? [
                '0 0 10px rgba(0, 217, 255, 0.5)',
                '0 0 20px rgba(0, 217, 255, 0.8)',
                '0 0 10px rgba(0, 217, 255, 0.5)',
              ]
            : '0 0 5px rgba(100, 116, 139, 0.3)',
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex items-center gap-2 px-3 py-2 backdrop-blur-md bg-slate-900/40 border border-cyan-500/30 rounded-full">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.6, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-2 h-2 rounded-full ${
              active ? 'bg-cyan-400' : 'bg-slate-500'
            }`}
          />
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
            {systemStatus}
          </span>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-full h-full z-10 flex flex-col"
      >
        {children}
      </motion.div>

      {/* Top accent bar */}
      <motion.div
        animate={{
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
      />

      {/* Bottom accent bar */}
      <motion.div
        animate={{
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"
      />
    </div>
  );
};

export default HolographicShell;
