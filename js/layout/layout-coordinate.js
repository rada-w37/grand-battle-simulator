export const MAP_BASE_WIDTH = 1293;
export const MAP_BASE_HEIGHT = 1217;

export function basePxToPercent(x, y) {
  return {
    leftPercent: (x / MAP_BASE_WIDTH) * 100,
    topPercent: (y / MAP_BASE_HEIGHT) * 100
  };
}

export function renderedPxToBasePx(displayX, displayY, mapRect) {
  return {
    baseX: (displayX / mapRect.width) * MAP_BASE_WIDTH,
    baseY: (displayY / mapRect.height) * MAP_BASE_HEIGHT
  };
}
