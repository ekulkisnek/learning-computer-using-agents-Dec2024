import { useCallback, useEffect, useState } from 'react';
import { useWebSocket } from '../websocket';

export interface DetectedObject {
  bbox: [number, number, number, number];
  class: string;
  score: number;
}

export function useVisionProcessor() {
  const { socket, connected } = useWebSocket();
  const [isProcessing, setIsProcessing] = useState(false);
  const [detections, setDetections] = useState<DetectedObject[]>([]);

  const processFrame = useCallback((frame: ImageData): ImageData => {
    if (!connected || !socket) {
      return frame;
    }

    socket.emit('frame_data', frame.data);
    return frame;
  }, [socket, connected]);

  useEffect(() => {
    if (!socket) return;

    socket.on('frame_processed', (processedData: DetectedObject[]) => {
      setDetections(processedData);
    });

    return () => {
      socket.off('frame_processed');
    };
  }, [socket]);

  return {
    processFrame,
    isProcessing,
    detections
  };
}