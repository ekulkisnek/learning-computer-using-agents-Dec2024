import { io } from 'socket.io-client';
import { useState, useEffect } from 'react';

export function useWebSocket() {
  const [socket, setSocket] = useState<any>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(window.location.origin, {
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
      setSocket(newSocket);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  return { socket, connected };
}