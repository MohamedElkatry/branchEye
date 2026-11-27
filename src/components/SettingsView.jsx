import { useEffect, useState } from "react";
import { ColumnSizer, ResizableTh, columnTableWidth, useResizableColumns } from "./columnResize";

const sections = [
  { id: "account", group: "Account", label: "Account & Security" },
  { id: "notifications", group: "Account", label: "Notifications" },
  { id: "company", group: "Organization", label: "Company & Branches" },
  { id: "targets", group: "Operations", label: "Targets & Thresholds" },
];

const thresholdRows = [
  { id: "waste", label: "Food Waste", hint: "Critical alert when waste cost exceeds this share of net sales", prefix: "≤", value: "5.0", unit: "% of net sales" },
  { id: "margin", label: "Operating Margin", hint: "Critical alert when consolidated operating margin falls below", prefix: "≥", value: "24.0", unit: "%" },
  { id: "weekly", label: "Weekly Net Sales Target", hint: "Weekly summary compares all-branch net sales against this target", prefix: "", value: "1,260", unit: "K SAR" },
  { id: "budget", label: "Monthly Budget Achievement", hint: "Branches below this level are flagged in performance views", prefix: "≥", value: "100", unit: "%" },
];

const leaders = [
  { name: "Eman Al-Harbi", role: "Finance Manager", phone: "+966 50 331 9980", email: "eman.finance@brancheye.sa" },
  { name: "Majed Hassan", role: "Operations Manager", phone: "+966 50 987 6543", email: "majed.ops@brancheye.sa" },
  { name: "Tariq Al-Sulaiman", role: "Inventory & Supply Manager", phone: "+966 55 712 4490", email: "tariq.inventory@brancheye.sa" },
];

const directory = [
  { name: "Riyadh 01", place: "Olaya St · 12:00 PM – 02:00 AM", manager: "Tariq Al-Otaibi", phones: "Branch: +966 11 456 7890 · Mgr: +966 50 123 4567" },
  { name: "Jeddah 01", place: "Tahlia St · 12:00 PM – 02:00 AM", manager: "Majed Al-Ghamdi", phones: "Branch: +966 12 654 3210 · Mgr: +966 50 881 2233" },
  { name: "Riyadh 02", place: "Al Malqa Rd · 01:00 PM – 03:00 AM", manager: "Khaled Al-Zahrani", phones: "Branch: +966 11 789 1122 · Mgr: +966 55 444 3322" },
  { name: "Dammam 01", place: "King Fahd Rd · 12:00 PM – 01:00 AM", manager: "Faisal Al-Qahtani", phones: "Branch: +966 13 888 4455 · Mgr: +966 54 222 1100" },
];

const languages = ["English", "Arabic"];
const currencies = ["SAR", "USD"];
const landings = ["Overview", "Performance", "Financials", "Alerts"];
const monitored = ["All Branches", "Riyadh 01", "Riyadh 02", "Jeddah 01", "Dammam 01"];

function SelectField({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative w-[240px] shrink-0 max-sm:w-full">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className={`flex h-10 w-full items-center justify-between rounded-xl border border-[#E2DFDF] px-3 text-sm font-medium text-ink ${open ? "bg-white" : "bg-white"}`}
      >
        <span className="truncate">{value}</span>
        <img src="/figma/chevron.svg" alt="" className={`size-[22px] max-w-none ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="absolute right-0 top-12 z-30 w-full rounded-xl bg-white py-2 shadow-[0_8px_24px_rgba(38,38,38,0.08)]">
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className="block w-full px-4 py-2.5 text-left text-sm text-[#4E505A] hover:bg-[#F6F6F6]"
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

function TextField({ value, onChange, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-[240px] shrink-0 rounded-xl border border-[#E2DFDF] bg-white px-3 text-sm font-medium text-ink outline-none max-sm:w-full"
    />
  );
}

function Switch({ on, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`relative h-5 w-9 shrink-0 rounded-full ${on ? "bg-primary" : "bg-[#E2DFDF]"}`}
    >
      <span className={`absolute top-0.5 size-4 rounded-full bg-white transition-transform ${on ? "left-[18px]" : "left-0.5"}`} />
    </button>
  );
}

function OutlineButton({ children, onClick, className = "" }) {
  return (
    <button type="button" onClick={onClick} className={`inline-flex h-9 items-center justify-center rounded-xl border border-[#E2DFDF] bg-white px-3 text-sm font-medium text-[#4E505A] ${className}`}>
      {children}
    </button>
  );
}

export default function SettingsView({ onClose }) {
  const [section, setSection] = useState("account");
  const [name, setName] = useState("Ali Ahmed");
  const [email, setEmail] = useState("ceo@brancheye.sa");
  const [language, setLanguage] = useState("English");
  const [currency, setCurrency] = useState("SAR");
  const [landing, setLanding] = useState("Overview");
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [scope, setScope] = useState("All Branches");
  const [companyAlerts, setCompanyAlerts] = useState(true);
  const [sessions, setSessions] = useState([
    { id: "riyadh", title: "Windows Device . Riyadh, KSA", meta: "Last Active: Now", current: true },
    { id: "jeddah", title: "Windows Device . Jeddah, KSA", meta: "Last Active: Nov 1, 2026, 2:08 AM", current: false },
  ]);
  const [dialog, setDialog] = useState(null);
  const [branchQuery, setBranchQuery] = useState("");
  const [contact, setContact] = useState(null);
  const [thresholds, setThresholds] = useState(() => Object.fromEntries(thresholdRows.map((row) => [row.id, row.value])));
  const leaderColumns = useResizableColumns(5);
  const directoryColumns = useResizableColumns(4);

  useEffect(() => {
    function onKey(event) {
      if (event.key !== "Escape") return;
      if (contact) setContact(null);
      else if (dialog) setDialog(null);
      else onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [contact, dialog, onClose]);

  const copy = {
    account: {
      title: "Account & Security",
      subtitle: "Manage your profile, authentication security, and workspace preferences",
    },
    notifications: {
      title: "Notifications",
      subtitle: "Manage delivery schedule for critical alerts and weekly summaries.",
    },
    company: {
      title: "Company, Branches & Data Sources",
      subtitle: "Read-only directory of department leads, branch records, and internal data feeds",
    },
    targets: {
      title: "Targets & Thresholds",
      subtitle: "Set the operating targets and alert thresholds used across branches",
    },
  }[section];

  const branchesShown = directory.filter((item) => {
    const text = branchQuery.trim().toLowerCase();
    return !text || `${item.name} ${item.place} ${item.manager}`.toLowerCase().includes(text);
  });

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(6,6,6,0.4)]" onClick={onClose}>
      <div
        className="absolute top-1/2 left-1/2 flex h-[min(680px,calc(100vh-48px))] w-[min(1040px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[20px] border border-[#E2DFDF] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.12)] max-md:h-[calc(100dvh-32px)] max-md:flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <aside className="flex w-[224px] shrink-0 flex-col justify-between border-r border-[#E2DFDF] bg-[#F8F6F6] py-6 max-md:w-full max-md:overflow-x-auto max-md:border-r-0 max-md:border-b max-md:py-3">
          <div className="flex flex-col gap-5 px-3.5 max-md:flex-row max-md:gap-4">
            {["Account", "Organization", "Operations"].map((group) => (
              <div key={group} className="max-md:shrink-0">
                <p className="px-3 text-[11px] leading-[14px] tracking-[0.04em] text-black/40 uppercase">{group}</p>
                <div className="mt-0 max-md:flex max-md:gap-1">
                  {sections
                    .filter((item) => item.group === group)
                    .map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSection(item.id)}
                        className={`flex h-10 w-full items-center rounded-xl px-3 text-left text-sm leading-[21px] max-md:w-auto max-md:whitespace-nowrap ${section === item.id ? "bg-white font-semibold text-ink" : "font-medium text-[#4E505A] hover:bg-white/70"}`}
                      >
                        {item.label}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mx-3.5 rounded-xl border border-[#E2DFDF] px-3 py-3 max-md:hidden">
            <p className="text-[12px] font-medium leading-[18px] text-ink">Role: CEO</p>
            <p className="text-[12px] leading-[18px] text-black/50">Executive View Access</p>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[86px] shrink-0 items-center justify-between gap-3 border-b border-[#E2DFDF] px-6 max-md:h-auto max-md:px-4 max-md:py-3">
            <div>
              <h2 className="text-[18px] font-semibold leading-[27px]">{copy.title}</h2>
              <p className="text-[12px] leading-[18px] text-black/50">{copy.subtitle}</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="grid size-8 place-items-center">
              <img src="/figma/close.svg" alt="" className="size-7 max-w-none" />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-auto px-6 py-6 max-sm:px-4 max-sm:py-4">
            {section === "account" && (
              <div className="flex flex-col gap-5">
                <article className="rounded-2xl border border-[#E2DFDF] px-[25px] max-sm:px-4 pt-[25px] pb-4">
                  <h3 className="text-sm font-semibold leading-[21px]">Executive Profile</h3>
                  <div className="mt-4 flex items-center justify-between gap-6 max-sm:flex-col max-sm:items-stretch max-sm:gap-2 border-b border-[#E2DFDF] py-2">
                    <div>
                      <p className="text-sm font-medium leading-[21px]">Full Name</p>
                      <p className="text-[12px] leading-[18px] text-black/50">Displayed across shared reports and executive summaries</p>
                    </div>
                    <TextField value={name} onChange={setName} />
                  </div>
                  <div className="flex items-center justify-between gap-6 max-sm:flex-col max-sm:items-stretch max-sm:gap-2 border-b border-[#E2DFDF] py-2">
                    <div>
                      <p className="text-sm font-medium leading-[21px]">Official Email</p>
                      <p className="text-[12px] leading-[18px] text-black/50">Primary sign-in and report delivery address</p>
                    </div>
                    <TextField value={email} onChange={setEmail} type="email" />
                  </div>
                  <div className="flex items-center justify-between gap-6 max-sm:flex-col max-sm:items-stretch max-sm:gap-2 py-2">
                    <div>
                      <p className="text-sm font-medium leading-[21px]">Account Password</p>
                      <p className="text-[12px] leading-[18px] text-black/50">Last changed 45 days ago</p>
                    </div>
                    <OutlineButton onClick={() => setDialog("password")}>Change Password</OutlineButton>
                  </div>
                </article>

                <article className="rounded-2xl border border-[#E2DFDF] px-[25px] max-sm:px-4 pt-[25px] pb-4">
                  <h3 className="text-sm font-semibold leading-[21px]">Security & Active Sessions</h3>
                  <div className="mt-4 flex items-center justify-between gap-6 max-sm:flex-col max-sm:items-stretch max-sm:gap-2 border-b border-[#E2DFDF] py-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium leading-[21px]">Two-Factor Authentication (2FA)</p>
                        <span className="rounded-lg bg-[#E3F7E4] px-2.5 py-0.5 text-[12px] font-medium leading-[18px] text-[#359839]">Enabled</span>
                      </div>
                      <p className="text-[12px] leading-[18px] text-black/50">Extra verification required when signing in</p>
                    </div>
                    <OutlineButton onClick={() => setDialog("2fa")}>Manage</OutlineButton>
                  </div>
                  {sessions.map((item) => (
                    <div key={item.id} className={`flex items-center justify-between gap-6 max-sm:flex-col max-sm:items-stretch max-sm:gap-2 py-2 ${item.current ? "border-b border-[#E2DFDF]" : ""}`}>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium leading-[21px]">{item.title}</p>
                          {item.current && <span className="rounded-lg bg-[#E3ECF2] px-2 py-0.5 text-[12px] font-medium leading-[18px] text-[#32607D]">Current Session</span>}
                        </div>
                        <p className="text-[12px] leading-[18px] text-black/50">{item.meta}</p>
                      </div>
                      {!item.current && <OutlineButton onClick={() => setSessions((current) => current.filter((session) => session.id !== item.id))}>Revoke</OutlineButton>}
                    </div>
                  ))}
                </article>

                <article className="rounded-2xl border border-[#E2DFDF] px-[25px] max-sm:px-4 pt-[25px] pb-4">
                  <h3 className="text-sm font-semibold leading-[21px]">Workspace Preferences</h3>
                  <div className="mt-4 flex items-center justify-between gap-6 max-sm:flex-col max-sm:items-stretch max-sm:gap-2 border-b border-[#E2DFDF] py-2">
                    <div>
                      <p className="text-sm font-medium leading-[21px]">Interface Language</p>
                      <p className="text-[12px] leading-[18px] text-black/50">Select display language for dashboard views</p>
                    </div>
                    <SelectField value={language} options={languages} onChange={setLanguage} />
                  </div>
                  <div className="flex items-center justify-between gap-6 max-sm:flex-col max-sm:items-stretch max-sm:gap-2 border-b border-[#E2DFDF] py-2">
                    <div>
                      <p className="text-sm font-medium leading-[21px]">Default Currency</p>
                      <p className="text-[12px] leading-[18px] text-black/50">Applied across all financial and branch metrics</p>
                    </div>
                    <SelectField value={currency} options={currencies} onChange={setCurrency} />
                  </div>
                  <div className="flex items-center justify-between gap-6 max-sm:flex-col max-sm:items-stretch max-sm:gap-2 py-2">
                    <div>
                      <p className="text-sm font-medium leading-[21px]">Default Landing View</p>
                      <p className="text-[12px] leading-[18px] text-black/50">First page opened after logging in</p>
                    </div>
                    <SelectField value={landing} options={landings} onChange={setLanding} />
                  </div>
                </article>
              </div>
            )}

            {section === "notifications" && (
              <div className="flex flex-col gap-5">
                <article className="rounded-2xl border border-[#E2DFDF] px-[25px] max-sm:px-4 pt-[25px] pb-4">
                  <h3 className="text-sm font-semibold leading-[21px]">Alert Schedule & Delivery</h3>
                  <div className="mt-4 flex items-center justify-between gap-6 max-sm:flex-col max-sm:items-stretch max-sm:gap-2 border-b border-[#E2DFDF] py-2">
                    <div>
                      <p className="text-sm font-medium leading-[21px]">Instant Critical Alerts</p>
                      <p className="text-[12px] leading-[18px] text-black/50">Immediate in-app & email notification when a branch breaches critical thresholds</p>
                    </div>
                    <Switch on={criticalAlerts} onToggle={() => setCriticalAlerts((value) => !value)} />
                  </div>
                  <div className="flex items-center justify-between gap-6 max-sm:flex-col max-sm:items-stretch max-sm:gap-2 py-2">
                    <div>
                      <p className="text-sm font-medium leading-[21px]">Weekly Alerts Summary (Every Sunday)</p>
                      <p className="text-[12px] leading-[18px] text-black/50">Weekly summary of all branch alerts sent every Sunday at 09:00 AM</p>
                    </div>
                    <Switch on={weeklySummary} onToggle={() => setWeeklySummary((value) => !value)} />
                  </div>
                </article>
                <article className="rounded-2xl border border-[#E2DFDF] px-[25px] max-sm:px-4 pt-[25px] pb-4">
                  <h3 className="text-sm font-semibold leading-[21px]">Monitoring Scope</h3>
                  <div className="mt-4 flex items-center justify-between gap-6 max-sm:flex-col max-sm:items-stretch max-sm:gap-2 border-b border-[#E2DFDF] py-2">
                    <div>
                      <p className="text-sm font-medium leading-[21px]">Monitored Branches</p>
                      <p className="text-[12px] leading-[18px] text-black/50">Choose whether to receive alerts for all branches or specific locations</p>
                    </div>
                    <SelectField value={scope} options={monitored} onChange={setScope} />
                  </div>
                  <div className="flex items-center justify-between gap-6 max-sm:flex-col max-sm:items-stretch max-sm:gap-2 py-2">
                    <div>
                      <p className="text-sm font-medium leading-[21px]">Company-Wide Financial Alerts</p>
                      <p className="text-[12px] leading-[18px] text-black/50">Include overall alerts across all branches combined</p>
                    </div>
                    <Switch on={companyAlerts} onToggle={() => setCompanyAlerts((value) => !value)} />
                  </div>
                </article>
              </div>
            )}

            {section === "company" && (
              <div className="flex flex-col gap-5">
                <article className="rounded-2xl border border-[#E2DFDF] px-[25px] max-sm:px-4 py-[25px]">
                  <h3 className="text-sm font-semibold leading-[21px]">Department Leadership</h3>
                  <div className="mt-4 overflow-x-auto rounded-xl border border-[#E2DFDF]">
                    <table className={`table-fixed border-collapse text-left ${leaderColumns.widths ? "" : "w-[786px]"}`} style={leaderColumns.widths ? { width: columnTableWidth(leaderColumns.widths) } : undefined}>
                      <ColumnSizer widths={leaderColumns.widths} />
                      <thead ref={leaderColumns.headRef}>
                        <tr className="text-[12px] leading-[15px] text-black/50">
                          {["Lead Name", "Role", "Direct Phone", "Email", "Action"].map((label, index) => (
                            <ResizableTh key={label} index={index} onResizeStart={leaderColumns.onResizeStart} className={`h-9 bg-[#F6F6F6] px-4 font-medium ${label === "Action" ? "text-center" : ""}`}>{label}</ResizableTh>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {leaders.map((person) => (
                          <tr key={person.email} className="border-b border-[#E2DFDF] last:border-0">
                            <td className="h-[55px] px-4 text-sm font-semibold whitespace-nowrap">{person.name}</td>
                            <td className="px-4">
                              <span className="inline-flex h-[22px] items-center rounded-lg bg-[#E3ECF2] px-2 text-[12px] font-medium whitespace-nowrap text-[#4280A7]">{person.role}</span>
                            </td>
                            <td className="px-4 text-[12px] leading-[18px] whitespace-nowrap text-[#4E505A]">{person.phone}</td>
                            <td className="px-4 text-[12px] leading-[18px] whitespace-nowrap text-[#4E505A]">{person.email}</td>
                            <td className="px-4 text-center">
                              <OutlineButton className="w-[82px]" onClick={() => setContact(person)}>Contact</OutlineButton>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>

                <article className="rounded-2xl border border-[#E2DFDF] px-[25px] max-sm:px-4 py-[25px]">
                  <div className="flex items-start justify-between gap-4 max-sm:flex-col max-sm:gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold leading-[21px]">Branches Directory</h3>
                      <p className="text-[12px] leading-[18px] text-black/50">Static branch records, operating hours, and manager contacts</p>
                    </div>
                    <label className="flex h-9 w-[198px] shrink-0 items-center gap-3 rounded-xl border border-[#E2DFDF] bg-white px-2 max-sm:w-full">
                      <img src="/figma/search.svg" alt="" className="size-[18px] max-w-none" />
                      <input
                        value={branchQuery}
                        onChange={(event) => setBranchQuery(event.target.value)}
                        placeholder="Search Branches"
                        className="w-full bg-transparent text-sm font-medium text-[#4E505A] outline-none placeholder:text-[#4E505A]"
                      />
                    </label>
                  </div>
                  <div className="mt-4 overflow-x-auto rounded-xl border border-[#E2DFDF]">
                    <table className={`table-fixed border-collapse text-left ${directoryColumns.widths ? "" : "w-[849px]"}`} style={directoryColumns.widths ? { width: columnTableWidth(directoryColumns.widths) } : undefined}>
                      <ColumnSizer widths={directoryColumns.widths} />
                      <thead ref={directoryColumns.headRef}>
                        <tr className="text-[12px] leading-[15px] text-black/50">
                          {["Branch & Status", "Location & Hours", "Branch Manager & Phones", "Action"].map((label, index) => (
                            <ResizableTh key={label} index={index} onResizeStart={directoryColumns.onResizeStart} className={`h-9 bg-[#F6F6F6] px-4 font-medium ${label === "Action" ? "text-center" : ""}`}>{label}</ResizableTh>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {branchesShown.map((item) => (
                          <tr key={item.name} className="border-b border-[#E2DFDF] last:border-0">
                            <td className="h-14 px-4">
                              <span className="flex items-center">
                                <span className="w-[83px] text-sm font-semibold whitespace-nowrap">{item.name}</span>
                                <span className="inline-flex h-[22px] items-center rounded-lg bg-[#E3F7E4] px-2 text-[12px] font-medium whitespace-nowrap text-[#359839]">Active</span>
                              </span>
                            </td>
                            <td className="px-4 text-[12px] leading-[18px] whitespace-nowrap text-black/50">{item.place}</td>
                            <td className="px-4">
                              <p className="text-sm font-semibold leading-[21px] whitespace-nowrap">{item.manager}</p>
                              <p className="text-[12px] leading-[18px] whitespace-nowrap text-black/50">{item.phones}</p>
                            </td>
                            <td className="px-4 text-center">
                              <OutlineButton className="w-[82px]" onClick={() => setContact({ name: item.name, role: "Active", phone: item.phones, email: item.place, manager: item.manager })}>Contact</OutlineButton>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {branchesShown.length === 0 && <p className="py-6 text-center text-sm text-muted">No branches match this search.</p>}
                  </div>
                </article>
              </div>
            )}

            {section === "targets" && (
              <div className="flex flex-col gap-5">
                <article className="rounded-2xl border border-[#E2DFDF] px-[25px] max-sm:px-4 pt-[25px] pb-4">
                  <h3 className="text-sm font-semibold leading-[21px]">Alert Thresholds</h3>
                  {thresholdRows.map((row, index) => (
                    <div key={row.id} className={`${index === 0 ? "mt-4 " : ""}flex items-center justify-between gap-6 max-sm:flex-col max-sm:items-stretch max-sm:gap-2 py-2 ${index < thresholdRows.length - 1 ? "border-b border-[#E2DFDF]" : ""}`}>
                      <div>
                        <p className="text-sm font-medium leading-[21px]">{row.label}</p>
                        <p className="text-[12px] leading-[18px] text-black/50">{row.hint}</p>
                      </div>
                      <label className="flex h-10 w-[240px] shrink-0 items-center gap-2 rounded-xl border border-[#E2DFDF] bg-white px-3 text-sm font-medium text-ink max-sm:w-full">
                        {row.prefix && <span className="text-black/50">{row.prefix}</span>}
                        <input
                          value={thresholds[row.id]}
                          onChange={(event) => setThresholds((current) => ({ ...current, [row.id]: event.target.value }))}
                          inputMode="decimal"
                          aria-label={row.label}
                          className="min-w-0 flex-1 bg-transparent outline-none"
                        />
                        <span className="whitespace-nowrap text-[12px] text-black/50">{row.unit}</span>
                      </label>
                    </div>
                  ))}
                </article>
              </div>
            )}
          </div>

          <footer className="flex h-[73px] shrink-0 items-center justify-end gap-3 border-t border-[#E2DFDF] px-6">
            <button type="button" onClick={onClose} className="inline-flex h-10 w-[74px] items-center justify-center rounded-xl border border-[#E2DFDF] text-sm font-medium text-[#4E505A]">
              Cancel
            </button>
            <button type="button" onClick={onClose} className="inline-flex h-10 w-[120px] items-center justify-center rounded-xl bg-primary text-sm font-medium text-white">
              Save Changes
            </button>
          </footer>
        </section>
      </div>

      {dialog === "password" && <PasswordDialog onClose={() => setDialog(null)} />}
      {dialog === "2fa" && <TwoFactorDialog onClose={() => setDialog(null)} />}
      {contact && <ContactDialog person={contact} onClose={() => setContact(null)} />}
    </div>
  );
}

function PasswordDialog({ onClose }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    if (!current || !next) {
      setError("Enter your current password and a new password.");
      return;
    }
    if (next !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    onClose();
  }

  return (
    <div className="absolute inset-0 z-10 grid place-items-center bg-[rgba(6,6,6,0.4)]" onClick={(event) => { event.stopPropagation(); onClose(); }}>
      <form onSubmit={submit} onClick={(event) => event.stopPropagation()} className="w-[460px] max-w-[calc(100vw-32px)] rounded-[20px] bg-white p-[25px] shadow-[0_24px_60px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-semibold leading-[27px]">Change Password</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-8 place-items-center">
            <img src="/figma/close.svg" alt="" className="size-7 max-w-none" />
          </button>
        </div>
        <label className="mt-5 block">
          <span className="text-sm font-medium">Current Password</span>
          <input type="password" value={current} onChange={(event) => setCurrent(event.target.value)} className="mt-2 h-10 w-full rounded-xl border border-[#E2DFDF] px-3 text-sm outline-none" />
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-medium">New Password</span>
          <input type="password" value={next} onChange={(event) => setNext(event.target.value)} className="mt-2 h-10 w-full rounded-xl border border-[#E2DFDF] px-3 text-sm outline-none" />
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-medium">Confirm New Password</span>
          <input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} className="mt-2 h-10 w-full rounded-xl border border-[#E2DFDF] px-3 text-sm outline-none" />
        </label>
        {error && <p className="mt-3 text-[12px] text-[#B00020]">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="inline-flex h-10 w-[74px] items-center justify-center rounded-xl border border-[#E2DFDF] text-sm font-medium text-[#4E505A]">Cancel</button>
          <button type="submit" className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-3 text-sm font-medium text-white">Update</button>
        </div>
      </form>
    </div>
  );
}

function TwoFactorDialog({ onClose }) {
  const [digits, setDigits] = useState(["4", "4", "4", "", "", ""]);
  const [keyOpen, setKeyOpen] = useState(false);

  function setDigit(index, value) {
    const next = value.replace(/\D/g, "").slice(-1);
    setDigits((current) => current.map((digit, digitIndex) => (digitIndex === index ? next : digit)));
    if (next && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  }

  return (
    <div className="absolute inset-0 z-10 grid place-items-center bg-[rgba(6,6,6,0.4)]" onClick={(event) => { event.stopPropagation(); onClose(); }}>
      <div onClick={(event) => event.stopPropagation()} className="w-[460px] max-w-[calc(100vw-32px)] rounded-[20px] bg-white p-[25px] shadow-[0_24px_60px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-semibold leading-[27px]">Two-Factor Authentication</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-8 place-items-center">
            <img src="/figma/close.svg" alt="" className="size-7 max-w-none" />
          </button>
        </div>
        <p className="mt-5 text-sm leading-[21px] text-[#4E505A]">Scan this QR code to link your executive account.</p>
        <div className="mt-5 flex justify-center">
          <div className="grid size-[156px] place-items-center rounded-xl border border-[#E2DFDF]">
            <QrMark />
          </div>
        </div>
        <button type="button" onClick={() => setKeyOpen((value) => !value)} className="mt-5 block w-full text-center text-[12px] leading-[18px] text-[#4E505A]">
          Can't scan the QR code? Enter setup key manually
        </button>
        {keyOpen && <p className="mt-2 text-center text-sm font-medium tracking-[0.08em]">BRANCH-EYE-SETUP</p>}
        <p className="mt-5 text-center text-sm font-medium">Enter the 6-digit code from your app</p>
        <div className="mt-2 flex justify-center gap-2">
          {digits.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              inputMode="numeric"
              value={digit}
              placeholder="-"
              onChange={(event) => setDigit(index, event.target.value)}
              className="size-11 rounded-xl border border-[#E2DFDF] text-center text-lg font-medium outline-none placeholder:text-black/30"
            />
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="inline-flex h-10 w-[74px] items-center justify-center rounded-xl border border-[#E2DFDF] text-sm font-medium text-[#4E505A]">Cancel</button>
          <button type="button" onClick={onClose} className="inline-flex h-10 w-[63px] items-center justify-center rounded-xl bg-primary text-sm font-medium text-white">Verify</button>
        </div>
      </div>
    </div>
  );
}

function QrMark() {
  const cells = [
    1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1,
    1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
    1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1,
    1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0,
    1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0,
    0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1,
    1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
    0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0,
    1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1,
  ];
  return (
    <div className="grid size-[118px] grid-cols-11 gap-px bg-white">
      {cells.map((cell, index) => (
        <span key={index} className={cell ? "bg-ink" : "bg-white"} />
      ))}
    </div>
  );
}

function ContactDialog({ person, onClose }) {
  return (
    <div className="absolute inset-0 z-10 grid place-items-center bg-[rgba(6,6,6,0.4)]" onClick={(event) => { event.stopPropagation(); onClose(); }}>
      <div onClick={(event) => event.stopPropagation()} className="w-[420px] max-w-[calc(100vw-32px)] rounded-[20px] bg-white p-[25px]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-semibold leading-[27px]">{person.name}</h2>
            <p className="text-[12px] leading-[18px] text-black/50">{person.role}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-8 place-items-center">
            <img src="/figma/close.svg" alt="" className="size-7 max-w-none" />
          </button>
        </div>
        {person.manager && <p className="mt-4 text-sm font-medium">{person.manager}</p>}
        <p className="mt-2 text-sm text-[#4E505A]">{person.phone}</p>
        <p className="mt-1 text-sm text-[#4E505A]">{person.email}</p>
      </div>
    </div>
  );
}
