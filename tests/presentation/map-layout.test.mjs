import test from "node:test";
import assert from "node:assert/strict";

import { BATTLE_POINTS } from "../../js/layout/base.js";
import {
  MAP_BANNER_PLACEMENTS,
  MAP_LABEL_LAYOUT,
  getBannerTextOffset
} from "../../js/layout/decorations.js";
import { MAP_POINT_UI_OFFSETS, getMapPointUiOffsets } from "../../js/layout/point-offsets.js";
import { applyPointUiOffsets } from "../../js/layout/point-ui-layout.js";
import { MAP_LAYOUT_CSS_VARS } from "../../js/layout/viewport.js";

function createStyleDeclaration() {
  const values = new Map();

  return {
    getPropertyValue(name) {
      return values.get(name) || "";
    },
    removeProperty(name) {
      values.delete(name);
    },
    setProperty(name, value) {
      values.set(name, value);
    }
  };
}

function createPointElement() {
  const selectGroup = { style: createStyleDeclaration() };
  const point = {
    style: createStyleDeclaration(),
    querySelector(selector) {
      return selector === ".point-selects" ? selectGroup : null;
    }
  };

  return { point, selectGroup };
}

test("uses one aligned desktop base for bands, select rows, and marker centers", () => {
  const desktop = MAP_LAYOUT_CSS_VARS.desktop;

  assert.equal(desktop["--map-point-labels-left"], "65px");
  assert.equal(desktop["--map-point-select-left"], "0px");
  assert.equal(desktop["--map-point-select-top"], "0px");
  assert.equal(desktop["--map-point-select-row-height"], "17.98px");
  assert.equal(desktop["--map-point-select-height"], "17.98px");
  assert.equal(desktop["--map-point-select-gap"], "10.02px");
  assert.equal(desktop["--map-sword-top"], "7px");
  assert.equal(desktop["--map-shield-top"], "35px");
});

test("keeps desktop point exceptions as shared stack offsets", () => {
  const configuredIds = Object.keys(MAP_POINT_UI_OFFSETS.desktop);

  assert.deepEqual(configuredIds, ["citri", "perido", "meral", "zircon", "yesod", "keter", "ein"]);
  configuredIds.forEach(pointId => {
    assert.deepEqual(Object.keys(MAP_POINT_UI_OFFSETS.desktop[pointId]), ["pointStack"]);
  });
  assert.equal(BATTLE_POINTS.length, 21);
});

test("applies one desktop pointStack delta to bands, selects, sword, and shield", () => {
  const { point, selectGroup } = createPointElement();

  applyPointUiOffsets(point, "citri", 1280);

  assert.equal(point.style.getPropertyValue("--map-point-labels-left"), "69px");
  assert.equal(point.style.getPropertyValue("--map-point-labels-top"), "27px");
  assert.equal(point.style.getPropertyValue("--map-point-select-left"), "4px");
  assert.equal(point.style.getPropertyValue("--map-point-select-top"), "6px");
  assert.equal(point.style.getPropertyValue("--map-sword-left"), "7px");
  assert.equal(point.style.getPropertyValue("--map-sword-top"), "13px");
  assert.equal(point.style.getPropertyValue("--map-shield-left"), "7px");
  assert.equal(point.style.getPropertyValue("--map-shield-top"), "41px");
  assert.equal(selectGroup.style.getPropertyValue("--map-point-select-left"), "");
});

test("keeps mobile controls in non-overlapping rows and removes hidden band offsets", () => {
  const mobile = MAP_LAYOUT_CSS_VARS.mobile;

  assert.equal(mobile["--map-point-width"], "0px");
  assert.equal(mobile["--map-point-select-row-height"], "18px");
  assert.equal(mobile["--map-point-select-height"], "18px");
  assert.equal(mobile["--map-point-select-min-height"], "18px");
  assert.equal(mobile["--map-point-select-gap"], "0px");

  Object.values(MAP_POINT_UI_OFFSETS.mobile).forEach(offsets => {
    assert.deepEqual(Object.keys(offsets), ["select"]);
    assert.equal("pointLabels" in offsets, false);
  });
  assert.equal(getMapPointUiOffsets("ganette", 390), null);
});

test("uses one default text offset for every banner label", () => {
  MAP_BANNER_PLACEMENTS.forEach(placement => {
    assert.deepEqual(getBannerTextOffset(placement, "desktop"), {
      x: MAP_LABEL_LAYOUT.textOffsetX,
      y: MAP_LABEL_LAYOUT.textOffsetY
    });
    assert.deepEqual(getBannerTextOffset(placement, "mobile"), {
      x: MAP_LABEL_LAYOUT.textOffsetX,
      y: MAP_LABEL_LAYOUT.textOffsetY
    });
  });
});
