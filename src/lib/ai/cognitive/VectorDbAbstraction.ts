import { MemoryEntry, SemanticQuery, SearchResult } from "./types.ts";

/**
 * Enterprise Vector Database Abstraction.
 * Implements token-overlap, keyword extraction, and fuzzy semantic distance scoring
 * to simulate high-fidelity cosine similarity vectors in a standalone environment.
 */
export class VectorDbAbstraction {
  private static instance: VectorDbAbstraction | null = null;

  public static getInstance(): VectorDbAbstraction {
    if (!this.instance) {
      this.instance = new VectorDbAbstraction();
    }
    return this.instance;
  }

  /**
   * Generates a structural keyword-weight vector representing a document or query.
   */
  public extractKeywords(text: string): Map<string, number> {
    const stops = new Set([
      "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
      "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't",
      "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
      "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he",
      "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's",
      "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's",
      "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or",
      "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll",
      "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs",
      "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've",
      "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll",
      "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while",
      "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll",
      "you're", "you've", "your", "yours", "yourself", "yourselves"
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^\w\s\u0980-\u09ff]/g, " ") // retain Bengali characters and English alphanumerics
      .split(/\s+/);

    const weights = new Map<string, number>();
    for (const w of words) {
      if (w.trim().length <= 1 || stops.has(w)) continue;
      const current = weights.get(w) || 0;
      weights.set(w, current + 1.0);
    }

    // Normalize weights
    let sqSum = 0;
    weights.forEach(val => { sqSum += val * val; });
    const magnitude = Math.sqrt(sqSum);
    if (magnitude > 0) {
      weights.forEach((val, key) => {
        weights.set(key, val / magnitude);
      });
    }

    return weights;
  }

  /**
   * Computes the mathematical cosine similarity between two keyword-weight vectors.
   */
  public calculateCosineSimilarity(v1: Map<string, number>, v2: Map<string, number>): number {
    let dotProduct = 0;
    v1.forEach((val, key) => {
      if (v2.has(key)) {
        dotProduct += val * (v2.get(key) || 0);
      }
    });
    return dotProduct;
  }

  /**
   * Executes a hybrid search combining full-text vector similarity, tags, and strict metadata filters.
   */
  public queryHybrid(memories: MemoryEntry[], query: SemanticQuery): SearchResult[] {
    const results: SearchResult[] = [];
    
    // Prepare query vector
    const queryText = query.text ? query.text.trim() : "";
    const queryVector = queryText ? this.extractKeywords(queryText) : null;

    for (const mem of memories) {
      // 1. FILTER: isArchived
      if (mem.isArchived) continue;

      // 2. FILTER: category
      if (query.category && mem.category !== query.category) continue;

      // 3. FILTER: projectId scope
      if (query.projectId !== undefined && mem.projectId !== query.projectId) continue;

      // 4. FILTER: tag intersection
      if (query.tags && query.tags.length > 0) {
        const hasMatchingTag = query.tags.some(tag => mem.tags.includes(tag));
        if (!hasMatchingTag) continue;
      }

      // 5. FILTER: minimum importance
      if (query.importanceMin && mem.importance < query.importanceMin) continue;

      // 6. FILTER: minimum confidence
      if (query.confidenceMin && mem.confidence < query.confidenceMin) continue;

      // 7. FILTER: temporal bounds
      if (query.timeFilter) {
        const itemTime = new Date(mem.createdAt).getTime();
        const start = new Date(query.timeFilter.start).getTime();
        const end = new Date(query.timeFilter.end).getTime();
        if (itemTime < start || itemTime > end) continue;
      }

      // 8. VECTOR SIMILARITY RATING
      let relevanceScore = 0.5; // base score if no search text provided (all filters passed)

      if (queryVector) {
        const memText = `${mem.key} ${String(mem.value)} ${mem.tags.join(" ")}`;
        const memVector = this.extractKeywords(memText);
        relevanceScore = this.calculateCosineSimilarity(queryVector, memVector);

        // Add small boost for tag matches to make search hybrid
        if (query.tags && query.tags.length > 0) {
          const matchCount = query.tags.filter(tag => mem.tags.includes(tag)).length;
          relevanceScore += (matchCount / query.tags.length) * 0.15;
        }

        // Clip to [0, 1] range
        relevanceScore = Math.min(1.0, Math.max(0.0, relevanceScore));

        // Skip records that don't match the query text at all if text query is strict
        if (relevanceScore <= 0.0) continue;
      }

      results.push({
        memory: mem,
        relevanceScore
      });
    }

    // Sort descending by relevance score, then importance
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore || b.memory.importance - a.memory.importance)
      .slice(0, query.limit || 20);
  }
}
