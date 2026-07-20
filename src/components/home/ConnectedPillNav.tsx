"use client";

import {
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useMediaQuery } from "@/hooks/useMediaQuery";

export type PillNavItem = readonly [label: string, href: string];

type ConnectedPillNavProps = {
  items: readonly PillNavItem[];
};

type MeasuredRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Geometry = {
  width: number;
  height: number;
  rects: MeasuredRect[];
};

const emptyGeometry: Geometry = { width: 0, height: 0, rects: [] };

function roundedRectPath({ x, y, width, height }: MeasuredRect, radius = 16) {
  const r = Math.min(radius, width / 2, height / 2);
  return [
    `M ${x + r} ${y}`,
    `H ${x + width - r}`,
    `Q ${x + width} ${y} ${x + width} ${y + r}`,
    `V ${y + height - r}`,
    `Q ${x + width} ${y + height} ${x + width - r} ${y + height}`,
    `H ${x + r}`,
    `Q ${x} ${y + height} ${x} ${y + height - r}`,
    `V ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    "Z",
  ].join(" ");
}

function bridgePath(left: MeasuredRect, right: MeasuredRect) {
  const middle = (left.x + left.width + right.x) / 2;
  const half = 8;
  const top = Math.max(left.y, right.y) + 5;
  const bottom = Math.min(left.y + left.height, right.y + right.height) - 5;

  return [
    `M ${middle - half} ${bottom - 5}`,
    `C ${middle - 0.2} ${bottom - 7} ${middle + 0.2} ${bottom - 7} ${middle + half} ${bottom - 5}`,
    `L ${middle + half} ${top + 5}`,
    `C ${middle + 0.2} ${top + 7} ${middle - 0.2} ${top + 7} ${middle - half} ${top + 5}`,
    "Z",
  ].join(" ");
}

export function ConnectedPillNav({ items }: ConnectedPillNavProps) {
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const frameRef = useRef(0);
  const [geometry, setGeometry] = useState<Geometry>(emptyGeometry);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const coarsePointer = useMediaQuery("(pointer: coarse)");
  const canExpand = reducedMotion === false && coarsePointer === false;
  const visualIndex = hoveredIndex ?? focusedIndex ?? 0;
  const uniqueId = useId().replace(/:/g, "");
  const clipId = `pill-clip-${uniqueId}`;
  const glowId = `pill-glow-${uniqueId}`;

  const measure = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;

    const navRect = nav.getBoundingClientRect();
    const rects = linkRefs.current
      .map((link) => {
        if (!link) return null;
        const rect = link.getBoundingClientRect();
        return {
          x: rect.left - navRect.left,
          y: rect.top - navRect.top,
          width: rect.width,
          height: rect.height,
        };
      })
      .filter((rect): rect is MeasuredRect => rect !== null);

    const next = {
      width: navRect.width,
      height: navRect.height,
      rects,
    };

    setGeometry((current) => {
      const unchanged =
        current.width === next.width &&
        current.height === next.height &&
        current.rects.length === next.rects.length &&
        current.rects.every((rect, index) => {
          const candidate = next.rects[index];
          return (
            candidate &&
            Math.abs(rect.x - candidate.x) < 0.1 &&
            Math.abs(rect.y - candidate.y) < 0.1 &&
            Math.abs(rect.width - candidate.width) < 0.1 &&
            Math.abs(rect.height - candidate.height) < 0.1
          );
        });
      return unchanged ? current : next;
    });
  }, []);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const scheduleMeasure = () => {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(nav);
    linkRefs.current.forEach((link) => {
      if (link) observer.observe(link);
    });
    scheduleMeasure();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameRef.current);
    };
  }, [measure, items]);

  const shapePath = useMemo(() => {
    const segments = geometry.rects.map((rect) => roundedRectPath(rect));
    const bridges = geometry.rects
      .slice(0, -1)
      .map((rect, index) => bridgePath(rect, geometry.rects[index + 1]));
    return [...segments, ...bridges].join(" ");
  }, [geometry.rects]);

  const dotRect = geometry.rects[visualIndex];

  return (
    <nav
      aria-label="Навигация по главной"
      className="desktop-nav connected-pill-nav"
      data-pill-nav="true"
      data-returning={hoveredIndex === null ? "true" : "false"}
      onPointerLeave={() => {
        setHoveredIndex(null);
        setPointer(null);
      }}
      onPointerMove={(event) => {
        if (coarsePointer !== false || !navRef.current) return;
        const rect = navRef.current.getBoundingClientRect();
        setPointer({ x: event.clientX - rect.left, y: event.clientY - rect.top });
      }}
      ref={navRef}
    >
      {geometry.width > 0 ? (
        <svg
          aria-hidden="true"
          className="connected-pill-shape"
          data-pill-shape
          preserveAspectRatio="none"
          viewBox={`0 0 ${geometry.width} ${geometry.height}`}
        >
          <defs>
            <clipPath id={clipId}>
              <path d={shapePath} />
            </clipPath>
            <radialGradient id={glowId}>
              <stop offset="20%" stopColor="#9c8cff88" />
              <stop offset="100%" stopColor="#9c8cff00" />
            </radialGradient>
          </defs>
          <path className="pill-surface" d={shapePath} />
          {pointer ? (
            <circle
              className="pill-pointer-glow"
              clipPath={`url(#${clipId})`}
              cx={pointer.x}
              cy={pointer.y}
              fill={`url(#${glowId})`}
              r="30"
            />
          ) : null}
          {dotRect ? (
            <circle
              className="pill-active-dot"
              cx={dotRect.x + dotRect.width / 2}
              cy={dotRect.y + dotRect.height - 5}
              r="2"
            />
          ) : null}
        </svg>
      ) : null}

      {items.map(([label, href], index) => {
        const expanded = canExpand && hoveredIndex === index;
        return (
          <a
            data-active={visualIndex === index ? "true" : "false"}
            data-expanded={expanded ? "true" : "false"}
            href={href}
            key={href}
            onBlur={() => setFocusedIndex(null)}
            onFocus={() => setFocusedIndex(index)}
            onPointerEnter={() => {
              if (canExpand) setHoveredIndex(index);
            }}
            ref={(node) => {
              linkRefs.current[index] = node;
            }}
          >
            {label}
          </a>
        );
      })}
    </nav>
  );
}
