import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { useVisionProcessor } from '@/lib/ml/vision';
import { useWebSocket } from '@/lib/websocket';

export default function AgentView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { processFrame } = useVisionProcessor();
  const { socket } = useWebSocket();

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // Process frame using vision system
      const frame = ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      const processedFrame = processFrame(frame);
      
      // Update canvas with processed frame
      ctx.putImageData(processedFrame, 0, 0);

      // Send frame data to server if needed
      socket.emit('frame_data', { timestamp: Date.now() });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [processFrame, socket]);

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
      <div className="text-sm text-gray-500">
        Real-time agent viewport with UI element detection
      </div>
    </div>
  );
}
