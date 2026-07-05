export type PostStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "changes_requested";

export type VisualType = "image" | "carousel" | "video" | "document" | "text";

export interface Post {
  id: string;
  weekId: string; // ISO week, e.g. "2026-W29"
  weekLabel: string; // "Week of Jul 6 – Jul 12"
  scheduledFor: string; // ISO date "2026-07-08"
  dayLabel: string; // "Wed Jul 8"
  headline: string;
  body: string;
  hashtags: string[];
  visualType: VisualType;
  visualUrl?: string;
  visualAlt?: string;
  author: string;
  notes?: string;
  status: PostStatus;
  reviewedAt?: string;
  reviewedBy?: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeekGroup {
  weekId: string;
  weekLabel: string;
  rangeStart: string; // ISO date
  rangeEnd: string; // ISO date
  posts: Post[];
  counts: Record<PostStatus, number>;
  total: number;
  allApproved: boolean;
  hasPending: boolean;
}

export type NewPostInput = Omit<
  Post,
  | "id"
  | "weekId"
  | "weekLabel"
  | "dayLabel"
  | "status"
  | "createdAt"
  | "updatedAt"
>;