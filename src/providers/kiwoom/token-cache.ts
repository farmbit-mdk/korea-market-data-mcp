import type { KiwoomTokenCache, KiwoomTokenCacheEntry } from "./types.js";

export class InMemoryKiwoomTokenCache implements KiwoomTokenCache {
  private entry: KiwoomTokenCacheEntry | undefined;

  get(): KiwoomTokenCacheEntry | undefined {
    if (this.entry === undefined || isExpired(this.entry.token.expiresAt)) {
      this.entry = undefined;
      return undefined;
    }

    return this.entry;
  }

  set(entry: KiwoomTokenCacheEntry): void {
    this.entry = entry;
  }

  clear(): void {
    this.entry = undefined;
  }
}

function isExpired(expiresAt: string): boolean {
  const expiresAtMs = Date.parse(expiresAt);
  return Number.isNaN(expiresAtMs) || expiresAtMs <= Date.now();
}
