"use client";

import { useEffect, useRef, useState } from "react";

const MAX = 3000;

type VisualType = "image" | "carousel" | "video" | "document" | "text";

// LinkedIn-style "Create a post" modal. Faithful to LinkedIn's composer:
//  - header with close X and "Create a post" title
//  - author row with avatar + "Anyone" pill
//  - big auto-grow textarea with placeholder
//  - char/emoji/hashtag tool row
//  - "Add to your post" toolbar (Photo, Video, Document, Award, Poll, etc.)
//  - drag-and-drop / paste / pick file for the visual asset
//  - blue "Post" button (here: "Stage post")
export function LinkedinComposer({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [author, setAuthor] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [visualType, setVisualType] = useState<VisualType>("text");
  const [assetName, setAssetName] = useState<string | null>(null);
  const [assetPreview, setAssetPreview] = useState<string | null>(null);
  const [visualAlt, setVisualAlt] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"composer" | "schedule">("composer");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setView("composer");
      setError(null);
    }
  }, [open]);

  // Auto-grow textarea
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 460)}px`;
  }, [body, open, view]);

  // ESC closes
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  const remaining = MAX - body.length;
  const over = body.length > MAX;
  const canStage = Boolean(headline && body && scheduledFor && author) && !over;

  function pickFile(file: File) {
    const isImg = file.type.startsWith("image/");
    const isVid = file.type.startsWith("video/");
    const isDoc = !isImg && !isVid;
    setVisualType(isImg ? "image" : isVid ? "video" : isDoc ? "document" : "text");
    setAssetName(file.name);
    const reader = new FileReader();
    reader.onload = () => setAssetPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) pickFile(f);
  }

  async function stage() {
    setError(null);
    if (!canStage) {
      setError("Headline, copy, author and a scheduled date are required.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline,
          body,
          scheduledFor,
          author,
          hashtags: hashtags
            .split(/[\n,]/)
            .map((h) => h.trim())
            .filter(Boolean),
          visualType,
          visualUrl: assetPreview ?? undefined,
          visualAlt: visualAlt || undefined,
          notes: notes || undefined,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Stage failed");
      }
      // reset
      setHeadline(""); setBody(""); setScheduledFor(""); setAuthor("");
      setHashtags(""); setVisualType("text"); setVisualAlt(""); setNotes("");
      setAssetName(null); setAssetPreview(null);
      onCreated();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/55 p-3 backdrop-blur-sm animate-fade-in sm:p-6"
      onClick={() => !busy && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Create a post"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="mt-4 w-full max-w-[640px] animate-slide-up overflow-hidden rounded-xl bg-white text-[#000000e6] shadow-2xl sm:mt-10"
        style={{ fontFamily: "var(--font-sans), -apple-system, system-ui, sans-serif" }}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#0000001a] px-5 py-3">
          <div className="flex items-center gap-2 text-[#000000e6]">
            {view === "schedule" && (
              <button
                type="button"
                onClick={() => setView("composer")}
                className="-ml-1 rounded p-1 text-[#00000099] hover:bg-[#0000000d]"
                aria-label="Back to composer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
            )}
            <h2 className="text-base font-semibold">Create a post</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 rounded p-1 text-[#00000099] hover:bg-[#0000000d]"
            aria-label="Close"
            disabled={busy}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </header>

        {view === "composer" ? (
          <div className="px-5 pb-5">
            {/* Author row */}
            <div className="flex items-center gap-3 py-3">
              <span
                className="grid h-12 w-12 place-items-center rounded-full text-base font-semibold text-white"
                style={{ background: "linear-gradient(140deg,#1E3A5F,#2563EB)" }}
                aria-hidden
              >
                {(author || "A").charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-semibold">{author || "Author name"}</div>
                <button
                  type="button"
                  className="mt-0.5 inline-flex items-center gap-1 rounded border border-[#0000001a] px-2 py-0.5 text-[13px] text-[#000000e6] hover:bg-[#0000000d]"
                  onClick={() => setView("schedule")}
                  title="Schedule + author details"
                >
                  <GlobeSm /> Anyone
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
              </div>
            </div>

            {/* Headline */}
            <label className="block pb-1 pt-1 font-mono text-[11px] uppercase tracking-wide text-[#00000099]">
              Headline / hook
            </label>
            <input
              className="mb-2 w-full rounded-md border border-[#0000001a] px-3 py-2 text-[15px] outline-none focus:ring-2 focus:ring-[#0a66c2]/40"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="One line that stops the scroll…"
              maxLength={140}
            />

            {/* Composer textarea */}
            <textarea
              ref={taRef}
              className="min-h-[140px] w-full resize-none border-0 bg-transparent py-1 text-[15px] leading-[1.55] outline-none placeholder:text-[#00000073]"
              placeholder="What do you want to talk about?"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={MAX + 100}
            />

            <div className="flex items-center justify-between pt-1 text-[12px] text-[#00000099]">
              <span className="font-mono">{body.length} chars</span>
              <span className={over ? "font-semibold text-[#cc3b1d]" : "font-mono"}>{remaining} left</span>
            </div>

            {/* Asset dropzone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`mt-3 rounded-lg border-2 border-dashed px-4 py-4 ${
                dragOver ? "border-[#0a66c2] bg-[#0a66c2]/5" : "border-[#0000001a] bg-[#f3f4f5]/60"
              }`}
            >
              {assetPreview && assetPreview.startsWith("data:image") ? (
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={assetPreview} alt="" className="h-16 w-16 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-medium">{assetName}</div>
                    <button
                      type="button"
                      className="text-[13px] text-[#0a66c2] hover:underline"
                      onClick={() => { setAssetName(null); setAssetPreview(null); setVisualType("text"); }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : assetName ? (
                <div className="flex items-center gap-3">
                  <span className="grid h-16 w-16 place-items-center rounded bg-[#0000000d] text-[#00000099]">
                    <DocGlyph />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-medium">{assetName}</div>
                    <div className="text-[12px] text-[#00000099]">{visualType}</div>
                    <button
                      type="button"
                      className="text-[13px] text-[#0a66c2] hover:underline"
                      onClick={() => { setAssetName(null); setAssetPreview(null); setVisualType("text"); }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full flex-col items-center gap-1 text-[#00000099]"
                >
                  <MediaIcon />
                  <span className="text-[13px]">Drag a photo/video here, or <span className="text-[#0a66c2] hover:underline">select from device</span></span>
                  <span className="text-[11px] text-[#00000073]">Tip: drag a carousel&apos;s slides as separate images.</span>
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) pickFile(f);
                }}
              />
            </div>

            {/* Alt text */}
            {assetName && (
              <div className="mt-2">
                <input
                  className="w-full rounded-md border border-[#0000001a] px-3 py-2 text-[14px] outline-none focus:ring-2 focus:ring-[#0a66c2]/40"
                  value={visualAlt}
                  onChange={(e) => setVisualAlt(e.target.value)}
                  placeholder="Alt text for the visual (for the approver)"
                />
              </div>
            )}

            {/* Add to your post toolbar */}
            <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-[#0000001a] pt-3 text-[#00000099]">
              <AddTool icon={<PhotoIcon />} label="Photo" active={visualType === "image"} onClick={() => { setVisualType("image"); fileRef.current?.click(); }} />
              <AddTool icon={<VideoIcon />} label="Video" active={visualType === "video"} onClick={() => { setVisualType("video"); fileRef.current?.click(); }} />
              <AddTool icon={<DocIcon />} label="Document" active={visualType === "document"} onClick={() => { setVisualType("document"); fileRef.current?.click(); }} />
              <AddTool icon={<CarouselGlyph />} label="Carousel" active={visualType === "carousel"} onClick={() => setVisualType("carousel")} />
              <AddTool icon={<PollGlyph />} label="Poll" onClick={() => {}} />
              <AddTool icon={<AwardGlyph />} label="Celebrate" onClick={() => {}} />
            </div>

            {error && (
              <div className="mt-3 rounded-md bg-[#fef2f2] px-3 py-2 text-[13px] text-[#cc3b1d]">{error}</div>
            )}

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between gap-2">
              <div className="text-[12px] text-[#00000099]">
                {scheduledFor ? `→ scheduled ${scheduledFor}` : "Add scheduling + author →"}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-full px-3 py-1.5 text-[14px] font-semibold text-[#0a66c2] hover:bg-[#0a66c2]/10"
                  onClick={() => setView("schedule")}
                >
                  Schedule
                </button>
                <button
                  type="button"
                  onClick={stage}
                  disabled={!canStage || busy}
                  className="rounded-full bg-[#0a66c2] px-5 py-1.5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#004182] disabled:cursor-not-allowed disabled:bg-[#00000033]"
                >
                  {busy ? "Staging…" : "Stage post"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <ScheduleView
            scheduledFor={scheduledFor}
            setScheduledFor={setScheduledFor}
            author={author}
            setAuthor={setAuthor}
            hashtags={hashtags}
            setHashtags={setHashtags}
            notes={notes}
            setNotes={setNotes}
            onBack={() => setView("composer")}
            onStage={stage}
            busy={busy}
            canStage={canStage}
            error={error}
          />
        )}
      </div>
    </div>
  );
}

function ScheduleView(props: {
  scheduledFor: string;
  setScheduledFor: (v: string) => void;
  author: string;
  setAuthor: (v: string) => void;
  hashtags: string;
  setHashtags: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  onBack: () => void;
  onStage: () => void;
  busy: boolean;
  canStage: boolean;
  error: string | null;
}) {
  return (
    <div className="px-5 pb-5 pt-2">
      <div className="flex flex-col gap-3">
        <div className="grid gap-2">
          <label className="block text-[11px] font-medium uppercase tracking-wide text-[#00000099]">
            Author *
          </label>
          <input
            className="w-full rounded-md border border-[#0000001a] px-3 py-2 text-[15px] outline-none focus:ring-2 focus:ring-[#0a66c2]/40"
            value={props.author}
            onChange={(e) => props.setAuthor(e.target.value)}
            placeholder="Who prepared this post"
          />
        </div>
        <div className="grid gap-2">
          <label className="block text-[11px] font-medium uppercase tracking-wide text-[#00000099]">
            Scheduled date *
          </label>
          <input
            type="date"
            className="w-full rounded-md border border-[#0000001a] px-3 py-2 text-[15px] outline-none focus:ring-2 focus:ring-[#0a66c2]/40"
            value={props.scheduledFor}
            onChange={(e) => props.setScheduledFor(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <label className="block text-[11px] font-medium uppercase tracking-wide text-[#00000099]">
            Hashtags (comma separated)
          </label>
          <input
            className="w-full rounded-md border border-[#0000001a] px-3 py-2 text-[15px] outline-none focus:ring-2 focus:ring-[#0a66c2]/40"
            value={props.hashtags}
            onChange={(e) => props.setHashtags(e.target.value)}
            placeholder="#leadership, #product"
          />
        </div>
        <div className="grid gap-2">
          <label className="block text-[11px] font-medium uppercase tracking-wide text-[#00000099]">
            Internal note for approver
          </label>
          <textarea
            className="min-h-[5rem] w-full resize-y rounded-md border border-[#0000001a] px-3 py-2 text-[14px] outline-none focus:ring-2 focus:ring-[#0a66c2]/40"
            value={props.notes}
            onChange={(e) => props.setNotes(e.target.value)}
            placeholder="Anything the approver should know before signing off"
          />
        </div>

        {props.error && (
          <div className="rounded-md bg-[#fef2f2] px-3 py-2 text-[13px] text-[#cc3b1d]">{props.error}</div>
        )}

        <div className="mt-2 flex items-center justify-end gap-2 border-t border-[#0000001a] pt-4">
          <button
            type="button"
            onClick={props.onBack}
            className="rounded-full px-3 py-1.5 text-[14px] font-semibold text-[#0a66c2] hover:bg-[#0a66c2]/10"
          >
            Back
          </button>
          <button
            type="button"
            onClick={props.onStage}
            disabled={!props.canStage || props.busy}
            className="rounded-full bg-[#0a66c2] px-5 py-1.5 text-[14px] font-semibold text-white hover:bg-[#004182] disabled:cursor-not-allowed disabled:bg-[#00000033]"
          >
            {props.busy ? "Staging…" : "Stage post"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddTool({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] font-medium hover:bg-[#0000000d] ${active ? "text-[#0a66c2]" : "text-[#00000099]"}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// — LinkedIn-style glyphs (interpreted, not copied) —

function GlobeSm() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>;
}
function PhotoIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></svg>;
}
function VideoIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="2" y="6" width="14" height="12" rx="2" /><path d="m22 8-6 4 6 4V8Z" /></svg>;
}
function DocIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h6" /></svg>;
}
function CarouselGlyph() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="6" y="4" width="12" height="16" rx="2" /><path d="M3 8v8M21 8v8" /></svg>;
}
function PollGlyph() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 21V10M12 21V4M19 21v-7" /></svg>;
}
function AwardGlyph() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="8" r="5" /><path d="M8.5 13 7 22l5-3 5 3-1.5-9" /></svg>;
}
function MediaIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></svg>;
}
function DocGlyph() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>;
}