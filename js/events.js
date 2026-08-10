import * as state from "./state.js?v=20260810-png-values";
import * as api from "./api.js?v=20260810-png-values";
import * as ui from "./ui.js?v=20260810-png-values";
import { getAllPointSelects, normalizeWorldName } from "./utils.js?v=20260810-png-values";
import { getLayoutViewport } from "./layout/layout-coordinate.js?v=20260524-visibility-toggles";

const MAP_MIN_SCALE = 1;
const MAP_MAX_SCALE = 2.5;
const MAP_ZOOM_STEP = 0.0015;
const MAP_BUTTON_ZOOM_STEP = 0.25;
const DESKTOP_SELECT_SCALE_FACTORS = [
  [1, 1],
  [1.25, 0.98],
  [1.5, 0.95],
  [1.75, 0.92],
  [2, 0.9],
  [2.25, 0.84],
  [2.5, 0.78]
];

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
  pinchStartScale: 1,
  pinchStartWorldX: 0,
  pinchStartWorldY: 0
};

let isComposingWorldInput = false;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getDesktopSelectScaleFactor(scale) {
  const first = DESKTOP_SELECT_SCALE_FACTORS[0];
  const last = DESKTOP_SELECT_SCALE_FACTORS[DESKTOP_SELECT_SCALE_FACTORS.length - 1];
  if (scale <= first[0]) return first[1];
  if (scale >= last[0]) return last[1];

  for (let index = 1; index < DESKTOP_SELECT_SCALE_FACTORS.length; index += 1) {
    const previous = DESKTOP_SELECT_SCALE_FACTORS[index - 1];
    const current = DESKTOP_SELECT_SCALE_FACTORS[index];
    if (scale > current[0]) continue;

    const progress = (scale - previous[0]) / (current[0] - previous[0]);
    return previous[1] + (current[1] - previous[1]) * progress;
  }

  return last[1];
}

function isMapControlTarget(target) {
  return Boolean(target.closest(".point, select, button, input, textarea"));
}

function getMapElements() {
  return {
    viewport: document.querySelector(".map-container"),
    zoomControls: document.querySelector(".map-zoom-controls"),
    inner: document.getElementById("map-inner"),
    resetButton: document.getElementById("map-view-reset-button"),
    zoomToggleButton: document.getElementById("map-zoom-toggle-button"),
    zoomCloseButton: document.getElementById("map-zoom-close-button"),
    zoomInButton: document.getElementById("map-zoom-in-button"),
    zoomOutButton: document.getElementById("map-zoom-out-button"),
    zoomValue: document.getElementById("map-zoom-value")
  };
}

function commitWorldInput({ hideSuggestions = true } = {}) {
  state.elements.world.value = normalizeWorldName(state.elements.world.value);
  if (hideSuggestions) ui.hideWorldSuggestions();
  api.fetchBattleDataIfReady();
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

function createSvgIcon(paths) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
}

const MAP_ZOOM_OPEN_ICON = '<path d="M11.5 5l-6 7 6 7" /><path d="M18 5l-6 7 6 7" />';
const MAP_ZOOM_CLOSE_ICON = '<path d="M5 6l6 6-6 6" />';
const VISIBILITY_TOGGLES = [
  {
    id: "attacker",
    icon: "resource/sword-marker.png",
    label: "侵攻側表示切替"
  },
  {
    id: "defender",
    icon: "resource/shield-marker.png",
    label: "防衛側表示切替"
  }
];

const visibilityState = VISIBILITY_TOGGLES.reduce((stateById, toggle) => {
  stateById[toggle.id] = true;
  return stateById;
}, {});

function setupMapActionButtons() {
  state.elements.deleteTabButton.classList.add("danger-icon-button");
  state.elements.deleteTabButton.setAttribute("aria-label", "選択中のタブを削除");
  state.elements.deleteTabButton.title = "選択中のタブを削除";
  state.elements.deleteTabButton.innerHTML = `
    ${createSvgIcon('<path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v5" /><path d="M14 11v5" />')}
    <span class="action-label">選択中のタブを削除</span>
  `;

  state.elements.resetDataButton.classList.add("danger-icon-button");
  state.elements.resetDataButton.setAttribute("aria-label", "全データを初期化");
  state.elements.resetDataButton.title = "全データを初期化";
  state.elements.resetDataButton.innerHTML = `
    ${createSvgIcon('<path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l.73-1.19" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />')}
    <span class="action-label">全データ初期化</span>
  `;
}

function ensureMapZoomToggleButton() {
  const { zoomControls } = getMapElements();
  if (!zoomControls) return;

  const zoomActions = zoomControls.querySelector(".map-zoom-actions") || zoomControls;
  let toggleButton = document.getElementById("map-zoom-toggle-button");
  if (!toggleButton) {
    toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.id = "map-zoom-toggle-button";
    toggleButton.className = "map-zoom-toggle-button";
    toggleButton.setAttribute("aria-label", "ズーム操作を表示");
    toggleButton.title = "ズーム操作を表示";
    toggleButton.setAttribute("aria-expanded", "false");
    toggleButton.innerHTML = createSvgIcon(MAP_ZOOM_OPEN_ICON);
    zoomActions.prepend(toggleButton);
  }

  if (document.getElementById("map-zoom-close-button")) return;

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.id = "map-zoom-close-button";
  closeButton.className = "map-zoom-close-button";
  closeButton.setAttribute("aria-label", "ズーム操作を閉じる");
  closeButton.title = "ズーム操作を閉じる";
  closeButton.innerHTML = createSvgIcon(MAP_ZOOM_CLOSE_ICON);
  toggleButton.insertAdjacentElement("afterend", closeButton);
}

function applyVisibilityToggleState() {
  const { viewport } = getMapElements();
  if (!viewport) return;

  VISIBILITY_TOGGLES.forEach(toggle => {
    const isVisible = visibilityState[toggle.id] !== false;
    viewport.dataset[`show${toggle.id[0].toUpperCase()}${toggle.id.slice(1)}`] = String(isVisible);

    const button = document.getElementById(`map-visibility-${toggle.id}-button`);
    if (!button) return;
    button.setAttribute("aria-pressed", String(isVisible));
    button.classList.toggle("is-off", !isVisible);
  });
}

function ensureMapVisibilityToggleButtons() {
  const container = document.getElementById("map-visibility-controls");
  if (!container) return;

  VISIBILITY_TOGGLES.forEach(toggle => {
    const buttonId = `map-visibility-${toggle.id}-button`;
    if (document.getElementById(buttonId)) return;

    const button = document.createElement("button");
    button.type = "button";
    button.id = buttonId;
    button.className = "map-visibility-toggle-button";
    button.setAttribute("aria-label", toggle.label);
    button.setAttribute("aria-pressed", String(visibilityState[toggle.id]));
    button.title = toggle.label;
    button.innerHTML = `<img src="${toggle.icon}" alt="" aria-hidden="true">`;
    button.addEventListener("click", event => {
      event.stopPropagation();
      visibilityState[toggle.id] = !visibilityState[toggle.id];
      applyVisibilityToggleState();
    });
    container.appendChild(button);
  });

  applyVisibilityToggleState();
}

function setMapZoomControlsOpen(isOpen) {
  const { zoomControls, zoomToggleButton } = getMapElements();
  zoomControls?.classList.toggle("is-open", isOpen);
  if (!zoomToggleButton) return;

  zoomToggleButton.setAttribute("aria-expanded", String(isOpen));
  zoomToggleButton.setAttribute("aria-label", "ズーム操作を表示");
  zoomToggleButton.title = "ズーム操作を表示";
  zoomToggleButton.innerHTML = createSvgIcon(MAP_ZOOM_OPEN_ICON);
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
  const labelScale = Math.min(1.45, 1 + (mapView.scale - 1) * 0.3);
  inner.style.setProperty("--map-label-font-scale", String(labelScale));
  if (getLayoutViewport() === "mobile") {
    inner.style.removeProperty("--map-select-font-scale");
  } else {
    inner.style.setProperty("--map-select-font-scale", String(labelScale * getDesktopSelectScaleFactor(mapView.scale)));
  }
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

function startTouchMapGesture(touches, viewport) {
  const center = getTouchCenter(touches, viewport);

  mapView.isTouchMapGesture = true;
  mapView.pinchStartDistance = getTouchDistance(touches);
  mapView.pinchStartScale = mapView.scale;
  mapView.pinchStartWorldX = (center.x - mapView.x) / mapView.scale;
  mapView.pinchStartWorldY = (center.y - mapView.y) / mapView.scale;
}

function endTouchMapGesture() {
  mapView.isTouchMapGesture = false;
  mapView.pinchStartDistance = 0;
  mapView.pinchStartScale = mapView.scale;
  mapView.pinchStartWorldX = 0;
  mapView.pinchStartWorldY = 0;
}

function updateTouchMapGesture(touches, viewport) {
  const distance = getTouchDistance(touches);
  if (mapView.pinchStartDistance <= 0) return;

  const center = getTouchCenter(touches, viewport);
  const nextScale = clamp(
    mapView.pinchStartScale * (distance / mapView.pinchStartDistance),
    MAP_MIN_SCALE,
    MAP_MAX_SCALE
  );

  if (nextScale === 1) {
    mapView.scale = 1;
    mapView.x = 0;
    mapView.y = 0;
    applyMapView();
    return;
  }

  mapView.scale = nextScale;
  mapView.x = center.x - mapView.pinchStartWorldX * nextScale;
  mapView.y = center.y - mapView.pinchStartWorldY * nextScale;
  applyMapView();
}

function bindMapViewEvents() {
  ensureMapZoomToggleButton();
  ensureMapVisibilityToggleButtons();
  const { viewport, resetButton, zoomToggleButton, zoomCloseButton, zoomInButton, zoomOutButton } = getMapElements();
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
    startTouchMapGesture(event.touches, viewport);
  }, { passive: false });

  viewport.addEventListener("touchmove", event => {
    if (!mapView.isTouchMapGesture) return;

    event.preventDefault();
    if (event.touches.length !== 2) return;

    updateTouchMapGesture(event.touches, viewport);
  }, { passive: false });

  viewport.addEventListener("touchend", event => {
    if (event.touches.length >= 2) return;
    endTouchMapGesture();
  });

  viewport.addEventListener("touchcancel", () => {
    endTouchMapGesture();
  });

  resetButton?.addEventListener("click", resetMapView);
  zoomToggleButton?.addEventListener("click", event => {
    event.stopPropagation();
    const { zoomControls } = getMapElements();
    setMapZoomControlsOpen(!zoomControls?.classList.contains("is-open"));
  });
  zoomCloseButton?.addEventListener("click", event => {
    event.stopPropagation();
    setMapZoomControlsOpen(false);
  });
  zoomInButton?.addEventListener("click", () => zoomMapFromCenter(MAP_BUTTON_ZOOM_STEP));
  zoomOutButton?.addEventListener("click", () => zoomMapFromCenter(-MAP_BUTTON_ZOOM_STEP));
  window.addEventListener("resize", applyMapView);
  resetMapView();
}

export function bindEvents() {
  setupMapActionButtons();

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
    commitWorldInput();
  });

  state.elements.world.addEventListener("input", ui.renderWorldSuggestions);

  state.elements.world.addEventListener("compositionstart", () => {
    isComposingWorldInput = true;
  });

  state.elements.world.addEventListener("compositionend", () => {
    isComposingWorldInput = false;
  });

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

    commitWorldInput();
  });

  state.elements.world.addEventListener("keydown", event => {
    if (event.key !== "Enter" || event.isComposing || isComposingWorldInput) return;

    event.preventDefault();
    commitWorldInput();
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
  state.elements.editGuildNamesButton.addEventListener("click", ui.startGuildNameEditing);
  state.elements.confirmGuildNamesButton.addEventListener("click", ui.confirmGuildNameEditing);
  state.elements.cancelGuildNamesButton.addEventListener("click", ui.cancelGuildNameEditing);
  state.elements.tabAddButton.addEventListener("click", ui.addOccupationTab);
  state.elements.deleteTabButton.addEventListener("click", ui.deleteActiveOccupationTab);
  state.elements.resetDataButton.addEventListener("click", ui.resetAllData);
  window.addEventListener("resize", ui.updateTabScrollState);
  state.elements.mapUndoButton.addEventListener("click", () => {
    ui.undoOccupationChange();
  });
  state.elements.mapRedoButton.addEventListener("click", () => {
    ui.redoOccupationChange();
  });
  state.elements.mapScreenshotButton.addEventListener("click", () => {
    ui.exportCurrentMapPng();
  });
  state.elements.mapExportSaveButton.addEventListener("click", () => {
    ui.savePendingMapExport();
  });

  getAllPointSelects().forEach(select => {
    ["pointerdown", "pointerup", "mousedown", "mouseup", "click", "touchstart", "touchend"].forEach(eventName => {
      select.addEventListener(eventName, event => {
        event.stopPropagation();
      });
    });

    select.addEventListener("change", () => {
      const point = select.closest(".point");
      if (select.classList.contains("point-attacker-select")) {
        ui.updatePointDeclaration(point, select.value);
      } else {
        ui.setPointAura(point, select.value);
        ui.updatePointChip(point, select.value);
        ui.updateAttackerGuildOptions();
      }
      ui.updatePointSelfAttackState(point);
      ui.recordCurrentOccupationEdit();
      ui.saveSelectStates();
      ui.updateScores();
      ui.updateOccupationHistoryControls();
    });
  });

  // Debug only
  // if (import.meta.env.DEV) {
    window.debug = {
      undoOccupationChange: ui.undoOccupationChange,
      redoOccupationChange: ui.redoOccupationChange,
      canUndoOccupation: ui.canUndoOccupation,
      canRedoOccupation: ui.canRedoOccupation,
    };
  // }

  bindMapViewEvents();
}
