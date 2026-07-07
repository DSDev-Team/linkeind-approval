# Carousel template — data schema

You produce carousels by editing **one block** in `carousel-template.html`: the `window.CAROUSEL` object inside `<script id="carousel-data">`. Change **only** that block (and `window.CONTACT` never changes). Do **not** touch the CSS or the render script — the design is fixed.

```js
window.CAROUSEL = {
  theme: "sunset",   // pick ONE at random: "sunset" | "scale" | "mesh" | "daylight"
  slides: [ /* 5 to 8 slide objects, see below */ ]
};
```

**Rules**
- **3 or 4 slides. Hard maximum = 4 slides per carousel** (the approval app previews at most 4). The **first** slide must be `type:"cover"`. The **last** must be `type:"cta"`. So you get 1–2 middle content slides.
- Contact details (site, phone, email, address) are added **automatically** to the first and last slide only. Never put contact info in the middle.
- Keep every string SHORT — a headline is one line, a supporting line is one sentence, a list item is a few words. Long text overflows the slide.
- One heading per slide. Never add a small ALL-CAPS kicker above a heading (that reads as AI slop).

**The 6 slide types** (use the ones that fit the article; you don't need all of them):

```js
// 1. cover — always slide 1
{ type:"cover", heading:"Short punchy headline.", sub:"One supporting line." }

// 2. stats — up to 3 number+caption rows (last row auto-highlighted in the accent colour)
{ type:"stats", items:[ {n:"Oct 2024", t:"Short caption."}, {n:"Now", t:"Short caption."} ] }

// 3. bignum — one huge number
{ type:"bignum", num:"70%", body:"One line explaining it.", source:"Short source note." }

// 4. list — a short heading + 3-5 bullets. tone:"danger" = red dots (problems), tone:"accent" = blue/cyan dots (good things)
{ type:"list", tone:"danger", heading:"Short heading.", items:["Point one","Point two","Point three"] }

// 5. statement — a single sharp heading + one short paragraph
{ type:"statement", heading:"A sharp statement.", body:"One or two short sentences." }

// 6. cta — always the last slide. Optional mini "card" of status rows.
{ type:"cta", heading:"Closing line or question.", body:"One line tying back to Cloud-IQ.",
  cta:"See it in Cloud-IQ",
  card:[ {id:"ICCID ···· 4471", tag:"2G · at risk", tone:"danger"},
         {id:"ICCID ···· 2210", tag:"LTE-M · ok", tone:"accent"} ] }  // card is optional
```

**Colour meaning (do not change the palette):** the accent colour = positive/neutral emphasis; the red = danger/at-risk only. Use `tone:"danger"` only for genuine risk/problem items.

**Themes** — all four are the SAME layout, different skin. Pick one at random per carousel so the feed has variety:
- `sunset` — dark blue gradient, white text (bold/high-impact)
- `scale` — light/white with faint line-work, blue headings
- `mesh` — light with the network-mesh background image
- `daylight` — soft light-blue gradient
