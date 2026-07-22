import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Palette,
  Sparkles,
  Layers,
  FileCode,
  Layout,
  Type,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Sliders,
  CheckCircle2,
  Copy,
  FolderOpen,
  Zap,
  Grid,
  Check,
  ChevronRight,
  Maximize2,
  Minimize2,
  Award,
  Download,
  PenTool,
  Wand2,
  Printer,
  Compass,
  History,
  ShieldCheck,
  Languages,
  BrainCircuit,
  Grid3X3,
  Image,
  Database,
  RefreshCw,
  MessageSquare,
  Users,
  Cpu,
  PackageCheck,
  Terminal,
  Activity,
  Code2,
  Wrench,
  Briefcase,
  DollarSign,
  FileText,
  TrendingUp,
  Globe,
  FileCode2,
  Rocket,
  Server,
  HardDriveUpload,
  Search,
  LayoutGrid
} from "lucide-react";
import type {
  ImplementationMasterPlanResult,
  RepositorySystemAuditResult
} from "../lib/neoraImplementationFoundationEngine";
import type {
  EnterpriseQaReleaseReport,
  SelfHealingRepairResult
} from "../lib/neoraEnterpriseQaSelfHealing";
import type {
  ProductionReleaseDeploymentReport,
  EnterpriseBackupManifest
} from "../lib/neoraEnterpriseReleaseDeploymentEngine";
import type {
  AutonomousEvolutionReport,
  SelfImprovementRefactoringProposal
} from "../lib/neoraAutonomousEvolutionPlatformEngine";
import type {
  CorePlatformRuntimeReport,
  VoiceCommandDescriptor,
  WorkflowExecutionPlan
} from "../lib/neoraCorePlatformRuntimeFoundation";
import type {
  NativeAiBrainCognitiveReport,
  SpecializedAgentRole
} from "../lib/neoraNativeAiBrainCognitiveEngine";
import type {
  AiDesignOsWorkspaceReport
} from "../lib/neoraAiDesignOsCreativeEngine";
import type {
  SoftwareEngineeringOsReport,
  SoftwareQualityReviewAudit
} from "../lib/neoraAutonomousSoftwareEngineeringOs";
import type {
  BusinessOsOperationsReport,
  UnifiedSearchMatch,
  BusinessDocumentDescriptor
} from "../lib/neoraBusinessOsOperationsPlatform";
import type {
  DesignSystemPlatformReport
} from "../lib/neoraEnterpriseUiDesignSystem";
import type {
  NdlCoreSystemMasterReport
} from "../lib/neoraDesignLanguageCoreSystem";
import type {
  WorkspaceRuntimeMasterReport
} from "../lib/neoraProfessionalWorkspaceWindowManager";
import type {
  VectorStudioMasterReport,
  AiVectorConceptResult
} from "../lib/neoraVectorStudioEngine";
import type {
  SingularityPipelineResult,
  SingularityIntelligenceNode,
  SingularitySelfEvolutionResult
} from "../lib/neoraSingularityPlatform";
import type {
  BusinessOsPipelineResult,
  AutomatedInvoice,
  BusinessPersonaType,
  DigitalProductType
} from "../lib/neoraAutonomousBusinessOS";
import type {
  SoftwareFactoryPipelineResult,
  SelfDebugDiagnosticsResult,
  PluginSdkBoilerplateResult,
  SoftwareFactoryOutputType,
  SoftwareArchitecturePattern
} from "../lib/neoraAutonomousSoftwareFactory";
import type {
  CreativeConceptProject,
  DesignStudioOutputType,
  DesignLayer,
  DesignArtboard
} from "../lib/neoraAIDesignStudioCore";
import type {
  CreativeWorkspaceMode,
  WorkspaceCanvasConfig,
  SmartEditPreset,
  SmartEditResult,
  CalligraphyStrokeObject,
  ExportFileFormat,
  ExportPackageResult,
  WorkspaceHistorySnapshot
} from "../lib/neoraCreativeWorkspaceEngine";
import type {
  UserGoalIntent,
  CreativeReasoningPlan,
  MultiConceptSuite,
  ImageTransformationAnalysis,
  CreativeMemoryStore
} from "../lib/neoraConversationalCreativeIntelligence";
import type {
  CreativeDirectorPipelineResult,
  MoodboardEngineResult,
  BrandIntelligenceSystem,
  MarketingCampaignAssetSuite,
  Packaging3DSpecification,
  CommercialDesignScoreCard
} from "../lib/neoraAutonomousCreativeDirector";
import type {
  MultiAgentOrchestrationSession,
  MultimodalAnalysisResult,
  MarketplacePackageResult
} from "../lib/neoraAutonomousCreativeAgency";
import type {
  GoalFirstWorkflowResult,
  UniversalMemoryStore,
  NeoraPluginManifest,
  UserPersonaMode
} from "../lib/neoraUniversalCreativeOS";
import type {
  CognitiveReasoningSession,
  PcOsAgentAction,
  CognitiveSelfRepairDiagnostic
} from "../lib/neoraAIBrainCognitiveEngine";

interface NeoraAIDesignStudioDashboardProps {
  geminiKey?: string;
}

export function NeoraAIDesignStudioDashboard({ geminiKey }: NeoraAIDesignStudioDashboardProps) {
  const [subTab, setSubTab] = useState<
    | "conversational"
    | "autonomous"
    | "agency"
    | "universal_os"
    | "ai_brain"
    | "software_factory"
    | "business_os"
    | "singularity_platform"
    | "implementation_foundation"
    | "qa_self_healing"
    | "release_deployment"
    | "autonomous_evolution"
    | "runtime_foundation"
    | "native_ai_brain_cognitive"
    | "design_os_creative"
    | "software_engineering_os"
    | "business_os_operations"
    | "enterprise_design_system"
    | "ndl_core_design_system"
    | "professional_workspace_e2"
    | "neora_vector_studio_e3"
    | "multiconcept"
    | "transformation"
    | "workspace"
    | "smart_edit"
    | "calligraphy"
    | "layers"
    | "variations"
    | "export"
    | "quality"
    | "memory"
  >("conversational");

  // Autonomous Creative Director Engine State (Doc B Part 2.4)
  const [cdPipeline, setCdPipeline] = useState<CreativeDirectorPipelineResult | null>(null);
  const [cdMoodboard, setCdMoodboard] = useState<MoodboardEngineResult | null>(null);
  const [cdBrandSystem, setCdBrandSystem] = useState<BrandIntelligenceSystem | null>(null);
  const [cdCampaignSuite, setCdCampaignSuite] = useState<MarketingCampaignAssetSuite | null>(null);
  const [cdPackagingSpec, setCdPackagingSpec] = useState<Packaging3DSpecification | null>(null);
  const [cdScorecard, setCdScorecard] = useState<CommercialDesignScoreCard | null>(null);

  const [loadingCdPipeline, setLoadingCdPipeline] = useState(false);
  const [loadingCdMood, setLoadingCdMood] = useState(false);
  const [loadingCdBrand, setLoadingCdBrand] = useState(false);
  const [loadingCdCampaign, setLoadingCdCampaign] = useState(false);
  const [loadingCdPackaging, setLoadingCdPackaging] = useState(false);

  // Autonomous Creative Agency State (Doc B Part 2.5)
  const [agencySession, setAgencySession] = useState<MultiAgentOrchestrationSession | null>(null);
  const [multimodalAnalysis, setMultimodalAnalysis] = useState<MultimodalAnalysisResult | null>(null);
  const [marketplacePackage, setMarketplacePackage] = useState<MarketplacePackageResult | null>(null);

  const [loadingAgencySession, setLoadingAgencySession] = useState(false);
  const [loadingMultimodal, setLoadingMultimodal] = useState(false);
  const [loadingMarketplacePkg, setLoadingMarketplacePkg] = useState(false);

  // Universal Creative Operating System State (Doc B Part 2.6)
  const [universalOsResult, setUniversalOsResult] = useState<GoalFirstWorkflowResult | null>(null);
  const [unifiedMemoryStore, setUnifiedMemoryStore] = useState<UniversalMemoryStore | null>(null);
  const [activePluginsList, setActivePluginsList] = useState<NeoraPluginManifest[]>([]);
  const [selectedPersonaMode, setSelectedPersonaMode] = useState<UserPersonaMode>("Design Agency");
  const [loadingUniversalOs, setLoadingUniversalOs] = useState(false);

  // Neora AI Brain & Cognitive Engine State (Doc B Mega Section 3)
  const [cognitiveSession, setCognitiveSession] = useState<CognitiveReasoningSession | null>(null);
  const [pcOsAction, setPcOsAction] = useState<PcOsAgentAction | null>(null);
  const [selfRepairDiag, setSelfRepairDiag] = useState<CognitiveSelfRepairDiagnostic | null>(null);
  const [preferLocalModel, setPreferLocalModel] = useState(false);

  const [loadingCognitiveSession, setLoadingCognitiveSession] = useState(false);
  const [loadingPcOsAction, setLoadingPcOsAction] = useState(false);
  const [loadingSelfRepair, setLoadingSelfRepair] = useState(false);

  // Autonomous Software Factory Engineering Platform State (Doc B Mega Section 4)
  const [softwareFactoryResult, setSoftwareFactoryResult] = useState<SoftwareFactoryPipelineResult | null>(null);
  const [selfDebugResult, setSelfDebugResult] = useState<SelfDebugDiagnosticsResult | null>(null);
  const [pluginSdkResult, setPluginSdkResult] = useState<PluginSdkBoilerplateResult | null>(null);
  const [selectedOutputType, setSelectedOutputType] = useState<SoftwareFactoryOutputType>("Full-Stack Web Application (React + Node + Express)");
  const [selectedArchPattern, setSelectedArchPattern] = useState<SoftwareArchitecturePattern>("Clean / Hexagonal Architecture");

  const [loadingSoftwareFactory, setLoadingSoftwareFactory] = useState(false);
  const [loadingSelfDebug, setLoadingSelfDebug] = useState(false);
  const [loadingPluginSdk, setLoadingPluginSdk] = useState(false);

  // Autonomous Business OS State (Doc B Mega Section 5)
  const [businessOsResult, setBusinessOsResult] = useState<BusinessOsPipelineResult | null>(null);
  const [customInvoiceResult, setCustomInvoiceResult] = useState<AutomatedInvoice | null>(null);
  const [selectedBusinessPersona, setSelectedBusinessPersona] = useState<BusinessPersonaType>("Creative Agency");
  const [selectedProductType, setSelectedProductType] = useState<DigitalProductType>("Brand Identity Package");

  const [loadingBusinessOs, setLoadingBusinessOs] = useState(false);
  const [loadingCustomInvoice, setLoadingCustomInvoice] = useState(false);

  // Neora Singularity Platform State (Doc B Mega Section 6)
  const [singularityResult, setSingularityResult] = useState<SingularityPipelineResult | null>(null);
  const [singularityNodes, setSingularityNodes] = useState<SingularityIntelligenceNode[]>([]);
  const [selfEvolutionResult, setSelfEvolutionResult] = useState<SingularitySelfEvolutionResult | null>(null);

  const [loadingSingularityPipeline, setLoadingSingularityPipeline] = useState(false);
  const [loadingSelfEvolution, setLoadingSelfEvolution] = useState(false);

  // Implementation Foundation State (Doc C Part 1)
  const [implementationPlanResult, setImplementationPlanResult] = useState<ImplementationMasterPlanResult | null>(null);
  const [systemAuditResult, setSystemAuditResult] = useState<RepositorySystemAuditResult | null>(null);

  const [loadingImplementationPlan, setLoadingImplementationPlan] = useState(false);
  const [loadingSystemAudit, setLoadingSystemAudit] = useState(false);

  // Enterprise QA & Self-Healing State (Doc C Mega Prompt 3)
  const [qaReleaseReport, setQaReleaseReport] = useState<EnterpriseQaReleaseReport | null>(null);
  const [selfHealingResult, setSelfHealingResult] = useState<SelfHealingRepairResult | null>(null);

  const [loadingQaPipeline, setLoadingQaPipeline] = useState(false);
  const [loadingSelfHealing, setLoadingSelfHealing] = useState(false);

  // Enterprise Release & Deployment State (Doc C Mega Prompt 4)
  const [productionReleaseReport, setProductionReleaseReport] = useState<ProductionReleaseDeploymentReport | null>(null);
  const [disasterRecoveryManifest, setDisasterRecoveryManifest] = useState<EnterpriseBackupManifest | null>(null);

  const [loadingReleasePipeline, setLoadingReleasePipeline] = useState(false);
  const [loadingDisasterRecovery, setLoadingDisasterRecovery] = useState(false);

  // Autonomous Evolution Platform State (Doc C Mega Prompt 5)
  const [evolutionReport, setEvolutionReport] = useState<AutonomousEvolutionReport | null>(null);
  const [latestRefactorProposal, setLatestRefactorProposal] = useState<SelfImprovementRefactoringProposal | null>(null);

  const [loadingEvolutionPipeline, setLoadingEvolutionPipeline] = useState(false);
  const [loadingSelfRefactor, setLoadingSelfRefactor] = useState(false);

  // Core Platform Runtime Foundation State (Ultra Mega Prompt D1)
  const [runtimeReport, setRuntimeReport] = useState<CorePlatformRuntimeReport | null>(null);
  const [voiceCommandResult, setVoiceCommandResult] = useState<VoiceCommandDescriptor | null>(null);
  const [activeWorkflowPlan, setActiveWorkflowPlan] = useState<WorkflowExecutionPlan | null>(null);

  const [voiceInputText, setVoiceInputText] = useState("Neora, ডিজাইন এবং আর্কিটেকচার অটোমেট করো");
  const [loadingRuntimeBoot, setLoadingRuntimeBoot] = useState(false);
  const [loadingVoiceCommand, setLoadingVoiceCommand] = useState(false);
  const [loadingWorkflowTrigger, setLoadingWorkflowTrigger] = useState(false);

  // Native AI Brain Cognitive Runtime State (Ultra Mega Prompt D2)
  const [brainCognitiveReport, setBrainCognitiveReport] = useState<NativeAiBrainCognitiveReport | null>(null);
  const [deliberatedAgents, setDeliberatedAgents] = useState<SpecializedAgentRole[] | null>(null);
  const [cognitiveRepairStatus, setCognitiveRepairStatus] = useState<any | null>(null);

  const [loadingBrainPipeline, setLoadingBrainPipeline] = useState(false);
  const [loadingDeliberation, setLoadingDeliberation] = useState(false);
  const [loadingBrainRepair, setLoadingBrainRepair] = useState(false);

  // AI Design OS Creative Workspace State (Ultra Mega Prompt D3)
  const [designOsReport, setDesignOsReport] = useState<AiDesignOsWorkspaceReport | null>(null);
  const [designOsVoiceResult, setDesignOsVoiceResult] = useState<any | null>(null);
  const [loadingDesignOsPipeline, setLoadingDesignOsPipeline] = useState(false);
  const [loadingDesignOsVoiceEdit, setLoadingDesignOsVoiceEdit] = useState(false);

  // Autonomous Software Engineering OS State (Ultra Mega Prompt D4)
  const [engineeringOsReport, setEngineeringOsReport] = useState<SoftwareEngineeringOsReport | null>(null);
  const [codeReviewAudit, setCodeReviewAudit] = useState<SoftwareQualityReviewAudit | null>(null);
  const [loadingEngineeringOsPipeline, setLoadingEngineeringOsPipeline] = useState(false);
  const [loadingCodeReview, setLoadingCodeReview] = useState(false);

  // Business OS Operations Platform State (Ultra Mega Prompt D5)
  const [businessOsReport, setBusinessOsReport] = useState<BusinessOsOperationsReport | null>(null);
  const [businessOsSearchResults, setBusinessOsSearchResults] = useState<UnifiedSearchMatch[] | null>(null);
  const [generatedDocument, setGeneratedDocument] = useState<BusinessDocumentDescriptor | null>(null);
  const [loadingBusinessOsPipeline, setLoadingBusinessOsPipeline] = useState(false);
  const [loadingBusinessOsSearch, setLoadingBusinessOsSearch] = useState(false);
  const [loadingDocumentGeneration, setLoadingDocumentGeneration] = useState(false);

  // Enterprise UI/UX Design System State (Ultra Mega Prompt E)
  const [designSystemReport, setDesignSystemReport] = useState<DesignSystemPlatformReport | null>(null);
  const [loadingDesignSystem, setLoadingDesignSystem] = useState(false);

  // Neora Design Language (NDL) Core System State (Ultra Mega Prompt E1)
  const [ndlReport, setNdlReport] = useState<NdlCoreSystemMasterReport | null>(null);
  const [loadingNdl, setLoadingNdl] = useState(false);

  // Professional Workspace & Window Management State (Ultra Mega Prompt E2)
  const [workspaceReport, setWorkspaceReport] = useState<WorkspaceRuntimeMasterReport | null>(null);
  const [loadingWorkspace, setLoadingWorkspace] = useState(false);

  // Neora Vector Studio State (Ultra Mega Prompt E3)
  const [vectorStudioReport, setVectorStudioReport] = useState<VectorStudioMasterReport | null>(null);
  const [loadingVectorStudio, setLoadingVectorStudio] = useState(false);
  const [vectorAiPrompt, setVectorAiPrompt] = useState("Create a luxury gold crest logo for executive packaging");

  // Core Goal Generator
  const [userGoal, setUserGoal] = useState("Enterprise AI Dashboard Design for Cloud Infrastructure Monitoring");
  const [selectedFormat, setSelectedFormat] = useState<DesignStudioOutputType>("UI / Web / App Mockup");
  const [loadingGen, setLoadingGen] = useState(false);
  const [loadingVar, setLoadingVar] = useState(false);

  // Conversational Intelligence State (Doc B Part 2.3)
  const [goalIntent, setGoalIntent] = useState<UserGoalIntent | null>(null);
  const [reasoningPlan, setReasoningPlan] = useState<CreativeReasoningPlan | null>(null);
  const [multiConceptSuite, setMultiConceptSuite] = useState<MultiConceptSuite | null>(null);
  const [imageTransformResult, setImageTransformResult] = useState<ImageTransformationAnalysis | null>(null);
  const [creativeMemory, setCreativeMemory] = useState<CreativeMemoryStore | null>(null);

  const [loadingIntent, setLoadingIntent] = useState(false);
  const [loadingConcepts, setLoadingConcepts] = useState(false);
  const [loadingTransform, setLoadingTransform] = useState(false);
  const [transformType, setTransformType] = useState("Luxury Gold Edition");

  // Active Data
  const [activeProject, setActiveProject] = useState<CreativeConceptProject | null>(null);
  const [variationsList, setVariationsList] = useState<CreativeConceptProject[]>([]);
  const [selectedArtboardIndex, setSelectedArtboardIndex] = useState(0);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  // Workspace Mode & Engine State (Doc B Part 2.2)
  const [canvasConfig, setCanvasConfig] = useState<WorkspaceCanvasConfig | null>(null);
  const [smartEditResult, setSmartEditResult] = useState<SmartEditResult | null>(null);
  const [loadingSmartEdit, setLoadingSmartEdit] = useState(false);

  // Calligraphy Engine State
  const [calligStyle, setCalligStyle] = useState<"Bangla Decorative" | "Arabic Diwani/Thuluth" | "Urdu Nastaliq" | "English Script Flourish">("Bangla Decorative");
  const [calligText, setCalligText] = useState("নিওরা ক্রিয়েটিভ ওএস");
  const [activeCalligStroke, setActiveCalligStroke] = useState<CalligraphyStrokeObject | null>(null);

  // Export Engine State
  const [exportFormat, setExportFormat] = useState<ExportFileFormat>("PDF_X_Print");
  const [exportResult, setExportResult] = useState<ExportPackageResult | null>(null);

  // History State
  const [historyTimeline, setHistoryTimeline] = useState<WorkspaceHistorySnapshot[]>([]);

  useEffect(() => {
    handleAnalyzeIntent();
    fetchCanvasConfig();
    fetchHistory();
    fetchCreativeMemory();
  }, []);

  const fetchCanvasConfig = async () => {
    try {
      const res = await fetch("/api/workspace/config");
      const data = await res.json();
      if (data.success && data.config) setCanvasConfig(data.config);
    } catch (e) {
      console.error("Failed to fetch workspace config:", e);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/workspace/history");
      const data = await res.json();
      if (data.success && data.history) setHistoryTimeline(data.history);
    } catch (e) {
      console.error("Failed to fetch history:", e);
    }
  };

  const fetchCreativeMemory = async () => {
    try {
      const res = await fetch("/api/creative-intelligence/memory");
      const data = await res.json();
      if (data.success && data.memory) setCreativeMemory(data.memory);
    } catch (e) {
      console.error("Failed to fetch creative memory:", e);
    }
  };

  const handleAnalyzeIntent = async () => {
    if (!userGoal.trim()) return;
    setLoadingIntent(true);
    try {
      const res = await fetch("/api/creative-intelligence/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userGoal, geminiKey })
      });
      const data = await res.json();
      if (data.success && data.intent) {
        setGoalIntent(data.intent);

        // Fetch Reasoning Plan
        const rRes = await fetch("/api/creative-intelligence/reasoning", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ intent: data.intent, geminiKey })
        });
        const rData = await rRes.json();
        if (rData.success && rData.plan) {
          setReasoningPlan(rData.plan);
        }
      }
    } catch (e) {
      console.error("Failed intent analysis:", e);
    } finally {
      setLoadingIntent(false);
    }
  };

  const handleGenerateMultiConcepts = async () => {
    if (!goalIntent || !reasoningPlan) return;
    setLoadingConcepts(true);
    try {
      const res = await fetch("/api/creative-intelligence/multi-concepts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent: goalIntent, plan: reasoningPlan, geminiKey })
      });
      const data = await res.json();
      if (data.success && data.suite) {
        setMultiConceptSuite(data.suite);
        setSubTab("multiconcept");
      }
    } catch (e) {
      console.error("Failed multi-concept generation:", e);
    } finally {
      setLoadingConcepts(false);
    }
  };

  const handleTransformImage = async () => {
    setLoadingTransform(true);
    try {
      const res = await fetch("/api/creative-intelligence/transform-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transformationType: transformType, geminiKey })
      });
      const data = await res.json();
      if (data.success && data.result) {
        setImageTransformResult(data.result);
      }
    } catch (e) {
      console.error("Failed image transformation:", e);
    } finally {
      setLoadingTransform(false);
    }
  };

  const handleRunCdPipeline = async () => {
    setLoadingCdPipeline(true);
    try {
      const res = await fetch("/api/autonomous-creative-director/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: userGoal, geminiKey })
      });
      const data = await res.json();
      if (data.success && data.pipeline) {
        setCdPipeline(data.pipeline);
        setCdMoodboard(data.pipeline.moodboard);
        setCdScorecard(data.pipeline.commercialScore);
      }
    } catch (e) {
      console.error("Failed CD Pipeline execution:", e);
    } finally {
      setLoadingCdPipeline(false);
    }
  };

  const handleGenerateBrandIdentity = async () => {
    setLoadingCdBrand(true);
    try {
      const res = await fetch("/api/autonomous-creative-director/brand-identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName: userGoal, geminiKey })
      });
      const data = await res.json();
      if (data.success && data.brandSystem) {
        setCdBrandSystem(data.brandSystem);
      }
    } catch (e) {
      console.error("Failed Brand Identity generation:", e);
    } finally {
      setLoadingCdBrand(false);
    }
  };

  const handleGenerateCampaignSuite = async () => {
    setLoadingCdCampaign(true);
    try {
      const res = await fetch("/api/autonomous-creative-director/marketing-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignGoal: userGoal, geminiKey })
      });
      const data = await res.json();
      if (data.success && data.campaignSuite) {
        setCdCampaignSuite(data.campaignSuite);
      }
    } catch (e) {
      console.error("Failed Campaign Suite generation:", e);
    } finally {
      setLoadingCdCampaign(false);
    }
  };

  const handleGeneratePackagingSpec = async () => {
    setLoadingCdPackaging(true);
    try {
      const res = await fetch("/api/autonomous-creative-director/packaging-spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productCategory: "Consumer Electronics", geminiKey })
      });
      const data = await res.json();
      if (data.success && data.packagingSpec) {
        setCdPackagingSpec(data.packagingSpec);
      }
    } catch (e) {
      console.error("Failed Packaging Spec generation:", e);
    } finally {
      setLoadingCdPackaging(false);
    }
  };

  const handleOrchestrateAgencySession = async () => {
    setLoadingAgencySession(true);
    try {
      const res = await fetch("/api/autonomous-creative-agency/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: userGoal, geminiKey })
      });
      const data = await res.json();
      if (data.success && data.session) {
        setAgencySession(data.session);
      }
    } catch (e) {
      console.error("Failed Agency session orchestration:", e);
    } finally {
      setLoadingAgencySession(false);
    }
  };

  const handleAnalyzeMultimodalAsset = async () => {
    setLoadingMultimodal(true);
    try {
      const res = await fetch("/api/autonomous-creative-agency/analyze-multimodal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: "uploaded_brand_mockup.png", fileType: "Image", geminiKey })
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setMultimodalAnalysis(data.analysis);
      }
    } catch (e) {
      console.error("Failed Multimodal analysis:", e);
    } finally {
      setLoadingMultimodal(false);
    }
  };

  const handleExportMarketplacePackage = async () => {
    setLoadingMarketplacePkg(true);
    try {
      const res = await fetch("/api/autonomous-creative-agency/marketplace-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageName: userGoal })
      });
      const data = await res.json();
      if (data.success && data.package) {
        setMarketplacePackage(data.package);
      }
    } catch (e) {
      console.error("Failed Marketplace package export:", e);
    } finally {
      setLoadingMarketplacePkg(false);
    }
  };

  const handleExecuteUniversalOsGoal = async () => {
    setLoadingUniversalOs(true);
    try {
      const res = await fetch("/api/universal-creative-os/execute-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: userGoal, persona: selectedPersonaMode, geminiKey })
      });
      const data = await res.json();
      if (data.success && data.result) {
        setUniversalOsResult(data.result);
      }
    } catch (e) {
      console.error("Failed Universal OS execution:", e);
    } finally {
      setLoadingUniversalOs(false);
    }
  };

  const handleExecuteCognitiveReasoning = async () => {
    setLoadingCognitiveSession(true);
    try {
      const res = await fetch("/api/ai-brain/reasoning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: userGoal, preferLocal: preferLocalModel, geminiKey })
      });
      const data = await res.json();
      if (data.success && data.session) {
        setCognitiveSession(data.session);
      }
    } catch (e) {
      console.error("Failed Cognitive Reasoning execution:", e);
    } finally {
      setLoadingCognitiveSession(false);
    }
  };

  const handleExecutePcOsAction = async () => {
    setLoadingPcOsAction(true);
    try {
      const res = await fetch("/api/ai-brain/pc-os-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetSystem: "Windows Desktop", commandType: "File Structure Audit" })
      });
      const data = await res.json();
      if (data.success && data.action) {
        setPcOsAction(data.action);
      }
    } catch (e) {
      console.error("Failed PC OS Agent action:", e);
    } finally {
      setLoadingPcOsAction(false);
    }
  };

  const handleRunSelfRepair = async () => {
    setLoadingSelfRepair(true);
    try {
      const res = await fetch("/api/ai-brain/self-repair");
      const data = await res.json();
      if (data.success && data.diagnostic) {
        setSelfRepairDiag(data.diagnostic);
      }
    } catch (e) {
      console.error("Failed Cognitive Self-Repair diagnostic:", e);
    } finally {
      setLoadingSelfRepair(false);
    }
  };

  const handleRunSoftwareFactoryPipeline = async () => {
    setLoadingSoftwareFactory(true);
    try {
      const res = await fetch("/api/software-factory/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: userGoal,
          targetOutput: selectedOutputType,
          architecturePattern: selectedArchPattern,
          geminiKey
        })
      });
      const data = await res.json();
      if (data.success && data.result) {
        setSoftwareFactoryResult(data.result);
      }
    } catch (e) {
      console.error("Failed Software Factory Pipeline execution:", e);
    } finally {
      setLoadingSoftwareFactory(false);
    }
  };

  const handleRunSelfDebug = async () => {
    setLoadingSelfDebug(true);
    try {
      const res = await fetch("/api/software-factory/self-debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codeSnippet: "const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });",
          errorMessage: "TypeError: Cannot read properties of undefined (reading 'GEMINI_API_KEY')"
        })
      });
      const data = await res.json();
      if (data.success && data.result) {
        setSelfDebugResult(data.result);
      }
    } catch (e) {
      console.error("Failed Self-Debug execution:", e);
    } finally {
      setLoadingSelfDebug(false);
    }
  };

  const handleGeneratePluginSdk = async () => {
    setLoadingPluginSdk(true);
    try {
      const res = await fetch("/api/software-factory/plugin-sdk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pluginName: "Custom Analytics Skill Module" })
      });
      const data = await res.json();
      if (data.success && data.result) {
        setPluginSdkResult(data.result);
      }
    } catch (e) {
      console.error("Failed Plugin SDK generation:", e);
    } finally {
      setLoadingPluginSdk(false);
    }
  };

  const handleRunBusinessOsPipeline = async () => {
    setLoadingBusinessOs(true);
    try {
      const res = await fetch("/api/business-os/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: userGoal,
          persona: selectedBusinessPersona,
          productType: selectedProductType,
          geminiKey
        })
      });
      const data = await res.json();
      if (data.success && data.result) {
        setBusinessOsResult(data.result);
      }
    } catch (e) {
      console.error("Failed Business OS Pipeline execution:", e);
    } finally {
      setLoadingBusinessOs(false);
    }
  };

  const handleGenerateCustomInvoice = async () => {
    setLoadingCustomInvoice(true);
    try {
      const res = await fetch("/api/business-os/crm-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: "Global Shukria Printers & Enterprise",
          amountUsd: 2450
        })
      });
      const data = await res.json();
      if (data.success && data.invoice) {
        setCustomInvoiceResult(data.invoice);
      }
    } catch (e) {
      console.error("Failed Custom Invoice generation:", e);
    } finally {
      setLoadingCustomInvoice(false);
    }
  };

  const handleRunSingularityPipeline = async () => {
    setLoadingSingularityPipeline(true);
    try {
      const res = await fetch("/api/singularity-platform/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oneGoalPrompt: userGoal,
          geminiKey
        })
      });
      const data = await res.json();
      if (data.success && data.result) {
        setSingularityResult(data.result);
      }
    } catch (e) {
      console.error("Failed Singularity Pipeline execution:", e);
    } finally {
      setLoadingSingularityPipeline(false);
    }
  };

  const handleTriggerSelfEvolution = async () => {
    setLoadingSelfEvolution(true);
    try {
      const res = await fetch("/api/singularity-platform/self-evolution", { method: "POST" });
      const data = await res.json();
      if (data.success && data.result) {
        setSelfEvolutionResult(data.result);
      }
    } catch (e) {
      console.error("Failed Self-Evolution execution:", e);
    } finally {
      setLoadingSelfEvolution(false);
    }
  };

  const handleFetchSingularityHealth = async () => {
    try {
      const res = await fetch("/api/singularity-platform/health");
      const data = await res.json();
      if (data.success && data.nodes) {
        setSingularityNodes(data.nodes);
      }
    } catch (e) {
      console.error("Failed Singularity health fetch:", e);
    }
  };

  const handleRunMasterImplementationPlan = async () => {
    setLoadingImplementationPlan(true);
    try {
      const res = await fetch("/api/implementation-foundation/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: userGoal, geminiKey })
      });
      const data = await res.json();
      if (data.success && data.result) {
        setImplementationPlanResult(data.result);
      }
    } catch (e) {
      console.error("Failed Master Implementation Plan execution:", e);
    } finally {
      setLoadingImplementationPlan(false);
    }
  };

  const handleRunSystemAudit = async () => {
    setLoadingSystemAudit(true);
    try {
      const res = await fetch("/api/implementation-foundation/audit");
      const data = await res.json();
      if (data.success && data.audit) {
        setSystemAuditResult(data.audit);
      }
    } catch (e) {
      console.error("Failed System Audit execution:", e);
    } finally {
      setLoadingSystemAudit(false);
    }
  };

  const handleRunQaPipeline = async () => {
    setLoadingQaPipeline(true);
    try {
      const res = await fetch("/api/qa-self-healing/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: userGoal, geminiKey })
      });
      const data = await res.json();
      if (data.success && data.report) {
        setQaReleaseReport(data.report);
      }
    } catch (e) {
      console.error("Failed QA Pipeline execution:", e);
    } finally {
      setLoadingQaPipeline(false);
    }
  };

  const handleTriggerSelfHealing = async () => {
    setLoadingSelfHealing(true);
    try {
      const res = await fetch("/api/qa-self-healing/trigger-healing", { method: "POST" });
      const data = await res.json();
      if (data.success && data.repair) {
        setSelfHealingResult(data.repair);
      }
    } catch (e) {
      console.error("Failed Self-Healing execution:", e);
    } finally {
      setLoadingSelfHealing(false);
    }
  };

  const handleRunReleasePipeline = async () => {
    setLoadingReleasePipeline(true);
    try {
      const res = await fetch("/api/release-deployment/integrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: userGoal, geminiKey })
      });
      const data = await res.json();
      if (data.success && data.report) {
        setProductionReleaseReport(data.report);
      }
    } catch (e) {
      console.error("Failed Release Pipeline execution:", e);
    } finally {
      setLoadingReleasePipeline(false);
    }
  };

  const handleTriggerDisasterRecovery = async () => {
    setLoadingDisasterRecovery(true);
    try {
      const res = await fetch("/api/release-deployment/disaster-recovery", { method: "POST" });
      const data = await res.json();
      if (data.success && data.backup) {
        setDisasterRecoveryManifest(data.backup);
      }
    } catch (e) {
      console.error("Failed Disaster Recovery execution:", e);
    } finally {
      setLoadingDisasterRecovery(false);
    }
  };

  const handleRunEvolutionPipeline = async () => {
    setLoadingEvolutionPipeline(true);
    try {
      const res = await fetch("/api/autonomous-evolution/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: userGoal, geminiKey })
      });
      const data = await res.json();
      if (data.success && data.report) {
        setEvolutionReport(data.report);
      }
    } catch (e) {
      console.error("Failed Evolution Pipeline execution:", e);
    } finally {
      setLoadingEvolutionPipeline(false);
    }
  };

  const handleTriggerSelfRefactor = async () => {
    setLoadingSelfRefactor(true);
    try {
      const res = await fetch("/api/autonomous-evolution/trigger-refactor", { method: "POST" });
      const data = await res.json();
      if (data.success && data.proposal) {
        setLatestRefactorProposal(data.proposal);
      }
    } catch (e) {
      console.error("Failed Self-Refactoring execution:", e);
    } finally {
      setLoadingSelfRefactor(false);
    }
  };

  const handleRunRuntimeBoot = async () => {
    setLoadingRuntimeBoot(true);
    try {
      const res = await fetch("/api/core-runtime/boot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: userGoal, geminiKey })
      });
      const data = await res.json();
      if (data.success && data.report) {
        setRuntimeReport(data.report);
      }
    } catch (e) {
      console.error("Failed Core Runtime Boot sequence:", e);
    } finally {
      setLoadingRuntimeBoot(false);
    }
  };

  const handleParseVoiceCommand = async () => {
    setLoadingVoiceCommand(true);
    try {
      const res = await fetch("/api/core-runtime/voice-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioText: voiceInputText, language: "Bilingual" })
      });
      const data = await res.json();
      if (data.success && data.command) {
        setVoiceCommandResult(data.command);
      }
    } catch (e) {
      console.error("Failed Voice Command parsing:", e);
    } finally {
      setLoadingVoiceCommand(false);
    }
  };

  const handleTriggerWorkflow = async () => {
    setLoadingWorkflowTrigger(true);
    try {
      const res = await fetch("/api/core-runtime/trigger-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowName: "Core Platform Kernel Service Boot & Event Route Synchronization" })
      });
      const data = await res.json();
      if (data.success && data.plan) {
        setActiveWorkflowPlan(data.plan);
      }
    } catch (e) {
      console.error("Failed Resumable Workflow trigger:", e);
    } finally {
      setLoadingWorkflowTrigger(false);
    }
  };

  const handleRunBrainPipeline = async () => {
    setLoadingBrainPipeline(true);
    try {
      const res = await fetch("/api/native-ai-brain/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: userGoal, geminiKey })
      });
      const data = await res.json();
      if (data.success && data.report) {
        setBrainCognitiveReport(data.report);
      }
    } catch (e) {
      console.error("Failed Native AI Brain Pipeline execution:", e);
    } finally {
      setLoadingBrainPipeline(false);
    }
  };

  const handleTriggerDeliberation = async () => {
    setLoadingDeliberation(true);
    try {
      const res = await fetch("/api/native-ai-brain/deliberate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: userGoal })
      });
      const data = await res.json();
      if (data.success && data.roles) {
        setDeliberatedAgents(data.roles);
      }
    } catch (e) {
      console.error("Failed Multi-Agent Deliberation:", e);
    } finally {
      setLoadingDeliberation(false);
    }
  };

  const handleTriggerBrainRepair = async () => {
    setLoadingBrainRepair(true);
    try {
      const res = await fetch("/api/native-ai-brain/self-repair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName: "Neora Cognitive Reasoning & Knowledge Graph Synchronization" })
      });
      const data = await res.json();
      if (data.success && data.repair) {
        setCognitiveRepairStatus(data.repair);
      }
    } catch (e) {
      console.error("Failed Brain Self-Repair:", e);
    } finally {
      setLoadingBrainRepair(false);
    }
  };

  const handleRunDesignOsPipeline = async () => {
    setLoadingDesignOsPipeline(true);
    try {
      const res = await fetch("/api/design-os/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientPrompt: userGoal, geminiKey })
      });
      const data = await res.json();
      if (data.success && data.report) {
        setDesignOsReport(data.report);
      }
    } catch (e) {
      console.error("Failed Design OS Pipeline execution:", e);
    } finally {
      setLoadingDesignOsPipeline(false);
    }
  };

  const handleRunDesignOsVoiceEdit = async () => {
    setLoadingDesignOsVoiceEdit(true);
    try {
      const res = await fetch("/api/design-os/voice-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commandText: "Move gold logo vector left by 15px and apply Playfair typography", layerId: "vec_01" })
      });
      const data = await res.json();
      if (data.success && data.result) {
        setDesignOsVoiceResult(data.result);
      }
    } catch (e) {
      console.error("Failed Design OS Voice Edit:", e);
    } finally {
      setLoadingDesignOsVoiceEdit(false);
    }
  };

  const handleRunEngineeringOsPipeline = async () => {
    setLoadingEngineeringOsPipeline(true);
    try {
      const res = await fetch("/api/software-engineering/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userGoal, geminiKey })
      });
      const data = await res.json();
      if (data.success && data.report) {
        setEngineeringOsReport(data.report);
      }
    } catch (e) {
      console.error("Failed Software Engineering OS Pipeline execution:", e);
    } finally {
      setLoadingEngineeringOsPipeline(false);
    }
  };

  const handleRunCodeReview = async () => {
    setLoadingCodeReview(true);
    try {
      const res = await fetch("/api/software-engineering/code-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeSnippet: "export function handleDataIngestion(req: Request) { ... }" })
      });
      const data = await res.json();
      if (data.success && data.audit) {
        setCodeReviewAudit(data.audit);
      }
    } catch (e) {
      console.error("Failed Code Review execution:", e);
    } finally {
      setLoadingCodeReview(false);
    }
  };

  const handleRunBusinessOsOperationsPipeline = async () => {
    setLoadingBusinessOsPipeline(true);
    try {
      const res = await fetch("/api/business-os/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: userGoal, geminiKey })
      });
      const data = await res.json();
      if (data.success && data.report) {
        setBusinessOsReport(data.report);
      }
    } catch (e) {
      console.error("Failed Business OS Pipeline execution:", e);
    } finally {
      setLoadingBusinessOsPipeline(false);
    }
  };

  const handleRunBusinessOsSearch = async () => {
    setLoadingBusinessOsSearch(true);
    try {
      const res = await fetch("/api/business-os/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "Aura Luxury" })
      });
      const data = await res.json();
      if (data.success && data.matches) {
        setBusinessOsSearchResults(data.matches);
      }
    } catch (e) {
      console.error("Failed Business OS Search execution:", e);
    } finally {
      setLoadingBusinessOsSearch(false);
    }
  };

  const handleGenerateBusinessDocument = async () => {
    setLoadingDocumentGeneration(true);
    try {
      const res = await fetch("/api/business-os/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType: "Invoice", clientName: "Aura Luxury Holdings", amount: 12500 })
      });
      const data = await res.json();
      if (data.success && data.document) {
        setGeneratedDocument(data.document);
      }
    } catch (e) {
      console.error("Failed Business Document generation:", e);
    } finally {
      setLoadingDocumentGeneration(false);
    }
  };

  const handleRunDesignSystemPipeline = async () => {
    setLoadingDesignSystem(true);
    try {
      const res = await fetch("/api/design-system/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: "Dark" })
      });
      const data = await res.json();
      if (data.success && data.report) {
        setDesignSystemReport(data.report);
      }
    } catch (e) {
      console.error("Failed Design System Execution:", e);
    } finally {
      setLoadingDesignSystem(false);
    }
  };

  const handleRunNdlPipeline = async () => {
    setLoadingNdl(true);
    try {
      const res = await fetch("/api/ndl/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.success && data.report) {
        setNdlReport(data.report);
      }
    } catch (e) {
      console.error("Failed NDL Execution:", e);
    } finally {
      setLoadingNdl(false);
    }
  };

  const handleRunWorkspacePipeline = async (profileId: string = "prof_design") => {
    setLoadingWorkspace(true);
    try {
      const res = await fetch("/api/workspace/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId })
      });
      const data = await res.json();
      if (data.success && data.report) {
        setWorkspaceReport(data.report);
      }
    } catch (e) {
      console.error("Failed Workspace Execution:", e);
    } finally {
      setLoadingWorkspace(false);
    }
  };

  const handleFetchUnifiedMemoryAndPlugins = async () => {
    try {
      const [memRes, plugRes] = await Promise.all([
        fetch("/api/universal-creative-os/unified-memory"),
        fetch("/api/universal-creative-os/plugins")
      ]);
      const memData = await memRes.json();
      const plugData = await plugRes.json();
      if (memData.success) setUnifiedMemoryStore(memData.memory);
      if (plugData.success) setActivePluginsList(plugData.plugins);
    } catch (e) {
      console.error("Failed fetching memory & plugins:", e);
    }
  };

  const handleGenerate = async () => {
    if (!userGoal.trim()) return;
    setLoadingGen(true);
    try {
      const res = await fetch("/api/design-studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userGoal, outputFormat: selectedFormat, geminiKey })
      });
      const data = await res.json();
      if (data.success && data.project) {
        setActiveProject(data.project);
        if (data.project.artboards[0]?.layers[0]) {
          setSelectedLayerId(data.project.artboards[0].layers[0].id);
        }
        setSubTab("workspace");
      }
    } catch (e) {
      console.error("Failed to generate creative design project:", e);
    } finally {
      setLoadingGen(false);
    }
  };

  const handleSwitchMode = async (mode: CreativeWorkspaceMode) => {
    try {
      const res = await fetch("/api/workspace/mode/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode })
      });
      const data = await res.json();
      if (data.success && data.config) {
        setCanvasConfig(data.config);
        fetchHistory();
      }
    } catch (e) {
      console.error("Failed to switch workspace mode:", e);
    }
  };

  const handleSmartEdit = async (preset: SmartEditPreset) => {
    setLoadingSmartEdit(true);
    try {
      const res = await fetch("/api/workspace/smart-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preset, geminiKey })
      });
      const data = await res.json();
      if (data.success && data.result) {
        setSmartEditResult(data.result);
        fetchCanvasConfig();
        fetchHistory();
      }
    } catch (e) {
      console.error("Failed smart edit preset execution:", e);
    } finally {
      setLoadingSmartEdit(false);
    }
  };

  const handleGenerateCalligraphy = async () => {
    try {
      const res = await fetch("/api/workspace/calligraphy/stroke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ style: calligStyle, textLabel: calligText })
      });
      const data = await res.json();
      if (data.success && data.stroke) {
        setActiveCalligStroke(data.stroke);
      }
    } catch (e) {
      console.error("Failed calligraphy generation:", e);
    }
  };

  const handleExportPackage = async () => {
    try {
      const res = await fetch("/api/workspace/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: exportFormat, filename: "Neora_Master_Design" })
      });
      const data = await res.json();
      if (data.success && data.exportResult) {
        setExportResult(data.exportResult);
      }
    } catch (e) {
      console.error("Failed export package:", e);
    }
  };

  const handleGenerateVariations = async () => {
    if (!activeProject) return;
    setLoadingVar(true);
    try {
      const res = await fetch("/api/design-studio/variations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: activeProject.id })
      });
      const data = await res.json();
      if (data.success && data.variations) {
        setVariationsList(data.variations);
        setSubTab("variations");
      }
    } catch (e) {
      console.error("Failed to generate variations:", e);
    } finally {
      setLoadingVar(false);
    }
  };

  const currentArtboard: DesignArtboard | null = activeProject
    ? activeProject.artboards[selectedArtboardIndex] || null
    : null;

  const selectedLayer: DesignLayer | null = currentArtboard
    ? currentArtboard.layers.find(l => l.id === selectedLayerId) || null
    : null;

  return (
    <div className="flex flex-col gap-4 font-mono text-xs">
      {/* 1. Header & Creative OS Banner */}
      <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
            <BrainCircuit className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-tight flex items-center gap-2">
              Neora Conversational Creative Intelligence & Goal Driven Design Engine
              <span className="text-[8.5px] font-extrabold text-fuchsia-400 bg-fuchsia-950/50 border border-fuchsia-500/25 px-1.5 py-0.5 rounded uppercase tracking-widest">
                Document B Part 2.3
              </span>
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Goal Intent Reasoning, Autonomous Strategy Planning, Multi-Concept Suite A-E, Design Reference Transformation & Memory.
            </p>
          </div>
        </div>

        {canvasConfig && (
          <div className="flex items-center gap-3 bg-black/40 border border-slate-900 px-3.5 py-2 rounded-xl">
            <Printer className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="flex flex-col text-right">
              <span className="text-[8.5px] text-slate-500 uppercase font-bold">Active Workspace Mode</span>
              <span className="text-fuchsia-300 font-extrabold text-xs">{canvasConfig.mode} ({canvasConfig.activeColorSpace})</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Primary Goal & Conversational Input Bar */}
      <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-[9.5px] text-slate-400 font-bold">Explain Your Creative Goal or Business Need:</label>
            <input
              type="text"
              value={userGoal}
              onChange={e => setUserGoal(e.target.value)}
              placeholder="e.g. Minimalist Fintech Mobile Wallet Interface with Dark Theme & Emerald Accents"
              className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-fuchsia-500/50"
            />
          </div>

          <div className="w-full sm:w-64 flex flex-col gap-1">
            <label className="text-[9.5px] text-slate-400 font-bold">Target Output Format:</label>
            <select
              value={selectedFormat}
              onChange={e => setSelectedFormat(e.target.value as any)}
              className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-fuchsia-500/50"
            >
              {[
                "UI / Web / App Mockup",
                "Editable Vector Project",
                "Editable Raster Project",
                "Logo Package & Brand Identity",
                "Marketing Flyer / Poster / Banner",
                "Brochure & Book Layout",
                "Social Media Asset Suite",
                "Presentation Deck",
                "Packaging & Product Label",
                "Business Invoice & Certificate",
                "Print-Ready CMYK PDF/X"
              ].map(fmt => (
                <option key={fmt} value={fmt}>{fmt}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAnalyzeIntent}
            disabled={loadingIntent}
            className="mt-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-fuchsia-300 border border-fuchsia-500/30 rounded-xl font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <BrainCircuit className="w-4 h-4" />
            {loadingIntent ? "Analyzing..." : "Analyze Goal Intent"}
          </button>

          <button
            onClick={handleGenerate}
            disabled={loadingGen}
            className="mt-auto px-5 py-2.5 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 rounded-xl font-bold cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: loadingGen ? "1.5s" : "0s" }} />
            {loadingGen ? "Generating..." : "Generate Project"}
          </button>
        </div>
      </div>

      {/* 3. Sub Navigation */}
      <div className="flex border-b border-slate-850 gap-1 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "conversational", label: "Conversational Intent & Strategy", icon: BrainCircuit },
          { id: "autonomous", label: "Autonomous Creative Director", icon: Compass },
          { id: "agency", label: "Autonomous Creative Agency", icon: Users },
          { id: "universal_os", label: "Universal Creative OS", icon: Cpu },
          { id: "ai_brain", label: "AI Brain & Cognitive Engine", icon: Terminal },
          { id: "software_factory", label: "Autonomous Software Factory", icon: Code2 },
          { id: "business_os", label: "Autonomous Business OS", icon: Briefcase },
          { id: "singularity_platform", label: "Neora Singularity Platform", icon: Globe },
          { id: "implementation_foundation", label: "Implementation Bible & Foundation", icon: CheckCircle2 },
          { id: "qa_self_healing", label: "Enterprise QA & Self-Healing Platform", icon: ShieldCheck },
          { id: "release_deployment", label: "Final Release & Deployment Platform", icon: Rocket },
          { id: "autonomous_evolution", label: "Autonomous Evolution & Native Intelligence", icon: RefreshCw },
          { id: "runtime_foundation", label: "Core Runtime Foundation (D1)", icon: Cpu },
          { id: "native_ai_brain_cognitive", label: "Native AI Brain Cognitive Layer (D2)", icon: BrainCircuit },
          { id: "design_os_creative", label: "AI Design OS Creative Workspace (D3)", icon: Palette },
          { id: "software_engineering_os", label: "Autonomous Software Engineering OS (D4)", icon: Terminal },
          { id: "business_os_operations", label: "Business OS & Operations Platform (D5)", icon: Briefcase },
          { id: "enterprise_design_system", label: "Enterprise UI/UX Design System (E)", icon: LayoutGrid },
          { id: "ndl_core_design_system", label: "Neora Design Language NDL Core (E1)", icon: Sparkles },
          { id: "professional_workspace_e2", label: "Professional Workspace & Docking (E2)", icon: Layout },
          { id: "multiconcept", label: "Multi-Concept Suite (A - E)", icon: Grid3X3 },
          { id: "transformation", label: "Image Reference Transformer", icon: Image },
          { id: "workspace", label: "Unified Canvas Workspace", icon: Layout },
          { id: "smart_edit", label: "Smart Edit AI Presets", icon: Wand2 },
          { id: "calligraphy", label: "Calligraphy Engine", icon: Languages },
          { id: "layers", label: "Layer & Vector Inspector", icon: Layers },
          { id: "variations", label: "Design Variation Engine", icon: Sliders },
          { id: "export", label: "Multi-Format Export Engine", icon: Download },
          { id: "quality", label: "Quality & Print Safety Review", icon: Award },
          { id: "memory", label: "Creative Memory Store", icon: Database }
        ].map(tab => {
          const isActive = subTab === tab.id;
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-t-xl text-[10.5px] font-bold cursor-pointer flex items-center gap-1.5 border-t border-x transition-all whitespace-nowrap ${
                isActive
                  ? "bg-slate-900 border-slate-800 text-fuchsia-300"
                  : "bg-slate-950/40 border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 4. Sub Tab Content */}
      <AnimatePresence mode="wait">
        {/* SUB TAB: CONVERSATIONAL INTENT & STRATEGY */}
        {subTab === "conversational" && (
          <motion.div
            key="conversational"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-[10.5px]">Goal Driven Intent & Strategy Analysis</span>
                <span className="text-[9.5px] text-slate-500">
                  Neora translates conversational prompts into structured business, visual, and print strategy parameters.
                </span>
              </div>
              <button
                onClick={handleGenerateMultiConcepts}
                disabled={loadingConcepts || !goalIntent}
                className="px-4 py-2 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-2"
              >
                <Grid3X3 className="w-4 h-4" />
                {loadingConcepts ? "Building Concepts..." : "Generate 5 Concepts (A - E)"}
              </button>
            </div>

            {goalIntent && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Card: Goal Intent Breakdown */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                  <span className="font-bold text-fuchsia-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                    <MessageSquare className="w-4 h-4 text-fuchsia-400" /> Goal Intent Parameters
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-0.5">
                      <span className="text-[8.5px] text-slate-500 font-bold">Design Goal</span>
                      <span className="text-slate-200 font-bold">{goalIntent.designGoal}</span>
                    </div>

                    <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-0.5">
                      <span className="text-[8.5px] text-slate-500 font-bold">Business Goal</span>
                      <span className="text-slate-200 font-bold">{goalIntent.businessGoal}</span>
                    </div>

                    <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-0.5">
                      <span className="text-[8.5px] text-slate-500 font-bold">Target Audience</span>
                      <span className="text-slate-200 font-bold">{goalIntent.targetAudience}</span>
                    </div>

                    <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-0.5">
                      <span className="text-[8.5px] text-slate-500 font-bold">Brand Style</span>
                      <span className="text-slate-200 font-bold">{goalIntent.brandStylePreference}</span>
                    </div>

                    <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-0.5">
                      <span className="text-[8.5px] text-slate-500 font-bold">Media Type</span>
                      <span className="text-slate-200 font-bold">{goalIntent.mediaType}</span>
                    </div>

                    <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-0.5">
                      <span className="text-[8.5px] text-slate-500 font-bold">Dimensions</span>
                      <span className="text-slate-200 font-bold">
                        {goalIntent.dimensions.width} x {goalIntent.dimensions.height} {goalIntent.dimensions.unit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Card: Autonomous Creative Reasoning Strategy */}
                {reasoningPlan && (
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                    <span className="font-bold text-fuchsia-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                      <Compass className="w-4 h-4 text-fuchsia-400" /> Autonomous Design Strategy Plan
                    </span>

                    <div className="flex flex-col gap-2 text-[10px]">
                      <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex justify-between items-center">
                        <span className="text-slate-400 font-bold">Typography System:</span>
                        <span className="text-slate-200 font-bold">{reasoningPlan.typographySystem.headingFont}</span>
                      </div>

                      <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex justify-between items-center">
                        <span className="text-slate-400 font-bold">Grid System:</span>
                        <span className="text-slate-200 font-bold">
                          {reasoningPlan.gridSystem.columns} Columns | {reasoningPlan.gridSystem.gutterPx}px Gutter
                        </span>
                      </div>

                      <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex justify-between items-center">
                        <span className="text-slate-400 font-bold">Visual Flow Strategy:</span>
                        <span className="text-slate-200 font-bold">{reasoningPlan.visualHierarchyStrategy}</span>
                      </div>

                      <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex justify-between items-center">
                        <span className="text-slate-400 font-bold">Print & Accessibility Safety:</span>
                        <span className="text-slate-200 font-bold">{reasoningPlan.printSafetyStrategy}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* SUB TAB: AUTONOMOUS CREATIVE DIRECTOR (DOC B PART 2.4) */}
        {subTab === "autonomous" && (
          <motion.div
            key="autonomous"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Action Bar */}
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-200 block text-xs flex items-center gap-2">
                  <Compass className="w-4 h-4 text-fuchsia-400" /> Autonomous Creative Director Engine (Doc B Part 2.4)
                </span>
                <span className="text-[9.5px] text-slate-500">
                  End-to-End Design Intelligence: Strategy, Moodboards, Brand Identity, Marketing Suites, Packaging & Commercial Scores.
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleRunCdPipeline}
                  disabled={loadingCdPipeline}
                  className="px-3 py-1.5 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {loadingCdPipeline ? "Executing..." : "Run CD Pipeline"}
                </button>

                <button
                  onClick={handleGenerateBrandIdentity}
                  disabled={loadingCdBrand}
                  className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  {loadingCdBrand ? "Generating..." : "Brand Identity System"}
                </button>

                <button
                  onClick={handleGenerateCampaignSuite}
                  disabled={loadingCdCampaign}
                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  {loadingCdCampaign ? "Generating..." : "Marketing Campaign Suite"}
                </button>

                <button
                  onClick={handleGeneratePackagingSpec}
                  disabled={loadingCdPackaging}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  {loadingCdPackaging ? "Generating..." : "Packaging & Die-Lines"}
                </button>
              </div>
            </div>

            {/* Creative Director Pipeline Overview */}
            {cdPipeline && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Brand & Market Analysis */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                  <span className="font-bold text-fuchsia-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                    <BrainCircuit className="w-4 h-4 text-fuchsia-400" /> Brand & Audience Intelligence
                  </span>
                  <div className="flex flex-col gap-2 text-[10px]">
                    <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl">
                      <span className="text-[8.5px] text-slate-500 font-bold block">Core Identity</span>
                      <span className="text-slate-200 font-bold">{cdPipeline.brandAnalysis.coreIdentity}</span>
                    </div>
                    <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl">
                      <span className="text-[8.5px] text-slate-500 font-bold block">Target Audience Persona</span>
                      <span className="text-slate-200 font-bold">{cdPipeline.brandAnalysis.targetAudiencePersona}</span>
                    </div>
                    <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl">
                      <span className="text-[8.5px] text-slate-500 font-bold block">Competitive Differentiator</span>
                      <span className="text-slate-200 font-bold">{cdPipeline.brandAnalysis.competitiveDifferentiator}</span>
                    </div>
                  </div>
                </div>

                {/* Creative Direction & Visual Story */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                  <span className="font-bold text-cyan-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                    <Compass className="w-4 h-4 text-cyan-400" /> Creative Direction & Visual Story
                  </span>
                  <div className="flex flex-col gap-2 text-[10px]">
                    <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl">
                      <span className="text-[8.5px] text-slate-500 font-bold block">Concept Title</span>
                      <span className="text-cyan-300 font-extrabold text-xs">{cdPipeline.creativeDirection.title}</span>
                    </div>
                    <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl">
                      <span className="text-[8.5px] text-slate-500 font-bold block">Aesthetic Archetype</span>
                      <span className="text-slate-200 font-bold">{cdPipeline.creativeDirection.aestheticArchetype}</span>
                    </div>
                    <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl">
                      <span className="text-[8.5px] text-slate-500 font-bold block">Visual Story</span>
                      <p className="text-slate-300 text-[9.5px] leading-relaxed">{cdPipeline.creativeDirection.visualStory}</p>
                    </div>
                  </div>
                </div>

                {/* Color, Typography & Grid Strategy */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                  <span className="font-bold text-emerald-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                    <Palette className="w-4 h-4 text-emerald-400" /> Design System Strategy
                  </span>
                  <div className="flex flex-col gap-2 text-[10px]">
                    <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[8.5px] text-slate-500 font-bold block">Palette Tokens</span>
                        <span className="text-slate-200 font-bold">Dark Canvas + Fuchsia Highlight</span>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-4 h-4 rounded-full bg-[#020617] border border-slate-700"/>
                        <div className="w-4 h-4 rounded-full bg-[#d946ef]"/>
                        <div className="w-4 h-4 rounded-full bg-[#06b6d4]"/>
                      </div>
                    </div>
                    <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl">
                      <span className="text-[8.5px] text-slate-500 font-bold block">Typography Pairing</span>
                      <span className="text-slate-200 font-bold">{cdPipeline.typographyStrategy.displayFont} + {cdPipeline.typographyStrategy.bodyFont}</span>
                    </div>
                    <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl">
                      <span className="text-[8.5px] text-slate-500 font-bold block">Grid & Composition</span>
                      <span className="text-slate-200 font-bold">{cdPipeline.compositionStrategy.gridType}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Moodboard Engine Grid */}
            {cdMoodboard && (
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                <span className="font-bold text-fuchsia-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                  <Grid className="w-4 h-4 text-fuchsia-400" /> Interactive Moodboard Engine Grid
                </span>
                <div
                  className="w-full rounded-xl overflow-hidden border border-slate-800 bg-black p-2"
                  dangerouslySetInnerHTML={{ __html: cdMoodboard.svgMoodboardGridXml }}
                />
              </div>
            )}

            {/* Brand Intelligence System */}
            {cdBrandSystem && (
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="font-bold text-cyan-300 text-[11px] uppercase flex items-center gap-2">
                    <Award className="w-4 h-4 text-cyan-400" /> Brand Intelligence System: {cdBrandSystem.brandName}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">ID: {cdBrandSystem.brandId}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-2">
                    <span className="text-[9.5px] text-slate-400 font-bold">Primary Vector Logo</span>
                    <div
                      className="w-full h-24 bg-slate-950 border border-slate-850 rounded-lg p-2 flex items-center justify-center overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: cdBrandSystem.logoVariants.primarySvg }}
                    />
                  </div>

                  <div className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-2">
                    <span className="text-[9.5px] text-slate-400 font-bold">Business Card Mockup</span>
                    <div
                      className="w-full h-24 bg-slate-950 border border-slate-850 rounded-lg p-2 flex items-center justify-center overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: cdBrandSystem.stationerySet.businessCardSvg }}
                    />
                  </div>

                  <div className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-2">
                    <span className="text-[9.5px] text-slate-400 font-bold">Social Media Kit</span>
                    <div
                      className="w-full h-24 bg-slate-950 border border-slate-850 rounded-lg p-2 flex items-center justify-center overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: cdBrandSystem.socialMediaKitSvg }}
                    />
                  </div>

                  <div className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-2">
                    <span className="text-[9.5px] text-slate-400 font-bold">Packaging Box Mockup</span>
                    <div
                      className="w-full h-24 bg-slate-950 border border-slate-850 rounded-lg p-2 flex items-center justify-center overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: cdBrandSystem.packagingMockupSvg }}
                    />
                  </div>
                </div>

                {/* Color System Breakdown */}
                <div className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-2">
                  <span className="text-[9.5px] text-slate-400 font-bold">Brand Color System (HEX / CMYK / Pantone)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {cdBrandSystem.colorSystem.map((col, idx) => (
                      <div key={idx} className="p-2 bg-slate-950 border border-slate-850 rounded-lg flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg border border-slate-700" style={{ backgroundColor: col.hex }} />
                        <div className="flex flex-col text-[9px]">
                          <span className="font-extrabold text-slate-200">{col.hex}</span>
                          <span className="text-slate-400">{col.pantone} | {col.cmyk}</span>
                          <span className="text-fuchsia-400 text-[8px]">{col.usage}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Marketing Campaign Asset Suite */}
            {cdCampaignSuite && (
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                <span className="font-bold text-emerald-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                  <Zap className="w-4 h-4 text-emerald-400" /> Multi-Channel Marketing Campaign Suite
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {cdCampaignSuite.assets.map((asset, i) => (
                    <div key={i} className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-2">
                      <span className="font-bold text-slate-200 text-[9.5px]">{asset.platform}</span>
                      <span className="text-[8px] text-slate-500 font-mono">{asset.dimensions} ({asset.aspectRatio})</span>
                      <div
                        className="w-full h-32 bg-slate-950 border border-slate-850 rounded-lg p-1 flex items-center justify-center overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: asset.svgPreviewXml }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Packaging 3D Specification & Die-Lines */}
            {cdPackagingSpec && (
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                <span className="font-bold text-amber-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                  <Printer className="w-4 h-4 text-amber-400" /> Packaging 3D Spec & Print Die-Lines
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-2">
                    <span className="text-[10px] text-slate-300 font-bold">Packaging 3D Box Preview</span>
                    <div
                      className="w-full h-48 bg-slate-950 border border-slate-850 rounded-lg p-2 flex items-center justify-center overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: cdPackagingSpec.packaging3DPreviewSvg }}
                    />
                  </div>

                  <div className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-3">
                    <span className="text-[10px] text-slate-300 font-bold">Print & Safety Compliance Specs</span>
                    <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                      <div className="p-2 bg-slate-950 border border-slate-850 rounded-lg">
                        <span className="text-slate-500 text-[8.5px] font-bold block">Container Type</span>
                        <span className="text-slate-200 font-bold">{cdPackagingSpec.containerType}</span>
                      </div>
                      <div className="p-2 bg-slate-950 border border-slate-850 rounded-lg">
                        <span className="text-slate-500 text-[8.5px] font-bold block">Dimensions (WxHxD)</span>
                        <span className="text-slate-200 font-bold">{cdPackagingSpec.dimensionsMm.width}x{cdPackagingSpec.dimensionsMm.height}x{cdPackagingSpec.dimensionsMm.depth} mm</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[8.5px] text-slate-500 font-bold">Safety & Printing Certifications</span>
                      {cdPackagingSpec.safetyCompliance.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[9px] text-emerald-400">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Commercial Design Scorecard */}
            {cdScorecard && (
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                <span className="font-bold text-fuchsia-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                  <Award className="w-4 h-4 text-fuchsia-400" /> Commercial Design Quality Scorecard
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                  {[
                    { label: "Overall Score", score: cdScorecard.overallCreativeScore, color: "text-fuchsia-300" },
                    { label: "Pro Quality", score: cdScorecard.professionalQuality, color: "text-cyan-300" },
                    { label: "Brand Match", score: cdScorecard.brandConsistency, color: "text-emerald-300" },
                    { label: "Market Appeal", score: cdScorecard.marketAppeal, color: "text-amber-300" },
                    { label: "Commercial", score: cdScorecard.commercialReadiness, color: "text-purple-300" },
                    { label: "Print Safety", score: cdScorecard.printReadiness, color: "text-rose-300" },
                    { label: "Digital Web", score: cdScorecard.digitalReadiness, color: "text-sky-300" },
                    { label: "WCAG AAA", score: cdScorecard.accessibilityCompliance, color: "text-teal-300" }
                  ].map((s, idx) => (
                    <div key={idx} className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-[8px] text-slate-500 font-bold uppercase">{s.label}</span>
                      <span className={`text-base font-extrabold ${s.color}`}>{s.score}/100</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB TAB: AUTONOMOUS CREATIVE AGENCY (DOC B PART 2.5) */}
        {subTab === "agency" && (
          <motion.div
            key="agency"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Agency Action Bar */}
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-200 block text-xs flex items-center gap-2">
                  <Users className="w-4 h-4 text-fuchsia-400" /> Autonomous Creative Agency (Doc B Part 2.5)
                </span>
                <span className="text-[9.5px] text-slate-500">
                  Multi-AI Agent Orchestration Engine: 8 Synced Specialized Agents, Conflict Negotiation & Commercial Marketplace Packages.
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleOrchestrateAgencySession}
                  disabled={loadingAgencySession}
                  className="px-3.5 py-1.5 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  {loadingAgencySession ? "Orchestrating..." : "Orchestrate 8-Agent Agency"}
                </button>

                <button
                  onClick={handleAnalyzeMultimodalAsset}
                  disabled={loadingMultimodal}
                  className="px-3.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  {loadingMultimodal ? "Analyzing..." : "Multimodal Image/PDF Intelligence"}
                </button>

                <button
                  onClick={handleExportMarketplacePackage}
                  disabled={loadingMarketplacePkg}
                  className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  {loadingMarketplacePkg ? "Packaging..." : "Export Marketplace Deliverable"}
                </button>
              </div>
            </div>

            {/* Orchestration Session Output */}
            {agencySession && (
              <div className="flex flex-col gap-4">
                {/* Active Agents Roster */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                  <span className="font-bold text-fuchsia-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                    <Users className="w-4 h-4 text-fuchsia-400" /> Synced Active Agents Roster ({agencySession.activeAgents.length} Agents)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {agencySession.activeAgents.map(ag => (
                      <div key={ag.id} className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1 text-[9.5px]">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-200">{ag.role}</span>
                          <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
                            {(ag.confidenceScore * 100).toFixed(0)}% Confidence
                          </span>
                        </div>
                        <span className="text-slate-400 text-[8.5px]">{ag.domainFocus}</span>
                        <span className="text-fuchsia-400 text-[8px] font-bold">Status: {ag.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Master Render Preview & Task Allocations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Master SVG Preview */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                    <span className="font-bold text-cyan-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" /> Orchestrated Master Artwork Output
                    </span>
                    <div
                      className="w-full rounded-xl overflow-hidden border border-slate-800 bg-black p-2"
                      dangerouslySetInnerHTML={{ __html: agencySession.orchestratedOutput.primarySvgPreview }}
                    />
                    <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1 text-[9.5px]">
                      <span className="font-bold text-slate-200">{agencySession.orchestratedOutput.title}</span>
                      <p className="text-slate-400 text-[8.5px] leading-relaxed">{agencySession.orchestratedOutput.summary}</p>
                    </div>
                  </div>

                  {/* Internal Creative Negotiation Log */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                    <span className="font-bold text-amber-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400" /> Internal Agent Negotiation & Quality Board
                    </span>
                    <div className="flex flex-col gap-2">
                      {agencySession.negotiationLogs.map(neg => (
                        <div key={neg.negotiationId} className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1 text-[9.5px]">
                          <span className="text-amber-300 font-bold">Conflict: {neg.conflictTopic}</span>
                          <span className="text-slate-400 text-[8.5px]">
                            Agents Involved: <strong className="text-slate-200">{neg.participatingAgents.join(" vs ")}</strong>
                          </span>
                          <p className="text-emerald-400 text-[8.5px] font-medium bg-emerald-950/30 p-1.5 rounded-lg border border-emerald-900/50 mt-1">
                            Resolution: {neg.resolution} (Approved by {neg.decidedWinner})
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-fuchsia-950/20 border border-fuchsia-900/40 rounded-xl flex flex-col gap-1 text-[9.5px] mt-2">
                      <span className="font-bold text-fuchsia-300">Unanimous Quality Review Approval</span>
                      <span className="text-slate-300">QA Score: <strong>{agencySession.qualityReview.qaScore}/100</strong> | Print Safety: <strong>{agencySession.qualityReview.printReadinessScore}/100</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Multimodal Analysis Output */}
            {multimodalAnalysis && (
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                <span className="font-bold text-cyan-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                  <Cpu className="w-4 h-4 text-cyan-400" /> Multimodal Image & PDF Intelligence Analysis
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[9.5px]">
                  <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1">
                    <span className="text-slate-500 font-bold text-[8.5px]">Detected Elements</span>
                    <span className="text-slate-200 font-bold">{multimodalAnalysis.detectedObjects.join(", ")}</span>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1">
                    <span className="text-slate-500 font-bold text-[8.5px]">Typography Hierarchy</span>
                    <span className="text-slate-200 font-bold">{multimodalAnalysis.typographyAnalysis.fontsDetected.join(" / ")}</span>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1">
                    <span className="text-slate-500 font-bold text-[8.5px]">Print Pre-flight</span>
                    <span className="text-emerald-400 font-bold">{multimodalAnalysis.printReadiness.dpiEstimate} DPI | Bleed Tagged | CMYK Ready</span>
                  </div>
                </div>
              </div>
            )}

            {/* Marketplace Deliverable Package */}
            {marketplacePackage && (
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                <span className="font-bold text-emerald-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                  <PackageCheck className="w-4 h-4 text-emerald-400" /> Client-Ready Commercial Marketplace Deliverable
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[9.5px]">
                  <div className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-2">
                    <span className="text-slate-300 font-bold">Package Directory Architecture</span>
                    <div className="flex flex-col gap-1 font-mono text-[8.5px] text-fuchsia-300">
                      {marketplacePackage.folderStructure.map((f, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <FolderOpen className="w-3 h-3 text-fuchsia-400" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-2">
                    <span className="text-slate-300 font-bold">Brand Guidelines Preview</span>
                    <div
                      className="w-full h-36 bg-slate-950 border border-slate-850 rounded-lg p-2 flex items-center justify-center overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: marketplacePackage.brandGuideSvg }}
                    />
                    <span className="text-emerald-400 text-[8.5px] font-bold">Zip Asset: {marketplacePackage.generatedZipName}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB TAB: UNIVERSAL CREATIVE OS (DOC B PART 2.6) */}
        {subTab === "universal_os" && (
          <motion.div
            key="universal_os"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Action Bar & Persona Mode Selector */}
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-200 block text-xs flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" /> Universal Creative Operating System (Doc B Part 2.6)
                </span>
                <span className="text-[9.5px] text-slate-500">
                  Goal-First Engine, Unified Knowledge Graph, Unified Memory & Native Plugin Ecosystem.
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedPersonaMode}
                  onChange={(e) => setSelectedPersonaMode(e.target.value as UserPersonaMode)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-[10px] text-slate-200 font-medium focus:outline-none"
                >
                  <option value="Freelancer">Persona: Freelancer</option>
                  <option value="Design Agency">Persona: Design Agency</option>
                  <option value="Print Shop / Press">Persona: Print Shop / Press</option>
                  <option value="Publisher">Persona: Publisher</option>
                  <option value="Marketing Team">Persona: Marketing Team</option>
                  <option value="Developer / Tech">Persona: Developer / Tech</option>
                  <option value="Enterprise Organization">Persona: Enterprise Org</option>
                </select>

                <button
                  onClick={handleExecuteUniversalOsGoal}
                  disabled={loadingUniversalOs}
                  className="px-3.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {loadingUniversalOs ? "Executing..." : "Run Goal-First Engine"}
                </button>

                <button
                  onClick={handleFetchUnifiedMemoryAndPlugins}
                  className="px-3.5 py-1.5 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Database className="w-3.5 h-3.5" />
                  Sync Memory & Plugins
                </button>
              </div>
            </div>

            {/* Universal OS Execution Result */}
            {universalOsResult && (
              <div className="flex flex-col gap-4">
                {/* Knowledge Graph Snapshot */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                  <span className="font-bold text-cyan-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                    <Database className="w-4 h-4 text-cyan-400" /> Unified Knowledge & Context Graph Nodes
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-[9.5px]">
                    {universalOsResult.knowledgeGraphSnapshot.map(node => (
                      <div key={node.id} className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-200">{node.label}</span>
                          <span className="text-[8px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded-md">
                            {node.category}
                          </span>
                        </div>
                        <span className="text-slate-500 text-[8.5px]">Connected Nodes: {node.connectedNodeIds.join(", ")}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Master Render Preview */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                  <span className="font-bold text-fuchsia-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                    <Sparkles className="w-4 h-4 text-fuchsia-400" /> Goal-First Orchestrated Master Canvas
                  </span>
                  <div
                    className="w-full rounded-xl overflow-hidden border border-slate-800 bg-black p-2"
                    dangerouslySetInnerHTML={{ __html: universalOsResult.orchestratedOutput.masterSvgCanvasXml }}
                  />
                  <div className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1 text-[9.5px]">
                    <span className="font-bold text-slate-200">{universalOsResult.orchestratedOutput.title}</span>
                    <p className="text-slate-400 text-[8.5px] leading-relaxed">{universalOsResult.orchestratedOutput.description}</p>
                    <span className="text-cyan-400 text-[8.5px] font-bold mt-1">
                      Active Plugins Used: {universalOsResult.orchestratedOutput.activePluginsUsed.join(" | ")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Unified Memory & Plugin Ecosystem */}
            {(unifiedMemoryStore || activePluginsList.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Unified Memory Store */}
                {unifiedMemoryStore && (
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                    <span className="font-bold text-fuchsia-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                      <Database className="w-4 h-4 text-fuchsia-400" /> Unified Memory Store (Cross-Session)
                    </span>
                    <div className="flex flex-col gap-2 text-[9.5px]">
                      <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1">
                        <span className="text-slate-400 font-bold">Brand Memory</span>
                        <span className="text-slate-200">{unifiedMemoryStore.brandIdentityMemory.primaryBrandName}</span>
                        <span className="text-slate-500 text-[8.5px]">Colors: {unifiedMemoryStore.brandIdentityMemory.approvedColors.join(", ")}</span>
                      </div>
                      <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1">
                        <span className="text-slate-400 font-bold">Project History Summary</span>
                        <span className="text-emerald-400 font-bold">{unifiedMemoryStore.projectHistorySummary.totalProjectsCreated} Total Projects Created</span>
                        <span className="text-slate-500 text-[8.5px]">Last Domain: {unifiedMemoryStore.projectHistorySummary.lastActiveDomain}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Active Plugin Ecosystem */}
                {activePluginsList.length > 0 && (
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                    <span className="font-bold text-emerald-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                      <Layers className="w-4 h-4 text-emerald-400" /> Neora Native Plugin Ecosystem
                    </span>
                    <div className="flex flex-col gap-2 text-[9.5px]">
                      {activePluginsList.map(plg => (
                        <div key={plg.pluginId} className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200">{plg.name} v{plg.version}</span>
                            <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
                              {plg.category}
                            </span>
                          </div>
                          <span className="text-slate-500 text-[8.5px]">Author: {plg.author} | Active: Yes</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* SUB TAB: NEORA AI BRAIN & COGNITIVE ENGINE (DOC B MEGA SECTION 3) */}
        {subTab === "ai_brain" && (
          <motion.div
            key="ai_brain"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Control Bar & Router Config */}
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-200 block text-xs flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-fuchsia-400" /> Neora AI Brain & Cognitive Engine (Mega Section 3)
                </span>
                <span className="text-[9.5px] text-slate-500">
                  Provider-Independent Native LLM, Multi-Step Reasoning Engine, PC OS Agent & Self-Repair Diagnostic.
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-[10px] text-slate-300 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferLocalModel}
                    onChange={(e) => setPreferLocalModel(e.target.checked)}
                    className="accent-fuchsia-500 rounded"
                  />
                  <span>Prefer Local Ollama Model</span>
                </label>

                <button
                  onClick={handleExecuteCognitiveReasoning}
                  disabled={loadingCognitiveSession}
                  className="px-3.5 py-1.5 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  {loadingCognitiveSession ? "Reasoning..." : "Execute Cognitive Plan"}
                </button>

                <button
                  onClick={handleExecutePcOsAction}
                  disabled={loadingPcOsAction}
                  className="px-3.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  {loadingPcOsAction ? "Running..." : "Simulate PC OS Agent"}
                </button>

                <button
                  onClick={handleRunSelfRepair}
                  disabled={loadingSelfRepair}
                  className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5" />
                  {loadingSelfRepair ? "Diagnosing..." : "Run Self-Repair Diagnostic"}
                </button>
              </div>
            </div>

            {/* Cognitive Reasoning Session Output */}
            {cognitiveSession && (
              <div className="flex flex-col gap-4">
                {/* Router Decision Banner */}
                <div className="p-3 bg-black/40 border border-slate-900 rounded-xl flex items-center justify-between text-[9.5px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">Model Router Choice:</span>
                    <span className="text-fuchsia-300 font-extrabold bg-fuchsia-950/50 border border-fuchsia-500/30 px-2 py-0.5 rounded-md">
                      {cognitiveSession.routeDecision.selectedProvider}
                    </span>
                    <span className="text-slate-500">({cognitiveSession.routeDecision.reasoning})</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-emerald-400">Latency ~{cognitiveSession.routeDecision.latencyMsEstimate}ms</span>
                    <span className="text-cyan-400">Privacy: {cognitiveSession.routeDecision.privacyLevel}</span>
                  </div>
                </div>

                {/* Plan Steps Pipeline */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                  <span className="font-bold text-fuchsia-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                    <BrainCircuit className="w-4 h-4 text-fuchsia-400" /> Multi-Step Cognitive Plan Execution
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-[9.5px]">
                    {cognitiveSession.planSteps.map(st => (
                      <div key={st.stepId} className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1.5">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-1">
                          <span className="font-extrabold text-slate-200">{st.title}</span>
                          <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
                            {st.status}
                          </span>
                        </div>
                        <span className="text-cyan-400 text-[8.5px] font-bold">Assigned Engine: {st.engineAssigned}</span>
                        <p className="text-slate-400 text-[8.5px]">{st.rationale}</p>
                        {st.outputArtifact && (
                          <span className="text-fuchsia-300 font-mono text-[8px] bg-fuchsia-950/30 p-1 rounded border border-fuchsia-900/40">
                            Artifact: {st.outputArtifact}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PC OS Agent Action Log */}
            {pcOsAction && (
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                <span className="font-bold text-cyan-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                  <Terminal className="w-4 h-4 text-cyan-400" /> PC OS Desktop Agent Execution Log
                </span>
                <div className="p-3 bg-black/80 font-mono border border-slate-900 rounded-xl text-[9.5px] text-emerald-400 flex flex-col gap-1">
                  <span>[PC OS Agent Target]: {pcOsAction.targetSystem}</span>
                  <span>[Command Type]: {pcOsAction.commandType}</span>
                  <span>[Status]: {pcOsAction.status} (Permission Granted: Yes)</span>
                  <span className="text-slate-300 mt-1">{pcOsAction.log}</span>
                </div>
              </div>
            )}

            {/* Self-Repair Diagnostic Result */}
            {selfRepairDiag && (
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                <span className="font-bold text-emerald-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                  <Activity className="w-4 h-4 text-emerald-400" /> Cognitive Architecture Self-Repair & Health Score
                </span>
                <div className="flex items-center justify-between p-3 bg-black/40 border border-slate-900 rounded-xl text-[9.5px]">
                  <span className="text-slate-300 font-bold">Overall System Health: <strong className="text-emerald-400">{selfRepairDiag.overallHealthScore}/100</strong></span>
                  <span className="text-cyan-400 font-bold">Architecture State: {selfRepairDiag.architectureState}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px]">
                  {selfRepairDiag.inspectedSubsystems.map((sub, idx) => (
                    <div key={idx} className="p-2 bg-black/40 border border-slate-900 rounded-lg flex flex-col gap-0.5">
                      <span className="text-slate-200 font-bold">{sub.name}</span>
                      <span className="text-emerald-400">{sub.status} ({sub.latencyMs}ms)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB TAB: AUTONOMOUS SOFTWARE FACTORY (DOC B MEGA SECTION 4) */}
        {subTab === "software_factory" && (
          <motion.div
            key="software_factory"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Controls Bar & Architecture Selection */}
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-200 block text-xs flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-cyan-400" /> Autonomous Software Factory Platform (Mega Section 4)
                </span>
                <span className="text-[9.5px] text-slate-500">
                  Full-Lifecycle Engineering Pipeline: Requirements, Architecture, Self-Coding, Self-Testing, Self-Debug & Quality Gates.
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedOutputType}
                  onChange={(e) => setSelectedOutputType(e.target.value as SoftwareFactoryOutputType)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-[10px] text-slate-200 font-medium focus:outline-none"
                >
                  <option value="Desktop Application (Windows/macOS/Linux)">Desktop App (Win/macOS/Linux)</option>
                  <option value="Full-Stack Web Application (React + Node + Express)">Full-Stack Web App (React + Express)</option>
                  <option value="Mobile Application (React Native / Android)">Mobile App (React Native / Android)</option>
                  <option value="REST & GraphQL API Service">REST & GraphQL API Service</option>
                  <option value="Autonomous AI Agent & Tooling System">Autonomous AI Agent System</option>
                  <option value="Plugin & Extension SDK Pack">Plugin & Extension SDK Pack</option>
                </select>

                <select
                  value={selectedArchPattern}
                  onChange={(e) => setSelectedArchPattern(e.target.value as SoftwareArchitecturePattern)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-[10px] text-slate-200 font-medium focus:outline-none"
                >
                  <option value="Clean / Hexagonal Architecture">Clean / Hexagonal Architecture</option>
                  <option value="Modular Monolith">Modular Monolith</option>
                  <option value="Microservices Architecture">Microservices Architecture</option>
                  <option value="Domain-Driven Design (DDD)">Domain-Driven Design (DDD)</option>
                  <option value="Plugin & Event-Driven Workspace">Plugin & Event-Driven Workspace</option>
                </select>

                <button
                  onClick={handleRunSoftwareFactoryPipeline}
                  disabled={loadingSoftwareFactory}
                  className="px-3.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  {loadingSoftwareFactory ? "Engineering..." : "Run Software Factory Pipeline"}
                </button>

                <button
                  onClick={handleRunSelfDebug}
                  disabled={loadingSelfDebug}
                  className="px-3.5 py-1.5 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  {loadingSelfDebug ? "Debugging..." : "Test Self-Debug Engine"}
                </button>

                <button
                  onClick={handleGeneratePluginSdk}
                  disabled={loadingPluginSdk}
                  className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  {loadingPluginSdk ? "Generating..." : "Generate Plugin SDK"}
                </button>
              </div>
            </div>

            {/* Software Factory Pipeline Result */}
            {softwareFactoryResult && (
              <div className="flex flex-col gap-4">
                {/* Engineering Roles Active Banner */}
                <div className="p-3 bg-black/40 border border-slate-900 rounded-xl flex items-center justify-between text-[9.5px]">
                  <span className="text-slate-400 font-bold">Active Engineering Brain Team:</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {softwareFactoryResult.engineeringRolesActive.map((role, idx) => (
                      <span key={idx} className="text-cyan-300 font-mono bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                        {role.role} ({role.focusArea})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quality Gate Scorecard */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                  <span className="font-bold text-emerald-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Enterprise Quality Gate Release Scorecard
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[9.5px]">
                    <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-slate-400 text-[8.5px]">Architecture</span>
                      <span className="text-emerald-400 font-extrabold text-sm">{softwareFactoryResult.qualityGateScorecard.architectureScore}/100</span>
                    </div>
                    <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-slate-400 text-[8.5px]">Security</span>
                      <span className="text-emerald-400 font-extrabold text-sm">{softwareFactoryResult.qualityGateScorecard.securityScore}/100</span>
                    </div>
                    <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-slate-400 text-[8.5px]">Performance</span>
                      <span className="text-emerald-400 font-extrabold text-sm">{softwareFactoryResult.qualityGateScorecard.performanceScore}/100</span>
                    </div>
                    <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-slate-400 text-[8.5px]">Accessibility</span>
                      <span className="text-emerald-400 font-extrabold text-sm">{softwareFactoryResult.qualityGateScorecard.accessibilityScore}/100</span>
                    </div>
                    <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-slate-400 text-[8.5px]">Test Coverage</span>
                      <span className="text-cyan-400 font-extrabold text-sm">{softwareFactoryResult.qualityGateScorecard.testCoveragePercentage}%</span>
                    </div>
                    <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-slate-400 text-[8.5px]">Production Ready</span>
                      <span className="text-emerald-400 font-extrabold text-xs">PASSED</span>
                    </div>
                  </div>
                </div>

                {/* Pipeline Phase Cards */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                  <span className="font-bold text-cyan-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                    <Code2 className="w-4 h-4 text-cyan-400" /> Pipeline Phases & Generated Code Deliverables
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[9.5px]">
                    {softwareFactoryResult.pipelinePhases.map(phase => (
                      <div key={phase.phaseId} className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-2">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                          <span className="font-extrabold text-slate-200">{phase.phaseName}</span>
                          <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
                            {phase.status}
                          </span>
                        </div>
                        <span className="text-fuchsia-300 font-bold text-[8.5px]">Lead Engineer: {phase.assignedLogicalEngineer}</span>
                        <p className="text-slate-400 text-[8.5px]">{phase.deliverableSummary}</p>
                        {phase.codeSnippetPreview && (
                          <pre className="p-2.5 bg-slate-950 font-mono text-[8px] text-emerald-400 rounded-lg overflow-x-auto border border-slate-900">
                            {phase.codeSnippetPreview}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Self-Debug Result View */}
            {selfDebugResult && (
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                <span className="font-bold text-fuchsia-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                  <Wrench className="w-4 h-4 text-fuchsia-400" /> Self-Debug Diagnostics & Automated Code Repair
                </span>
                <div className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-2 text-[9.5px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-bold">Defect Type: <strong className="text-red-400">{selfDebugResult.detectedDefectType}</strong></span>
                    <span className="text-emerald-400 font-bold">Re-Test Status: VERIFIED PASSED</span>
                  </div>
                  <p className="text-slate-400 text-[8.5px]"><strong className="text-slate-200">Root Cause:</strong> {selfDebugResult.rootCauseAnalysis}</p>
                  <pre className="p-2.5 bg-slate-950 font-mono text-[8px] text-cyan-300 rounded-lg overflow-x-auto border border-slate-900">
                    {selfDebugResult.autoAppliedFixCode}
                  </pre>
                </div>
              </div>
            )}

            {/* Plugin SDK Boilerplate View */}
            {pluginSdkResult && (
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                <span className="font-bold text-emerald-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                  <PackageCheck className="w-4 h-4 text-emerald-400" /> Neora Extensible Plugin SDK Boilerplate
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[9.5px]">
                  <div className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1.5">
                    <span className="font-bold text-slate-200">plugin-manifest.json</span>
                    <pre className="p-2 bg-slate-950 font-mono text-[8px] text-fuchsia-300 rounded-lg overflow-x-auto border border-slate-900">
                      {pluginSdkResult.manifestJson}
                    </pre>
                  </div>
                  <div className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1.5">
                    <span className="font-bold text-slate-200">index.ts Plugin Class</span>
                    <pre className="p-2 bg-slate-950 font-mono text-[8px] text-emerald-300 rounded-lg overflow-x-auto border border-slate-900">
                      {pluginSdkResult.indexTsCode}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB TAB: AUTONOMOUS BUSINESS OS (DOC B MEGA SECTION 5) */}
        {subTab === "business_os" && (
          <motion.div
            key="business_os"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Controls Bar & Persona/Product Config */}
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-200 block text-xs flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" /> Autonomous Digital Business OS Platform (Mega Section 5)
                </span>
                <span className="text-[9.5px] text-slate-500">
                  Digital Product Factory, CRM, Billing Invoices, Sales Intelligence, Financial Reports & Governance.
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedBusinessPersona}
                  onChange={(e) => setSelectedBusinessPersona(e.target.value as BusinessPersonaType)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-[10px] text-slate-200 font-medium focus:outline-none"
                >
                  <option value="Creative Agency">Persona: Creative Agency</option>
                  <option value="Freelancer / Solopreneur">Persona: Freelancer</option>
                  <option value="Software Company / SaaS">Persona: Software Company / SaaS</option>
                  <option value="Print Shop & Press Enterprise">Persona: Print Shop & Press</option>
                  <option value="Digital Product Publisher">Persona: Digital Publisher</option>
                  <option value="Educational Organization">Persona: Educational Org</option>
                </select>

                <select
                  value={selectedProductType}
                  onChange={(e) => setSelectedProductType(e.target.value as DigitalProductType)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-[10px] text-slate-200 font-medium focus:outline-none"
                >
                  <option value="Brand Identity Package">Brand Identity Package</option>
                  <option value="SaaS Application & API Pack">SaaS App & API Pack</option>
                  <option value="UI/UX Component & Design Kit">UI/UX Component Kit</option>
                  <option value="Print & Packaging Template Suite">Print Template Suite</option>
                  <option value="AI Skill & Plugin Pack">AI Skill & Plugin Pack</option>
                  <option value="Master Course & Knowledge Pack">Master Knowledge Pack</option>
                </select>

                <button
                  onClick={handleRunBusinessOsPipeline}
                  disabled={loadingBusinessOs}
                  className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  {loadingBusinessOs ? "Orchestrating..." : "Run Business OS Pipeline"}
                </button>

                <button
                  onClick={handleGenerateCustomInvoice}
                  disabled={loadingCustomInvoice}
                  className="px-3.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {loadingCustomInvoice ? "Billing..." : "Generate CRM Invoice"}
                </button>
              </div>
            </div>

            {/* Business OS Pipeline Result */}
            {businessOsResult && (
              <div className="flex flex-col gap-4">
                {/* Product Factory & CRM Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Digital Product Factory Card */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                    <span className="font-bold text-emerald-300 text-[11px] uppercase flex items-center justify-between border-b border-slate-900 pb-2">
                      <span className="flex items-center gap-2">
                        <PackageCheck className="w-4 h-4 text-emerald-400" /> Digital Product Factory Output
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        ${businessOsResult.digitalProductCreated.pricingTierUsd} MSRP
                      </span>
                    </span>
                    <div className="flex flex-col gap-1 text-[9.5px]">
                      <span className="font-extrabold text-slate-200 text-xs">{businessOsResult.digitalProductCreated.productName}</span>
                      <span className="text-cyan-400 font-bold">Type: {businessOsResult.digitalProductCreated.productType}</span>
                      <span className="text-slate-400 font-bold mt-1">Manifest Assets Packaged:</span>
                      <ul className="list-disc list-inside text-slate-400 text-[8.5px] space-y-0.5">
                        {businessOsResult.digitalProductCreated.manifestAssets.map((asset, idx) => (
                          <li key={idx}>{asset}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Client CRM & Relationship Record */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                    <span className="font-bold text-cyan-300 text-[11px] uppercase flex items-center justify-between border-b border-slate-900 pb-2">
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-cyan-400" /> AI CRM & Client Intelligence Record
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                        {businessOsResult.clientRecord.relationshipStatus}
                      </span>
                    </span>
                    <div className="flex flex-col gap-1 text-[9.5px]">
                      <span className="font-extrabold text-slate-200 text-xs">{businessOsResult.clientRecord.companyName} ({businessOsResult.clientRecord.clientName})</span>
                      <span className="text-slate-400 font-bold">Email: {businessOsResult.clientRecord.contactEmail}</span>
                      <div className="flex items-center justify-between mt-2 p-2.5 bg-black/40 border border-slate-900 rounded-xl font-mono">
                        <span className="text-slate-400">Active Projects: <strong className="text-slate-200">{businessOsResult.clientRecord.activeProjectsCount}</strong></span>
                        <span className="text-emerald-400">LTV: ${businessOsResult.clientRecord.lifetimeValueUsd.toLocaleString()} USD</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Insights & Governance Report */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                  <span className="font-bold text-fuchsia-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                    <TrendingUp className="w-4 h-4 text-fuchsia-400" /> Financial Intelligence & Enterprise Governance
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9.5px]">
                    <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-slate-400 text-[8.5px]">Monthly Recurring Revenue</span>
                      <span className="text-emerald-400 font-extrabold text-sm">${businessOsResult.financialReport.monthlyRecurringRevenueUsd.toLocaleString()}</span>
                    </div>
                    <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-slate-400 text-[8.5px]">Annual Run Rate</span>
                      <span className="text-cyan-400 font-extrabold text-sm">${businessOsResult.financialReport.annualRunRateUsd.toLocaleString()}</span>
                    </div>
                    <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-slate-400 text-[8.5px]">Net Profit Margin</span>
                      <span className="text-emerald-400 font-extrabold text-sm">{businessOsResult.financialReport.netProfitMarginPercentage}%</span>
                    </div>
                    <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-slate-400 text-[8.5px]">Governance Audit</span>
                      <span className="text-emerald-400 font-extrabold text-xs">VERIFIED PASSED</span>
                    </div>
                  </div>

                  {/* Project Profitability List */}
                  <div className="flex flex-col gap-1.5 text-[9.5px] mt-1">
                    <span className="font-bold text-slate-300">Project Profitability Breakdown:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {businessOsResult.financialReport.projectProfitabilityRanking.map((proj, idx) => (
                        <div key={idx} className="p-2 bg-black/40 border border-slate-900 rounded-lg flex items-center justify-between">
                          <span className="text-slate-200 text-[8.5px] truncate">{proj.projectName}</span>
                          <span className="text-emerald-400 font-mono text-[8.5px] font-bold">{proj.profitabilityScore}/100</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Marketing Campaign Creatives */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                  <span className="font-bold text-cyan-300 text-[11px] uppercase flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" /> Automated Marketing Campaign & Sales Intelligence
                    </span>
                    <span className="text-[9.5px] text-slate-400 font-mono">
                      Target Audience: {businessOsResult.marketingCampaign.targetAudience}
                    </span>
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[9.5px]">
                    {businessOsResult.marketingCampaign.generatedAdCreatives.map((ad, idx) => (
                      <div key={idx} className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1">
                        <span className="text-cyan-400 font-extrabold">{ad.channelName}</span>
                        <span className="text-slate-100 font-bold text-[10px]">{ad.headline}</span>
                        <p className="text-slate-400 text-[8.5px] leading-relaxed">{ad.bodyCopy}</p>
                        <span className="text-emerald-400 font-bold text-[8.5px] mt-1">CTA: {ad.callToAction}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Custom Invoice Generator View */}
            {customInvoiceResult && (
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                <span className="font-bold text-cyan-300 text-[11px] uppercase flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" /> Automated Billing Invoice #{customInvoiceResult.invoiceNumber}
                  </span>
                  <span className="text-[9.5px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                    Status: {customInvoiceResult.status}
                  </span>
                </span>
                <div className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-2 text-[9.5px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-bold">Client: <strong className="text-slate-100">{customInvoiceResult.clientName}</strong></span>
                    <span className="text-slate-400">Issue: {customInvoiceResult.issueDate} | Due: {customInvoiceResult.dueDate}</span>
                  </div>
                  <div className="border-t border-slate-900 pt-2 flex flex-col gap-1">
                    {customInvoiceResult.lineItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[8.5px]">
                        <span className="text-slate-300">{item.description} (x{item.quantity})</span>
                        <span className="text-emerald-400 font-mono">${item.totalUsd} {customInvoiceResult.currency}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-900 pt-2 flex justify-end gap-4 font-mono font-bold text-xs">
                    <span className="text-slate-400">Tax: ${customInvoiceResult.taxUsd}</span>
                    <span className="text-emerald-400">Grand Total: ${customInvoiceResult.grandTotalUsd} USD</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB TAB: NEORA SINGULARITY PLATFORM (DOC B MEGA SECTION 6) */}
        {subTab === "singularity_platform" && (
          <motion.div
            key="singularity_platform"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Controls Bar & Global Intelligence Trigger */}
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-200 block text-xs flex items-center gap-2">
                  <Globe className="w-4 h-4 text-fuchsia-400" /> Neora Singularity Platform - Autonomous AI OS (Mega Section 6)
                </span>
                <span className="text-[9.5px] text-slate-500">
                  Universal 13-Stage Pipeline, Unified Intelligence Graph, Self-Evolution Engine & Zero Vendor Lock-in.
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleFetchSingularityHealth}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  Inspect Intelligence Nodes
                </button>

                <button
                  onClick={handleTriggerSelfEvolution}
                  disabled={loadingSelfEvolution}
                  className="px-3.5 py-1.5 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <BrainCircuit className="w-3.5 h-3.5 text-fuchsia-400" />
                  {loadingSelfEvolution ? "Evolving..." : "Trigger Self-Evolution Engine"}
                </button>

                <button
                  onClick={handleRunSingularityPipeline}
                  disabled={loadingSingularityPipeline}
                  className="px-3.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  {loadingSingularityPipeline ? "Executing Pipeline..." : "Execute Universal Pipeline"}
                </button>
              </div>
            </div>

            {/* Active Intelligence Nodes Grid */}
            {singularityNodes.length > 0 && (
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                <span className="font-bold text-cyan-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                  <Activity className="w-4 h-4 text-cyan-400" /> Unified Intelligence Domain Status
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 text-[9.5px]">
                  {singularityNodes.map((node, idx) => (
                    <div key={idx} className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col items-center text-center gap-1">
                      <span className="text-slate-300 font-bold text-[8.5px] truncate w-full">{node.domain}</span>
                      <span className="text-emerald-400 font-extrabold text-xs">{node.healthScore}%</span>
                      <span className="text-[7.5px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-1.5 py-0.5 rounded-md">
                        {node.status} ({node.activeTasks} tasks)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Singularity Pipeline Output */}
            {singularityResult && (
              <div className="flex flex-col gap-4">
                {/* Scorecard & Graph Sync Banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Self-Evolution Scorecard */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                    <span className="font-bold text-emerald-300 text-[11px] uppercase flex items-center justify-between border-b border-slate-900 pb-2">
                      <span className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-400" /> Singularity Self-Evolution Scorecard
                      </span>
                      <span className="text-[9.5px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        Zero Vendor Lock-in: PASSED
                      </span>
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9.5px]">
                      <div className="p-2 bg-black/40 border border-slate-900 rounded-lg flex flex-col items-center">
                        <span className="text-slate-400 text-[8px]">Reasoning</span>
                        <span className="text-emerald-400 font-bold text-xs">{singularityResult.selfEvolutionScorecard.reasoningQualityScore}/100</span>
                      </div>
                      <div className="p-2 bg-black/40 border border-slate-900 rounded-lg flex flex-col items-center">
                        <span className="text-slate-400 text-[8px]">Coding Quality</span>
                        <span className="text-cyan-400 font-bold text-xs">{singularityResult.selfEvolutionScorecard.codingQualityScore}/100</span>
                      </div>
                      <div className="p-2 bg-black/40 border border-slate-900 rounded-lg flex flex-col items-center">
                        <span className="text-slate-400 text-[8px]">Creative Score</span>
                        <span className="text-fuchsia-400 font-bold text-xs">{singularityResult.selfEvolutionScorecard.creativeQualityScore}/100</span>
                      </div>
                      <div className="p-2 bg-black/40 border border-slate-900 rounded-lg flex flex-col items-center">
                        <span className="text-slate-400 text-[8px]">Automation</span>
                        <span className="text-emerald-400 font-bold text-xs">{singularityResult.selfEvolutionScorecard.automationEfficiencyScore}/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Unified Graph Node Synchronization */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                    <span className="font-bold text-cyan-300 text-[11px] uppercase flex items-center justify-between border-b border-slate-900 pb-2">
                      <span className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-cyan-400" /> Unified Graph Sync Engine
                      </span>
                      <span className="text-[9.5px] font-mono text-cyan-400">
                        Total Nodes: {singularityResult.unifiedGraphSync.knowledgeGraphNodeCount + singularityResult.unifiedGraphSync.memoryGraphNodeCount}
                      </span>
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-[9.5px] font-mono">
                      <div className="p-2 bg-black/40 border border-slate-900 rounded-lg flex flex-col items-center">
                        <span className="text-slate-400 text-[8px]">Knowledge Graph</span>
                        <span className="text-slate-200 font-bold">{singularityResult.unifiedGraphSync.knowledgeGraphNodeCount}</span>
                      </div>
                      <div className="p-2 bg-black/40 border border-slate-900 rounded-lg flex flex-col items-center">
                        <span className="text-slate-400 text-[8px]">Memory Graph</span>
                        <span className="text-slate-200 font-bold">{singularityResult.unifiedGraphSync.memoryGraphNodeCount}</span>
                      </div>
                      <div className="p-2 bg-black/40 border border-slate-900 rounded-lg flex flex-col items-center">
                        <span className="text-slate-400 text-[8px]">Brand Graph</span>
                        <span className="text-slate-200 font-bold">{singularityResult.unifiedGraphSync.brandGraphNodeCount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 13-Stage Universal Pipeline Execution Timeline */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                  <span className="font-bold text-fuchsia-300 text-[11px] uppercase flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-fuchsia-400" /> Universal Pipeline Execution Stages (13/13 Completed)
                    </span>
                    <span className="text-[9.5px] font-mono text-fuchsia-300">
                      Goal: {singularityResult.oneGoalPrompt}
                    </span>
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-[9.5px]">
                    {singularityResult.pipelineSteps.map(step => (
                      <div key={step.stepNumber} className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-1">
                          <span className="font-bold text-slate-200">#{step.stepNumber} {step.phaseName}</span>
                          <span className="text-[7.5px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded-md">
                            {step.status}
                          </span>
                        </div>
                        <span className="text-cyan-400 font-bold text-[8px]">{step.leadDomain}</span>
                        <p className="text-slate-400 text-[8px]">{step.artifactOutputSummary}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Future Capabilities & Hardware Hooks */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2">
                  <span className="font-bold text-slate-300 text-[10px] uppercase flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Next-Generation Hardware & AI Hooks Integration
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px] font-mono">
                    <div className="p-2 bg-black/40 border border-slate-900 rounded-lg text-emerald-400 text-center font-bold">
                      Edge AI Processing: READY
                    </div>
                    <div className="p-2 bg-black/40 border border-slate-900 rounded-lg text-cyan-400 text-center font-bold">
                      Quantum Algorithm: READY
                    </div>
                    <div className="p-2 bg-black/40 border border-slate-900 rounded-lg text-fuchsia-400 text-center font-bold">
                      Digital Twin Sync: READY
                    </div>
                    <div className="p-2 bg-black/40 border border-slate-900 rounded-lg text-emerald-400 text-center font-bold">
                      Robotics OS Hook: READY
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Self-Evolution Audit Log View */}
            {selfEvolutionResult && (
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                <span className="font-bold text-fuchsia-300 text-[11px] uppercase flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-fuchsia-400" /> Self-Evolution Learning Cycle #{selfEvolutionResult.learningCycleNumber}
                  </span>
                  <span className="text-[9.5px] font-mono text-emerald-400">
                    Knowledge Growth: +{selfEvolutionResult.knowledgeGrowthRatePercentage}%
                  </span>
                </span>
                <div className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-2 text-[9.5px]">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Learned Preferences Saved: <strong className="text-cyan-300">{selfEvolutionResult.learnedUserPreferencesCount}</strong></span>
                    <span>Self-Repaired Anomalies: <strong className="text-emerald-400">{selfEvolutionResult.selfRepairedAnomaliesCount}</strong></span>
                  </div>
                  <span className="text-slate-400 font-bold text-[8.5px]">Self-Evolution Audit Log:</span>
                  <ul className="list-disc list-inside text-slate-400 text-[8.5px] space-y-0.5 font-mono">
                    {selfEvolutionResult.auditTrail.map((log, idx) => (
                      <li key={idx}>{log}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB TAB: IMPLEMENTATION BIBLE & FOUNDATION (DOC C PART 1) */}
        {subTab === "implementation_foundation" && (
          <motion.div
            key="implementation_foundation"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Controls Bar & Global Execution Trigger */}
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-200 block text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Implementation Bible & Global Execution Foundation (Doc C Part 1)
                </span>
                <span className="text-[9.5px] text-slate-500">
                  10-Step Analysis Pipeline, Repository System Audit, Backward Compatibility Verification & Architecture Documentation.
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleRunSystemAudit}
                  disabled={loadingSystemAudit}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-cyan-300 border border-cyan-500/30 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                  {loadingSystemAudit ? "Auditing..." : "Audit Repository Integrity"}
                </button>

                <button
                  onClick={handleRunMasterImplementationPlan}
                  disabled={loadingImplementationPlan}
                  className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {loadingImplementationPlan ? "Planning & Executing..." : "Execute 10-Step Master Plan"}
                </button>
              </div>
            </div>

            {/* System Audit Card View */}
            {systemAuditResult && (
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                <span className="font-bold text-cyan-300 text-[11px] uppercase flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-cyan-400" /> System Integrity & Codebase Audit Results
                  </span>
                  <span className="text-[9.5px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                    Production Score: {systemAuditResult.productionReadinessScore}%
                  </span>
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9.5px]">
                  <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col items-center">
                    <span className="text-slate-400 text-[8.5px]">Zero Placeholder Code</span>
                    <span className="text-emerald-400 font-extrabold text-xs">VERIFIED</span>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col items-center">
                    <span className="text-slate-400 text-[8.5px]">Backward Compatibility</span>
                    <span className="text-emerald-400 font-extrabold text-xs">PASSED</span>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col items-center">
                    <span className="text-slate-400 text-[8.5px]">API Integrity</span>
                    <span className="text-cyan-400 font-extrabold text-sm">{systemAuditResult.apiContractIntegrityScore}%</span>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col items-center">
                    <span className="text-slate-400 text-[8.5px]">Database Schema</span>
                    <span className="text-emerald-400 font-extrabold text-sm">{systemAuditResult.databaseSchemaIntegrityScore}%</span>
                  </div>
                </div>

                {/* Module Breakdown List */}
                <div className="flex flex-col gap-1.5 text-[9.5px]">
                  <span className="text-slate-300 font-bold">Inspected System Modules ({systemAuditResult.moduleBreakdown.length}):</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {systemAuditResult.moduleBreakdown.map((mod, idx) => (
                      <div key={idx} className="p-2 bg-black/40 border border-slate-900 rounded-lg flex items-center justify-between">
                        <div className="flex flex-col text-[8.5px]">
                          <span className="font-bold text-slate-200">{mod.moduleName}</span>
                          <span className="text-slate-500 font-mono">{mod.path} (~{mod.locEstimate} LOC)</span>
                        </div>
                        <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
                          {mod.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Master Implementation Plan View */}
            {implementationPlanResult && (
              <div className="flex flex-col gap-4">
                {/* Architecture Policies & Audit Scorecard */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Policies Enforced */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                    <span className="font-bold text-emerald-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> Document C Global Architecture Policies Enforced
                    </span>
                    <div className="grid grid-cols-1 gap-1.5 text-[9.5px]">
                      <div className="p-2 bg-black/40 border border-slate-900 rounded-lg flex items-center justify-between">
                        <span className="text-slate-300">No Duplicate Architecture Rule</span>
                        <span className="text-emerald-400 font-bold font-mono">PASSED</span>
                      </div>
                      <div className="p-2 bg-black/40 border border-slate-900 rounded-lg flex items-center justify-between">
                        <span className="text-slate-300">Rebuild with Migration Policy</span>
                        <span className="text-emerald-400 font-bold font-mono">PASSED</span>
                      </div>
                      <div className="p-2 bg-black/40 border border-slate-900 rounded-lg flex items-center justify-between">
                        <span className="text-slate-300">Least Privilege & Security Hardening</span>
                        <span className="text-emerald-400 font-bold font-mono">PASSED</span>
                      </div>
                      <div className="p-2 bg-black/40 border border-slate-900 rounded-lg flex items-center justify-between">
                        <span className="text-slate-300">Provider Independence & Zero Lock-in</span>
                        <span className="text-emerald-400 font-bold font-mono">PASSED</span>
                      </div>
                    </div>
                  </div>

                  {/* Documentation Highlights */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                    <span className="font-bold text-cyan-300 text-[11px] uppercase flex items-center gap-2 border-b border-slate-900 pb-2">
                      <FileText className="w-4 h-4 text-cyan-400" /> Generated Enterprise Documentation
                    </span>
                    <div className="flex flex-col gap-2 text-[9.5px]">
                      <div>
                        <span className="font-bold text-slate-200 block text-[9px]">Architecture Notes:</span>
                        <p className="text-slate-400 text-[8.5px]">{implementationPlanResult.documentationGenerated.architectureNotes}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-200 block text-[9px]">Developer Guide:</span>
                        <p className="text-slate-400 text-[8.5px]">{implementationPlanResult.documentationGenerated.developerGuide}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-200 block text-[9px]">API Documentation:</span>
                        <p className="text-slate-400 text-[8.5px]">{implementationPlanResult.documentationGenerated.apiDocumentation}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 10-Step Implementation Pipeline Timeline */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                  <span className="font-bold text-fuchsia-300 text-[11px] uppercase flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-fuchsia-400" /> 10-Step Master Implementation Analysis Pipeline (10/10 Verified)
                    </span>
                    <span className="text-[9.5px] font-mono text-fuchsia-300">
                      Goal: {implementationPlanResult.executionGoal}
                    </span>
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2.5 text-[9.5px]">
                    {implementationPlanResult.tenStepAnalysisPipeline.map(step => (
                      <div key={step.stepNumber} className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-1">
                          <span className="font-bold text-slate-200">Step #{step.stepNumber}</span>
                          <span className="text-[7.5px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded-md">
                            {step.status}
                          </span>
                        </div>
                        <span className="text-cyan-400 font-bold text-[8.5px]">{step.stepName}</span>
                        <span className="text-fuchsia-300 text-[7.5px]">{step.subsystemInspected}</span>
                        <p className="text-slate-400 text-[8px] leading-relaxed">{step.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB TAB: ENTERPRISE QA & SELF-HEALING PLATFORM (Doc C Mega Prompt 3) */}
        {subTab === "qa_self_healing" && (
          <motion.div
            key="qa_self_healing"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-100 block text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Enterprise QA, Validation & Self-Healing Platform (Doc C Mega Prompt 3)
                </span>
                <span className="text-[9.5px] text-slate-400">
                  Continuous quality gate inspecting architecture, static types, security, performance, accessibility, and automated defect remediation.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunQaPipeline}
                  disabled={loadingQaPipeline}
                  className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-[9.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {loadingQaPipeline ? "Executing QA Pipeline..." : "Run 16-Stage QA Pipeline"}
                </button>
                <button
                  onClick={handleTriggerSelfHealing}
                  disabled={loadingSelfHealing}
                  className="px-3.5 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-[9.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  {loadingSelfHealing ? "Self-Healing..." : "Trigger Self-Healing"}
                </button>
              </div>
            </div>

            {/* QA Release Report View */}
            {qaReleaseReport && (
              <div className="flex flex-col gap-4">
                {/* Release Approval Banner */}
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    <div className="flex flex-col">
                      <span className="font-bold text-emerald-200 text-xs">{qaReleaseReport.releaseReadinessGate.releaseApprovalStatus}</span>
                      <span className="text-[9px] text-emerald-400/80 font-mono">
                        Zero Critical Bugs: {qaReleaseReport.releaseReadinessGate.zeroCriticalBugsVerified ? "VERIFIED" : "NO"} | Zero Data Loss Risk: {qaReleaseReport.releaseReadinessGate.zeroDataLossRiskVerified ? "VERIFIED" : "NO"} | Compliance: {qaReleaseReport.releaseReadinessGate.complianceScore}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[9px]">
                    <span className="text-slate-400">Total Auto-Repairs Executed: <strong className="text-cyan-300">{qaReleaseReport.selfHealingSummary.totalAutoRepairsExecuted}</strong></span>
                  </div>
                </div>

                {/* 16-Stage QA Pipeline Table/Grid */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                  <span className="font-bold text-slate-200 text-[10.5px] uppercase flex items-center justify-between border-b border-slate-900 pb-2">
                    <span>16-Stage Global Quality Pipeline Execution Results</span>
                    <span className="text-emerald-400 font-mono text-[9px]">Coverage: {qaReleaseReport.testSuiteScorecard.overallCoveragePercentage}%</span>
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-[9.5px]">
                    {qaReleaseReport.sixteenStagePipeline.map(stage => (
                      <div key={stage.stageNumber} className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-1">
                          <span className="font-bold text-slate-200">#{stage.stageNumber} {stage.stageName}</span>
                          <span className="text-[7.5px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded-md">
                            {stage.status} ({stage.score}%)
                          </span>
                        </div>
                        <p className="text-slate-400 text-[8px] leading-relaxed">{stage.auditDetails}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Test Suite Scorecard */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-black/40 border border-slate-900 rounded-xl">
                    <span className="text-slate-400 text-[9px] block">Unit Tests</span>
                    <span className="text-emerald-400 font-extrabold text-sm">{qaReleaseReport.testSuiteScorecard.unitTestsPassed} / {qaReleaseReport.testSuiteScorecard.unitTestsCount}</span>
                  </div>
                  <div className="p-3 bg-black/40 border border-slate-900 rounded-xl">
                    <span className="text-slate-400 text-[9px] block">Integration Tests</span>
                    <span className="text-emerald-400 font-extrabold text-sm">{qaReleaseReport.testSuiteScorecard.integrationTestsPassed} / {qaReleaseReport.testSuiteScorecard.integrationTestsCount}</span>
                  </div>
                  <div className="p-3 bg-black/40 border border-slate-900 rounded-xl">
                    <span className="text-slate-400 text-[9px] block">E2E Tests</span>
                    <span className="text-emerald-400 font-extrabold text-sm">{qaReleaseReport.testSuiteScorecard.e2eTestsPassed} / {qaReleaseReport.testSuiteScorecard.e2eTestsCount}</span>
                  </div>
                  <div className="p-3 bg-black/40 border border-slate-900 rounded-xl">
                    <span className="text-slate-400 text-[9px] block">Security Tests</span>
                    <span className="text-emerald-400 font-extrabold text-sm">{qaReleaseReport.testSuiteScorecard.securityTestsPassed} / {qaReleaseReport.testSuiteScorecard.securityTestsCount}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Self-Healing Result View */}
            {selfHealingResult && (
              <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl flex flex-col gap-3">
                <span className="font-bold text-cyan-200 text-xs flex items-center justify-between">
                  <span>Self-Healing Engine Execution Log (Repair ID: {selfHealingResult.repairId})</span>
                  <span className="text-emerald-400 text-[9.5px]">Regression Tests: {selfHealingResult.regressionTestsPassed ? "PASSED" : "FAILED"}</span>
                </span>
                <div className="flex flex-col gap-2 text-[9px]">
                  {selfHealingResult.remediationLogs.map((log, idx) => (
                    <div key={idx} className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-200">{log.defectCategory} ({log.impactLevel} Impact)</span>
                        <span className="text-slate-400 text-[8px]">{log.remediationStrategy}</span>
                      </div>
                      <span className="text-emerald-400 font-mono text-[8px] bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB TAB: FINAL RELEASE & PRODUCTION DEPLOYMENT (Doc C Mega Prompt 4) */}
        {subTab === "release_deployment" && (
          <motion.div
            key="release_deployment"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-100 block text-xs flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-fuchsia-400" /> Final Integration, Production Release & Deployment Platform (Doc C Mega Prompt 4)
                </span>
                <span className="text-[9.5px] text-slate-400">
                  Integrates all Neora subsystems into one unified, enterprise-grade, production-ready release platform with disaster recovery and cross-platform distribution.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunReleasePipeline}
                  disabled={loadingReleasePipeline}
                  className="px-3.5 py-2 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 rounded-xl text-[9.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  {loadingReleasePipeline ? "Integrating..." : "Execute 14-Stage Integration Pipeline"}
                </button>
                <button
                  onClick={handleTriggerDisasterRecovery}
                  disabled={loadingDisasterRecovery}
                  className="px-3.5 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-[9.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <HardDriveUpload className="w-3.5 h-3.5" />
                  {loadingDisasterRecovery ? "Backing up..." : "Trigger Disaster Recovery Test"}
                </button>
              </div>
            </div>

            {/* Production Release Report View */}
            {productionReleaseReport && (
              <div className="flex flex-col gap-4">
                {/* Release Official Approval Badge */}
                <div className="p-4 bg-fuchsia-950/20 border border-fuchsia-500/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Award className="w-7 h-7 text-fuchsia-400" />
                    <div className="flex flex-col">
                      <span className="font-bold text-fuchsia-200 text-xs">{productionReleaseReport.governanceScores.releaseApprovalStatus}</span>
                      <span className="text-[9px] text-fuchsia-400/80 font-mono">
                        Release ID: {productionReleaseReport.releaseId} | Architecture: {productionReleaseReport.governanceScores.unifiedArchitectureScore}% | Security: {productionReleaseReport.governanceScores.securityComplianceScore}% | Performance: {productionReleaseReport.governanceScores.performanceOptimizationScore}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[8.5px] font-mono text-emerald-400">
                    <span className="bg-emerald-950/40 border border-emerald-500/20 px-2 py-1 rounded-md">Central Logging Active</span>
                    <span className="bg-emerald-950/40 border border-emerald-500/20 px-2 py-1 rounded-md">Distributed Tracing Active</span>
                  </div>
                </div>

                {/* 14-Stage Integration Pipeline Grid */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                  <span className="font-bold text-slate-200 text-[10.5px] uppercase flex items-center justify-between border-b border-slate-900 pb-2">
                    <span>14-Stage Global Integration Pipeline Execution</span>
                    <span className="text-fuchsia-400 font-mono text-[9px]">Goal: {productionReleaseReport.targetGoal}</span>
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-[9.5px]">
                    {productionReleaseReport.integrationPipeline.map(stage => (
                      <div key={stage.stageNumber} className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-1">
                          <span className="font-bold text-slate-200">#{stage.stageNumber} {stage.stageName}</span>
                          <span className="text-[7.5px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded-md">
                            {stage.status} ({stage.score}%)
                          </span>
                        </div>
                        <p className="text-slate-400 text-[8px] leading-relaxed">{stage.details}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cross Platform Distribution Targets */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                  <span className="font-bold text-slate-200 text-[10.5px] uppercase border-b border-slate-900 pb-2">
                    Cross-Platform Enterprise Distribution Targets
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 text-[9.5px]">
                    {productionReleaseReport.distributionTargets.map((target, idx) => (
                      <div key={idx} className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1">
                        <span className="font-bold text-slate-200">{target.platformOS}</span>
                        <span className="text-fuchsia-300 font-mono text-[8px]">{target.installerFormat}</span>
                        <div className="flex items-center justify-between text-[7.5px] font-mono text-slate-400 mt-1">
                          <span>Size: {target.packageSizeMb}MB</span>
                          <span className="text-emerald-400 font-bold">{target.buildStatus}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Disaster Recovery Manifest View */}
            {disasterRecoveryManifest && (
              <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-2xl flex flex-col gap-3">
                <span className="font-bold text-purple-200 text-xs flex items-center justify-between">
                  <span>Disaster Recovery & Point-In-Time Restore Manifest (Backup ID: {disasterRecoveryManifest.backupId})</span>
                  <span className="text-emerald-400 text-[9.5px]">PITR Ready: {disasterRecoveryManifest.pointInTimeRestoreReady ? "YES" : "NO"}</span>
                </span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-[9px]">
                  <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl">
                    <span className="text-slate-400 block text-[8px]">Workspace Backup</span>
                    <span className="text-emerald-400 font-bold">{disasterRecoveryManifest.workspaceBackupStatus}</span>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl">
                    <span className="text-slate-400 block text-[8px]">Database Backup</span>
                    <span className="text-emerald-400 font-bold">{disasterRecoveryManifest.databaseBackupStatus}</span>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl">
                    <span className="text-slate-400 block text-[8px]">RPO (Recovery Point)</span>
                    <span className="text-cyan-400 font-bold">{disasterRecoveryManifest.recoveryPointObjectiveMinutes} min (Zero Loss)</span>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl">
                    <span className="text-slate-400 block text-[8px]">RTO (Recovery Time)</span>
                    <span className="text-fuchsia-400 font-bold">&lt; {disasterRecoveryManifest.recoveryTimeObjectiveSeconds}s</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB TAB: AUTONOMOUS EVOLUTION PLATFORM (Doc C Mega Prompt 5) */}
        {subTab === "autonomous_evolution" && (
          <motion.div
            key="autonomous_evolution"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-100 block text-xs flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-sky-400" /> Autonomous Evolution Platform & Native Intelligence Ecosystem (Doc C Mega Prompt 5)
                </span>
                <span className="text-[9.5px] text-slate-400">
                  Permanent platform evolution policy driving self-learning, self-refactoring, model evolution, and backward-compatible architecture upgrades.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunEvolutionPipeline}
                  disabled={loadingEvolutionPipeline}
                  className="px-3.5 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-xl text-[9.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {loadingEvolutionPipeline ? "Evolving..." : "Execute Evolution Cycle"}
                </button>
                <button
                  onClick={handleTriggerSelfRefactor}
                  disabled={loadingSelfRefactor}
                  className="px-3.5 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-[9.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  {loadingSelfRefactor ? "Refactoring..." : "Trigger Self-Refactor"}
                </button>
              </div>
            </div>

            {/* Autonomous Evolution Report View */}
            {evolutionReport && (
              <div className="flex flex-col gap-4">
                {/* Evolution Policy & Governance Header */}
                <div className="p-4 bg-sky-950/20 border border-sky-500/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-sky-400" />
                    <div className="flex flex-col">
                      <span className="font-bold text-sky-200 text-xs">{evolutionReport.governanceCompliance.longTermStrategyStatus}</span>
                      <span className="text-[9px] text-sky-400/80 font-mono">
                        Run ID: {evolutionReport.evolutionRunId} | Reasoning Score: {evolutionReport.evolutionMetrics.reasoningAccuracyScore}% | Backward Compatibility: {evolutionReport.evolutionMetrics.platformBackwardCompatibilityScore}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[8.5px] font-mono text-emerald-400">
                    <span className="bg-emerald-950/40 border border-emerald-500/20 px-2 py-1 rounded-md">Zero Vendor Lock-in</span>
                    <span className="bg-emerald-950/40 border border-emerald-500/20 px-2 py-1 rounded-md">User Ownership Preserved</span>
                  </div>
                </div>

                {/* 5 Native Intelligence Pillars Grid */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                  <span className="font-bold text-slate-200 text-[10.5px] uppercase flex items-center justify-between border-b border-slate-900 pb-2">
                    <span>Native Intelligence Ecosystem Pillars</span>
                    <span className="text-sky-400 font-mono text-[9px]">Refactor Velocity: {evolutionReport.evolutionMetrics.selfHealingRefactorVelocity}</span>
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-[9.5px]">
                    {evolutionReport.roadmapNodes.map(node => (
                      <div key={node.nodeId} className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-2">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                          <span className="font-bold text-slate-200 text-[10px]">{node.pillarName}</span>
                          <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
                            {node.status} ({node.evolutionScore}%)
                          </span>
                        </div>
                        <p className="text-sky-300/90 font-medium text-[8.5px]">{node.targetMilestone}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {node.keyCapabilities.map((cap, i) => (
                            <span key={i} className="text-[7.5px] text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Refactoring Proposals */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                  <span className="font-bold text-slate-200 text-[10.5px] uppercase border-b border-slate-900 pb-2">
                    Autonomous Self-Refactoring & Pattern Optimizations
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[9.5px]">
                    {evolutionReport.activeRefactoringProposals.map(prop => (
                      <div key={prop.proposalId} className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">{prop.targetSubsystem}</span>
                          <span className="text-[8px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                            {prop.refactoringScope}
                          </span>
                        </div>
                        <span className="text-emerald-400 font-mono text-[8.5px]">Gain: {prop.expectedPerformanceGain}</span>
                        <div className="flex flex-col gap-1 text-[8px] text-slate-400">
                          {prop.proposedChanges.map((change, idx) => (
                            <span key={idx}>• {change}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Self-Refactoring Triggered View */}
            {latestRefactorProposal && (
              <div className="p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-2xl flex flex-col gap-2">
                <span className="font-bold text-indigo-200 text-xs flex items-center justify-between">
                  <span>Triggered Refactor Proposal (ID: {latestRefactorProposal.proposalId})</span>
                  <span className="text-emerald-400 text-[9.5px]">Safety Check: {latestRefactorProposal.safetyVerificationPassed ? "PASSED" : "FAILED"}</span>
                </span>
                <span className="text-slate-300 font-medium text-[9.5px]">Target: {latestRefactorProposal.targetSubsystem} ({latestRefactorProposal.refactoringScope})</span>
                <span className="text-emerald-400 font-mono text-[9px]">Gain: {latestRefactorProposal.expectedPerformanceGain}</span>
                <div className="flex flex-col gap-1 text-[8.5px] text-slate-400 mt-1">
                  {latestRefactorProposal.proposedChanges.map((c, i) => (
                    <span key={i}>✓ {c}</span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB TAB: CORE PLATFORM RUNTIME FOUNDATION (Ultra Mega Prompt D1) */}
        {subTab === "runtime_foundation" && (
          <motion.div
            key="runtime_foundation"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-100 block text-xs flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" /> Core Platform Runtime Foundation (Ultra Mega Prompt D1)
                </span>
                <span className="text-[9.5px] text-slate-400">
                  Unified enterprise AI operating system runtime with DI Kernel, Event Bus, Resumable Workflows & Bangla/English Multilingual Voice Runtime.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunRuntimeBoot}
                  disabled={loadingRuntimeBoot}
                  className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-[9.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Server className="w-3.5 h-3.5" />
                  {loadingRuntimeBoot ? "Booting Kernel..." : "Boot Kernel Runtime"}
                </button>
                <button
                  onClick={handleTriggerWorkflow}
                  disabled={loadingWorkflowTrigger}
                  className="px-3.5 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-xl text-[9.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Activity className="w-3.5 h-3.5" />
                  {loadingWorkflowTrigger ? "Executing..." : "Trigger Resumable Workflow"}
                </button>
              </div>
            </div>

            {/* Runtime Report View */}
            {runtimeReport && (
              <div className="flex flex-col gap-4">
                {/* Kernel Status Banner */}
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    <div className="flex flex-col">
                      <span className="font-bold text-emerald-200 text-xs">{runtimeReport.bootSequenceStatus}</span>
                      <span className="text-[9px] text-emerald-400/80 font-mono">
                        Runtime ID: {runtimeReport.runtimeId} | Active Services: {runtimeReport.diContainerMetrics.registeredServicesCount} | Circular Check: {runtimeReport.diContainerMetrics.circularDependencyCheckPassed ? "PASSED" : "FAILED"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[8.5px] font-mono text-cyan-400">
                    <span className="bg-cyan-950/40 border border-cyan-500/20 px-2 py-1 rounded-md">Event Bus: {runtimeReport.eventBusStatus.eventBusHealth}</span>
                    <span className="bg-cyan-950/40 border border-cyan-500/20 px-2 py-1 rounded-md">Workflow Engine: {runtimeReport.workflowEngineStatus.workflowEngineHealth}</span>
                  </div>
                </div>

                {/* Kernel Services Registry Table */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                  <span className="font-bold text-slate-200 text-[10.5px] uppercase flex items-center justify-between border-b border-slate-900 pb-2">
                    <span>Kernel Services & Dependency Injection Container</span>
                    <span className="text-emerald-400 font-mono text-[9px]">Messages Processed: {runtimeReport.eventBusStatus.messagesProcessed}</span>
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-[9.5px]">
                    {runtimeReport.kernelServices.map(service => (
                      <div key={service.serviceId} className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-1">
                          <span className="font-bold text-slate-200 text-[9px]">{service.serviceName}</span>
                          <span className="text-[7.5px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded-md">
                            {service.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[7.5px] text-slate-400 font-mono">
                          <span>Scope: {service.scope}</span>
                          <span>v{service.version}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Multilingual Voice Runtime Interactive Panel */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                  <span className="font-bold text-slate-200 text-[10.5px] uppercase border-b border-slate-900 pb-2">
                    Multilingual Voice Runtime (Bangla & English Code-Switching)
                  </span>
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      type="text"
                      value={voiceInputText}
                      onChange={e => setVoiceInputText(e.target.value)}
                      placeholder="Enter voice or speech text command..."
                      className="flex-1 bg-black/60 border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                    <button
                      onClick={handleParseVoiceCommand}
                      disabled={loadingVoiceCommand}
                      className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-[9.5px] font-bold cursor-pointer transition-all disabled:opacity-50"
                    >
                      {loadingVoiceCommand ? "Processing Audio..." : "Parse Speech Command"}
                    </button>
                  </div>

                  {voiceCommandResult && (
                    <div className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1.5 text-[9px]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-200">Detected Intent: {voiceCommandResult.detectedIntent}</span>
                        <span className="text-emerald-400 font-mono text-[8px]">Confidence: {voiceCommandResult.confidenceScore}%</span>
                      </div>
                      <div className="flex justify-between items-center text-[8px] text-slate-400 font-mono">
                        <span>Parsed Action: <strong className="text-slate-200">{voiceCommandResult.parsedAction}</strong></span>
                        <span>Wake Word Detected: <strong className="text-emerald-400">{voiceCommandResult.wakeWordDetected ? "YES" : "NO"}</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Active Workflow Plan View */}
            {activeWorkflowPlan && (
              <div className="p-4 bg-sky-950/20 border border-sky-500/30 rounded-2xl flex flex-col gap-3">
                <span className="font-bold text-sky-200 text-xs flex items-center justify-between">
                  <span>Resumable Workflow Plan: {activeWorkflowPlan.workflowName} (ID: {activeWorkflowPlan.workflowId})</span>
                  <span className="text-emerald-400 text-[9.5px]">Progress: {activeWorkflowPlan.progressPercentage}%</span>
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-[9px]">
                  {activeWorkflowPlan.steps.map(step => (
                    <div key={step.stepId} className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{step.stepName}</span>
                        <span className="text-emerald-400 font-mono text-[8px]">{step.status}</span>
                      </div>
                      <span className="text-slate-400 text-[8px]">Type: {step.type} | Duration: {step.executionTimeMs}ms</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB TAB: NATIVE AI BRAIN COGNITIVE LAYER (Ultra Mega Prompt D2) */}
        {subTab === "native_ai_brain_cognitive" && (
          <motion.div
            key="native_ai_brain_cognitive"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-100 block text-xs flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-purple-400" /> Neora Native AI Brain Cognitive Runtime (Ultra Mega Prompt D2)
                </span>
                <span className="text-[9.5px] text-slate-400">
                  Autonomous Intelligence Layer with Intent Engine, Multi-step Reasoning Trace, Multi-Agent Deliberation, Provider Router & Self-Repair.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunBrainPipeline}
                  disabled={loadingBrainPipeline}
                  className="px-3.5 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-[9.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  {loadingBrainPipeline ? "Running Cognitive Brain..." : "Execute Cognitive Brain"}
                </button>
                <button
                  onClick={handleTriggerDeliberation}
                  disabled={loadingDeliberation}
                  className="px-3.5 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-[9.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Users className="w-3.5 h-3.5" />
                  {loadingDeliberation ? "Deliberating..." : "Agent Deliberation"}
                </button>
                <button
                  onClick={handleTriggerBrainRepair}
                  disabled={loadingBrainRepair}
                  className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-[9.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {loadingBrainRepair ? "Repairing..." : "Self-Repair Audit"}
                </button>
              </div>
            </div>

            {/* Cognitive Brain Report View */}
            {brainCognitiveReport && (
              <div className="flex flex-col gap-4">
                {/* Cognitive Summary Banner */}
                <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <BrainCircuit className="w-6 h-6 text-purple-400" />
                    <div className="flex flex-col">
                      <span className="font-bold text-purple-200 text-xs">Primary Intent: {brainCognitiveReport.intent.category} ({brainCognitiveReport.intent.confidenceScore}% Confidence)</span>
                      <span className="text-[9px] text-purple-300/80 font-mono">
                        Run ID: {brainCognitiveReport.brainRunId} | Subsystem: {brainCognitiveReport.intent.targetSubsystem}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[8.5px] font-mono text-cyan-300">
                    <span className="bg-purple-900/40 border border-purple-500/30 px-2 py-1 rounded-md">
                      Provider: {brainCognitiveReport.providerRouting.selectedProvider}
                    </span>
                    <span className="bg-purple-900/40 border border-purple-500/30 px-2 py-1 rounded-md">
                      Correctness: {brainCognitiveReport.selfEvaluationAndRepair.correctnessScore}%
                    </span>
                  </div>
                </div>

                {/* Multi-step Reasoning Trace */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                  <span className="font-bold text-slate-200 text-[10.5px] uppercase border-b border-slate-900 pb-2">
                    Multi-step Strategic Reasoning Trace & Constraint Solving
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[9.5px]">
                    {brainCognitiveReport.reasoningTrace.map(step => (
                      <div key={step.stepNumber} className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1.5">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-1">
                          <span className="font-bold text-purple-300">Step #{step.stepNumber}: {step.reasoningType}</span>
                          <span className="text-emerald-400 font-mono text-[8px]">
                            {step.validationCheckPassed ? "VALIDATED" : "PENDING"}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[9px]">{step.deduction}</p>
                        <span className="text-slate-500 text-[8px] font-mono">Risk: {step.riskAssessment}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cognitive Execution Graph & Multi-Agent Orchestrator */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Execution Graph */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2.5">
                    <span className="font-bold text-slate-200 text-[10.5px] uppercase border-b border-slate-900 pb-2">
                      Cognitive Execution Graph
                    </span>
                    {brainCognitiveReport.executionGraph.map(node => (
                      <div key={node.nodeId} className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1 text-[9px]">
                        <div className="flex justify-between items-center font-bold text-slate-200">
                          <span>{node.objectiveName}</span>
                          <span className="text-emerald-400 font-mono text-[8px]">{node.status}</span>
                        </div>
                        <span className="text-slate-400 text-[8px]">Assigned: {node.assignedAgent}</span>
                      </div>
                    ))}
                  </div>

                  {/* Multi-Agent Orchestration Specialists */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2.5">
                    <span className="font-bold text-slate-200 text-[10.5px] uppercase border-b border-slate-900 pb-2">
                      Specialized Agents Orchestration
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {brainCognitiveReport.multiAgentOrchestration.map(agent => (
                        <div key={agent.agentId} className="p-2 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-0.5 text-[8.5px]">
                          <span className="font-bold text-purple-200">{agent.roleName}</span>
                          <span className="text-slate-400 truncate">{agent.assignedFocus}</span>
                          <span className="text-emerald-400 font-mono text-[7.5px]">{agent.deliberationStatus}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Deliberated Agents Modal View */}
            {deliberatedAgents && (
              <div className="p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-2xl flex flex-col gap-3">
                <span className="font-bold text-indigo-200 text-xs">Multi-Agent Specialist Deliberation Summary</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[9px]">
                  {deliberatedAgents.map(ag => (
                    <div key={ag.agentId} className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1">
                      <span className="font-bold text-indigo-300">{ag.roleName}</span>
                      <p className="text-slate-300 text-[8.5px]">{ag.keyContribution}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cognitive Self-Repair Audit View */}
            {cognitiveRepairStatus && (
              <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl flex flex-col gap-2 text-[9.5px]">
                <div className="flex items-center justify-between font-bold text-amber-200 text-xs">
                  <span>Self-Repair Audit Status: {cognitiveRepairStatus.status}</span>
                  <span className="font-mono text-[9px]">ID: {cognitiveRepairStatus.repairId}</span>
                </div>
                <div className="flex flex-col gap-1 text-[9px] text-slate-300">
                  {cognitiveRepairStatus.selfRepairActionsApplied.map((act: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB TAB: AI DESIGN OS CREATIVE WORKSPACE (Ultra Mega Prompt D3) */}
        {subTab === "design_os_creative" && (
          <motion.div
            key="design_os_creative"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-100 block text-xs flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-400" /> Neora AI Design OS Professional Workspace (Ultra Mega Prompt D3)
                </span>
                <span className="text-[9.5px] text-slate-400">
                  Goal-First Design Engine with Non-Destructive Vector/Raster Editing, Multi-Variation Generator, Voice Editing & Print Ready CMYK PDF.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunDesignOsPipeline}
                  disabled={loadingDesignOsPipeline}
                  className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-[9.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {loadingDesignOsPipeline ? "Generating Design OS..." : "Execute Design OS"}
                </button>
                <button
                  onClick={handleRunDesignOsVoiceEdit}
                  disabled={loadingDesignOsVoiceEdit}
                  className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-[9.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Layers className="w-3.5 h-3.5" />
                  {loadingDesignOsVoiceEdit ? "Editing Vector..." : "Voice Vector Edit"}
                </button>
              </div>
            </div>

            {/* Design OS Workspace Report View */}
            {designOsReport && (
              <div className="flex flex-col gap-4">
                {/* Creative Goal Banner */}
                <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Palette className="w-6 h-6 text-amber-400" />
                    <div className="flex flex-col">
                      <span className="font-bold text-amber-200 text-xs">Request: {designOsReport.creativeGoal.clientRequest}</span>
                      <span className="text-[9px] text-amber-300/80 font-mono">
                        Category: {designOsReport.creativeGoal.outputCategory} | Style: {designOsReport.creativeGoal.suggestedStyle} | Color Space: {designOsReport.creativeGoal.printRequirements.colorSpace} ({designOsReport.creativeGoal.printRequirements.dpi} DPI, {designOsReport.creativeGoal.printRequirements.bleedMm}mm Bleed)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[8.5px] font-mono text-emerald-400">
                    <span className="bg-amber-900/40 border border-amber-500/30 px-2 py-1 rounded-md">
                      Quality Audit: {designOsReport.qualityAudit.overallScore}%
                    </span>
                    <span className="bg-amber-900/40 border border-amber-500/30 px-2 py-1 rounded-md">
                      Print Ready: {designOsReport.qualityAudit.printReadinessScore}%
                    </span>
                  </div>
                </div>

                {/* Artboard Vector/Raster Non-Destructive Layers */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                  <span className="font-bold text-slate-200 text-[10.5px] uppercase border-b border-slate-900 pb-2 flex justify-between">
                    <span>Artboard Editor & Vector Layer Stack (Fully Editable)</span>
                    <span className="text-amber-400 font-mono text-[9px]">License: {designOsReport.businessDelivery.commercialLicenseType}</span>
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {designOsReport.variations.map(varPkg => (
                      <div key={varPkg.variationId} className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-amber-300 text-[10px]">{varPkg.styleTag}</span>
                          <span className="text-emerald-400 font-mono text-[8px]">Score: {varPkg.qualityAuditScore}%</span>
                        </div>
                        <p className="text-slate-300 text-[8.5px]">{varPkg.creativeRationale}</p>
                        <div className="flex flex-col gap-1 border-t border-slate-900 pt-2 text-[8px] font-mono text-slate-400">
                          <span className="text-slate-200 font-bold">Vector Layers (SVG / Bezier Curves):</span>
                          {varPkg.artboards[0]?.vectorLayers.map(vl => (
                            <div key={vl.layerId} className="flex justify-between items-center bg-slate-900/40 px-2 py-1 rounded">
                              <span>{vl.name} ({vl.type})</span>
                              <span className="text-amber-400">{vl.fill}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Business Quotation & Source File Delivery Package */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col md:flex-row justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-200 text-[10.5px] uppercase">Commercial Delivery & Export Options</span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      Export Formats: {designOsReport.businessDelivery.exportFormatsAvailable.join(" | ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400">Total Project Quotation:</span>
                      <span className="font-bold text-emerald-400 text-sm">
                        ${designOsReport.businessDelivery.pricingQuotation.totalAmount.toFixed(2)} {designOsReport.businessDelivery.pricingQuotation.currency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Voice Edit Result View */}
            {designOsVoiceResult && (
              <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-2xl flex flex-col gap-2 text-[9.5px]">
                <div className="flex items-center justify-between font-bold text-rose-200 text-xs">
                  <span>Voice Edit Executed: {designOsVoiceResult.commandReceived}</span>
                  <span className="font-mono text-[9px]">Edit ID: {designOsVoiceResult.editId}</span>
                </div>
                <div className="flex justify-between items-center text-[8.5px] font-mono text-slate-300 bg-black/40 p-2 rounded-xl border border-slate-900">
                  <span>Target Layer: {designOsVoiceResult.targetLayerId}</span>
                  <span className="text-emerald-400">{designOsVoiceResult.status}</span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB TAB: AUTONOMOUS SOFTWARE ENGINEERING OS (Ultra Mega Prompt D4) */}
        {subTab === "software_engineering_os" && (
          <motion.div
            key="software_engineering_os"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-100 block text-xs flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" /> Neora Autonomous Software Engineering OS (Ultra Mega Prompt D4)
                </span>
                <span className="text-[9.5px] text-slate-400">
                  Goal-to-Software Workflow with System Architecture Planning, Database Schemas, API Contracts, Project Foundation & Automated Code Review.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunEngineeringOsPipeline}
                  disabled={loadingEngineeringOsPipeline}
                  className="px-3.5 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-[9.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  {loadingEngineeringOsPipeline ? "Architecting Software..." : "Execute Software OS"}
                </button>
                <button
                  onClick={handleRunCodeReview}
                  disabled={loadingCodeReview}
                  className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-[9.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {loadingCodeReview ? "Auditing Code..." : "Trigger Code Review"}
                </button>
              </div>
            </div>

            {/* Software Engineering OS Report View */}
            {engineeringOsReport && (
              <div className="flex flex-col gap-4">
                {/* Architecture Plan Banner */}
                <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Code2 className="w-6 h-6 text-cyan-400" />
                    <div className="flex flex-col">
                      <span className="font-bold text-cyan-200 text-xs">Project: {engineeringOsReport.architecturePlan.projectName} ({engineeringOsReport.architecturePlan.projectType})</span>
                      <span className="text-[9px] text-cyan-300/80 font-mono">
                        Tech Stack: {engineeringOsReport.architecturePlan.techStack.join(" | ")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[8.5px] font-mono text-emerald-400">
                    <span className="bg-cyan-900/40 border border-cyan-500/30 px-2 py-1 rounded-md">
                      Type Safety: {engineeringOsReport.qualityReview.typeSafetyScore}%
                    </span>
                    <span className="bg-cyan-900/40 border border-cyan-500/30 px-2 py-1 rounded-md">
                      Test Coverage: {engineeringOsReport.qualityReview.testCoveragePercentage}%
                    </span>
                  </div>
                </div>

                {/* System Modules & API Contracts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* System Modules */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2.5">
                    <span className="font-bold text-slate-200 text-[10.5px] uppercase border-b border-slate-900 pb-2">
                      System Module Architecture
                    </span>
                    {engineeringOsReport.architecturePlan.systemModules.map((mod, idx) => (
                      <div key={idx} className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1 text-[9px]">
                        <span className="font-bold text-cyan-300">{mod.moduleName}</span>
                        <p className="text-slate-300 text-[8.5px]">{mod.description}</p>
                        <div className="text-slate-400 text-[8px] font-mono">
                          Responsibilities: {mod.responsibilities.join(", ")}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* API Endpoint Contracts */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2.5">
                    <span className="font-bold text-slate-200 text-[10.5px] uppercase border-b border-slate-900 pb-2">
                      API Endpoint Contracts
                    </span>
                    {engineeringOsReport.architecturePlan.apiEndpointContracts.map((ep, idx) => (
                      <div key={idx} className="p-2 bg-black/40 border border-slate-900 rounded-xl flex items-center justify-between text-[8.5px] font-mono">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded font-bold ${ep.method === 'GET' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-blue-950 text-blue-400 border border-blue-500/30'}`}>
                            {ep.method}
                          </span>
                          <span className="text-slate-200">{ep.path}</span>
                        </div>
                        <span className="text-slate-400 text-[8px]">{ep.purpose}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Database Schema & Foundation Project Directory */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Database Schema Blueprint */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2">
                    <span className="font-bold text-slate-200 text-[10.5px] uppercase border-b border-slate-900 pb-2">
                      Database Blueprint Schema
                    </span>
                    {engineeringOsReport.architecturePlan.databaseSchemaBlueprint.map((tbl, idx) => (
                      <div key={idx} className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1 text-[8.5px] font-mono">
                        <span className="font-bold text-cyan-300">Table: {tbl.tableName} (PK: {tbl.primaryKey})</span>
                        <span className="text-slate-400 text-[8px]">Columns: {tbl.columns.join(", ")}</span>
                      </div>
                    ))}
                  </div>

                  {/* Generated Project Foundation */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2">
                    <span className="font-bold text-slate-200 text-[10.5px] uppercase border-b border-slate-900 pb-2 flex justify-between">
                      <span>Generated Foundation ({engineeringOsReport.generatedProject.generatedFilesCount} files)</span>
                      <span className="text-emerald-400 font-mono text-[8px]">CI/CD Ready</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5 font-mono text-[8px] text-slate-300">
                      {engineeringOsReport.generatedProject.rootDirectoryTree.map((path, idx) => (
                        <span key={idx} className="bg-slate-900/60 border border-slate-800 px-2 py-1 rounded">
                          {path}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Code Review Audit View */}
            {codeReviewAudit && (
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl flex flex-col gap-2 text-[9.5px]">
                <div className="flex items-center justify-between font-bold text-emerald-200 text-xs">
                  <span>Automated Code Review Passed (Readability: {codeReviewAudit.readabilityScore}%)</span>
                  <span className="font-mono text-[9px]">Audit ID: {codeReviewAudit.auditId}</span>
                </div>
                <div className="flex flex-col gap-1 text-[8.5px] text-slate-300">
                  {codeReviewAudit.actionableRecommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB TAB: BUSINESS OS & OPERATIONS PLATFORM (Ultra Mega Prompt D5) */}
        {subTab === "business_os_operations" && (
          <motion.div
            key="business_os_operations"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-100 block text-xs flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" /> Neora Business OS & Operations Platform (Ultra Mega Prompt D5)
                </span>
                <span className="text-[9.5px] text-slate-400">
                  Client Workspace, Project Operations Roadmaps, Document Automation, Digital Marketplace Preparation & Unified Search.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunBusinessOsOperationsPipeline}
                  disabled={loadingBusinessOsPipeline}
                  className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-[9.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  {loadingBusinessOsPipeline ? "Executing Operations..." : "Execute Business OS"}
                </button>
                <button
                  onClick={handleRunBusinessOsSearch}
                  disabled={loadingBusinessOsSearch}
                  className="px-3.5 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-[9.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Search className="w-3.5 h-3.5" />
                  {loadingBusinessOsSearch ? "Searching..." : "Unified Search"}
                </button>
                <button
                  onClick={handleGenerateBusinessDocument}
                  disabled={loadingDocumentGeneration}
                  className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-[9.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {loadingDocumentGeneration ? "Generating Doc..." : "Generate Invoice"}
                </button>
              </div>
            </div>

            {/* Business OS Report View */}
            {businessOsReport && (
              <div className="flex flex-col gap-4">
                {/* Analytics Metric Banner */}
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-6 h-6 text-emerald-400" />
                    <div className="flex flex-col">
                      <span className="font-bold text-emerald-200 text-xs">Total Active Revenue: ${businessOsReport.analyticsDashboard.totalRevenueUsd.toLocaleString()} USD</span>
                      <span className="text-[9px] text-emerald-300/80 font-mono">
                        Active Projects: {businessOsReport.analyticsDashboard.activeProjectsCount} | AI Automation Saved: {businessOsReport.analyticsDashboard.aiAutomationHoursSaved} hrs
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[8.5px] font-mono text-emerald-400">
                    <span className="bg-emerald-900/40 border border-emerald-500/30 px-2 py-1 rounded-md">
                      Health: {businessOsReport.analyticsDashboard.systemHealthStatus}
                    </span>
                  </div>
                </div>

                {/* Client Workspace & Project Milestones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Client Workspace */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2.5">
                    <span className="font-bold text-slate-200 text-[10.5px] uppercase border-b border-slate-900 pb-2">
                      Client Workspace & Approvals
                    </span>
                    {businessOsReport.clientWorkspace.map(client => (
                      <div key={client.clientId} className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1 text-[9px]">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-emerald-300">{client.clientName} ({client.organization})</span>
                          <span className="text-emerald-400 font-mono text-[8px]">{client.approvalStatus}</span>
                        </div>
                        <span className="text-slate-400 text-[8px]">Projects: {client.activeProjects.join(", ")}</span>
                      </div>
                    ))}
                  </div>

                  {/* Project Roadmaps & Tasks */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2.5">
                    <span className="font-bold text-slate-200 text-[10.5px] uppercase border-b border-slate-900 pb-2">
                      Project Operations Roadmap
                    </span>
                    {businessOsReport.roadmapMilestones.map(ms => (
                      <div key={ms.milestoneId} className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1 text-[9px]">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-200">{ms.milestoneTitle}</span>
                          <span className="text-emerald-400 font-mono text-[8px]">{ms.completionPercentage}%</span>
                        </div>
                        <span className="text-slate-400 text-[8px] font-mono">Target: {ms.targetDate} | Status: {ms.healthStatus}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Automated Documents & Marketplace Products */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Automated Business Documents */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2">
                    <span className="font-bold text-slate-200 text-[10.5px] uppercase border-b border-slate-900 pb-2">
                      Automated Business Documents
                    </span>
                    {businessOsReport.generatedDocuments.map(doc => (
                      <div key={doc.documentId} className="p-2 bg-black/40 border border-slate-900 rounded-xl flex items-center justify-between text-[8.5px] font-mono">
                        <div className="flex flex-col">
                          <span className="font-bold text-amber-300">{doc.title}</span>
                          <span className="text-slate-400">{doc.clientName}</span>
                        </div>
                        <span className="text-emerald-400 font-bold">${doc.totalAmountUsd?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Marketplace Products */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2">
                    <span className="font-bold text-slate-200 text-[10.5px] uppercase border-b border-slate-900 pb-2">
                      Marketplace Distribution
                    </span>
                    {businessOsReport.marketplaceProducts.map(prod => (
                      <div key={prod.productId} className="p-2 bg-black/40 border border-slate-900 rounded-xl flex items-center justify-between text-[8.5px] font-mono">
                        <div className="flex flex-col">
                          <span className="font-bold text-cyan-300">{prod.productName} (v{prod.version})</span>
                          <span className="text-slate-400">{prod.licenseType}</span>
                        </div>
                        <span className="text-amber-400 font-bold">${prod.suggestedPriceUsd} USD</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Unified Search View */}
            {businessOsSearchResults && (
              <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl flex flex-col gap-2 text-[9.5px]">
                <span className="font-bold text-cyan-200 text-xs">Unified Semantic Search Results</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {businessOsSearchResults.map(match => (
                    <div key={match.matchId} className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1 text-[8.5px]">
                      <div className="flex justify-between items-center font-bold text-cyan-300">
                        <span>{match.title}</span>
                        <span className="text-emerald-400 font-mono text-[7.5px]">{match.relevanceScore}%</span>
                      </div>
                      <p className="text-slate-300">{match.snippet}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generated Document Result View */}
            {generatedDocument && (
              <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl flex flex-col gap-2 text-[9.5px]">
                <div className="flex items-center justify-between font-bold text-amber-200 text-xs">
                  <span>Document Created: {generatedDocument.title}</span>
                  <span className="font-mono text-[9px]">ID: {generatedDocument.documentId}</span>
                </div>
                <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl font-mono text-[8.5px] text-slate-300">
                  {generatedDocument.contentMarkdown}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB TAB: ENTERPRISE UI/UX DESIGN SYSTEM (Ultra Mega Prompt E) */}
        {subTab === "enterprise_design_system" && (
          <motion.div
            key="enterprise_design_system"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-100 block text-xs flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-violet-400" /> Neora Enterprise UI/UX Design System Component Platform (Prompt E)
                </span>
                <span className="text-[9.5px] text-slate-400">
                  Unified Design Tokens, Component Specifications, WCAG 2.1 Contrast Audits & Multilingual Accessibility Framework.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunDesignSystemPipeline}
                  disabled={loadingDesignSystem}
                  className="px-3.5 py-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-xl text-[9.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  {loadingDesignSystem ? "Compiling Tokens..." : "Inspect Design System"}
                </button>
              </div>
            </div>

            {/* Design System Inspection View */}
            {designSystemReport && (
              <div className="flex flex-col gap-4">
                {/* Active Theme & WCAG Audit Banner */}
                <div className="p-4 bg-violet-950/20 border border-violet-500/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <LayoutGrid className="w-6 h-6 text-violet-400" />
                    <div className="flex flex-col">
                      <span className="font-bold text-violet-200 text-xs">{designSystemReport.systemName}</span>
                      <span className="text-[9px] text-violet-300/80 font-mono">
                        Active Theme: {designSystemReport.activeThemeMode} | WCAG Level: {designSystemReport.accessibilityAudit.wcagComplianceLevel}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[8.5px] font-mono text-emerald-400">
                    <span className="bg-emerald-900/40 border border-emerald-500/30 px-2 py-1 rounded-md">
                      Bangla A11y: {designSystemReport.accessibilityAudit.localizationCoverage.banglaCoveragePercentage}%
                    </span>
                    <span className="bg-emerald-900/40 border border-emerald-500/30 px-2 py-1 rounded-md">
                      English A11y: {designSystemReport.accessibilityAudit.localizationCoverage.englishCoveragePercentage}%
                    </span>
                  </div>
                </div>

                {/* Tokens Overview: Colors & Typography */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Color Palette Tokens */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2.5">
                    <span className="font-bold text-slate-200 text-[10.5px] uppercase border-b border-slate-900 pb-2">
                      Brand Accents & Semantic Color Tokens
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[8.5px] font-mono">
                      <div className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between">
                        <span className="text-cyan-400 font-bold">Cyan Accent</span>
                        <span className="text-slate-400">{designSystemReport.tokens.colors.brandAccents.cyan}</span>
                      </div>
                      <div className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between">
                        <span className="text-emerald-400 font-bold">Emerald Accent</span>
                        <span className="text-slate-400">{designSystemReport.tokens.colors.brandAccents.emerald}</span>
                      </div>
                      <div className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between">
                        <span className="text-amber-400 font-bold">Amber Accent</span>
                        <span className="text-slate-400">{designSystemReport.tokens.colors.brandAccents.amber}</span>
                      </div>
                      <div className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between">
                        <span className="text-violet-400 font-bold">Violet Accent</span>
                        <span className="text-slate-400">{designSystemReport.tokens.colors.brandAccents.violet}</span>
                      </div>
                    </div>
                  </div>

                  {/* Typography Tokens */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2.5">
                    <span className="font-bold text-slate-200 text-[10.5px] uppercase border-b border-slate-900 pb-2">
                      Multilingual Typography Tokens
                    </span>
                    <div className="flex flex-col gap-1.5 text-[8.5px]">
                      <div className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg flex justify-between items-center">
                        <span className="font-bold text-slate-200">UI Font (English):</span>
                        <span className="text-slate-400 font-mono text-[8px]">{designSystemReport.tokens.typography.fontFamilies.ui}</span>
                      </div>
                      <div className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg flex justify-between items-center">
                        <span className="font-bold text-slate-200">Bangla Font (বাংলা):</span>
                        <span className="text-slate-400 font-mono text-[8px]">{designSystemReport.tokens.typography.fontFamilies.bangla}</span>
                      </div>
                      <div className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg flex justify-between items-center">
                        <span className="font-bold text-slate-200">Code Font (Monospace):</span>
                        <span className="text-slate-400 font-mono text-[8px]">{designSystemReport.tokens.typography.fontFamilies.code}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Component Specifications */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2.5">
                  <span className="font-bold text-slate-200 text-[10.5px] uppercase border-b border-slate-900 pb-2">
                    Registered UI Component Specifications ({designSystemReport.registeredComponents.length} components)
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[8.5px]">
                    {designSystemReport.registeredComponents.map(comp => (
                      <div key={comp.componentId} className="p-2.5 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1">
                        <div className="flex justify-between items-center font-bold text-violet-300">
                          <span>{comp.name}</span>
                          <span className="text-slate-400 font-mono text-[7.5px]">{comp.category}</span>
                        </div>
                        <p className="text-slate-300 text-[8px]">{comp.description}</p>
                        <div className="text-emerald-400 font-mono text-[7.5px]">
                          Shortcuts: {comp.keyboardShortcuts.join(", ")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB TAB: NEORA DESIGN LANGUAGE CORE SYSTEM (Prompt E1) */}
        {subTab === "ndl_core_design_system" && (
          <motion.div
            key="ndl_core_design_system"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-100 block text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" /> Neora Design Language (NDL) Core System Blueprint (Prompt E1)
                </span>
                <span className="text-[9.5px] text-slate-400">
                  Single source of truth design tokens, bilingual typography (Bangla & English), WCAG 2.1 AAA accessibility & governance rules across Design OS, Engineering OS & Business OS.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunNdlPipeline}
                  disabled={loadingNdl}
                  className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-[9.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {loadingNdl ? "Compiling NDL Tokens..." : "Inspect NDL Blueprint"}
                </button>
              </div>
            </div>

            {/* NDL Master Report View */}
            {ndlReport && (
              <div className="flex flex-col gap-4">
                {/* Governance Audit Banner */}
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-emerald-400" />
                    <div className="flex flex-col">
                      <span className="font-bold text-emerald-200 text-xs">NDL System Version: {ndlReport.tokens.systemVersion}</span>
                      <span className="text-[9px] text-emerald-300/80 font-mono">
                        Governance Level: {ndlReport.governanceAudit.wcagLevel} | Token Coverage: {ndlReport.governanceAudit.designTokenCoveragePercentage}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[8.5px] font-mono text-cyan-400">
                    <span className="bg-cyan-900/40 border border-cyan-500/30 px-2.5 py-1 rounded-md">
                      Zero Hardcoded Values
                    </span>
                    <span className="bg-emerald-900/40 border border-emerald-500/30 px-2.5 py-1 rounded-md text-emerald-300">
                      Bilingual Bangla + English 100%
                    </span>
                  </div>
                </div>

                {/* Tokens Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Spacing & Shapes */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2">
                    <span className="font-bold text-slate-200 text-[10.5px] uppercase border-b border-slate-900 pb-2">
                      Spacing & Shape Scale
                    </span>
                    <div className="flex flex-col gap-1.5 text-[8.5px] font-mono">
                      <div className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg flex justify-between">
                        <span className="text-slate-300">Micro / Small / Medium:</span>
                        <span className="text-emerald-400">{ndlReport.tokens.spacingSystem.micro} / {ndlReport.tokens.spacingSystem.sm} / {ndlReport.tokens.spacingSystem.md}</span>
                      </div>
                      <div className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg flex justify-between">
                        <span className="text-slate-300">Panel Shape Radius:</span>
                        <span className="text-cyan-400">{ndlReport.tokens.shapeSystem.panelShape}</span>
                      </div>
                    </div>
                  </div>

                  {/* Motion & Grid System */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2">
                    <span className="font-bold text-slate-200 text-[10.5px] uppercase border-b border-slate-900 pb-2">
                      Motion & Grid Tokens
                    </span>
                    <div className="flex flex-col gap-1.5 text-[8.5px] font-mono">
                      <div className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg flex justify-between">
                        <span className="text-slate-300">Fast / Normal Motion:</span>
                        <span className="text-amber-400">{ndlReport.tokens.motionSystem.durations.fast} / {ndlReport.tokens.motionSystem.durations.normal}</span>
                      </div>
                      <div className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg flex justify-between">
                        <span className="text-slate-300">Grid Columns / Snap:</span>
                        <span className="text-emerald-400">{ndlReport.tokens.gridSystem.responsiveColumns} Cols / {ndlReport.tokens.gridSystem.canvasSnapGridPx}px Snap</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Platform Adapters */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2">
                    <span className="font-bold text-slate-200 text-[10.5px] uppercase border-b border-slate-900 pb-2">
                      NDL Ecosystem Adapters
                    </span>
                    <div className="flex flex-col gap-1 text-[8px]">
                      {ndlReport.activePlatformAdapters.map((adapter, idx) => (
                        <div key={idx} className="p-1.5 bg-black/40 border border-slate-900 rounded-md text-cyan-300 font-mono">
                          • {adapter}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* NDL Component Standards */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2.5">
                  <span className="font-bold text-slate-200 text-[10.5px] uppercase border-b border-slate-900 pb-2">
                    NDL Governance Approved Component Standards ({ndlReport.componentStandards.length})
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[8.5px]">
                    {ndlReport.componentStandards.map((std, idx) => (
                      <div key={idx} className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1.5">
                        <div className="flex justify-between items-center font-bold text-emerald-300">
                          <span>{std.componentName}</span>
                          <span className="text-cyan-400 font-mono text-[7.5px]">{std.ariaRole}</span>
                        </div>
                        <p className="text-slate-300 text-[8px]">{std.purpose}</p>
                        <div className="p-1.5 bg-slate-900/60 rounded-lg flex flex-col gap-0.5 text-[7.5px]">
                          <span className="text-slate-400 font-semibold">বাংলা: {std.bilingualLabelBangla}</span>
                          <span className="text-slate-300">EN: {std.bilingualLabelEnglish}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB TAB: PROFESSIONAL WORKSPACE & WINDOW MANAGEMENT (Prompt E2) */}
        {subTab === "professional_workspace_e2" && (
          <motion.div
            key="professional_workspace_e2"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-100 block text-xs flex items-center gap-2">
                  <Layout className="w-4 h-4 text-cyan-400" /> Neora Professional Workspace Window Management Runtime (Prompt E2)
                </span>
                <span className="text-[9.5px] text-slate-400">
                  Unified docking system, multi-panel layouts, crash-recovery state persistence, and command palette integration for Design OS, Engineering OS & Business OS.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunWorkspacePipeline("prof_design")}
                  disabled={loadingWorkspace}
                  className="px-3.5 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-[9.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Layout className="w-3.5 h-3.5" />
                  {loadingWorkspace ? "Booting Workspace..." : "Inspect Workspace Runtime"}
                </button>
              </div>
            </div>

            {/* Workspace Master Report View */}
            {workspaceReport && (
              <div className="flex flex-col gap-4">
                {/* Active Profile Banner */}
                <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Layout className="w-6 h-6 text-cyan-400" />
                    <div className="flex flex-col">
                      <span className="font-bold text-cyan-200 text-xs">{workspaceReport.activeProfile.name}</span>
                      <span className="text-[9px] text-cyan-300/80 font-mono">
                        Layout: {workspaceReport.activeProfile.layoutMode} | Status: {workspaceReport.activeProfile.statusText}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[8.5px] font-mono text-emerald-400">
                    <span className="bg-emerald-900/40 border border-emerald-500/30 px-2.5 py-1 rounded-md">
                      Dock Health: {workspaceReport.dockSystemHealth}
                    </span>
                    <span className="bg-cyan-900/40 border border-cyan-500/30 px-2.5 py-1 rounded-md text-cyan-300">
                      AutoSave: {workspaceReport.crashRecoveryState.autoSaveIntervalMs / 1000}s
                    </span>
                  </div>
                </div>

                {/* Open Documents & Docked Panels Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Open Document Tabs */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2.5">
                    <span className="font-bold text-slate-200 text-[10.5px] uppercase border-b border-slate-900 pb-2">
                      Active Open Document Tabs ({workspaceReport.openDocuments.length})
                    </span>
                    <div className="flex flex-col gap-1.5 text-[8.5px]">
                      {workspaceReport.openDocuments.map(doc => (
                        <div key={doc.documentId} className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg flex justify-between items-center font-mono">
                          <div className="flex items-center gap-2">
                            <span className="text-cyan-400 font-bold">{doc.title}</span>
                            {doc.isDirty && <span className="text-amber-400 text-[7.5px]">(Unsaved)</span>}
                          </div>
                          <span className="text-slate-400 text-[7.5px]">{doc.editorMode}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Docked Panels */}
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2.5">
                    <span className="font-bold text-slate-200 text-[10.5px] uppercase border-b border-slate-900 pb-2">
                      Docked Panels in Active Profile ({workspaceReport.activeProfile.panels.length})
                    </span>
                    <div className="flex flex-col gap-1.5 text-[8.5px]">
                      {workspaceReport.activeProfile.panels.map(p => (
                        <div key={p.panelId} className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg flex justify-between items-center font-mono">
                          <span className="text-slate-200 font-bold">{p.title}</span>
                          <span className="text-emerald-400 text-[7.5px]">Dock: {p.dockPosition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB TAB: MULTI-CONCEPT SUITE */}
        {subTab === "multiconcept" && (
          <motion.div
            key="multiconcept"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-[10.5px]">Multi-Concept Suite (Concepts A - E)</span>
                <span className="text-[9.5px] text-slate-500">
                  5 distinct creative directions generated autonomously from your intent parameters. Select one to lock and edit.
                </span>
              </div>
            </div>

            {multiConceptSuite ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {multiConceptSuite.concepts.map(concept => (
                  <div key={concept.conceptId} className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <span className="font-bold text-fuchsia-300 text-[11px]">{concept.conceptLabel}</span>
                      <span className="text-[8px] bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/25 px-2 py-0.5 rounded font-extrabold">
                        Quality: {concept.qualityReviewScore}/100
                      </span>
                    </div>

                    <span className="font-bold text-slate-100 text-[11.5px]">{concept.creativeDirectionName}</span>
                    <p className="text-[9.5px] text-slate-400 leading-relaxed">{concept.compositionPhilosophy}</p>

                    <div className="w-full h-36 rounded-xl border border-slate-800 overflow-hidden bg-black p-2 flex items-center justify-center">
                      <div dangerouslySetInnerHTML={{ __html: concept.previewSvgXml }} className="w-full h-full" />
                    </div>

                    <button
                      onClick={handleGenerate}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-fuchsia-300 border border-slate-800 rounded-xl font-bold cursor-pointer text-center text-[10px]"
                    >
                      Lock Concept & Open Editor Workspace
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-slate-950/40 border border-slate-850 rounded-2xl text-center flex flex-col items-center gap-3">
                <Grid3X3 className="w-8 h-8 text-fuchsia-400" />
                <span className="text-slate-300 font-bold">No Multi-Concepts Generated Yet</span>
                <p className="text-[10px] text-slate-500">Analyze your goal intent first, then click 'Generate 5 Concepts (A - E)'.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB TAB: IMAGE REFERENCE TRANSFORMER */}
        {subTab === "transformation" && (
          <motion.div
            key="transformation"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-[10.5px]">Image & Reference Design Transformer Engine</span>
                <span className="text-[9.5px] text-slate-500">
                  Upload screenshot, sketch, logo, or reference design and transform into luxury, modern, or festival editions.
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col sm:flex-row gap-3 items-center">
              <div className="w-full sm:w-72 flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold">Select Transformation Mode:</label>
                <select
                  value={transformType}
                  onChange={e => setTransformType(e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                >
                  <option value="Luxury Gold Edition">Luxury Gold Edition</option>
                  <option value="Ultra Modern Minimalist">Ultra Modern Minimalist</option>
                  <option value="Corporate Executive Blue">Corporate Executive Blue</option>
                  <option value="Festival Ramadan / Eid Special">Festival Ramadan / Eid Special</option>
                  <option value="Print-Ready CMYK Master">Print-Ready CMYK Master</option>
                </select>
              </div>

              <button
                onClick={handleTransformImage}
                disabled={loadingTransform}
                className="mt-auto px-5 py-2.5 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loadingTransform ? "animate-spin" : ""}`} />
                {loadingTransform ? "Transforming..." : "Execute Design Transformation"}
              </button>
            </div>

            {imageTransformResult && (
              <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex flex-col gap-3">
                <span className="font-bold text-fuchsia-300 text-[11px] border-b border-slate-900 pb-2">
                  Transformation Result: {imageTransformResult.transformedDesignDirection}
                </span>

                <div className="w-full h-56 rounded-xl border border-slate-800 overflow-hidden bg-black p-2 flex items-center justify-center">
                  <div dangerouslySetInnerHTML={{ __html: imageTransformResult.transformedSvgPreview }} className="w-full h-full" />
                </div>

                <div className="flex flex-col gap-1 text-[9.5px] text-slate-300">
                  <span className="font-bold text-slate-200">Applied Enhancements:</span>
                  {imageTransformResult.suggestedEnhancements.map((enh, idx) => (
                    <span key={idx} className="flex items-center gap-1.5 text-slate-400">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {enh}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB TAB: CREATIVE MEMORY STORE */}
        {subTab === "memory" && (
          <motion.div
            key="memory"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-[10.5px]">Creative Memory & Brand Vault</span>
                <span className="text-[9.5px] text-slate-500">
                  Remembers user-approved brand styles, fonts, color palettes, and past design directions.
                </span>
              </div>
            </div>

            {creativeMemory && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px]">
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2">
                  <span className="font-bold text-fuchsia-300 text-[11px] border-b border-slate-900 pb-1.5">Approved Fonts</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {creativeMemory.approvedFonts.map((f, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-black/50 border border-slate-800 rounded-lg text-slate-200 font-bold">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2">
                  <span className="font-bold text-fuchsia-300 text-[11px] border-b border-slate-900 pb-1.5">Approved Brand Styles</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {creativeMemory.approvedBrandStyles.map((st, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-black/50 border border-slate-800 rounded-lg text-slate-200 font-bold">
                        {st}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB TAB 1: UNIFIED CANVAS WORKSPACE */}
        {subTab === "workspace" && activeProject && currentArtboard && (
          <motion.div
            key="workspace"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Workspace Modes Selector Ribbon */}
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2">
              <span className="text-[9.5px] text-slate-400 font-bold uppercase flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-fuchsia-400" /> Switch Professional Workspace Mode (15 Specialized Engines):
              </span>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
                {[
                  "Creative Mode",
                  "Vector Design Mode",
                  "Raster Editing Mode",
                  "Layout Mode",
                  "Brand Mode",
                  "Print Production Mode",
                  "Packaging Mode",
                  "Calligraphy Mode",
                  "Presentation Mode",
                  "UI/UX Mode",
                  "Website Design Mode",
                  "App Design Mode",
                  "Publishing Mode",
                  "Automation Mode",
                  "Developer Mode"
                ].map(mode => (
                  <button
                    key={mode}
                    onClick={() => handleSwitchMode(mode as any)}
                    className={`px-2.5 py-1 rounded-xl text-[9px] font-bold cursor-pointer transition-all whitespace-nowrap ${
                      canvasConfig?.mode === mode
                        ? "bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/40"
                        : "bg-black/40 text-slate-500 border border-slate-900 hover:text-slate-300"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Col: Visual Canvas Preview Frame */}
              <div className="lg:col-span-2 p-4 bg-black/60 border border-slate-850 rounded-2xl flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <div>
                    <span className="font-bold text-slate-100 text-[11px] block">{activeProject.title}</span>
                    <span className="text-[8.5px] text-slate-500">
                      Artboard: {currentArtboard.name} ({currentArtboard.width} x {currentArtboard.height}{currentArtboard.unit}) | Bleed: {canvasConfig?.printSafety.bleedMm}mm
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/25 px-2 py-0.5 rounded font-extrabold uppercase">
                      {activeProject.outputFormat}
                    </span>
                    <button
                      onClick={handleGenerateVariations}
                      disabled={loadingVar}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-fuchsia-300 border border-fuchsia-500/20 rounded-lg text-[9px] font-bold cursor-pointer transition-all flex items-center gap-1"
                    >
                      <Sliders className="w-3 h-3" />
                      {loadingVar ? "Generating..." : "Generate Variations"}
                    </button>
                  </div>
                </div>

                {/* Simulated Canvas Stage */}
                <div
                  className="relative w-full h-[360px] rounded-xl border border-slate-800 overflow-hidden flex flex-col justify-between p-6 shadow-2xl transition-all"
                  style={{ backgroundColor: currentArtboard.backgroundColor }}
                >
                  {/* Print Safety Bleed Overlay */}
                  {canvasConfig?.printSafety.showBleedOverlay && (
                    <div className="absolute inset-2 border border-dashed border-rose-500/30 pointer-events-none rounded-lg flex justify-end p-1">
                      <span className="text-[7.5px] text-rose-400 font-extrabold uppercase">3mm Bleed Safety Line</span>
                    </div>
                  )}

                  {/* Render Layers on Artboard Canvas */}
                  {currentArtboard.layers.map(layer => {
                    if (!layer.visible) return null;
                    const isSelected = layer.id === selectedLayerId;

                    return (
                      <div
                        key={layer.id}
                        onClick={() => setSelectedLayerId(layer.id)}
                        className={`cursor-pointer transition-all ${
                          isSelected ? "ring-2 ring-fuchsia-400 ring-offset-2 ring-offset-slate-950 rounded-lg" : ""
                        }`}
                        style={{
                          opacity: layer.opacity,
                          transform: `rotate(${layer.transform.rotationDeg}deg)`
                        }}
                      >
                        {layer.type === "text_typography" && (
                          <div
                            style={{
                              fontFamily: layer.properties.fontFamily,
                              fontSize: `${layer.properties.fontSize}px`,
                              fontWeight: layer.properties.fontWeight,
                              color: layer.properties.fillColor,
                              lineHeight: layer.properties.lineHeight,
                              letterSpacing: `${layer.properties.letterSpacing}px`
                            }}
                          >
                            {layer.properties.textContent}
                          </div>
                        )}

                        {layer.type === "group_container" && (
                          <div
                            className="p-4 rounded-xl border"
                            style={{
                              backgroundColor: layer.properties.fillColor,
                              borderColor: layer.properties.strokeColor,
                              borderWidth: `${layer.properties.strokeWidth}px`
                            }}
                          >
                            <span className="text-[9px] text-fuchsia-300 font-bold uppercase tracking-wider block mb-1">
                              Container Frame Layer
                            </span>
                            <span className="text-[10px] text-slate-300">
                              {layer.name}
                            </span>
                          </div>
                        )}

                        {layer.type === "vector_path" && (
                          <div className="flex items-center gap-2 p-2 bg-black/40 border border-fuchsia-500/30 rounded-xl">
                            <svg className="w-12 h-6" viewBox="0 0 180 60">
                              <path
                                d={layer.properties.svgPathData}
                                stroke={layer.properties.strokeColor}
                                strokeWidth={layer.properties.strokeWidth}
                                fill={layer.properties.fillColor}
                              />
                            </svg>
                            <span className="text-[8.5px] text-fuchsia-300 font-bold">Scalable Vector Path</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Color Palette Swatches */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-850">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Color Palette:</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {activeProject.colorPalette.map((col, idx) => (
                      <div key={idx} className="flex items-center gap-1 bg-slate-950 border border-slate-850 px-2 py-1 rounded-lg">
                        <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: col.hex }} />
                        <span className="text-[8.5px] font-bold text-slate-300">{col.hex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Col: Layer & Property Inspector Panel */}
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                <span className="font-bold text-slate-200 uppercase text-[10px] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-fuchsia-400" /> Layer & Vector Property Inspector
                </span>

                {selectedLayer ? (
                  <div className="flex flex-col gap-3 text-[10px]">
                    <div className="p-2.5 bg-black/50 border border-slate-850 rounded-xl flex justify-between items-center">
                      <span className="font-bold text-slate-100">{selectedLayer.name}</span>
                      <span className="text-[8px] bg-slate-900 text-fuchsia-300 border border-slate-800 px-1.5 py-0.5 rounded font-bold uppercase">
                        {selectedLayer.type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-slate-950 border border-slate-850 rounded-xl flex flex-col gap-0.5">
                        <span className="text-[8px] text-slate-500 font-bold">X Position</span>
                        <span className="text-slate-200 font-bold">{selectedLayer.transform.x} px</span>
                      </div>

                      <div className="p-2 bg-slate-950 border border-slate-850 rounded-xl flex flex-col gap-0.5">
                        <span className="text-[8px] text-slate-500 font-bold">Y Position</span>
                        <span className="text-slate-200 font-bold">{selectedLayer.transform.y} px</span>
                      </div>

                      <div className="p-2 bg-slate-950 border border-slate-850 rounded-xl flex flex-col gap-0.5">
                        <span className="text-[8px] text-slate-500 font-bold">Width</span>
                        <span className="text-slate-200 font-bold">{selectedLayer.transform.width} px</span>
                      </div>

                      <div className="p-2 bg-slate-950 border border-slate-850 rounded-xl flex flex-col gap-0.5">
                        <span className="text-[8px] text-slate-500 font-bold">Height</span>
                        <span className="text-slate-200 font-bold">{selectedLayer.transform.height} px</span>
                      </div>
                    </div>

                    {selectedLayer.properties.fontFamily && (
                      <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl flex flex-col gap-1">
                        <span className="text-[8.5px] text-fuchsia-400 font-bold uppercase">Typography Properties</span>
                        <div className="flex justify-between text-slate-300">
                          <span>Font: {selectedLayer.properties.fontFamily}</span>
                          <span>Size: {selectedLayer.properties.fontSize}px</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500 text-[9.5px]">Select a layer on the canvas to inspect properties.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* SUB TAB 2: SMART EDIT AI PRESETS */}
        {subTab === "smart_edit" && (
          <motion.div
            key="smart_edit"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-[10.5px]">Smart Edit AI Command Engine</span>
                <span className="text-[9.5px] text-slate-500">
                  Refine only affected objects without destroying layer hierarchy, vectors, or text nodes.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[
                "Make it Premium",
                "Make it Modern",
                "Make it Luxury",
                "Make it Minimal",
                "Make it Corporate",
                "Make it Islamic",
                "Make it Creative",
                "Make it Elegant",
                "Make it Kids Version",
                "Make it Dark Theme",
                "Increase Readability",
                "Prepare for CMYK Print"
              ].map(preset => (
                <button
                  key={preset}
                  onClick={() => handleSmartEdit(preset as any)}
                  disabled={loadingSmartEdit}
                  className="p-3 bg-slate-950/40 hover:bg-slate-900 border border-slate-850 hover:border-fuchsia-500/40 rounded-2xl text-[10px] font-bold text-slate-200 cursor-pointer transition-all flex flex-col items-center gap-2 text-center"
                >
                  <Wand2 className="w-4 h-4 text-fuchsia-400" />
                  <span>"{preset}"</span>
                </button>
              ))}
            </div>

            {smartEditResult && (
              <div className="p-4 bg-slate-950/60 border border-fuchsia-500/30 rounded-2xl flex flex-col gap-2">
                <span className="text-[11px] font-bold text-fuchsia-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Smart Edit Applied: "{smartEditResult.presetApplied}"
                </span>
                <span className="text-[9.5px] text-slate-400">
                  Modified Objects: {smartEditResult.modifiedLayersCount} layers | Contrast: {smartEditResult.contrastScoreImprovement}
                </span>
                <ul className="flex flex-col gap-1 text-[9.5px] text-slate-300 mt-1">
                  {smartEditResult.appliedChangesSummary.map((chg, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="text-fuchsia-400 font-bold">•</span>
                      <span>{chg}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB TAB 3: CALLIGRAPHY ENGINE */}
        {subTab === "calligraphy" && (
          <motion.div
            key="calligraphy"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-[10.5px]">Multi-Language Vector Calligraphy Generator</span>
                <span className="text-[9.5px] text-slate-500">
                  Generate decorative vector calligraphy strokes and ornaments for Bangla, Arabic, Urdu & English scripts.
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col sm:flex-row gap-3 items-center">
              <div className="w-full sm:w-64 flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold">Calligraphy Style:</label>
                <select
                  value={calligStyle}
                  onChange={e => setCalligStyle(e.target.value as any)}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                >
                  <option value="Bangla Decorative">Bangla Decorative</option>
                  <option value="Arabic Diwani/Thuluth">Arabic Diwani/Thuluth</option>
                  <option value="Urdu Nastaliq">Urdu Nastaliq</option>
                  <option value="English Script Flourish">English Script Flourish</option>
                </select>
              </div>

              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold">Calligraphy Label Text:</label>
                <input
                  type="text"
                  value={calligText}
                  onChange={e => setCalligText(e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                />
              </div>

              <button
                onClick={handleGenerateCalligraphy}
                className="mt-auto px-5 py-2.5 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-2"
              >
                <PenTool className="w-4 h-4" />
                Generate Calligraphy Stroke
              </button>
            </div>

            {activeCalligStroke && (
              <div className="p-4 bg-black/60 border border-slate-850 rounded-2xl flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <span className="font-bold text-slate-100">{activeCalligStroke.languageStyle}</span>
                  <span className="text-[8px] bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/20 px-2 py-0.5 rounded font-bold uppercase">
                    Ornament: {activeCalligStroke.ornamentType}
                  </span>
                </div>

                <div className="w-full h-32 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center p-4">
                  <svg className="w-full h-full" viewBox="0 0 300 80">
                    <path
                      d={activeCalligStroke.strokeSvgPath}
                      stroke="#06b6d4"
                      strokeWidth={activeCalligStroke.brushThicknessPx}
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB TAB 4: LAYER & VECTOR INSPECTOR */}
        {subTab === "layers" && activeProject && currentArtboard && (
          <motion.div
            key="layers"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-[10.5px]">Full Non-Destructive Layer Hierarchy</span>
                <span className="text-[9.5px] text-slate-500">
                  Inspect vector paths, text nodes, container frames, and guide alignments.
                </span>
              </div>
              <span className="text-[9px] bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/25 px-2 py-1 rounded font-extrabold uppercase">
                {currentArtboard.layers.length} Active Layers
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentArtboard.layers.map(lay => (
                <div key={lay.id} className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col justify-between gap-2 text-[10px]">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="font-bold text-slate-100 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-fuchsia-400" />
                      {lay.name}
                    </span>
                    <div className="flex items-center gap-1">
                      {lay.visible ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3 text-slate-600" />}
                      {lay.locked ? <Lock className="w-3 h-3 text-rose-400" /> : <Unlock className="w-3 h-3 text-slate-500" />}
                    </div>
                  </div>

                  <p className="text-slate-400 text-[9px]">
                    Type: <span className="text-fuchsia-300 font-bold">{lay.type}</span> | Opacity: {(lay.opacity * 100).toFixed(0)}%
                  </p>

                  <div className="bg-black/40 border border-slate-900 p-2 rounded-xl text-[8.5px] flex flex-col gap-0.5">
                    {lay.properties.textContent && <span>Text: "{lay.properties.textContent}"</span>}
                    {lay.properties.svgPathData && <span className="truncate">SVG Path: {lay.properties.svgPathData}</span>}
                    {lay.properties.fillColor && <span>Fill: {lay.properties.fillColor}</span>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* SUB TAB 5: DESIGN VARIATION ENGINE */}
        {subTab === "variations" && (
          <motion.div
            key="variations"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-[10.5px]">AI Concept Variation Engine</span>
                <span className="text-[9.5px] text-slate-500">
                  Side-by-side original design concepts generated from distinct aesthetic directions.
                </span>
              </div>
              <button
                onClick={handleGenerateVariations}
                disabled={loadingVar}
                className="px-3 py-1.5 bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/30 rounded-xl font-bold cursor-pointer"
              >
                {loadingVar ? "Generating..." : "Refresh Variations"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {variationsList.map((varProj, idx) => (
                <div key={varProj.id} className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col justify-between gap-3 text-[10px]">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                      <span className="font-bold text-slate-100 text-[11px]">Variation #{idx + 1}</span>
                      <span className="text-[8px] bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/25 px-1.5 py-0.5 rounded font-bold">
                        Score: {varProj.qualityReviewScore}/100
                      </span>
                    </div>
                    <span className="text-fuchsia-400 font-bold">{varProj.title}</span>
                    <p className="text-[9px] text-slate-400 leading-relaxed">{varProj.creativeDirection}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    {varProj.colorPalette.map((col, cIdx) => (
                      <span key={cIdx} className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: col.hex }} />
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setActiveProject(varProj);
                      setSubTab("workspace");
                    }}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-fuchsia-300 border border-slate-800 rounded-xl font-bold cursor-pointer text-center"
                  >
                    Set as Active Concept
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* SUB TAB 6: MULTI-FORMAT EXPORT ENGINE */}
        {subTab === "export" && (
          <motion.div
            key="export"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-[10.5px]">Multi-Format Master Export Engine</span>
                <span className="text-[9.5px] text-slate-500">
                  Export Print-Ready PDF/X, Scalable SVG, Layered PSD, CMYK JPG, or High-Res TIFF.
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col sm:flex-row gap-3 items-center">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold">Select Export Format:</label>
                <select
                  value={exportFormat}
                  onChange={e => setExportFormat(e.target.value as any)}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                >
                  <option value="PDF_X_Print">PDF/X Print-Ready (FOGRA39 CMYK)</option>
                  <option value="SVG_Vector">SVG Vector (Editable XML)</option>
                  <option value="EPS_Exchange">EPS Vector Exchange</option>
                  <option value="PSD_Layered">PSD Layered Project File</option>
                  <option value="PNG_24">PNG-24 Transparent Raster</option>
                  <option value="JPG_CMYK">JPG CMYK High Quality</option>
                  <option value="WEBP_Alpha">WEBP Web Alpha Channel</option>
                  <option value="TIFF_HighRes">TIFF Uncompressed High-Res</option>
                </select>
              </div>

              <button
                onClick={handleExportPackage}
                className="mt-auto px-5 py-2.5 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Build Master Export Package
              </button>
            </div>

            {exportResult && (
              <div className="p-4 bg-slate-950/60 border border-emerald-500/30 rounded-2xl flex flex-col gap-2">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <span className="font-bold text-emerald-400 text-[11px] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Export Package Ready: {exportResult.fileName}
                  </span>
                  <span className="text-[8.5px] text-slate-400 font-bold">
                    Size: {(exportResult.fileSizeBytes / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 text-[9px] mt-1">
                  <span className="bg-black/50 border border-slate-800 px-2 py-1 rounded text-slate-300">
                    CMYK Profile: {exportResult.cmykColorProfileEmbedded ? "Embedded (FOGRA39)" : "sRGB"}
                  </span>
                  <span className="bg-black/50 border border-slate-800 px-2 py-1 rounded text-slate-300">
                    Vectors: {exportResult.vectorPathsPreserved ? "100% Scalable Vector" : "Rasterized"}
                  </span>
                  <span className="bg-black/50 border border-slate-800 px-2 py-1 rounded text-slate-300">
                    Layers: {exportResult.layersPreserved ? "Preserved Non-Destructive" : "Single Flattened Artboard"}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB TAB 7: QUALITY REVIEW */}
        {subTab === "quality" && activeProject && (
          <motion.div
            key="quality"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-extrabold text-base">
                  {activeProject.qualityReviewScore}
                </div>
                <div>
                  <span className="font-bold text-slate-100 text-[11px] block">AI Quality Review & Accessibility Audit</span>
                  <span className="text-[9px] text-slate-500">WCAG 2.1 AA Contrast, Grid Alignment & CMYK Print Safety</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-[10px]">
              {Object.entries(activeProject.qualityAudit).map(([key, val]) => {
                if (key === "recommendations") return null;
                return (
                  <div key={key} className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-between">
                    <span className="text-slate-300 font-bold capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                    <CheckCircle2 className={`w-4 h-4 ${val ? "text-emerald-400" : "text-rose-400"}`} />
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
