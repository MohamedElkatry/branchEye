export default function Menu({ open, label, onToggle, options, onSelect, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#E2DFDF] px-3 text-sm font-medium leading-[1.5] text-[#4E505A] ${open ? "bg-white" : "bg-[#F8F6F6]"}`}
      >
        <span className="whitespace-nowrap">{label}</span>
        <img src="/figma/chevron.svg" alt="" className={`size-[22px] max-w-none transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="absolute left-0 top-[52px] z-30 w-max min-w-full rounded-xl bg-white py-2 shadow-[0_8px_24px_rgba(38,38,38,0.08)]">
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                onClick={() => onSelect(option)}
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
