import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useWebSocket } from '@/lib/websocket';

interface MetricData {
  timestamp: number;
  cpu: number;
  memory: number;
  latency: number;
}

export default function PerformanceMetrics() {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const { socket } = useWebSocket();

  useEffect(() => {
    socket.on('metrics_update', (newMetric: MetricData) => {
      setMetrics(current => [...current.slice(-50), newMetric]);
    });

    return () => {
      socket.off('metrics_update');
    };
  }, [socket]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Performance Metrics</h2>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">CPU Usage</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={metrics}>
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => new Date(value).toLocaleTimeString()}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleTimeString()}
            />
            <Line type="monotone" dataKey="cpu" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Memory Usage</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={metrics}>
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => new Date(value).toLocaleTimeString()}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleTimeString()}
            />
            <Line type="monotone" dataKey="memory" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Latency</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={metrics}>
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => new Date(value).toLocaleTimeString()}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleTimeString()}
            />
            <Line type="monotone" dataKey="latency" stroke="#ffc658" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
