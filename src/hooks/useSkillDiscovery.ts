import { useState, useEffect } from "react";
import { AISkill } from "../components/skillsData";

export function useSkillDiscovery() {
  const [suggestedSkill, setSuggestedSkill] = useState<AISkill | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [failedPatternCount, setFailedPatternCount] = useState(0);

  useEffect(() => {
    const handleApiPost = (e: Event) => {
      const customEvent = e as CustomEvent<{ path: string; body: any }>;
      if (!customEvent.detail) return;
      const { path, body } = customEvent.detail;

      // Listen to neoraPost('/api/memory') pipeline
      if (path === "/api/memory" && body) {
        const key = String(body.key || "").toLowerCase();
        const value = String(body.value || "").toLowerCase();
        
        // Detect failed command or execution patterns
        const isFailurePattern = 
          key.includes("fail") || 
          key.includes("error") || 
          key.includes("crash") ||
          value.includes("fail") || 
          value.includes("error") || 
          value.includes("crash") ||
          value.includes("compilation failed") ||
          value.includes("exit code") ||
          value.includes("exception");

        if (isFailurePattern) {
          setFailedPatternCount(prev => {
            const nextCount = prev + 1;
            // Trigger notification on a repeated failed pattern (2 or more failures)
            if (nextCount >= 2) {
              recommendSkill(key + " " + value);
              return 0; // reset
            }
            return nextCount;
          });
        }
      }
    };

    window.addEventListener("neora-api-post", handleApiPost);
    return () => window.removeEventListener("neora-api-post", handleApiPost);
  }, []);

  const recommendSkill = (context: string) => {
    // Look up skills from local storage or defaults
    let skills: AISkill[] = [];
    const saved = localStorage.getItem("neora_ai_skills");
    if (saved) {
      try {
        skills = JSON.parse(saved);
      } catch (e) {}
    }

    // Default target skills for failures
    const targetSkillId = context.includes("git") 
      ? "sk_git_rollbacks" 
      : context.includes("latency") || context.includes("slow")
        ? "sk_latency_profiler"
        : "sk_auto_heal_diag"; // default Self-Healing Diagnostic

    // Find if the skill is already installed & active
    const existingSkill = skills.find(s => s.id === targetSkillId);
    if (existingSkill && existingSkill.enabled && existingSkill.installed) {
      // Already active, let's suggest the general self-healing or ESLint fixer
      const fallbackSkill = skills.find(s => s.id === "sk_eslint_rules");
      if (fallbackSkill && (!fallbackSkill.installed || !fallbackSkill.enabled)) {
        setSuggestedSkill(fallbackSkill);
        setShowNotification(true);
        return;
      }
    }

    // Create custom suggested skill if not found
    const suggested: AISkill = existingSkill || {
      id: "sk_auto_heal_diag",
      name: "Self-Healing Diagnostic Agent",
      category: "Testing & DevOps",
      description: "Autonomous micro-daemon designed to detect syntax exceptions, query compiler states, and apply dynamic code self-healing.",
      systemPrompt: "Analyze stack traces, clean redundant variables, and patch build exceptions.",
      enabled: false,
      installed: false,
      complexity: "Expert",
      latencyMs: 30
    };

    setSuggestedSkill(suggested);
    setShowNotification(true);
  };

  const dismissNotification = () => {
    setShowNotification(false);
  };

  const installSuggestedSkill = () => {
    if (!suggestedSkill) return;

    // Load active list
    let skills: AISkill[] = [];
    const saved = localStorage.getItem("neora_ai_skills");
    if (saved) {
      try {
        skills = JSON.parse(saved);
      } catch (e) {}
    }

    // Update or add the suggested skill
    const updatedSkill = { ...suggestedSkill, installed: true, enabled: true };
    const index = skills.findIndex(s => s.id === suggestedSkill.id);
    if (index >= 0) {
      skills[index] = updatedSkill;
    } else {
      skills.unshift(updatedSkill);
    }

    localStorage.setItem("neora_ai_skills", JSON.stringify(skills));
    
    // Dispatch updated event for other UI sections
    window.dispatchEvent(new CustomEvent("neora-skills-updated", { detail: { skill: updatedSkill } }));
    
    setShowNotification(false);
  };

  return {
    suggestedSkill,
    showNotification,
    dismissNotification,
    installSuggestedSkill
  };
}
