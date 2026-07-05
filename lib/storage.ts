import type { Post, PostStatus, WeekGroup, NewPostInput } from "./types";
import { approvalWindows, weekRangeLabel, dayLabel, addDays, toISODate, weekKeyForDate } from "./weeks";

export interface Storage {
  getAllPosts(): Promise<Post[]>;
  getPost(id: string): Promise<Post | null>;
  createPost(input: NewPostInput): Promise<Post>;
  updatePost(id: string, patch: Partial<Post>): Promise<Post>;
  setStatus(
    id: string,
    status: PostStatus,
    feedback?: string,
    reviewer?: string
  ): Promise<Post>;
  approveWeek(weekId: string, reviewer?: string): Promise<Post[]>;
  resetAll(): Promise<void>;
  seedIfEmpty(posts: Post[]): Promise<void>;
  // for diagnostics
  backendName(): string;
}

const STATUS_ORDER: PostStatus[] = [
  "pending",
  "approved",
  "changes_requested",
  "rejected",
];

export function groupByWeek(posts: Post[], from: Date = new Date()): WeekGroup[] {
  const windows = approvalWindows(from);
  const byId = new Map<string, Post[]>();
  for (const p of posts) {
    if (!byId.has(p.weekId)) byId.set(p.weekId, []);
    byId.get(p.weekId)!.push(p);
  }
  const sortPosts = (a: Post, b: Post) =>
    a.scheduledFor.localeCompare(b.scheduledFor) || a.id.localeCompare(b.id);

  return windows.map(({ weekId, start }) => {
    const weekPosts = (byId.get(weekId) ?? []).sort(sortPosts);
    const counts: Record<PostStatus, number> = {
      pending: 0,
      approved: 0,
      rejected: 0,
      changes_requested: 0,
    };
    for (const p of weekPosts) counts[p.status]++;
    return {
      weekId,
      weekLabel: weekRangeLabel(start),
      rangeStart: toISODate(start),
      rangeEnd: toISODate(addDays(start, 6)),
      posts: weekPosts,
      counts,
      total: weekPosts.length,
      allApproved: weekPosts.length > 0 && counts.approved === weekPosts.length,
      hasPending: counts.pending > 0,
    };
  });
}

export function postForSchedule(input: NewPostInput): {
  weekId: string;
  weekLabel: string;
  dayLabel: string;
} {
  const date = new Date(`${input.scheduledFor}T00:00:00Z`);
  const start = weekKeyForDate(date).start;
  return {
    weekId: weekKeyForDate(date).weekId,
    weekLabel: weekRangeLabel(start),
    dayLabel: dayLabel(input.scheduledFor),
  };
}

export function statusRank(s: PostStatus): number {
  return STATUS_ORDER.indexOf(s);
}

// In-memory store lives in a per-cold-start process; KV is the real one.
export function isKVConfigured(): boolean {
  return Boolean(
    process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  );
}