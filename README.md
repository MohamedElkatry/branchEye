# BranchEye

A branch performance dashboard: overview KPIs, performance, financials, forecast, alerts and reports, plus a settings screen.

**Live demo:** https://mohamedelkatry.github.io/branchEye/

## Stack

- React + Vite
- Tailwind CSS v4
- JavaScript (with a TypeScript config in place)

## Run locally

```bash
npm install
npm run dev
```

## Structure

- `src/components/` — one component per dashboard view (Performance, Financials, Alerts, Reports, Settings) plus the shared menu, icons and sales chart
- `src/dashboardData.js` — the demo data the views render
- `public/figma/` — icons exported from the design file

The views run on static demo data, not a live API.
