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

let isEditing = false;
let selectedElement = null;
let selectionMode = "single";
let selectedTargets = [];
let hoverTarget = null;
let selectionBox = null;
let hoverBox = null;
let toolbar = null;
let activeDrag = null;

const changes = new Map();

function getViewportName() {
  return window.innerWidth <= MAP_LAYOUT_BREAKPOINT ? "mobile" : "desktop";
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function getMapInner() {
  return document.getElementById("map-inner");
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
  positionOverlay(selectionBox, selectedElement);
}

function updateHoverBox() {
  positionOverlay(hoverBox, hoverTarget);
}

function clearSelectedTargets() {
  selectedTargets.forEach(target => target.classList.remove("dev-layout-selected"));
  selectedTargets = [];
  selectedElement = null;
}

function selectElement(element) {
  clearSelectedTargets();
  selectionMode = "single";
  selectedTargets = [element];
  selectedElement = element;
  selectedElement.classList.add("dev-layout-selected");
  if (hoverTarget === element) {
    hoverTarget = null;
    updateHoverBox();
  }
  updateSelectionBox();
}

function getTargetFromEvent(event) {
  return event.target.closest(TARGET_SELECTOR);
}

function updateHoverTarget(event) {
  if (!isEditing || activeDrag) return;

  const target = getTargetFromEvent(event);
  hoverTarget = target && !selectedTargets.includes(target) ? target : null;
  updateHoverBox();
}

function clearHoverTarget(event) {
  if (!hoverTarget) return;

  const nextTarget = event.relatedTarget?.closest?.(TARGET_SELECTOR);
  if (nextTarget === hoverTarget) return;

  hoverTarget = null;
  updateHoverBox();
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
    element: target,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startPosition: getEditablePosition(target)
  };

  target.setPointerCapture?.(event.pointerId);
}

function updateDrag(event) {
  if (!activeDrag) return;

  event.preventDefault();
  event.stopPropagation();

  const parentScale = getPointerScale(activeDrag.element);
  activeDrag.element.style.left = `${activeDrag.startPosition.left + (event.clientX - activeDrag.startX) / parentScale}px`;
  activeDrag.element.style.top = `${activeDrag.startPosition.top + (event.clientY - activeDrag.startY) / parentScale}px`;
  rememberChange(activeDrag.element);
  updateSelectionBox();
}

function endDrag(event) {
  if (!activeDrag) return;
  event.stopPropagation();
  activeDrag.element.releasePointerCapture?.(activeDrag.pointerId);
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
  moveElement(selectedElement, direction[0] * step, direction[1] * step);
}

async function copyChanges() {
  const payload = JSON.stringify({
    selectionMode,
    selectedTargets: selectedTargets.map(target => ({
      targetId: target.dataset.devLayoutId,
      layoutKey: target.dataset.devLayoutKey,
      pointId: target.dataset.devLayoutPointId,
      targetType: target.dataset.devLayoutTargetType
    })),
    changes: Array.from(changes.values())
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
    .dev-layout-selection-overlay,
    .dev-layout-hover-overlay {
      position: fixed;
      z-index: 9999;
      display: none;
      pointer-events: none;
    }
    .dev-layout-selection-overlay {
      border: 1px solid #153a75;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.18);
    }
    .dev-layout-hover-overlay {
      border: 1px solid rgba(45, 120, 255, 0.45);
      background: rgba(45, 120, 255, 0.16);
    }
    body.dev-layout-editor-active .dev-layout-selection-overlay,
    body.dev-layout-editor-active .dev-layout-hover-overlay {
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

function createSelectionBox() {
  selectionBox = document.createElement("div");
  selectionBox.className = "dev-layout-selection-overlay";
  selectionBox.hidden = true;
  document.body.appendChild(selectionBox);

  hoverBox = document.createElement("div");
  hoverBox.className = "dev-layout-hover-overlay";
  hoverBox.hidden = true;
  document.body.appendChild(hoverBox);
}

export function initDevLayoutEditor() {
  if (document.body.dataset.devLayoutEditorReady === "true") return;
  document.body.dataset.devLayoutEditorReady = "true";

  injectStyles();
  createToolbar();
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
