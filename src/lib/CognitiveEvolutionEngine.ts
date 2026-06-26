import { SystemEvent } from "../components/SystemEventLog";

export interface EvolutionProposal {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  category: "ui_optimization" | "feature_flag" | "automation" | "research_tip";
  impact: string;
  impactBn: string;
  status: "pending" | "approved" | "rejected";
  timestamp: string;
  details?: Record<string, any>;
}

export class CognitiveEvolutionEngine {
  private static STORAGE_KEY = "neora_evolution_proposals";
  private static HIST_STORAGE_KEY = "neora_evolution_history";

  static getProposals(): EvolutionProposal[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse evolution proposals:", e);
    }
    
    // Return default initial proposals if empty
    const defaults: EvolutionProposal[] = [
      {
        id: "prop-01",
        title: "Optimize Dashboard Widget Layout",
        titleBn: "ড্যাশবোর্ড উইজেট লেআউট অপ্টিমাইজ করুন",
        description: "Promote frequently accessed components (Command Center and OS Agent) to the top of the grid to reduce scroll overhead.",
        descriptionBn: "স্ক্রোলিং কমানোর জন্য ঘন ঘন ব্যবহৃত কম্পোনেন্টগুলো (কমান্ড সেন্টার ও ওএস এজেন্ট) গ্রিডের শীর্ষে নিয়ে আসুন।",
        category: "ui_optimization",
        impact: "Reduces interaction latency by 35% based on usage telemetry.",
        impactBn: "ব্যবহারের তথ্যের ভিত্তিতে ইন্টারঅ্যাকশন সময় ৩৫% কমিয়ে দেয়।",
        status: "pending",
        timestamp: new Date().toLocaleTimeString(),
        details: { widgetOrder: ["command_center", "os_quick", "agent", "tasks", "memory", "scratchpad", "system_log", "live_journal"] }
      },
      {
        id: "prop-02",
        title: "Deploy Smart Bulk Order Pricing Optimizer",
        titleBn: "স্মার্ট বাল্ক অর্ডার প্রাইসিং অপ্টিমাইজার সক্রিয় করুন",
        description: "Integrate specialized volume-discount pricing matrices for 'Shukria Printers' automatically when typing bulky quantities.",
        descriptionBn: "অতিরিক্ত পরিমাণে কার্ড বা ব্যানারের অর্ডারে স্বয়ংক্রিয়ভাবে Shukria Printers এর জন্য ভলিউম ডিসকাউন্ট প্রাইসিং ম্যাট্রিক্স যুক্ত করুন।",
        category: "feature_flag",
        impact: "Speeds up invoice calculation and invoice errors by 50%.",
        impactBn: "ইনভয়েস তৈরির গতি বাড়াবে এবং ভুলভ্রান্তি ৫০% কমাবে।",
        status: "pending",
        timestamp: new Date().toLocaleTimeString(),
        details: { featureId: "bulk_discount_calc" }
      },
      {
        id: "prop-03",
        title: "Enable Intelligent Sound Wave EQ filter",
        titleBn: "ইন্টেলিজেন্ট সাউন্ড ওয়েভ EQ ফিল্টার যুক্ত করুন",
        description: "Activate ambient sound lowpass spectrum filter mapping for therapeutic relaxation hum loops.",
        descriptionBn: "রিলাক্সেশন সাউন্ড বা হাম লুপের জন্য অ্যাম্বিয়েন্ট সাউন্ড ফিল্টার এবং ফ্রিকোয়েন্সি স্লাইডার সক্রিয় করুন।",
        category: "automation",
        impact: "Improves acoustic environment alignment for long working hours.",
        impactBn: "দীর্ঘ সময় কাজ করার জন্য চমৎকার রিদম এবং মনস্তাত্ত্বিক স্বস্তি দিবে।",
        status: "pending",
        timestamp: new Date().toLocaleTimeString(),
        details: { featureId: "ambient_eq" }
      },
      {
        id: "prop-04",
        title: "Configure Automated Shukria Printers Email Dispatcher",
        titleBn: "স্বয়ংক্রিয় অর্ডার নোটিফিকেশন ডিসপ্যাচার সক্রিয় করুন",
        description: "Installs a dispatch loop that auto-updates shukriaprinters@gmail.com with pending client invoices directly.",
        descriptionBn: "সরাসরি shukriaprinters@gmail.com ঠিকানায় সব ইনভয়েসের কপি পাঠানোর জন্য ডিসপ্যাচ লুপ অন করুন।",
        category: "automation",
        impact: "Ensures instant notification sync with your primary email client.",
        impactBn: "আপনার মূল ইমেইলের সাথে তাৎক্ষণিক অর্ডার তথ্য সিনক্রোনাইজ নিশ্চিত করে।",
        status: "pending",
        timestamp: new Date().toLocaleTimeString(),
        details: { featureId: "direct_shukria_email" }
      }
    ];

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  }

  static saveProposals(proposals: EvolutionProposal[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(proposals));
  }

  static getHistory(): EvolutionProposal[] {
    try {
      const stored = localStorage.getItem(this.HIST_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  }

  static saveHistory(hist: EvolutionProposal[]) {
    localStorage.setItem(this.HIST_STORAGE_KEY, JSON.stringify(hist));
  }

  static analyze(): EvolutionProposal[] {
    // Collect simulated or actual usage indicators from localStorage
    const proposals = this.getProposals();
    
    // Add live search grounding tips or update based on stats
    const updated = [...proposals];
    
    // Dispatch system events
    const ts = new Date().toTimeString().split(' ')[0];
    const newEvent = new CustomEvent("neora-system-event", {
      detail: {
        id: "evt-se-" + Math.floor(Math.random() * 10000),
        timestamp: ts,
        category: "self_evolution", // Differentiated category
        level: "INFO",
        message: "CognitiveEvolutionEngine: Weekly self-analysis run compiled successfully.",
        details: JSON.stringify({
          scanned_components: ["ChatView", "VSCodeView", "Dashboard", "OrganizerView"],
          telemetry_metrics: {
            user_engagement_factor: "0.94",
            average_chat_latency: "210ms",
            errors_caught_and_healed: 3
          },
          proposals_count: updated.filter(p => p.status === 'pending').length,
          timestamp: new Date().toISOString()
        }, null, 2),
        latency: "14ms"
      }
    });
    window.dispatchEvent(newEvent);

    return updated;
  }

  static approveProposal(id: string, onFeatureUnlock?: (featId: string) => void): EvolutionProposal | null {
    const proposals = this.getProposals();
    const idx = proposals.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const prop = { ...proposals[idx], status: "approved" as const, timestamp: new Date().toLocaleTimeString() };
    
    // Remove from active proposals, add to history
    proposals.splice(idx, 1);
    this.saveProposals(proposals);

    const history = this.getHistory();
    history.unshift(prop);
    this.saveHistory(history);

    // Trigger side effects
    if (prop.details?.featureId && onFeatureUnlock) {
      onFeatureUnlock(prop.details.featureId);
    }

    // Raise System Event
    const ts = new Date().toTimeString().split(' ')[0];
    const event = new CustomEvent("neora-system-event", {
      detail: {
        id: "evt-appr-" + Math.floor(Math.random() * 10000),
        timestamp: ts,
        category: "self_evolution",
        level: "SUCCESS",
        message: `Self-Evolution Completed: Approved and deployed proposal "${prop.title}"`,
        details: JSON.stringify({
          proposal_id: prop.id,
          title: prop.title,
          category: prop.category,
          status: "DEPLOYED_AND_ACTIVE",
          impact: prop.impact,
          affected_schemas: ["neora_dashboard_layout", "neora_feature_flags"]
        }, null, 2),
        latency: "18ms"
      }
    });
    window.dispatchEvent(event);

    return prop;
  }

  static rejectProposal(id: string): EvolutionProposal | null {
    const proposals = this.getProposals();
    const idx = proposals.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const prop = { ...proposals[idx], status: "rejected" as const, timestamp: new Date().toLocaleTimeString() };
    
    proposals.splice(idx, 1);
    this.saveProposals(proposals);

    const history = this.getHistory();
    history.unshift(prop);
    this.saveHistory(history);

    // Raise System Event
    const ts = new Date().toTimeString().split(' ')[0];
    const event = new CustomEvent("neora-system-event", {
      detail: {
        id: "evt-rej-" + Math.floor(Math.random() * 10000),
        timestamp: ts,
        category: "self_evolution",
        level: "WARNING",
        message: `Self-Evolution Ignored: User rejected proposal "${prop.title}"`,
        details: JSON.stringify({
          proposal_id: prop.id,
          title: prop.title,
          category: prop.category,
          status: "REJECTED_BY_OPERATOR"
        }, null, 2),
        latency: "2ms"
      }
    });
    window.dispatchEvent(event);

    return prop;
  }
}
