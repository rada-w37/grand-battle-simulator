import test from "node:test";
import assert from "node:assert/strict";

import {
  createOccupationStatesFromBattleSnapshot,
  getAttackingGuild,
  getOccupyingGuild
} from "../../js/domain/battle-snapshot.js?v=test";

const guilds = {
  10: "Defender Guild",
  20: "Attacker Guild",
  30: "Other Guild"
};

test("resolves occupying guild from GuildId for normal castle states", () => {
  assert.equal(getOccupyingGuild({
    GvgCastleState: 1,
    GuildId: 10,
    AttackerGuildId: 20
  }, guilds), "Defender Guild");
});

test("resolves occupying guild from AttackerGuildId for state 2 and 3", () => {
  assert.equal(getOccupyingGuild({
    GvgCastleState: 2,
    GuildId: 10,
    AttackerGuildId: 20
  }, guilds), "Attacker Guild");

  assert.equal(getOccupyingGuild({
    GvgCastleState: 3,
    GuildId: 10,
    AttackerGuildId: 20
  }, guilds), "Attacker Guild");
});

test("resolves attacking guild from AttackerGuildId", () => {
  assert.equal(getAttackingGuild({
    GuildId: 10,
    AttackerGuildId: 20
  }, guilds), "Attacker Guild");
});

test("returns empty string for missing castle or unknown guilds", () => {
  assert.equal(getOccupyingGuild(null, guilds), "");
  assert.equal(getAttackingGuild(null, guilds), "");
  assert.equal(getOccupyingGuild({
    GvgCastleState: 1,
    GuildId: 999,
    AttackerGuildId: 20
  }, guilds), "");
  assert.equal(getAttackingGuild({
    AttackerGuildId: 999
  }, guilds), "");
});

test("creates occupation states from battle snapshot without mutating input", () => {
  const battleData = {
    guilds: { ...guilds },
    castles: [
      {
        CastleId: 1,
        GvgCastleState: 1,
        GuildId: 10,
        AttackerGuildId: 20
      },
      {
        CastleId: 2,
        GvgCastleState: 2,
        GuildId: 10,
        AttackerGuildId: 30
      }
    ]
  };
  const before = structuredClone(battleData);
  const states = createOccupationStatesFromBattleSnapshot(battleData, [
    { id: "point-a", castleId: 1 },
    { id: "point-b", castleId: 2 },
    { id: "point-c", castleId: 3 }
  ]);

  assert.deepEqual(states, [
    { defender: "Defender Guild", attacker: "Attacker Guild" },
    { defender: "Other Guild", attacker: "Other Guild" },
    { defender: "", attacker: "" }
  ]);
  assert.deepEqual(battleData, before);
});
