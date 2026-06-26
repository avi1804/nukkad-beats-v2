'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { socketClient } from '../socket/socketClient';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { toast } from 'react-hot-toast';
import { api } from '../lib/api';
import { 
  SESSION_INVALIDATED, 
  NOTIFICATION_NEW,
  PRODUCT_DELETED,
  PRODUCT_AVAILABILITY_CHANGED
} from '../socket/events';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!user) {
      socketClient.disconnect();
      setIsConnected(false);
      setSocket(null);
      return;
    }

    let cancelled = false;

    const connectSocket = async () => {
      try {
        await api.post('/auth/refresh');
      } catch {
        // Token refresh failed — session expired. Don't connect.
        return;
      }

      if (cancelled) return;

      socketClient.connect();
      const sock = socketClient.getSocket();
      if (!sock) return;

      // Store the socket instance in state so the context re-renders
      setSocket(sock);

      const onConnect = () => {
        if (!cancelled) setIsConnected(true);
      };
      const onDisconnect = () => {
        if (!cancelled) setIsConnected(false);
      };
      const onSessionInvalidated = () => {
        console.warn('[Socket] Session invalidated by server.');
        logout();
        window.location.href = '/';
      };

      const onNotificationNew = (notification: any) => {
        toast(notification.message, {
          icon: notification.type === 'SUCCESS' ? '✅' : '🔔',
        });
      };

      const onProductDeleted = (payload: { productId: string }) => {
        useCartStore.getState().removeFromCart(payload.productId);
      };

      const onProductAvailabilityChanged = (payload: { productId: string, isAvailable: boolean, name?: string }) => {
        if (!payload.isAvailable) {
          useCartStore.getState().removeFromCart(payload.productId);
          if (payload.name) {
            toast.error(`${payload.name} is no longer available.`);
          }
        }
      };

      sock.on('connect', onConnect);
      sock.on('disconnect', onDisconnect);
      sock.on(SESSION_INVALIDATED, onSessionInvalidated);
      sock.on(NOTIFICATION_NEW, onNotificationNew);
      sock.on(PRODUCT_DELETED, onProductDeleted);
      sock.on(PRODUCT_AVAILABILITY_CHANGED, onProductAvailabilityChanged);

      // If socket is already connected by the time we register listeners
      if (sock.connected) {
        setIsConnected(true);
      }
    };

    connectSocket();

    return () => {
      cancelled = true;
      const sock = socketClient.getSocket();
      if (sock) {
        sock.off('connect');
        sock.off('disconnect');
        sock.off(SESSION_INVALIDATED);
        sock.off(NOTIFICATION_NEW);
        sock.off(PRODUCT_DELETED);
        sock.off(PRODUCT_AVAILABILITY_CHANGED);
      }
    };
  }, [user, logout]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
