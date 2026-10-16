/**
 * Resizes an image to a maximum dimension while maintaining aspect ratio
 * and returns it as a base64 string.
 */
export const resizeImage = (base64Str: string, maxDim: number = 1800): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDim) {
          height *= maxDim / width;
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width *= maxDim / height;
          height = maxDim;
        }
      }

      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Use jpeg with 0.88 quality to preserve fine coin details across trays
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.onerror = (err) => reject(err);
  });
};

/**
 * Extracts and crops an individual coin from a multi-coin master image using normalized
 * bounding box coordinates [ymin, xmin, ymax, xmax] (0 to 1000 scale).
 * Adds a generous padding to capture the entire coin rim and denticles cleanly.
 */
export const cropCoinImage = (
  masterImageBase64: string,
  box: [number, number, number, number],
  paddingRatio: number = 0.06
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = masterImageBase64;
    img.onload = () => {
      const [ymin, xmin, ymax, xmax] = box;
      const naturalW = img.naturalWidth || img.width;
      const naturalH = img.naturalHeight || img.height;

      // Convert 0..1000 normalized to actual pixel coordinates
      let x1 = (xmin / 1000) * naturalW;
      let y1 = (ymin / 1000) * naturalH;
      let x2 = (xmax / 1000) * naturalW;
      let y2 = (ymax / 1000) * naturalH;

      let boxW = Math.max(10, x2 - x1);
      let boxH = Math.max(10, y2 - y1);

      // Make crop square or near-square around the coin center
      const centerX = x1 + boxW / 2;
      const centerY = y1 + boxH / 2;
      const side = Math.max(boxW, boxH) * (1 + paddingRatio * 2);

      let cropX = Math.max(0, centerX - side / 2);
      let cropY = Math.max(0, centerY - side / 2);
      let cropW = Math.min(naturalW - cropX, side);
      let cropH = Math.min(naturalH - cropY, side);

      const targetDim = Math.min(800, Math.max(320, Math.round(side)));
      const canvas = document.createElement('canvas');
      canvas.width = targetDim;
      canvas.height = targetDim;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(masterImageBase64);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw background disk or fill
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, targetDim, targetDim);

      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, targetDim, targetDim);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => {
      // Fallback to original if image load fails
      resolve(masterImageBase64);
    };
  });
};
