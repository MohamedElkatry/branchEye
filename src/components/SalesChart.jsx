import { lastYearSeries, thisMonthSeries } from "../dashboardData";

const WIDTH = 520;
const HEIGHT = 168;
const PAD = { top: 10, right: 12, bottom: 22, left: 32 };
const MAX_X = 38;
const MAX_Y = 36000;

function point(x, y) {
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  return [
    PAD.left + (x / MAX_X) * innerW,
    PAD.top + (1 - y / MAX_Y) * innerH,
  ];
}

function curve(series) {
  const pts = series.map(([x, y]) => point(x, y));
  let path = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let index = 0; index < pts.length - 1; index += 1) {
    const p0 = pts[Math.max(index - 1, 0)];
    const p1 = pts[index];
    const p2 = pts[index + 1];
    const p3 = pts[Math.min(index + 2, pts.length - 1)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    path += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return path;
}

function area(series) {
  const [startX] = point(series[0][0], 0);
  const [endX, baseY] = point(series[series.length - 1][0], 0);
  return `${curve(series)} L ${endX.toFixed(1)} ${baseY.toFixed(1)} L ${startX.toFixed(1)} ${baseY.toFixed(1)} Z`;
}

export default function SalesChart() {
  const yTicks = [30000, 20000, 10000, 0];
  const xTicks = [5, 10, 15, 20, 25, 30];

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full w-full" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      <defs>
        <linearGradient id="thisMonthFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4280A7" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#4280A7" stopOpacity="0" />
        </linearGradient>
      </defs>
      {yTicks.map((tick) => {
        const [, y] = point(0, tick);
        return (
          <text key={tick} x="0" y={y + 4} fill="#6F6F6F" fontSize="11">
            {tick === 0 ? "0" : `${tick / 1000}K`}
          </text>
        );
      })}
      {xTicks.map((tick) => {
        const [x] = point(tick, 0);
        return (
          <text
            key={tick}
            x={x}
            y={HEIGHT - 2}
            textAnchor="middle"
            fill="#6F6F6F"
            fontSize="11"
          >
            {tick}
          </text>
        );
      })}
      <path d={area(thisMonthSeries)} fill="url(#thisMonthFill)" stroke="none" />
      <path
        d={curve(lastYearSeries)}
        fill="none"
        stroke="#C8C9CC"
        strokeWidth="1"
        strokeDasharray="2.2 2.4"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={curve(thisMonthSeries)}
        fill="none"
        stroke="#4280A7"
        strokeWidth="1.15"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
