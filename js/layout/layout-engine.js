// Layout engine facade
// Phase 3: passthrough entry point for existing layout values.

import { getMapLayoutCssVars } from "./viewport.js?v=20260524-visibility-toggles";
import { getMapPointUiOffsets } from "./point-offsets.js?v=20260524-visibility-toggles";
import { MAP_BANNER_PLACEMENTS, getBannerTextOffset } from "./decorations.js?v=20260524-visibility-toggles";

export function getPointLayout(pointId, viewport, width) {
  const bannerPlacement = MAP_BANNER_PLACEMENTS.find(placement => placement.pointId === pointId);

  return {
    cssVars: getMapLayoutCssVars(width),
    pointOffsets: getMapPointUiOffsets(pointId, width),
    bannerTextOffset: bannerPlacement ? getBannerTextOffset(bannerPlacement, viewport) : null
  };
}
