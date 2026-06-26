import React from 'react';
import { useSocketContext } from '../context/SocketContext';

export const useSocket = (eventName: string, callback: (data: any) => void) => {
  const { socket, isConnected } = useSocketContext();
  const savedCallback = React.useRef(callback);

  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  React.useEffect(() => {
    if (!socket || !isConnected) return;

    const handler = (data: any) => savedCallback.current(data);
    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
    };
  }, [socket, isConnected, eventName]);

  return { socket, isConnected };
};
