import test from "node:test";
import assert from "node:assert/strict";

import {
  createLatestBattleUrl,
  createWorldGroupsUrl,
  fetchJson
} from "../../js/infrastructure/mentemori-api.js?v=test";

const API_BASE_URL = "https://api.mentemori.icu";

test("creates world groups URL", () => {
  assert.equal(createWorldGroupsUrl(), `${API_BASE_URL}/wgroups`);
});

test("creates latest battle data URL", () => {
  assert.equal(createLatestBattleUrl({
    groupId: 12,
    battleClass: "3",
    block: "0"
  }), `${API_BASE_URL}/wg/12/globalgvg/3/0/latest`);
});

test("fetchJson returns response data for status 200 payloads", async () => {
  globalThis.fetch = async url => ({
    ok: true,
    json: async () => ({
      status: 200,
      data: { url }
    })
  });

  assert.deepEqual(await fetchJson("https://example.test/data"), {
    url: "https://example.test/data"
  });
});

test("fetchJson keeps current HTTP error behavior", async () => {
  globalThis.fetch = async () => ({
    ok: false,
    status: 500,
    json: async () => ({ status: 200, data: {} })
  });

  await assert.rejects(
    fetchJson("https://example.test/error"),
    /HTTPエラー: 500/
  );
});

test("fetchJson keeps current API status error behavior", async () => {
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({ status: 404, data: null })
  });

  await assert.rejects(
    fetchJson("https://example.test/error"),
    /APIエラー: status 404/
  );
});
