export function normalizeWorldName(value) {
  const trimmed = value.normalize("NFKC").trim();
  if (!trimmed) return "";

  const match = trimmed.match(/^w?\s*0*(\d+)$/i);
  if (!match) return trimmed.toUpperCase();

  return `W${Number(match[1])}`;
}

export function getWorldOptionsForServer(worldGroupData, serverId) {
  const worlds = worldGroupData.flatMap(group => (
    group.worlds
      .filter(worldId => String(worldId).startsWith(serverId))
      .map(worldId => ({
        id: `W${Number(String(worldId).slice(-3))}`,
        numeric: worldId,
        groupId: group.group_id
      }))
  ));

  return Array.from(new Map(worlds.map(world => [world.id, world])).values())
    .sort((a, b) => a.numeric - b.numeric);
}

export function getWorldRangeKey(world) {
  const worldNumber = Number(world.id.replace("W", ""));
  const rangeStart = worldNumber < 10 ? 1 : Math.floor(worldNumber / 10) * 10;
  return String(rangeStart);
}

export function getWorldRangeLabel(rangeStart, worlds) {
  const first = worlds[0].id;
  const last = worlds[worlds.length - 1].id;
  return `${first} ・・${last}`;
}

export function getGroupedWorldOptions(worldOptions) {
  const groups = new Map();

  worldOptions.forEach(world => {
    const key = getWorldRangeKey(world);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(world);
  });

  return Array.from(groups.entries()).map(([key, worlds]) => ({
    key,
    worlds,
    label: getWorldRangeLabel(Number(key), worlds)
  }));
}
