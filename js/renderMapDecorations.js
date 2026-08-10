import { MAP_STRUCTURE_PLACEMENTS, MAP_BANNER_PLACEMENTS, MAP_LABEL_LAYOUT } from "./layout/layout-config.js?v=20260524-visibility-toggles";
import { getPointLayout } from "./layout/layout-engine.js?v=20260524-visibility-toggles";
import { setMapImagePosition } from "./utils.js?v=20260810-empty-row";

function setDevLayoutMetadata(element, { targetId, layoutKey, pointId, role = "", targetType = "" }) {
  element.dataset.devLayoutId = targetId;
  element.dataset.devLayoutKey = layoutKey;
  element.dataset.devLayoutPointId = pointId;
  element.dataset.devLayoutTargetType = targetType || role || layoutKey;
  if (role) {
    element.dataset.devLayoutRole = role;
  }
}

export function renderStructurePlacements(fragment) {
  MAP_STRUCTURE_PLACEMENTS.forEach(placement => {
    const structure = document.createElement("img");
    structure.className = `point-structure ${placement.className}`;
    structure.src = placement.src;
    structure.alt = "";
    structure.dataset.pointId = placement.pointId;
    setDevLayoutMetadata(structure, {
      targetId: `structure:${placement.pointId}`,
      layoutKey: "MAP_STRUCTURE_PLACEMENTS",
      pointId: placement.pointId,
      targetType: "structure"
    });
    structure.style.width = `${placement.scale}%`;
    setMapImagePosition(structure, placement.x, placement.y);
    fragment.appendChild(structure);
  });
}

export function renderBannerPlacements(fragment) {
  MAP_BANNER_PLACEMENTS.forEach(placement => {
    const banner = document.createElement("img");
    banner.className = "point-banner";
    banner.src = "resource/banner.png?v=lowres-1";
    banner.alt = "";
    banner.dataset.pointId = placement.pointId;
    setDevLayoutMetadata(banner, {
      targetId: `banner:${placement.pointId}`,
      layoutKey: "MAP_BANNER_PLACEMENTS",
      pointId: placement.pointId,
      role: "banner",
      targetType: "banner"
    });
    banner.style.width = `${placement.scale}%`;
    setMapImagePosition(banner, placement.x, placement.y);
    fragment.appendChild(banner);

    const label = document.createElement("span");
    label.className = "point-name-label";
    label.textContent = placement.name;
    label.id = `point-label-${placement.pointId}`;
    label.dataset.pointId = placement.pointId;
    setDevLayoutMetadata(label, {
      targetId: `pointName:${placement.pointId}`,
      layoutKey: "MAP_BANNER_PLACEMENTS",
      pointId: placement.pointId,
      role: "pointName",
      targetType: "pointName"
    });
    label.style.setProperty("--map-point-label-scale", String(placement.scale / MAP_LABEL_LAYOUT.scaleDivisor));
    label.style.transformOrigin = "center";
    const { bannerTextOffset: textOffset } = getPointLayout(placement.pointId);
    setMapImagePosition(
      label,
      placement.x + textOffset.x,
      placement.y + textOffset.y
    );
    fragment.appendChild(label);
  });
}
