// Layout engine facade
// Phase 3: passthrough entry point for existing layout values.

import { getMapLayoutCssVars } from "./viewport.js?v=20260524-visibility-toggles";
import { getMapPointUiOffsets } from "./point-offsets.js?v=20260524-visibility-toggles";
import { MAP_BANNER_PLACEMENTS, getBannerTextOffset } from "./decorations.js?v=20260524-visibility-toggles";
import { BATTLE_POINTS } from "./base.js?v=20260524-visibility-toggles";
import { TYPE_LAYOUT } from "./type-layout.js?v=20260524-visibility-toggles";
import { VIEWPORT_LAYOUT } from "./viewport-layout.js?v=20260524-visibility-toggles";
import { getLayoutViewport } from "./layout-coordinate.js?v=20260524-visibility-toggles";

export function getPointLayout(pointId, viewport, width) {
  const resolvedViewport = viewport ?? getLayoutViewport(width);
  const point = BATTLE_POINTS.find(point => point.id === pointId);
  const bannerPlacement = MAP_BANNER_PLACEMENTS.find(placement => placement.pointId === pointId);
  const typeLayout = TYPE_LAYOUT[point?.type] ?? {};
  const viewportLayout = VIEWPORT_LAYOUT[resolvedViewport] ?? {};

  return {
    cssVars: getMapLayoutCssVars(width),
    pointOffsets: getMapPointUiOffsets(pointId, width),
    bannerTextOffset: bannerPlacement ? getBannerTextOffset(bannerPlacement, resolvedViewport) : null,
    typeLayout,
    viewportLayout
  };
}
