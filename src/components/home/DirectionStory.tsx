"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { DirectionScene } from "@/data/home";

function DirectionIcon({ index }: { index: number }) {
  const paths = [
    <path d="M4 20V7l8-3 8 3v13M4 20h16M8 20v-5h4v5M16 9h.01" key="city" />,
    <path d="M3 15c2.5-4 5.5-4 8 0s5.5 4 8 0M3 10c2.5-4 5.5-4 8 0s5.5 4 8 0" key="sea" />,
    <path d="M12 4v16M8 9h8M9 20h6M6 9c0-2 2-3 6-3s6 1 6 3" key="balloon" />,
    <path d="M4 16h16l-1.5-6H7L4 16ZM7 16l-1 3M17 16l1 3M8 10l1-3h6l1 3" key="car" />,
    <path d="M12 3v18M4 8h16M4 16h16M7 4l-3 4 3 4M17 12l3 4-3 4" key="help" />,
  ];

  return (
    <svg aria-hidden="true" className="direction-icon" viewBox="0 0 24 24">
      {paths[index] ?? paths[0]}
    </svg>
  );
}

export function DirectionStory({ scenes }: { scenes: DirectionScene[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sceneRefs = useRef<(HTMLElement | null)[]>([]);
  const sceneRatios = useRef(new Map<Element, number>());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          sceneRatios.current.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        const active = Array.from(sceneRatios.current.entries())
          .filter(([, ratio]) => ratio > 0)
          .sort((a, b) => b[1] - a[1])[0]?.[0] as HTMLElement | undefined;
        if (active) setActiveIndex(Number(active.dataset.index));
      },
      { rootMargin: "-32% 0px -32% 0px", threshold: [0, 0.2, 0.5] },
    );

    sceneRefs.current.forEach((scene) => scene && observer.observe(scene));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="directions-story" id="directions" data-header-tone="light">
      <div className="direction-media-stage" aria-hidden="true">
        {scenes.map((scene, index) => (
          <div
            className="direction-media-layer"
            data-active={activeIndex === index}
            key={scene.number}
          >
            <Image
              alt=""
              fill
              priority={index === 0}
              loading={index > 0 && index < 3 ? "eager" : undefined}
              sizes="100vw"
              src={scene.image}
              style={{ objectPosition: scene.focalPoint }}
            />
          </div>
        ))}
        <div className="direction-stage-shade" />
        <div className="direction-progress" aria-hidden="true">
          <span style={{ transform: `scaleY(${(activeIndex + 1) / scenes.length})` }} />
        </div>
      </div>

      <div className="direction-scenes">
        {scenes.map((scene, index) => (
          <article
            className="direction-scene"
            data-direction-scene
            data-index={index}
            data-active={activeIndex === index}
            key={scene.number}
            ref={(element) => {
              sceneRefs.current[index] = element;
            }}
          >
            <div className="direction-mobile-media">
              <Image
                alt={scene.imageAlt}
                fill
                sizes="(max-width: 760px) 100vw, 1px"
                src={scene.image}
                style={{ objectPosition: scene.focalPoint }}
              />
            </div>
            <div className="direction-copy">
              <div className="direction-meta">
                <span>{scene.number}</span>
                <span className="direction-badge">
                  <DirectionIcon index={index} />
                  {scene.label}
                </span>
              </div>
              <h2>{scene.title}</h2>
              <p>{scene.description}</p>
              <a className="text-link light-link" href="#services">
                <span className="text-link-icon"><DirectionIcon index={index} /></span>
                <span className="text-link-label">{scene.cta}</span>
                <span className="text-link-arrow" aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
