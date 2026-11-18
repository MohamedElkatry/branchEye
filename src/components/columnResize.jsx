import { useLayoutEffect, useRef, useState } from "react";

const MIN_WIDTH = 72;

function readWidths(node, columnCount) {
  if (!node) return null;
  const next = [...node.querySelectorAll(":scope > tr > th")].map((cell) => Math.round(cell.getBoundingClientRect().width));
  if (next.length !== columnCount || next.some((width) => width < 8)) return null;
  return next;
}

export function useResizableColumns(columnCount) {
  const headRef = useRef(null);
  const widthsRef = useRef(null);
  const [widths, setWidths] = useState(null);

  if (widths && widths.length !== columnCount) {
    widthsRef.current = null;
    setWidths(null);
  }

  useLayoutEffect(() => {
    if (widthsRef.current?.length === columnCount) return;
    const next = readWidths(headRef.current, columnCount);
    if (!next) return;
    widthsRef.current = next;
    setWidths(next);
  });

  function onResizeStart(index, event) {
    if (!widthsRef.current) return;
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
    <th className={`relative ${className}`}>
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
