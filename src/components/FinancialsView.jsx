import { useMemo, useState } from "react";
import Menu from "./Menu";

const waterfall = [
  { label: "Gross Sales", value: "5,150 K", bar: 179, color: "#C4D8E4", box: 239, stack: 206, pin: "end", radius: "rounded-tl-[2px] rounded-bl-[2px] rounded-br-[2px]" },
  { label: "Discounts", value: "- 80 K", bar: 16, color: "#E7B0BA", box: 239, stack: 43, pin: "between", radius: "rounded-tr-[2px]" },
  { label: "Refunds", value: "- 30 K", bar: 12, color: "#E7B0BA", box: 219, stack: 34, pin: "between", radius: "rounded-tr-[2px]" },
  { label: "Net Sales", value: "5,040 K", bar: 152, color: "#4280A7", box: 219, stack: 186, pin: "end", radius: "rounded-bl-[2px] rounded-br-[2px]" },
  { label: "COGS", value: "- 1,420 K", bar: 30, color: "#E7B0BA", box: 211, stack: 56, pin: "between", radius: "rounded-tr-[2px]" },
  { label: "Waste Cost", value: "- 1,260 K", bar: 31, color: "#E7B0BA", box: 177, pin: "between", radius: "rounded-bl-[2px] rounded-tr-[2px]" },
  { label: "Labor", value: "- 600 K", bar: 29, color: "#E7B0BA", box: 146, pin: "between", radius: "rounded-bl-[2px] rounded-tr-[2px]" },
  { label: "Rent", value: "- 350 K", bar: 23, color: "#E7B0BA", box: 117, pin: "between", radius: "rounded-bl-[2px] rounded-tr-[2px]" },
  { label: "Utilities", value: "- 40 K", bar: 11, color: "#E7B0BA", box: 94, pin: "between", radius: "rounded-bl-[1px] rounded-tr-[1px]" },
  { label: "OPEX", value: "- 10 K", bar: 3, color: "#E7B0BA", box: 79, stack: 21, pin: "between", radius: "rounded-bl-[0.8px] rounded-tr-[0.8px]" },
  { label: "Operating Contribution", value: "1,160 K", bar: 26, color: "#32607D", box: 89, stack: 57, pin: "between", radius: "rounded-tr-[2px] rounded-bl-[2px] rounded-br-[2px]", wide: true },
];

const costs = [
  { name: "COGS", amount: "1,420 K", share: "36.6%", delta: "-5%", tone: "down" },
  { name: "Wastes", amount: "1,260 K", share: "32.5%", delta: "+5%", tone: "up" },
  { name: "Labor", amount: "600 K", share: "15.5%", delta: "0%", tone: "flat" },
  { name: "Rent", amount: "350 K", share: "9.0%", delta: "-2%", tone: "down" },
  { name: "Utilities", amount: "40 K", share: "1.0%", delta: "-7%", tone: "down" },
  { name: "Other opex", amount: "10 K", share: "0.4%", delta: "-4%", tone: "down" },
];

const columns = [
  { key: "net", label: "Net Sales", active: true },
  { key: "cogs", label: "COGS" },
  { key: "waste", label: "Waste Cost" },
  { key: "labor", label: "Labor" },
  { key: "rent", label: "Rent" },
  { key: "utilities", label: "Utilities" },
  { key: "opex", label: "Other OPEX" },
  { key: "total", label: "Total Cost", total: true },
];

const branchCosts = [
  { name: "Jeddah 01", net: "2,120 K", cogs: ["580 K", "27.4%"], waste: ["410 K", "19.3%"], labor: ["250 K", "11.8%"], rent: ["145 K", "6.8%"], utilities: ["15 K", "0.7%"], opex: ["4 K", "0.2%"], total: ["1,404 K", "66.2%"] },
  { name: "Riyadh 02", net: "1,510 K", cogs: ["430 K", "28.5%"], waste: ["350 K", "23.2%"], labor: ["180 K", "11.9%"], rent: ["99 K", "6.6%"], utilities: ["11 K", "0.7%"], opex: ["3 K", "0.2%"], total: ["1,073 K", "71.1%"] },
  { name: "Dammam 01", net: "910 K", cogs: ["260 K", "28.6%"], waste: ["240 K", "26.4%"], labor: ["105 K", "11.5%"], rent: ["67 K", "7.4%"], utilities: ["8 K", "0.9%"], opex: ["2 K", "0.2%"], total: ["682 K", "74.9 %"] },
  { name: "Riyadh 01", net: "500 K", cogs: ["150 K", "30.0%"], waste: ["260 K", "52.0%"], labor: ["65 K", "13.0%"], rent: ["39 K", "7.8%"], utilities: ["6 K", "1.2%"], opex: ["1 K", "0.2%"], total: ["521 K", "104.2%"] },
];

const totals = {
  net: "5,040 K",
  cogs: ["1,420 K", "28.2%"],
  waste: ["1,260 K", "25.0%"],
  labor: ["600 K", "11.9%"],
  rent: ["350 K", "6.9%"],
  utilities: ["40 K", "0.8 %"],
  opex: ["10 K", "0.2%"],
  total: ["3,880 K", "77.0%"],
};

function amount(value) {
  return Number(String(value).replace(/[^\d.]/g, "")) || 0;
}

function cellText(value, unit) {
  if (Array.isArray(value)) return unit === "pct" ? value[1] : value[0];
  return value;
}

function BudgetMark() {
  return <img src="/figma/cost-marker.svg" alt="" className="h-6 w-px shrink-0 max-w-none" />;
}

function CostTrack({ children, className = "" }) {
  return <div className={`flex h-6 w-[219px] items-center rounded-lg bg-[#F6F6F6] py-0.5 ${className}`}>{children}</div>;
}

export default function FinancialsView({
  period,
  periods,
  branch,
  search = "",
  openMenu,
  setOpenMenu,
  setPeriod,
  setBranch,
  menusRef,
}) {
  const [unit, setUnit] = useState("sar");
  const [sort, setSort] = useState(null);

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = branchCosts.filter((item) => {
      const matchesBranch = branch === "All branches" || item.name === branch;
      const matchesSearch = !query || item.name.toLowerCase().includes(query);
      return matchesBranch && matchesSearch;
    });
    if (!sort) return filtered;
    const direction = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => (amount(cellText(a[sort.key], unit)) - amount(cellText(b[sort.key], unit))) * direction);
  }, [branch, search, sort, unit]);

  function toggleSort(key) {
    setSort((current) => {
      if (!current || current.key !== key) return { key, dir: "desc" };
      if (current.dir === "desc") return { key, dir: "asc" };
      return null;
    });
  }

  function downloadTable() {
    const headers = ["Branch Name", ...columns.map((column) => column.label)];
    const lines = rows.map((item) => [item.name, ...columns.map((column) => cellText(item[column.key], unit))]);
    if (rows.length === branchCosts.length) {
      lines.push(["Total", ...columns.map((column) => cellText(totals[column.key], unit))]);
    }
    const csv = [headers, ...lines].map((line) => line.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cost-breakdown-by-branch.csv";
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
          options={["All branches", "Jeddah 01", "Riyadh 02", "Dammam 01", "Riyadh 01"]}
          onSelect={(value) => {
            setBranch(value);
            setOpenMenu(null);
          }}
        />
        <button type="button" onClick={downloadTable} className="ml-auto inline-flex h-11 items-center gap-2 rounded-xl border border-primary bg-[#F8F6F6] p-3 text-sm font-medium text-primary">
          Export Report
          <img src="/figma/download.svg" alt="" className="size-[22px] max-w-none" />
        </button>
      </div>

      <article className="mt-6 overflow-hidden rounded-[20px] bg-white/80 p-6">
        <div className="flex flex-col">
          <h2 className="w-[216px] text-sm font-semibold leading-[1.5]">Profit&nbsp;&nbsp;Breakdown</h2>
          <div className="flex items-center justify-end gap-2 pb-1">
            <p className="text-[12px] leading-[1.5] text-black/50">
              Operating Contribution reached <span className="text-[22px] font-semibold text-ink">1,160 K</span>
              {"   from "}
              <span className="text-ink">5,040 K </span>
              Net Sales
            </p>
            <span className="rounded-lg bg-[#E3F7E4] px-2 py-0.5 text-[12px] leading-[1.5] text-[#359839]">23.0%</span>
          </div>
          <div className="flex justify-end border-b border-[#E2DFDF] py-1">
            <p className="inline-flex items-center gap-0.5 text-[12px] leading-[1.5]">
              <img src="/figma/arrow-fall.svg" alt="" className="size-4 max-w-none" />
              <span className="text-[#B00020]">-2.01%</span>
              <span className="text-ink"> vs Nov 2025</span>
            </p>
          </div>
        </div>
        <div className="relative h-[248px]">
          <img src="/figma/financial-grid.svg" alt="" className="pointer-events-none absolute inset-x-0 top-[27px] h-[176px] w-full max-w-none" />
          <div className="absolute bottom-3 left-[calc(50%-7px)] flex h-[239px] -translate-x-1/2 items-end">
            {waterfall.map((item) => (
              <div
                key={item.label}
                className={`flex w-[70px] shrink-0 flex-col items-center ${item.pin === "end" ? "justify-end gap-4" : "justify-between"}`}
                style={{ height: item.box }}
              >
                <div className="flex w-full flex-col items-center justify-end gap-1" style={item.stack ? { height: item.stack } : undefined}>
                  <p className="whitespace-nowrap text-[12px] leading-[1.5] text-[#4E505A]">{item.value}</p>
                  <div className={`w-full ${item.radius}`} style={{ height: item.bar, backgroundColor: item.color }} />
                </div>
                <p className={`text-[12px] font-medium leading-[1.5] text-[#4E505A] ${item.wide ? "w-[136px] whitespace-nowrap" : "text-center"}`}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </article>

      <section className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <article className="flex flex-col gap-4 rounded-[20px] bg-white/80 p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="w-[177px]">
              <h2 className="text-sm font-semibold leading-[1.5]">Cost Breakdown</h2>
              <p className="text-[12px] leading-[1.5] text-black/50">Nov2026</p>
            </div>
            <div className="flex items-center gap-1 text-[12px] leading-4 text-ink">
              <span className="inline-flex items-center py-0.5 pr-2 pl-1">
                <img src="/figma/trend-dot-cost.svg" alt="" className="size-3 max-w-none" />
                Total Cost
              </span>
              <span className="inline-flex items-center gap-1 py-0.5 pr-2 pl-1">
                <img src="/figma/budget-tick.svg" alt="" className="h-[15px] w-px max-w-none" />
                Budget
              </span>
            </div>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-1">
              <div className="flex w-[83px] flex-col gap-2">
                {costs.map((item) => (
                  <span key={item.name} className="flex h-6 items-center text-[12px] font-medium leading-[1.5] text-[#4E505A]">{item.name}</span>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <CostTrack className="gap-[11px]">
                  <span className="h-6 w-24 rounded-l-lg bg-[#E7B0BA]" />
                  <BudgetMark />
                </CostTrack>
                <CostTrack>
                  <span className="h-6 w-20 rounded-l-lg border-r border-ink bg-[#E7B0BA]/90" />
                  <span className="w-3 overflow-hidden">
                    <span className="block h-6 w-4 bg-[#E7B0BA]" />
                  </span>
                </CostTrack>
                <CostTrack>
                  <span className="h-6 w-[55px] rounded-l-lg bg-[#E7B0BA]/80" />
                  <BudgetMark />
                </CostTrack>
                <CostTrack className="gap-px">
                  <span className="flex w-[39px] items-center">
                    <span className="h-6 w-10 rounded-l-lg bg-[#E7B0BA]/70" />
                  </span>
                  <BudgetMark />
                </CostTrack>
                <CostTrack>
                  <span className="flex w-11 items-center">
                    <span className="h-6 w-7 rounded-l-lg bg-[#E7B0BA]/60" />
                  </span>
                  <BudgetMark />
                </CostTrack>
                <CostTrack className="gap-[9px]">
                  <span className="h-6 w-5 rounded-l-lg bg-[#E7B0BA]/50" />
                  <BudgetMark />
                </CostTrack>
              </div>
            </div>
            <div className="flex w-[165px] flex-col gap-2">
              {costs.map((item) => (
                <div key={item.name} className="flex h-6 items-center justify-end gap-2 text-[12px] leading-[1.5]">
                  <span className="w-[60px] text-black/50">{item.amount}</span>
                  <span className="w-[60px] font-medium text-black/50">{item.share}</span>
                  <span className={`w-[29px] ${item.tone === "up" ? "text-[#B00020]" : "text-[#359839]"}`}>{item.delta}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex h-10 items-center justify-between">
            <span className="text-sm font-medium leading-[1.5]">Total Cost</span>
            <span className="w-[101px] text-right text-[18px] font-semibold leading-[1.5]">3,880 K</span>
          </div>
        </article>

        <article className="flex h-[343px] flex-col gap-4 overflow-hidden rounded-[20px] bg-white/80 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold leading-[1.5] whitespace-nowrap">Financial Trend Overview</h2>
            <div className="flex items-center gap-1 text-[12px]">
              <span className="inline-flex items-center py-0.5 pr-2 pl-1 leading-4 text-ink">
                <img src="/figma/trend-dot-sales.svg" alt="" className="size-3 max-w-none" />
                Net Sales
              </span>
              <span className="inline-flex items-center py-0.5 pr-2 pl-1 leading-4 text-ink">
                <img src="/figma/trend-dot-cost.svg" alt="" className="size-3 max-w-none" />
                Total Cost
              </span>
              <span className="inline-flex items-center py-0.5 pr-2 pl-1 font-medium leading-[1.5] text-[#4E505A]">
                <img src="/figma/trend-dashed.svg" alt="" className="size-3 max-w-none" />
                Operating Contribution
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-[221px] flex-col justify-between pb-4 text-right text-[12px] leading-[1.5] text-black/50">
              <span className="font-medium">40K</span>
              <span>30K</span>
              <span>20K</span>
              <span>10K</span>
              <span>0</span>
            </div>
            <div className="min-w-0">
              <div className="relative h-[221px] w-[485px] max-w-full">
                <img src="/figma/financial-trend.svg" alt="" className="absolute top-0 -left-[7.5px] max-w-none" />
              </div>
              <div className="flex w-[485px] max-w-full text-center text-[12px] leading-4 text-black/50">
                {["5", "10", "15", "20", "25", "30"].map((label) => (
                  <span key={label} className="flex-1">{label}</span>
                ))}
              </div>
            </div>
          </div>
        </article>
      </section>

      <article className="mt-6 rounded-[20px] bg-white/80 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-sm font-semibold leading-[1.5]">Cost Breakdown by Branch</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUnit("sar")}
                className={`flex h-9 items-center justify-center rounded-xl border border-[#E2DFDF] p-3 text-sm font-medium leading-[1.5] text-ink ${unit === "sar" ? "bg-[#F6F6F6]" : ""}`}
              >
                SAR
              </button>
              <button
                type="button"
                onClick={() => setUnit("pct")}
                className={`flex h-9 items-center justify-center rounded-xl border border-[#E2DFDF] p-3 text-sm font-medium leading-[1.5] ${unit === "pct" ? "bg-[#F6F6F6] text-[#4E505A]" : "text-[#4E505A]"}`}
              >
                % of Sales
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => navigator.share?.({ title: "Cost Breakdown by Branch", url: window.location.href }).catch(() => {})} className="grid size-8 place-items-center rounded-lg border-[0.5px] border-[#E2DFDF]" aria-label="Share">
                <img src="/figma/share.svg" alt="" className="size-[22px] max-w-none" />
              </button>
              <button type="button" onClick={() => window.print()} className="grid size-8 place-items-center rounded-lg border-[0.5px] border-[#E2DFDF]" aria-label="Print">
                <img src="/figma/printer.svg" alt="" className="size-[22px] max-w-none" />
              </button>
              <button type="button" onClick={downloadTable} className="grid size-8 place-items-center rounded-lg border-[0.5px] border-[#E2DFDF]" aria-label="Download">
                <img src="/figma/download.svg" alt="" className="size-[22px] max-w-none" />
              </button>
            </div>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[980px] border-separate border-spacing-0 text-left">
            <thead>
              <tr className="text-[12px] font-medium text-black/50">
                <th className="h-10 border-b border-[#E2DFDF] pr-3 font-medium">Branch Name</th>
                {columns.map((column) => (
                  <th key={column.key} className={`h-10 border-b border-[#E2DFDF] px-3 font-medium ${column.total ? "border-l border-[#E2DFDF]" : ""}`}>
                    <button type="button" onClick={() => toggleSort(column.key)} className={`inline-flex items-center gap-1 whitespace-nowrap ${column.total ? "text-sm font-semibold text-ink" : ""}`}>
                      {column.label}
                      <img src={column.active && !sort ? "/figma/sort-active.svg" : "/figma/sort.svg"} alt="" className="size-4 max-w-none" />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.name} className="text-sm leading-[1.5]">
                  <td className="h-[55px] pr-3 font-semibold">{item.name}</td>
                  {columns.map((column) => (
                    <td key={column.key} className={`h-[55px] px-3 font-normal ${column.total ? "border-l border-[#E2DFDF]" : ""}`}>
                      {cellText(item[column.key], unit)}
                    </td>
                  ))}
                </tr>
              ))}
              {rows.length === branchCosts.length && (
                <tr className="text-sm leading-[1.5]">
                  <td className="h-[55px] border-t border-[#E2DFDF] pr-3 font-semibold">Total</td>
                  {columns.map((column) => (
                    <td key={column.key} className={`h-[55px] border-t border-[#E2DFDF] px-3 ${column.total ? "border-l border-[#E2DFDF] text-[18px] font-semibold" : "font-normal"}`}>
                      {cellText(totals[column.key], unit)}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
          {rows.length === 0 && <p className="py-8 text-center text-sm text-muted">No branches match this search.</p>}
        </div>
      </article>
    </div>
  );
}
