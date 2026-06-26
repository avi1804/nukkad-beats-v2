import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

class SocketClient {
  private socket: Socket | null = null;
  private isConnecting = false;

  public connect() {
    // If already connected or connecting, skip
    if (this.socket?.connected || this.isConnecting) return;

    // If a previous socket exists but is disconnected, clean it up first
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket = null;
    }

    this.isConnecting = true;
    
    // We rely on withCredentials to send the HttpOnly cookie for auth
    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('[Socket.IO] Connected');
      this.isConnecting = false;
    });

    this.socket.on('connect_error', (error) => {
      console.warn('[Socket.IO] Connection Error:', error.message);
      this.isConnecting = false;
      // If this is an auth error, stop retrying — we don't have a valid token
      if (error.message.includes('Authentication error')) {
        this.socket?.disconnect();
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Disconnected. Reason: ${reason}`);
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, reconnect manually
        this.socket?.connect();
      }
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketClient = new SocketClient();
