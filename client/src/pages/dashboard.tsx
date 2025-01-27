import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AgentView from "@/components/agent/AgentView";
import ControlPanel from "@/components/agent/ControlPanel";
import TaskQueue from "@/components/agent/TaskQueue";
import PerformanceMetrics from "@/components/monitoring/PerformanceMetrics";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Agent Dashboard</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="control">Control</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6">
              <Card className="p-6">
                <AgentView />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="control">
            <Card className="p-6">
              <ControlPanel />
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card className="p-6">
              <TaskQueue />
            </Card>
          </TabsContent>

          <TabsContent value="metrics">
            <Card className="p-6">
              <PerformanceMetrics />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
