"use client";

import { ReactNode, useCallback, useLayoutEffect, useRef, useState } from "react";

type Rect = { x: number; y: number; width: number; height: number };
type Measurement = { width: number; height: number; rects: Rect[] };

function roundedRectPath(rect: Rect, radius = 12) {
  const r = Math.min(radius, rect.width / 2, rect.height / 2);
  return [
    `M ${rect.x + r} ${rect.y}`,
    `H ${rect.x + rect.width - r}`,
    `A ${r} ${r} 0 0 1 ${rect.x + rect.width} ${rect.y + r}`,
    `V ${rect.y + rect.height - r}`,
    `A ${r} ${r} 0 0 1 ${rect.x + rect.width - r} ${rect.y + rect.height}`,
    `H ${rect.x + r}`,
    `A ${r} ${r} 0 0 1 ${rect.x} ${rect.y + rect.height - r}`,
    `V ${rect.y + r}`,
    `A ${r} ${r} 0 0 1 ${rect.x + r} ${rect.y}`,
    "Z",
  ].join(" ");
}

function bridgePath(left: Rect, right: Rect) {
  const leftEdge = left.x + left.width;
  const rightEdge = right.x;
  const centerX = (leftEdge + rightEdge) / 2;
  const top = 9.96788665631135;
  const bottom = 34.03211334368865;
  const leftPoint = centerX - (rightEdge - leftEdge) / 2 - 1.0818500254605;
  const rightPoint = centerX + (rightEdge - leftEdge) / 2 + 1.0358437839447;

  return `M${leftPoint} ${bottom} C${leftPoint + 0.6046792} ${bottom - 0.9256123}, ${rightPoint - 0.5889258} ${bottom - 1.1853955}, ${rightPoint} ${bottom - 0.33042} L${rightPoint} ${top + 0.33042} C${rightPoint - 0.5889258} ${top + 1.1853955}, ${leftPoint + 0.6046792} ${top + 0.9256123}, ${leftPoint} ${top} Z`;
}

function floemaLabelPath(rect: Rect, height: number) {
  const y = (height - 41.296875) / 2;
  const bottom = y + 41.296875;
  const radius = Math.min(14.0409375, rect.width / 2, 20.6484375);
  return [
    `M${rect.x} ${y + radius}`,
    `A${radius} ${radius} 0 0 1 ${rect.x + radius} ${y}`,
    `L${rect.x + rect.width - radius} ${y}`,
    `A${radius} ${radius} 0 0 1 ${rect.x + rect.width} ${y + radius}`,
    `L${rect.x + rect.width} ${bottom - radius}`,
    `A${radius} ${radius} 0 0 1 ${rect.x + rect.width - radius} ${bottom}`,
    `L${rect.x + radius} ${bottom}`,
    `A${radius} ${radius} 0 0 1 ${rect.x} ${bottom - radius}`,
    "Z",
  ].join(" ");
}

export function FloemaMetaRow({ icon, label }: { icon: ReactNode; label: ReactNode }) {
  const rowRef = useRef<HTMLSpanElement>(null);
  const nodeRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [measurement, setMeasurement] = useState<Measurement>({ width: 1, height: 44, rects: [] });

  const measure = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    const rowRect = row.getBoundingClientRect();
    const next = nodeRefs.current.map((node) => {
      if (!node) return null;
      const rect = node.getBoundingClientRect();
      return {
        x: rect.left - rowRect.left,
        y: rect.top - rowRect.top,
        width: rect.width,
        height: rect.height,
      };
    }).filter((rect): rect is Rect => rect !== null);
    setMeasurement((current) => {
      if (Math.abs(current.width - rowRect.width) < 0.1 && Math.abs(current.height - rowRect.height) < 0.1 && current.rects.length === next.length && current.rects.every((rect, index) => {
        const candidate = next[index];
        return candidate && Object.keys(rect).every((key) => Math.abs(rect[key as keyof Rect] - candidate[key as keyof Rect]) < 0.1);
      })) return current;
      return { width: rowRect.width || 1, height: rowRect.height || 44, rects: next };
    });
  }, []);

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    nodeRefs.current.forEach((node) => node && observer.observe(node));
    measure();
    return () => observer.disconnect();
  }, [measure]);

  const { width, height, rects } = measurement;
  const iconRect = rects[0] ?? { x: 0, y: 0, width: 44, height: 44 };
  const labelRect = rects[1] ?? { x: 44, y: 0, width: 120, height: 44 };
  const shape = roundedRectPath(iconRect, 14.96);
  const labelShape = floemaLabelPath(labelRect, height);
  const bridges = bridgePath(iconRect, labelRect);

  return (
    <span className="floema-meta-row" ref={rowRef}>
      <svg aria-hidden="true" className="floema-meta-shape" data-meta-row-shape viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <path d={`${bridges} ${shape} ${labelShape}`} data-meta-row-shape-bridges />
      </svg>
      <span className="floema-meta-node floema-icon-side" data-meta-row-node="0" ref={(node) => { nodeRefs.current[0] = node; }}>
        <span className="floema-meta-bg" />
        <span className="floema-meta-icon">{icon}</span>
      </span>
      <span className="floema-meta-node floema-label-side" data-meta-row-node="1" ref={(node) => { nodeRefs.current[1] = node; }}>
        <span className="floema-meta-bg" />
        <span className="floema-meta-label">{label}</span>
      </span>
    </span>
  );
}
