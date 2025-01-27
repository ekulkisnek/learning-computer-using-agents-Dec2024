import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { useVisionProcessor } from '@/lib/ml/vision';
import { useWebSocket } from '@/lib/websocket';
import { Alert } from '@/components/ui/alert';

export default function AgentView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { processFrame } = useVisionProcessor();
  const { socket, connected, error } = useWebSocket();

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isRendering = true;

    const render = () => {
      if (!isRendering) return;

      const frame = ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      const processedFrame = processFrame(frame);
      ctx.putImageData(processedFrame, 0, 0);

      if (socket && connected) {
        socket.emit('frame_data', { timestamp: Date.now() });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRendering = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [processFrame, socket, connected]);

  if (error) {
    return <Alert variant="destructive">WebSocket Error: {error.message}</Alert>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Agent View</h2>
      <Card className="p-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full border border-gray-200 rounded-lg"
        />
      </Card>
      {!connected && (
        <Alert>Connecting to server...</Alert>
      )}
    </div>
  );
}

const processFrame = (frame: any) => {
  try {
    if (!cv2?.Mat) {
      console.warn('OpenCV not initialized');
      return frame;
    }
    return new cv2.Mat(frame);
  } catch (err) {
    console.error('Frame processing error:', err);
    return frame;
  }
}