import { STORAGE_KEYS } from "../config/app-config.js?v=20260524-visibility-toggles";

export { STORAGE_KEYS };

export function getStorageItem(key) {
  return localStorage.getItem(key);
}

export function setStorageItem(key, value) {
  localStorage.setItem(key, value);
}

export function removeStorageItem(key) {
  localStorage.removeItem(key);
}

export function readJsonStorage(key, fallback) {
  try {
    const value = JSON.parse(getStorageItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeJsonStorage(key, value) {
  setStorageItem(key, JSON.stringify(value));
}

export function removeStorageKeys(keys = Object.values(STORAGE_KEYS)) {
  keys.forEach(removeStorageItem);
}
