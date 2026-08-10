import { MAP_BANNER_PLACEMENTS } from "../layout/layout-config.js?v=20260524-visibility-toggles";
import { getPointLayout } from "../layout/layout-engine.js?v=20260524-visibility-toggles";
import { MAP_BASE_HEIGHT, MAP_BASE_WIDTH } from "../layout/layout-coordinate.js?v=20260524-visibility-toggles";
import { applyPointUiOffsets, clearPointUiOffsets } from "../layout/point-ui-layout.js?v=20260524-visibility-toggles";
import { setMapImagePosition } from "../utils.js?v=20260810-filtered-export";

function collectCssRules(ruleList, output) {
  Array.from(ruleList || []).forEach(rule => {
    if (rule.cssRules) {
      if (String(rule.conditionText || "").includes("max-width")) return;
      output.push(rule.cssText);
      return;
    }

    output.push(rule.cssText);
  });
}

function absolutizeCssUrls(cssText) {
  return cssText.replace(/url\((['"]?)([^'")]+)\1\)/g, (match, quote, path) => {
    if (/^(data:|https?:|file:|blob:|#)/i.test(path)) return match;

    try {
      return "url(" + quote + new URL(path, document.baseURI).href + quote + ")";
    } catch {
      return match;
    }
  });
}

async function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("アセットを読み込めませんでした。"));
    reader.readAsDataURL(blob);
  });
}

function rasterizeAssetDataUrl(assetUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth || image.width;
        canvas.height = image.naturalHeight || image.height;
        canvas.getContext("2d").drawImage(image, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (error) {
        reject(error);
      }
    };
    image.onerror = () => reject(new Error("アセットの画像化に失敗しました。"));
    image.src = assetUrl;
  });
}

async function resolveAssetDataUrl(assetUrl) {
  if (/^(data:|blob:)/i.test(assetUrl)) return assetUrl;

  try {
    const response = await fetch(assetUrl, { cache: "force-cache" });
    if (response.ok) return await blobToDataUrl(await response.blob());
  } catch {
    // file:// assets cannot be fetched in every browser; try loading them as images.
  }

  try {
    return await rasterizeAssetDataUrl(assetUrl);
  } catch {
    return assetUrl;
  }
}

async function inlineCssAssets(cssText) {
  const urlPattern = /url\((['"]?)([^'")]+)\1\)/g;
  const urls = [...cssText.matchAll(urlPattern)]
    .map(match => match[2])
    .filter(assetUrl => !/^(data:|blob:|#)/i.test(assetUrl));
  const replacements = await Promise.all([...new Set(urls)].map(async assetUrl => [
    assetUrl,
    await resolveAssetDataUrl(assetUrl)
  ]));
  const replacementMap = new Map(replacements);

  return cssText.replace(urlPattern, (match, quote, assetUrl) => {
    const replacement = replacementMap.get(assetUrl);
    return replacement ? "url(" + quote + replacement + quote + ")" : match;
  });
}

function getStylesheetText() {
  const rules = [];

  Array.from(document.styleSheets).forEach(sheet => {
    try {
      collectCssRules(sheet.cssRules, rules);
    } catch {
      // Cross-origin stylesheets cannot be inspected. The local app stylesheet is same-origin.
    }
  });

  return absolutizeCssUrls(rules.join("\n"));
}

function replaceSelectsWithLabels(mapInner, selectedValues = []) {
  mapInner.querySelectorAll("select").forEach((select, index) => {
    const selectedValue = selectedValues[index] || select.value || "";
    const isAttacker = select.classList.contains("point-attacker-select");
    const isDefender = select.classList.contains("point-defender-select");
    const label = document.createElement("span");
    label.className = Array.from(select.classList).concat("map-export-select").join(" ");
    label.textContent = selectedValue || "";
    label.setAttribute("aria-hidden", "true");

    if (!selectedValue && isAttacker) {
      label.classList.add("is-export-empty-attacker");
      select.closest(".point")?.classList.add("is-export-empty-attacker");
    }
    if (!selectedValue && isDefender) {
      label.classList.add("is-export-empty-defender");
    }

    select.replaceWith(label);
  });
}

function copyMapCssVariables(sourceElement, targetElement) {
  const computedStyle = getComputedStyle(sourceElement);

  for (let index = 0; index < computedStyle.length; index += 1) {
    const propertyName = computedStyle.item(index);
    if (!propertyName.startsWith("--map-")) continue;

    const propertyValue = computedStyle.getPropertyValue(propertyName).trim();
    if (propertyValue) targetElement.style.setProperty(propertyName, propertyValue);
  }
}

function applyDesktopLayoutToClone(mapInner) {
  mapInner.querySelectorAll(".point").forEach(point => {
    clearPointUiOffsets(point);
    applyPointUiOffsets(point, point.dataset.id, MAP_BASE_WIDTH);
  });

  MAP_BANNER_PLACEMENTS.forEach(placement => {
    const banner = mapInner.querySelector(".point-banner[data-point-id='" + placement.pointId + "']");
    const label = mapInner.querySelector(".point-name-label[data-point-id='" + placement.pointId + "']");
    if (!banner || !label) return;

    const layout = getPointLayout(placement.pointId, undefined, MAP_BASE_WIDTH);
    const textOffset = layout.bannerTextOffset;
    setMapImagePosition(banner, placement.x, placement.y);
    setMapImagePosition(label, placement.x + textOffset.x, placement.y + textOffset.y);
  });
}

async function inlineImageSources(mapInner) {
  await Promise.all([...mapInner.querySelectorAll("img[src]")].map(async image => {
    const sourceUrl = new URL(image.getAttribute("src"), document.baseURI).href;
    const dataUrl = await resolveAssetDataUrl(sourceUrl);
    image.setAttribute("src", dataUrl);
  }));
}

async function createExportRoot(mapContainer) {
  const sourceMapInner = mapContainer.querySelector("#map-inner");
  if (!sourceMapInner) throw new Error("MAP本体が見つかりません。");

  const root = document.createElement("div");
  root.className = "map-container map-export-root";
  root.dataset.showAttacker = mapContainer.dataset.showAttacker || "true";
  root.dataset.showDefender = mapContainer.dataset.showDefender || "true";
  root.style.width = MAP_BASE_WIDTH + "px";
  root.style.height = MAP_BASE_HEIGHT + "px";
  root.style.margin = "0";
  root.style.overflow = "visible";
  copyMapCssVariables(document.documentElement, root);

  const selectedValues = [...sourceMapInner.querySelectorAll("select")].map(select => select.value);
  const mapInner = sourceMapInner.cloneNode(true);
  mapInner.style.width = MAP_BASE_WIDTH + "px";
  mapInner.style.height = MAP_BASE_HEIGHT + "px";
  mapInner.style.transform = "none";
  mapInner.style.display = "block";

  const mapImage = mapInner.querySelector(".map-image");
  if (mapImage) {
    mapImage.style.width = MAP_BASE_WIDTH + "px";
    mapImage.style.height = MAP_BASE_HEIGHT + "px";
  }

  replaceSelectsWithLabels(mapInner, selectedValues);
  applyDesktopLayoutToClone(mapInner);

  await inlineImageSources(mapInner);

  root.appendChild(mapInner);
  return root;
}

async function getExportStyles() {
  const stylesheetText = await inlineCssAssets(getStylesheetText());
  return stylesheetText + [
    ".map-export-root{position:relative!important;display:block!important;}",
    ".map-export-root .map-inner{position:relative!important;}",
    ".map-export-root .point-selects{display:grid!important;visibility:visible!important;opacity:1!important;z-index:6!important;}",
    ".map-export-root .map-export-select{position:static!important;display:block!important;visibility:visible!important;opacity:1!important;width:var(--map-point-select-width);height:var(--map-point-select-height);min-height:var(--map-point-select-min-height);padding:var(--map-point-select-padding);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border:0;border-radius:0;color:#eef4f8;font-size:calc(var(--map-point-select-font-size) * var(--map-select-font-scale, var(--map-label-font-scale, 1)));font-weight:700;line-height:var(--map-point-select-line-height);text-align:center;text-shadow:0 1px 2px rgba(0,0,0,.75);background:transparent;}",
    ".map-export-root .map-export-select.is-export-empty-attacker{display:none!important;}",
    ".map-export-root .map-export-select.is-export-empty-defender{color:transparent!important;}",
    ".map-export-root .point.is-export-empty-attacker .point-sword-frame{display:none!important;}",
    ".map-export-root .point.is-export-empty-attacker .point-labels::before{display:none!important;}",
    ".map-export-root[data-show-attacker=\"false\"] .point-sword-frame{display:none!important;}",
    ".map-export-root[data-show-attacker=\"false\"] .point-attacker-select{visibility:hidden!important;}",
    ".map-export-root[data-show-attacker=\"false\"] .point-labels::before{display:none!important;}",
    ".map-export-root[data-show-defender=\"false\"] .point-frame{display:none!important;}",
    ".map-export-root[data-show-defender=\"false\"] .point-defender-select{visibility:hidden!important;}",
    ".map-export-root[data-show-defender=\"false\"] .point-labels::after{display:none!important;}",
    ".map-export-root .point-name-label{z-index:7!important;}",
    ".map-export-root .map-export-select.is-highlight-guild{color:limegreen;}",
    ".map-export-root .map-export-select.is-self-attack{color:#9ca3a7;}"
  ].join("");
}

async function renderSvgToPng(root) {
  const exportStyles = await getExportStyles();
  const rootMarkup = new XMLSerializer().serializeToString(root);
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="',
    MAP_BASE_WIDTH,
    '" height="',
    MAP_BASE_HEIGHT,
    '" viewBox="0 0 ',
    MAP_BASE_WIDTH,
    " ",
    MAP_BASE_HEIGHT,
    '">',
    '<foreignObject x="0" y="0" width="',
    MAP_BASE_WIDTH,
    '" height="',
    MAP_BASE_HEIGHT,
    '">',
    '<div xmlns="http://www.w3.org/1999/xhtml" style="width:',
    MAP_BASE_WIDTH,
    'px;height:',
    MAP_BASE_HEIGHT,
    'px;overflow:hidden;">',
    "<style>",
    exportStyles,
    "</style>",
    rootMarkup,
    "</div></foreignObject></svg>"
  ].join("");

  const svgUrl = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
  const parsedSvg = new DOMParser().parseFromString(svg, "image/svg+xml");
  if (parsedSvg.querySelector("parsererror")) {
    throw new Error("MAP画像のSVG変換に失敗しました。");
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = MAP_BASE_WIDTH;
        canvas.height = MAP_BASE_HEIGHT;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, MAP_BASE_WIDTH, MAP_BASE_HEIGHT);
        canvas.toBlob(blob => {
          if (!blob) {
            reject(new Error("PNG画像を生成できませんでした。"));
            return;
          }
          resolve(blob);
        }, "image/png");
      } catch (error) {
        reject(error);
      }
    };
    image.onerror = () => {
      reject(new Error("MAP画像の描画に失敗しました。"));
    };
    image.src = svgUrl;
  });
}

export async function captureMapPng(mapContainer = document.querySelector(".map-container")) {
  if (!mapContainer) throw new Error("MAPエリアが見つかりません。");

  await document.fonts?.ready;
  const root = await createExportRoot(mapContainer);
  return renderSvgToPng(root);
}

export function createMapExportFilename(tabName = "Day") {
  const now = new Date();
  const pad = value => String(value).padStart(2, "0");
  const timestamp = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate())
  ].join("") + "-" + [
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds())
  ].join("");
  const safeTabName = String(tabName || "Day")
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
    .trim() || "Day";

  return "grand-battle_" + safeTabName + "_" + timestamp + ".png";
}

export function canSharePngFile(file) {
  try {
    const isMobileSharePlatform = Boolean(
      navigator.userAgentData?.mobile ||
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
    return Boolean(
      isMobileSharePlatform &&
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    );
  } catch {
    return false;
  }
}

export async function sharePngFile(file) {
  await navigator.share({
    title: "Grand Battle Simulator MAP",
    files: [file]
  });
}

export function downloadPngFile(file, filename) {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
