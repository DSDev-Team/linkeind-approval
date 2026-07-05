import type { Storage } from "./storage";
import { isKVConfigured } from "./storage";
import { getKVStorage } from "./kv";
import { getMemoryStorage } from "./memory";
import { buildSeedPosts } from "./seed";
import type { Post } from "./types";

let cached: Storage | null = null;

export function getStorage(): Storage {
  if (cached) return cached;
  cached = isKVConfigured() ? getKVStorage() : getMemoryStorage();
  return cached;
}

// Run once at app startup (server side) to make integration testing easy.
export async function initStorage(): Promise<Storage> {
  const store = getStorage();
  try {
    await store.seedIfEmpty(buildSeedPosts() as Post[]);
  } catch (err) {
    console.error("[storage] seed failed (non-fatal):", err);
  }
  return store;
}

export function backendName(): string {
  return getStorage().backendName();
}

export { isKVConfigured } from "./storage";