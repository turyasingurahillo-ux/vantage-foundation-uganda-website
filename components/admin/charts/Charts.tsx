"use client";

import { useState } from "react";

/**
 * Lightweight SVG chart components for the content analytics dashboard.
 *
 * No external charting library — these are small, dependency-free SVG
 * primitives that resize via viewBox and remain accessible on mobile. Each
 * chart has a clear title and tooltip/explanation. Kept deliberately simple
 * to match the brief's "clean, calm, data-focused" design direction.
 *
 * Charts:
 *   - DonutChart   — traffic source breakdown
 *   - BarChart     — category/metric comparisons
 *   - LineChart    — trend over time
 *   - FunnelChart  — reading behaviour funnel
 *   - Sparkline    — inline mini-trend in KPI cards
 */

// ---------------------------------------------------------------------------
// DonutChart
// ---------------------------------------------------------------------------

export interface DonutSlice {
  label: string;
  value: number;
  color?: string;
}

const DEFAULT_COLORS = [
  "#006b70", "#008f95", "#0b1b22", "#475569", "#94a3b8",
  "#050708", "#1e293b", "#334155", "#64748b", "#cbd5e1", "#e2e8f0",
];

export function DonutChart({
  data,
  size = 180,
  thickness = 28,
}: {
  data: DonutSlice[];
  size?: number;
  thickness?: number;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-muted-foreground" style={{ width: size, height: size }}>
        No data
      </div>
    );
  }

  // Precompute slice geometry without mutating a variable during render.
  interface SliceGeometry { item: DonutSlice; dash: number; rotation: number; color: string; fraction: number }
  interface SliceAccumulator { items: SliceGeometry[]; offset: number }
  const slices = data.reduce<SliceAccumulator>(
    (acc, slice, i) => {
      const fraction = slice.value / total;
      const dash = fraction * circumference;
      const rotation = (acc.offset / circumference) * 360 - 90;
      const color = slice.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
      acc.items.push({ item: slice, dash, rotation, color, fraction });
      acc.offset += dash;
      return acc;
    },
    { items: [], offset: 0 }
  ).items;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Traffic source donut chart">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={thickness} />
        {slices.map(({ item, dash, rotation, color, fraction }) => {
          const dashArray = `${dash} ${circumference - dash}`;
          return (
            <circle
              key={item.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={thickness}
              strokeDasharray={dashArray}
              strokeDashoffset={0}
              transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
              style={{ transition: "stroke-dasharray 0.3s ease" }}
            >
              <title>{`${item.label}: ${item.value} (${Math.round(fraction * 100)}%)`}</title>
            </circle>
          );
        })}
        <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="middle" className="fill-foreground" style={{ fontSize: 18, fontWeight: 600 }}>
          {total.toLocaleString()}
        </text>
        <text x={size / 2} y={size / 2 + 18} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground" style={{ fontSize: 11 }}>
          total
        </text>
      </svg>
      <ul className="space-y-1.5 text-sm">
        {slices.map(({ item, color }) => (
          <li key={item.label} className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-muted-foreground">{item.label}</span>
            <span className="ml-auto font-medium">{Math.round((item.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BarChart (horizontal)
// ---------------------------------------------------------------------------

export interface BarItem {
  label: string;
  value: number;
  sublabel?: string;
}

export function BarChart({ data, unit = "" }: { data: BarItem[]; unit?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No data yet.</p>;
  }
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label}>
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium">{item.label}</span>
            <span className="text-muted-foreground">
              {item.value.toLocaleString()}
              {unit} {item.sublabel && <span className="ml-1 text-xs">({item.sublabel})</span>}
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// LineChart (trend over time)
// ---------------------------------------------------------------------------

export interface LinePoint {
  label: string;
  value: number;
}

export function LineChart({
  data,
  height = 200,
  color = "#006b70",
  unit = "",
}: {
  data: LinePoint[];
  height?: number;
  color?: string;
  unit?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const width = 600;
  const padding = { top: 16, right: 16, bottom: 32, left: 48 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">Not enough data yet.</p>;
  }

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal || 1;
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: padding.left + i * stepX,
    y: padding.top + innerH - ((d.value - minVal) / range) * innerH,
    ...d,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + innerH} L ${points[0].x} ${padding.top + innerH} Z`;

  // Y-axis ticks (4 lines).
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: padding.top + innerH - t * innerH,
    value: Math.round(minVal + t * range),
  }));

  // X-axis labels (show ~6 labels max to avoid crowding).
  const labelStep = Math.max(1, Math.ceil(data.length / 6));

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: 300 }} role="img" aria-label="Trend line chart">
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line x1={padding.left} y1={tick.y} x2={width - padding.right} y2={tick.y} stroke="#e2e8f0" strokeWidth={1} />
            <text x={padding.left - 8} y={tick.y + 4} textAnchor="end" className="fill-muted-foreground" style={{ fontSize: 10 }}>
              {tick.value.toLocaleString()}
            </text>
          </g>
        ))}
        <path d={areaD} fill={color} opacity={0.08} />
        <path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hover === i ? 5 : 3}
              fill={color}
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <title>{`${p.label}: ${p.value.toLocaleString()}${unit}`}</title>
            </circle>
            {i % labelStep === 0 && (
              <text x={p.x} y={height - padding.bottom + 16} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 10 }}>
                {p.label.slice(5)}
              </text>
            )}
          </g>
        ))}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute rounded-lg border border-border bg-white px-3 py-1.5 text-xs shadow-md" style={{ left: `${(points[hover].x / width) * 100}%`, top: 0, transform: "translateX(-50%)" }}>
          <div className="font-medium">{points[hover].label}</div>
          <div className="text-muted-foreground">{points[hover].value.toLocaleString()}{unit}</div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FunnelChart (reading behaviour)
// ---------------------------------------------------------------------------

export interface FunnelStage {
  label: string;
  value: number;
}

export function FunnelChart({ stages }: { stages: FunnelStage[] }) {
  if (stages.length === 0 || stages[0].value === 0) {
    return <p className="text-sm text-muted-foreground">Not enough data yet.</p>;
  }
  const max = stages[0].value;
  return (
    <div className="space-y-2">
      {stages.map((stage, i) => {
        const pct = max > 0 ? (stage.value / max) * 100 : 0;
        const dropoff = i > 0 ? stages[i - 1].value - stage.value : 0;
        return (
          <div key={stage.label} className="flex items-center gap-3">
            <div className="w-28 shrink-0 text-right text-sm text-muted-foreground">{stage.label}</div>
            <div className="relative flex-1">
              <div className="h-9 overflow-hidden rounded-lg bg-slate-100">
                <div
                  className="flex h-full items-center justify-end rounded-lg px-3 text-xs font-semibold text-white transition-all"
                  style={{ width: `${Math.max(pct, 8)}%`, backgroundColor: "#006b70", opacity: 1 - i * 0.12 }}
                >
                  {stage.value.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="w-20 shrink-0 text-xs text-muted-foreground">
              {i === 0 ? `${pct.toFixed(0)}%` : `${pct.toFixed(0)}%`}
              {dropoff > 0 && <span className="block text-[10px]">−{dropoff.toLocaleString()}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sparkline (inline mini-trend for KPI cards)
// ---------------------------------------------------------------------------

export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = "#006b70",
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data.map((v, i) => `${i * stepX},${height - ((v - min) / range) * height}`).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
