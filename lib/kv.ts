import { kv } from "@vercel/kv";
import type { NewPostInput, Post, PostStatus } from "./types";
import type { Storage } from "./storage";
import { postForSchedule } from "./storage";
import { buildSeedPosts } from "./seed";
import { nowISO, uid } from "./utils";

// Keys:
//   approval:post:<id>     -> JSON Post
//   approval:ids          -> set of all post ids
//   approval:week:<weekId> -> set of post ids in that ISO week

const KEY_POST = (id: string) => `approval:post:${id}`;
const KEY_IDS = "approval:ids";
const KEY_WEEK = (weekId: string) => `approval:week:${weekId}`;

class KVStorage implements Storage {
  async getAllPosts(): Promise<Post[]> {
    const ids = await kv.smembers(KEY_IDS);
    if (ids.length === 0) return [];
    const posts = await kv.mget<Post[]>(...ids.map(KEY_POST));
    return posts
      .filter((p): p is Post => p != null)
      .sort(
        (a, b) =>
          a.scheduledFor.localeCompare(b.scheduledFor) || a.id.localeCompare(b.id)
      );
  }

  async getPost(id: string): Promise<Post | null> {
    const post = await kv.get<Post>(KEY_POST(id));
    return post ?? null;
  }

  async createPost(input: NewPostInput): Promise<Post> {
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
    await kv.set(KEY_POST(post.id), post);
    await kv.sadd(KEY_IDS, post.id);
    await kv.sadd(KEY_WEEK(weekId), post.id);
    return post;
  }

  async updatePost(id: string, patch: Partial<Post>): Promise<Post> {
    const existing = await this.getPost(id);
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
      await kv.srem(KEY_WEEK(existing.weekId), existing.id);
      await kv.sadd(KEY_WEEK(weekId), existing.id);
    }
    await kv.set(KEY_POST(id), updated);
    return updated;
  }

  async setStatus(
    id: string,
    status: PostStatus,
    feedback?: string,
    reviewer?: string
  ): Promise<Post> {
    const existing = await this.getPost(id);
    if (!existing) throw new Error(`Post ${id} not found`);
    const updated: Post = {
      ...existing,
      status,
      feedback: feedback ?? existing.feedback,
      reviewedAt: nowISO(),
      reviewedBy: reviewer ?? "approver",
      updatedAt: nowISO(),
    };
    await kv.set(KEY_POST(id), updated);
    return updated;
  }

  async approveWeek(weekId: string, reviewer?: string): Promise<Post[]> {
    const ids = await kv.smembers(KEY_WEEK(weekId));
    if (ids.length === 0) return [];
    const posts = await kv.mget<Post[]>(...ids.map(KEY_POST));
    const now = nowISO();
    const updated: Post[] = [];
    for (const p of posts) {
      if (!p) continue;
      if (p.status === "approved") continue;
      const next: Post = {
        ...p,
        status: "approved",
        reviewedAt: now,
        reviewedBy: reviewer ?? "approver",
        updatedAt: now,
      };
      await kv.set(KEY_POST(p.id), next);
      updated.push(next);
    }
    return updated;
  }

  async resetAll(): Promise<void> {
    const ids = await kv.smembers(KEY_IDS);
    if (ids.length === 0) return;
    await kv.del(...ids.map(KEY_POST));
    const weeks = new Set<string>();
    for (const id of ids) {
      const p = await kv.get<Post>(KEY_POST(id));
      if (p) weeks.add(p.weekId);
    }
    for (const w of weeks) await kv.del(KEY_WEEK(w));
    await kv.del(KEY_IDS);
  }

  async seedIfEmpty(posts: Post[]): Promise<void> {
    const count = await kv.scard(KEY_IDS);
    if (count > 0) return;
    if (posts.length === 0) posts = buildSeedPosts();
    for (const p of posts) {
      await kv.set(KEY_POST(p.id), p);
      await kv.sadd(KEY_IDS, p.id);
      await kv.sadd(KEY_WEEK(p.weekId), p.id);
    }
  }

  backendName(): string {
    return "kv";
  }
}

export function getKVStorage(): KVStorage {
  return new KVStorage();
}