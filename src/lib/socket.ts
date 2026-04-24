import { io, Socket } from 'socket.io-client';
import { config } from './config';

const API_URL = process.env.NEXT_PUBLIC_API_URL || config.socket.url;

let socket: Socket | null = null;

/**
 * Get or create Socket.IO connection with automatic reconnection
 */
export const getSocket = (token: string): Socket => {
  if (!socket) {
    console.log(`[Socket] Connecting to ${API_URL}`);
    
    socket = io(API_URL, {
      path: config.socket.path,
      auth: {
        token,
      },
      reconnection: config.socket.reconnection,
      reconnectionDelay: config.socket.reconnectionDelay,
      reconnectionDelayMax: config.socket.reconnectionDelayMax,
      reconnectionAttempts: config.socket.reconnectionAttempts,
      transports: config.socket.transports as any,
    });

    // Connection event handlers
    socket.on('connect', () => {
      console.log('[Socket] Connected');
      socket?.emit('connected', { ts: Date.now() });
      socket?.emit('get_status');
    });

    socket.on('connect_error', (error: any) => {
      console.error('[Socket] Connection error:', error);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('error', (error: any) => {
      console.error('[Socket] Error:', error);
    });
  } else {
    // Keep auth token fresh and reconnect if needed.
    socket.auth = { token };
    if (!socket.connected && socket.disconnected) {
      socket.connect();
    }
  }

  return socket;
};

/**
 * Disconnect and cleanup Socket.IO
 */
export const disconnectSocket = () => {
  if (socket) {
    console.log('[Socket] Disconnecting');
    socket.disconnect();
    socket = null;
  }
};

/**
 * Check if Socket.IO is connected
 */
export const isSocketConnected = (): boolean => {
  return !!socket && socket.connected;
};

/**
 * Force reconnect Socket.IO
 */
export const reconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket.connect();
  }
};
