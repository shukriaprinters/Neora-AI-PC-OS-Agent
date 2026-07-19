import { AnalysisJob, AnalysisPackage } from "./types.ts";
import { MultimodalOrchestrator } from "./MultimodalOrchestrator.ts";

export class VisionQueue {
  private static instance: VisionQueue | null = null;
  private jobs: Map<string, AnalysisJob> = new Map();
  private processingQueue: string[] = [];
  private isProcessing = false;
  private progressListeners: Map<string, Array<(p: number) => void>> = new Map();

  private constructor() {
    // Start background queue daemon loop
    this.startQueueWorker();
  }

  public static getInstance(): VisionQueue {
    if (!VisionQueue.instance) {
      VisionQueue.instance = new VisionQueue();
    }
    return VisionQueue.instance;
  }

  /**
   * Submit an analysis task to the queue with custom priority
   */
  public submitJob(
    buffer: Buffer,
    fileName: string,
    priority: "high" | "normal" | "low" = "normal"
  ): string {
    const jobId = `job_${Math.random().toString(36).substring(2, 9)}`;
    const job: AnalysisJob = {
      jobId,
      status: "queued",
      progress: 0,
      createdAt: new Date().toISOString(),
      priority,
      retryCount: 0,
      targetFilePath: `/tmp/${jobId}_${fileName}`,
      originalFileName: fileName
    };

    // Keep memory cache of input buffer
    (job as any).buffer = buffer;

    this.jobs.set(jobId, job);

    // Sort queue based on priority hierarchy (high -> normal -> low)
    this.insertIntoQueue(jobId, priority);
    console.log(`[VisionQueue] Job submitted successfully: ID=${jobId}, Priority=${priority}, File=${fileName}`);

    return jobId;
  }

  private insertIntoQueue(jobId: string, priority: "high" | "normal" | "low") {
    if (priority === "high") {
      this.processingQueue.unshift(jobId);
    } else if (priority === "normal") {
      // Insert after high priority jobs
      const index = this.processingQueue.findIndex(id => {
        const j = this.jobs.get(id);
        return j && j.priority === "low";
      });
      if (index === -1) {
        this.processingQueue.push(jobId);
      } else {
        this.processingQueue.splice(index, 0, jobId);
      }
    } else {
      this.processingQueue.push(jobId);
    }
  }

  /**
   * Cancel an active or pending analysis job
   */
  public cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    if (job.status === "completed" || job.status === "failed" || job.status === "cancelled") {
      return false;
    }

    job.status = "cancelled";
    job.progress = 0;
    job.errorMessage = "User initiated queue cancellation token.";
    job.completedAt = new Date().toISOString();

    // Remove from active queue
    this.processingQueue = this.processingQueue.filter(id => id !== jobId);
    console.log(`[VisionQueue] Job cancelled successfully: ID=${jobId}`);
    this.emitProgress(jobId, 0);

    return true;
  }

  /**
   * Batch multiple file submissions in parallel
   */
  public submitBatch(
    files: Array<{ buffer: Buffer; fileName: string }>,
    priority: "high" | "normal" | "low" = "normal"
  ): string[] {
    return files.map(f => this.submitJob(f.buffer, f.fileName, priority));
  }

  public getJob(jobId: string): AnalysisJob | undefined {
    return this.jobs.get(jobId);
  }

  public listJobs(): AnalysisJob[] {
    return Array.from(this.jobs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getQueueLength(): number {
    return this.processingQueue.length;
  }

  /**
   * Progress streaming listeners
   */
  public onJobProgress(jobId: string, listener: (p: number) => void) {
    if (!this.progressListeners.has(jobId)) {
      this.progressListeners.set(jobId, []);
    }
    this.progressListeners.get(jobId)!.push(listener);
  }

  private emitProgress(jobId: string, progress: number) {
    const list = this.progressListeners.get(jobId);
    if (list) {
      list.forEach(cb => {
        try {
          cb(progress);
        } catch (err) {
          // ignore listener errors
        }
      });
    }
  }

  private startQueueWorker() {
    if (this.isProcessing) return;
    
    const tick = async () => {
      if (this.processingQueue.length === 0) {
        this.isProcessing = false;
        setTimeout(tick, 500); // Poll for new jobs
        return;
      }

      this.isProcessing = true;
      const nextId = this.processingQueue.shift();
      if (!nextId) {
        setTimeout(tick, 100);
        return;
      }

      const job = this.jobs.get(nextId);
      if (!job || job.status === "cancelled") {
        setTimeout(tick, 100);
        return;
      }

      // Execute Job with retry wrapper and timeout gates
      job.status = "processing";
      job.startedAt = new Date().toISOString();
      this.emitProgress(nextId, 1);

      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Analysis pipeline timed out after 30000ms threshold.")), 30000)
        );

        const analysisPromise = MultimodalOrchestrator.getInstance().analyzeVisualAsset(
          (job as any).buffer,
          job.originalFileName,
          (progressValue) => {
            job.progress = progressValue;
            this.emitProgress(nextId, progressValue);
          }
        );

        const result = await Promise.race([analysisPromise, timeoutPromise]);
        
        job.status = "completed";
        job.progress = 100;
        job.completedAt = new Date().toISOString();
        job.result = result;
        
        // Clean up memory buffer cache to save container memory footprint
        delete (job as any).buffer;

        console.log(`[VisionQueue] Job processed successfully: ID=${nextId}`);
      } catch (err: any) {
        console.error(`[VisionQueue] Error processing Job ID=${nextId}, Attempt=${job.retryCount}`, err);

        if (job.retryCount < 2 && (job.status as string) !== "cancelled") {
          job.retryCount++;
          job.status = "queued";
          this.insertIntoQueue(nextId, job.priority);
          console.log(`[VisionQueue] Re-queued Job ID=${nextId} for retry. Attempt: ${job.retryCount}`);
        } else {
          job.status = "failed";
          job.errorMessage = err.message || "Unknown analysis crash.";
          job.completedAt = new Date().toISOString();
          delete (job as any).buffer;
        }
      }

      // Proceed immediately to next item
      setTimeout(tick, 100);
    };

    setTimeout(tick, 500);
  }
}
export default VisionQueue;
