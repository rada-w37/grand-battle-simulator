import {
  BATTLE_POINTS,
  MAP_BANNER_PLACEMENTS,
  MAP_STRUCTURE_PLACEMENTS,
  POINT_AURA_COORDINATES,
  getBannerTextOffset,
  getMapLayoutCssVars,
  resolveLayoutTarget
} from "../layout/layout-config.js?v=20260524-select-debug";
import { getLayoutViewport, renderedPxToBasePx } from "../layout/layout-coordinate.js?v=20260524-select-debug";

const EDITOR_CLASS = "dev-layout-editor-active";
const TARGET_SELECTOR = "[data-dev-layout-id]";
const EDITOR_UI_SELECTOR = ".dev-layout-toolbar, .dev-layout-layers-panel";
const LAYER_PANEL_POSITION_KEY = "devLayoutLayerPanelPosition";
const DRAG_THRESHOLD_PX = 4;
const EDITOR_HISTORY_LIMIT = 10;
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
const editorUndoStack = [];
const editorRedoStack = [];
const hiddenTargetIds = new Set();
const hiddenLayerKeys = new Set();
const layerGroupOpenStates = new Map();
let layersRootOpen = false;

function getViewportName() {
  return getLayoutViewport();
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function getMapInner() {
  return document.getElementById("map-inner");
}

function getMapImage() {
  return document.querySelector("#map-inner .map-image");
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
      x: vars["--map-point-select-left"],
      y: vars["--map-point-select-top"],
      width: vars["--map-point-select-width"],
      height: vars["--map-point-select-height"],
      minHeight: vars["--map-point-select-min-height"],
      fontSize: vars["--map-point-select-font-size"],
      parent: "point"
    };
  }
  if (role === "select") {
    return {
      x: vars["--map-point-select-left"],
      y: vars["--map-point-select-top"],
      width: vars["--map-point-select-width"],
      height: vars["--map-point-select-height"],
      minHeight: vars["--map-point-select-min-height"],
      fontSize: vars["--map-point-select-font-size"],
      parent: "point"
    };
  }
  return {};
}

function findPlacement(list, pointId) {
  return list.find(item => item.pointId === pointId);
}

function getConfigBefore(element) {
  const { devLayoutKey: layoutKey, devLayoutPointId: pointId, devLayoutRole: role = "" } = element.dataset;
  const viewport = getViewportName();

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
    if (role === "pointName" || role === "pointNameLabel") {
      const textOffset = placement ? getBannerTextOffset(placement, viewport) : null;
      return placement
        ? {
          textOffsets: {
            [viewport]: {
              x: textOffset.x,
              y: textOffset.y
            }
          },
          unit: "mapPxOffsetFromBanner",
          role
        }
        : {};
    }
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
      const mapPosition = getMapPxPosition(element);
      result.map = {
        x: mapPosition.x,
        y: mapPosition.y
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

function getTargetMeta(element) {
  return {
    targetId: element.dataset.devLayoutId,
    layoutKey: element.dataset.devLayoutKey,
    pointId: element.dataset.devLayoutPointId,
    targetType: element.dataset.devLayoutTargetType
  };
}

function getMoveSnapshot(element) {
  const after = getElementAfter(element);
  const x = after.localPx?.x ?? round(Number.parseFloat(after.x) || 0);
  const y = after.localPx?.y ?? round(Number.parseFloat(after.y) || 0);
  return {
    x,
    y,
    width: after.width,
    height: after.height
  };
}

function toCssPx(value) {
  return `${round(value)}px`;
}

function setEditablePosition(element, leftPx, topPx) {
  const parent = element.offsetParent;
  if (parent?.id === "map-inner" && parent.offsetWidth > 0 && parent.offsetHeight > 0) {
    element.style.left = `${round((leftPx / parent.offsetWidth) * 100)}%`;
    element.style.top = `${round((topPx / parent.offsetHeight) * 100)}%`;
    return;
  }

  element.style.left = `${round(leftPx)}px`;
  element.style.top = `${round(topPx)}px`;
}

const POINT_UI_OFFSET_OUTPUT = {
  pointLabels: {
    section: "pointLabels",
    properties: {
      x: "--map-point-labels-left",
      y: "--map-point-labels-top",
      width: "--map-point-labels-width",
      height: "--map-point-labels-height"
    }
  },
  sword: {
    section: "sword",
    properties: {
      x: "--map-sword-left",
      y: "--map-sword-top",
      size: "--map-sword-size"
    }
  },
  shield: {
    section: "shield",
    properties: {
      x: "--map-shield-left",
      y: "--map-shield-top",
      size: "--map-shield-size"
    }
  },
  select: {
    section: "select",
    properties: {
      x: "--map-point-select-left",
      y: "--map-point-select-top",
      width: "--map-point-select-width",
      height: "--map-point-select-height"
    }
  }
};

function getCssPxNumber(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function setNonZeroOffset(target, key, value) {
  const rounded = round(value);
  if (rounded !== 0) {
    target[key] = rounded;
  }
}

function getPointUiOffsetCurrent(targetType, snapshot) {
  const output = POINT_UI_OFFSET_OUTPUT[targetType];
  if (!output) return null;

  const baseVars = getMapLayoutCssVars();
  const currentValues = {
    x: snapshot.x,
    y: snapshot.y,
    width: snapshot.width,
    height: snapshot.height,
    size: snapshot.width
  };
  const offsetValues = {};

  Object.entries(output.properties).forEach(([property, variableName]) => {
    const baseValue = getCssPxNumber(baseVars[variableName]);
    if (baseValue === null) return;
    setNonZeroOffset(offsetValues, property, currentValues[property] - baseValue);
  });

  return {
    [output.section]: offsetValues
  };
}

function getSelectOffsetCurrent(element, snapshot) {
  const parent = element.offsetParent;
  if (!parent) return getPointUiOffsetCurrent("select", snapshot);

  const selectRect = element.querySelector("select")?.getBoundingClientRect();
  const centeredSnapshot = {
    ...snapshot,
    x: snapshot.x - parent.offsetWidth / 2,
    y: snapshot.y - parent.offsetHeight / 2,
    width: selectRect ? round(selectRect.width) : snapshot.width,
    height: selectRect ? round(selectRect.height) : snapshot.height
  };
  return getPointUiOffsetCurrent("select", centeredSnapshot);
}

function getParentPercentPosition(element) {
  const parent = element.offsetParent;
  if (!parent) return {};

  const position = getEditablePosition(element);
  return {
    left: round((position.left / parent.offsetWidth) * 100),
    top: round((position.top / parent.offsetHeight) * 100)
  };
}

function getMapPxPosition(element) {
  const mapImage = getMapImage();
  if (!mapImage) return {};

  const elementRect = element.getBoundingClientRect();
  const mapRect = mapImage.getBoundingClientRect();
  if (mapRect.width <= 0 || mapRect.height <= 0) return {};

  const displayX = elementRect.left + elementRect.width / 2 - mapRect.left;
  const displayY = elementRect.top + elementRect.height / 2 - mapRect.top;
  const { baseX, baseY } = renderedPxToBasePx(displayX, displayY, mapRect);
  return {
    x: round(baseX),
    y: round(baseY)
  };
}

function getWidthPercent(element) {
  const width = Number.parseFloat(element.style.width);
  if (Number.isFinite(width) && element.style.width.trim().endsWith("%")) {
    return round(width);
  }

  const parent = element.offsetParent;
  if (!parent) return null;
  return round((element.getBoundingClientRect().width / parent.getBoundingClientRect().width) * 100);
}

function getPointNameTextOffset(element) {
  const placement = findPlacement(MAP_BANNER_PLACEMENTS, element.dataset.devLayoutPointId);
  const position = getMapPxPosition(element);
  if (!placement) return position;

  return {
    textOffsets: {
      [getViewportName()]: {
        x: round(position.x - placement.x),
        y: round(position.y - placement.y)
      }
    }
  };
}

function getResolvedLayoutPayload(resolvedTarget) {
  const {
    resolved,
    skipReason,
    configKey,
    configPath,
    updateProperties,
    coordinateSpace,
    updateMode
  } = resolvedTarget;

  return {
    resolved,
    configKey,
    configPath,
    updateProperties,
    coordinateSpace,
    updateMode,
    ...(skipReason ? { skipReason } : {})
  };
}

function getConfigCurrent(element, resolvedTarget) {
  const targetType = element.dataset.devLayoutTargetType;
  const layoutKey = element.dataset.devLayoutKey;
  const snapshot = getMoveSnapshot(element);

  if (!resolvedTarget.resolved) {
    return snapshot;
  }

  if (layoutKey === "BATTLE_POINTS") {
    return getParentPercentPosition(element);
  }

  if (layoutKey === "POINT_AURA_COORDINATES") {
    return getMapPxPosition(element);
  }

  if (layoutKey === "MAP_STRUCTURE_PLACEMENTS" || targetType === "banner") {
    return {
      ...getMapPxPosition(element),
      scale: getWidthPercent(element)
    };
  }

  if (targetType === "pointName" || targetType === "pointNameLabel") {
    return getPointNameTextOffset(element);
  }

  if (targetType === "shield") {
    return getPointUiOffsetCurrent(targetType, snapshot);
  }

  if (targetType === "sword") {
    return getPointUiOffsetCurrent(targetType, snapshot);
  }

  if (targetType === "pointLabels") {
    return getPointUiOffsetCurrent(targetType, snapshot);
  }

  if (targetType === "attackerSelect" || targetType === "defenderSelect") {
    return getSelectOffsetCurrent(element, snapshot);
  }

  if (targetType === "select") {
    return getSelectOffsetCurrent(element, snapshot);
  }

  return snapshot;
}

function getMoveSnapshots(targets) {
  return new Map(
    targets
      .filter(isSelectableTarget)
      .map(target => [target.dataset.devLayoutId, getMoveSnapshot(target)])
  );
}

function isSameMoveSnapshot(before, after) {
  return before &&
    after &&
    before.x === after.x &&
    before.y === after.y &&
    before.width === after.width &&
    before.height === after.height;
}

function createMoveHistoryEntry(targets, beforeSnapshots) {
  const historyChanges = targets
    .filter(target => target?.matches?.(TARGET_SELECTOR))
    .map(target => {
      const before = beforeSnapshots.get(target.dataset.devLayoutId);
      const after = getMoveSnapshot(target);
      if (!before || isSameMoveSnapshot(before, after)) return null;

      return {
        ...getTargetMeta(target),
        before,
        after
      };
    })
    .filter(Boolean);

  return historyChanges.length ? { changes: historyChanges } : null;
}

function trimHistoryStack(stack) {
  while (stack.length > EDITOR_HISTORY_LIMIT) {
    stack.shift();
  }
}

function updateEditorHistoryControls() {
  if (!toolbar) return;

  const undoButton = toolbar.querySelector(".dev-layout-undo");
  const redoButton = toolbar.querySelector(".dev-layout-redo");
  if (undoButton) undoButton.disabled = editorUndoStack.length === 0;
  if (redoButton) redoButton.disabled = editorRedoStack.length === 0;
}

function pushEditorHistory(entry) {
  if (!entry?.changes?.length) return;

  editorUndoStack.push(entry);
  trimHistoryStack(editorUndoStack);
  editorRedoStack.length = 0;
  updateEditorHistoryControls();
}

function applyMoveSnapshot(element, snapshot) {
  setEditablePosition(element, snapshot.x, snapshot.y);
  rememberChange(element);
}

function applyEditorHistoryEntry(entry, snapshotKey) {
  entry.changes.forEach(change => {
    const target = document.querySelector(`[data-dev-layout-id="${CSS.escape(change.targetId)}"]`);
    if (!target) return;
    applyMoveSnapshot(target, change[snapshotKey]);
  });
  updateSelectionBox();
  updateHoverBox();
}

function undoDevLayoutMove() {
  const entry = editorUndoStack.pop();
  if (!entry) return;

  applyEditorHistoryEntry(entry, "before");
  editorRedoStack.push(entry);
  trimHistoryStack(editorRedoStack);
  updateEditorHistoryControls();
}

function redoDevLayoutMove() {
  const entry = editorRedoStack.pop();
  if (!entry) return;

  applyEditorHistoryEntry(entry, "after");
  editorUndoStack.push(entry);
  trimHistoryStack(editorUndoStack);
  updateEditorHistoryControls();
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
  selectionMode = "none";
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
  setEditablePosition(
    element,
    position.left + deltaX / parentScale,
    position.top + deltaY / parentScale
  );
  rememberChange(element);
}

function moveSelectedTargets(deltaX, deltaY) {
  selectedTargets.filter(isSelectableTarget).forEach(target => {
    moveElement(target, deltaX, deltaY);
  });
  updateSelectionBox();
}

function isTextEditingTarget(element) {
  return Boolean(element?.closest?.("input, textarea, select, [contenteditable='true']"));
}

function startDrag(event) {
  if (!isEditing) return;
  if (event.target.closest(EDITOR_UI_SELECTOR) || event.button !== 0) return;

  const target = getTargetFromEvent(event);
  event.stopPropagation();

  const dragTargets = target && selectedTargets.includes(target) ? [...selectedTargets] : (target ? [target] : []);

  activeDrag = {
    target,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    hasMoved: false,
    targets: dragTargets,
    startPositions: new Map(dragTargets.map(selectedTarget => [selectedTarget, getEditablePosition(selectedTarget)])),
    beforeSnapshots: getMoveSnapshots(dragTargets)
  };

  target?.setPointerCapture?.(event.pointerId);
}

function updateDrag(event) {
  if (!activeDrag || activeDrag.targets.length === 0) return;

  const deltaX = event.clientX - activeDrag.startX;
  const deltaY = event.clientY - activeDrag.startY;
  if (!activeDrag.hasMoved && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD_PX) return;

  if (!activeDrag.hasMoved) {
    activeDrag.hasMoved = true;
    if (activeDrag.target && !selectedTargets.includes(activeDrag.target)) {
      applySelectedTargets([activeDrag.target], "single", activeDrag.target);
    }
  }

  event.preventDefault();
  event.stopPropagation();

  activeDrag.targets.filter(isSelectableTarget).forEach(target => {
    const parentScale = getPointerScale(target);
    const startPosition = activeDrag.startPositions.get(target);
    setEditablePosition(
      target,
      startPosition.left + deltaX / parentScale,
      startPosition.top + deltaY / parentScale
    );
    rememberChange(target);
  });
  updateSelectionBox();
}

function endDrag(event) {
  if (!activeDrag) return;
  event.stopPropagation();
  activeDrag.target?.releasePointerCapture?.(activeDrag.pointerId);
  if (!activeDrag.hasMoved) {
    if (activeDrag.target) {
      selectElement(activeDrag.target);
    } else {
      clearSelectedTargets();
    }
  } else {
    pushEditorHistory(createMoveHistoryEntry(activeDrag.targets, activeDrag.beforeSnapshots));
  }
  activeDrag = null;
}

function handleKeydown(event) {
  const isCtrlLike = event.ctrlKey || event.metaKey;
  if (isCtrlLike && event.key.toLowerCase() === "z" && !isTextEditingTarget(event.target)) {
    event.preventDefault();
    if (event.shiftKey) {
      redoDevLayoutMove();
    } else {
      undoDevLayoutMove();
    }
    return;
  }
  if (isCtrlLike && event.key.toLowerCase() === "y" && !isTextEditingTarget(event.target)) {
    event.preventDefault();
    redoDevLayoutMove();
    return;
  }

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
  const moveTargets = selectedTargets.filter(isSelectableTarget);
  const beforeSnapshots = getMoveSnapshots(moveTargets);
  moveSelectedTargets(direction[0] * step, direction[1] * step);
  pushEditorHistory(createMoveHistoryEntry(moveTargets, beforeSnapshots));
}

async function copyChanges() {
  const currentChanges = Array.from(changes.keys())
    .map(targetId => document.querySelector(`[data-dev-layout-id="${CSS.escape(targetId)}"]`))
    .filter(Boolean)
    .map(target => {
      const viewport = getViewportName();
      const meta = getTargetMeta(target);
      const resolvedTarget = resolveLayoutTarget({ ...meta, viewport });

      return {
        viewport,
        ...meta,
        layoutTarget: getResolvedLayoutPayload(resolvedTarget),
        current: getConfigCurrent(target, resolvedTarget)
      };
    });
  const payload = JSON.stringify({
    changes: currentChanges
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
  toolbar.querySelector(".dev-layout-status").textContent = `${currentChanges.length}件コピーしました`;
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
    const isOpen = layerGroupOpenStates.get(layerKey) ?? true;
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
      <details class="dev-layout-layer-group" data-dev-layer-group="${layerKey}" ${isOpen ? "open" : ""}>
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
    <details class="dev-layout-layers-root" ${layersRootOpen ? "open" : ""}>
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

function rememberLayerOpenStates() {
  if (!layersPanel) return;

  const root = layersPanel.querySelector(".dev-layout-layers-root");
  if (root) {
    layersRootOpen = root.open;
  }

  layersPanel.querySelectorAll(".dev-layout-layer-group").forEach(group => {
    layerGroupOpenStates.set(group.dataset.devLayerGroup, group.open);
  });
}

function restoreLayerPanelPosition() {
  layerPanelPosition = localStorage.getItem(LAYER_PANEL_POSITION_KEY) === "left" ? "left" : "right";
}

function toggleLayerPanelPosition() {
  rememberLayerOpenStates();
  layerPanelPosition = layerPanelPosition === "right" ? "left" : "right";
  localStorage.setItem(LAYER_PANEL_POSITION_KEY, layerPanelPosition);
  renderLayersPanel();
}

function handleLayerPanelChange(event) {
  rememberLayerOpenStates();
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
  if (event.target.closest(".dev-layout-layer-position-button")) {
    event.preventDefault();
    toggleLayerPanelPosition();
    return;
  }

  const rootSummary = event.target.closest(".dev-layout-layers-root > summary");
  if (rootSummary) {
    window.setTimeout(rememberLayerOpenStates, 0);
    return;
  }

  const groupSummary = event.target.closest(".dev-layout-layer-group > summary");
  if (groupSummary) {
    window.setTimeout(rememberLayerOpenStates, 0);
  }
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
      padding: 0 8px 8px;
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
      position: sticky;
      top: 0;
      z-index: 1;
      margin-inline: -8px;
      padding: 8px;
      background: rgba(8, 14, 24, 0.96);
      border-bottom: 1px solid rgba(70, 112, 170, 0.24);
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
    @media (max-width: 720px) {
      .dev-layout-layers-panel {
        max-height: 50vh;
      }
    }
    .dev-layout-toolbar button {
      min-height: 28px;
      border: 1px solid rgba(70, 112, 170, 0.85);
      border-radius: 4px;
      background: rgba(21, 37, 58, 0.95);
      color: inherit;
      cursor: pointer;
    }
    .dev-layout-toolbar button:disabled {
      cursor: not-allowed;
      opacity: 0.42;
    }
    .dev-layout-undo,
    .dev-layout-redo {
      min-width: 30px;
      padding-inline: 8px;
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
      border: 2px solid #153a75;
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
    <button type="button" class="dev-layout-undo" aria-label="Dev Layoutの移動をUndo" title="Dev Layoutの移動をUndo">Undo</button>
    <button type="button" class="dev-layout-redo" aria-label="Dev Layoutの移動をRedo" title="Dev Layoutの移動をRedo">Redo</button>
    <button type="button" class="dev-layout-copy">Copy JSON</button>
    <span class="dev-layout-status">devLayout=1</span>
  `;
  document.body.appendChild(toolbar);

  toolbar.querySelector(".dev-layout-toggle").addEventListener("click", () => setEditing(!isEditing));
  toolbar.querySelector(".dev-layout-undo").addEventListener("click", undoDevLayoutMove);
  toolbar.querySelector(".dev-layout-redo").addEventListener("click", redoDevLayoutMove);
  toolbar.querySelector(".dev-layout-copy").addEventListener("click", copyChanges);
  updateEditorHistoryControls();
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
