import React from "react";
import { cn } from "../../lib/utils";

export function GlassCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "panel-surface rounded-3xl text-slate-100",
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
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/80 transition hover:bg-white/[0.08] hover:text-white active:scale-[0.99]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
