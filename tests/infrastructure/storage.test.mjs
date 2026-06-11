import test from "node:test";
import assert from "node:assert/strict";

import {
  getStorageItem,
  readJsonStorage,
  removeStorageItem,
  removeStorageKeys,
  setStorageItem,
  writeJsonStorage
} from "../../js/infrastructure/storage.js?v=test";

function installLocalStorage() {
  const values = new Map();
  globalThis.localStorage = {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key)
  };
  return values;
}

test("reads and writes raw storage values", () => {
  installLocalStorage();

  setStorageItem("raw-key", "raw-value");

  assert.equal(getStorageItem("raw-key"), "raw-value");
  removeStorageItem("raw-key");
  assert.equal(getStorageItem("raw-key"), null);
});

test("reads and writes JSON storage values", () => {
  installLocalStorage();

  writeJsonStorage("json-key", { value: 1 });

  assert.deepEqual(readJsonStorage("json-key", {}), { value: 1 });
});

test("returns fallback for missing, null, or invalid JSON values", () => {
  installLocalStorage();

  assert.equal(readJsonStorage("missing-key", "fallback"), "fallback");

  setStorageItem("null-key", "null");
  assert.equal(readJsonStorage("null-key", "fallback"), "fallback");

  setStorageItem("invalid-key", "{");
  assert.equal(readJsonStorage("invalid-key", "fallback"), "fallback");
});

test("removes explicit storage keys", () => {
  installLocalStorage();

  setStorageItem("key-a", "a");
  setStorageItem("key-b", "b");
  removeStorageKeys(["key-a", "key-b"]);

  assert.equal(getStorageItem("key-a"), null);
  assert.equal(getStorageItem("key-b"), null);
});
