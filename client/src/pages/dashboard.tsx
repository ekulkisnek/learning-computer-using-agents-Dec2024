
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import AgentView from "@/components/agent/AgentView";
import ControlPanel from "@/components/agent/ControlPanel";
import TaskQueue from "@/components/agent/TaskQueue";
import PerformanceMetrics from "@/components/monitoring/PerformanceMetrics";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="container mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Computer-Using Agent Platform
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Vision Feed</h2>
              <p className="text-sm text-gray-600">Real-time computer vision with TensorFlow.js and MediaPipe</p>
            </CardHeader>
            <CardContent>
              <AgentView />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Control Center</h2>
              <p className="text-sm text-gray-600">Advanced NLP capabilities using GPT-4</p>
            </CardHeader>
            <CardContent>
              <ControlPanel />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Active Tasks</h2>
              <p className="text-sm text-gray-600">Task queue and execution monitoring</p>
            </CardHeader>
            <CardContent>
              <TaskQueue />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">System Metrics</h2>
              <p className="text-sm text-gray-600">Real-time performance monitoring</p>
            </CardHeader>
            <CardContent>
              <PerformanceMetrics />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
