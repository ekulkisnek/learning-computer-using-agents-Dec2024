import * as tf from '@tensorflow/tfjs';
import * as mediapipe from '@mediapipe/hands';
import cv from '@techstark/opencv-js';

export interface VisionProcessorConfig {
  confidenceThreshold: number;
  modelPath: string;
}

export function useVisionProcessor(config: VisionProcessorConfig = {
  confidenceThreshold: 0.7,
  modelPath: '/models/ui-detection'
}) {
  let model: tf.LayersModel | null = null;
  let mediapipeHands: mediapipe.Hands | null = null;

  const initializeModel = async () => {
    if (!model) {
      model = await tf.loadLayersModel(config.modelPath);
    }
    if (!mediapipeHands) {
      mediapipeHands = new mediapipe.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });
    }
  };

  const preprocessFrame = (imageData: ImageData): tf.Tensor => {
    const tensor = tf.browser.fromPixels(imageData)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .expandDims();
    return tensor;
  };

  const detectUIElements = async (tensor: tf.Tensor) => {
    if (!model) await initializeModel();
    const predictions = await model!.predict(tensor) as tf.Tensor;
    const elements = await predictions.array();
    return elements;
  };

  const processFrame = (imageData: ImageData) => {
    // Convert to OpenCV mat
    const mat = cv.matFromImageData(imageData);
    
    // Preprocess frame
    const tensor = preprocessFrame(imageData);
    
    // Detect UI elements
    const elements = detectUIElements(tensor);
    
    // Process hand gestures
    if (mediapipeHands) {
      mediapipeHands.onResults((results) => {
        if (results.multiHandLandmarks) {
          results.multiHandLandmarks.forEach(landmarks => {
            // Draw hand landmarks on mat
            landmarks.forEach((landmark, index) => {
              const point = new cv.Point(
                landmark.x * mat.cols,
                landmark.y * mat.rows
              );
              cv.circle(mat, point, 3, [0, 255, 0, 255], -1);
            });
          });
        }
      });
    }
    
    // Convert back to ImageData
    const processed = new ImageData(
      new Uint8ClampedArray(mat.data),
      mat.cols,
      mat.rows
    );
    
    // Clean up
    mat.delete();
    tensor.dispose();
    
    return processed;
  };

  return {
    processFrame,
    initializeModel
  };
}
