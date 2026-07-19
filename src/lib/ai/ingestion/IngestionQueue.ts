import { IngestionJob, IngestionStatus, IngestionFormat, IngestionMetrics, DuplicateReport } from "./types.ts";
import { ValidationService } from "./ValidationService.ts";
import { NormalizationService } from "./NormalizationService.ts";
import { FingerprintService } from "./FingerprintService.ts";
import { StorageService } from "./StorageService.ts";

export type IngestionEventListener = (job: IngestionJob) => void;

export class IngestionQueue {
  private jobs: Map<string, IngestionJob> = new Map();
  private listeners: Set<IngestionEventListener> = new Set();
  
  private validator = new ValidationService();
  private normalizer = new NormalizationService();
  private fingerprinter = new FingerprintService();
  private storage = new StorageService();

  constructor() {
    this.seedDemoJobs();
  }

  /**
   * Register listener for real-time websocket-like progress updates
   */
  public subscribe(listener: IngestionEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(job: IngestionJob) {
    this.listeners.forEach((l) => {
      try {
        l({ ...job });
      } catch (err) {
        console.error("[IngestionQueue] Error notifying listener", err);
      }
    });
  }

  public getJobs(): IngestionJob[] {
    return Array.from(this.jobs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getJob(jobId: string): IngestionJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Submit an asset byte stream to the pipeline queue asynchronously
   */
  public async submitAsset(filename: string, buffer: Buffer, priority: "high" | "normal" | "low" = "normal"): Promise<string> {
    const jobId = `job_${Math.random().toString(36).substring(2, 11)}`;
    const job: IngestionJob = {
      jobId,
      fileName: filename,
      originalSize: buffer.length,
      status: IngestionStatus.QUEUED,
      progress: 0,
      priority,
      createdAt: new Date().toISOString(),
      retryCount: 0
    };

    this.jobs.set(jobId, job);
    this.notify(job);

    // Run the pipeline as non-blocking async
    this.processJobAsync(jobId, buffer);

    return jobId;
  }

  /**
   * Triggers reprocess of a failed or completed asset
   */
  public async reprocessAsset(jobId: string, buffer: Buffer): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    job.status = IngestionStatus.QUEUED;
    job.progress = 0;
    job.errorMessage = undefined;
    job.completedAt = undefined;
    job.startedAt = new Date().toISOString();

    this.notify(job);
    this.processJobAsync(jobId, buffer);
    return true;
  }

  /**
   * Asynchronous stage processing orchestrator with retries and status changes
   */
  private async processJobAsync(jobId: string, buffer: Buffer) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      job.startedAt = new Date().toISOString();

      // Stage 1: Virus & Malware Scanning simulation
      job.status = IngestionStatus.VIRUS_SCANNING;
      job.progress = 15;
      this.notify(job);
      await this.sleep(400);

      // Stage 2: Security Validation & Format Check
      job.status = IngestionStatus.VALIDATING;
      job.progress = 30;
      this.notify(job);
      await this.sleep(450);

      const validation = this.validator.validateAsset(buffer, job.fileName);
      if (!validation.isValid) {
        throw new Error(validation.error || "File validation security policy violation");
      }

      // Stage 3: Dynamic Byte Normalization
      job.status = IngestionStatus.NORMALIZING;
      job.progress = 50;
      this.notify(job);
      await this.sleep(500);

      const { normalizedBuffer, metadata } = this.normalizer.normalize(buffer, validation.format);
      job.metadata = metadata;

      // Stage 4: Visual Cryptographic Hashing & Perceptual Signatures
      job.status = IngestionStatus.DUPLICATE_CHECKING;
      job.progress = 70;
      this.notify(job);
      await this.sleep(400);

      const fingerprint = this.fingerprinter.generateFingerprint(normalizedBuffer, job.fileName);
      job.fingerprint = fingerprint;

      // Perform cross-job near-duplicate scoring comparisons
      let duplicateReport: DuplicateReport = {
        isExactDuplicate: false,
        isNearDuplicate: false,
        similarityScore: 0.0,
        matchingAspect: "none"
      };

      for (const existingJob of this.jobs.values()) {
        if (existingJob.jobId !== jobId && existingJob.fingerprint && existingJob.status === IngestionStatus.COMPLETED) {
          const check = this.fingerprinter.calculateSimilarity(fingerprint, existingJob.fingerprint);
          if (check.similarityScore > duplicateReport.similarityScore) {
            duplicateReport = {
              ...check,
              matchingAssetId: existingJob.jobId
            };
          }
        }
      }
      job.duplicates = duplicateReport;

      // Stage 5: Responsive Previews and Mipmaps Render
      job.status = IngestionStatus.GENERATING_PREVIEWS;
      job.progress = 85;
      this.notify(job);
      await this.sleep(450);

      const urls = await this.storage.storeAsset(jobId, job.fileName, buffer, normalizedBuffer);
      job.previews = urls;

      // Stage 6: Completion
      job.status = IngestionStatus.COMPLETED;
      job.progress = 100;
      job.completedAt = new Date().toISOString();
      this.notify(job);

    } catch (err: any) {
      console.error(`[IngestionQueue] Error running ingestion pipeline on JobId: ${jobId}`, err);

      if (job.retryCount < 2) {
        job.retryCount++;
        job.status = IngestionStatus.QUEUED;
        job.progress = 0;
        this.notify(job);
        // Wait and auto-retry
        await this.sleep(1000);
        this.processJobAsync(jobId, buffer);
      } else {
        job.status = IngestionStatus.FAILED;
        job.progress = 100;
        job.errorMessage = err.message || "Unknown Ingestion Error";
        this.notify(job);
      }
    }
  }

  /**
   * Delete an asset
   */
  public deleteAsset(jobId: string): boolean {
    return this.jobs.delete(jobId);
  }

  /**
   * Computes clean enterprise dashboard analytics
   */
  public getMetrics(): IngestionMetrics {
    const all = Array.from(this.jobs.values());
    const completed = all.filter((j) => j.status === IngestionStatus.COMPLETED);
    const failed = all.filter((j) => j.status === IngestionStatus.FAILED);
    const active = all.filter((j) => j.status !== IngestionStatus.COMPLETED && j.status !== IngestionStatus.FAILED);

    const formatCounts: Record<string, number> = {};
    let totalBytes = 0;

    all.forEach((j) => {
      totalBytes += j.originalSize;
      if (j.metadata) {
        const fmt = j.metadata.format;
        formatCounts[fmt] = (formatCounts[fmt] || 0) + 1;
      }
    });

    const times = completed
      .map((j) => {
        if (!j.startedAt || !j.completedAt) return 0;
        return new Date(j.completedAt).getTime() - new Date(j.startedAt).getTime();
      })
      .filter((t) => t > 0);

    const avgTime = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

    return {
      totalIngested: completed.length,
      totalFailed: failed.length,
      totalDuplicatesDetected: all.filter((j) => j.duplicates?.isNearDuplicate || j.duplicates?.isExactDuplicate).length,
      averageIngestionTimeMs: avgTime,
      activeQueueLength: active.length,
      storageUsageBytes: totalBytes,
      byFormat: formatCounts,
      workerStatus: active.length > 0 ? "active" : "idle"
    };
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Populate realistic seed assets for instant elegant layout loading
   */
  private seedDemoJobs() {
    const demoFiles = [
      { name: "header_hero_v2.png", size: 1024 * 1024 * 4.2, format: IngestionFormat.PNG, w: 3840, h: 2160, ratio: "16:9", dpi: 150, space: "sRGB" },
      { name: "editorial_fashion_spread.jpg", size: 1024 * 512 * 3.8, format: IngestionFormat.JPEG, w: 2400, h: 3600, ratio: "2:3", dpi: 300, space: "Adobe RGB" },
      { name: "brand_mark_logo.svg", size: 25 * 1024, format: IngestionFormat.SVG, w: 512, h: 512, ratio: "1:1", dpi: 72, space: "Vector (RGB)" },
      { name: "app_store_icon_flattened.psd", size: 1024 * 1024 * 24.5, format: IngestionFormat.PSD, w: 1024, h: 1024, ratio: "1:1", dpi: 300, space: "sRGB" }
    ];

    demoFiles.forEach((f, index) => {
      const jobId = `job_seed_${index + 1}`;
      const createdAt = new Date(Date.now() - (index + 1) * 3600000).toISOString();
      const completedAt = new Date(Date.now() - (index + 1) * 3600000 + 1200).toISOString();

      const metadata = {
        width: f.w,
        height: f.h,
        aspectRatio: f.ratio,
        resolutionDPI: f.dpi,
        colorSpace: f.space,
        iccProfileName: "P3 Color Gamut Profiler",
        fileSizeBytes: Math.round(f.size),
        mimeType: f.format === IngestionFormat.PNG ? "image/png" : f.format === IngestionFormat.JPEG ? "image/jpeg" : f.format === IngestionFormat.SVG ? "image/svg+xml" : "image/vnd.adobe.photoshop",
        format: f.format,
        hasAlphaChannel: f.format !== IngestionFormat.JPEG,
        layerCount: f.format === IngestionFormat.PSD ? 14 : undefined
      };

      const fingerprint = {
        sha256: `sha256_mock_hash_seed_${index}_182a4cff298b47120a8d7123bf`,
        aHash: `aHash_seed_${index}_bf03`,
        dHash: `dHash_seed_${index}_ac74`,
        pHash: `pHash_seed_${index}_e990`,
        colorSignature: f.format === IngestionFormat.PNG ? "#1d4ed8:#059669" : "#0c0a09:#d97706",
        textureSignature: "tex_seed_cf4",
        shapeSignature: "shp_seed_90"
      };

      const originalUrl = `/storage/ingestion/${jobId}/original_${f.name}`;
      const normalizedUrl = `/storage/ingestion/${jobId}/normalized_${f.name}`;

      const job: IngestionJob = {
        jobId,
        fileName: f.name,
        originalSize: Math.round(f.size),
        status: IngestionStatus.COMPLETED,
        progress: 100,
        priority: "normal",
        createdAt,
        startedAt: createdAt,
        completedAt,
        metadata,
        fingerprint,
        duplicates: {
          isExactDuplicate: false,
          isNearDuplicate: false,
          similarityScore: 0.1,
          matchingAspect: "none"
        },
        previews: {
          originalUrl,
          normalizedUrl,
          previewWebUrl: normalizedUrl,
          thumbnailSmallUrl: normalizedUrl,
          thumbnailMediumUrl: normalizedUrl,
          thumbnailLargeUrl: normalizedUrl,
          printPreviewUrl: normalizedUrl
        },
        retryCount: 0
      };

      this.jobs.set(jobId, job);
    });
  }
}

export const ingestionQueue = new IngestionQueue();
export default IngestionQueue;
