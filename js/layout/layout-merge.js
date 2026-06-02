// Layout layer merge helper
// Phase 4: shallow merge entry point for future map layout layers.

export function mergeLayoutLayers(...layers) {
  return Object.assign({}, ...layers.filter(Boolean));
}
