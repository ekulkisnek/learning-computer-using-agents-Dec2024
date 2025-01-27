import { Server as SocketServer } from 'socket.io';
import os from 'os';

interface MetricsData {
  timestamp: number;
  cpu: number;
  memory: number;
  latency: number;
  tasks: {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
  };
}

export class MonitoringService {
  private io: SocketServer | null = null;
  private interval: NodeJS.Timeout | null = null;
  private metricsHistory: MetricsData[] = [];
  private readonly maxHistoryLength = 100;
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  public start(io: SocketServer) {
    this.io = io;
    this.startMetricsCollection();
  }

  public stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private async collectMetrics(): Promise<MetricsData> {
    // CPU Usage
    const cpus = os.cpus();
    const cpuUsage = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b);
      const idle = cpu.times.idle;
      return acc + ((total - idle) / total);
    }, 0) / cpus.length;

    // Memory Usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = (totalMem - freeMem) / totalMem;

    // Simulated latency (replace with actual latency measurements)
    const latency = Math.random() * 100;

    // Task metrics (replace with actual task queue metrics)
    const tasks = {
      total: 0,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0
    };

    return {
      timestamp: Date.now(),
      cpu: cpuUsage * 100,
      memory: memoryUsage * 100,
      latency,
      tasks
    };
  }

  private startMetricsCollection() {
    this.interval = setInterval(async () => {
      try {
        const metrics = await this.collectMetrics();
        
        // Update metrics history
        this.metricsHistory.push(metrics);
        if (this.metricsHistory.length > this.maxHistoryLength) {
          this.metricsHistory.shift();
        }

        // Emit metrics to connected clients
        if (this.io) {
          this.io.emit('metrics_update', metrics);
        }

        // Log metrics periodically
        if (metrics.timestamp - this.startTime > 60000) { // Every minute
          this.logMetrics(metrics);
          this.startTime = metrics.timestamp;
        }
      } catch (error) {
        console.error('Error collecting metrics:', error);
      }
    }, 1000); // Collect metrics every second
  }

  private logMetrics(metrics: MetricsData) {
    console.log('=== System Metrics ===');
    console.log(`CPU Usage: ${metrics.cpu.toFixed(2)}%`);
    console.log(`Memory Usage: ${metrics.memory.toFixed(2)}%`);
    console.log(`Average Latency: ${metrics.latency.toFixed(2)}ms`);
    console.log('=== Task Metrics ===');
    console.log(`Total: ${metrics.tasks.total}`);
    console.log(`Running: ${metrics.tasks.running}`);
    console.log(`Completed: ${metrics.tasks.completed}`);
    console.log(`Failed: ${metrics.tasks.failed}`);
    console.log('==================');
  }

  public getMetricsHistory(): MetricsData[] {
    return [...this.metricsHistory];
  }

  public getLatestMetrics(): MetricsData | null {
    return this.metricsHistory[this.metricsHistory.length - 1] || null;
  }
}
