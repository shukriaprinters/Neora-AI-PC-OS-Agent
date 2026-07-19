import { IStorageDriver } from "./types.ts";

export class LocalStorageDriver implements IStorageDriver {
  private fileSystem = new Map<string, { buffer: Buffer; filename: string }>();

  public async save(assetId: string, filename: string, buffer: Buffer, type: "original" | "normalized" | "preview" | "thumb"): Promise<string> {
    const virtualPath = `/storage/ingestion/${assetId}/${type}_${filename}`;
    this.fileSystem.set(virtualPath, { buffer, filename });
    return virtualPath;
  }

  public async retrieve(path: string): Promise<Buffer> {
    const entry = this.fileSystem.get(path);
    if (!entry) {
      throw new Error(`Asset not found at storage path: ${path}`);
    }
    return entry.buffer;
  }

  public async delete(path: string): Promise<boolean> {
    return this.fileSystem.delete(path);
  }

  public async exists(path: string): Promise<boolean> {
    return this.fileSystem.has(path);
  }

  public listAllPaths(): string[] {
    return Array.from(this.fileSystem.keys());
  }

  /**
   * Helper to seed starting samples
   */
  public seedSample(path: string, buffer: Buffer, filename: string) {
    this.fileSystem.set(path, { buffer, filename });
  }
}

export class StorageService {
  private driver: IStorageDriver;

  constructor(driver: IStorageDriver = new LocalStorageDriver()) {
    this.driver = driver;
  }

  public getDriver(): IStorageDriver {
    return this.driver;
  }

  public async storeAsset(
    assetId: string,
    filename: string,
    originalBuffer: Buffer,
    normalizedBuffer: Buffer
  ): Promise<{
    originalUrl: string;
    normalizedUrl: string;
    previewWebUrl: string;
    thumbnailSmallUrl: string;
    thumbnailMediumUrl: string;
    thumbnailLargeUrl: string;
    printPreviewUrl: string;
  }> {
    // Generate simulated elegant canvases/previews
    const origUrl = await this.driver.save(assetId, filename, originalBuffer, "original");
    const normUrl = await this.driver.save(assetId, filename, normalizedBuffer, "normalized");
    const previewUrl = await this.driver.save(assetId, filename, normalizedBuffer, "preview");
    const thumbSmall = await this.driver.save(assetId, `small_${filename}`, normalizedBuffer, "thumb");
    const thumbMed = await this.driver.save(assetId, `medium_${filename}`, normalizedBuffer, "thumb");
    const thumbLarge = await this.driver.save(assetId, `large_${filename}`, normalizedBuffer, "thumb");
    const printUrl = await this.driver.save(assetId, `print_${filename}`, normalizedBuffer, "preview");

    return {
      originalUrl: origUrl,
      normalizedUrl: normUrl,
      previewWebUrl: previewUrl,
      thumbnailSmallUrl: thumbSmall,
      thumbnailMediumUrl: thumbMed,
      thumbnailLargeUrl: thumbLarge,
      printPreviewUrl: printUrl
    };
  }
}
export default StorageService;
