import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWebSocket } from '@/lib/websocket';

export default function ControlPanel() {
  const [taskInput, setTaskInput] = useState('');
  const { socket, connected } = useWebSocket();

  const handleTaskSubmit = () => {
    if (!taskInput.trim() || !socket) return;

    socket.emit('task_submit', { task: taskInput });
    setTaskInput('');
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex gap-2">
        <Input
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          placeholder="Enter task..."
          disabled={!connected}
        />
        <Button 
          onClick={handleTaskSubmit}
          disabled={!connected || !taskInput.trim()}
        >
          Submit
        </Button>
      </div>
      {!connected && (
        <div className="text-red-500">
          Connecting to server...
        </div>
      )}
    </div>
  );
}