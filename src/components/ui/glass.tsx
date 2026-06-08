import React from "react";
import { cn } from "../../lib/utils";

export function GlassCard({
  className,
  children,
  glow = false,
  gold = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { glow?: boolean; gold?: boolean }) {
  return (
    <div
      className={cn(
        "jarvis-card text-slate-100",
        glow && "shadow-[0_0_20px_rgba(0,212,255,0.12),inset_0_0_30px_rgba(0,212,255,0.03)]",
        gold && "border-[rgba(245,166,35,0.2)] shadow-[0_0_20px_rgba(245,166,35,0.1)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlassButton({
  className,
  children,
  variant = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "primary" | "danger" | "gold" }) {
  const variantClasses = {
    default: "border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.04)] text-[rgba(0,212,255,0.8)] hover:bg-[rgba(0,212,255,0.1)] hover:border-[rgba(0,212,255,0.3)] hover:text-[#00d4ff]",
    primary: "jarvis-btn-primary",
    danger: "border-[rgba(255,71,87,0.25)] bg-[rgba(255,71,87,0.06)] text-[rgba(255,71,87,0.8)] hover:bg-[rgba(255,71,87,0.12)] hover:text-[#ff4757]",
    gold: "border-[rgba(245,166,35,0.25)] bg-[rgba(245,166,35,0.06)] text-[rgba(245,166,35,0.9)] hover:bg-[rgba(245,166,35,0.12)] hover:text-[#f5a623]",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm transition-all duration-200 active:scale-[0.98]",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function JarvisPanel({
  className,
  children,
  label,
  corner = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { label?: string; corner?: boolean }) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-[rgba(0,212,255,0.15)] bg-[rgba(0,12,28,0.75)] backdrop-blur-xl",
        "shadow-[0_0_0_1px_rgba(0,212,255,0.05),0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(0,212,255,0.08)]",
        corner && "corner-tl",
        className
      )}
      {...props}
    >
      {label && (
        <div className="absolute -top-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-[rgba(0,212,255,0.4)] to-transparent" />
      )}
      {label && (
        <div className="absolute -top-3 left-4">
          <span className="jarvis-label bg-[#000814] px-2">{label}</span>
        </div>
      )}
      {children}
    </div>
  );
}

export function SystemMetricCard({
  label,
  value,
  sub,
  color = "cyan",
  icon,
  className,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: "cyan" | "gold" | "green" | "red";
  icon?: React.ReactNode;
  className?: string;
}) {
  const colorMap = {
    cyan: { text: "#00d4ff", glow: "rgba(0,212,255,0.15)", border: "rgba(0,212,255,0.18)" },
    gold: { text: "#f5a623", glow: "rgba(245,166,35,0.12)", border: "rgba(245,166,35,0.2)" },
    green: { text: "#00ff88", glow: "rgba(0,255,136,0.12)", border: "rgba(0,255,136,0.18)" },
    red: { text: "#ff4757", glow: "rgba(255,71,87,0.12)", border: "rgba(255,71,87,0.18)" },
  };
  const c = colorMap[color];

  return (
    <div
      className={cn("relative rounded-xl p-4 overflow-hidden", className)}
      style={{
        background: `linear-gradient(135deg, rgba(0,15,35,0.85) 0%, rgba(0,8,20,0.75) 100%)`,
        border: `1px solid ${c.border}`,
        boxShadow: `0 0 0 1px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.4), inset 0 0 30px ${c.glow}`,
        backdropFilter: "blur(20px)",
      }}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(ellipse at 0% 0%, ${c.glow}, transparent 60%)`,
        }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="jarvis-label">{label}</span>
          {icon && <span style={{ color: c.text, opacity: 0.7 }}>{icon}</span>}
        </div>
        <div
          className="text-2xl font-bold font-jarvis"
          style={{ color: c.text, textShadow: `0 0 15px ${c.glow}, 0 0 30px ${c.glow}` }}
        >
          {value}
        </div>
        {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
      </div>
    </div>
  );
}
