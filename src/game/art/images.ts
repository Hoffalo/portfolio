const cache = new Map<string, HTMLImageElement>();

/**
 * Returns the image once it has loaded, or undefined while it is still loading (or failed).
 * The render loop simply asks again next frame, so no callbacks are needed.
 */
export function loadedImage(url: string): HTMLImageElement | undefined {
  let image = cache.get(url);
  if (!image) {
    image = new Image();
    image.decoding = "async";
    image.src = url;
    cache.set(url, image);
  }
  return image.complete && image.naturalWidth > 0 ? image : undefined;
}

/** Draws an image cropped to fill the area, like CSS object-fit: cover. */
export function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  // Smoothing while shrinking keeps detail; the upscaled canvas still renders it as crisp pixels.
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(
    image,
    (image.naturalWidth - sourceWidth) / 2,
    (image.naturalHeight - sourceHeight) / 2,
    sourceWidth,
    sourceHeight,
    Math.round(x),
    Math.round(y),
    Math.round(width),
    Math.round(height),
  );
  ctx.restore();
}
