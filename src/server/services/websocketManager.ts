/**
 * WebSocket Manager Service
 * Handles real-time bidirectional communication with connected clients
 */

import WebSocket from 'ws';
import { Server as HTTPServer } from 'http';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

interface ClientInfo {
  id: string;
  socket: WebSocket;
  connectedAt: Date;
  lastHeartbeat: Date;
  authenticated: boolean;
}

interface Message {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
  sender?: string;
}

export class WebSocketManager extends EventEmitter {
  private static instance: WebSocketManager;
  private wss: WebSocket.Server | null = null;
  private clients: Map<string, ClientInfo> = new Map();
  private messageQueue: Message[] = [];
  private maxQueueSize = 1000;
  private heartbeatInterval: NodeJS.Timer | null = null;

  private constructor() {
    super();
  }

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  /**
   * Initialize WebSocket server
   */
  initialize(server: HTTPServer): void {
    this.wss = new WebSocket.Server({ server, path: '/ws' });

    this.wss.on('connection', (socket: WebSocket) => {
      this.handleClientConnection(socket);
    });

    this.setupHeartbeat();
    this.emit('initialized');
  }

  /**
   * Handle new client connection
   */
  private handleClientConnection(socket: WebSocket): void {
    const clientId = uuidv4();
    const clientInfo: ClientInfo = {
      id: clientId,
      socket,
      connectedAt: new Date(),
      lastHeartbeat: new Date(),
      authenticated: false,
    };

    this.clients.set(clientId, clientInfo);
    this.emit('clientConnected', { clientId, timestamp: new Date().toISOString() });

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'connection-established',
      payload: {
        clientId,
        timestamp: new Date().toISOString(),
      },
    });

    // Handle incoming messages
    socket.on('message', (data: string) => {
      try {
        const message = JSON.parse(data) as Message;
        this.handleMessage(clientId, message);
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error);
        this.sendToClient(clientId, {
          type: 'error',
          payload: { message: 'Invalid message format' },
        });
      }
    });

    // Handle client disconnect
    socket.on('close', () => {
      this.handleClientDisconnect(clientId);
    });

    // Handle errors
    socket.on('error', (error: Error) => {
      console.error(`[WebSocket] Client ${clientId} error:`, error);
      this.handleClientDisconnect(clientId);
    });
  }

  /**
   * Handle incoming message from client
   */
  private handleMessage(clientId: string, message: Message): void {
    const clientInfo = this.clients.get(clientId);
    if (!clientInfo) return;

    clientInfo.lastHeartbeat = new Date();

    // Add message ID if not present
    if (!message.id) {
      message.id = uuidv4();
    }

    message.timestamp = new Date().toISOString();
    message.sender = clientId;

    // Add to message queue
    this.addToQueue(message);

    // Emit event for processing
    this.emit('message', message);

    // Handle specific message types
    switch (message.type) {
      case 'heartbeat':
        this.sendToClient(clientId, {
          type: 'heartbeat-ack',
          payload: { timestamp: new Date().toISOString() },
        });
        break;

      case 'authenticate':
        this.authenticateClient(clientId, message.payload.token);
        break;

      default:
        this.emit(`message:${message.type}`, message);
    }
  }

  /**
   * Handle client disconnect
   */
  private handleClientDisconnect(clientId: string): void {
    const clientInfo = this.clients.get(clientId);
    if (clientInfo) {
      clientInfo.socket.terminate();
      this.clients.delete(clientId);
      this.emit('clientDisconnected', { clientId, timestamp: new Date().toISOString() });
    }
  }

  /**
   * Send message to specific client
   */
  sendToClient(clientId: string, data: Partial<Message>): void {
    const clientInfo = this.clients.get(clientId);
    if (!clientInfo || clientInfo.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    const message: Message = {
      id: data.id || uuidv4(),
      type: data.type || 'message',
      payload: data.payload || {},
      timestamp: data.timestamp || new Date().toISOString(),
    };

    try {
      clientInfo.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error(`[WebSocket] Failed to send to client ${clientId}:`, error);
      this.handleClientDisconnect(clientId);
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(data: Partial<Message>): void {
    const message: Message = {
      id: data.id || uuidv4(),
      type: data.type || 'broadcast',
      payload: data.payload || {},
      timestamp: data.timestamp || new Date().toISOString(),
    };

    for (const [clientId, clientInfo] of this.clients) {
      if (clientInfo.socket.readyState === WebSocket.OPEN) {
        try {
          clientInfo.socket.send(JSON.stringify(message));
        } catch (error) {
          console.error(`[WebSocket] Failed to broadcast to client ${clientId}:`, error);
          this.handleClientDisconnect(clientId);
        }
      }
    }
  }

  /**
   * Send message to authenticated clients only
   */
  broadcastToAuthenticated(data: Partial<Message>): void {
    for (const [clientId, clientInfo] of this.clients) {
      if (clientInfo.authenticated && clientInfo.socket.readyState === WebSocket.OPEN) {
        this.sendToClient(clientId, data);
      }
    }
  }

  /**
   * Authenticate client
   */
  private authenticateClient(clientId: string, token: string): void {
    const clientInfo = this.clients.get(clientId);
    if (!clientInfo) return;

    // Simple token validation - in production, implement proper JWT validation
    if (token && token.length > 0) {
      clientInfo.authenticated = true;
      this.sendToClient(clientId, {
        type: 'authentication-success',
        payload: { message: 'Client authenticated' },
      });
      this.emit('clientAuthenticated', { clientId });
    } else {
      this.sendToClient(clientId, {
        type: 'authentication-failed',
        payload: { message: 'Invalid token' },
      });
    }
  }

  /**
   * Setup heartbeat to detect dead connections
   */
  private setupHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const timeout = 60000; // 60 seconds

      for (const [clientId, clientInfo] of this.clients) {
        const lastHeartbeat = clientInfo.lastHeartbeat.getTime();

        if (now - lastHeartbeat > timeout) {
          console.warn(`[WebSocket] Client ${clientId} heartbeat timeout`);
          this.handleClientDisconnect(clientId);
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Get connected clients count
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get client information
   */
  getClientInfo(clientId: string): ClientInfo | undefined {
    return this.clients.get(clientId);
  }

  /**
   * Get all connected clients
   */
  getAllClients(): ClientInfo[] {
    return Array.from(this.clients.values());
  }

  /**
   * Add message to queue
   */
  private addToQueue(message: Message): void {
    this.messageQueue.push(message);
    if (this.messageQueue.length > this.maxQueueSize) {
      this.messageQueue.shift();
    }
  }

  /**
   * Get message queue
   */
  getMessageQueue(limit?: number): Message[] {
    const size = limit || 50;
    return this.messageQueue.slice(-size);
  }

  /**
   * Clear message queue
   */
  clearQueue(): void {
    this.messageQueue = [];
  }

  /**
   * Disconnect specific client
   */
  disconnectClient(clientId: string, reason?: string): void {
    const clientInfo = this.clients.get(clientId);
    if (clientInfo) {
      if (reason) {
        this.sendToClient(clientId, {
          type: 'disconnect-notice',
          payload: { reason },
        });
      }
      clientInfo.socket.close();
      this.handleClientDisconnect(clientId);
    }
  }

  /**
   * Disconnect all clients
   */
  disconnectAll(reason?: string): void {
    const clientIds = Array.from(this.clients.keys());
    for (const clientId of clientIds) {
      this.disconnectClient(clientId, reason);
    }
  }

  /**
   * Cleanup on shutdown
   */
  shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.disconnectAll('Server shutting down');
    if (this.wss) {
      this.wss.close();
    }
    this.clients.clear();
    this.messageQueue = [];
  }
}

export default WebSocketManager.getInstance();
