// lib/store.js
// Uses environment variable PTM_DATA to persist state across serverless calls
// On Vercel: set PTM_DATA as environment variable (JSON stringified)
// For local dev: uses a simple in-memory cache

import { DEFAULT_DATA } from './data';

let memoryStore = null;

export function getStore() {
  if (memoryStore) return JSON.parse(JSON.stringify(memoryStore));
  
  // Try to load from env var (Vercel-compatible)
  if (process.env.PTM_DATA) {
    try {
      memoryStore = JSON.parse(process.env.PTM_DATA);
      return JSON.parse(JSON.stringify(memoryStore));
    } catch (e) {}
  }
  
  // Fall back to defaults
  memoryStore = JSON.parse(JSON.stringify(DEFAULT_DATA));
  return JSON.parse(JSON.stringify(memoryStore));
}

export function saveStore(data) {
  memoryStore = JSON.parse(JSON.stringify(data));
  return true;
}

export function getBranch(branchId) {
  const store = getStore();
  return store.branches.find(b => b.id === branchId) || null;
}

export function getRegion(regionId) {
  const store = getStore();
  return store.regions.find(r => r.id === regionId) || null;
}
