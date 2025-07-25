// src/lib/imageUtils.ts
import type { BoundingBox } from '@/types';

/**
 * Creates a new image (as a base64 data URL) with bounding boxes and index numbers
 * drawn onto the original image. This annotated image is intended for AI analysis (e.g., Gemini)
 * where the AI needs visual markers corresponding to provided data.
 *
 * @param imageDataUrl Base64 data URL of the original image.
 * @param boxes Array of BoundingBox objects (using relative coordinates) to draw.
 * @returns A Promise resolving with the base64 data URL of the annotated image.
 */
export const createAnnotatedImage = (
    imageDataUrl: string,
    boxes: BoundingBox[] // Expecting raw BoundingBox data here
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return reject(new Error("Failed to get 2D context for annotation canvas"));
    }
    const img = new Image();

    img.onload = () => {
      // Use natural dimensions for accurate drawing on the hidden canvas
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      canvas.width = imgWidth;
      canvas.height = imgHeight;

      // Draw the original image onto the hidden canvas
      ctx.drawImage(img, 0, 0);

      // Draw bounding boxes AND indices for each box provided
      boxes.forEach((box, index) => {
        // Convert relative coordinates back to absolute pixel values for this canvas
        const width = box.width * imgWidth;
        const height = box.height * imgHeight;
        // Calculate top-left corner from center coordinates for drawing
        const topLeftX = (box.x * imgWidth) - (width / 2);
        const topLeftY = (box.y * imgHeight) - (height / 2);

        // --- Draw Bounding Box ---
        ctx.strokeStyle = 'red'; // Use a consistent, visible color for AI
        // Scale line width slightly based on image size for visibility
        ctx.lineWidth = Math.max(2, Math.min(imgWidth, imgHeight) * 0.004);
        ctx.strokeRect(topLeftX, topLeftY, width, height);

        // --- Draw Index Number ---
        // Calculate font size relative to box/image size
        const fontSize = Math.max(12, Math.min(width, height) * 0.3, Math.min(imgWidth, imgHeight) * 0.03);
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Position index number roughly in the center of the box
        const centerX = topLeftX + width / 2;
        const centerY = topLeftY + height / 2;

        // Draw text background/outline for better visibility against varied image content
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)"; // Semi-transparent black background
        const textMeasure = ctx.measureText(index.toString());
        // Calculate background size based on text metrics and font size
        const textBgWidth = textMeasure.width + fontSize * 0.4;
        const textBgHeight = fontSize * 1.2;
        ctx.fillRect(centerX - textBgWidth / 2, centerY - textBgHeight / 2, textBgWidth, textBgHeight);

        // Draw the index number text in white on top of the background
        ctx.fillStyle = "white";
        ctx.fillText(index.toString(), centerX, centerY);
      });

      // Convert the annotated canvas content to a base64 data URL (PNG format)
      try {
        const annotatedImageDataUrl = canvas.toDataURL('image/png');
        resolve(annotatedImageDataUrl);
      } catch (error) {
          console.error("Error converting canvas to data URL:", error);
          reject(new Error("Failed to convert annotated canvas to image data"));
      }
    };

    img.onerror = (err) => {
      console.error("Failed to load image onto annotation canvas", err);
      reject(new Error('Failed to load image for annotation canvas'));
    };

    // Set the source of the Image object to trigger the loading process
    img.src = imageDataUrl;
  });
};