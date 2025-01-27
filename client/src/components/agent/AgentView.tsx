import { Card } from '@/components/ui/card';
import { useWebSocket } from '@/lib/websocket';

export default function AgentView() {
  const { connected } = useWebSocket();

  return (
    <Card className="p-4">
      <h2 className="text-2xl font-bold mb-4">Agent Status</h2>
      <div className="text-sm text-gray-500">
        {connected ? 'Connected to agent' : 'Connecting to agent...'}
      </div>
    </Card>
  );
}