import { cn } from "@/lib/utils";
import type { Post } from "@/lib/types";
import { visualTypeIcon } from "./Icons";

const FALLBACK_AVATAR = "in";

function initials(name: string): string {
  return name.charAt(0);
}

// Returns up to 4 media URLs from a comma-or-newline-separated visualUrl.
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
        className="grid place-items-center rounded-md border bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
        style={{ aspectRatio: "1.91 / 1" }}
        aria-label={alt ?? `No ${visualType} attached yet`}
        role="img"
      >
        <span className="flex flex-col items-center gap-2">
          {visualTypeIcon(visualType, 30)}
          <span className="font-mono text-[11px] uppercase tracking-wide">
            {visualType} · pending asset
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
    <div className={cn("grid w-full gap-0.5 overflow-hidden rounded-md border border-[var(--color-border)] bg-white", layout.grid)}>
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

export function LinkedinPreview({
  post,
  authorName,
  authorHeadline = "Content lead — your company",
  showAuthor = true,
}: {
  post: Post;
  authorName?: string;
  authorHeadline?: string;
  showAuthor?: boolean;
}) {
  const name = authorName ?? post.author;
  const urls = mediaList(post.visualUrl);
  const bodyParagraphs = post.body.split("\n");

  return (
    <article className="bg-white text-[var(--color-foreground)]">
      {showAuthor && (
        <header className="flex items-start gap-3 px-5 pt-4">
          <span
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-base font-semibold text-white"
            style={{ background: "linear-gradient(140deg,#1E3A5F,#2563EB)" }}
            aria-hidden
          >
            {initials(name).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 text-[15px] font-semibold leading-tight">
              <span className="truncate">{name}</span>
              <span className="text-[var(--color-muted-foreground)]">·</span>
              <span className="text-[var(--color-muted-foreground)]">3rd</span>
            </div>
            <div className="truncate text-[13px] text-[var(--color-muted-foreground)]">
              {authorHeadline}
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-[13px] text-[var(--color-muted-foreground)]">
              <span>Scheduled for {post.dayLabel}</span>
              <span aria-hidden> · </span>
              <span>🌞</span>
              <span className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-[11px] ring-1 ring-[var(--color-border)]">
                <GlobeInline />
                Anyone
              </span>
            </div>
          </div>
          <button type="button" className="-mr-1 text-[var(--color-muted-foreground)]" aria-label="More actions">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
              <circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" />
            </svg>
          </button>
        </header>
      )}

      <div className="px-5 pt-3 whitespace-pre-line text-[15px] leading-[1.55]">
        {bodyParagraphs.map((p, i) => (
          <p key={i} className={i > 0 ? "mt-2" : ""}>
            {renderHashtagsInline(p, post.hashtags)}
          </p>
        ))}
      </div>

      {(urls.length > 0 || post.visualType !== "text") && (
        <div className="mt-3">
          <MediaGrid urls={urls} visualType={post.visualType} alt={post.visualAlt} />
        </div>
      )}

      <footer className="hidden items-center justify-between border-t border-[var(--color-border)] px-5 py-2 text-[var(--color-muted-foreground)] sm:flex">
        <Reactions />
      </footer>
    </article>
  );
}

// Renders a paragraph, turning hashtags into blue inline links (LinkedIn look).
function renderHashtagsInline(text: string, _tags: string[]) {
  if (!text) return null;
  const parts = text.split(/(#[A-Za-z0-9_]+)/g);
  return parts.map((part, i) =>
    part.startsWith("#") ? (
      <span key={i} className="font-semibold text-[#0a66c2] hover:underline cursor-pointer">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function GlobeInline() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}

function Reactions() {
  const Item = ({ label, icon }: { label: string; icon: React.ReactNode }) => (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 text-[13px] font-medium hover:bg-[var(--color-muted)] rounded">
      {icon}
      <span className="hidden md:inline">{label}</span>
    </span>
  );
  return (
    <>
      <Item label="Like" icon={<ThumbIcon />} />
      <Item label="Comment" icon={<CommentIcon />} />
      <Item label="Repost" icon={<RepostIcon />} />
      <Item label="Send" icon={<SendIcon />} />
    </>
  );
}

function ThumbIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3Zm0 0 4-7a2 2 0 0 1 2 2v4h6a2 2 0 0 1 2 2l-2 7a2 2 0 0 1-2 1.5H7" />
    </svg>
  );
}
function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12Z" />
    </svg>
  );
}
function RepostIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m17 2 4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
    </svg>
  );
}