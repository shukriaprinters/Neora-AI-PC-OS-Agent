import { useEffect, useState } from "react";

export function NebulaBackground() {
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setAngle((prev) => (prev + 0.05) % 360);
    }, 50);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.18), transparent 24%),
            radial-gradient(circle at 80% 15%, rgba(6, 182, 212, 0.16), transparent 22%),
            radial-gradient(circle at 50% 85%, rgba(59, 130, 246, 0.12), transparent 26%),
            linear-gradient(${angle}deg, rgba(3,5,5,1) 0%, rgba(2,6,23,1) 45%, rgba(15,23,42,1) 100%)
          `,
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.08]" />
      <div className="absolute -left-20 top-10 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-[100px]" />
      <div className="absolute right-[-5rem] top-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="absolute left-1/3 bottom-[-6rem] h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />
    </div>
  );
}
