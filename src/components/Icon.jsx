import iconPaths from "../iconPaths.json";

export default function Icon({ name, className = "h-[18px] w-[18px]" }) {
  const icon = iconPaths[name];
  if (!icon) return null;
  return (
    <svg
      className={className}
      viewBox={icon.viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icon.paths.map((d, index) => (
        <path key={index} d={d} />
      ))}
    </svg>
  );
}
