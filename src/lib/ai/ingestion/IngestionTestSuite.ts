import { ValidationService } from "./ValidationService.ts";
import { FingerprintService } from "./FingerprintService.ts";
import { NormalizationService } from "./NormalizationService.ts";
import { LocalStorageDriver } from "./StorageService.ts";
import { IngestionFormat } from "./types.ts";

export interface TestResult {
  name: string;
  category: "Security" | "Performance" | "Validation" | "Hashing" | "Storage";
  passed: boolean;
  message?: string;
  durationMs: number;
}

export class IngestionTestSuite {
  private validator = new ValidationService();
  private fingerprinter = new FingerprintService();
  private normalizer = new NormalizationService();
  private storageDriver = new LocalStorageDriver();

  public async runAllTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Security Tests
    results.push(await this.runTest("Guard Against SVG XML Bomb Injection", "Security", async () => {
      const maliciousPayload = Buffer.from(
        `<?xml version="1.0"?>
        <!DOCTYPE svg [
          <!ENTITY lol "lol">
          <!ENTITY lol2 "&lol;&lol;&lol;&lol;&lol;">
        ]>
        <svg width="100" height="100"><text>&lol2;</text></svg>`
      );
      const result = this.validator.sanitizeVectorContent(maliciousPayload, IngestionFormat.SVG);
      if (result.isSecure) {
        throw new Error("Failed to block dangerous nested XML Entity reference");
      }
    }));

    results.push(await this.runTest("Guard Against SVG Script Tag Injection", "Security", async () => {
      const maliciousPayload = Buffer.from(
        `<svg width="100" height="100">
          <script>alert('XSS Threat Injected');</script>
        </svg>`
      );
      const result = this.validator.sanitizeVectorContent(maliciousPayload, IngestionFormat.SVG);
      if (result.isSecure) {
        throw new Error("Failed to block SVG inline script tag injection");
      }
    }));

    // Validation Tests
    results.push(await this.runTest("Detect Mismatched Header Signatures (File Spoofing)", "Validation", async () => {
      // Create a PNG header but name it a .jpg file
      const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const result = this.validator.validateAsset(pngHeader, "avatar.jpg");
      if (result.isValid) {
        throw new Error("Failed to flag header signature and file extension spoofing mismatch");
      }
    }));

    results.push(await this.runTest("Validate Empty Payload Rejection Policy", "Validation", async () => {
      const emptyBuffer = Buffer.alloc(0);
      const result = this.validator.validateAsset(emptyBuffer, "empty.png");
      if (result.isValid) {
        throw new Error("Failed to reject zero-byte stream");
      }
    }));

    // Hashing & Duplicate Tests
    results.push(await this.runTest("Differentiate Distinct Visual Asset Signatures", "Hashing", async () => {
      const bufA = Buffer.from("Pristine corporate marketing image template v1");
      const bufB = Buffer.from("Pristine corporate marketing image template v2 with adjustments");

      const hashA = this.fingerprinter.generateFingerprint(bufA, "template1.png");
      const hashB = this.fingerprinter.generateFingerprint(bufB, "template2.png");

      const compare = this.fingerprinter.calculateSimilarity(hashA, hashB);
      if (compare.similarityScore === 1.0) {
        throw new Error("Duplicate detector reported 100% similarity on non-identical streams");
      }
    }));

    results.push(await this.runTest("Exact Duplicate Check Match (100% Correlation)", "Hashing", async () => {
      const buf = Buffer.from("Identical branding asset vector coordinates 2026");
      const hashA = this.fingerprinter.generateFingerprint(buf, "logo.png");
      const hashB = this.fingerprinter.generateFingerprint(buf, "logo.png");

      const compare = this.fingerprinter.calculateSimilarity(hashA, hashB);
      if (!compare.isExactDuplicate || compare.similarityScore !== 1.0) {
        throw new Error("Identical assets failed to score 100% similarity");
      }
    }));

    // Normalization Tests
    results.push(await this.runTest("Perform Auto-DPI & Dimension Extraction", "Validation", async () => {
      const dummyPng = Buffer.alloc(30);
      // Write valid IHDR dimensions chunk: Width 800, Height 600
      dummyPng.writeUInt32BE(800, 16);
      dummyPng.writeUInt32BE(600, 20);

      const { metadata } = this.normalizer.normalize(dummyPng, IngestionFormat.PNG);
      if (metadata.width !== 800 || metadata.height !== 600 || metadata.aspectRatio !== "4:3") {
        throw new Error(`Aspect ratio or dimensions parsed incorrectly: ${metadata.width}x${metadata.height}, aspect: ${metadata.aspectRatio}`);
      }
    }));

    // Storage Tests
    results.push(await this.runTest("Virtual Virtual Storage File Transaction Cycle", "Storage", async () => {
      const testBuffer = Buffer.from("Corporate guidelines document bytes");
      const path = await this.storageDriver.save("test_asset", "rules.pdf", testBuffer, "original");

      const exists = await this.storageDriver.exists(path);
      if (!exists) throw new Error("Stored asset path not resolved");

      const retrieved = await this.storageDriver.retrieve(path);
      if (retrieved.toString() !== testBuffer.toString()) {
        throw new Error("Retrieved storage content is corrupt or mismatched");
      }

      await this.storageDriver.delete(path);
      const existsAfter = await this.storageDriver.exists(path);
      if (existsAfter) throw new Error("Asset delete transaction failed to invalidate path");
    }));

    return results;
  }

  private async runTest(name: string, category: TestResult["category"], testFn: () => Promise<void>): Promise<TestResult> {
    const start = Date.now();
    try {
      await testFn();
      return {
        name,
        category,
        passed: true,
        durationMs: Date.now() - start
      };
    } catch (err: any) {
      return {
        name,
        category,
        passed: false,
        message: err.message || "Assertion failed",
        durationMs: Date.now() - start
      };
    }
  }
}
export default IngestionTestSuite;
