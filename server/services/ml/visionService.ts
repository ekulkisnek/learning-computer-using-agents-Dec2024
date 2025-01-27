import * as tf from '@tensorflow/tfjs-node';
import('@mediapipe/hands').then(mediapipe => {
  console.log('MediaPipe Hands loaded successfully');
}).catch(err => {
  console.error('Error loading MediaPipe:', err);
});
import cv from '@techstark/opencv-js';

interface ProcessedFrame {
  detections: Detection[];
  timestamp: number;
}

interface Detection {
  type: 'ui_element' | 'hand';
  confidence: number;
  bbox?: [number, number, number, number];
  landmarks?: { x: number; y: number; z: number }[];
}

export class VisionService {
  private model: tf.LayersModel | null = null;
  private confidenceThreshold: number = 0.7;

  constructor() {
    this.initializeModels();
  }

  private async initializeModels() {
    try {
      // Initialize TensorFlow model
      this.model = await tf.loadLayersModel('file://models/ui-detection/model.json');
      console.log('Vision models initialized successfully');
    } catch (error) {
      console.error('Error initializing vision models:', error);
      // Don't throw error to allow service to start without model
    }
  }

  public setConfidenceThreshold(threshold: number) {
    this.confidenceThreshold = threshold;
  }

  private preprocessFrame(frame: Buffer): tf.Tensor {
    try {
      const tensor = tf.node.decodeImage(frame)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .expandDims();
      return tensor;
    } catch (error) {
      console.error('Error preprocessing frame:', error);
      throw error;
    }
  }

  private async detectUIElements(tensor: tf.Tensor): Promise<Detection[]> {
    if (!this.model) {
      console.warn('Model not initialized, skipping UI detection');
      return [];
    }

    try {
      const predictions = await this.model.predict(tensor) as tf.Tensor;
      const elements = await predictions.array();

      const detections: Detection[] = [];
      if (Array.isArray(elements) && elements.length > 0 && Array.isArray(elements[0])) {
        elements[0].forEach((element: number[]) => {
          if (element[4] >= this.confidenceThreshold) {
            detections.push({
              type: 'ui_element',
              confidence: element[4],
              bbox: [element[0], element[1], element[2], element[3]]
            });
          }
        });
      }

      predictions.dispose();
      return detections;
    } catch (error) {
      console.error('Error detecting UI elements:', error);
      return [];
    }
  }

  public async processFrame(frame: Buffer): Promise<ProcessedFrame> {
    try {
      // Convert frame to tensor for UI detection
      const tensor = this.preprocessFrame(frame);

      // Run UI element detection
      const uiElements = await this.detectUIElements(tensor);

      // Clean up
      tensor.dispose();

      return {
        detections: uiElements,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error processing frame:', error);
      return {
        detections: [],
        timestamp: Date.now()
      };
    }
  }
}