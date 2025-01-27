
import type { Express } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

export function registerRoutes(app: Express) {
  const httpServer = createServer(app);
  
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(cors());

  io.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("task_submit", (data) => {
      console.log("Task received:", data);
      // Acknowledge receipt
      socket.emit("task_added", { id: Date.now().toString(), task: data.task });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  return httpServer;
}
