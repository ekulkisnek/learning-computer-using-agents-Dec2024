import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useWebSocket } from '@/lib/websocket';

export default function ControlPanel() {
  const [agentEnabled, setAgentEnabled] = useState(false);
  const [confidence, setConfidence] = useState([0.7]);
  const [taskInput, setTaskInput] = useState('');
  const { socket } = useWebSocket();

  const handleAgentToggle = (enabled: boolean) => {
    setAgentEnabled(enabled);
    socket.emit('agent_toggle', { enabled });
  };

  const handleConfidenceChange = (values: number[]) => {
    setConfidence(values);
    socket.emit('confidence_update', { threshold: values[0] });
  };

  const handleTaskSubmit = () => {
    if (taskInput.trim()) {
      socket.emit('task_submit', { task: taskInput });
      setTaskInput('');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Control Panel</h2>

      <div className="flex items-center justify-between">
        <span className="font-medium">Agent Status</span>
        <Switch
          checked={agentEnabled}
          onCheckedChange={handleAgentToggle}
        />
      </div>

      <div className="space-y-2">
        <span className="font-medium">Confidence Threshold</span>
        <Slider
          value={confidence}
          onValueChange={handleConfidenceChange}
          min={0}
          max={1}
          step={0.1}
          className="w-full"
        />
        <span className="text-sm text-gray-500">
          Current: {confidence[0].toFixed(2)}
        </span>
      </div>

      <div className="space-y-2">
        <span className="font-medium">Task Input</span>
        <div className="flex gap-2">
          <Input
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Enter task description..."
          />
          <Button onClick={handleTaskSubmit}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
