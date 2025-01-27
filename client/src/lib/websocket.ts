import { io, Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';

export function useWebSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const newSocket = io('/', { // Changed to '/' assuming the server is at the root path
      transports: ['websocket', 'polling'], // Added polling for fallback
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setSocket(newSocket);
      setConnected(true);
      setError(null);
    });

    newSocket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err);
      setError(err);
      setConnected(false);
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    return () => {
      if (newSocket) {
        console.log('Cleaning up WebSocket connection');
        newSocket.close();
      }
    };
  }, []);

  return { socket, connected, error };
}