import { useEffect, useMemo, useState } from "react";
import { ColumnSizer, ResizableTh, columnTableWidth, useResizableColumns } from "./columnResize";
import { branchProfiles, branches, formatNumber, formatSigned, performanceRows } from "../dashboardData";
import Icon from "./Icon";
import Menu from "./Menu";

const growthBars = {
  "Jeddah 01": { label: "+22%", height: 28, up: true },
  "Riyadh 02": { label: "+8.4%", height: 19, up: true },
  "Dammam 01": { label: "+1.5%", height: 14, up: true },
  "Riyadh 01": { label: "-9.0%", height: 18, up: false },
};

const sortColumns = [
  { key: "salesSar", label: "Sales (SAR)" },
  { key: "budget", label: "Budget Achievement %" },
  { key: "aov", label: "AOV" },
  { key: "totalCost", label: "Total Cost (SAR)" },
  { key: "contribution", label: "Operating Contribution (SAR)" },
  { key: "lflValue", label: "LFL Growth" },
];

function statusClass(status) {
  if (status === "Optimal") return "bg-[#E3F7E4] text-[#359839]";
  if (status === "Stable") return "bg-[#E3ECF2] text-[#4280A7]";
  return "bg-[#FFF5E6] text-[#BF7200]";
}

function lflValue(text) {
  return Number(text.replace("%", ""));
}

const budgetBars = {
  "Jeddah 01": [186, 140],
  "Riyadh 02": [141, 110],
  "Dammam 01": [83, 93],
  "Riyadh 01": [37, 56],
};

const lflBars = {
  "Jeddah 01": [
    ["2.2 M", 184],
    ["0.9 M", 88],
  ],
  "Riyadh 02": [
    ["1.57 M", 149],
    ["0.7 M", 71],
  ],
  "Dammam 01": [
    ["0.94 M", 79],
    ["0.9 M", 66],
  ],
  "Riyadh 01": [
    ["0.52 M", 64],
    ["0.5 M", 49],
  ],
};

const axisLabels = ["2.0 M", "1.5 M", "1.0 M", "0.5 M", "0.0 M"];

function BranchBars({ rows, mode }) {
  return (
    <div className="relative h-[230px] w-full">
      <div className="absolute top-7 left-0 flex h-[176px] w-11 flex-col justify-end gap-6 text-right text-[12px] leading-[1.5] text-black/50">
        {axisLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="absolute top-7 right-0 left-14 h-[176px]">
        <img
          src={mode === "lfl" ? "/figma/grid-lfl.svg" : "/figma/grid-budget.svg"}
          alt=""
          className="pointer-events-none absolute inset-0 size-full max-w-none"
        />
        <div className="absolute inset-0 flex items-end justify-around">
          {rows.map((item) => {
            const pair = lflBars[item.name];
            const heights = budgetBars[item.name] ?? [80, 60];
            const bars = mode === "lfl"
              ? [
                  { label: pair?.[0][0], height: pair?.[0][1] ?? 80, color: "#32607D" },
                  { label: pair?.[1][0], height: pair?.[1][1] ?? 50, color: "#C4D8E4" },
                ]
              : [
                  { height: heights[0], color: "#4280A7" },
                  { height: heights[1], color: "#C4D8E4" },
                ];
            return (
              <div key={item.name} className="flex w-[77px] items-end justify-center gap-1">
                {bars.map((bar) => (
                  <span key={bar.color} className="relative w-5">
                    {bar.label && (
                      <span className="absolute bottom-full left-1/2 mb-0.5 -translate-x-1/2 whitespace-nowrap text-[12px] leading-[1.5] text-black/50">
                        {bar.label}
                      </span>
                    )}
                    <span className="block w-5 rounded-lg" style={{ height: bar.height, backgroundColor: bar.color }} />
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 left-14 flex justify-around text-center text-[12px] font-medium leading-[1.5] text-[#4E505A]">
        {rows.map((item) => (
          <span key={item.name} className="w-[77px]">{item.name}</span>
        ))}
      </div>
    </div>
  );
}

function GrowthChart({ rows }) {
  const labels = ["+100%", "+50%", "0", "-50%", "-100%"];
  return (
    <div className="relative h-[220px] w-full">
      <div className="flex h-[176px] gap-3">
        <div className="flex h-full flex-col justify-between text-right text-[12px] leading-[1.5] text-black/50">
          {labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          <img src="/figma/grid-lfl.svg" alt="" className="pointer-events-none absolute inset-0 size-full max-w-none" />
          <div className="absolute inset-0 flex items-stretch justify-around">
            {rows.map((item) => {
              const bar = growthBars[item.name] ?? { label: item.lfl, height: 16, up: item.lflUp };
              return (
                <div key={item.name} className="flex w-[77px] flex-col">
                  <div className="flex h-1/2 flex-col items-center justify-end">
                    {bar.up && (
                      <>
                        <span className="text-[12px] leading-[1.5] text-black/50">{bar.label}</span>
                        <span className="w-5 rounded-t-lg bg-[#4280A7]" style={{ height: bar.height }} />
                      </>
                    )}
                  </div>
                  <div className="flex h-1/2 flex-col items-center">
                    {!bar.up && (
                      <>
                        <span className="w-5 rounded-b-lg bg-[#E7B0BA]" style={{ height: bar.height }} />
                        <span className="text-[12px] leading-[1.5] text-black/50">{bar.label}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-1 flex justify-around pl-14 text-center text-[12px] font-medium leading-[1.5] text-[#4E505A]">
        {rows.map((item) => (
          <span key={item.name} className="w-[77px]">{item.name}</span>
        ))}
      </div>
    </div>
  );
}

export default function PerformanceView({
  period,
  periods,
  branch,
  search,
  openMenu,
  setOpenMenu,
  setPeriod,
  setBranch,
  menusRef,
}) {
  const [sort, setSort] = useState(null);
  const [lflMode, setLflMode] = useState("growth");
  const [copied, setCopied] = useState(false);
  const [shareText, setShareText] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const columns = useResizableColumns(sortColumns.length + 2);

  useEffect(() => {
    if (!selectedBranch) return undefined;
    function onKey(event) {
      if (event.key === "Escape") setSelectedBranch(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedBranch]);

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = performanceRows.filter((item) => {
      const matchesBranch = branch === "All branches" || item.name === branch;
      const matchesSearch = !query || item.name.toLowerCase().includes(query);
      return matchesBranch && matchesSearch;
    });
    if (!sort) return filtered;
    const direction = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const left = sort.key === "lflValue" ? lflValue(a.lfl) : a[sort.key];
      const right = sort.key === "lflValue" ? lflValue(b.lfl) : b[sort.key];
      return (left - right) * direction;
    });
  }, [branch, search, sort]);

  function toggleSort(key) {
    setSort((current) => {
      if (!current || current.key !== key) return { key, dir: "desc" };
      if (current.dir === "desc") return { key, dir: "asc" };
      return null;
    });
  }

  async function shareSummary() {
    const text = rows
      .map((item) => `${item.name}: net sales ${formatNumber(item.netSales)}, LFL ${item.lfl}`)
      .join("\n");
    const payload = { title: "Branches Performance", text, url: window.location.href };
    const full = `${payload.title}\n${payload.url}\n${text}`;
    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }
    let copiedText = false;
    try {
      await navigator.clipboard.writeText(full);
      copiedText = true;
    } catch {
      const area = document.createElement("textarea");
      area.value = full;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      copiedText = document.execCommand("copy");
      area.remove();
    }
    if (copiedText) {
      setShareText("");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
      return;
    }
    setCopied(false);
    setShareText(full);
  }

  function printSummary() {
    window.print();
  }

  function downloadSummary() {
    const header = ["Branch Name", "Net Sales", "Orders", "Budget Achievement %", "Var", "AOV", "Total Cost (SAR)", "Operating Contribution (SAR)", "Margin", "LFL Growth", "Status"];
    const lines = rows.map((item) => [
      item.name,
      item.netSales,
      `${item.orders} ${item.ordersWord}`,
      `${item.budget}%`,
      `${formatSigned(item.budgetVar)}%`,
      item.aov,
      item.totalCost,
      item.contribution,
      `${formatSigned(item.margin)}%`,
      item.lfl,
      item.status,
    ].join(","));
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "branches-summary.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col">
      <div ref={menusRef} className="flex flex-wrap items-center gap-4">
        <Menu
          open={openMenu === "period"}
          label={period}
          onToggle={() => setOpenMenu(openMenu === "period" ? null : "period")}
          options={periods}
          onSelect={(value) => {
            setPeriod(value);
            setOpenMenu(null);
          }}
        />
        <Menu
          open={openMenu === "branch"}
          label={branch}
          onToggle={() => setOpenMenu(openMenu === "branch" ? null : "branch")}
          options={["All branches", ...branches.map((item) => item.name)]}
          onSelect={(value) => {
            setBranch(value);
            setOpenMenu(null);
          }}
        />
        <button
          type="button"
          onClick={downloadSummary}
          className="ml-auto inline-flex h-11 items-center gap-2 rounded-xl border border-primary bg-[#F8F6F6] p-3 text-sm font-medium text-primary"
        >
          Export Report
          <img src="/figma/download.svg" alt="" className="size-[22px] max-w-none" />
        </button>
      </div>

      <article className="mt-6 flex flex-col gap-4 rounded-[20px] bg-white/80 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold leading-[1.5]">Branches summary</h2>
          <div className="relative flex items-center gap-2">
            <button type="button" onClick={shareSummary} className="grid size-8 place-items-center rounded-lg border-[0.5px] border-[#E2DFDF]" aria-label="Share">
              <img src="/figma/share.svg" alt="" className="size-[22px] max-w-none" />
            </button>
            <button type="button" onClick={printSummary} className="grid size-8 place-items-center rounded-lg border-[0.5px] border-[#E2DFDF]" aria-label="Print">
              <img src="/figma/printer.svg" alt="" className="size-[22px] max-w-none" />
            </button>
            <button type="button" onClick={downloadSummary} className="grid size-8 place-items-center rounded-lg border-[0.5px] border-[#E2DFDF]" aria-label="Download">
              <img src="/figma/download.svg" alt="" className="size-[22px] max-w-none" />
            </button>
            {copied && (
              <span className="absolute right-0 top-9 z-20 whitespace-nowrap rounded-md bg-primary px-2 py-1 text-[11px] text-white">Link copied</span>
            )}
            {shareText && (
              <div className="absolute right-0 top-9 z-20 w-72 rounded-xl bg-white p-3 text-left text-[12px] leading-5 text-ink shadow-[0_8px_24px_rgba(23,48,70,0.12)]">
                <p className="font-semibold">Branches Performance</p>
                <p className="mt-1 whitespace-pre-wrap text-muted">{shareText}</p>
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className={`border-separate border-spacing-0 text-left table-fixed ${columns.widths ? "" : "w-full min-w-[980px]"}`} style={columns.widths ? { width: columnTableWidth(columns.widths) } : undefined}>
            <ColumnSizer widths={columns.widths} />
            <thead ref={columns.headRef} className="text-[12px] font-medium leading-[1.5] text-black/50">
              <tr>
                <ResizableTh index={0} onResizeStart={columns.onResizeStart} className="h-10 border-b border-[#E2DFDF] pr-3 font-medium">Branch Name</ResizableTh>
                {sortColumns.map((column, index) => (
                  <ResizableTh key={column.key} index={index + 1} onResizeStart={columns.onResizeStart} className="h-10 border-b border-[#E2DFDF] px-3 font-medium">
                    <button type="button" onClick={() => toggleSort(column.key)} className="whitespace-nowrap font-medium">
                      {column.label}
                    </button>
                  </ResizableTh>
                ))}
                <ResizableTh index={sortColumns.length + 1} onResizeStart={columns.onResizeStart} className="h-10 border-b border-[#E2DFDF] px-3 font-medium">Status</ResizableTh>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                const onTarget = item.budget >= 100;
                return (
                  <tr key={item.name} className="h-[55px]">
                    <td className="pr-3">
                      <button type="button" onClick={() => setSelectedBranch(item)} className="text-sm font-semibold leading-[1.5]">
                        {item.name}
                      </button>
                    </td>
                    <td className="px-3">
                      <div className="text-sm font-normal leading-[1.5]">{formatNumber(item.salesSar)}</div>
                      <div className="text-[12px] leading-[1.5] text-black/50">
                        {formatNumber(item.orders)} {item.ordersWord}
                      </div>
                    </td>
                    <td className="px-3">
                      <div className={`text-sm font-normal leading-[1.5] ${onTarget ? "text-[#359839]" : "text-danger"}`}>{item.budget}%</div>
                      <div className="text-[12px] leading-[1.5] text-black/50">
                        Var: {formatSigned(item.budgetVar)}%
                      </div>
                    </td>
                    <td className="px-3 text-sm font-normal leading-[1.5]">{item.aov}</td>
                    <td className="px-3 text-sm font-normal leading-[1.5]">{formatNumber(item.totalCost)}</td>
                    <td className="px-3">
                      <div className="text-sm font-normal leading-[1.5]">
                        {item.contribution < 0 ? "-" : ""}
                        {formatNumber(item.contribution)}
                      </div>
                      <div className="text-[12px] leading-[1.5] text-black/50">Margin: {formatSigned(item.margin)}%</div>
                    </td>
                    <td className="px-3">
                      <span className={`inline-flex items-center gap-1 text-sm font-normal leading-[1.5] ${item.lflUp ? "text-[#359839]" : "text-danger"}`}>
                        {item.lfl}
                        <img src={item.lflUp ? "/figma/arrow-rise.svg" : "/figma/arrow-fall.svg"} alt="" className="size-4 max-w-none" />
                      </span>
                    </td>
                    <td className="px-3">
                      <span className={`inline-flex h-[26px] items-center gap-2 rounded-xl px-2.5 py-1 text-[12px] font-medium leading-[1.5] ${statusClass(item.status)}`}>
                        <span className="size-1.5 rounded-full bg-current" />
                        {item.status === "In Loss" ? "In Loss" : item.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && <p className="py-8 text-center text-sm text-muted">No branches match this search.</p>}
        </div>
      </article>

      <section className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <article className="flex flex-col items-center gap-4 rounded-[20px] bg-white/80 p-6">
          <div className="w-full">
            <h2 className="text-sm font-semibold leading-[1.5]">Sales vs Budget by Branch</h2>
            <p className="text-[12px] leading-[1.5] text-black/50">Nov2026</p>
          </div>
          <BranchBars rows={rows} mode="budget" />
          <div className="flex items-center gap-4 text-[12px] font-medium leading-[1.5] text-[#4E505A]">
            <span className="inline-flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#4280A7]" />Sales</span>
            <span className="inline-flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#C4D8E4]" />Budget</span>
          </div>
        </article>
        <article className="flex flex-col items-center gap-4 rounded-[20px] bg-white/80 p-6">
          <div className="flex w-full items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold leading-[1.5]">{lflMode === "growth" ? "Branch Growth LFL" : "Branches Sales LFL"}</h2>
              {lflMode === "growth" && <p className="text-[12px] leading-[1.5] text-black/50">Nov2026 vs. Nov2025</p>}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLflMode("sales")}
                className={`flex h-9 items-center justify-center rounded-xl border border-[#E2DFDF] p-3 text-sm font-medium leading-[1.5] ${lflMode === "sales" ? "bg-[#F6F6F6] text-ink" : "text-[#4E505A]"}`}
              >
                Sales
              </button>
              <button
                type="button"
                onClick={() => setLflMode("growth")}
                className={`flex h-9 items-center justify-center rounded-xl border border-[#E2DFDF] p-3 text-sm font-medium leading-[1.5] ${lflMode === "growth" ? "bg-[#F6F6F6] text-ink" : "text-[#4E505A]"}`}
              >
                Growth
              </button>
            </div>
          </div>
          {lflMode === "growth" ? <GrowthChart rows={rows} /> : <BranchBars rows={rows} mode="lfl" />}
          {lflMode === "sales" && (
            <div className="flex items-center gap-4 text-[12px] leading-[1.5] text-black/50">
              <span className="inline-flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#32607D]" />Nov2026</span>
              <span className="inline-flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#C4D8E4]" /><span className="font-medium">Same</span> Month Last year</span>
            </div>
          )}
        </article>
      </section>
      {selectedBranch && (
        <BranchCard branch={selectedBranch} onClose={() => setSelectedBranch(null)} />
      )}
    </div>
  );
}

function BranchCard({ branch, onClose }) {
  const known = branchProfiles[branch.name];
  const profile = known ?? {
    ...branchProfiles["Jeddah 01"],
    location: branch.name.replace(/\s+\d+$/, ""),
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="branch-card-title"
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-[740px] rounded-3xl bg-white px-8 pb-8 pt-8 font-sans text-ink shadow-[0_16px_48px_rgba(23,48,70,0.18)]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-7 top-7 grid h-10 w-10 place-items-center text-muted"
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <path d="M7 7l10 10M17 7 7 17" />
          </svg>
        </button>
        <h2 id="branch-card-title" className="pr-14 text-[26px] font-bold leading-none">
          {branch.name}(Branch name)
        </h2>
        <p className="mt-4 text-base font-medium leading-none text-secondary">{profile.hours}</p>
        <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-3.5 text-base leading-none sm:grid-cols-2">
          <p className="flex items-center gap-2 text-muted">
            <PersonIcon />
            <span>
              Branch Manager: <span className="font-semibold text-ink">{profile.manager}</span>
            </span>
          </p>
          <p className="flex items-center gap-2 text-muted">
            <PhoneIcon />
            <span>
              Phone: <span className="font-semibold text-ink">{profile.phone}</span>
            </span>
          </p>
          <p className="flex items-center gap-2 text-muted">
            <PinIcon />
            <span>
              Location: <span className="font-semibold text-ink">{profile.location}</span>
            </span>
          </p>
        </div>
        <div className="mt-6 rounded-2xl bg-[#ECF2F6] px-5 py-4">
          <div className="flex items-center gap-2 text-primary">
            <Icon name="spark" className="h-5 w-5" />
            <p className="text-lg font-semibold leading-none">AI Strategic Assessment :</p>
          </div>
          <p className="mt-3 text-base font-normal leading-[26px] text-subtle">{profile.assessment}</p>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button type="button" className="h-[50px] rounded-xl bg-primary text-base font-medium text-white">
            View Branch Details
          </button>
          <a
            href={`tel:${profile.phone.replace(/\s/g, "")}`}
            className="grid h-[50px] place-items-center rounded-xl border border-primary text-base font-medium text-primary"
          >
            Contact Manager
          </a>
        </div>
      </div>
    </div>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.5 19.25c.7-2.9 3.3-4.75 6.5-4.75s5.8 1.85 6.5 4.75" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8.2 3.8h2.1l1.2 3-1.6 1.1a12.5 12.5 0 0 0 5.2 5.2l1.1-1.6 3 1.2v2.1c0 .7-.5 1.3-1.2 1.4A15.2 15.2 0 0 1 6.8 5c.1-.7.7-1.2 1.4-1.2Z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s6-5.1 6-10a6 6 0 1 0-12 0c0 4.9 6 10 6 10Z" />
      <circle cx="12" cy="11" r="2" />
    </svg>
  );
}
