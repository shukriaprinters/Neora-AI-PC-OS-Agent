export enum IngestionStatus {
  QUEUED = "queued",
  VIRUS_SCANNING = "virus_scanning",
  VALIDATING = "validating",
  NORMALIZING = "normalizing",
  GENERATING_PREVIEWS = "generating_previews",
  EXTRACTING_METADATA = "extracting_metadata",
  DUPLICATE_CHECKING = "duplicate_checking",
  COMPLETED = "completed",
  FAILED = "failed"
}

export enum IngestionFormat {
  PNG = "png",
  JPEG = "jpeg",
  WEBP = "webp",
  TIFF = "tiff",
  BMP = "bmp",
  GIF = "gif",
  AVIF = "avif",
  HEIC = "heic",
  SVG = "svg",
  PDF = "pdf",
  PSD = "psd",
  AI = "ai",
  EPS = "eps",
  UNKNOWN = "unknown"
}

export interface IngestedAssetMetadata {
  width: number;
  height: number;
  aspectRatio: string;
  resolutionDPI: number;
  colorSpace: string;
  iccProfileName?: string;
  fileSizeBytes: number;
  mimeType: string;
  format: IngestionFormat;
  hasAlphaChannel: boolean;
  animationFrames?: number;
  layerCount?: number;
  embeddedFonts?: string[];
  creationDate?: string;
}

export interface IngestedAssetFingerprint {
  sha256: string;
  aHash: string; // Average hash string
  dHash: string; // Difference hash string
  pHash: string; // Perceptual hash string
  colorSignature: string; // dominant hex distribution representation
  textureSignature: string;
  shapeSignature: string;
}

export interface DuplicateReport {
  isExactDuplicate: boolean;
  isNearDuplicate: boolean;
  similarityScore: number; // 0.0 to 1.0
  matchingAssetId?: string;
  matchingAspect?: "exact_match" | "resized" | "compressed" | "color_adjusted" | "watermarked" | "none";
}

export interface IngestedAssetPreviews {
  originalUrl: string;
  normalizedUrl: string;
  previewWebUrl: string;
  thumbnailSmallUrl: string;
  thumbnailMediumUrl: string;
  thumbnailLargeUrl: string;
  printPreviewUrl: string;
}

export interface IngestionJob {
  jobId: string;
  fileName: string;
  originalSize: number;
  status: IngestionStatus;
  progress: number; // 0 to 100
  priority: "high" | "normal" | "low";
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  metadata?: IngestedAssetMetadata;
  fingerprint?: IngestedAssetFingerprint;
  duplicates?: DuplicateReport;
  previews?: IngestedAssetPreviews;
  retryCount: number;
}

export interface IngestionMetrics {
  totalIngested: number;
  totalFailed: number;
  totalDuplicatesDetected: number;
  averageIngestionTimeMs: number;
  activeQueueLength: number;
  storageUsageBytes: number;
  byFormat: Record<string, number>;
  workerStatus: "active" | "idle" | "paused" | "error";
}

export interface IStorageDriver {
  save(assetId: string, filename: string, buffer: Buffer, type: "original" | "normalized" | "preview" | "thumb"): Promise<string>;
  retrieve(path: string): Promise<Buffer>;
  delete(path: string): Promise<boolean>;
  exists(path: string): Promise<boolean>;
}
