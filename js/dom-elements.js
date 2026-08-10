// DOM Elements
export const elements = {};

// Initialize DOM Elements
export function initializeElements() {
  elements.server = document.getElementById("server-select");
  elements.world = document.getElementById("world-input");
  elements.worldOptions = document.getElementById("world-options");
  elements.worldSuggestions = document.getElementById("world-suggestions");
  elements.battleClass = document.getElementById("class-select");
  elements.block = document.getElementById("block-select");
  elements.guildGrid = document.getElementById("guild-grid");
  elements.statusMessage = document.getElementById("status-message");
  elements.pendingMessage = document.getElementById("pending-message");
  elements.cumulativeScope = document.getElementById("cumulative-scope");
  elements.editGuildNamesButton = document.getElementById("edit-guild-names-button");
  elements.confirmGuildNamesButton = document.getElementById("confirm-guild-names-button");
  elements.cancelGuildNamesButton = document.getElementById("cancel-guild-names-button");
  elements.applyButton = document.getElementById("apply-data-button");
  elements.scoreBody = document.getElementById("score-body");
  elements.battlePoints = document.getElementById("battle-points");
  elements.mapUndoButton = document.getElementById("map-undo-button");
  elements.mapRedoButton = document.getElementById("map-redo-button");
  elements.mapScreenshotButton = document.getElementById("map-screenshot-button");
  elements.mapExportStatus = document.getElementById("map-export-status");
  elements.mapExportStatusMessage = document.getElementById("map-export-status-message");
  elements.mapExportSaveButton = document.getElementById("map-export-save-button");
  elements.occupationTabs = document.getElementById("occupation-tabs");
  elements.tabAddButton = document.getElementById("tab-add-button");
  elements.deleteTabButton = document.getElementById("delete-tab-button");
  elements.resetDataButton = document.getElementById("reset-data-button");
  elements.mobilePointPicker = document.getElementById("mobile-point-picker");
  elements.mobilePointPickerTitle = document.getElementById("mobile-point-picker-title");
  elements.mobilePointPickerOptions = document.getElementById("mobile-point-picker-options");
  elements.mobilePointPickerClose = document.getElementById("mobile-point-picker-close");
}
