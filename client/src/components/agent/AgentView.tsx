import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { useWebSocket } from '@/lib/websocket';

export default function AgentView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { connected } = useWebSocket();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const render = async () => {
      try {
        const frame = ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        ctx.putImageData(frame, 0, 0);
        requestAnimationFrame(render);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Render error:', err);
      }
    };

    render();
    return () => {
      setError(null);
    };
  }, []);

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
        <Alert variant="warning">Connecting to server...</Alert>
      )}
      {error && (
        <Alert variant="destructive">{error}</Alert>
      )}
    </div>
  );
}