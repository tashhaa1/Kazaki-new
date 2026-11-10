/**
 * Utility functions for handling and optimizing media (images and videos)
 * uploaded directly from the manager's device, phone gallery, studio, or camera.
 */

export interface MediaUploadResult {
  dataUrl: string;
  fileName: string;
  fileSize: number;
  type: 'image' | 'video';
  mimeType: string;
}

/**
 * Formats bytes into a human-readable file size string.
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Optimizes an image file from the user's phone, gallery, studio, or camera:
 * Compresses the image to target <= 300 KB max while preserving maximum sharpness,
 * high resolution (up to 1600px), and vibrant colors without blurring (دون أن يغوش).
 */
export const optimizeImageFile = (
  file: File,
  targetMaxKb = 300
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If SVG or GIF, don't re-encode on canvas to preserve animation/vector
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Target binary byte limit (300 KB = 307,200 bytes)
        // Data URL base64 length = approx binary bytes * 1.37
        const maxBinaryBytes = targetMaxKb * 1024;
        const maxDataUrlLength = Math.round(maxBinaryBytes * 1.37);

        // Keep resolution crisp and high-definition
        const maxDim = 1600;
        let bestResult = '';

        const tryRender = (dim: number, quality: number, format: 'image/jpeg' | 'image/webp'): string => {
          let w = img.width;
          let h = img.height;
          if (w > dim || h > dim) {
            if (w > h) {
              h = Math.round((h * dim) / w);
              w = dim;
            } else {
              w = Math.round((w * dim) / h);
              h = dim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) return '';

          // High-clarity smoothing prevents any blurring or pixelation
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, w, h);

          try {
            return canvas.toDataURL(format, quality);
          } catch {
            return canvas.toDataURL('image/jpeg', quality);
          }
        };

        // Multi-tier quality calibration: start with highest quality and check size
        // 1. Try high quality (0.92 down to 0.75) at 1600px
        const qualitySteps = [0.92, 0.88, 0.84, 0.80, 0.75];
        for (const q of qualitySteps) {
          const res = tryRender(maxDim, q, 'image/jpeg');
          if (res) {
            bestResult = res;
            if (res.length <= maxDataUrlLength) {
              resolve(res);
              return;
            }
          }
        }

        // 2. If still over 300KB (e.g. for ultra-dense photos), adjust resolution slightly
        // (Resizing canvas slightly keeps crystal-clear sharpness, whereas crushing JPEG quality below 0.7 causes blur!)
        const fallbackDims = [1350, 1150, 950];
        for (const dim of fallbackDims) {
          for (const q of [0.84, 0.80, 0.75]) {
            const res = tryRender(dim, q, 'image/jpeg');
            if (res) {
              bestResult = res;
              if (res.length <= maxDataUrlLength) {
                resolve(res);
                return;
              }
            }
          }
        }

        resolve(bestResult || (e.target?.result as string));
      };

      img.onerror = () => {
        // Fallback to original data URL if image decode fails
        resolve(e.target?.result as string);
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Reads any video file (MP4, WebM, MOV) from the device and returns a Data URL.
 */
export const readVideoFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Unified processor for files picked from phone gallery / studio.
 */
export const processStudioFile = async (
  file: File
): Promise<MediaUploadResult> => {
  const isVideo = file.type.startsWith('video/');
  let dataUrl: string;

  if (isVideo) {
    dataUrl = await readVideoFile(file);
  } else {
    dataUrl = await optimizeImageFile(file);
  }

  return {
    dataUrl,
    fileName: file.name,
    fileSize: file.size,
    type: isVideo ? 'video' : 'image',
    mimeType: file.type,
  };
};
