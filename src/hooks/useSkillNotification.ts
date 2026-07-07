import { useState, useEffect } from "react";

export interface SkillNotification {
  id: string;
  skillName: string;
  description: string;
  useCase: string;
  timestamp: string;
}

export function useSkillNotification() {
  const [notification, setNotification] = useState<SkillNotification | null>(null);

  useEffect(() => {
    const handleSystemEvent = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      if (!customEvent.detail) return;
      
      const { category, level, message, details } = customEvent.detail;

      // Listen for 'learning' or 'discovery' categories
      if (category === "learning" || category === "discovery") {
        let skillName = "New Capability";
        let description = message || "Neora has registered a new cognitive pathway.";
        let useCase = "Accessed dynamically via AI Chat prompts & Command Center.";

        // If there's structured detail, parse it
        if (details) {
          try {
            const parsed = typeof details === "string" ? JSON.parse(details) : details;
            if (parsed.skillName || parsed.name) {
              skillName = parsed.skillName || parsed.name;
            }
            if (parsed.description) {
              description = parsed.description;
            }
            if (parsed.useCase || parsed.action) {
              useCase = parsed.useCase || `Method: ${parsed.action}`;
            }
          } catch {}
        }

        if (message && message.includes("Discovered missing capability")) {
          skillName = "Terminal Auto-Healer";
          useCase = "Directly self-heals typescript errors & missing imports.";
        }

        setTimeout(() => {
          setNotification({
            id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            skillName,
            description,
            useCase,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }, 0);
      }
    };

    window.addEventListener("neora-system-event", handleSystemEvent);
    return () => window.removeEventListener("neora-system-event", handleSystemEvent);
  }, []);

  const clearNotification = () => {
    setNotification(null);
  };

  return {
    notification,
    clearNotification
  };
}
