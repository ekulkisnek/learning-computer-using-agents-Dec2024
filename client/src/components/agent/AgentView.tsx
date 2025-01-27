import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useWebSocket } from '@/lib/websocket';

export default function AgentView() {
  const { socket, connected } = useWebSocket();

  useEffect(() => {
    if (!socket?.connected) return;

    socket.on('agent_action', (action: any) => {
      console.log('Agent action:', action);
    });

    return () => {
      socket.off('agent_action');
    };
  }, [socket]);

  return (
    <Card className="p-4">
      <h2 className="text-2xl font-bold mb-4">Agent View</h2>
      <div className="text-sm text-gray-500">
        {connected ? 'Agent is connected' : 'Connecting to agent...'}
      </div>
    </Card>
  );
}