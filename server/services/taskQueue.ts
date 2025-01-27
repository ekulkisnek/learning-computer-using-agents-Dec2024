import { EventEmitter } from 'events';
import { Task } from './ml/nlpService';
import { v4 as uuidv4 } from 'uuid';

interface QueuedTask {
  id: string;
  task: Task;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  currentStep: number;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TaskQueueService extends EventEmitter {
  private queue: QueuedTask[] = [];
  private isProcessing: boolean = false;
  private enabled: boolean = false;
  private maxConcurrent: number = 1;
  private runningTasks: Set<string> = new Set();

  constructor() {
    super();
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (enabled && !this.isProcessing) {
      this.processQueue();
    }
  }

  public async addTask(task: Task): Promise<string> {
    const taskId = uuidv4();
    const queuedTask: QueuedTask = {
      id: taskId,
      task,
      status: 'pending',
      progress: 0,
      currentStep: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.queue.push(queuedTask);
    this.emit('taskAdded', queuedTask);

    if (this.enabled && !this.isProcessing) {
      this.processQueue();
    }

    return taskId;
  }

  public getTask(taskId: string): QueuedTask | undefined {
    return this.queue.find(task => task.id === taskId);
  }

  public removeTask(taskId: string): boolean {
    const index = this.queue.findIndex(task => task.id === taskId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      this.emit('taskRemoved', taskId);
      return true;
    }
    return false;
  }

  private async processQueue() {
    if (!this.enabled || this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.enabled && this.queue.length > 0 && this.runningTasks.size < this.maxConcurrent) {
        const task = this.queue.find(t => t.status === 'pending');
        if (!task) break;

        this.runningTasks.add(task.id);
        task.status = 'running';
        task.updatedAt = new Date();
        this.emit('taskUpdated', task);

        try {
          for (let i = task.currentStep; i < task.task.steps.length; i++) {
            task.currentStep = i;
            task.progress = (i / task.task.steps.length) * 100;
            task.updatedAt = new Date();
            this.emit('taskUpdated', task);

            // Simulate step execution (replace with actual execution logic)
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          task.status = 'completed';
          task.progress = 100;
        } catch (error) {
          task.status = 'failed';
          task.error = error.message;
          console.error(`Task ${task.id} failed:`, error);
        }

        task.updatedAt = new Date();
        this.emit('taskUpdated', task);
        this.runningTasks.delete(task.id);
      }
    } finally {
      this.isProcessing = false;
      
      // If there are still pending tasks and we're enabled, continue processing
      if (this.enabled && this.queue.some(t => t.status === 'pending')) {
        setImmediate(() => this.processQueue());
      }
    }
  }

  public getQueueStatus() {
    return {
      total: this.queue.length,
      pending: this.queue.filter(t => t.status === 'pending').length,
      running: this.runningTasks.size,
      completed: this.queue.filter(t => t.status === 'completed').length,
      failed: this.queue.filter(t => t.status === 'failed').length
    };
  }
}
