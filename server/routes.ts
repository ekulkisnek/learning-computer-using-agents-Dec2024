import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketServer } from "socket.io";
import { VisionService } from "./services/ml/visionService";
import { NLPService } from "./services/ml/nlpService";
import { TaskQueueService } from "./services/taskQueue";
import { MonitoringService } from "./services/monitoring";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);
  
  // Initialize WebSocket server
  const io = new SocketServer(httpServer, {
    path: '/ws',
    transports: ['websocket']
  });

  // Initialize services
  const visionService = new VisionService();
  const nlpService = new NLPService();
  const taskQueue = new TaskQueueService();
  const monitoring = new MonitoringService();

  // WebSocket connection handling
  io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('frame_data', async (data) => {
      const processed = await visionService.processFrame(data);
      socket.emit('frame_processed', processed);
    });

    socket.on('task_submit', async (data) => {
      const task = await nlpService.parseTask(data.task);
      const taskId = await taskQueue.addTask(task);
      socket.emit('task_added', { id: taskId, ...task, status: 'pending', progress: 0 });
    });

    socket.on('agent_toggle', (data) => {
      taskQueue.setEnabled(data.enabled);
    });

    socket.on('confidence_update', (data) => {
      visionService.setConfidenceThreshold(data.threshold);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  // Start monitoring service
  monitoring.start(io);

  // API routes
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  return httpServer;
}
