import {
  BATTLE_POINTS,
  MAP_BANNER_PLACEMENTS,
  MAP_IMAGE_SIZE,
  MAP_LAYOUT_BREAKPOINT,
  MAP_STRUCTURE_PLACEMENTS,
  POINT_AURA_COORDINATES,
  getMapLayoutCssVars
} from "./layout-config.js";

const EDITOR_CLASS = "dev-layout-editor-active";
const TARGET_SELECTOR = "[data-dev-layout-id]";
const EDITOR_UI_SELECTOR = ".dev-layout-toolbar, .dev-layout-layers-panel";
const LAYER_PANEL_POSITION_KEY = "devLayoutLayerPanelPosition";
const TARGET_TYPE_PRIORITY = {
  attackerSelect: 1,
  defenderSelect: 1,
  select: 1,
  sword: 2,
  shield: 2,
  swordMarker: 2,
  shieldMarker: 2,
  pointName: 3,
  pointNameLabel: 3,
  banner: 4,
  pointBanner: 4,
  structure: 5,
  pointStructure: 5,
  aura: 6,
  pointAura: 6,
  pointLabels: 7,
  point: 8
};

let isEditing = false;
let selectedElement = null;
let selectionMode = "single";
let selectedTargets = [];
let hoverTarget = null;
let selectionLayer = null;
let hoverBox = null;
let toolbar = null;
let layersPanel = null;
let layerPanelPosition = "right";
let activeDrag = null;

const changes = new Map();
const hiddenTargetIds = new Set();
const hiddenLayerKeys = new Set();

function getViewportName() {
  return window.innerWidth <= MAP_LAYOUT_BREAKPOINT ? "mobile" : "desktop";
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function getMapInner() {
  return document.getElementById("map-inner");
}

function getDevLayoutTargets() {
  return Array.from(document.querySelectorAll(TARGET_SELECTOR));
}

function getLayerKey(element) {
  const zIndex = window.getComputedStyle(element).zIndex;
  return zIndex === "auto" ? "z-auto" : `z${zIndex}`;
}

function isLayerHidden(element) {
  return hiddenLayerKeys.has(getLayerKey(element));
}

function isTargetHidden(element) {
  return hiddenTargetIds.has(element.dataset.devLayoutId) || isLayerHidden(element);
}

function isSelectableTarget(element) {
  if (!element?.matches?.(TARGET_SELECTOR) || isTargetHidden(element)) return false;

  const style = window.getComputedStyle(element);
  return style.visibility !== "hidden";
}

function getTargetPriority(element) {
  return TARGET_TYPE_PRIORITY[element.dataset.devLayoutRole] ??
    TARGET_TYPE_PRIORITY[element.dataset.devLayoutTargetType] ??
    99;
}

function getTargetArea(element) {
  const rect = element.getBoundingClientRect();
  return rect.width * rect.height;
}

function isPointInsideRect(clientX, clientY, element) {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 &&
    rect.height > 0 &&
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom;
}

function getVisibleTargetFromPoint(clientX, clientY) {
  const elementStackTargets = document.elementsFromPoint(clientX, clientY)
    .flatMap(element => {
      const target = element.closest?.(TARGET_SELECTOR);
      return target ? [target] : [];
    });
  const rectHitTargets = getDevLayoutTargets()
    .filter(element => isPointInsideRect(clientX, clientY, element));
  const candidates = [...elementStackTargets, ...rectHitTargets]
    .filter((target, index, list) => list.indexOf(target) === index)
    .filter(isSelectableTarget)
    .sort((a, b) => {
      const priorityDiff = getTargetPriority(a) - getTargetPriority(b);
      return priorityDiff || getTargetArea(a) - getTargetArea(b);
    });

  return candidates[0] || null;
}

function getVisibleTargetFromEvent(event) {
  if (event.target.closest(EDITOR_UI_SELECTOR)) return null;
  return getVisibleTargetFromPoint(event.clientX, event.clientY);
}

function getElementScale(element) {
  const style = window.getComputedStyle(element);
  const matrix = new DOMMatrixReadOnly(style.transform === "none" ? undefined : style.transform);
  return matrix.a || 1;
}

function getMapScale() {
  const inner = getMapInner();
  return inner ? getElementScale(inner) : 1;
}

function getPointerScale(element) {
  const inner = getMapInner();
  const offsetScale = getElementScale(element.offsetParent) || 1;
  if (!inner || !inner.contains(element)) return offsetScale;
  if (element.offsetParent === inner) return offsetScale;
  return getMapScale() * offsetScale;
}

function getCssVarBefore(role) {
  const vars = getMapLayoutCssVars();
  if (role === "pointLabels") {
    return {
      x: vars["--map-point-labels-left"],
      y: vars["--map-point-labels-top"],
      width: vars["--map-point-labels-width"],
      height: vars["--map-point-band-height"],
      gap: vars["--map-point-labels-gap"]
    };
  }
  if (role === "shield") {
    return {
      x: vars["--map-shield-left"],
      y: vars["--map-shield-top"],
      width: vars["--map-shield-size"],
      height: vars["--map-shield-size"]
    };
  }
  if (role === "sword") {
    return {
      x: vars["--map-sword-left"],
      y: vars["--map-sword-top"],
      width: vars["--map-sword-size"],
      height: vars["--map-sword-size"]
    };
  }
  if (role === "attackerSelect" || role === "defenderSelect") {
    return {
      width: vars["--map-point-labels-width"],
      height: vars["--map-point-select-height"],
      minHeight: vars["--map-point-select-min-height"],
      fontSize: vars["--map-point-select-font-size"],
      parent: "pointLabels"
    };
  }
  return {};
}

function findPlacement(list, pointId) {
  return list.find(item => item.pointId === pointId);
}

function getConfigBefore(element) {
  const { devLayoutKey: layoutKey, devLayoutPointId: pointId, devLayoutRole: role = "" } = element.dataset;

  if (layoutKey === "BATTLE_POINTS") {
    const point = BATTLE_POINTS.find(item => item.id === pointId);
    return point ? { x: point.left, y: point.top, width: null, height: null, unit: "%" } : {};
  }
  if (layoutKey === "POINT_AURA_COORDINATES") {
    const point = POINT_AURA_COORDINATES[pointId];
    return point ? { x: point.x, y: point.y } : {};
  }
  if (layoutKey === "MAP_STRUCTURE_PLACEMENTS") {
    const placement = findPlacement(MAP_STRUCTURE_PLACEMENTS, pointId);
    return placement ? { x: placement.x, y: placement.y, width: placement.scale, height: null, unit: "mapPx/%scale" } : {};
  }
  if (layoutKey === "MAP_BANNER_PLACEMENTS") {
    const placement = findPlacement(MAP_BANNER_PLACEMENTS, pointId);
    return placement ? { x: placement.x, y: placement.y, width: placement.scale, height: null, unit: "mapPx/%scale", role } : {};
  }
  if (layoutKey === "MAP_LAYOUT_CSS_VARS") {
    return getCssVarBefore(role);
  }
  return {};
}

function getElementAfter(element) {
  const parent = element.offsetParent;
  const rect = element.getBoundingClientRect();
  const parentRect = parent?.getBoundingClientRect();
  const computed = window.getComputedStyle(element);
  const result = {
    x: computed.left,
    y: computed.top,
    width: round(rect.width),
    height: round(rect.height)
  };

  if (parent && parentRect) {
    const parentScale = getPointerScale(element);
    const leftPx = Number.parseFloat(computed.left) || 0;
    const topPx = Number.parseFloat(computed.top) || 0;
    result.localPx = {
      x: round(leftPx),
      y: round(topPx)
    };

    if (parent.id === "map-inner") {
      result.map = {
        x: round((leftPx / parent.offsetWidth) * MAP_IMAGE_SIZE.width),
        y: round((topPx / parent.offsetHeight) * MAP_IMAGE_SIZE.height)
      };
    } else {
      result.parentPercent = {
        x: round((leftPx / parent.offsetWidth) * 100),
        y: round((topPx / parent.offsetHeight) * 100)
      };
    }

    result.screenDeltaCompensation = {
      parentScale: round(parentScale)
    };
  }

  return result;
}

function getChangePayload(element) {
  return {
    targetId: element.dataset.devLayoutId,
    layoutKey: element.dataset.devLayoutKey,
    pointId: element.dataset.devLayoutPointId,
    targetType: element.dataset.devLayoutTargetType,
    viewport: getViewportName(),
    before: getConfigBefore(element),
    after: getElementAfter(element)
  };
}

function rememberChange(element) {
  const targetId = element.dataset.devLayoutId;
  const existing = changes.get(targetId);
  changes.set(targetId, {
    ...(existing || getChangePayload(element)),
    after: getElementAfter(element)
  });
}

function positionOverlay(overlay, element) {
  if (!overlay || !element) {
    if (overlay) overlay.hidden = true;
    return;
  }

  const rect = element.getBoundingClientRect();
  overlay.hidden = false;
  overlay.style.left = `${rect.left}px`;
  overlay.style.top = `${rect.top}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
}

function updateSelectionBox() {
  if (!selectionLayer) return;

  selectionLayer.replaceChildren();
  selectedTargets.forEach(target => {
    const overlay = document.createElement("div");
    overlay.className = `dev-layout-selection-overlay dev-layout-selection-overlay-${selectionMode}`;
    selectionLayer.appendChild(overlay);
    positionOverlay(overlay, target);
  });
}

function updateHoverBox() {
  positionOverlay(hoverBox, hoverTarget);
}

function showHoverOverlay(target) {
  hoverTarget = target && !selectedTargets.includes(target) && !isTargetHidden(target) ? target : null;
  updateHoverBox();
}

function hideHoverOverlay() {
  hoverTarget = null;
  updateHoverBox();
}

function clearSelectedTargets() {
  selectedTargets.forEach(target => target.classList.remove("dev-layout-selected"));
  selectedTargets = [];
  selectedElement = null;
  updateSelectionBox();
}

function getVisibleTargetsByType(targetType) {
  return getDevLayoutTargets()
    .filter(target => target.dataset.devLayoutTargetType === targetType)
    .filter(isSelectableTarget);
}

function applySelectedTargets(targets, mode, primaryTarget = targets[0]) {
  clearSelectedTargets();
  selectionMode = mode;
  selectedTargets = targets;
  selectedElement = primaryTarget || targets[0] || null;
  selectedTargets.forEach(target => target.classList.add("dev-layout-selected"));
  if (hoverTarget && selectedTargets.includes(hoverTarget)) {
    hideHoverOverlay();
  }
  updateSelectionBox();
}

function selectElement(element) {
  const isGroupMemberClick = selectionMode === "group" && selectedTargets.includes(element);
  if (isGroupMemberClick) {
    applySelectedTargets([element], "single", element);
    return;
  }

  const targetType = element.dataset.devLayoutTargetType;
  const groupTargets = targetType ? getVisibleTargetsByType(targetType) : [element];
  applySelectedTargets(groupTargets.length ? groupTargets : [element], "group", element);
}

function getTargetFromEvent(event) {
  return getVisibleTargetFromEvent(event);
}

function updateHoverTarget(event) {
  if (!isEditing || activeDrag) return;
  if (event.target.closest(EDITOR_UI_SELECTOR)) {
    hideHoverOverlay();
    return;
  }

  const target = getTargetFromEvent(event);
  showHoverOverlay(target);
}

function clearHoverTarget(event) {
  if (!hoverTarget) return;

  const nextTarget = event.relatedTarget?.closest?.(TARGET_SELECTOR);
  if (nextTarget === hoverTarget) return;

  hideHoverOverlay();
}

function getEditablePosition(element) {
  const computed = window.getComputedStyle(element);
  return {
    left: Number.parseFloat(computed.left) || 0,
    top: Number.parseFloat(computed.top) || 0
  };
}

function moveElement(element, deltaX, deltaY) {
  const parentScale = getPointerScale(element);
  const position = getEditablePosition(element);
  element.style.left = `${position.left + deltaX / parentScale}px`;
  element.style.top = `${position.top + deltaY / parentScale}px`;
  rememberChange(element);
}

function moveSelectedTargets(deltaX, deltaY) {
  selectedTargets.filter(isSelectableTarget).forEach(target => {
    moveElement(target, deltaX, deltaY);
  });
  updateSelectionBox();
}

function startDrag(event) {
  if (!isEditing) return;

  const target = getTargetFromEvent(event);
  if (!target || event.button !== 0) return;

  event.preventDefault();
  event.stopPropagation();
  selectElement(target);

  activeDrag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    targets: [...selectedTargets],
    startPositions: new Map(selectedTargets.map(selectedTarget => [selectedTarget, getEditablePosition(selectedTarget)]))
  };

  target.setPointerCapture?.(event.pointerId);
}

function updateDrag(event) {
  if (!activeDrag) return;

  event.preventDefault();
  event.stopPropagation();

  activeDrag.targets.filter(isSelectableTarget).forEach(target => {
    const parentScale = getPointerScale(target);
    const startPosition = activeDrag.startPositions.get(target);
    target.style.left = `${startPosition.left + (event.clientX - activeDrag.startX) / parentScale}px`;
    target.style.top = `${startPosition.top + (event.clientY - activeDrag.startY) / parentScale}px`;
    rememberChange(target);
  });
  updateSelectionBox();
}

function endDrag(event) {
  if (!activeDrag) return;
  event.stopPropagation();
  selectedElement?.releasePointerCapture?.(activeDrag.pointerId);
  activeDrag = null;
}

function handleKeydown(event) {
  if (!isEditing || !selectedElement) return;
  const direction = {
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0]
  }[event.key];
  if (!direction) return;

  event.preventDefault();
  const step = event.shiftKey ? 10 : 1;
  moveSelectedTargets(direction[0] * step, direction[1] * step);
}

async function copyChanges() {
  const visibleChanges = Array.from(changes.values()).filter(change => {
    const target = document.querySelector(`[data-dev-layout-id="${CSS.escape(change.targetId)}"]`);
    return target && !isTargetHidden(target);
  });
  const payload = JSON.stringify({
    selectionMode,
    selectedTargets: selectedTargets
      .filter(target => !isTargetHidden(target))
      .map(target => ({
        targetId: target.dataset.devLayoutId,
        layoutKey: target.dataset.devLayoutKey,
        pointId: target.dataset.devLayoutPointId,
        targetType: target.dataset.devLayoutTargetType
      })),
    changes: visibleChanges
  }, null, 2);
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
    await navigator.clipboard.writeText(payload);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = payload;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
  toolbar.querySelector(".dev-layout-status").textContent = `${changes.size}件コピーしました`;
}

function setEditing(nextValue) {
  isEditing = nextValue;
  document.body.classList.toggle(EDITOR_CLASS, isEditing);
  toolbar.querySelector(".dev-layout-toggle").textContent = isEditing ? "Layout Edit: ON" : "Layout Edit";
  if (!isEditing) {
    clearSelectedTargets();
    hoverTarget = null;
    activeDrag = null;
    updateSelectionBox();
    updateHoverBox();
  }
}

function applyLayerVisibility() {
  getDevLayoutTargets().forEach(element => {
    const isHidden = isTargetHidden(element);
    element.style.visibility = isHidden ? "hidden" : "";
    element.style.pointerEvents = isHidden ? "none" : "";
    element.dataset.devLayoutHidden = String(isHidden);
  });

  const hiddenSelectedTargets = selectedTargets.filter(isTargetHidden);
  if (hiddenSelectedTargets.length > 0) {
    hiddenSelectedTargets.forEach(target => target.classList.remove("dev-layout-selected"));
    selectedTargets = selectedTargets.filter(target => !isTargetHidden(target));
    selectedElement = selectedTargets[0] || null;
    if (selectedTargets.length === 0) {
      clearSelectedTargets();
    } else {
      updateSelectionBox();
    }
  }
  if (hoverTarget && isTargetHidden(hoverTarget)) {
    hoverTarget = null;
    updateHoverBox();
  }
}

function getLayerGroups() {
  const groups = new Map();
  getDevLayoutTargets().forEach(element => {
    const layerKey = getLayerKey(element);
    if (!groups.has(layerKey)) groups.set(layerKey, []);
    groups.get(layerKey).push(element);
  });

  return Array.from(groups.entries())
    .sort(([a], [b]) => {
      const aValue = a === "z-auto" ? Number.NEGATIVE_INFINITY : Number(a.slice(1));
      const bValue = b === "z-auto" ? Number.NEGATIVE_INFINITY : Number(b.slice(1));
      return bValue - aValue;
    });
}

function getLayerLabelText(element) {
  const { devLayoutId, devLayoutTargetType, devLayoutPointId } = element.dataset;
  return `${devLayoutId} | ${devLayoutTargetType || "-"}${devLayoutPointId ? ` | ${devLayoutPointId}` : ""}`;
}

function renderLayersPanel() {
  if (!layersPanel) return;

  layersPanel.dataset.position = layerPanelPosition;
  const details = getLayerGroups().map(([layerKey, elements]) => {
    const layerChecked = !hiddenLayerKeys.has(layerKey);
    const items = elements.map(element => {
      const targetId = element.dataset.devLayoutId;
      const checked = !hiddenTargetIds.has(targetId) && layerChecked;
      return `
        <label class="dev-layout-layer-item" data-dev-layer-target-id="${targetId}">
          <input type="checkbox" data-dev-layer-target="${targetId}" ${checked ? "checked" : ""}>
          <span>${getLayerLabelText(element)}</span>
        </label>
      `;
    }).join("");

    return `
      <details class="dev-layout-layer-group" open>
        <summary>
          <label>
            <input type="checkbox" data-dev-layer-key="${layerKey}" ${layerChecked ? "checked" : ""}>
            <span>${layerKey}</span>
          </label>
        </summary>
        <div class="dev-layout-layer-items">${items}</div>
      </details>
    `;
  }).join("");

  layersPanel.innerHTML = `
    <details class="dev-layout-layers-root" open>
      <summary>
        <span>Layers</span>
        <button type="button" class="dev-layout-layer-position-button" aria-label="Layer Panelの左右位置を切り替え" title="Layer Panelの左右位置を切り替え">
          ${layerPanelPosition === "right" ? "←" : "→"}
        </button>
      </summary>
      <div class="dev-layout-layers-content">${details}</div>
    </details>
  `;
}

function restoreLayerPanelPosition() {
  layerPanelPosition = localStorage.getItem(LAYER_PANEL_POSITION_KEY) === "left" ? "left" : "right";
}

function toggleLayerPanelPosition() {
  layerPanelPosition = layerPanelPosition === "right" ? "left" : "right";
  localStorage.setItem(LAYER_PANEL_POSITION_KEY, layerPanelPosition);
  renderLayersPanel();
}

function handleLayerPanelChange(event) {
  const layerInput = event.target.closest("[data-dev-layer-key]");
  if (layerInput) {
    const layerKey = layerInput.dataset.devLayerKey;
    if (layerInput.checked) {
      hiddenLayerKeys.delete(layerKey);
    } else {
      hiddenLayerKeys.add(layerKey);
    }
    applyLayerVisibility();
    renderLayersPanel();
    return;
  }

  const targetInput = event.target.closest("[data-dev-layer-target]");
  if (!targetInput) return;

  const targetId = targetInput.dataset.devLayerTarget;
  if (targetInput.checked) {
    hiddenTargetIds.delete(targetId);
  } else {
    hiddenTargetIds.add(targetId);
  }
  applyLayerVisibility();
  renderLayersPanel();
}

function handleLayerPanelClick(event) {
  if (!event.target.closest(".dev-layout-layer-position-button")) return;

  event.preventDefault();
  toggleLayerPanelPosition();
}

function handleLayerPanelPointerOver(event) {
  const row = event.target.closest("[data-dev-layer-target-id]");
  if (!row) return;

  const target = document.querySelector(`[data-dev-layout-id="${CSS.escape(row.dataset.devLayerTargetId)}"]`);
  showHoverOverlay(target);
}

function handleLayerPanelPointerOut(event) {
  const row = event.target.closest("[data-dev-layer-target-id]");
  if (!row) return;
  const nextRow = event.relatedTarget?.closest?.("[data-dev-layer-target-id]");
  if (nextRow === row) return;

  hideHoverOverlay();
}

function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .dev-layout-toolbar {
      position: fixed;
      right: 12px;
      bottom: 12px;
      z-index: 10000;
      display: flex;
      gap: 6px;
      align-items: center;
      padding: 6px;
      border: 1px solid rgba(29, 63, 108, 0.9);
      border-radius: 6px;
      background: rgba(8, 14, 24, 0.88);
      color: #d8e7ff;
      font: 12px/1.2 system-ui, sans-serif;
    }
    .dev-layout-layers-panel {
      position: fixed;
      top: 12px;
      z-index: 10000;
      width: min(360px, calc(100vw - 24px));
      max-height: min(460px, calc(100vh - 96px));
      overflow: auto;
      padding: 8px;
      border: 1px solid rgba(29, 63, 108, 0.9);
      border-radius: 6px;
      background: rgba(8, 14, 24, 0.9);
      color: #d8e7ff;
      font: 12px/1.3 system-ui, sans-serif;
    }
    .dev-layout-layers-panel[data-position="right"] {
      right: 12px;
      left: auto;
    }
    .dev-layout-layers-panel[data-position="left"] {
      left: 12px;
      right: auto;
    }
    .dev-layout-layers-panel[hidden] {
      display: none !important;
    }
    .dev-layout-layers-root > summary,
    .dev-layout-layer-group > summary {
      cursor: pointer;
      user-select: none;
    }
    .dev-layout-layers-root > summary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .dev-layout-layer-position-button {
      min-width: 28px;
      min-height: 24px;
      border: 1px solid rgba(70, 112, 170, 0.75);
      border-radius: 4px;
      background: rgba(21, 37, 58, 0.85);
      color: inherit;
      cursor: pointer;
    }
    .dev-layout-layer-group {
      margin-top: 6px;
      border-top: 1px solid rgba(70, 112, 170, 0.24);
      padding-top: 5px;
    }
    .dev-layout-layer-group summary label,
    .dev-layout-layer-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .dev-layout-layer-items {
      display: grid;
      gap: 3px;
      margin-top: 4px;
      padding-left: 14px;
    }
    .dev-layout-layer-item span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .dev-layout-toolbar button {
      min-height: 28px;
      border: 1px solid rgba(70, 112, 170, 0.85);
      border-radius: 4px;
      background: rgba(21, 37, 58, 0.95);
      color: inherit;
      cursor: pointer;
    }
    .dev-layout-status {
      min-width: 78px;
      color: rgba(216, 231, 255, 0.78);
      white-space: nowrap;
    }
    .dev-layout-selection-layer,
    .dev-layout-selection-overlay,
    .dev-layout-hover-overlay {
      position: fixed;
      z-index: 9999;
      pointer-events: none;
    }
    .dev-layout-selection-layer,
    .dev-layout-selection-overlay {
      display: none;
    }
    .dev-layout-selection-layer {
      inset: 0;
    }
    .dev-layout-selection-overlay {
      position: fixed;
      border: 1px solid #153a75;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.18);
    }
    .dev-layout-selection-overlay-group {
      border-color: rgba(45, 120, 255, 0.62);
      box-shadow: none;
    }
    .dev-layout-selection-overlay-single {
      border-color: #153a75;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.18);
    }
    .dev-layout-hover-overlay {
      border: 1px solid rgba(45, 120, 255, 0.45);
      background: rgba(45, 120, 255, 0.16);
    }
    .dev-layout-hover-overlay {
      display: block;
    }
    body.dev-layout-editor-active .dev-layout-selection-overlay,
    body.dev-layout-editor-active .dev-layout-selection-layer {
      display: block;
    }
    .dev-layout-selection-overlay[hidden],
    .dev-layout-hover-overlay[hidden] {
      display: none !important;
    }
    body.dev-layout-editor-active ${TARGET_SELECTOR} {
      cursor: move;
    }
  `;
  document.head.appendChild(style);
}

function createToolbar() {
  toolbar = document.createElement("div");
  toolbar.className = "dev-layout-toolbar";
  toolbar.innerHTML = `
    <button type="button" class="dev-layout-toggle">Layout Edit</button>
    <button type="button" class="dev-layout-copy">Copy JSON</button>
    <span class="dev-layout-status">devLayout=1</span>
  `;
  document.body.appendChild(toolbar);

  toolbar.querySelector(".dev-layout-toggle").addEventListener("click", () => setEditing(!isEditing));
  toolbar.querySelector(".dev-layout-copy").addEventListener("click", copyChanges);
}

function createLayersPanel() {
  layersPanel = document.createElement("div");
  layersPanel.className = "dev-layout-layers-panel";
  ["pointerdown", "mousedown", "click", "touchstart", "touchend"].forEach(eventName => {
    layersPanel.addEventListener(eventName, event => {
      event.stopPropagation();
    });
  });
  layersPanel.addEventListener("click", handleLayerPanelClick);
  layersPanel.addEventListener("pointerover", handleLayerPanelPointerOver);
  layersPanel.addEventListener("pointerout", handleLayerPanelPointerOut);
  layersPanel.addEventListener("change", handleLayerPanelChange);
  document.body.appendChild(layersPanel);
  renderLayersPanel();
}

function createSelectionBox() {
  selectionLayer = document.createElement("div");
  selectionLayer.className = "dev-layout-selection-layer";
  document.body.appendChild(selectionLayer);

  hoverBox = document.createElement("div");
  hoverBox.className = "dev-layout-hover-overlay";
  hoverBox.hidden = true;
  document.body.appendChild(hoverBox);
}

export function initDevLayoutEditor() {
  if (document.body.dataset.devLayoutEditorReady === "true") return;
  document.body.dataset.devLayoutEditorReady = "true";

  restoreLayerPanelPosition();
  injectStyles();
  createToolbar();
  createLayersPanel();
  createSelectionBox();

  document.addEventListener("pointerdown", startDrag, true);
  document.addEventListener("pointermove", updateDrag, true);
  document.addEventListener("pointerup", endDrag, true);
  document.addEventListener("pointerover", updateHoverTarget, true);
  document.addEventListener("pointerout", clearHoverTarget, true);
  document.addEventListener("keydown", handleKeydown);
  window.addEventListener("scroll", () => {
    updateSelectionBox();
    updateHoverBox();
  }, true);
  window.addEventListener("resize", () => {
    updateSelectionBox();
    updateHoverBox();
  });
}
