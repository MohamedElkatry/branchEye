import { useLayoutEffect, useRef, useState } from "react";

const MIN_WIDTH = 72;

function contentWidths(table) {
  const probe = table.cloneNode(true);
  probe.querySelectorAll("colgroup").forEach((group) => group.remove());
  probe.removeAttribute("style");
  Object.assign(probe.style, {
    position: "absolute",
    visibility: "hidden",
    pointerEvents: "none",
    left: "0",
    top: "0",
    width: "max-content",
    minWidth: "0",
    tableLayout: "auto",
  });
  probe.querySelectorAll("th, td").forEach((cell) => {
    cell.style.whiteSpace = "nowrap";
    cell.style.width = "auto";
  });
  const host = table.parentElement;
  const restorePosition = getComputedStyle(host).position === "static";
  if (restorePosition) host.style.position = "relative";
  host.appendChild(probe);
  const widths = [...probe.querySelectorAll(":scope > thead > tr > th")].map((cell) => Math.ceil(cell.getBoundingClientRect().width));
  probe.remove();
  if (restorePosition) host.style.position = "";
  return widths;
}

function readWidths(node, columnCount) {
  const table = node?.closest("table");
  if (!table) return null;
  const natural = contentWidths(table);
  if (natural.length !== columnCount || natural.some((width) => width < 8)) return null;
  const fitted = natural.map((width) => Math.max(MIN_WIDTH, width));
  const total = fitted.reduce((sum, width) => sum + width, 0);
  const available = table.parentElement.clientWidth;
  if (total >= available) return fitted;
  const next = fitted.map((width) => Math.floor((width * available) / total));
  next[next.length - 1] += available - next.reduce((sum, width) => sum + width, 0);
  return next;
}

export function useResizableColumns(columnCount) {
  const headRef = useRef(null);
  const widthsRef = useRef(null);
  const userResizedRef = useRef(false);
  const observedRef = useRef(null);
  const observerRef = useRef(null);
  const lastWidthRef = useRef(0);
  const [widths, setWidths] = useState(null);

  if (widths && widths.length !== columnCount) {
    widthsRef.current = null;
    setWidths(null);
  }

  useLayoutEffect(() => {
    const host = headRef.current?.closest("table")?.parentElement ?? null;
    if (host !== observedRef.current) {
      observerRef.current?.disconnect();
      observedRef.current = host;
      lastWidthRef.current = host?.clientWidth ?? 0;
      if (host && typeof ResizeObserver !== "undefined") {
        observerRef.current = new ResizeObserver(() => {
          const width = host.clientWidth;
          if (width === lastWidthRef.current || userResizedRef.current) return;
          lastWidthRef.current = width;
          widthsRef.current = null;
          setWidths(null);
        });
        observerRef.current.observe(host);
      }
    }
  });

  useLayoutEffect(() => () => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    observedRef.current = null;
  }, []);

  useLayoutEffect(() => {
    if (widthsRef.current?.length === columnCount) return;
    const next = readWidths(headRef.current, columnCount);
    if (!next) return;
    widthsRef.current = next;
    setWidths(next);
  });

  function onResizeStart(index, event) {
    if (!widthsRef.current) return;
    userResizedRef.current = true;
    const startX = event.clientX;
    const start = [...widthsRef.current];
    function move(moveEvent) {
      const next = [...start];
      next[index] = Math.max(MIN_WIDTH, Math.round(start[index] + moveEvent.clientX - startX));
      widthsRef.current = next;
      setWidths([...next]);
    }
    function up() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  return { headRef, widths: widths?.length === columnCount ? widths : null, onResizeStart };
}

export function columnTableWidth(widths) {
  if (!widths) return undefined;
  return widths.reduce((sum, width) => sum + width, 0);
}

export function ColumnSizer({ widths }) {
  if (!widths) return null;
  return (
    <colgroup>
      {widths.map((width, index) => (
        <col key={index} style={{ width }} />
      ))}
    </colgroup>
  );
}

export function ResizableTh({ index, onResizeStart, className = "", children }) {
  return (
    <th className={`relative [&:last-child>[role=separator]]:right-0 ${className}`}>
      {children}
      <span
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize column"
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onResizeStart(index, event);
        }}
        className="absolute top-0 -right-1 z-10 h-full w-2 cursor-col-resize touch-none"
      />
    </th>
  );
}
