import HanziWriter from "hanzi-writer";

/** Share this with the tracing guides so dots sit on the hanzi-writer median. */
export function medianToPixel(point, size, padding) {
  const transform = HanziWriter.getScalingTransform(size, size, padding);
  const [x, y] = point;
  return {
    x: x * transform.scale + transform.x,
    y: size - transform.y - y * transform.scale,
  };
}

export const WRITER_PAD_RATIO = 0.06;
/** About 6% of the 1024-unit character box, which is the grid's inner width. */
export const DRAWING_WIDTH = 62;
