import type { NewPostInput, Post, PostStatus } from "./types";
import type { Storage } from "./storage";
import { postForSchedule } from "./storage";
import { buildSeedPosts } from "./seed";
import { nowISO, uid } from "./utils";

// Dev/local fallback. Not durable across serverless invocations — used
// only when KV is not configured. Pairs with `npm run dev`.
class MemoryStorage implements Storage {
  private posts = new Map<string, Post>();
  private seeded = false;

  constructor() {
    // Defer seed until first read so date math runs near request time.
  }

  private ensureSeed() {
    if (this.seeded) return;
    this.seeded = true;
    for (const p of buildSeedPosts()) this.posts.set(p.id, p);
  }

  async getAllPosts(): Promise<Post[]> {
    this.ensureSeed();
    return Array.from(this.posts.values()).sort(
      (a, b) => a.scheduledFor.localeCompare(b.scheduledFor) || a.id.localeCompare(b.id)
    );
  }

  async getPost(id: string): Promise<Post | null> {
    this.ensureSeed();
    return this.posts.get(id) ?? null;
  }

  async createPost(input: NewPostInput): Promise<Post> {
    this.ensureSeed();
    const { weekId, weekLabel, dayLabel } = postForSchedule(input);
    const now = nowISO();
    const post: Post = {
      ...input,
      id: uid("post"),
      weekId,
      weekLabel,
      dayLabel,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    this.posts.set(post.id, post);
    return post;
  }

  async updatePost(id: string, patch: Partial<Post>): Promise<Post> {
    this.ensureSeed();
    const existing = this.posts.get(id);
    if (!existing) throw new Error(`Post ${id} not found`);
    const updated: Post = {
      ...existing,
      ...patch,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: nowISO(),
    };
    if (patch.scheduledFor && patch.scheduledFor !== existing.scheduledFor) {
      const { weekId, weekLabel, dayLabel } = postForSchedule({
        ...existing,
        ...patch,
      } as NewPostInput);
      updated.weekId = weekId;
      updated.weekLabel = weekLabel;
      updated.dayLabel = dayLabel;
    }
    this.posts.set(id, updated);
    return updated;
  }

  async setStatus(
    id: string,
    status: PostStatus,
    feedback?: string,
    reviewer?: string
  ): Promise<Post> {
    this.ensureSeed();
    const existing = this.posts.get(id);
    if (!existing) throw new Error(`Post ${id} not found`);
    const updated: Post = {
      ...existing,
      status,
      feedback: feedback ?? existing.feedback,
      reviewedAt: nowISO(),
      reviewedBy: reviewer ?? existing.reviewedBy ?? "approver",
      updatedAt: nowISO(),
    };
    this.posts.set(id, updated);
    return updated;
  }

  async approveWeek(weekId: string, reviewer?: string): Promise<Post[]> {
    this.ensureSeed();
    const updated: Post[] = [];
    const now = nowISO();
    for (const p of this.posts.values()) {
      if (p.weekId === weekId && p.status !== "approved") {
        const next: Post = {
          ...p,
          status: "approved",
          reviewedAt: now,
          reviewedBy: reviewer ?? "approver",
          updatedAt: now,
        };
        this.posts.set(p.id, next);
        updated.push(next);
      }
    }
    return updated;
  }

  async resetAll(): Promise<void> {
    this.posts.clear();
    this.seeded = false;
    this.ensureSeed();
  }

  async seedIfEmpty(posts: Post[]): Promise<void> {
    this.ensureSeed();
    if (this.posts.size === 0) {
      for (const p of posts) this.posts.set(p.id, p);
    }
  }

  backendName(): string {
    return "memory";
  }
}

// Singleton — survives across hot-reload in dev via globalThis cache.
declare global {
  // eslint-disable-next-line no-var
  var __approvalMemoryStore: MemoryStorage | undefined;
}

export function getMemoryStorage(): MemoryStorage {
  if (!globalThis.__approvalMemoryStore) {
    globalThis.__approvalMemoryStore = new MemoryStorage();
  }
  return globalThis.__approvalMemoryStore;
}