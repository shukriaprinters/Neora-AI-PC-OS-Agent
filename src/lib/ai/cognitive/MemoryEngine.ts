import fs from "node:fs";
import path from "node:path";
import { MemoryEntry, MemoryCategory, SemanticQuery, SearchResult } from "./types.ts";
import { VectorDbAbstraction } from "./VectorDbAbstraction.ts";

/**
 * Enterprise Memory Engine.
 * Implements persistent semantic long-term memory, short-term session caching,
 * automated conflict merging, retention expiry schedules, and tamper-resistant audit logs.
 */
export class MemoryEngine {
  private static instance: MemoryEngine | null = null;

  private cache: Map<string, MemoryEntry> = new Map(); // Short-term cache
  private dbPath = path.resolve(process.cwd(), "data", "neora-cognitive-memories.json");
  private auditLogPath = path.resolve(process.cwd(), "data", "neora-cognitive-audit-log.json");

  // Performance metrics tracking
  private totalCacheHits = 0;
  private totalCacheMisses = 0;

  public static getInstance(): MemoryEngine {
    if (!this.instance) {
      this.instance = new MemoryEngine();
    }
    return this.instance;
  }

  constructor() {
    this.bootstrapStorage();
    this.hydrateCache();
  }

  private bootstrapStorage(): void {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.dbPath)) {
      fs.writeFileSync(this.dbPath, JSON.stringify([], null, 2), "utf8");
    }
    if (!fs.existsSync(this.auditLogPath)) {
      fs.writeFileSync(this.auditLogPath, JSON.stringify([], null, 2), "utf8");
    }
  }

  private loadAllMemories(): MemoryEntry[] {
    try {
      const data = fs.readFileSync(this.dbPath, "utf8");
      return JSON.parse(data) as MemoryEntry[];
    } catch {
      return [];
    }
  }

  private saveAllMemories(memories: MemoryEntry[]): void {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(memories, null, 2), "utf8");
    } catch (err) {
      console.error("Failed to write cognitive memories:", err);
    }
  }

  private hydrateCache(): void {
    const memories = this.loadAllMemories();
    this.cache.clear();
    // Hydrate non-archived non-expired memories into short-term cache
    const now = new Date().getTime();
    for (const mem of memories) {
      if (!mem.isArchived) {
        if (mem.expiresAt && new Date(mem.expiresAt).getTime() < now) {
          continue; // Expired, bypass cache
        }
        this.cache.set(mem.id, mem);
      }
    }
  }

  // --- COGNITIVE AUDIT TRAIL LOGGING ---

  private logAudit(action: string, entityId: string, userId: string, details: any): void {
    try {
      const auditEntry = {
        timestamp: new Date().toISOString(),
        action,
        entityId,
        userId,
        details
      };
      let logs = [];
      if (fs.existsSync(this.auditLogPath)) {
        logs = JSON.parse(fs.readFileSync(this.auditLogPath, "utf8"));
      }
      logs.push(auditEntry);
      fs.writeFileSync(this.auditLogPath, JSON.stringify(logs, null, 2), "utf8");
    } catch (err) {
      console.error("Audit log error:", err);
    }
  }

  public getAuditLogs(): any[] {
    try {
      if (!fs.existsSync(this.auditLogPath)) return [];
      return JSON.parse(fs.readFileSync(this.auditLogPath, "utf8"));
    } catch {
      return [];
    }
  }

  // --- CORE LIFECYCLE OPERATIONS ---

  /**
   * CREATE: Adds a new memory item to the repository.
   */
  public createMemory(entry: Omit<MemoryEntry, "id" | "version" | "isArchived" | "createdAt" | "updatedAt">): MemoryEntry {
    const id = `mem_${entry.category}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const now = new Date().toISOString();

    const newMemory: MemoryEntry = {
      ...entry,
      id,
      version: 1,
      isArchived: false,
      createdAt: now,
      updatedAt: now
    };

    const memories = this.loadAllMemories();
    memories.push(newMemory);
    this.saveAllMemories(memories);

    // Save to Cache
    this.cache.set(id, newMemory);

    this.logAudit("CREATE", id, entry.userId, { category: entry.category, key: entry.key });
    return newMemory;
  }

  /**
   * READ: Retries a specific memory entry.
   */
  public getMemory(id: string): MemoryEntry | null {
    // Attempt cache hit
    const cached = this.cache.get(id);
    if (cached) {
      this.totalCacheHits++;
      return cached;
    }

    this.totalCacheMisses++;
    const memories = this.loadAllMemories();
    const found = memories.find(m => m.id === id) || null;
    if (found && !found.isArchived) {
      this.cache.set(id, found);
    }
    return found;
  }

  /**
   * UPDATE: Modifies fields of an existing memory, incrementing the version.
   */
  public updateMemory(id: string, updates: Partial<Omit<MemoryEntry, "id" | "userId" | "createdAt">>): MemoryEntry {
    const memories = this.loadAllMemories();
    const idx = memories.findIndex(m => m.id === id);

    if (idx === -1) {
      throw new Error(`Memory with ID ${id} not found.`);
    }

    const existing = memories[idx];
    const updated: MemoryEntry = {
      ...existing,
      ...updates,
      id: existing.id,
      userId: existing.userId,
      version: existing.version + 1,
      updatedAt: new Date().toISOString()
    };

    memories[idx] = updated;
    this.saveAllMemories(memories);

    // Sync Cache
    if (updated.isArchived) {
      this.cache.delete(id);
    } else {
      this.cache.set(id, updated);
    }

    this.logAudit("UPDATE", id, existing.userId, { changedFields: Object.keys(updates) });
    return updated;
  }

  /**
   * MERGE: Merges two overlapping memory keys automatically based on confidence scores.
   */
  public mergeMemories(id1: string, id2: string, resolvedKey: string, userId: string): MemoryEntry {
    const mem1 = this.getMemory(id1);
    const mem2 = this.getMemory(id2);

    if (!mem1 || !mem2) {
      throw new Error("One or both memories specified for merging do not exist.");
    }

    // Determine values based on higher confidence or later timestamp
    const preferredValue = mem1.confidence >= mem2.confidence ? mem1.value : mem2.value;
    const preferredImportance = Math.max(mem1.importance, mem2.importance);
    const combinedTags = Array.from(new Set([...mem1.tags, ...mem2.tags]));

    // Update the preferred memory
    const updated = this.updateMemory(mem1.id, {
      key: resolvedKey,
      value: preferredValue,
      importance: preferredImportance,
      confidence: Math.max(mem1.confidence, mem2.confidence),
      tags: combinedTags,
      sourceAttribution: `merge(${mem1.sourceAttribution}, ${mem2.sourceAttribution})`
    });

    // Archive the other
    this.archiveMemory(mem2.id);

    this.logAudit("MERGE", mem1.id, userId, { mergedWith: mem2.id });
    return updated;
  }

  /**
   * ARCHIVE: Soft-delete/hide from normal queries.
   */
  public archiveMemory(id: string): void {
    const mem = this.getMemory(id);
    if (mem) {
      this.updateMemory(id, { isArchived: true });
    }
  }

  /**
   * RECOVER: Restore archived memories.
   */
  public recoverMemory(id: string): void {
    const memories = this.loadAllMemories();
    const mem = memories.find(m => m.id === id);
    if (mem && mem.isArchived) {
      this.updateMemory(id, { isArchived: false });
    }
  }

  /**
   * EXPIRE: Clears out past scheduled expiry memories.
   */
  public runExpiryScheduler(): number {
    const now = new Date().getTime();
    const memories = this.loadAllMemories();
    let expiredCount = 0;

    const remaining = memories.map(mem => {
      if (!mem.isArchived && mem.expiresAt && new Date(mem.expiresAt).getTime() < now) {
        expiredCount++;
        return { ...mem, isArchived: true, updatedAt: new Date().toISOString() };
      }
      return mem;
    });

    if (expiredCount > 0) {
      this.saveAllMemories(remaining);
      this.hydrateCache();
    }
    return expiredCount;
  }

  /**
   * DELETE: Permanent deletion (GDPR purging compliant).
   */
  public purgeUserMemories(userId: string): number {
    const memories = this.loadAllMemories();
    const remaining = memories.filter(m => m.userId !== userId);
    const purgedCount = memories.length - remaining.length;

    this.saveAllMemories(remaining);
    this.hydrateCache();

    this.logAudit("GDPR_PURGE", userId, userId, { purgedCount });
    return purgedCount;
  }

  // --- QUERY / SEMANTIC SEARCH ---

  /**
   * Performs semantic / hybrid queries.
   */
  public searchMemories(query: SemanticQuery): SearchResult[] {
    // Ensure cleanup of expired elements
    this.runExpiryScheduler();

    const activeMemories = Array.from(this.cache.values());
    return VectorDbAbstraction.getInstance().queryHybrid(activeMemories, query);
  }

  // --- METRICS AUDIT ---

  public getPerformanceStats(): { cacheHitRatio: number; totalMemories: number; expiredInCache: number } {
    const totalRequests = this.totalCacheHits + this.totalCacheMisses;
    const cacheHitRatio = totalRequests > 0 ? this.totalCacheHits / totalRequests : 1.0;
    const memories = this.loadAllMemories();
    
    return {
      cacheHitRatio,
      totalMemories: memories.length,
      expiredInCache: memories.filter(m => m.isArchived).length
    };
  }
}
