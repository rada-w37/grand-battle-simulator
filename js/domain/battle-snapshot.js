import { BATTLE_POINTS } from "../layout/layout-config.js?v=20260524-visibility-toggles";

export function getOccupyingGuild(castleData, guilds = {}) {
  const isCapturedOrCountering = castleData?.GvgCastleState === 2 || castleData?.GvgCastleState === 3;
  const guildId = isCapturedOrCountering ? castleData?.AttackerGuildId : castleData?.GuildId;
  return guilds[guildId] || "";
}

export function getAttackingGuild(castleData, guilds = {}) {
  return guilds[castleData?.AttackerGuildId] || "";
}

export function createOccupationStatesFromBattleSnapshot(battleData, battlePoints = BATTLE_POINTS) {
  const guilds = battleData?.guilds || {};
  const castlesById = new Map((battleData?.castles || []).map(castle => [castle.CastleId, castle]));

  return battlePoints.map(point => {
    const castleData = castlesById.get(point.castleId);
    return {
      defender: castleData ? getOccupyingGuild(castleData, guilds) : "",
      attacker: castleData ? getAttackingGuild(castleData, guilds) : ""
    };
  });
}
