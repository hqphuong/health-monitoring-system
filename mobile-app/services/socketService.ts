import { io, Socket } from 'socket.io-client';
import { getAuthToken } from './api';

// Use the same SERVER_URL as in api.ts
const SERVER_URL = 'http://192.168.31.197:3000';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Record<string, Function[]> = {};

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(SERVER_URL, {
      transports: ['websocket'],
      autoConnect: true,
      auth: {
        token: getAuthToken(),
      },
    });

    this.socket.on('connect', () => {
      console.log('✅ [Socket] Connected to backend');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ [Socket] Disconnected from backend');
    });

    this.socket.on('error', (error) => {
      console.error('❌ [Socket] Error:', error);
    });

    // Listen to AI metric updates
    this.socket.on('metric_update', (data) => {
      this.emitLocal('metric_update', data);
    });

    // Listen to emergency alerts
    this.socket.on('emergency_alert', (data) => {
      this.emitLocal('emergency_alert', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  startSession(user_id: string) {
    if (!this.socket) return;
    this.socket.emit('start_session', { user_id });
    console.log(`✅ [Socket] Session started for user: ${user_id}`);
  }

  streamMetrics(metrics: any[]) {
    if (!this.socket) return;
    // The backend expects an array of metrics inside an object { metrics: [...] }
    this.socket.emit('stream_metric', { metrics });
    console.log(`📡 [Socket] Streamed ${metrics.length} metrics to backend`);
  }

  // --- Local Event Emitter for UI components ---
  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
  }

  private emitLocal(event: string, data: any) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((cb) => cb(data));
  }
}

export const socketService = new SocketService();
export default socketService;
