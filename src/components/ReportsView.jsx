import { useEffect, useMemo, useState } from "react";

const templates = [
  {
    title: "Executive P&L Summary",
    body: "Sales, costs, and operating profit vs. budget.",
    icon: "coins",
  },
  {
    title: "Branch Profitability Ranking",
    body: "Branch margins and profit performance ranking.",
    icon: "branch",
  },
  {
    title: "COGS & Waste Audit",
    body: "Raw material costs and food waste breakdown.",
    icon: "box",
  },
  {
    title: "Financial Forecast Outlook",
    body: "3 - 6 month revenue and profit projections.",
    icon: "trend",
  },
  {
    title: "Executive P&L — Riyadh Region",
    body: "Custom Sales, costs, and operating profit vs. budget.",
    icon: "settings",
    custom: true,
  },
  {
    title: "P&L & Cost Breakdown",
    body: "Custom Net profit, gross margins & expense distribution",
    icon: "settings",
    custom: true,
  },
];

const history = [
  ["Monthly Executive P&L", "All Branches", "Auto-Scheduled", "Private", "Nov 01, 2026", "PDF"],
  ["Weekly COGS & Waste Audit", "All Branches", "You", "Private", "Nov 01, 2026", "XLSX"],
  ["Branch Profitability Ranking", "All Branches", "You", "Private", "Nov 01, 2026", "XLSX"],
  ["Daily Sales Snapshot", "Riyadh 01, Jeddah 02", "You", "Private", "Nov 01, 2026", "PDF"],
  ["Financial Forecast Outlook", "Jeddah 01", "Finance Manager", "Shared(2)", "Nov 01, 2026", "XLSX"],
  ["Executive P&L Summary", "All Branches", "Finance Manager", "Shared(3)", "Nov 01, 2026", "XLSX"],
  ["Branch Profitability Ranking", "All Branches", "You", "Private", "Oct 01, 2026", "XLSX"],
];

const schedules = [
  ["COGS & Waste Audit", "Weekly · Sunday", "09:00 AM", "Riyadh 01, Jeddah 02", "Private", "Nov 20, 2026", "PDF"],
  ["Daily Sales Snapshot", "Weekly · Sunday", "09:00 AM", "All Branches", "Private", "Nov 25, 2026", "XLSX"],
  ["Monthly Executive P&L", "Monthly · 1st", "09:00 AM", "All Branches", "Private", "Dec 01, 2026", "XLSX"],
  ["Branch Profitability Ranking", "Monthly · 1st", "09:00 AM", "All Branches", "Shared(2)", "Dec 01, 2026", "PDF"],
];

const previewRows = [
  ["Riyadh 01", "1,510K", "430K", "350K", "180K", "437K", "28.9%"],
  ["Jeddah 01", "2,120K", "580K", "410K", "250K", "716K", "33.8%"],
  ["Dammam 01", "910K", "260K", "240K", "105K", "228K", "25.1%"],
  ["Jeddah 02", "910K", "260K", "240K", "105K", "228K", "25.1%"],
  ["Total", "3,530K", "990K", "910K", "420K", "923K", "26.1%"],
];

const metricGroups = ["Sales Metrics", "Cost Metrics", "Profitability", "Operations & Labor"];

function Badge({ children, tone = "gray" }) {
  const toneClass = tone === "blue" ? "bg-[#E3ECF2] text-[#4280A7]" : "bg-[#F6F6F6] text-[#4E505A]";
  return (
    <span className={`inline-flex h-6 items-center rounded-md px-2 text-[12px] font-medium leading-[18px] ${toneClass}`}>
      {children}
    </span>
  );
}

const sources = ["All Sources", "Created by Me", "Shared with Me", "Auto-Scheduled"];

function IconButton({ label, onClick, children }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="grid size-8 place-items-center rounded-lg border border-[#E2DFDF] bg-white text-ink hover:bg-[#F8F6F6]">
      {children}
    </button>
  );
}

function MenuGlyph({ name }) {
  const common = { viewBox: "0 0 24 24", className: "size-4", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (name === "trash") {
    return <svg {...common}><path d="M5 7h14M9 7V5h6v2M8 7l1 12h6l1-12" /></svg>;
  }
  if (name === "share") {
    return <svg {...common}><circle cx="7" cy="12" r="2" /><circle cx="16" cy="7" r="2" /><circle cx="16" cy="17" r="2" /><path d="M9 11.2 14 8.2M9 12.8l5 3" /></svg>;
  }
  return <svg {...common}><rect x="5" y="6" width="14" height="13" rx="2" /><path d="M8 6V4M16 6V4M5 10h14" /></svg>;
}

function Glyph({ name }) {
  const common = { viewBox: "0 0 24 24", className: "size-[18px]", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (name === "coins") {
    return (
      <svg {...common}>
        <ellipse cx="12" cy="7" rx="7" ry="3" />
        <path d="M5 7v4c0 1.7 3.1 3 7 3s7-1.3 7-3V7" />
        <path d="M5 11v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4" />
      </svg>
    );
  }
  if (name === "branch") {
    return (
      <svg {...common}>
        <path d="M4 20V9l8-5 8 5v11" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }
  if (name === "box") {
    return (
      <svg {...common}>
        <path d="M3 8l9-4 9 4-9 4-9-4z" />
        <path d="M3 8v8l9 4 9-4V8" />
        <path d="M12 12v8" />
      </svg>
    );
  }
  if (name === "trend") {
    return (
      <svg {...common}>
        <path d="M4 16l5-5 3 3 8-8" />
        <path d="M14 6h6v6" />
      </svg>
    );
  }
  if (name === "settings") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18" />
      </svg>
    );
  }
  if (name === "filter") {
    return (
      <svg {...common}>
        <path d="M4 7h16M7 12h10M10 17h4" />
      </svg>
    );
  }
  if (name === "eye") {
    return (
      <svg {...common}>
        <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    );
  }
  if (name === "more") {
    return (
      <svg {...common}>
        <circle cx="6" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="18" cy="12" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return null;
}

function TemplateCard({ item, onOpen, onCustomize }) {
  return (
    <article className="flex h-[166px] flex-col justify-between rounded-2xl border border-[#E2DFDF] bg-white p-4">
      <div className="flex gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#E3ECF2] text-primary">
          <Glyph name={item.icon} />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-[21px] text-ink">{item.title}</h3>
          <p className="mt-1 text-[12px] leading-[18px] text-black/50">{item.body}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onOpen} className="h-9 flex-1 rounded-xl border border-[#E2DFDF] text-sm font-medium text-[#4E505A] hover:bg-[#F8F6F6]">
          View Report
        </button>
        <button type="button" onClick={onCustomize} aria-label="Customize Report" className="grid size-9 place-items-center rounded-xl border border-[#E2DFDF] text-[#4E505A] hover:bg-[#F8F6F6]">
          <Glyph name="filter" />
        </button>
      </div>
    </article>
  );
}

function Frequency({ value, onChange }) {
  return (
    <div className="flex h-10 overflow-hidden rounded-xl border border-[#E2DFDF]">
      {["Daily", "Weekly", "Monthly"].map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={`flex-1 text-sm leading-[21px] ${value === item ? "bg-[#E3ECF2] font-semibold text-ink" : "font-medium text-[#4E505A]"}`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export default function ReportsView() {
  const [tab, setTab] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [format, setFormat] = useState("PDF");
  const [freq, setFreq] = useState("Weekly");
  const [scheduleFreq, setScheduleFreq] = useState("Weekly");
  const [openGroup, setOpenGroup] = useState("Sales Metrics");
  const [showScheduleFields, setShowScheduleFields] = useState(false);
  const [runs, setRuns] = useState({
    "COGS & Waste Audit": true,
    "Daily Sales Snapshot": true,
    "Monthly Executive P&L": true,
    "Branch Profitability Ranking": false,
  });
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  const [menu, setMenu] = useState(null);

  const rows = useMemo(() => {
    const source = tab === "all" ? history : schedules;
    const text = query.trim().toLowerCase();
    return source.filter((row) => {
      const matchesText = !text || row.join(" ").toLowerCase().includes(text);
      if (tab !== "all" || sourceFilter === "All Sources") return matchesText;
      if (sourceFilter === "Created by Me") return matchesText && row[2] === "You";
      if (sourceFilter === "Shared with Me") return matchesText && row[3].startsWith("Shared");
      return matchesText && row[2] === "Auto-Scheduled";
    });
  }, [query, tab, sourceFilter]);

  const visibleTemplates = expanded ? templates : templates.slice(0, 4);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== "Escape") return;
      if (preview) setPreview(false);
      else if (customize) setCustomize(false);
      else if (scheduleOpen) setScheduleOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview, customize, scheduleOpen]);

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex h-11 items-start gap-6 border-b border-[#E2DFDF]">
          <button type="button" onClick={() => { setTab("all"); setQuery(""); setPage(1); }} className="relative flex h-11 items-center px-0.5 pt-[11px] pb-3">
            <span className={`text-sm font-medium leading-[21px] ${tab === "all" ? "text-primary" : "text-[#4E505A]"}`}>All Reports</span>
            {tab === "all" && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-sm bg-primary" />}
          </button>
          <button type="button" onClick={() => { setTab("scheduled"); setQuery(""); setPage(1); }} className="relative flex h-11 items-center gap-1 px-0.5 pt-[11px] pb-3">
            <span className={`text-sm font-medium leading-[21px] ${tab === "scheduled" ? "text-primary" : "text-[#4E505A]"}`}>Scheduled</span>
            <span className="grid size-[22px] place-items-center rounded-full bg-[#C4D8E4] text-[12px] font-medium text-primary">4</span>
            {tab === "scheduled" && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-sm bg-primary" />}
          </button>
        </div>
        {tab === "all" ? (
          <button type="button" onClick={() => { setShowScheduleFields(false); setCustomize(true); }} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-white">
            Create Custom Report
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <path d="M8 3v10M3 8h10" />
            </svg>
          </button>
        ) : (
          <button type="button" onClick={() => setScheduleOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-white">
            New Schedule
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <path d="M8 3v10M3 8h10" />
            </svg>
          </button>
        )}
      </div>

      {tab === "all" && (
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold leading-[21px]">Quick Executive Templates</h2>
            <button type="button" onClick={() => setExpanded((value) => !value)} className="text-[13px] font-medium leading-[18px] text-[#6F7C8A]">
              {expanded ? "Show Less" : "See All Templates"}
            </button>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-6">
            {visibleTemplates.map((item) => (
              <TemplateCard key={item.title} item={item} onOpen={() => setPreview(true)} onCustomize={() => { setShowScheduleFields(false); setCustomize(true); }} />
            ))}
          </div>
        </section>
      )}

      <section className={`rounded-2xl border border-[#E2DFDF] bg-white px-6 py-6 ${tab === "all" ? "mt-6" : "mt-6"}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold leading-[21px]">{tab === "all" ? "Reports History" : "Automated Report Schedules"}</h2>
            {tab === "all" && <p className="text-[12px] leading-[18px] text-black/50">Recently generated and shared reports</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex h-9 w-[198px] items-center gap-3 overflow-hidden rounded-xl border border-[#E2DFDF] px-2">
              <img src="/figma/search.svg" alt="" className="size-[18px] max-w-none" />
              <input
                value={query}
                onChange={(event) => { setQuery(event.target.value); setPage(1); }}
                placeholder="Search reports.."
                className="w-full bg-transparent text-sm font-medium leading-[21px] text-[#4E505A] outline-none placeholder:text-[#4E505A]"
              />
            </label>
            <>
                <button type="button" className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#E2DFDF] px-3 text-sm font-medium text-[#4E505A]">
                  All Branches
                  <img src="/figma/chevron.svg" alt="" className="size-4" />
                </button>
                <div className="relative">
                  <button type="button" onClick={() => setMenu(menu === "sources" ? null : "sources")} className="inline-flex h-9 items-center justify-between gap-2 whitespace-nowrap rounded-xl border border-[#E2DFDF] px-3 text-sm font-medium text-[#4E505A]">
                    {sourceFilter}
                    <img src="/figma/chevron.svg" alt="" className={`size-4 ${menu === "sources" ? "rotate-180" : ""}`} />
                  </button>
                  {menu === "sources" && (
                    <div className="absolute right-0 z-20 mt-2 w-[194px] rounded-xl border border-[#E2DFDF] bg-white p-1.5 shadow-[0_8px_24px_rgba(38,38,38,0.08)]">
                      {sources.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => { setSourceFilter(item); setMenu(null); setPage(1); }}
                          className="flex h-10 w-full items-center justify-between rounded-lg px-3 text-left text-sm text-ink hover:bg-[#F8F6F6]"
                        >
                          {item}
                          {sourceFilter === item && <span className="text-primary">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          {tab === "all" ? (
            <table className="w-[1124px] table-fixed border-collapse text-left">
              <colgroup>
                <col className="w-[243px]" />
                <col className="w-[171px]" />
                <col className="w-[142px]" />
                <col className="w-[142px]" />
                <col className="w-[142px]" />
                <col className="w-[142px]" />
                <col className="w-[142px]" />
              </colgroup>
              <thead>
                <tr className="text-[12px] font-medium leading-[18px] text-[#4E505A]">
                  {["Report Name", "Branches", "Source", "Visibility", "Generated On", "Format", "Action"].map((label) => (
                    <th key={label} className="h-10 bg-[#F6F6F6] px-3 font-medium first:rounded-l-lg last:rounded-r-lg">
                      <span className="inline-flex items-center gap-1">
                        {label}
                        {label === "Generated On" && <img src="/figma/sort.svg" alt="" className="size-4" />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {page === 1 && rows.map((row, index) => (
                  <tr key={row.join("-")} className="border-b border-[#F0EEEE] text-sm leading-[21px] text-ink">
                    <td className="h-[55px] px-3 font-medium">{row[0]}</td>
                    <td className="px-3 text-[#4E505A]">{row[1]}</td>
                    <td className="px-3 text-[#4E505A]">{row[2]}</td>
                    <td className="px-3"><Badge tone={row[3].startsWith("Shared") ? "blue" : "gray"}>{row[3]}</Badge></td>
                    <td className="px-3 text-[#4E505A]">{row[4]}</td>
                    <td className="px-3"><Badge tone="blue">{row[5]}</Badge></td>
                    <td className="relative px-3">
                      <div className="flex items-center gap-1 text-[#4E505A]">
                        <button type="button" aria-label="View" onClick={() => setPreview(true)} className="grid size-8 place-items-center rounded-lg hover:bg-[#F6F6F6]"><Glyph name="eye" /></button>
                        <button type="button" aria-label="Download" onClick={() => setMenu(menu === `export-${index}` ? null : `export-${index}`)} className="grid size-8 place-items-center rounded-lg hover:bg-[#F6F6F6]">
                          <img src="/figma/download.svg" alt="" className="size-[18px]" />
                        </button>
                        <button type="button" aria-label="More" onClick={() => setMenu(menu === `more-${index}` ? null : `more-${index}`)} className="grid size-8 place-items-center rounded-lg hover:bg-[#F6F6F6]"><Glyph name="more" /></button>
                      </div>
                      {menu === `export-${index}` && (
                        <div className="absolute right-3 z-20 mt-1 w-[210px] rounded-xl border border-[#E2DFDF] bg-white p-1.5 shadow-[0_8px_24px_rgba(38,38,38,0.08)]">
                          {["Export as PDF (.pdf)", "Export as Excel (.xlsx)", "Export as CSV (.csv)"].map((item) => (
                            <button key={item} type="button" onClick={() => setMenu(null)} className="flex h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-ink hover:bg-[#F8F6F6]">
                              <img src="/figma/download.svg" alt="" className="size-4" />
                              {item}
                            </button>
                          ))}
                        </div>
                      )}
                      {menu === `more-${index}` && (
                        <div className="absolute right-3 z-20 mt-1 w-[180px] rounded-xl border border-[#E2DFDF] bg-white p-1.5 shadow-[0_8px_24px_rgba(38,38,38,0.08)]">
                          {[["Delete", "trash"], ["Share", "share"], ["Scheduled", "calendar"]].map(([item, icon]) => (
                            <button key={item} type="button" onClick={() => setMenu(null)} className="flex h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-ink hover:bg-[#F8F6F6]">
                              <MenuGlyph name={icon} />
                              {item}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-[1124px] table-fixed border-collapse text-left">
              <colgroup>
                <col className="w-[198px]" />
                <col className="w-[167px]" />
                <col className="w-[167px]" />
                <col className="w-[167px]" />
                <col className="w-[167px]" />
                <col className="w-[100px]" />
                <col className="w-[100px]" />
                <col className="w-[58px]" />
              </colgroup>
              <thead>
                <tr className="text-[12px] font-medium leading-[18px] text-[#4E505A]">
                  {["Report Name", "Frequency & Time", "Branches", "Visibility", "Next Run", "Format", "Status Run", "Action"].map((label) => (
                    <th key={label} className="h-10 bg-[#F6F6F6] px-3 font-medium first:rounded-l-lg last:rounded-r-lg">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row[0]} className="border-b border-[#F0EEEE] text-sm leading-[21px] text-ink">
                    <td className="h-[55px] px-3 font-semibold">{row[0]}</td>
                    <td className="px-3">
                      <div className="font-medium leading-[21px]">{row[1]}</div>
                      <div className="text-[12px] leading-[18px] text-black/50">{row[2]}</div>
                    </td>
                    <td className="px-3 text-[#4E505A]">{row[3]}</td>
                    <td className="px-3"><Badge tone={row[4].startsWith("Shared") ? "blue" : "gray"}>{row[4]}</Badge></td>
                    <td className="px-3 text-[#4E505A]">{row[5]}</td>
                    <td className="px-3"><Badge tone="blue">{row[6]}</Badge></td>
                    <td className="px-3">
                      <button
                        type="button"
                        aria-pressed={runs[row[0]]}
                        onClick={() => setRuns((current) => ({ ...current, [row[0]]: !current[row[0]] }))}
                        className={`relative h-5 w-9 rounded-full ${runs[row[0]] ? "bg-primary" : "bg-[#E6E6E8]"}`}
                      >
                        <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm ${runs[row[0]] ? "left-[18px]" : "left-0.5"}`} />
                      </button>
                    </td>
                    <td className="px-3">
                      <button type="button" aria-label="More" className="grid size-8 place-items-center rounded-lg text-[#4E505A] hover:bg-[#F6F6F6]">
                        <Glyph name="more" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-[12px] leading-[18px] text-black/50">
            {tab === "all" ? "Showing 7 of 24 reports" : `${schedules.length} schedules · ${Object.values(runs).filter(Boolean).length} active · ${Object.values(runs).filter((value) => !value).length} paused`}
          </p>
          {tab === "all" && (
            <div className="flex items-center gap-1">
              <button type="button" aria-label="Previous page" onClick={() => setPage((value) => Math.max(1, value - 1))} className="grid size-8 place-items-center rounded-lg text-[#4E505A] hover:bg-[#F6F6F6]">
                <img src="/figma/arrow-left.svg" alt="" className="size-[18px]" />
              </button>
              {[1, 2, 3].map((number) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => setPage(number)}
                  className={`grid size-8 place-items-center rounded-lg text-sm font-medium ${page === number ? "bg-primary text-white" : "text-[#4E505A] hover:bg-[#F6F6F6]"}`}
                >
                  {number}
                </button>
              ))}
              <button type="button" aria-label="Next page" onClick={() => setPage((value) => Math.min(3, value + 1))} className="grid size-8 place-items-center rounded-lg text-[#4E505A] hover:bg-[#F6F6F6]">
                <img src="/figma/arrow-right.svg" alt="" className="size-[18px]" />
              </button>
            </div>
          )}
        </div>
      </section>

      {preview && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(6,6,6,0.4)] p-6" onClick={() => setPreview(false)}>
          <section className="w-[860px] overflow-hidden rounded-2xl bg-white" onClick={(event) => event.stopPropagation()}>
            <header className="flex h-[72px] items-center justify-between border-b border-[#E2DFDF] px-6">
              <h2 className="text-lg font-semibold leading-[27px]">Executive P&L Summary — Oct 2026</h2>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setPreview(false)} aria-label="Close" className="grid size-8 place-items-center">
                  <img src="/figma/close.svg" alt="" className="size-6" />
                </button>
              </div>
            </header>
            <div className="px-6 py-6">
              <div className="flex items-center justify-between text-[12px] leading-[18px] text-black/50">
                <span>Prepared Finance Manager</span>
                <span>Period: Oct 31 – Nov 01, 2026 · All Branches</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2.5">
                {[["Net Sales", "3,530K SAR"], ["Operating Contribution", "923K SAR"], ["Operating Margin", "26.1%"]].map(([label, value]) => (
                  <article key={label} className="rounded-xl border border-[#E2DFDF] px-3 py-3">
                    <p className="text-[12px] leading-[18px] text-black/50">{label}</p>
                    <p className="text-lg font-semibold leading-[27px]">{value}</p>
                  </article>
                ))}
              </div>
              <table className="mt-4 w-full border-collapse text-left">
                <thead>
                  <tr className="text-[12px] leading-[18px] text-[#4E505A]">
                    {["Branch", "Net Sales", "COGS", "Wastes", "Labor", "Operating Contribution", "Margin %"].map((label) => (
                      <th key={label} className="h-11 bg-[#F6F6F6] px-2 font-medium">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row) => (
                    <tr key={row[0]} className="border-b border-[#E2DFDF] text-sm leading-[21px]">
                      {row.map((cell, index) => (
                        <td key={cell} className={`h-[38px] px-2 ${row[0] === "Total" ? "font-semibold" : ""} ${index === 6 ? "text-right" : ""}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 border-t border-[#E2DFDF] pt-4 text-sm leading-[21px] text-black/50">Confidential · Shared with you by Finance Manager</p>
            </div>
          </section>
        </div>
      )}

      {customize && (
        <div className="fixed inset-0 z-50 bg-[rgba(6,6,6,0.4)]" onClick={() => setCustomize(false)}>
          <aside className="absolute inset-y-0 right-0 flex w-[480px] flex-col bg-white" onClick={(event) => event.stopPropagation()}>
            <header className="flex h-16 items-center justify-between border-b border-[#E2DFDF] px-6">
              <h2 className="text-lg font-semibold leading-[27px]">Customize Report</h2>
              <button type="button" onClick={() => setCustomize(false)} aria-label="Close" className="grid size-8 place-items-center">
                <img src="/figma/close.svg" alt="" className="size-6" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <label className="block text-sm leading-[21px]">Report Title</label>
              <input defaultValue="Q4 Riyadh & Jeddah Waste Focus" className="mt-2 h-10 w-full rounded-xl border border-[#E2DFDF] px-3 text-sm outline-none" />
              <label className="mt-4 block text-sm leading-[21px]">Date Range</label>
              <div className="mt-2 flex h-10 items-center gap-2 rounded-xl border border-[#E2DFDF] px-3 text-sm">
                <span>Oct 01, 2026 – Oct 31, 2026</span>
              </div>
              <label className="mt-4 block text-sm leading-[21px]">Branches</label>
              <div className="mt-2 rounded-xl border border-[#E2DFDF] p-2">
                <p className="px-1 py-1 text-[12px] leading-[18px] text-black/50">Search or select branches...</p>
              </div>
              <p className="mt-4 text-sm leading-[21px]">Included Metrics</p>
              <div className="mt-2 flex h-10 items-center rounded-xl border border-[#E2DFDF] px-3 text-sm text-black/50">Search columns...</div>
              <div className="mt-3 overflow-hidden rounded-xl border border-[#E2DFDF]">
                {metricGroups.map((group) => (
                  <div key={group} className="border-b border-[#E2DFDF] last:border-b-0">
                    <button type="button" onClick={() => setOpenGroup((current) => (current === group ? "" : group))} className="flex h-8 w-full items-center justify-between bg-[#F6F6F6] px-2 text-[12px] leading-[18px]">
                      {group}
                      <img src="/figma/chevron.svg" alt="" className={`size-4 ${openGroup === group ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-[21px]">Automation Options</p>
              <button type="button" onClick={() => setShowScheduleFields((value) => !value)} className="mt-3 flex items-center gap-2 text-sm text-[#4E505A]">
                <span className={`grid size-6 place-items-center rounded-md border ${showScheduleFields ? "border-primary bg-primary text-white" : "border-[#E2DFDF]"}`}>{showScheduleFields ? "✓" : ""}</span>
              </button>
              {showScheduleFields && (
                <div className="mt-4">
                  <Frequency value={freq} onChange={setFreq} />
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <label className="text-[12px] leading-[18px] text-black/50">
                      Day of Week
                      <div className="mt-1 flex h-10 items-center justify-between rounded-xl border border-[#E2DFDF] px-3 text-sm text-ink">Every Sunday</div>
                    </label>
                    <label className="text-[12px] leading-[18px] text-black/50">
                      Time
                      <div className="mt-1 flex h-10 items-center justify-between rounded-xl border border-[#E2DFDF] px-3 text-sm text-ink">09:00 AM</div>
                    </label>
                  </div>
                  <p className="mt-4 text-[12px] leading-[18px] text-black/50">Send Report To</p>
                  <div className="mt-1 rounded-xl border border-[#E2DFDF] px-3 py-3 text-[12px] leading-[18px] text-black/50">Type name or email...</div>
                </div>
              )}
            </div>
            <footer className="flex h-[76px] items-center justify-between border-t border-[#E2DFDF] px-6">
              <div className="flex h-10 items-center rounded-xl border border-[#E2DFDF] p-1">
                {["PDF", "XLSX", "CSV"].map((item) => (
                  <button key={item} type="button" onClick={() => setFormat(item)} className={`h-8 rounded-lg px-3 text-[12px] font-medium ${format === item ? "bg-[#E3ECF2] text-ink" : "text-[#4E505A]"}`}>{item}</button>
                ))}
              </div>
            </footer>
          </aside>
        </div>
      )}

      {scheduleOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(6,6,6,0.4)] p-6" onClick={() => setScheduleOpen(false)}>
          <section className="w-[597px] rounded-2xl bg-white p-6" onClick={(event) => event.stopPropagation()}>
            <header className="flex items-start justify-between">
              <h2 className="text-[22px] font-semibold leading-[33px]">Schedule Automated Report</h2>
              <button type="button" onClick={() => setScheduleOpen(false)} aria-label="Close" className="grid size-8 place-items-center">
                <img src="/figma/close.svg" alt="" className="size-6" />
              </button>
            </header>
            <p className="mt-4 text-sm font-medium leading-[21px]">Step 1 Report & Scope</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-[12px] leading-[18px] text-black/50">
                Report Template
                <div className="mt-1 flex h-10 items-center rounded-xl border border-[#E2DFDF] px-3 text-sm text-ink">COGS & Waste Audit</div>
              </label>
              <label className="text-[12px] leading-[18px] text-black/50">
                Branches
                <div className="mt-1 flex h-10 items-center rounded-xl border border-[#E2DFDF] px-3 text-sm text-ink">All Branches</div>
              </label>
            </div>
            <p className="mt-4 text-sm font-medium leading-[21px]">Step 2 Frequency & Delivery Time</p>
            <div className="mt-4">
              <Frequency value={scheduleFreq} onChange={setScheduleFreq} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-[12px] leading-[18px] text-black/50">
                Day of Week
                <div className="mt-1 flex h-10 items-center rounded-xl border border-[#E2DFDF] px-3 text-sm text-ink">Every Sunday</div>
              </label>
              <label className="text-[12px] leading-[18px] text-black/50">
                Time
                <div className="mt-1 flex h-10 items-center rounded-xl border border-[#E2DFDF] px-3 text-sm text-ink">09:00 AM</div>
              </label>
            </div>
            <p className="mt-4 text-sm font-medium leading-[21px]">Step 3 Recipients</p>
            <p className="mt-4 text-[12px] leading-[18px] text-black/50">Send Report To</p>
            <div className="mt-1 rounded-xl border border-[#E2DFDF] px-3 py-3 text-[12px] leading-[18px] text-black/50">Type name or email...</div>
          </section>
        </div>
      )}
    </div>
  );
}
