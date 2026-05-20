import * as state from "./state.js";
import * as api from "./api.js";
import * as ui from "./ui.js";
import { getAllPointSelects, normalizeWorldName } from "./utils.js";

const MAP_MIN_SCALE = 1;
const MAP_MAX_SCALE = 2.5;
const MAP_ZOOM_STEP = 0.0015;
const MAP_BUTTON_ZOOM_STEP = 0.25;

const mapView = {
  scale: 1,
  x: 0,
  y: 0,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  dragOriginX: 0,
  dragOriginY: 0,
  isTouchMapGesture: false,
  pinchStartDistance: 0,
  pinchStartScale: 1
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function isMapControlTarget(target) {
  return Boolean(target.closest(".point, select, button, input, textarea"));
}

function getMapElements() {
  return {
    viewport: document.querySelector(".map-container"),
    inner: document.getElementById("map-inner"),
    resetButton: document.getElementById("map-view-reset-button"),
    zoomInButton: document.getElementById("map-zoom-in-button"),
    zoomOutButton: document.getElementById("map-zoom-out-button"),
    zoomValue: document.getElementById("map-zoom-value")
  };
}

function isAtMinScale() {
  return mapView.scale <= MAP_MIN_SCALE + 0.001;
}

function isAtMaxScale() {
  return mapView.scale >= MAP_MAX_SCALE - 0.001;
}

function updateMapZoomControls() {
  const { resetButton, zoomInButton, zoomOutButton, zoomValue } = getMapElements();

  if (zoomValue) {
    zoomValue.textContent = `${Math.round(mapView.scale * 100)}%`;
  }
  if (zoomInButton) {
    zoomInButton.disabled = isAtMaxScale();
  }
  if (zoomOutButton) {
    zoomOutButton.disabled = isAtMinScale();
  }
  if (resetButton) {
    resetButton.disabled = isAtMinScale() && mapView.x === 0 && mapView.y === 0;
  }
}

function constrainMapView() {
  const { viewport, inner } = getMapElements();
  if (!viewport || !inner) return;

  if (mapView.scale <= 1) {
    mapView.scale = 1;
    mapView.x = 0;
    mapView.y = 0;
    return;
  }

  const viewportWidth = viewport.clientWidth;
  const viewportHeight = viewport.clientHeight;
  const contentWidth = inner.offsetWidth * mapView.scale;
  const contentHeight = inner.offsetHeight * mapView.scale;

  if (contentWidth <= viewportWidth) {
    mapView.x = (viewportWidth - contentWidth) / 2;
  } else {
    mapView.x = clamp(mapView.x, viewportWidth - contentWidth, 0);
  }

  if (contentHeight <= viewportHeight) {
    mapView.y = (viewportHeight - contentHeight) / 2;
  } else {
    mapView.y = clamp(mapView.y, viewportHeight - contentHeight, 0);
  }
}

function applyMapView() {
  const { viewport, inner } = getMapElements();
  if (!inner) return;

  constrainMapView();
  inner.style.transform = `matrix(${mapView.scale}, 0, 0, ${mapView.scale}, ${mapView.x}, ${mapView.y})`;
  viewport?.classList.toggle("is-zoomed", mapView.scale > 1);
  updateMapZoomControls();
}

function resetMapView() {
  mapView.scale = 1;
  mapView.x = 0;
  mapView.y = 0;
  applyMapView();
}

function zoomMapTo(nextScale, originX, originY) {
  const nextClampedScale = clamp(nextScale, MAP_MIN_SCALE, MAP_MAX_SCALE);

  if (nextClampedScale === 1) {
    mapView.scale = 1;
    mapView.x = 0;
    mapView.y = 0;
    applyMapView();
    return;
  }

  const worldX = (originX - mapView.x) / mapView.scale;
  const worldY = (originY - mapView.y) / mapView.scale;

  mapView.scale = nextClampedScale;
  mapView.x = originX - worldX * nextClampedScale;
  mapView.y = originY - worldY * nextClampedScale;
  applyMapView();
}

function zoomMapFromCenter(step) {
  const { viewport } = getMapElements();
  if (!viewport) return;

  zoomMapTo(mapView.scale + step, viewport.clientWidth / 2, viewport.clientHeight / 2);
}

function getTouchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

function getTouchCenter(touches, viewport) {
  const rect = viewport.getBoundingClientRect();
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2 - rect.left,
    y: (touches[0].clientY + touches[1].clientY) / 2 - rect.top
  };
}

function startTouchMapGesture(touches) {
  mapView.isTouchMapGesture = true;
  mapView.pinchStartDistance = getTouchDistance(touches);
  mapView.pinchStartScale = mapView.scale;
}

function endTouchMapGesture() {
  mapView.isTouchMapGesture = false;
  mapView.pinchStartDistance = 0;
  mapView.pinchStartScale = mapView.scale;
}

function bindMapViewEvents() {
  const { viewport, resetButton, zoomInButton, zoomOutButton } = getMapElements();
  if (!viewport) return;

  viewport.addEventListener("wheel", event => {
    if (!event.ctrlKey) return;

    event.preventDefault();

    const rect = viewport.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    const nextScale = clamp(mapView.scale * (1 - event.deltaY * MAP_ZOOM_STEP), MAP_MIN_SCALE, MAP_MAX_SCALE);

    zoomMapTo(nextScale, pointerX, pointerY);
  }, { passive: false });

  viewport.addEventListener("pointerdown", event => {
    if (event.pointerType !== "mouse" || event.button !== 0 || mapView.scale <= 1 || isMapControlTarget(event.target)) return;

    mapView.isDragging = true;
    mapView.dragStartX = event.clientX;
    mapView.dragStartY = event.clientY;
    mapView.dragOriginX = mapView.x;
    mapView.dragOriginY = mapView.y;
    viewport.classList.add("is-dragging");
    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener("pointermove", event => {
    if (!mapView.isDragging) return;

    mapView.x = mapView.dragOriginX + event.clientX - mapView.dragStartX;
    mapView.y = mapView.dragOriginY + event.clientY - mapView.dragStartY;
    applyMapView();
  });

  viewport.addEventListener("pointerup", event => {
    if (!mapView.isDragging) return;

    mapView.isDragging = false;
    viewport.classList.remove("is-dragging");
    if (viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
  });

  viewport.addEventListener("pointercancel", () => {
    mapView.isDragging = false;
    viewport.classList.remove("is-dragging");
  });

  viewport.addEventListener("dblclick", event => {
    if (isMapControlTarget(event.target)) return;
    resetMapView();
  });

  viewport.addEventListener("touchstart", event => {
    if (event.touches.length !== 2) return;

    event.preventDefault();
    startTouchMapGesture(event.touches);
  }, { passive: false });

  viewport.addEventListener("touchmove", event => {
    if (!mapView.isTouchMapGesture) return;

    event.preventDefault();
    if (event.touches.length !== 2) return;

    const distance = getTouchDistance(event.touches);
    if (mapView.pinchStartDistance <= 0) return;

    const center = getTouchCenter(event.touches, viewport);
    const nextScale = mapView.pinchStartScale * (distance / mapView.pinchStartDistance);
    zoomMapTo(nextScale, center.x, center.y);
  }, { passive: false });

  viewport.addEventListener("touchend", event => {
    if (event.touches.length >= 2) return;
    endTouchMapGesture();
  });

  viewport.addEventListener("touchcancel", () => {
    endTouchMapGesture();
  });

  resetButton?.addEventListener("click", resetMapView);
  zoomInButton?.addEventListener("click", () => zoomMapFromCenter(MAP_BUTTON_ZOOM_STEP));
  zoomOutButton?.addEventListener("click", () => zoomMapFromCenter(-MAP_BUTTON_ZOOM_STEP));
  window.addEventListener("resize", applyMapView);
  resetMapView();
}

export function bindEvents() {
  document.addEventListener("click", event => {
    if (state.suppressNextMenuClose) return;
    if (!event.target.closest(".tab-context-menu")) ui.hideTabContextMenu();
    if (!event.target.closest(".combo-box")) ui.hideWorldSuggestions();
  });

  state.elements.server.addEventListener("change", () => {
    state.setExpandedWorldRangeKeys(new Set());
    ui.updateWorldOptions();
    api.fetchBattleDataIfReady();
  });

  state.elements.world.addEventListener("change", () => {
    state.elements.world.value = normalizeWorldName(state.elements.world.value);
    api.fetchBattleDataIfReady();
  });

  state.elements.world.addEventListener("input", ui.renderWorldSuggestions);

  state.elements.world.addEventListener("focus", () => {
    ui.showWorldSuggestions();
    window.setTimeout(() => {
      state.elements.world.select();
    }, 0);
  });

  state.elements.world.addEventListener("blur", () => {
    if (state.isSelectingWorldSuggestion) {
      state.setIsSelectingWorldSuggestion(false);
      return;
    }

    if (state.isInteractingWithWorldSuggestions) {
      window.setTimeout(() => {
        state.setIsInteractingWithWorldSuggestions(false);
        state.elements.world.focus();
      }, 0);
      return;
    }

    state.elements.world.value = normalizeWorldName(state.elements.world.value);
    api.fetchBattleDataIfReady();
  });

  state.elements.world.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    state.elements.world.value = normalizeWorldName(state.elements.world.value);
    ui.hideWorldSuggestions();
    api.fetchBattleDataIfReady();
  });

  state.elements.worldSuggestions.addEventListener("pointerdown", () => {
    state.setIsInteractingWithWorldSuggestions(true);
  });

  state.elements.worldSuggestions.addEventListener("mousedown", event => {
    event.preventDefault();
    event.stopPropagation();
    state.setIsInteractingWithWorldSuggestions(true);
  }, true);

  state.elements.worldSuggestions.addEventListener("click", event => {
    event.stopPropagation();
  });

  state.elements.worldSuggestions.addEventListener("touchstart", () => {
    state.setIsInteractingWithWorldSuggestions(true);
  }, { passive: true });

  state.elements.worldSuggestions.addEventListener("pointerup", () => {
    window.setTimeout(() => {
      state.setIsInteractingWithWorldSuggestions(false);
    }, 0);
  });

  state.elements.worldSuggestions.addEventListener("pointercancel", () => {
    state.setIsInteractingWithWorldSuggestions(false);
  });

  state.elements.battleClass.addEventListener("change", api.fetchBattleDataIfReady);
  state.elements.block.addEventListener("change", api.fetchBattleDataIfReady);

  state.elements.applyButton.addEventListener("click", ui.applyBattleData);
  state.elements.deleteTabButton.addEventListener("click", ui.deleteActiveOccupationTab);
  state.elements.resetDataButton.addEventListener("click", ui.resetAllData);

  getAllPointSelects().forEach(select => {
    select.addEventListener("change", () => {
      const point = select.closest(".point");
      if (select.classList.contains("point-attacker-select")) {
        ui.updatePointDeclaration(point, select.value);
      } else {
        ui.setPointAura(point, select.value);
        ui.updatePointChip(point, select.value);
      }
      ui.updatePointSelfAttackState(point);
      ui.saveSelectStates();
      ui.updateScores();
    });
  });

  bindMapViewEvents();
}
