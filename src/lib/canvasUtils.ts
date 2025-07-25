// src/lib/canvasUtils.ts

/**
 * Resizes an image from a data URL to a maximum dimension, preserving aspect ratio.
 * @param imageDataUrl The base64 data URL of the image to resize.
 * @param maxDimension The maximum width or height of the resized image.
 * @returns A Promise that resolves with the data URL of the resized image.
 */
export const resizeImage = (
  imageDataUrl: string,
  maxDimension: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return reject(new Error("Failed to get 2D context for resizing"));
      }

      let { width, height } = img;

      if (width > height) {
        if (width > maxDimension) {
          height = Math.round(height * (maxDimension / width));
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round(width * (maxDimension / height));
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (err) => {
      reject(new Error('Failed to load image for resizing'));
    };
    img.src = imageDataUrl;
  });
};