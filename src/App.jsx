import { useEffect, useMemo, useRef, useState } from "react";
import { ColumnSizer, ResizableTh, columnTableWidth, useResizableColumns } from "./components/columnResize";
import Icon from "./components/Icon";
import AlertsView from "./components/AlertsView";
import FinancialsView from "./components/FinancialsView";
import Menu from "./components/Menu";
import PerformanceView from "./components/PerformanceView";
import ReportsView from "./components/ReportsView";
import SettingsView from "./components/SettingsView";
import {
  alerts,
  branches,
  formatNumber,
  formatSigned,
  kpis,
  periods,
} from "./dashboardData";

const navItems = [
  { id: "overview", label: "Overview", icon: "grid" },
  { id: "performance", label: "Performance", icon: "bars" },
  { id: "financials", label: "Financials", icon: "card" },
  { id: "forecast", label: "Forecast", icon: "chart" },
  { id: "alerts", label: "Alerts", icon: "bell" },
  { id: "reports", label: "Reports", icon: "pages" },
];

const settingsItem = { id: "settings", label: "Settings", icon: "gear" };

const notifications = [
  {
    title: "Critical Alert: Riyadh 01 Waste",
    body: "Food waste exceeded 5.0% threshold (8.4% actual).",
    time: "15m ago",
  },
  {
    title: "Weekly Alerts Summary Ready",
    body: "4 active critical anomalies across branches for week of Nov...",
    time: "Sunday, 09:00 AM",
  },
  {
    title: "Report Shared With You",
    body: 'Operations Manager shared "Daily Sales Snapshot"',
    time: "Nov 01, 2026",
  },
];

const alertTabs = [
  { id: "All", label: "All" },
  { id: "Critical", label: "Critical" },
  { id: "Weekly Alerts", label: "Weekly Alrets" },
];

const navIcons = {
  overview: "/figma/nav-overview.svg",
  performance: "/figma/nav-performance.svg",
  financials: "/figma/nav-financials.svg",
  forecast: "/figma/nav-forecast.svg",
  alerts: "/figma/nav-alerts.svg",
  reports: "/figma/nav-reports.svg",
};

function NavIcon({ src }) {
  return (
    <span
      aria-hidden="true"
      className="size-6 shrink-0 bg-current"
      style={{
        WebkitMask: `url(${src}) center / contain no-repeat`,
        mask: `url(${src}) center / contain no-repeat`,
      }}
    />
  );
}

const pageTitles = {
  overview: "Overview",
  performance: "Branches Performance",
  financials: "Financials",
  forecast: "Forecast",
  alerts: "Alerts",
  reports: "Reports",
  settings: "Settings",
};

const branchBars = {
  42: { width: 96, color: "#4280A7" },
  30: { width: 80, color: "rgba(66,128,167,0.9)" },
  18: { width: 55, color: "rgba(66,128,167,0.8)" },
  10: { width: 40, color: "rgba(66,128,167,0.7)" },
};

function statusClass(status) {
  if (status === "Optimal") return "bg-[#E3F7E4] text-[#359839]";
  if (status === "Stable") return "bg-[#E3ECF2] text-[#4280A7]";
  return "bg-[#FFF5E6] text-[#BF7200]";
}

function Delta({ positive, children }) {
  const text = String(children);
  const space = text.indexOf(" ");
  const value = space === -1 ? text : text.slice(0, space);
  const rest = space === -1 ? "" : text.slice(space + 1);
  return (
    <span className="inline-flex items-center gap-2 text-[12px] font-normal leading-[1.5] text-ink">
      <span>
        <span className={positive ? "text-[#2B792E]" : "text-danger"}>{value}</span>
        {rest ? ` ${rest}` : ""}
      </span>
      <img src={positive ? "/figma/arrow-rise.svg" : "/figma/arrow-fall.svg"} alt="" className="size-4 max-w-none" />
    </span>
  );
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = () => setMatches(list.matches);
    onChange();
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

export default function App() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("overview");
  const [period, setPeriod] = useState(periods[0]);
  const [branch, setBranch] = useState("All branches");
  const [search, setSearch] = useState("");
  const [alertTab, setAlertTab] = useState("All");
  const [openMenu, setOpenMenu] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [collapsedPreference, setSidebarCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const menusRef = useRef(null);
  const notesRef = useRef(null);
  const summaryColumns = useResizableColumns(5);

  useEffect(() => {
    function onPointerDown(event) {
      if (!menusRef.current?.contains(event.target)) setOpenMenu(null);
      if (!notesRef.current?.contains(event.target)) setNotesOpen(false);
    }
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    document.title = activeNav === "performance" ? "Branches Performance" : "BranchEye";
  }, [activeNav]);

  useEffect(() => {
    if (isDesktop) setMobileNavOpen(false);
  }, [isDesktop]);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileNavOpen]);

  const sidebarCollapsed = collapsedPreference && isDesktop;

  const current = navItems.find((item) => item.id === activeNav) ?? settingsItem;

  const visibleBranches = useMemo(() => {
    return branches.filter((item) => {
      const matchesBranch = branch === "All branches" || item.name === branch;
      const query = search.trim().toLowerCase();
      const matchesSearch = !query || item.name.toLowerCase().includes(query);
      return matchesBranch && matchesSearch;
    });
  }, [branch, search]);

  const visibleAlerts = useMemo(() => {
    return alerts.filter((item) => {
      const matchesTab = alertTab === "All" || item.tab === alertTab;
      const matchesBranch = branch === "All branches" || item.branch === null || item.branch === branch;
      return matchesTab && matchesBranch;
    });
  }, [alertTab, branch]);

  const selectedBranch = branches.find((item) => item.name === branch);
  const cards = selectedBranch
    ? [
        {
          label: "Total Sales",
          value: `SAR ${formatNumber(selectedBranch.sales)}`,
          delta: `${formatSigned(selectedBranch.budgetVar)}% vs budget`,
          positive: selectedBranch.budgetVar >= 0,
        },
        {
          label: "Total Orders",
          value: formatNumber(selectedBranch.orders),
          delta: period,
          positive: true,
        },
        {
          label: "Operating Contribution",
          value: `${selectedBranch.contribution < 0 ? "-" : ""}SAR ${formatNumber(selectedBranch.contribution)}`,
          delta: `Margin ${formatSigned(selectedBranch.margin)}%`,
          positive: selectedBranch.contribution >= 0,
        },
        {
          label: "Operating Margin %",
          value: `${selectedBranch.margin.toFixed(1)}%`,
          delta: `${formatSigned(selectedBranch.margin)} pts`,
          positive: selectedBranch.margin >= 0,
        },
        {
          label: "Budget Achievement %",
          value: `${selectedBranch.budget}%`,
          delta: `${formatSigned(selectedBranch.budgetVar)}% vs target`,
          positive: selectedBranch.budget >= 100,
        },
      ]
    : kpis;

  const revenue = selectedBranch
    ? selectedBranch.sales
    : branches.reduce((sum, item) => sum + item.sales, 0);

  const pageTitle = pageTitles[activeNav] ?? current.label;

  function downloadOverview() {
    const metricLines = cards.map((card) => `${card.label},"${card.value}"`);
    const header = ["Branch", "Sales", "Orders", "Budget %", "Contribution", "Margin", "Status"];
    const branchLines = visibleBranches.map((item) => [item.name, item.sales, item.orders, item.budget, item.contribution, item.margin, item.status].join(","));
    const blob = new Blob([["Metric,Value", ...metricLines, "", header.join(","), ...branchLines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "overview-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex min-h-screen bg-[#F8F6F6] text-ink">
      {mobileNavOpen && <div className="fixed inset-0 z-40 bg-[rgba(6,6,6,0.4)] lg:hidden" onClick={() => setMobileNavOpen(false)} />}
      <aside className={`sticky top-0 flex h-screen shrink-0 flex-col justify-between border-r-[0.5px] max-lg:overflow-y-auto border-[#E2DFDF] bg-white shadow-[2px_0_6px_rgba(184,153,235,0.05)] max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 max-lg:transition-transform ${mobileNavOpen ? "" : "max-lg:-translate-x-full"} ${sidebarCollapsed ? "w-[72px]" : "w-[218px]"}`}>
        <div className="flex flex-col gap-4">
          <div className={`flex h-16 items-center gap-2 py-5 ${sidebarCollapsed ? "justify-center px-3" : "pl-[22px] pr-[18px]"}`}>
            <img src="/figma/logo.png" alt="" className="size-8 shrink-0 rounded-full object-cover" />
            {!sidebarCollapsed && (
              <p className="w-[118px] text-[22px] font-semibold leading-[1.5]">
                <span className="text-primary"> Branch</span>
                <span className="text-secondary">Eye</span>
              </p>
            )}
          </div>
          <nav className={`flex flex-col gap-2 px-3 ${sidebarCollapsed ? "items-center" : "w-[218px]"}`}>
            {navItems.map((item) => {
              const active = item.id === activeNav;
              return (
                <button
                  key={item.id}
                  type="button"
                  title={item.label}
                  onClick={() => {
                    setSettingsOpen(false);
                    setMobileNavOpen(false);
                    setActiveNav(item.id);
                  }}
                  className={`flex h-[41px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    sidebarCollapsed ? "w-10 justify-center px-0" : "w-full"
                  } ${active ? "bg-[#E3ECF2] text-primary" : "text-[#4E505A] hover:bg-[#F6F6F6]"}`}
                >
                  <NavIcon src={navIcons[item.id]} />
                  {!sidebarCollapsed && item.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-col gap-4">
          <button
            type="button"
            title={settingsItem.label}
            onClick={() => {
              setMobileNavOpen(false);
              setSettingsOpen(true);
            }}
            className={`flex h-[41px] items-center gap-3 rounded-lg py-2.5 text-sm font-medium ${
              sidebarCollapsed ? "justify-center" : "px-6"
            } ${settingsOpen ? "bg-[#E3ECF2] text-primary" : "text-[#4E505A] hover:bg-[#F6F6F6]"}`}
          >
            <NavIcon src="/figma/nav-settings.svg" />
            {!sidebarCollapsed && settingsItem.label}
          </button>
          <button
            type="button"
            title="Logout"
            className={`flex h-[70px] items-center gap-3 border-t-[0.5px] border-[#E2DFDF] text-sm font-medium text-danger ${
              sidebarCollapsed ? "justify-center" : "px-6 pb-5 pt-[20.5px]"
            }`}
          >
            <img src="/figma/logout.svg" alt="" className="size-[18px] max-w-none shrink-0" />
            {!sidebarCollapsed && "Logout"}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
      <header className="relative z-20 flex h-16 items-center justify-between gap-3 border-b-[0.5px] border-[#E2DFDF] bg-white px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => (isDesktop ? setSidebarCollapsed((value) => !value) : setMobileNavOpen(true))}
            aria-pressed={isDesktop ? sidebarCollapsed : mobileNavOpen}
            aria-label={isDesktop ? (sidebarCollapsed ? "Open sidebar" : "Close sidebar") : "Open menu"}
            className="grid size-8 shrink-0 place-items-center rounded-xl border-[0.5px] border-[#E2DFDF] bg-[#F6F6F6] max-lg:size-10"
          >
            <img src="/figma/layout.svg" alt="" className="size-6 max-w-none" />
          </button>
          <h1 className="truncate text-[18px] font-semibold leading-[1.5] text-ink">{pageTitle}</h1>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => setMobileSearchOpen((value) => !value)}
          aria-label="Search"
          aria-expanded={mobileSearchOpen}
          className="grid size-10 place-items-center rounded-xl bg-[#F6F6F6] md:hidden"
        >
          <img src="/figma/search.svg" alt="" className="size-[18px] max-w-none" />
        </button>
        <label className={`h-10 w-[258px] items-center gap-3 overflow-hidden rounded-xl bg-[#F6F6F6] px-2 max-md:absolute max-md:inset-x-4 max-md:top-[72px] max-md:w-auto max-md:shadow-[0_8px_24px_rgba(38,38,38,0.12)] ${mobileSearchOpen ? "flex" : "hidden md:flex"}`}>
          <img src="/figma/search.svg" alt="" className="size-[18px] max-w-none" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search"
            className="w-full bg-transparent text-sm leading-[1.5] text-[#4E505A] outline-none placeholder:text-[#4E505A]"
          />
        </label>

        <div ref={notesRef} className="relative">
          <button
            type="button"
            onClick={() => setNotesOpen((value) => !value)}
            aria-expanded={notesOpen}
            className="grid size-10 place-items-center rounded-xl border-[0.5px] border-[#E2DFDF] bg-white"
            aria-label="Notifications"
          >
            <img src="/figma/bell.svg" alt="" className="size-6 max-w-none" />
          </button>
          {notesOpen && (
            <div className="absolute right-0 top-[60px] w-[360px] overflow-hidden rounded-2xl max-sm:fixed max-sm:inset-x-4 max-sm:top-[72px] max-sm:w-auto border border-line bg-white shadow-[0_12px_32px_rgba(23,48,70,0.12)]">
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-sm font-semibold text-ink">Notifications</p>
                <button type="button" className="text-xs text-muted">
                  Mark all as read
                </button>
              </div>
              <ul>
                {notifications.map((item) => (
                  <li key={item.title} className="border-t border-line px-4 py-3">
                    <p className="text-sm font-semibold leading-[21px] text-ink">{item.title}</p>
                    <p className="mt-1 text-sm leading-[21px] text-muted">{item.body}</p>
                    <p className="mt-1 text-xs leading-[18px] text-muted">{item.time}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <span className="grid size-10 place-items-center rounded-xl bg-[#E3ECF2] text-[12px] font-medium leading-[1.5] text-primary max-sm:hidden">
          ME
        </span>
        <button
          type="button"
          onClick={() => setAiOpen(true)}
          aria-label="Ask AI"
          className="inline-flex h-10 w-[95px] items-center justify-center gap-2 rounded-xl bg-primary px-2 text-sm font-medium text-white hover:bg-primary-hover max-sm:w-10"
        >
          <img src="/figma/ai.svg" alt="" className="size-[18px] max-w-none" />
          <span className="max-sm:hidden">Ask AI</span>
        </button>
        </div>
      </header>

        <main className="min-w-0 flex-1 px-4 pb-6 pt-[23px] md:px-6">
          {activeNav === "performance" ? (
            <PerformanceView
              period={period}
              periods={periods}
              branch={branch}
              search={search}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
              setPeriod={setPeriod}
              setBranch={setBranch}
              menusRef={menusRef}
            />
          ) : activeNav === "financials" ? (
            <FinancialsView
              period={period}
              periods={periods}
              branch={branch}
              search={search}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
              setPeriod={setPeriod}
              setBranch={setBranch}
              menusRef={menusRef}
            />
          ) : activeNav === "alerts" ? (
            <AlertsView />
          ) : activeNav === "reports" ? (
            <ReportsView />
          ) : activeNav !== "overview" ? (
            <section className="rounded-2xl border border-line bg-white p-8">
              <h1 className="text-[22px] font-semibold leading-[33px]">{current.label}</h1>
              <p className="mt-2 text-sm text-muted">
                This screen comes after the main dashboard. Overview is ready to review.
              </p>
              <button
                type="button"
                onClick={() => setActiveNav("overview")}
                className="mt-5 rounded-lg bg-primary hover:bg-primary-hover px-4 py-2 text-sm font-medium text-white"
              >
                Back to Overview
              </button>
            </section>
          ) : (
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
                  onClick={downloadOverview}
                  className="ml-auto inline-flex h-11 items-center gap-2 rounded-xl border border-primary bg-[#F8F6F6] p-3 text-sm font-medium text-primary"
                >
                  Export Report
                  <img src="/figma/download.svg" alt="" className="size-[22px] max-w-none" />
                </button>
              </div>

              <section className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">
                {cards.map((card, index) => (
                  <article key={card.label} className={`flex flex-col gap-2 rounded-[20px] border-[0.2px] border-[#E2DFDF] px-4 py-6 ${index % 2 === 0 ? "bg-[#E3ECF2]" : "bg-[#ECF2F6]"}`}>
                    <p className="text-sm font-medium leading-[1.5] text-ink">{card.label}</p>
                    <p className="whitespace-nowrap text-[clamp(18px,1.5vw,24px)] font-semibold leading-[1.5]">{card.value}</p>
                    <Delta positive={card.positive}>{card.delta}</Delta>
                  </article>
                ))}
              </section>

              <section className="mt-6 grid grid-cols-1 items-stretch gap-6 xl:grid-cols-[minmax(0,723fr)_minmax(280px,421fr)]">
                <article className="flex h-[306px] flex-col gap-4 overflow-hidden rounded-[20px] bg-white/80 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-sm font-medium leading-[1.5]">Sales trends</h2>
                    <div className="flex flex-wrap items-center gap-4 text-[12px] leading-4 text-ink max-sm:gap-2">
                      <span className="inline-flex items-center py-0.5 pl-1 pr-2">
                        <img src="/figma/dot.svg" alt="" className="size-3 max-w-none" />
                        This Month
                      </span>
                      <span className="inline-flex items-center py-0.5 pl-1 pr-2">
                        <img src="/figma/dashed.svg" alt="" className="size-3 max-w-none" />
                        Same month last yaer
                      </span>
                    </div>
                  </div>
                  <div className="flex min-h-0 flex-1 gap-4">
                    <div className="flex h-full flex-col justify-between text-right text-[12px] leading-4 text-black/50">
                      <span>30K</span>
                      <span>20K</span>
                      <span>10K</span>
                      <span>0</span>
                    </div>
                    <div className="relative min-w-0 flex-1">
                      <img src="/figma/line-a.svg" alt="" className="absolute inset-0 size-full max-w-none" />
                      <img src="/figma/line-b.svg?v=2" alt="" className="absolute inset-0 size-full max-w-none" />
                      <div className="absolute inset-x-0 bottom-0 flex text-center text-[12px] leading-4 text-black/50">
                        {["5", "10", "15", "20", "25", "30", ""].map((tick) => (
                          <span key={tick || "end"} className="flex-1">{tick}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>

                <article className="flex h-[306px] flex-col gap-4 overflow-hidden rounded-[20px] bg-white/80 p-6">
                  <div>
                    <h2 className="text-sm font-medium leading-[1.5]">Sales by Branch of Total Sales %</h2>
                    <p className="text-[12px] leading-[1.5] text-black/50">
                      Total Revenue: SAR {branch === "All branches" ? "5.24" : (revenue / 1000000).toFixed(2)}M
                    </p>
                  </div>
                  <ul className="flex flex-1 flex-col justify-center gap-2">
                    {visibleBranches.map((item) => {
                      const bar = branchBars[item.share] ?? { width: 40, color: "#4280A7" };
                      return (
                      <li key={item.name} className="flex items-center gap-1">
                        <span className="w-[83px] text-[12px] font-medium leading-[1.5] text-[#4E505A]">{item.name}</span>
                        <span className="flex h-6 min-w-0 flex-1 items-center">
                          <span
                            className="flex h-6 max-w-full items-center rounded-lg px-2 text-[12px] font-normal leading-[1.5] text-white"
                            style={{ width: bar.width, backgroundColor: bar.color }}
                          >
                            {item.share}%
                          </span>
                        </span>
                        <span className="text-[12px] leading-[1.5] text-black/50">{formatNumber(item.sales)} SAR</span>
                      </li>
                      );
                    })}
                    {visibleBranches.length === 0 && (
                      <li className="col-span-3 py-6 text-center text-sm text-muted">No branches match this search.</li>
                    )}
                  </ul>
                </article>
              </section>

              <section className="mt-6 grid grid-cols-1 items-stretch gap-6 xl:grid-cols-[minmax(0,723fr)_minmax(280px,421fr)]">
                <article className="min-w-0 rounded-[20px] bg-white/80 p-6">
                  <div className="mb-4 flex h-[21px] items-center justify-between">
                    <h2 className="text-sm font-semibold leading-[1.5]">Branchs summary</h2>
                    <button
                      type="button"
                      onClick={() => {
                        setBranch("All branches");
                        setSearch("");
                        setActiveNav("performance");
                      }}
                      className="text-[12px] font-medium leading-[1.5] text-secondary"
                    >
                      View All Branches
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className={`table-fixed text-left text-sm ${summaryColumns.widths ? "" : "w-full min-w-[640px]"}`} style={summaryColumns.widths ? { width: columnTableWidth(summaryColumns.widths) } : undefined}>
                      <ColumnSizer widths={summaryColumns.widths} />
                      <thead ref={summaryColumns.headRef} className="text-[12px] text-muted">
                        <tr className="border-b border-line">
                          {["Branch Name", "Sales (SAR)", "Budget Achievement %", "Operating Contribution", "Status"].map((label, index) => (
                            <ResizableTh key={label} index={index} onResizeStart={summaryColumns.onResizeStart} className="pb-3 font-medium">{label}</ResizableTh>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {visibleBranches.map((item) => (
                          <tr key={item.name} className="border-b border-line last:border-0">
                            <td className="py-3.5 font-semibold">{item.name}</td>
                            <td className="py-2">
                              <div className="text-sm font-normal leading-[1.5]">{formatNumber(item.sales)}</div>
                              <div className="text-[12px] leading-[1.5] text-black/50">
                                {formatNumber(item.orders)} {item.name === "Jeddah 01" ? "orders" : "Orders"}
                              </div>
                            </td>
                            <td className="py-2">
                              <div className={`text-sm font-normal leading-[1.5] ${item.budget >= 100 ? "text-[#359839]" : "text-danger"}`}>
                                {item.budget}%
                              </div>
                              <div className="text-[12px] text-muted">
                                Var: {formatSigned(item.budgetVar)}%
                              </div>
                            </td>
                            <td className="py-2">
                              <div className="text-sm font-normal leading-[1.5]">
                                {item.contribution < 0 ? "-" : ""}
                                {formatNumber(item.contribution)}
                              </div>
                              <div className="text-[12px] text-muted">
                                Margin: {formatSigned(item.margin)}%
                              </div>
                            </td>
                            <td className="py-2">
                              <span className={`inline-flex h-[26px] items-center gap-2 rounded-xl px-2.5 py-1 text-[12px] font-medium leading-[1.5] ${statusClass(item.status)}`}>
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {visibleBranches.length === 0 && (
                      <p className="py-8 text-center text-sm text-muted">No branches match this search.</p>
                    )}
                  </div>
                </article>

                <article className="flex h-[345px] flex-col gap-4 overflow-hidden rounded-[20px] bg-white/80 p-6">
                  <div className="flex h-[21px] items-center justify-between">
                    <h2 className="text-sm font-semibold leading-[1.5]">Alerts</h2>
                    <button type="button" onClick={() => setActiveNav("alerts")} className="text-[12px] font-medium leading-[1.5] text-secondary">
                      View All
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                  <div className="flex items-center text-[12px] font-medium leading-[1.5]">
                    {alertTabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setAlertTab(tab.id)}
                        className={`flex h-8 items-center justify-center rounded-xl p-3 ${
                          alertTab === tab.id ? "bg-[#ECF2F6] text-primary" : "text-black/50"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <ul className="border-t border-[#E2DFDF]">
                    {visibleAlerts.map((item) => (
                      <li key={item.id} className="flex items-start justify-between gap-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-normal leading-[1.5]">{item.title}</p>
                          <p className="text-[12px] leading-[1.5] text-black/50">{item.meta}</p>
                        </div>
                        <button type="button" className="shrink-0 text-[12px] font-normal leading-[1.5] text-secondary">
                          View
                        </button>
                      </li>
                    ))}
                    {visibleAlerts.length === 0 && (
                      <li className="py-8 text-center text-sm text-muted">No alerts for this filter.</li>
                    )}
                  </ul>
                  </div>
                </article>
              </section>
            </div>
          )}
        </main>
      </div>
      {aiOpen && <AiDrawer onClose={() => setAiOpen(false)} />}
      {settingsOpen && <SettingsView onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

const aiSuggestions = ["Which branch wastes most?", "Forecast tomorrow"];

function AiDrawer({ onClose }) {
  const [draft, setDraft] = useState("");
  const [wide, setWide] = useState(false);
  const [messages, setMessages] = useState([
    { role: "user", text: "Why did profit decrease this week?" },
    {
      role: "assistant",
      text: "Profit is down 8.4% this week.",
      reasons: ["Food cost up 4.2%", "Waste up 1.8%", "Average order value down 3.5%/week."],
    },
  ]);

  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function send(text) {
    const value = text.trim();
    if (!value) return;
    setMessages((current) => [
      ...current,
      { role: "user", text: value },
      {
        role: "assistant",
        text: "I’ll break that down from this month’s branch data.",
        reasons: ["Jeddah 01 is still the largest share of sales.", "Riyadh 01 is the branch currently in loss."],
      },
    ]);
    setDraft("");
  }

  return (
    <aside className={`fixed inset-y-0 right-0 z-40 flex flex-col bg-[#F8F6F6] shadow-[-12px_0_32px_rgba(23,48,70,0.06)] max-sm:w-full ${wide ? "w-[480px]" : "w-[316px]"}`}>
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#EDEAEA] px-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Icon name="spark" className="h-[18px] w-[18px] text-primary" />
          Ask AI
        </div>
        <div className="flex items-center gap-0.5 text-ink">
          <button type="button" onClick={() => setWide((value) => !value)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-black/5" aria-label={wide ? "Shrink" : "Expand"}>
            {wide ? (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                <path d="M13 4V7.00002C13 8.88563 13.0001 9.82843 13.5858 10.4142C14.1716 11 15.1144 11 17 11H20" stroke="#262626" strokeWidth="1.5" strokeMiterlimit="16" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M11 20L10.9999 17C10.9999 15.1144 10.9999 14.1715 10.4141 13.5858C9.82837 13 8.88557 13 6.99996 13H4" stroke="#262626" strokeWidth="1.5" strokeMiterlimit="16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                <path d="M19 12V8.99996C19 7.11435 18.9999 6.17155 18.4142 5.58577C17.8284 4.99999 16.8856 4.99999 15 5L12 5.00001" stroke="#262626" strokeWidth="1.5" strokeMiterlimit="16" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 12L5.00003 15C5.00004 16.8856 5.00005 17.8284 5.58584 18.4142C6.17163 19 7.11443 19 9.00004 19H12" stroke="#262626" strokeWidth="1.5" strokeMiterlimit="16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-black/5" aria-label="Close">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <path d="M7 7l10 10M17 7L7 17" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto px-5 pb-4 pt-[52px]">
        {messages.map((message, index) =>
          message.role === "user" ? (
            <p key={index} className="ml-auto w-fit max-w-full rounded-[10px] bg-secondary px-[13px] py-[11px] text-sm leading-[21px] text-white">
              {message.text}
            </p>
          ) : (
            <div key={index} className="flex items-end gap-2">
              <Icon name="spark" className="mb-1.5 h-[18px] w-[18px] shrink-0 text-primary" />
              <div className="min-w-0 flex-1 rounded-xl border border-[#EFEDED] bg-white px-3.5 py-3 shadow-[0_1px_2px_rgba(38,38,38,0.04)]">
                <p className="text-sm font-medium leading-[21px] text-ink">{message.text}</p>
                {message.reasons && (
                  <>
                    <p className="mt-3 text-xs leading-[18px] text-muted">Main reasons</p>
                    <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-sm leading-[21px] text-ink marker:text-ink">
                      {message.reasons.map((reason) => (
                        <li key={reason} className="pl-1">{reason}</li>
                      ))}
                    </ol>
                  </>
                )}
              </div>
            </div>
          ),
        )}
        <div className="flex flex-col items-start gap-2.5">
          {aiSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => send(suggestion)}
              className="rounded-[10px] border border-[#E4E1E1] bg-transparent px-3 py-[10px] text-left text-sm leading-[21px] text-subtle hover:bg-white"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <form
        className="shrink-0 px-4 pb-5"
        onSubmit={(event) => {
          event.preventDefault();
          send(draft);
        }}
      >
        <div className="rounded-2xl bg-white px-4 pb-3 pt-3.5 shadow-[0_8px_24px_rgba(66,128,167,0.18)]">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask about Sales, Costs, branches..."
            aria-label="Ask about Sales, Costs, branches..."
            className="w-full bg-transparent text-sm leading-[21px] text-ink outline-none placeholder:text-[#9A9A9E]"
          />
          <div className="mt-3 flex items-center justify-end gap-2">
            <button type="button" className="grid h-10 w-10 place-items-center rounded-[10px] border border-[#E4E1E1] text-ink" aria-label="Voice">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                <rect x="9" y="3" width="6" height="11" rx="3" />
                <path d="M6 11a6 6 0 0 0 12 0M12 17v3" />
              </svg>
            </button>
            <button type="submit" className="inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-primary px-3.5 text-sm font-medium text-white hover:bg-primary-hover">
              Send
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
                <path d="M5.2 3.2v9.6L13 8 5.2 3.2z" />
              </svg>
            </button>
          </div>
        </div>
      </form>
    </aside>
  );
}
