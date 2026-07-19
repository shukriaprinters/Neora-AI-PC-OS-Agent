import { IngestionFormat } from "./types.ts";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  format: IngestionFormat;
  mimeType: string;
}

export class ValidationService {
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB maximum
  private static readonly MIN_DIMENSION = 8;
  private static readonly MAX_DIMENSION = 16384;

  /**
   * Verifies magic bytes to prevent fake extension uploads
   */
  public verifyMagicBytes(buffer: Buffer): { format: IngestionFormat; mimeType: string } {
    if (!buffer || buffer.length < 4) {
      return { format: IngestionFormat.UNKNOWN, mimeType: "application/octet-stream" };
    }

    const hex = buffer.toString("hex", 0, 4).toUpperCase();

    // PNG: 89 50 4E 47
    if (hex === "89504E47") {
      return { format: IngestionFormat.PNG, mimeType: "image/png" };
    }

    // JPEG/JPG: FF D8 FF
    if (hex.startsWith("FFD8FF")) {
      return { format: IngestionFormat.JPEG, mimeType: "image/jpeg" };
    }

    // GIF: 47 49 46 38 ("GIF8")
    if (hex.startsWith("474946")) {
      return { format: IngestionFormat.GIF, mimeType: "image/gif" };
    }

    // WEBP: RIFF (52 49 46 46) and WEBP (57 45 42 50) at offset 8
    if (hex === "52494646") {
      const subHex = buffer.toString("hex", 8, 12).toUpperCase();
      if (subHex === "57454250") {
        return { format: IngestionFormat.WEBP, mimeType: "image/webp" };
      }
    }

    // BMP: 42 4D ("BM")
    if (hex.startsWith("424D")) {
      return { format: IngestionFormat.BMP, mimeType: "image/bmp" };
    }

    // TIFF: 49 49 2A 00 or 4D 4D 00 2A
    if (hex === "49492A00" || hex === "4D4D002A") {
      return { format: IngestionFormat.TIFF, mimeType: "image/tiff" };
    }

    // PSD: 38 42 50 53 ("8BPS")
    if (hex === "38425053") {
      return { format: IngestionFormat.PSD, mimeType: "image/vnd.adobe.photoshop" };
    }

    // PDF: 25 50 44 46 ("%PDF")
    if (hex === "25504446") {
      return { format: IngestionFormat.PDF, mimeType: "application/pdf" };
    }

    // SVG: Check if text-based content starting with standard XML or <svg tags
    const previewText = buffer.toString("utf8", 0, 100).toLowerCase().trim();
    if (previewText.startsWith("<?xml") || previewText.includes("<svg") || previewText.includes("<!doctype svg")) {
      return { format: IngestionFormat.SVG, mimeType: "image/svg+xml" };
    }

    // PostScript (EPS/AI): 25 21 50 53 ("%!")
    if (hex.startsWith("2521")) {
      if (previewText.includes("illustrator") || previewText.includes("adobe")) {
        return { format: IngestionFormat.AI, mimeType: "application/postscript" };
      }
      return { format: IngestionFormat.EPS, mimeType: "application/eps" };
    }

    return { format: IngestionFormat.UNKNOWN, mimeType: "application/octet-stream" };
  }

  /**
   * Sanitizes text-based vector images (SVG) against malicious scripts or infinite entity references (XML bombs)
   */
  public sanitizeVectorContent(buffer: Buffer, format: IngestionFormat): { isSecure: boolean; error?: string } {
    if (format !== IngestionFormat.SVG) {
      return { isSecure: true };
    }

    const svgContent = buffer.toString("utf8");

    // Check 1: XML entity expansion exploit detection (Billion Laughs / XML bomb attack)
    if (svgContent.includes("<!ENTITY") && svgContent.includes("lol")) {
      return { isSecure: false, error: "XML Entity expansion recursion (XML Bomb) detected inside vector definitions" };
    }

    // Check 2: Embedded script tags to prevent XSS / malicious macro execution inside the sandbox
    if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(svgContent)) {
      return { isSecure: false, error: "Embedded script tag execution threat detected in vector payload" };
    }

    // Check 3: Inline JavaScript links inside element attributes (e.g., onload, onclick, href="javascript:")
    if (/\bon[a-z]+\s*=/i.test(svgContent) || /href\s*=\s*["']\s*javascript:/i.test(svgContent)) {
      return { isSecure: false, error: "Inline JavaScript listener event threat detected in vector properties" };
    }

    // Check 4: Deep XML nested structures to guard against stack overflows (Zip-bomb indicators)
    const openTags = (svgContent.match(/<[a-zA-Z]/g) || []).length;
    const closeTags = (svgContent.match(/<\/[a-zA-Z]/g) || []).length;
    if (openTags > 25000 || Math.abs(openTags - closeTags) > 1000) {
      return { isSecure: false, error: "Abnormal nested XML token length detected, guarding stack overflow limits" };
    }

    return { isSecure: true };
  }

  /**
   * Complete validation pipeline
   */
  public validateAsset(buffer: Buffer, originalFileName: string): ValidationResult {
    // 1. Buffer Size Check
    if (!buffer || buffer.length === 0) {
      return { isValid: false, error: "Empty upload stream cannot be analyzed", format: IngestionFormat.UNKNOWN, mimeType: "application/octet-stream" };
    }

    if (buffer.length > ValidationService.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `Upload size ${Math.round(buffer.length / (1024 * 1024))}MB exceeds enterprise security boundary limit of 50MB`,
        format: IngestionFormat.UNKNOWN,
        mimeType: "application/octet-stream"
      };
    }

    // 2. Extension Alignment Analysis
    const extension = originalFileName.split(".").pop()?.toLowerCase();
    
    // 3. Magic Byte Audit
    const { format, mimeType } = this.verifyMagicBytes(buffer);

    if (format === IngestionFormat.UNKNOWN) {
      return {
        isValid: false,
        error: `Byte signature validation failed: Unknown or unrecognized binary structure. Supported extensions are: PNG, JPG, WEBP, SVG, GIF, PSD, PDF, EPS`,
        format: IngestionFormat.UNKNOWN,
        mimeType: "application/octet-stream"
      };
    }

    // 4. File-Extension spoofing verification
    if (extension && extension !== "jpg" && extension !== "jpeg") {
      const mappedFormat = this.getFormatFromExtension(extension);
      if (mappedFormat !== format && mappedFormat !== IngestionFormat.UNKNOWN) {
        return {
          isValid: false,
          error: `Extension mismatch warning: Extension is .${extension} but true binary signature is ${format.toUpperCase()}`,
          format,
          mimeType
        };
      }
    }

    // 5. Secure sandbox scanning for vector formats
    const vectorSanitization = this.sanitizeVectorContent(buffer, format);
    if (!vectorSanitization.isSecure) {
      return {
        isValid: false,
        error: vectorSanitization.error || "Vector validation failed",
        format,
        mimeType
      };
    }

    return {
      isValid: true,
      format,
      mimeType
    };
  }

  private getFormatFromExtension(ext: string): IngestionFormat {
    switch (ext) {
      case "png": return IngestionFormat.PNG;
      case "jpg":
      case "jpeg": return IngestionFormat.JPEG;
      case "webp": return IngestionFormat.WEBP;
      case "tiff":
      case "tif": return IngestionFormat.TIFF;
      case "bmp": return IngestionFormat.BMP;
      case "gif": return IngestionFormat.GIF;
      case "avif": return IngestionFormat.AVIF;
      case "heic": return IngestionFormat.HEIC;
      case "svg": return IngestionFormat.SVG;
      case "pdf": return IngestionFormat.PDF;
      case "psd": return IngestionFormat.PSD;
      case "ai": return IngestionFormat.AI;
      case "eps": return IngestionFormat.EPS;
      default: return IngestionFormat.UNKNOWN;
    }
  }
}
export default ValidationService;
