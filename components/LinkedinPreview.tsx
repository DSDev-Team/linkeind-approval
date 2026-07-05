import { cn } from "@/lib/utils";
import type { Post } from "@/lib/types";
import { visualTypeIcon } from "./Icons";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.charAt(0).toUpperCase();
}

export function mediaList(url?: string): string[] {
  if (!url) return [];
  return url
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
}

export function MediaGrid({
  urls,
  visualType,
  alt,
}: {
  urls: string[];
  visualType: string;
  alt?: string;
}) {
  if (urls.length === 0) {
    return (
      <div
        className="grid place-items-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
        style={{ aspectRatio: "1.91 / 1" }}
        aria-label={alt ?? `No ${visualType} attached`}
        role="img"
      >
        <span className="flex flex-col items-center gap-2 opacity-60">
          {visualTypeIcon(visualType, 28)}
          <span className="text-[11px] uppercase tracking-wide">
            {visualType} not attached
          </span>
        </span>
      </div>
    );
  }

  const styles = {
    1: { grid: "grid-cols-1", tiles: [{ className: "aspect-[1.91/1]", span: "" }] },
    2: {
      grid: "grid-cols-2",
      tiles: [{ className: "aspect-square", span: "" }, { className: "aspect-square", span: "" }],
    },
    3: {
      grid: "grid-cols-2 grid-rows-2",
      tiles: [
        { className: "h-full", span: "row-span-2" },
        { className: "aspect-[1.91/1]", span: "" },
        { className: "aspect-[1.91/1]", span: "" },
      ],
    },
    4: {
      grid: "grid-cols-2 grid-rows-2",
      tiles: [{ className: "aspect-square", span: "" }, { className: "aspect-square", span: "" }, { className: "aspect-square", span: "" }, { className: "aspect-square", span: "" }],
    },
  } as const;

  type Style = { grid: string; tiles: { className: string; span: string }[] };
  const layout: Style = (styles as unknown as Record<number, Style>)[urls.length] ?? (styles as unknown as Record<number, Style>)[1];

  return (
    <div className={cn("grid w-full gap-0.5 overflow-hidden rounded-lg border border-[var(--color-border)] bg-white", layout.grid)}>
      {urls.slice(0, layout.tiles.length).map((url, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={url}
          alt={alt ? `${alt} ${i + 1}` : ""}
          className={cn("h-full w-full object-cover", layout.tiles[i].className, layout.tiles[i].span)}
        />
      ))}
    </div>
  );
}

// A clean preview of how the post will read on LinkedIn — author, copy,
// media. No fake reactions, no fake connection badges, no "Anyone" pill.
// This is an approval tool: show the content the approver needs to judge.
export function LinkedinPreview({
  post,
  authorName,
}: {
  post: Post;
  authorName?: string;
}) {
  const name = authorName ?? post.author;
  const urls = mediaList(post.visualUrl);
  const paragraphs = post.body.split("\n");

  return (
    <article className="bg-white">
      <header className="flex items-start gap-3 px-5 pt-5">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-semibold text-white"
          style={{ background: "linear-gradient(140deg,#1E3A5F,#2563EB)" }}
          aria-hidden
        >
          {initials(name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold text-[#0a0a0a]">
            {name}
          </div>
          <div className="mt-0.5 text-[13px] text-[var(--color-muted-foreground)]">
            Scheduled {post.dayLabel}
          </div>
        </div>
      </header>

      <div className="px-5 pt-3 whitespace-pre-line text-[15px] leading-[1.55] text-[#0a0a0a]">
        {paragraphs.map((p, i) => (
          <p key={i} className={i > 0 ? "mt-2.5" : ""}>
            {renderHashtagsInline(p)}
          </p>
        ))}
      </div>

      {(urls.length > 0 || post.visualType !== "text") && (
        <div className="px-5 pb-5 pt-4">
          <MediaGrid urls={urls} visualType={post.visualType} alt={post.visualAlt} />
        </div>
      )}
    </article>
  );
}

function renderHashtagsInline(text: string) {
  if (!text) return null;
  const parts = text.split(/(#[A-Za-z0-9_]+)/g);
  return parts.map((part, i) =>
    part.startsWith("#") ? (
      <span key={i} className="font-semibold text-[#0a66c2]">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}