import { GraphNode, GraphEdge, NodeType } from "./types.ts";

/**
 * Creative Knowledge Graph.
 * Handles entity nodes (projects, styles, colors, typography, brand) and
 * semantic edges (uses, compatible_with, recommends) with source attribution
 * and confidence mapping.
 */
export class KnowledgeGraph {
  private static instance: KnowledgeGraph | null = null;

  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();

  public static getInstance(): KnowledgeGraph {
    if (!this.instance) {
      this.instance = new KnowledgeGraph();
    }
    return this.instance;
  }

  // --- NODE MANAGEMENT ---

  public addNode(id: string, type: NodeType, label: string, properties: Record<string, any> = {}): GraphNode {
    const existing = this.nodes.get(id);
    const now = new Date().toISOString();

    const node: GraphNode = {
      id,
      type,
      label,
      properties: existing ? { ...existing.properties, ...properties } : properties,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now
    };

    this.nodes.set(id, node);
    return node;
  }

  public getNode(id: string): GraphNode | null {
    return this.nodes.get(id) || null;
  }

  public removeNode(id: string): boolean {
    const nodeDeleted = this.nodes.delete(id);
    if (nodeDeleted) {
      // Cascade delete edges connected to this node
      const edgesToDelete: string[] = [];
      this.edges.forEach((edge, edgeId) => {
        if (edge.sourceId === id || edge.targetId === id) {
          edgesToDelete.push(edgeId);
        }
      });
      edgesToDelete.forEach(edgeId => this.edges.delete(edgeId));
    }
    return nodeDeleted;
  }

  public listNodes(type?: NodeType): GraphNode[] {
    const list = Array.from(this.nodes.values());
    if (type) {
      return list.filter(n => n.type === type);
    }
    return list;
  }

  /**
   * Merges node properties when higher confidence knowledge is introduced.
   */
  public mergeNodeKnowledge(id: string, properties: Record<string, any>, sourceAttribution: string, confidence: number): GraphNode {
    const node = this.getNode(id);
    if (!node) {
      throw new Error(`Node ${id} does not exist in the knowledge graph.`);
    }

    const mergedProps = { ...node.properties };
    for (const [key, val] of Object.entries(properties)) {
      const existingMeta = node.properties[`_meta_${key}`] || { confidence: 0.0 };
      
      // Update property only if confidence is equal or greater
      if (confidence >= existingMeta.confidence) {
        mergedProps[key] = val;
        mergedProps[`_meta_${key}`] = {
          confidence,
          sourceAttribution,
          updatedAt: new Date().toISOString()
        };
      }
    }

    node.properties = mergedProps;
    node.updatedAt = new Date().toISOString();
    this.nodes.set(id, node);
    return node;
  }

  // --- EDGE RELATIONSHIP MANAGEMENT ---

  public addEdge(
    sourceId: string,
    targetId: string,
    relationship: string,
    confidence = 1.0,
    sourceAttribution = "system",
    properties: Record<string, any> = {}
  ): GraphEdge {
    if (!this.nodes.has(sourceId)) {
      throw new Error(`Source node ${sourceId} does not exist in knowledge graph.`);
    }
    if (!this.nodes.has(targetId)) {
      throw new Error(`Target node ${targetId} does not exist in knowledge graph.`);
    }

    const edgeId = `${sourceId}_${relationship}_${targetId}`;
    const now = new Date().toISOString();

    const edge: GraphEdge = {
      id: edgeId,
      sourceId,
      targetId,
      relationship,
      confidence,
      sourceAttribution,
      properties,
      createdAt: now,
      updatedAt: now
    };

    this.edges.set(edgeId, edge);
    return edge;
  }

  public getEdge(id: string): GraphEdge | null {
    return this.edges.get(id) || null;
  }

  public getEdgesForNode(nodeId: string, direction: "incoming" | "outgoing" | "both" = "both"): GraphEdge[] {
    const list = Array.from(this.edges.values());
    if (direction === "outgoing") {
      return list.filter(e => e.sourceId === nodeId);
    }
    if (direction === "incoming") {
      return list.filter(e => e.targetId === nodeId);
    }
    return list.filter(e => e.sourceId === nodeId || e.targetId === nodeId);
  }

  public removeEdge(id: string): boolean {
    return this.edges.delete(id);
  }

  public listEdges(): GraphEdge[] {
    return Array.from(this.edges.values());
  }

  // --- GRAPH ALGORITHMS ---

  /**
   * Traces paths of relationship links up to a specified depth (BFS-style).
   */
  public traceNeighbors(nodeId: string, maxDepth = 2): Array<{ node: GraphNode; edge: GraphEdge; depth: number }> {
    const result: Array<{ node: GraphNode; edge: GraphEdge; depth: number }> = [];
    const visited = new Set<string>([nodeId]);
    const queue: Array<{ currentId: string; depth: number }> = [{ currentId: nodeId, depth: 1 }];

    while (queue.length > 0) {
      const { currentId, depth } = queue.shift()!;
      if (depth > maxDepth) break;

      const currentEdges = this.getEdgesForNode(currentId, "both");
      for (const edge of currentEdges) {
        const neighborId = edge.sourceId === currentId ? edge.targetId : edge.sourceId;
        if (!visited.has(neighborId)) {
          const neighborNode = this.getNode(neighborId);
          if (neighborNode) {
            visited.add(neighborId);
            result.push({
              node: neighborNode,
              edge,
              depth
            });
            queue.push({ currentId: neighborId, depth: depth + 1 });
          }
        }
      }
    }

    return result;
  }

  /**
   * Helper query specifically tracking design styles, typography matching, and palettes.
   */
  public recommendDesignAssets(styleName: string): { fonts: GraphNode[]; colors: GraphNode[]; assets: GraphNode[] } {
    const fonts: GraphNode[] = [];
    const colors: GraphNode[] = [];
    const assets: GraphNode[] = [];

    const nodes = Array.from(this.nodes.values());
    const styleNode = nodes.find(n => n.type === "style" && n.label.toLowerCase() === styleName.toLowerCase());

    if (!styleNode) {
      return { fonts, colors, assets };
    }

    const connected = this.getEdgesForNode(styleNode.id, "both");
    for (const edge of connected) {
      const otherId = edge.sourceId === styleNode.id ? edge.targetId : edge.sourceId;
      const targetNode = this.getNode(otherId);
      if (targetNode) {
        if (targetNode.type === "font") fonts.push(targetNode);
        else if (targetNode.type === "color") colors.push(targetNode);
        else if (targetNode.type === "asset") assets.push(targetNode);
      }
    }

    return { fonts, colors, assets };
  }

  /**
   * Resets the entire knowledge graph.
   */
  public clearGraph(): void {
    this.nodes.clear();
    this.edges.clear();
  }

  /**
   * Exports the entire graph state into a JSON object.
   */
  public exportState(): { nodes: GraphNode[]; edges: GraphEdge[] } {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values())
    };
  }

  /**
   * Imports graph state from a structured object.
   */
  public importState(data: { nodes: GraphNode[]; edges: GraphEdge[] }): void {
    this.clearGraph();
    if (data.nodes) {
      data.nodes.forEach(n => this.nodes.set(n.id, n));
    }
    if (data.edges) {
      data.edges.forEach(e => this.edges.set(e.id, e));
    }
  }
}
