import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;
  private responseHandlers: Map<string, (data: any) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    const url = import.meta.env.PROD 
      ? window.location.origin 
      : import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000';

    this.socket = io(url, {
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 10000,
    });
    
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.socket?.disconnect();
      }
    });

    this.socket.on('agent-response', (data) => {
      console.log('Received agent response:', data);
      const handler = this.responseHandlers.get(data.agentId);
      if (handler) {
        handler(data);
      }
    });
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public registerUser(userId: string) {
    if (this.socket?.connected) {
      this.socket.emit('register', userId);
    } else {
      this.socket?.once('connect', () => {
        this.socket?.emit('register', userId);
      });
    }
  }

  public onAgentResponse(agentId: string, callback: (data: any) => void) {
    this.responseHandlers.set(agentId, callback);
  }

  public removeAgentResponseHandler(agentId: string) {
    this.responseHandlers.delete(agentId);
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.responseHandlers.clear();
    }
  }

  public reconnect() {
    if (this.socket) {
      this.socket.connect();
    } else {
      this.initializeSocket();
    }
  }
}

export default SocketService;