import { normalizePointState } from "./occupation-state.js?v=20260524-visibility-toggles";

export const ADJACENT_POINT_IDS = Object.freeze({
  ganette: Object.freeze(["rula", "tiferet"]),
  rula: Object.freeze(["ganette", "cushel"]),
  cushel: Object.freeze(["rula", "pharia", "citri", "tiferet", "yesod"]),
  pharia: Object.freeze(["cushel", "citri"]),
  citri: Object.freeze(["cushel", "pharia", "toppaz"]),
  toppaz: Object.freeze(["citri", "yesod", "meral"]),

  floryte: Object.freeze(["onyx", "tiferet", "keter"]),
  onyx: Object.freeze(["floryte", "zircon"]),
  zircon: Object.freeze(["onyx", "laven"]),
  laven: Object.freeze(["zircon", "keter", "amest", "marin"]),

  tiferet: Object.freeze(["ganette", "cushel", "floryte", "ein"]),
  yesod: Object.freeze(["cushel", "toppaz", "perido", "ein"]),
  perido: Object.freeze(["yesod", "meral", "malkuth"]),
  meral: Object.freeze(["toppaz", "perido", "malkuth"]),

  ein: Object.freeze(["tiferet", "yesod", "keter", "malkuth"]),
  keter: Object.freeze(["floryte", "laven", "ein", "amest"]),
  amest: Object.freeze(["keter", "laven", "marin", "malkuth"]),
  malkuth: Object.freeze(["perido", "meral", "ein", "amest", "lapis"]),

  lapis: Object.freeze(["malkuth", "marin", "larimal"]),
  marin: Object.freeze(["laven", "amest", "lapis", "larimal"]),
  larimal: Object.freeze(["lapis", "marin"])
});

export const CASTLE_POINT_IDS = Object.freeze(["tiferet", "yesod", "keter", "malkuth"]);

const CASTLE_POINT_ID_SET = new Set(CASTLE_POINT_IDS);

function getDefenderByPointId(pointId, pointIndexById, selectStates) {
  const pointIndex = pointIndexById.get(pointId);
  if (pointIndex === undefined) return "";
  return normalizePointState(selectStates[pointIndex]).defender;
}

function countOccupiedChurchesByGuild(battlePoints, selectStates) {
  const churchCountByGuild = new Map();

  battlePoints.forEach((point, index) => {
    if (point.type !== "church") return;

    const guildName = normalizePointState(selectStates[index]).defender;
    if (!guildName) return;
    churchCountByGuild.set(guildName, (churchCountByGuild.get(guildName) || 0) + 1);
  });

  return churchCountByGuild;
}

export function getDeclarationCandidateGuildNames({
  targetPointId,
  battlePoints = [],
  selectStates = [],
  guildNames = []
}) {
  const pointIndexById = new Map(battlePoints.map((point, index) => [point.id, index]));
  if (!pointIndexById.has(targetPointId)) return [];

  const candidateGuildNames = new Set(
    [targetPointId, ...(ADJACENT_POINT_IDS[targetPointId] || [])]
      .map(pointId => getDefenderByPointId(pointId, pointIndexById, selectStates))
      .filter(Boolean)
  );

  if (CASTLE_POINT_ID_SET.has(targetPointId)) {
    const churchCountByGuild = countOccupiedChurchesByGuild(battlePoints, selectStates);
    candidateGuildNames.forEach(guildName => {
      if ((churchCountByGuild.get(guildName) || 0) < 2) {
        candidateGuildNames.delete(guildName);
      }
    });
  }

  const addedGuildNames = new Set();
  return guildNames.filter(guildName => {
    if (!guildName || addedGuildNames.has(guildName) || !candidateGuildNames.has(guildName)) {
      return false;
    }
    addedGuildNames.add(guildName);
    return true;
  });
}
