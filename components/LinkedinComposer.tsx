"use client";

import { useEffect, useRef, useState } from "react";

const MAX = 3000;

type VisualType = "image" | "carousel" | "video" | "document" | "text";

export function LinkedinComposer({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [body, setBody] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [author, setAuthor] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [visualType, setVisualType] = useState<VisualType>("text");
  const [assetName, setAssetName] = useState<string | null>(null);
  const [assetPreview, setAssetPreview] = useState<string | null>(null);
  const [visualAlt, setVisualAlt] = useState("");
  const [notes, setNotes] = useState("");
  const [showMeta, setShowMeta] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 280)}px`;
  }, [body, open]);

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
  const canStage = Boolean(body && scheduledFor && author) && !over;

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

  function clearAsset() {
    setAssetName(null);
    setAssetPreview(null);
    setVisualType("text");
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
      setError("Add the post copy, author, and a scheduled date.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: body.split("\n")[0].slice(0, 120),
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
        throw new Error(j.error ?? "Save failed");
      }
      setBody(""); setScheduledFor(""); setAuthor("");
      setHashtags(""); setVisualType("text"); setVisualAlt(""); setNotes("");
      setAssetName(null); setAssetPreview(null); setShowMeta(false);
      onCreated();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const charColor = over ? "#dc2626" : "#6b7280";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={() => !busy && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Create a post"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[570px] animate-slide-up overflow-hidden rounded-xl bg-white shadow-2xl"
        style={{ fontFamily: "var(--font-sans), -apple-system, system-ui, sans-serif" }}
      >
        {/* Header */}
        <header className="flex items-start justify-between px-6 pb-4 pt-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://thecloud-iq.io/wp-content/uploads/2024/11/FullLogo_Transparent_NoBuffer-4.png"
              alt="Cloud IQ"
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <button type="button" className="flex items-center gap-1 text-left" tabIndex={-1}>
                <span className="text-lg font-semibold text-[#111827]">Cloud IQ</span>
                <svg className="h-5 w-5 text-[#6b7280]" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" fillRule="evenodd" /></svg>
              </button>
              <span className="text-sm font-medium leading-tight text-[#6b7280]">Post to Anyone</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#6b7280] transition-colors hover:bg-[#f3f4f6]"
            aria-label="Close"
            disabled={busy}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          </button>
        </header>

        {/* Composer */}
        <main className="flex min-h-[200px] flex-col px-6">
          <textarea
            ref={taRef}
            className="w-full resize-none border-none py-2 text-xl text-[#6b7280] placeholder-[#9ca3af] outline-none"
            placeholder="What do you want to talk about?"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={MAX + 100}
            autoFocus
          />
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-[#9ca3af]">
              {body.length > 0 && `First line becomes the headline`}
            </span>
            <span style={{ color: charColor }}>
              {remaining < 300 && `${Math.max(remaining, 0)} left`}
            </span>
          </div>

          {/* Asset preview */}
          {assetPreview && (
            <div className="mt-3 overflow-hidden rounded-lg border border-[#e5e7eb]">
              <div className="flex items-center justify-between bg-[#f9fafb] px-4 py-2">
                <span className="truncate text-sm font-medium">{assetName}</span>
                <button type="button" className="text-sm font-medium text-[#0a66c2] hover:underline" onClick={clearAsset}>Remove</button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={assetPreview} alt={visualAlt || ""} className="max-h-[220px] w-full object-cover" />
            </div>
          )}

          {/* Dropzone */}
          {!assetPreview && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={
                "mt-3 flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 transition-colors " +
                (dragOver ? "border-[#0a66c2] bg-[#0a66c2]/5" : "border-[#e5e7eb] bg-[#f9fafb] hover:bg-[#f3f4f6]")
              }
            >
              <svg className="h-7 w-7 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></svg>
              <span className="text-sm text-[#111827]">Add a photo, video, or document</span>
              <span className="text-xs text-[#6b7280]">Or drag and drop</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*,application/pdf"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); }}
          />

          {/* Alt text */}
          {assetPreview && (
            <input
              className="mt-2 w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0a66c2]/30"
              value={visualAlt}
              onChange={(e) => setVisualAlt(e.target.value)}
              placeholder="Alt text"
            />
          )}
        </main>

        {/* Metadata toggle */}
        <div className="px-6">
          <button
            type="button"
            className="flex items-center gap-1 text-sm font-medium text-[#6b7280] hover:text-[#111827]"
            onClick={() => setShowMeta(!showMeta)}
          >
            <svg className={`h-4 w-4 transition-transform duration-200 ${showMeta ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            Scheduling & details
          </button>
        </div>

        {showMeta && (
          <div className="border-t border-[#f3f4f6] px-6 pb-2 pt-4">
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6b7280]">Author *</label>
                  <input
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0a66c2]/30"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Who wrote it"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6b7280]">Scheduled *</label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0a66c2]/30"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6b7280]">Hashtags</label>
                  <input
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0a66c2]/30"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    placeholder="#leadership, #product"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6b7280]">Note to approver</label>
                  <input
                    className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0a66c2]/30"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-3 rounded-lg bg-[#fef2f2] px-3 py-2 text-sm text-[#dc2626]">{error}</div>
        )}

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-[#f3f4f6] px-6 py-4">
          <div className="flex items-center gap-1">
            <button type="button" className="rounded-lg p-2 text-[#6b7280] hover:bg-[#f3f4f6] transition-colors" title="Add image" onClick={() => fileRef.current?.click()}>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            </button>
            <button type="button" className="rounded-lg p-2 text-[#6b7280] hover:bg-[#f3f4f6] transition-colors" title="Schedule">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            </button>
            <button type="button" className="rounded-lg p-2 text-[#6b7280] hover:bg-[#f3f4f6] transition-colors" title="Celebrate">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            </button>
            <button type="button" className="rounded-lg p-2 text-[#6b7280] hover:bg-[#f3f4f6] transition-colors" title="More">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6b7280]">
              {scheduledFor ? scheduledFor : ""}
            </span>
            <button
              type="button"
              onClick={stage}
              disabled={!canStage || busy}
              className={
                "rounded-full px-6 py-2 font-semibold transition-colors " +
                (canStage && !busy
                  ? "bg-[#0a66c2] text-white hover:bg-[#004182]"
                  : "bg-[#f3f4f6] text-[#9ca3af] cursor-not-allowed")
              }
            >
              {busy ? "Saving…" : "Schedule"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
