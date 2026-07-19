/**
 * Neora Layout Intelligence Engine - Verification Testing Suite
 * 
 * Verifies the integrity of mathematical layout scoring, grid clustering, 
 * reading order ranking, and print/digital safe area audits.
 */

import { LayoutIntelligenceEngine, LayoutIntelligenceTelemetry } from "./LayoutIntelligenceEngine";

export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

export class LayoutEngineTestSuite {
  public static runAll(): TestResult[] {
    const results: TestResult[] = [];

    results.push(this.testGridDetection());
    results.push(this.testVisualHierarchy());
    results.push(this.testCompositionScoring());
    results.push(this.testWhitespaceIntelligence());
    results.push(this.testStressTestEmptyCanvas());
    results.push(this.testStressTestHeavyOvercrowdedCanvas());
    results.push(this.testPrintSafeZoneAudit());
    results.push(this.testRegressionBenchmarks());

    return results;
  }

  private static testGridDetection(): TestResult {
    const startTime = Date.now();
    try {
      const mockLayers = [
        { id: "1", name: "Left Block 1", x: 10, y: 10, width: 25, height: 20 },
        { id: "2", name: "Left Block 2", x: 10, y: 35, width: 25, height: 20 },
        { id: "3", name: "Right Block 1", x: 60, y: 10, width: 30, height: 20 },
        { id: "4", name: "Right Block 2", x: 60, y: 35, width: 30, height: 20 }
      ];

      const report = LayoutIntelligenceEngine.analyzeLayout("Website Hero", 1000, 1000, mockLayers);

      const passed = report.grid.type === "two-column";
      return {
        suite: "Grid Detection Suite",
        name: "Two-Column Spacing Clustering",
        passed,
        message: passed 
          ? `Correctly identified two-column layout clustering. Gutter: ${report.grid.gutterWidth}px.`
          : `Failed: Expected 'two-column', got '${report.grid.type}'`,
        durationMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        suite: "Grid Detection Suite",
        name: "Two-Column Spacing Clustering",
        passed: false,
        message: `Exception: ${err.message}`,
        durationMs: Date.now() - startTime
      };
    }
  }

  private static testVisualHierarchy(): TestResult {
    const startTime = Date.now();
    try {
      const mockLayers = [
        { id: "body1", name: "Intro Body text", type: "text", fontSize: 14, x: 10, y: 40, width: 80, height: 10 },
        { id: "head1", name: "Primary Title Headline", type: "text", fontSize: 42, x: 10, y: 10, width: 80, height: 15 },
        { id: "subhead1", name: "Subtitle block", type: "text", fontSize: 22, x: 10, y: 28, width: 80, height: 8 }
      ];

      const report = LayoutIntelligenceEngine.analyzeLayout("Poster", 1000, 1000, mockLayers);

      // Main Title (head1) should have the first sequence position (dominant visual weight)
      const passed = report.hierarchy[0].id === "head1";
      return {
        suite: "Hierarchy Analysis Suite",
        name: "Typographic Scale Weighting",
        passed,
        message: passed
          ? `Properly mapped primary focus to 'head1' with attention weight: ${report.hierarchy[0].attentionPercentage}%.`
          : "Failed: Large headline was not identified as sequence order #1.",
        durationMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        suite: "Hierarchy Analysis Suite",
        name: "Typographic Scale Weighting",
        passed: false,
        message: `Exception: ${err.message}`,
        durationMs: Date.now() - startTime
      };
    }
  }

  private static testCompositionScoring(): TestResult {
    const startTime = Date.now();
    try {
      // Exactly symmetric around x=50
      const mockLayers = [
        { id: "1", name: "Symmetric left container", x: 10, y: 20, width: 35, height: 40 },
        { id: "2", name: "Symmetric right container", x: 55, y: 20, width: 35, height: 40 }
      ];

      const report = LayoutIntelligenceEngine.analyzeLayout("Poster", 1000, 1000, mockLayers);

      const passed = report.composition.type === "symmetrical" && report.scorecard.balance.score >= 90;
      return {
        suite: "Composition Suite",
        name: "Symmetric Grid Balance Scoring",
        passed,
        message: passed
          ? `Evaluated symmetrical placement balance. Scorecard rating: ${report.scorecard.balance.score}/100.`
          : `Failed: Expected 'symmetrical' style and high score, got '${report.composition.type}' score=${report.scorecard.balance.score}`,
        durationMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        suite: "Composition Suite",
        name: "Symmetric Grid Balance Scoring",
        passed: false,
        message: `Exception: ${err.message}`,
        durationMs: Date.now() - startTime
      };
    }
  }

  private static testWhitespaceIntelligence(): TestResult {
    const startTime = Date.now();
    try {
      const mockLayers = [
        { id: "1", name: "Minimal layout centerpiece", x: 40, y: 40, width: 20, height: 20 }
      ];

      const report = LayoutIntelligenceEngine.analyzeLayout("Book Cover", 1000, 1000, mockLayers);

      const passed = report.whitespace.breathingRoomIndex >= 0.8 && report.whitespace.negativeSpaceRatio >= 0.9;
      return {
        suite: "Whitespace Intelligence Suite",
        name: "Breathing Space and Density Mapping",
        passed,
        message: passed
          ? `Verified minimalist breathing space. Negative space: ${report.whitespace.negativeSpaceRatio * 100}%.`
          : "Failed: Whitespace ratios incorrect for single minimalist element.",
        durationMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        suite: "Whitespace Intelligence Suite",
        name: "Breathing Space and Density Mapping",
        passed: false,
        message: `Exception: ${err.message}`,
        durationMs: Date.now() - startTime
      };
    }
  }

  private static testStressTestEmptyCanvas(): TestResult {
    const startTime = Date.now();
    try {
      const report = LayoutIntelligenceEngine.analyzeLayout("Flyer", 800, 800, []);
      const passed = report.hierarchy.length === 0 && report.scorecard.overallComposite > 0;
      return {
        suite: "Stress Testing Suite",
        name: "Null/Empty Canvas Integrity",
        passed,
        message: passed
          ? "Engine handled empty layer stacks elegantly without crashing. Overall composite computed safely."
          : "Failed: Empty canvas returned invalid scorecard metrics.",
        durationMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        suite: "Stress Testing Suite",
        name: "Null/Empty Canvas Integrity",
        passed: false,
        message: `Exception: ${err.message}`,
        durationMs: Date.now() - startTime
      };
    }
  }

  private static testStressTestHeavyOvercrowdedCanvas(): TestResult {
    const startTime = Date.now();
    try {
      // 20 overlapping heavy layers
      const heavyLayers: any[] = [];
      for (let i = 0; i < 25; i++) {
        heavyLayers.push({
          id: `stress_${i}`,
          name: `Overlapping Layer Block #${i}`,
          x: 5,
          y: 5,
          width: 90,
          height: 90
        });
      }

      const report = LayoutIntelligenceEngine.analyzeLayout("Poster", 1200, 1200, heavyLayers);
      const passed = report.warnings.length > 0 && report.whitespace.crowdingScore > 0.8;
      return {
        suite: "Stress Testing Suite",
        name: "Max Density/Congested Grid Load",
        passed,
        message: passed
          ? `Identified extreme overcrowding warnings. Crowding score: ${report.whitespace.crowdingScore}.`
          : "Failed: Congestion warnings were not triggered for heavy layout overlap.",
        durationMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        suite: "Stress Testing Suite",
        name: "Max Density/Congested Grid Load",
        passed: false,
        message: `Exception: ${err.message}`,
        durationMs: Date.now() - startTime
      };
    }
  }

  private static testPrintSafeZoneAudit(): TestResult {
    const startTime = Date.now();
    try {
      const mockLayers = [
        { id: "header", name: "Title Logo", type: "text", fontSize: 20, x: 2, y: 2, width: 30, height: 10 } // Violates 5% safe zone
      ];

      const report = LayoutIntelligenceEngine.analyzeLayout("Poster", 1000, 1000, mockLayers);
      const passed = report.audit.safeZoneViolationCount === 1 && report.warnings.some(w => w.includes("safe-trim"));
      return {
        suite: "Print Audit Suite",
        name: "Trim Boundary and Bleed Violation Detect",
        passed,
        message: passed
          ? `Successfully caught safe area breach of key text block. Scorecard print readiness: ${report.scorecard.printReadiness.score}%.`
          : "Failed: Bleed audit failed to catch text block extending into boundary.",
        durationMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        suite: "Print Audit Suite",
        name: "Trim Boundary and Bleed Violation Detect",
        passed: false,
        message: `Exception: ${err.message}`,
        durationMs: Date.now() - startTime
      };
    }
  }

  private static testRegressionBenchmarks(): TestResult {
    const startTime = Date.now();
    try {
      const mockLayers = [
        { id: "1", name: "Main Brand Heading", type: "text", fontSize: 32, x: 10, y: 15, width: 80, height: 10 },
        { id: "2", name: "Intro Paragraph block", type: "text", fontSize: 14, x: 10, y: 30, width: 80, height: 15 },
        { id: "3", name: "CTA Zone button text", type: "text", fontSize: 16, x: 10, y: 75, width: 30, height: 8 }
      ];

      // Benchmark timing
      const report = LayoutIntelligenceEngine.analyzeLayout("Banner", 1920, 1080, mockLayers);
      const passed = report.processingTimeMs < 100; // should run well within 100ms
      const tele = LayoutIntelligenceTelemetry.get();

      return {
        suite: "Regression Suite",
        name: "High-Throughput Millisecond Latency Benchmark",
        passed,
        message: passed
          ? `Passed benchmark timing: ${report.processingTimeMs}ms. Core average tracked latency: ${Math.round(tele.averageLatencyMs * 100) / 100}ms.`
          : `Failed: Latency of ${report.processingTimeMs}ms exceeded threshold.`,
        durationMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        suite: "Regression Suite",
        name: "High-Throughput Millisecond Latency Benchmark",
        passed: false,
        message: `Exception: ${err.message}`,
        durationMs: Date.now() - startTime
      };
    }
  }
}
