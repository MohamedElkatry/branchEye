---
name: responsive-layout
description: Makes the BranchEye React + Tailwind 4 dashboard responsive from 375px phones to 1440px desktop without changing the approved Figma desktop look. Use when the user asks for responsiveness, mobile/tablet layout, "responsive", "ريسبونسف", or reports overflow, clipped content, or horizontal scrolling on small screens.
disable-model-invocation: true
---

# Responsive Layout (BranchEye)

The Figma design is desktop-only (1440px). Desktop at `xl` (≥1280px) must stay pixel-identical to the current UI. All responsive work happens by adding smaller-breakpoint behavior, never by changing the desktop values.

## Rules

1. **Desktop is frozen.** Keep every existing desktop class. Move a fixed value behind a breakpoint instead of replacing it: `grid-cols-4` → `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`, `w-[480px]` → `w-full sm:w-[480px]`.
2. **Use Tailwind default breakpoints only:** `sm` 640, `md` 768, `lg` 1024, `xl` 1280. No custom media queries in CSS unless Tailwind cannot express it.
3. **Mobile-first classes, desktop result unchanged.** The unprefixed class is the phone layout; the largest prefix must equal the original desktop class.
4. **Do not invent content.** No new sections, labels, or icons. Only reflow, hide, or collapse what exists.
5. **No horizontal page scroll** at any width. Only tables and wide charts may scroll horizontally, inside their own `overflow-x-auto` wrapper.
6. **Touch targets** stay at least 40px tall on phones.
7. Reply to the user in Egyptian Arabic, as in the rest of this project.

## Project-specific patterns

| Area | File | Phone/tablet behavior |
|------|------|------------------------|
| Sidebar (`w-[218px]` / collapsed `w-[72px]`) | `src/App.jsx` | Below `lg`: hidden; the header button opens it as a fixed overlay drawer (`fixed inset-y-0 left-0 z-50`) with a dark backdrop that closes on click and on Escape. At `lg`+: current sticky sidebar and collapse toggle unchanged. |
| Header (search, notifications, Ask AI) | `src/App.jsx` | Below `md`: hide the search input behind a search icon button; keep notifications and Ask AI. Padding `px-4 md:px-6`. |
| Main padding `px-6 pb-6 pt-[23px]` | `src/App.jsx` | `px-4 md:px-6`, keep `pt-[23px]`. |
| KPI cards and template cards (`grid-cols-4`, `grid-cols-5`) | all views | `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4` (or `xl:grid-cols-5`). |
| Two-column chart rows | Overview, Performance, Financials | Stack below `xl`: `flex-col xl:flex-row` or `grid-cols-1 xl:grid-cols-[...]`. |
| Page toolbars (tabs + buttons, search + filters) | all views | `flex-wrap gap-3`; search becomes `w-full sm:w-[198px]`. |
| Tables | Overview, Performance, Financials, Settings, Reports | Keep `useResizableColumns` from `src/components/columnResize.jsx` and the `overflow-x-auto` wrapper. Never shrink columns below the 72px resize minimum; let the wrapper scroll. |
| Right drawers (`w-[480px]`, Ask AI `w-[316px]`/`w-[480px]`) | `ReportsView.jsx`, `App.jsx` | `w-full sm:w-[480px]` (or `sm:w-[316px]`). |
| Centered modals (`w-[597px]`, settings overlay) | `ReportsView.jsx`, `SettingsView.jsx` | `w-full max-w-[597px]` plus outer `p-4`; body `max-h-[calc(100vh-2rem)] overflow-y-auto`. |
| Charts (`SalesChart.jsx`, SVG charts) | views | Use `viewBox` + `w-full h-auto`; if labels collide below `md`, wrap in `overflow-x-auto` with a `min-w-[560px]` inner box. |
| Two-field rows (`grid-cols-2` inside forms) | drawers, modals | `grid-cols-1 sm:grid-cols-2`. |

## Workflow

Copy this checklist and track progress:

```
- [ ] 1. Audit: list fixed widths, grid-cols, and flex rows per file
- [ ] 2. Shell: sidebar drawer, header, main padding (App.jsx)
- [ ] 3. Views one at a time: Overview, Performance, Financials, Alerts, Reports, Settings
- [ ] 4. Overlays: drawers, modals, Ask AI, menus/popovers stay inside the viewport
- [ ] 5. Verify every width below, fix, re-verify
- [ ] 6. Confirm 1440px still matches the previous desktop exactly
```

**Step 1 – Audit.** Find candidates with Grep in `src/`:
`w-\[\d{3,4}px\]`, `min-w-\[`, `grid-cols-\d`, `h-screen`, `whitespace-nowrap`, `absolute .*right-0`.

**Step 5 – Verify** in the browser (dev server `npx vite --host 127.0.0.1 --port 5173`). For each width 375, 768, 1024, 1280, 1440: set `Emulation.setDeviceMetricsOverride` (height 900, deviceScaleFactor 1, mobile true below 768), visit every nav page and open each drawer/modal, then run this overflow check with `Runtime.evaluate`:

```js
(() => {
  const vw = document.documentElement.clientWidth;
  const bad = [...document.querySelectorAll("body *")].filter((el) => {
    const r = el.getBoundingClientRect();
    if (!r.width || el.closest(".overflow-x-auto")) return false;
    return r.right > vw + 1 || r.left < -1;
  });
  return { pageScroll: document.documentElement.scrollWidth > vw, count: bad.length,
    sample: bad.slice(0, 8).map((el) => `${el.tagName}.${String(el.className).slice(0, 60)}`) };
})()
```

Pass criteria: `pageScroll` is `false` and `count` is `0` (ignore elements inside closed overlays). Take a screenshot at 375 and 768 for each page. Clear the override with `Emulation.clearDeviceMetricsOverride` and unlock the browser when done.

**Step 6 – Desktop regression.** At 1440, compare screenshots of every page with the pre-change state. Any difference means a desktop class was changed; restore it behind the `xl:` prefix.

## Reporting

Tell the user, in Egyptian Arabic: which pages were adapted, the widths tested, and anything left scrolling on purpose (tables, wide charts). If a layout decision is not obvious from the design (for example, what to hide on phones), ask with a screenshot instead of guessing.
