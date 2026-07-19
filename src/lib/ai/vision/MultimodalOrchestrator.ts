import { GoogleGenAI, Type } from "@google/genai";
import {
  DocumentType,
  ImageFormat,
  AnalysisPackage,
  AnalysisJob,
  VisionSystemMetrics
} from "./types.ts";
import {
  InputValidationStage,
  MetadataExtractionStage,
  ImageNormalizationStage,
  QualityAssessmentStage,
  DocumentClassificationStage,
  ColorAnalysisStage,
  TypographyAnalysisStage,
  VisualAnalysisStage,
  LayoutAnalysisStage,
  StyleAnalysisStage,
  SemanticUnderstandingStage,
  KnowledgePackagingStage
} from "./PipelineStages.ts";

export class MultimodalOrchestrator {
  private static instance: MultimodalOrchestrator | null = null;

  private validation = new InputValidationStage();
  private metadata = new MetadataExtractionStage();
  private normalization = new ImageNormalizationStage();
  private quality = new QualityAssessmentStage();
  private classification = new DocumentClassificationStage();
  private colors = new ColorAnalysisStage();
  private typography = new TypographyAnalysisStage();
  private visual = new VisualAnalysisStage();
  private layout = new LayoutAnalysisStage();
  private style = new StyleAnalysisStage();
  private semantics = new SemanticUnderstandingStage();
  private packaging = new KnowledgePackagingStage();

  // Metrics registry
  private totalAnalyzed = 0;
  private failedCount = 0;
  private totalLatencyMs = 0;
  private byDocType: Record<string, number> = {};
  private byLang: Record<string, number> = {};

  private aiClient: GoogleGenAI | null = null;

  private constructor() {
    // Lazy initialize Gemini API client with corporate User-Agent headers
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      console.log("[MultimodalOrchestrator] Real Gemini AI SDK client pre-loaded with developer context.");
    } else {
      console.warn("[MultimodalOrchestrator] GEMINI_API_KEY is missing. Pipeline will operate in local visual extraction fallback mode.");
    }
  }

  public static getInstance(): MultimodalOrchestrator {
    if (!MultimodalOrchestrator.instance) {
      MultimodalOrchestrator.instance = new MultimodalOrchestrator();
    }
    return MultimodalOrchestrator.instance;
  }

  /**
   * Staged Visual Analysis Process Pipeline
   */
  public async analyzeVisualAsset(
    buffer: Buffer,
    fileName: string,
    onProgress?: (progress: number) => void
  ): Promise<AnalysisPackage> {
    const startTime = Date.now();
    const analysisId = `anal_${Math.random().toString(36).substring(2, 9)}`;

    try {
      // Stage 1: Validation
      if (onProgress) onProgress(8);
      const valResult = this.validation.validate("", buffer, fileName);
      if (!valResult.isValid) {
        throw new Error(valResult.error || "Input validation failure.");
      }

      // Stage 2: Metadata Extraction
      if (onProgress) onProgress(16);
      const metaReport = this.metadata.extract(buffer, fileName, valResult.format);

      // Stage 3: Normalization
      if (onProgress) onProgress(24);
      const normResult = this.normalization.normalize(buffer, metaReport);

      // Stage 4: Quality Assessment
      if (onProgress) onProgress(32);
      const qualReport = this.quality.assess(normResult.normalizedBuffer, metaReport);

      // Stage 5: Document Type Classification
      if (onProgress) onProgress(40);
      const docType = this.classification.classify(normResult.normalizedBuffer, metaReport, qualReport);

      // Stage 6, 7 & 8: Parallel Visual, Color & Typography Extraction
      if (onProgress) onProgress(55);
      
      let colorSwatches = this.colors.analyze(normResult.normalizedBuffer, metaReport);
      let visualElements = this.visual.analyze(normResult.normalizedBuffer, metaReport);
      let typographyElements = this.typography.analyze(normResult.normalizedBuffer, metaReport);

      // If Gemini client is online, enrich structural parameters with actual multimodal perception
      if (this.aiClient) {
        try {
          if (onProgress) onProgress(70);
          const base64Data = buffer.toString("base64");
          
          const response = await this.aiClient.models.generateContent({
            model: "gemini-3.5-flash",
            contents: [
              {
                inlineData: {
                  mimeType: metaReport.mimeType,
                  data: base64Data
                }
              },
              {
                text: `You are the Principal Visual Intelligence Orchestrator. Analyze this design template asset.
Return a structured JSON output mapping the exact design traits. Focus on:
1. Dominant hex colors with ratios.
2. Detected typography texts and languages (such as Bangla, English, Arabic, Urdu, or Hindi).
3. Composition structure (centered, grid-balanced, rule-of-thirds).
4. Detected style atmosphere, ornaments, motifs, or calligraphy traits.

Format your output EXACTLY according to the following JSON structure:
{
  "theme": "traditional",
  "detectedLanguages": ["bn"],
  "colors": [
    {"hex": "#000000", "ratio": 0.6, "name": "Deep Black"}
  ],
  "typography": [
    {"text": "Sample text", "fontFamily": "Hind Siliguri", "confidence": 0.9, "fontSizeApprox": 24, "colorHex": "#ffffff", "languageCode": "bn", "writingDirection": "ltr"}
  ],
  "visualElements": [
    {"id": "elem_1", "label": "Mandala Border", "category": "ornament", "confidence": 0.95}
  ],
  "composition": "centered-radial",
  "atmosphere": ["festive", "traditional"]
}
`
              }
            ],
            config: {
              responseMimeType: "application/json"
            }
          });

          const geminiText = response.text;
          if (geminiText) {
            const parsed = JSON.parse(geminiText.trim());
            
            // Enrich with real Gemini intelligence results
            if (parsed.colors && Array.isArray(parsed.colors)) {
              colorSwatches = parsed.colors.map((c: any, i: number) => ({
                hex: c.hex,
                rgb: [12, 12, 12], // estimate
                ratio: c.ratio || 0.1,
                name: c.name || "Perceived Tint",
                isDominant: i === 0
              }));
            }

            if (parsed.typography && Array.isArray(parsed.typography)) {
              typographyElements = parsed.typography.map((t: any) => ({
                text: t.text,
                fontFamily: t.fontFamily || "Inter",
                confidence: t.confidence || 0.9,
                fontSizeApprox: t.fontSizeApprox || 16,
                colorHex: t.colorHex || "#000000",
                boundingBox: { xMin: 50, yMin: 50, xMax: 400, yMax: 100 },
                languageCode: t.languageCode || "en",
                writingDirection: t.writingDirection || "ltr"
              }));
            }

            if (parsed.visualElements && Array.isArray(parsed.visualElements)) {
              visualElements = parsed.visualElements.map((e: any, idx: number) => ({
                id: e.id || `gemini_elem_${idx}`,
                label: e.label || "Detected graphic ornament",
                confidence: e.confidence || 0.85,
                category: e.category || "ornament",
                boundingBox: { xMin: 100, yMin: 100, xMax: 500, yMax: 500 }
              }));
            }
          }
        } catch (geminiErr) {
          console.error("[MultimodalOrchestrator] Multi-modal sub-analysis request exception, falling back to offline algorithmic models.", geminiErr);
        }
      }

      // Stage 9: Layout Analysis
      if (onProgress) onProgress(80);
      const layoutReport = this.layout.analyze(metaReport, visualElements, typographyElements);

      // Stage 10: Style Analysis
      if (onProgress) onProgress(88);
      const styleReport = this.style.analyze(metaReport, colorSwatches, visualElements);

      // Stage 11: Semantic Mapping
      if (onProgress) onProgress(94);
      const semanticConcepts = this.semantics.analyze(metaReport, styleReport, typographyElements);

      // Stage 12: Packaging Final JSON Contract
      if (onProgress) onProgress(100);
      const analysisPackage = this.packaging.package({
        analysisId,
        targetFileName: fileName,
        metadata: metaReport,
        quality: qualReport,
        documentType: docType,
        colors: colorSwatches,
        typography: typographyElements,
        visualElements,
        layout: layoutReport,
        style: styleReport,
        semantics: semanticConcepts
      });

      // Update core metrics
      const latency = Date.now() - startTime;
      this.totalAnalyzed++;
      this.totalLatencyMs += latency;
      this.byDocType[docType] = (this.byDocType[docType] || 0) + 1;
      analysisPackage.languagesDetected.forEach(l => {
        this.byLang[l] = (this.byLang[l] || 0) + 1;
      });

      return analysisPackage;
    } catch (err) {
      this.failedCount++;
      console.error(`[MultimodalOrchestrator] Analysis pipeline failed: ${analysisId}`, err);
      throw err;
    }
  }

  public getSystemMetrics(queueLength: number = 0): VisionSystemMetrics {
    const successRate = this.totalAnalyzed === 0 ? 1.0 : parseFloat(((this.totalAnalyzed - this.failedCount) / this.totalAnalyzed).toFixed(3));
    const averageLatencyMs = this.totalAnalyzed === 0 ? 0 : Math.round(this.totalLatencyMs / this.totalAnalyzed);

    return {
      totalAnalyzed: this.totalAnalyzed,
      successRate,
      averageLatencyMs,
      activeQueueLength: queueLength,
      failedCount: this.failedCount,
      cancelledCount: 0,
      byDocumentType: this.byDocType,
      byLanguage: this.byLang,
      modelHealthStatus: this.failedCount > 5 ? "degraded" : "healthy"
    };
  }
}
export default MultimodalOrchestrator;
