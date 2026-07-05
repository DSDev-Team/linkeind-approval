import type { Post } from "./types";
import { dayLabel, weekRangeLabel, weekKeyForDate, addDays, toISODate } from "./weeks";
import { nowISO, uid } from "./utils";

// Sample posts the approver can rehearse with. Replace with real content
// you stage via the "New post" form or the storage API.
type SeedSpec = {
  offsetDays: number; // days from the start of next week's Monday
  headline: string;
  body: string;
  hashtags: string[];
  visualType: Post["visualType"];
  visualUrl?: string;
  visualAlt?: string;
  author: string;
  notes?: string;
};

const specs: SeedSpec[] = [
  {
    offsetDays: 0,
    headline: "Monday mindset: ship the small thing",
    body:
      "Most teams stall because the next step looks too big.\n\nWe started writing down the single smallest forward motion we could make today — and then doing it before lunch.\n\nThree weeks in, momentum is compounding.\n\nWhat's your smallest forward motion today?",
    hashtags: ["#leadership", "#execution", "#mondaymotivation"],
    visualType: "image",
    visualUrl: "",
    visualAlt: "Minimalist desk with a single index card reading 'one thing'",
    author: "Content team",
    notes: "Pairs with the Q3 'bias for action' series.",
  },
  {
    offsetDays: 2,
    headline: "Behind the build: how we cut onboarding to 4 minutes",
    body:
      "We mapped every step of our onboarding and asked one question:\n\n'Would a new user understand why this step exists?'\n\nIf the answer was no, we cut it or rewrote it.\n\nResult: time-to-value dropped from 11 minutes to 4.\n\nThe full teardown is in the comments.",
    hashtags: ["#product", "#onboarding", "#ux"],
    visualType: "carousel",
    visualUrl: "",
    visualAlt: "6-slide carousel showing the onboarding flow before/after",
    author: "Maya, Product",
  },
  {
    offsetDays: 4,
    headline: "Hiring: Senior Brand Designer",
    body:
      "We're looking for a designer who treats type as a craft and brand systems as a sport.\n\nYou'll own visual identity end-to-end and partner with marketing on campaigns.\n\nRemote, async-friendly, 4-day work week.\n\nDetails + apply below.",
    hashtags: ["#hiring", "#designjobs", "#remotework"],
    visualType: "image",
    visualUrl: "",
    visualAlt: "Open role poster, brand color block, role title and apply URL",
    author: "Jordan, People",
    notes: "Confirm salary band before approving.",
  },
  {
    offsetDays: 1,
    headline: "The week after: customer story drop",
    body:
      "We interviewed 12 of our longest-tenured customers about what kept them here.\n\nThe throughline wasn't features — it was feeling heard.\n\nTomorrow we publish Part 1 of the series. Three short clips follow across the week.",
    hashtags: ["#customerlove", "#storytelling"],
    visualType: "video",
    visualUrl: "",
    visualAlt: "60s clip — customer quote over brand animation",
    author: "Sam, Marketing",
  },
  {
    offsetDays: 3,
    headline: "Friday read: notes on craft",
    body:
      "Reading list for the long weekend.\n\nThree essays on what it means to do good work that lasts — and one quiet reminder that rest is part of the practice.\n\n(thread with links below)",
    hashtags: ["#reading", "#craft", "#fridayread"],
    visualType: "document",
    visualUrl: "",
    visualAlt: "PDF-style cover image, three essay titles listed",
    author: "Content team",
  },
];

function buildPost(spec: SeedSpec, weekStart: Date): Post {
  const scheduled = addDays(weekStart, spec.offsetDays);
  const iso = toISODate(scheduled);
  return {
    id: uid("post"),
    weekId: weekKeyForDate(scheduled).weekId,
    weekLabel: weekRangeLabel(weekStart),
    scheduledFor: iso,
    dayLabel: dayLabel(iso),
    headline: spec.headline,
    body: spec.body,
    hashtags: spec.hashtags,
    visualType: spec.visualType,
    visualUrl: spec.visualUrl,
    visualAlt: spec.visualAlt,
    author: spec.author,
    notes: spec.notes,
    status: "pending",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
}

// Seeds posts across "next week" and "the week after next."
export function buildSeedPosts(from: Date = new Date()): Post[] {
  const nextMon = addDays(weekKeyForDate(from).start, 7);
  const afterMon = addDays(nextMon, 7);
  const nextWeek = specs.slice(0, 3).map((s) => buildPost(s, nextMon));
  const afterWeek = specs.slice(3).map((s) => buildPost(s, afterMon));
  return [...nextWeek, ...afterWeek];
}