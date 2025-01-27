
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert } from '@/components/ui/alert';
import { useWebSocket } from '@/lib/websocket';

export default function ControlPanel() {
  const [agentEnabled, setAgentEnabled] = useState(false);
  const [confidence, setConfidence] = useState([0.7]);
  const [taskInput, setTaskInput] = useState('');
  const { socket, connected } = useWebSocket();

  const handleAgentToggle = (enabled: boolean) => {
    setAgentEnabled(enabled);
    if (socket && connected) {
      socket.emit('agent_toggle', { enabled });
    }
  };

  const handleConfidenceChange = (values: number[]) => {
    setConfidence(values);
    if (socket && connected) {
      socket.emit('confidence_update', { threshold: values[0] });
    }
  };

  const handleTaskSubmit = () => {
    if (!taskInput.trim() || !socket || !connected) return;
    
    socket.emit('task_submit', { task: taskInput }, (response: { success: boolean, error?: string }) => {
      if (response.success) {
        setTaskInput('');
      } else {
        console.error('Task submission failed:', response.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Agent Status</h3>
            <p className="text-sm text-gray-500">Enable/disable automated actions</p>
          </div>
          <Switch
            checked={agentEnabled}
            onCheckedChange={handleAgentToggle}
          />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Detection Confidence</h3>
        <p className="text-sm text-gray-500">Adjust minimum confidence threshold for UI element detection</p>
        <Slider
          value={confidence}
          onValueChange={handleConfidenceChange}
          min={0}
          max={1}
          step={0.1}
          className="w-full"
        />
        <span className="text-sm">{confidence[0].toFixed(2)}</span>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Task Input</h3>
        <p className="text-sm text-gray-500">Enter instructions for the agent to execute</p>
        <div className="flex gap-2">
          <Input
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Example: Click the submit button"
          />
          <Button 
            onClick={handleTaskSubmit}
            disabled={!connected || !taskInput.trim()}
          >
            Submit
          </Button>
        </div>
      </div>

      {!connected && (
        <Alert>
          Connecting to server... Some features may be unavailable.
        </Alert>
      )}
    </div>
  );
}
