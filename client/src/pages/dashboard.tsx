import { Card } from "@/components/ui/card";
import AgentView from "@/components/agent/AgentView";
import ControlPanel from "@/components/agent/ControlPanel";
import TaskQueue from "@/components/agent/TaskQueue";
import PerformanceMetrics from "@/components/monitoring/PerformanceMetrics";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-6">Agent Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Vision Feed</h2>
            <AgentView />
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Control Center</h2>
            <ControlPanel />
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Active Tasks</h2>
            <TaskQueue />
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">System Metrics</h2>
            <PerformanceMetrics />
          </Card>
        </div>
      </div>
    </div>
  );
}