import type { Express } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { TaskQueueService } from "./services/taskQueue";

export function registerRoutes(app: Express) {
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const taskQueue = new TaskQueueService();

  io.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("task_submit", (data) => {
      console.log("Task received:", data);
      const taskId = taskQueue.addTask(data.task);
      socket.emit("task_added", { id: taskId, task: data.task });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  return httpServer;
}