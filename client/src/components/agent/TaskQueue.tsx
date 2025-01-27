import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useWebSocket } from '@/lib/websocket';

interface Task {
  id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
}

export default function TaskQueue() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { socket } = useWebSocket();

  useEffect(() => {
    socket.on('task_update', (updatedTask: Task) => {
      setTasks(current =>
        current.map(task =>
          task.id === updatedTask.id ? updatedTask : task
        )
      );
    });

    socket.on('task_added', (newTask: Task) => {
      setTasks(current => [...current, newTask]);
    });

    socket.on('task_removed', (taskId: string) => {
      setTasks(current => current.filter(task => task.id !== taskId));
    });

    return () => {
      socket.off('task_update');
      socket.off('task_added');
      socket.off('task_removed');
    };
  }, [socket]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Task Queue</h2>
      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id} className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{task.description}</span>
                <span className="text-sm capitalize text-gray-500">
                  {task.status}
                </span>
              </div>
              <Progress value={task.progress} className="w-full" />
            </div>
          </Card>
        ))}
        {tasks.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No tasks in queue
          </div>
        )}
      </div>
    </div>
  );
}
