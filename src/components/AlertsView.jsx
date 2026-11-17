import { useEffect, useMemo, useRef, useState } from "react";

const feed = [
  {
    id: "waste",
    type: "Critical",
    branch: "Riyadh 01",
    time: "Nov 15, 2026 · 09:30 AM",
    title: "Food Waste Exceeded Approved Threshold",
    body: "Weekly waste cost reached 31,400 SAR (8.4% of net sales), driven by higher kitchen prep variance.",
    value: "8.4% Actual",
    target: "Target: ≤ 5.0%",
    criticalValue: true,
    detail: {
      changed: (
        <>
          Food waste cost in <span className="font-bold">Riyadh 01</span> reached <span className="font-bold">260,000 SAR</span> this month (52.0% of net sales), exceeding the approved 25.0% threshold by +27.0 percentage points.
        </>
      ),
      impact: "-21,000 SAR",
      impactNote: "Net operating loss recorded in Riyadh 01 for Nov 2026 due to excessive food waste.",
      impactCritical: true,
      evidence: [
        ["Detected Value", "52.0% (260,000 SAR)", true],
        ["Approved Threshold", "≤ 25.0% of Net Sales", false],
        ["Evaluation Period", "Nov 01 – Nov 30, 2026", false],
      ],
    },
  },
  {
    id: "weekly-14",
    type: "Weekly Summary",
    branch: "All Branches",
    time: "Nov 14, 2026 · 04:15 PM",
    title: "Weekly Net Sales",
    body: "Branch weekly revenue declined by 14.5% following lower weekday dine-in traffic.",
    value: "-14.5% vs Target",
    target: "Target: 2,260K SAR",
    criticalValue: false,
  },
  {
    id: "margin",
    type: "Critical",
    branch: "All Branches",
    time: "Nov 13, 2026 · 04:15 PM",
    title: "Consolidated Net Operating Margin Contraction",
    body: "Total company operating margin dropped by 3.1% across all active branches compared to Q3 average.",
    value: "20.9% Net Margin",
    target: "Target: ≥ 24.0%",
    criticalValue: true,
  },
  {
    id: "weekly-12",
    type: "Weekly Summary",
    branch: "All Branches",
    time: "Nov 12, 2026 · 04:15 PM",
    title: "Weekly Net Sales",
    body: "Weekly net sales reached 1,180K SAR across all branches, trailing the weekly target by 6.3%.",
    value: "-6.3% vs Target",
    target: "Target: 1,260K SAR",
    criticalValue: false,
  },
];

const archive = [
  {
    id: "archive-oct-14",
    type: "Weekly Summary",
    branch: "All Branches",
    time: "Oct 14, 2026 · 04:15 PM",
    title: "Weekly Net Sales",
    body: "Weekly net sales reached 1,180K SAR across all branches, trailing the weekly target by 6.3%.",
    value: "-6.3% vs Target",
    target: "Target: 1,260K SAR",
    criticalValue: false,
  },
  {
    id: "archive-oct-7",
    type: "Weekly Summary",
    branch: "All Branches",
    time: "Oct 7, 2026 · 04:15 PM",
    title: "Weekly Net Sales",
    body: "Weekly net sales reached 800K SAR across all branches, trailing the weekly target by 14.5%.",
    value: "-14.5% vs Target",
    target: "Target: 1,000K SAR",
    criticalValue: false,
  },
  {
    id: "archive-waste",
    type: "Critical",
    branch: "Riyadh 01",
    time: "Oct 5, 2026 · 09:30 AM",
    title: "Food Waste Exceeded Approved Threshold",
    body: "Weekly waste cost reached 31,400 SAR (8.4% of net sales), driven by higher kitchen prep variance.",
    value: "8.4% Actual",
    target: "Target: ≤ 5.0%",
    criticalValue: true,
    detail: feed[0].detail,
  },
  {
    id: "archive-margin",
    type: "Critical",
    branch: "All Branches",
    time: "Sep 27, 2026 · 04:15 PM",
    title: "Consolidated Net Operating Margin Contraction",
    body: "Total company operating margin dropped by 3.1% across all active branches compared to Q3 average.",
    value: "20.9% Net Margin",
    target: "Target: ≥ 24.0%",
    criticalValue: true,
  },
];

const branches = ["All Branches", "Jeddah 01", "Riyadh 02", "Dammam 01", "Riyadh 01"];
const types = ["All Types", "Critical", "Weekly Summary"];

function FilterMenu({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(event) {
      if (!ref.current?.contains(event.target)) setOpen(false);
    }
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className={`inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-[#E2DFDF] px-3 text-sm font-medium leading-[1.5] text-[#4E505A] ${open ? "bg-white" : "bg-transparent"}`}
      >
        <span className="whitespace-nowrap">{value}</span>
        <img src="/figma/chevron.svg" alt="" className={`size-[22px] max-w-none ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="absolute right-0 top-[44px] z-30 w-max min-w-full rounded-xl bg-white py-2 shadow-[0_8px_24px_rgba(38,38,38,0.08)]">
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className="block w-full whitespace-nowrap px-4 py-2.5 text-left text-sm leading-[1.5] text-[#4E505A] hover:bg-[#F6F6F6]"
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AlertsView() {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState("All Branches");
  const [type, setType] = useState("All Types");
  const [selected, setSelected] = useState(null);
  const criticalCount = feed.filter((item) => item.type === "Critical").length;

  const source = tab === "archive" ? archive : feed;

  const rows = useMemo(() => {
    const text = query.trim().toLowerCase();
    return source.filter((item) => {
      const matchesBranch = branch === "All Branches" || item.branch === branch;
      const matchesType = type === "All Types" || item.type === type;
      const matchesQuery = !text || `${item.title} ${item.body} ${item.branch} ${item.type}`.toLowerCase().includes(text);
      return matchesBranch && matchesType && matchesQuery;
    });
  }, [source, query, branch, type]);

  useEffect(() => {
    if (!selected) return undefined;
    function onKey(event) {
      if (event.key === "Escape") setSelected(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  function exportFeed() {
    const lines = [
      ["Type", "Branch", "Time", "Title", "Detail", "Value", "Target"],
      ...rows.map((item) => [item.type, item.branch, item.time, item.title, item.body, item.value, item.target]),
    ];
    const csv = lines.map((line) => line.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "alerts.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex h-11 items-start gap-6 border-b border-[#E2DFDF]">
          <button type="button" onClick={() => setTab("all")} className="relative flex h-11 items-center gap-1 px-0.5 pt-[11px] pb-3">
            <span className={`text-sm font-medium leading-[1.5] ${tab === "all" ? "text-primary" : "text-[#4E505A]"}`}>All Alerts</span>
            {tab === "all" && <span className="grid size-[22px] min-w-[19px] place-items-center rounded-full bg-[#C4D8E4] px-1.5 text-[12px] font-medium leading-[1.5] text-primary">{criticalCount}</span>}
            {tab === "all" && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-sm bg-primary" />}
          </button>
          <button type="button" onClick={() => setTab("archive")} className="relative flex h-11 items-center px-0.5 pt-[11px] pb-3 text-sm font-medium leading-[1.5]">
            <span className={tab === "archive" ? "text-primary" : "text-[#4E505A]"}>Archive</span>
            {tab === "archive" && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-sm bg-primary" />}
          </button>
        </div>
        <button type="button" onClick={exportFeed} className="inline-flex h-11 items-center gap-2 rounded-xl border border-primary bg-[#F8F6F6] p-3 text-sm font-medium text-primary">
          Export Report
          <img src="/figma/download.svg" alt="" className="size-[22px] max-w-none" />
        </button>
      </div>

      <article className="mt-6 flex min-h-[765px] flex-col justify-between rounded-[20px] border border-[#E2DFDF] bg-white/80 p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-sm font-semibold leading-[1.5]">{tab === "archive" ? "Archive" : "Critical Alerts & Weekly Summary Feed"}</h2>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex h-9 w-[198px] items-center gap-3 overflow-hidden rounded-xl border border-[#E2DFDF] bg-white px-2">
                <img src="/figma/search.svg" alt="" className="size-[18px] max-w-none" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search"
                  className="w-full bg-transparent text-sm font-medium leading-[1.5] text-[#4E505A] outline-none placeholder:text-[#4E505A]"
                />
              </label>
              <FilterMenu label="All Branches" options={branches} value={branch} onChange={setBranch} />
              <FilterMenu label="All Types" options={types} value={type} onChange={setType} />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {rows.map((item) => (
              <article
                key={item.id}
                className="flex flex-wrap items-center gap-6 rounded-xl border border-[#E2DFDF] px-5 py-4"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-lg px-2 py-0.5 text-[12px] font-medium leading-[1.5] ${tab === "archive" ? "bg-[#F6F6F6] text-ink" : item.type === "Critical" ? "bg-[#F7E6E9] text-[#B00020]" : "bg-[#E3ECF2] text-[#32607D]"}`}>
                      {item.type}
                    </span>
                    <span className="rounded-lg bg-[#F6F6F6] px-2 py-0.5 text-[12px] font-medium leading-[1.5] text-[#4E505A]">{item.branch}</span>
                    <span className="text-[12px] leading-[1.5] text-black/50">{item.time}</span>
                  </div>
                  <h3 className="text-sm font-semibold leading-[1.5]">{item.title}</h3>
                  <p className="text-[12px] leading-[1.5] text-black/50">{item.body}</p>
                </div>
                <div className="flex items-center gap-5">
                  <div className="flex min-w-[120px] flex-col items-end gap-0.5 text-right">
                    <p className={`text-sm font-semibold leading-normal ${tab === "archive" || !item.criticalValue ? "text-ink" : "text-[#B00020]"}`}>{item.value}</p>
                    <p className="text-[12px] leading-[1.5] text-black/50">{item.target}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-[#E2DFDF] bg-white p-3 text-sm font-medium leading-[1.5] text-[#4E505A]"
                  >
                    View Details
                  </button>
                </div>
              </article>
            ))}
            {rows.length === 0 && <p className="py-8 text-center text-sm text-muted">No alerts match this filter.</p>}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 pb-1">
          <p className="text-[12px] leading-[1.5] text-black/50">Showing {rows.length} of {source.length} alerts</p>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg border-[0.5px] border-[#E2DFDF]">
              <img src="/figma/arrow-left.svg" alt="" className="size-[22px] max-w-none" />
            </span>
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-medium leading-[1.5] text-white">1</span>
            <span className="grid size-8 place-items-center rounded-lg border-[0.5px] border-[#E2DFDF]">
              <img src="/figma/arrow-right.svg" alt="" className="size-[22px] max-w-none" />
            </span>
          </div>
        </div>
      </article>
      {selected && <AlertDrawer alert={selected} neutral={tab === "archive"} onClose={() => setSelected(null)} />}
    </div>
  );
}

function fallbackDetail(alert) {
  return {
    changed: alert.body,
    impact: alert.value,
    impactNote: alert.target,
    impactCritical: alert.criticalValue || alert.value.startsWith("-"),
    evidence: [
      ["Detected Value", alert.value, alert.criticalValue || alert.value.startsWith("-")],
      ["Approved Threshold", alert.target.replace("Target: ", ""), false],
      ["Evaluation Period", alert.time.split(" · ")[0], false],
    ],
  };
}

function AlertDrawer({ alert, neutral = false, onClose }) {
  const detail = alert.detail ?? fallbackDetail(alert);

  function exportDetail() {
    const lines = [alert.title, alert.type, alert.branch, detail.impact, detail.impactNote, ...detail.evidence.map((row) => row.slice(0, 2).join(": "))];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "alert-detail.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(6,6,6,0.4)]" onClick={onClose}>
      <aside
        className="absolute top-0 right-0 flex h-full w-[480px] max-w-full flex-col rounded-tl-[20px] rounded-bl-[20px] bg-white shadow-[-12px_0_35px_rgba(0,0,0,0.05)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E2DFDF] px-6 py-5">
          <div className="flex min-w-0 flex-col gap-1.5">
            <h2 className="text-[18px] font-semibold leading-[1.5]">{alert.title}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-lg px-2 py-0.5 text-[12px] font-medium leading-[1.5] ${neutral ? "bg-[#F6F6F6] text-ink" : alert.type === "Critical" ? "bg-[#F7E6E9] text-[#B00020]" : "bg-[#E3ECF2] text-[#32607D]"}`}>{alert.type}</span>
              <span className="rounded-lg bg-[#F6F6F6] px-2 py-0.5 text-[12px] font-medium leading-[1.5] text-[#4E505A]">{alert.branch}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-8 shrink-0 place-items-center rounded-xl border-[0.5px] border-[#E2DFDF] bg-[#F6F6F6]">
            <img src="/figma/close.svg" alt="" className="size-6 max-w-none" />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-6">
          <section className="flex flex-col gap-4 rounded-2xl p-4">
            <h3 className="text-sm font-semibold leading-[1.5]">What Changed</h3>
            <p className="text-sm leading-[1.5] text-[#4E505A]">{detail.changed}</p>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium leading-[1.5]">Net Financial Impact</h3>
              <p className={`text-[24px] font-semibold leading-[1.5] ${!neutral && detail.impactCritical ? "text-[#B00020]" : "text-ink"}`}>{detail.impact}</p>
              <p className="text-[12px] leading-[1.5] text-black/50">{detail.impactNote}</p>
            </div>
          </section>
          <section className="flex flex-col gap-2 rounded-xl border border-[#E2DFDF] bg-white p-4">
            <h3 className="text-sm font-semibold leading-[1.5]">Evidence</h3>
            {detail.evidence.map(([label, value, critical], index) => (
              <div key={label} className={`flex min-h-11 items-center justify-between gap-4 py-[11px] ${index < detail.evidence.length - 1 ? "border-b border-[#E2DFDF]" : ""}`}>
                <span className="text-[12px] leading-[1.5] text-black/50">{label}</span>
                <span className={`text-right text-sm leading-[1.5] ${!neutral && critical ? "font-semibold text-[#B00020]" : "font-medium text-ink"}`}>{value}</span>
              </div>
            ))}
          </section>
        </div>
        <div className="flex h-[76px] items-center justify-end border-t border-[#E2DFDF] px-6 py-4">
          <button type="button" onClick={exportDetail} className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E2DFDF] px-3 text-sm font-medium text-[#4E505A]">
            Export
          </button>
        </div>
      </aside>
    </div>
  );
}
