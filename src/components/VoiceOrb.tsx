import { useState, useEffect } from "react";
import { Mic, MicOff, Zap } from "lucide-react";

interface VoiceOrbProps {
  isListening?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function VoiceOrb({ isListening = false, onClick, size = "md", className = "" }: VoiceOrbProps) {
  const [pulse, setPulse] = useState(0);
  const [bars, setBars] = useState([4, 6, 4, 8, 5, 7, 4]);

  useEffect(() => {
    if (!isListening) return;
    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.floor(Math.random() * 20) + 4));
    }, 120);
    return () => clearInterval(interval);
  }, [isListening]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => (p + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const sizes = {
    sm: { orb: 48, icon: 16, ring1: 64, ring2: 80 },
    md: { orb: 72, icon: 24, ring1: 96, ring2: 120 },
    lg: { orb: 96, icon: 32, ring1: 128, ring2: 160 },
  };
  const s = sizes[size];

  const orbGlowIntensity = isListening ? 0.9 : 0.5 + 0.2 * Math.sin((pulse / 100) * Math.PI * 2);
  const ringScale = isListening ? 1 + 0.08 * Math.sin((pulse / 100) * Math.PI * 2) : 1;

  return (
    <div
      className={`relative flex items-center justify-center cursor-pointer select-none ${className}`}
      style={{ width: s.ring2, height: s.ring2 }}
      onClick={onClick}
      role="button"
      aria-label={isListening ? "Stop listening" : "Start voice input"}
    >
      {/* Outer ripple rings (only when listening) */}
      {isListening && (
        <>
          <div
            className="absolute rounded-full border border-cyan-400/20"
            style={{
              width: s.ring2 + 20, height: s.ring2 + 20,
              animation: "voice-ripple 1.8s ease-out infinite",
            }}
          />
          <div
            className="absolute rounded-full border border-cyan-400/15"
            style={{
              width: s.ring2 + 40, height: s.ring2 + 40,
              animation: "voice-ripple 1.8s ease-out 0.6s infinite",
            }}
          />
          <div
            className="absolute rounded-full border border-cyan-400/10"
            style={{
              width: s.ring2 + 60, height: s.ring2 + 60,
              animation: "voice-ripple 1.8s ease-out 1.2s infinite",
            }}
          />
        </>
      )}

      {/* Rotating outer ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: s.ring2,
          height: s.ring2,
          border: "1px dashed rgba(0,212,255,0.2)",
          animation: "arc-reactor-ring 12s linear infinite",
          transform: `scale(${ringScale})`,
        }}
      />

      {/* Rotating inner ring (reverse) */}
      <div
        className="absolute rounded-full"
        style={{
          width: s.ring1,
          height: s.ring1,
          border: "1px solid rgba(0,212,255,0.15)",
          borderTopColor: "rgba(0,212,255,0.5)",
          borderRightColor: "rgba(0,212,255,0.5)",
          animation: "arc-reactor-ring-reverse 6s linear infinite",
        }}
      />

      {/* Core orb */}
      <div
        className="relative rounded-full flex items-center justify-center z-10"
        style={{
          width: s.orb,
          height: s.orb,
          background: isListening
            ? `radial-gradient(circle at 35% 35%, rgba(0,212,255,0.35), rgba(0,100,200,0.2) 50%, rgba(0,20,60,0.9))`
            : `radial-gradient(circle at 35% 35%, rgba(0,212,255,${orbGlowIntensity * 0.25}), rgba(0,60,120,0.15) 50%, rgba(0,10,30,0.95))`,
          border: `1px solid rgba(0,212,255,${isListening ? 0.7 : 0.35})`,
          boxShadow: isListening
            ? `0 0 0 2px rgba(0,212,255,0.15), 0 0 30px rgba(0,212,255,0.5), 0 0 60px rgba(0,212,255,0.2), inset 0 0 20px rgba(0,212,255,0.15)`
            : `0 0 0 1px rgba(0,212,255,0.08), 0 0 ${12 + orbGlowIntensity * 10}px rgba(0,212,255,${orbGlowIntensity * 0.3}), inset 0 0 15px rgba(0,212,255,0.05)`,
          transition: "box-shadow 0.3s ease, border-color 0.3s ease",
        }}
      >
        {/* Inner arc reactor hex pattern */}
        <div
          className="absolute rounded-full"
          style={{
            width: s.orb * 0.55,
            height: s.orb * 0.55,
            border: "1px solid rgba(0,212,255,0.2)",
            animation: "arc-reactor-ring 4s linear infinite",
          }}
        />

        {/* Icon */}
        {isListening ? (
          <div className="relative z-10 flex flex-col items-center gap-0.5">
            <div className="flex items-end gap-0.5">
              {bars.map((h, i) => (
                <div
                  key={i}
                  className="rounded-full bg-cyan-400"
                  style={{
                    width: 2,
                    height: h,
                    boxShadow: "0 0 4px rgba(0,212,255,0.8)",
                    transition: "height 0.1s ease",
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <Mic
            className="text-cyan-400 z-10 relative"
            style={{
              width: s.icon,
              height: s.icon,
              filter: `drop-shadow(0 0 6px rgba(0,212,255,${orbGlowIntensity * 0.8}))`,
            }}
          />
        )}
      </div>

      {/* Status dot */}
      {isListening && (
        <div
          className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-cyan-400"
          style={{ boxShadow: "0 0 6px rgba(0,212,255,0.9)", animation: "glow-pulse 1s ease-in-out infinite" }}
        />
      )}
    </div>
  );
}

interface MiniVoiceIndicatorProps {
  isListening: boolean;
  className?: string;
}

export function MiniVoiceIndicator({ isListening, className = "" }: MiniVoiceIndicatorProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="eq-bar"
          style={isListening ? { height: undefined } : { height: 3 }}
          data-pulsing={isListening ? "true" : undefined}
        />
      ))}
    </div>
  );
}
