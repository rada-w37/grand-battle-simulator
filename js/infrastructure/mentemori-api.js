import { API_BASE_URL } from "../constants.js?v=20260524-visibility-toggles";

export function createWorldGroupsUrl() {
  return `${API_BASE_URL}/wgroups`;
}

export function createLatestBattleUrl({ groupId, battleClass, block }) {
  return `${API_BASE_URL}/wg/${groupId}/globalgvg/${battleClass}/${block}/latest`;
}

export async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTPエラー: ${response.status}`);

  const json = await response.json();
  if (json.status !== 200) throw new Error(`APIエラー: status ${json.status}`);

  return json.data;
}

export function fetchWorldGroups() {
  return fetchJson(createWorldGroupsUrl());
}

export function fetchLatestBattleData({ groupId, battleClass, block }) {
  return fetchJson(createLatestBattleUrl({ groupId, battleClass, block }));
}
