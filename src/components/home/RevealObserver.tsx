"use client";

import { useEffect } from "react";

export function RevealObserver() {
  useEffect(() => {
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const firstFold = window.innerHeight * 0.92;
    revealItems.forEach((item) => {
      if (item.getBoundingClientRect().top <= firstFold) {
        item.dataset.visible = "true";
      }
    });
    document.documentElement.dataset.revealReady = "true";

    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.setAttribute("data-visible", "true");
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    revealItems.forEach((item) => revealObserver.observe(item));

    const toneItems = Array.from(document.querySelectorAll<HTMLElement>("[data-header-tone]"));
    const toneRatios = new Map<Element, number>();
    const toneObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          toneRatios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        const visible = Array.from(toneRatios.entries())
          .filter(([, ratio]) => ratio > 0)
          .sort((a, b) => b[1] - a[1])[0]?.[0] as HTMLElement | undefined;
        if (visible) {
          document.documentElement.dataset.headerTone =
            visible.dataset.headerTone ?? "dark";
        }
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: [0, 0.2, 0.6] },
    );

    toneItems.forEach((item) => toneObserver.observe(item));

    const hero = document.getElementById("hero");
    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        document.documentElement.dataset.headerCondensed = entry.isIntersecting
          ? "false"
          : "true";
      },
      { threshold: 0.18 },
    );
    if (hero) headerObserver.observe(hero);

    return () => {
      revealObserver.disconnect();
      toneObserver.disconnect();
      headerObserver.disconnect();
      delete document.documentElement.dataset.revealReady;
    };
  }, []);

  return null;
}
