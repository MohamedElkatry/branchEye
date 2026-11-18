import { useEffect, useMemo, useRef, useState } from "react";
import { ColumnSizer, ResizableTh, columnTableWidth, useResizableColumns } from "./columnResize";

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

const metricsByGroup = {
  "Sales Metrics": ["Gross Sales", "Net Sales", "Discounts", "Refunds"],
  "Cost Metrics": ["COGS", "Wastes"],
  "Profitability": ["Operating Contribution", "Margin %"],
  "Operations & Labor": ["Labor"],
};

const branchOptions = ["All Branches", "Riyadh 01", "Jeddah 01", "Jeddah 02", "Dammam 01"];
const pageSize = 7;

function downloadFile(filename, lines) {
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function fileSlug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "report";
}

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
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 7H6" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 17H9" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 17H21" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 7H21" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 7C6 6.06812 6 5.60218 6.15224 5.23463C6.35523 4.74458 6.74458 4.35523 7.23463 4.15224C7.60218 4 8.06812 4 9 4C9.93188 4 10.3978 4 10.7654 4.15224C11.2554 4.35523 11.6448 4.74458 11.8478 5.23463C12 5.60218 12 6.06812 12 7C12 7.93188 12 8.39782 11.8478 8.76537C11.6448 9.25542 11.2554 9.64477 10.7654 9.84776C10.3978 10 9.93188 10 9 10C8.06812 10 7.60218 10 7.23463 9.84776C6.74458 9.64477 6.35523 9.25542 6.15224 8.76537C6 8.39782 6 7.93188 6 7Z" stroke="#262626" strokeWidth="1.5" />
        <path d="M12 17C12 16.0681 12 15.6022 12.1522 15.2346C12.3552 14.7446 12.7446 14.3552 13.2346 14.1522C13.6022 14 14.0681 14 15 14C15.9319 14 16.3978 14 16.7654 14.1522C17.2554 14.3552 17.6448 14.7446 17.8478 15.2346C18 15.6022 18 16.0681 18 17C18 17.9319 18 18.3978 17.8478 18.7654C17.6448 19.2554 17.2554 19.6448 16.7654 19.8478C16.3978 20 15.9319 20 15 20C14.0681 20 13.6022 20 13.2346 19.8478C12.7446 19.6448 12.3552 19.2554 12.1522 18.7654C12 18.3978 12 17.9319 12 17Z" stroke="#262626" strokeWidth="1.5" />
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

function formatReportRange(start, end) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const format = (value) => {
    const [year, month, day] = value.split("-");
    return `${months[Number(month) - 1]} ${day}, ${year}`;
  };
  return `${format(start)} – ${format(end)}`;
}

function Frequency({ value, onChange }) {
  return (
    <div className="flex h-10 items-center rounded-xl border border-[#E2DFDF] p-1">
      {["Daily", "Weekly", "Monthly"].map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={`h-8 flex-1 rounded-lg text-sm leading-[21px] ${value === item ? "bg-[#F6F6F6] font-semibold text-ink" : "font-medium text-[#4E505A]"}`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function OptionCheck({ checked, onClick, children, small = false }) {
  return (
    <button type="button" onClick={onClick} className={`flex items-center gap-2 text-left text-[#4E505A] ${small ? "text-[12px] leading-[18px]" : "text-sm leading-[21px]"}`}>
      <span className={`grid size-[18px] shrink-0 place-items-center rounded-[4px] border ${checked ? "border-primary bg-primary text-white" : "border-[#E2DFDF] bg-white"}`}>
        {checked && (
          <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2.2 6.2 4.7 8.6 9.8 3.4" />
          </svg>
        )}
      </span>
      {children}
    </button>
  );
}

export default function ReportsView() {
  const [tab, setTab] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState(null);
  const [customize, setCustomize] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [format, setFormat] = useState("PDF");
  const [freq, setFreq] = useState("Weekly");
  const [scheduleFreq, setScheduleFreq] = useState("Weekly");
  const [openGroup, setOpenGroup] = useState("Sales Metrics");
  const [showScheduleFields, setShowScheduleFields] = useState(true);
  const [saveTemplate, setSaveTemplate] = useState(true);
  const [extraTemplates, setExtraTemplates] = useState([]);
  const [historyRows, setHistoryRows] = useState(history);
  const [scheduleRows, setScheduleRows] = useState(schedules);
  const [branchFilter, setBranchFilter] = useState("All Branches");
  const [sortDir, setSortDir] = useState(null);
  const [reportTitle, setReportTitle] = useState("");
  const [rangeStart, setRangeStart] = useState("2026-10-01");
  const [rangeEnd, setRangeEnd] = useState("2026-10-31");
  const [rangeOpen, setRangeOpen] = useState(false);
  const rangeRef = useRef(null);
  const [branchChips, setBranchChips] = useState(["Riyadh 01", "Jeddah 02"]);
  const [branchQuery, setBranchQuery] = useState("");
  const [branchMenu, setBranchMenu] = useState(false);
  const [scheduleDay, setScheduleDay] = useState("Every Sunday");
  const [scheduleTime, setScheduleTime] = useState("09:00 AM");
  const dateRange = formatReportRange(rangeStart, rangeEnd);
  useEffect(() => {
    if (!rangeOpen) return undefined;
    const close = (event) => {
      if (!rangeRef.current?.contains(event.target)) setRangeOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [rangeOpen]);
  const [metricQuery, setMetricQuery] = useState("");
  const [pickedMetrics, setPickedMetrics] = useState(["Net Sales", "COGS", "Wastes", "Labor", "Operating Contribution", "Margin %"]);
  const [reportMetrics, setReportMetrics] = useState([]);
  const [recipient, setRecipient] = useState("");
  const [recipients, setRecipients] = useState(["You (Email)", "Ops Manager"]);
  const [scheduleTemplate, setScheduleTemplate] = useState(templates[2].title);
  const [scheduleBranch, setScheduleBranch] = useState("All Branches");
  const [notice, setNotice] = useState("");
  const [runs, setRuns] = useState({
    "COGS & Waste Audit": true,
    "Daily Sales Snapshot": true,
    "Monthly Executive P&L": true,
    "Branch Profitability Ranking": false,
  });
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  const [menu, setMenu] = useState(null);
  const previewHeaders = ["Branch", "Net Sales", "COGS", "Wastes", "Labor", "Operating Contribution", "Margin %"].filter((label, index) => index === 0 || pickedMetrics.includes(label));
  const historyColumns = useResizableColumns(7);
  const scheduleColumns = useResizableColumns(8);
  const previewColumns = useResizableColumns(previewHeaders.length);

  const rows = useMemo(() => {
    const source = tab === "all" ? historyRows : scheduleRows;
    const text = query.trim().toLowerCase();
    const dateIndex = tab === "all" ? 4 : 5;
    const filtered = source.filter((row) => {
      const matchesText = !text || row.join(" ").toLowerCase().includes(text);
      const branchValue = tab === "all" ? row[1] : row[3];
      const matchesBranch = branchFilter === "All Branches" || branchValue === "All Branches" || branchValue.includes(branchFilter);
      if (!matchesText || !matchesBranch) return false;
      if (sourceFilter === "All Sources") return true;
      if (tab === "all") {
        if (sourceFilter === "Created by Me") return row[2] === "You";
        if (sourceFilter === "Shared with Me") return row[3].startsWith("Shared");
        return row[2] === "Auto-Scheduled";
      }
      if (sourceFilter === "Shared with Me") return row[4].startsWith("Shared");
      if (sourceFilter === "Created by Me") return false;
      return true;
    });
    if (!sortDir) return filtered;
    return [...filtered].sort((left, right) => {
      const diff = Date.parse(left[dateIndex]) - Date.parse(right[dateIndex]);
      return sortDir === "asc" ? diff : -diff;
    });
  }, [query, tab, sourceFilter, historyRows, scheduleRows, branchFilter, sortDir]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const pagerCount = tab === "all" ? Math.max(3, pageCount) : pageCount;
  const safePage = Math.min(page, pagerCount);
  const pageRows = tab === "all" ? rows.slice((safePage - 1) * pageSize, safePage * pageSize) : rows;
  const activeSchedules = rows.filter((row) => runs[row[0]] !== false).length;

  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 1600);
  }

  function exportRow(row) {
    const headers = tab === "all"
      ? ["Report Name", "Branches", "Source", "Visibility", "Generated On", "Format"]
      : ["Report Name", "Frequency", "Time", "Branches", "Visibility", "Next Run", "Format"];
    downloadFile(`${fileSlug(row[0])}.csv`, [headers.join(","), row.map((cell) => `"${cell}"`).join(",")]);
    setMenu(null);
    showNotice("Downloaded");
  }

  function deleteRow(row) {
    if (tab === "all") setHistoryRows((current) => current.filter((item) => item !== row));
    else setScheduleRows((current) => current.filter((item) => item !== row));
    setMenu(null);
  }

  async function shareRow(row) {
    const text = `${row[0]} · ${tab === "all" ? row[1] : row[3]}`;
    try {
      await navigator.clipboard.writeText(text);
      showNotice("Copied");
    } catch {
      showNotice(text);
    }
    setMenu(null);
  }

  function addRecipient() {
    const value = recipient.trim();
    if (!value || recipients.includes(value)) return;
    setRecipients((current) => [...current, value]);
    setRecipient("");
  }

  function createReport() {
    const title = reportTitle.trim() || "Custom Report";
    const branches = branchChips.length ? branchChips.join(", ") : "All Branches";
    setHistoryRows((current) => [[title, branches, "You", "Private", "Nov 18, 2026", format], ...current]);
    const previewMetrics = reportMetrics.filter((metric) => ["Net Sales", "COGS", "Wastes", "Labor", "Operating Contribution", "Margin %"].includes(metric));
    if (previewMetrics.length) setPickedMetrics(previewMetrics);
    if (saveTemplate && ![...templates, ...extraTemplates].some((item) => item.title === title)) {
      setExtraTemplates((current) => [...current, { title, body: "Custom report template.", icon: "settings", custom: true }]);
    }
    if (showScheduleFields) {
      const day = scheduleDay.replace("Every ", "");
      const frequency = freq === "Monthly" ? "Monthly · 1st" : freq === "Daily" ? "Daily" : `Weekly · ${day}`;
      setScheduleRows((current) => [[title, frequency, scheduleTime, branches, "Private", "Nov 18, 2026", format], ...current]);
      setRuns((current) => ({ ...current, [title]: true }));
    }
    setCustomize(false);
    setTab("all");
    setPage(1);
    showNotice("Report added");
  }

  function saveSchedule() {
    const frequency = scheduleFreq === "Monthly" ? "Monthly · 1st" : scheduleFreq === "Daily" ? "Daily" : "Weekly · Sunday";
    setScheduleRows((current) => [[scheduleTemplate, frequency, "09:00 AM", scheduleBranch, "Private", "Nov 18, 2026", format], ...current]);
    setRuns((current) => ({ ...current, [scheduleTemplate]: true }));
    setScheduleOpen(false);
    setTab("scheduled");
    showNotice("Schedule added");
  }

  const allTemplates = [...templates, ...extraTemplates];
  const visibleTemplates = expanded ? allTemplates : allTemplates.slice(0, 4);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== "Escape") return;
      if (preview) setPreview(null);
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
            <span className="grid size-[22px] place-items-center rounded-full bg-[#C4D8E4] text-[12px] font-medium text-primary">{scheduleRows.length}</span>
            {tab === "scheduled" && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-sm bg-primary" />}
          </button>
        </div>
        {tab === "all" ? (
          <button type="button" onClick={() => { setSaveTemplate(true); setShowScheduleFields(true); setRangeOpen(false); setCustomize(true); }} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-white">
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
              <TemplateCard key={item.title} item={item} onOpen={() => setPreview({ name: item.title, branches: "All Branches" })} onCustomize={() => { setReportTitle(""); setSaveTemplate(true); setShowScheduleFields(true); setRangeOpen(false); setCustomize(true); }} />
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
                <div className="relative">
                  <button type="button" onClick={() => setMenu(menu === "branches" ? null : "branches")} className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#E2DFDF] px-3 text-sm font-medium text-[#4E505A]">
                    {branchFilter}
                    <img src="/figma/chevron.svg" alt="" className={`size-4 ${menu === "branches" ? "rotate-180" : ""}`} />
                  </button>
                  {menu === "branches" && (
                    <div className="absolute right-0 z-20 mt-2 w-[180px] rounded-xl border border-[#E2DFDF] bg-white p-1.5 shadow-[0_8px_24px_rgba(38,38,38,0.08)]">
                      {branchOptions.map((item) => (
                        <button key={item} type="button" onClick={() => { setBranchFilter(item); setMenu(null); setPage(1); }} className="flex h-10 w-full items-center justify-between rounded-lg px-3 text-left text-sm text-ink hover:bg-[#F8F6F6]">
                          {item}
                          {branchFilter === item && <span className="text-primary">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
            <table className={`table-fixed border-collapse text-left ${historyColumns.widths ? "" : "w-full"}`} style={historyColumns.widths ? { width: columnTableWidth(historyColumns.widths) } : undefined}>
              <ColumnSizer widths={historyColumns.widths} />
              <thead ref={historyColumns.headRef}>
                <tr className="text-[12px] font-medium leading-[18px] text-[#4E505A]">
                  {["Report Name", "Branches", "Source", "Visibility", "Generated On", "Format", "Action"].map((label, index) => (
                    <ResizableTh key={label} index={index} onResizeStart={historyColumns.onResizeStart} className="h-10 bg-[#F6F6F6] px-3 font-medium first:rounded-l-lg last:rounded-r-lg">
                      {label === "Generated On" ? (
                        <button type="button" onClick={() => setSortDir((current) => (current === "desc" ? "asc" : "desc"))} className="inline-flex items-center gap-1 whitespace-nowrap font-medium">
                          {label}
                          <img src="/figma/sort.svg" alt="" className="size-4" />
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">{label}</span>
                      )}
                    </ResizableTh>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, index) => (
                  <tr key={`${row.join("-")}-${index}`} className="border-b border-[#F0EEEE] text-sm leading-[21px] text-ink">
                    <td className="h-[55px] px-3 font-semibold">{row[0]}</td>
                    <td className="whitespace-nowrap px-3 text-[#4E505A]">{row[1]}</td>
                    <td className="px-3 text-[#4E505A]">{row[2]}</td>
                    <td className="px-3"><Badge tone={row[3].startsWith("Shared") ? "blue" : "gray"}>{row[3]}</Badge></td>
                    <td className="whitespace-nowrap px-3 text-[#4E505A]">{row[4]}</td>
                    <td className="px-3"><Badge tone="blue">{row[5]}</Badge></td>
                    <td className="relative whitespace-nowrap px-2">
                      <div className="flex items-center gap-1.5 text-[#4E505A]">
                        <button type="button" aria-label="View" onClick={() => setPreview({ name: row[0], branches: row[1] })} className="grid size-8 shrink-0 place-items-center rounded-lg border border-[#E2DFDF] bg-white hover:bg-[#F8F6F6]"><Glyph name="eye" /></button>
                        <button type="button" aria-label="Download" onClick={() => setMenu(menu === `export-${index}` ? null : `export-${index}`)} className="grid size-8 shrink-0 place-items-center rounded-lg border border-[#E2DFDF] bg-white hover:bg-[#F8F6F6]">
                          <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M12 4v10" />
                            <path d="m8 10 4 4 4-4" />
                            <path d="M5 18h14" />
                          </svg>
                        </button>
                        <button type="button" aria-label="More" onClick={() => setMenu(menu === `more-${index}` ? null : `more-${index}`)} className="grid size-8 shrink-0 place-items-center rounded-lg border border-[#E2DFDF] bg-white hover:bg-[#F8F6F6]"><Glyph name="more" /></button>
                      </div>
                      {menu === `export-${index}` && (
                        <div className="absolute right-3 z-20 mt-1 w-[210px] rounded-xl border border-[#E2DFDF] bg-white p-1.5 shadow-[0_8px_24px_rgba(38,38,38,0.08)]">
                          {["Export as PDF (.pdf)", "Export as Excel (.xlsx)", "Export as CSV (.csv)"].map((item) => (
                            <button key={item} type="button" onClick={() => exportRow(row)} className="flex h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-ink hover:bg-[#F8F6F6]">
                              <img src="/figma/download.svg" alt="" className="size-4" />
                              {item}
                            </button>
                          ))}
                        </div>
                      )}
                      {menu === `more-${index}` && (
                        <div className="absolute right-3 z-20 mt-1 w-[180px] rounded-xl border border-[#E2DFDF] bg-white p-1.5 shadow-[0_8px_24px_rgba(38,38,38,0.08)]">
                          {[["Delete", "trash", () => deleteRow(row)], ["Share", "share", () => shareRow(row)], ["Scheduled", "calendar", () => { setTab("scheduled"); setMenu(null); }]].map(([item, icon, action]) => (
                            <button key={item} type="button" onClick={action} className="flex h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-ink hover:bg-[#F8F6F6]">
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
            <table className={`table-fixed border-collapse text-left ${scheduleColumns.widths ? "" : "w-full min-w-[980px]"}`} style={scheduleColumns.widths ? { width: columnTableWidth(scheduleColumns.widths) } : undefined}>
              <ColumnSizer widths={scheduleColumns.widths} />
              <thead ref={scheduleColumns.headRef}>
                <tr className="text-[12px] font-medium leading-[18px] text-[#4E505A]">
                  {["Report Name", "Frequency & Time", "Branches", "Visibility", "Next Run", "Format", "Status Run", "Action"].map((label, index) => (
                    <ResizableTh key={label} index={index} onResizeStart={scheduleColumns.onResizeStart} className="h-10 bg-[#F6F6F6] px-3 font-medium first:rounded-l-lg last:rounded-r-lg">
                      {label === "Next Run" ? (
                        <button type="button" onClick={() => setSortDir((current) => (current === "desc" ? "asc" : "desc"))} className="inline-flex items-center gap-1 font-medium">{label}</button>
                      ) : label}
                    </ResizableTh>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, index) => (
                  <tr key={`${row[0]}-${index}`} className="border-b border-[#F0EEEE] text-sm leading-[21px] text-ink">
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
                    <td className="relative px-3">
                      <button type="button" aria-label="More" onClick={() => setMenu(menu === `schedule-more-${index}` ? null : `schedule-more-${index}`)} className="grid size-8 place-items-center rounded-lg text-[#4E505A] hover:bg-[#F6F6F6]">
                        <Glyph name="more" />
                      </button>
                      {menu === `schedule-more-${index}` && (
                        <div className="absolute right-3 z-20 mt-1 w-[180px] rounded-xl border border-[#E2DFDF] bg-white p-1.5 shadow-[0_8px_24px_rgba(38,38,38,0.08)]">
                          {[["Delete", "trash", () => deleteRow(row)], ["Share", "share", () => shareRow(row)]].map(([item, icon, action]) => (
                            <button key={item} type="button" onClick={action} className="flex h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-ink hover:bg-[#F8F6F6]">
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
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-[12px] leading-[18px] text-black/50">
            {tab === "all"
              ? `Showing ${pageRows.length} of ${query.trim() || branchFilter !== "All Branches" || sourceFilter !== "All Sources" ? rows.length : 24} reports`
              : `${rows.length} schedules · ${activeSchedules} active · ${rows.length - activeSchedules} paused`}
            {notice ? ` · ${notice}` : ""}
          </p>
          {tab === "all" && (
            <div className="flex items-center gap-1">
              <button type="button" aria-label="Previous page" onClick={() => setPage((value) => Math.max(1, value - 1))} className="grid size-8 place-items-center rounded-lg text-[#4E505A] hover:bg-[#F6F6F6]">
                <img src="/figma/arrow-left.svg" alt="" className="size-[18px]" />
              </button>
              {Array.from({ length: pagerCount }, (_, index) => index + 1).map((number) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => setPage(number)}
                  className={`grid size-8 place-items-center rounded-lg text-sm font-medium ${safePage === number ? "bg-primary text-white" : "text-[#4E505A] hover:bg-[#F6F6F6]"}`}
                >
                  {number}
                </button>
              ))}
              <button type="button" aria-label="Next page" onClick={() => setPage((value) => Math.min(pagerCount, value + 1))} className="grid size-8 place-items-center rounded-lg text-[#4E505A] hover:bg-[#F6F6F6]">
                <img src="/figma/arrow-right.svg" alt="" className="size-[18px]" />
              </button>
            </div>
          )}
        </div>
      </section>

      {preview && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(6,6,6,0.4)] p-6" onClick={() => setPreview(null)}>
          <section className="w-[860px] overflow-hidden rounded-2xl bg-white" onClick={(event) => event.stopPropagation()}>
            <header className="flex h-[72px] items-center justify-between border-b border-[#E2DFDF] px-6">
              <h2 className="text-lg font-semibold leading-[27px]">{preview.name}</h2>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setPreview(null)} aria-label="Close" className="grid size-8 place-items-center">
                  <img src="/figma/close.svg" alt="" className="size-7" />
                </button>
              </div>
            </header>
            <div className="px-6 py-6">
              <div className="flex items-center justify-between text-[12px] leading-[18px] text-black/50">
                <span>Prepared Finance Manager</span>
                <span>Period: {dateRange} · {preview.branches}</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2.5">
                {[["Net Sales", "3,530K SAR"], ["Operating Contribution", "923K SAR"], ["Operating Margin", "26.1%"]].map(([label, value]) => (
                  <article key={label} className="rounded-xl border border-[#E2DFDF] px-3 py-3">
                    <p className="text-[12px] leading-[18px] text-black/50">{label}</p>
                    <p className="text-lg font-semibold leading-[27px]">{value}</p>
                  </article>
                ))}
              </div>
              <div className="mt-4 overflow-x-auto">
              <table className={`border-collapse text-left table-fixed ${previewColumns.widths ? "" : "w-full"}`} style={previewColumns.widths ? { width: columnTableWidth(previewColumns.widths) } : undefined}>
                <ColumnSizer widths={previewColumns.widths} />
                <thead ref={previewColumns.headRef}>
                  <tr className="text-[12px] leading-[18px] text-[#4E505A]">
                    {previewHeaders.map((label, index) => (
                      <ResizableTh key={label} index={index} onResizeStart={previewColumns.onResizeStart} className="h-11 bg-[#F6F6F6] px-2 font-medium">{label}</ResizableTh>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row) => (
                    <tr key={row[0]} className="border-b border-[#E2DFDF] text-sm leading-[21px]">
                      {row.filter((_, index) => index === 0 || pickedMetrics.includes(["Branch", "Net Sales", "COGS", "Wastes", "Labor", "Operating Contribution", "Margin %"][index])).map((cell, index) => (
                        <td key={`${row[0]}-${cell}`} className={`h-[38px] px-2 ${row[0] === "Total" ? "font-semibold" : ""} ${index === 6 ? "text-right" : ""}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              <p className="mt-4 border-t border-[#E2DFDF] pt-4 text-sm leading-[21px] text-black/50">Confidential · Shared with you by Finance Manager</p>
            </div>
          </section>
        </div>
      )}

      {customize && (
        <div className="fixed inset-0 z-50 bg-[rgba(6,6,6,0.4)]" onClick={() => setCustomize(false)}>
          <aside
            className="absolute inset-y-0 right-0 flex w-[480px] flex-col bg-white"
            onClick={(event) => {
              event.stopPropagation();
              if (rangeRef.current && !rangeRef.current.contains(event.target)) setRangeOpen(false);
            }}
            onMouseDown={(event) => {
              if (rangeRef.current && !rangeRef.current.contains(event.target)) setRangeOpen(false);
            }}
          >
            <header className="flex h-16 items-center justify-between border-b border-[#E2DFDF] px-6">
              <h2 className="text-lg font-semibold leading-[27px]">Customize Report</h2>
              <button type="button" onClick={() => setCustomize(false)} aria-label="Close" className="grid size-8 place-items-center">
                <img src="/figma/close.svg" alt="" className="size-7" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <label className="block text-sm leading-[21px]">Report Title</label>
              <input value={reportTitle} onChange={(event) => setReportTitle(event.target.value)} placeholder="Q4 Riyadh & Jeddah Waste Focus" className="mt-2 h-10 w-full rounded-xl border border-[#E2DFDF] px-3 text-sm outline-none placeholder:text-[#4E505A]" />
              <label className="mt-4 block text-sm leading-[21px]">Date Range</label>
              <div className="relative mt-2" ref={rangeRef}>
                <button type="button" onClick={() => setRangeOpen((value) => !value)} className="flex h-10 w-full items-center gap-2 rounded-xl border border-[#E2DFDF] px-3 text-left text-sm text-ink">
                  <svg viewBox="0 0 24 24" className="size-6 shrink-0" fill="none" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                    <rect x="4" y="5" width="16" height="15" rx="2" />
                    <path d="M8 3.5v3M16 3.5v3M4 10h16" />
                  </svg>
                  <span>{dateRange}</span>
                </button>
                {rangeOpen && (
                  <div className="absolute z-20 mt-2 w-full rounded-xl border border-[#E2DFDF] bg-white p-3 shadow-[0_8px_24px_rgba(38,38,38,0.08)]">
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-[12px] leading-[18px] text-black/50">
                        From
                        <input type="date" value={rangeStart} max={rangeEnd} onChange={(event) => setRangeStart(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-[#E2DFDF] px-2 text-sm text-ink" />
                      </label>
                      <label className="text-[12px] leading-[18px] text-black/50">
                        To
                        <input type="date" value={rangeEnd} min={rangeStart} onChange={(event) => setRangeEnd(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-[#E2DFDF] px-2 text-sm text-ink" />
                      </label>
                    </div>
                    <button type="button" onClick={() => setRangeOpen(false)} className="mt-3 h-9 w-full rounded-xl bg-primary text-sm font-medium text-white">Apply</button>
                  </div>
                )}
              </div>
              <label className="mt-4 block text-sm leading-[21px]">Branches</label>
              <div className="relative mt-2 rounded-xl border border-[#E2DFDF] px-2 py-2">
                <div className="flex flex-wrap gap-1">
                  {branchChips.map((item) => (
                    <span key={item} className="inline-flex h-[26px] items-center gap-1 rounded-lg bg-[#F6F6F6] px-2 text-[12px] text-[#4E505A]">
                      {item}
                      <button type="button" aria-label={`Remove ${item}`} onClick={() => setBranchChips((current) => current.filter((value) => value !== item))} className="text-sm leading-none">×</button>
                    </span>
                  ))}
                </div>
                <button type="button" onClick={() => setBranchMenu((value) => !value)} className="mt-2 flex h-6 w-full items-center justify-between text-left text-[12px] leading-[18px] text-black/50">
                  Search or select branches...
                  <img src="/figma/chevron.svg" alt="" className="size-6" />
                </button>
                {branchMenu && (
                  <div className="absolute inset-x-0 top-full z-20 mt-1 rounded-xl border border-[#E2DFDF] bg-white p-2 shadow-[0_8px_24px_rgba(38,38,38,0.08)]">
                    <input value={branchQuery} onChange={(event) => setBranchQuery(event.target.value)} placeholder="Search or select branches..." className="h-9 w-full rounded-lg border border-[#E2DFDF] px-2 text-sm outline-none" />
                    <div className="mt-1">
                      {branchOptions.filter((item) => item !== "All Branches" && !branchChips.includes(item) && item.toLowerCase().includes(branchQuery.trim().toLowerCase())).map((item) => (
                        <button key={item} type="button" onClick={() => { setBranchChips((current) => [...current, item]); setBranchQuery(""); }} className="flex h-8 w-full items-center rounded-lg px-2 text-left text-sm text-ink hover:bg-[#F8F6F6]">{item}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <p className="mt-4 text-sm leading-[21px]">Included Metrics</p>
              <label className="mt-2 flex h-10 items-center gap-2 rounded-xl border border-[#E2DFDF] px-3">
                <img src="/figma/search.svg" alt="" className="size-[18px]" />
                <input value={metricQuery} onChange={(event) => setMetricQuery(event.target.value)} placeholder="Search columns..." className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-black/50" />
              </label>
              <div className="mt-4 overflow-hidden rounded-xl border border-[#E2DFDF]">
                {metricGroups.map((group) => (
                  <div key={group} className="border-b border-[#E2DFDF] last:border-b-0">
                    <button type="button" onClick={() => setOpenGroup((current) => (current === group ? "" : group))} className="flex h-8 w-full items-center justify-between bg-[#F6F6F6] px-2 text-[12px] leading-[18px]">
                      {group}
                      <img src="/figma/chevron.svg" alt="" className={`size-6 ${openGroup === group ? "rotate-180" : ""}`} />
                    </button>
                    {openGroup === group && (
                      <div className="flex flex-wrap gap-x-4 gap-y-2 px-2 py-2.5">
                        {metricsByGroup[group].filter((metric) => metric.toLowerCase().includes(metricQuery.trim().toLowerCase())).map((metric) => (
                          <OptionCheck key={metric} small checked={reportMetrics.includes(metric)} onClick={() => setReportMetrics((current) => (current.includes(metric) ? current.filter((item) => item !== metric) : [...current, metric]))}>
                            {metric}
                          </OptionCheck>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-[21px]">Automation Options</p>
              <div className="mt-3 flex flex-col gap-3">
                <OptionCheck checked={saveTemplate} onClick={() => setSaveTemplate((value) => !value)}>Save as a reusable custom template</OptionCheck>
                <OptionCheck checked={showScheduleFields} onClick={() => setShowScheduleFields((value) => !value)}>Schedule this report automatically</OptionCheck>
              </div>
              {showScheduleFields && (
                <div className="mt-4">
                  <Frequency value={freq} onChange={setFreq} />
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <label className="text-[12px] leading-[18px] text-black/50">
                      Day of Week
                      <span className="relative mt-1 block">
                        <select value={scheduleDay} onChange={(event) => setScheduleDay(event.target.value)} className="h-10 w-full appearance-none rounded-xl border border-[#E2DFDF] bg-white px-3 pr-9 text-sm text-ink">
                          {["Every Sunday", "Every Monday", "Every Tuesday", "Every Wednesday", "Every Thursday", "Every Friday", "Every Saturday"].map((item) => <option key={item}>{item}</option>)}
                        </select>
                        <img src="/figma/chevron.svg" alt="" className="pointer-events-none absolute top-1/2 right-2 size-5 -translate-y-1/2" />
                      </span>
                    </label>
                    <label className="text-[12px] leading-[18px] text-black/50">
                      Time
                      <span className="relative mt-1 block">
                        <select value={scheduleTime} onChange={(event) => setScheduleTime(event.target.value)} className="h-10 w-full appearance-none rounded-xl border border-[#E2DFDF] bg-white px-3 pr-9 text-sm text-ink">
                          {["08:00 AM", "09:00 AM"].map((item) => <option key={item}>{item}</option>)}
                        </select>
                        <img src="/figma/chevron.svg" alt="" className="pointer-events-none absolute top-1/2 right-2 size-5 -translate-y-1/2" />
                      </span>
                    </label>
                  </div>
                  <p className="mt-4 text-[12px] leading-[18px] text-black/50">Send Report To</p>
                  <div className="mt-1 rounded-xl border border-[#E2DFDF] px-2 py-2">
                    <div className="flex flex-wrap gap-2">
                      {recipients.map((item) => (
                        <span key={item} className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-[#E3ECF2] px-2 text-[12px] leading-[18px] text-ink">
                          {item}
                          <button type="button" aria-label={`Remove ${item}`} onClick={() => setRecipients((current) => current.filter((value) => value !== item))} className="text-sm leading-none text-[#4E505A]">×</button>
                        </span>
                      ))}
                    </div>
                    <input value={recipient} onChange={(event) => setRecipient(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addRecipient(); } }} placeholder="Type name or email..." className="mt-2 h-7 w-full bg-transparent px-1 text-sm text-ink outline-none placeholder:text-black/50" />
                  </div>
                </div>
              )}
            </div>
            <footer className="flex h-[76px] items-center justify-between border-t border-[#E2DFDF] px-6">
              <div className="flex h-10 items-center rounded-xl border border-[#E2DFDF] p-1">
                {["PDF", "XLSX", "CSV"].map((item) => (
                  <button key={item} type="button" onClick={() => setFormat(item)} className={`h-8 rounded-lg px-3 text-[12px] font-medium ${format === item ? "bg-[#E3ECF2] text-ink" : "text-[#4E505A]"}`}>{item}</button>
                ))}
              </div>
              <button type="button" onClick={createReport} className="inline-flex h-11 w-[88px] items-center justify-center rounded-xl bg-primary text-sm font-medium text-white">Create</button>
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
                <img src="/figma/close.svg" alt="" className="size-7" />
              </button>
            </header>
            <p className="mt-4 text-sm font-medium leading-[21px]">Step 1 Report & Scope</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-[12px] leading-[18px] text-black/50">
                Report Template
                <select value={scheduleTemplate} onChange={(event) => setScheduleTemplate(event.target.value)} className="mt-1 flex h-10 w-full items-center rounded-xl border border-[#E2DFDF] px-3 text-sm text-ink">
                  {allTemplates.map((item) => <option key={item.title}>{item.title}</option>)}
                </select>
              </label>
              <label className="text-[12px] leading-[18px] text-black/50">
                Branches
                <select value={scheduleBranch} onChange={(event) => setScheduleBranch(event.target.value)} className="mt-1 flex h-10 w-full items-center rounded-xl border border-[#E2DFDF] px-3 text-sm text-ink">
                  {branchOptions.map((item) => <option key={item}>{item}</option>)}
                </select>
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
            <input value={recipient} onChange={(event) => setRecipient(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addRecipient(); } }} placeholder="Type name or email..." className="mt-1 h-10 w-full rounded-xl border border-[#E2DFDF] px-3 text-sm outline-none placeholder:text-black/50" />
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setScheduleOpen(false)} className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E2DFDF] px-4 text-sm font-medium text-[#4E505A]">Cancel</button>
              <button type="button" onClick={saveSchedule} className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-white">Save Schedule</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
