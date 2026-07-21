"use client";

import Image from "next/image";
import { useState } from "react";

import { collectionItems } from "@/data/home";

function CollectionIcon({ index }: { index: number }) {
  const paths = [
    "M4 20V7l8-3 8 3v13M4 20h16M8 20v-5h4v5M16 9h.01",
    "M3 15c2.5-4 5.5-4 8 0s5.5 4 8 0M3 10c2.5-4 5.5-4 8 0s5.5 4 8 0",
    "M12 4v16M8 9h8M9 20h6M6 9c0-2 2-3 6-3s6 1 6 3",
    "M4 17l8-13 8 13M7 17h10M9 13h6",
    "M12 3v18M4 8h16M4 16h16M7 4l-3 4 3 4M17 12l3 4-3 4",
  ];

  return (
    <svg aria-hidden="true" className="collection-icon" viewBox="0 0 24 24">
      <path d={paths[index] ?? paths[0]} />
    </svg>
  );
}

export function Collections() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section
      className="collections-section"
      id="collections"
      data-header-tone="dark"
      data-reveal
    >
      <div className="collections-atmosphere" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="collections-intro">
        <p>The Collections</p>
      </div>
      <div className="collection-list">
        {collectionItems.map((item, index) => (
          <button
            aria-pressed={activeIndex === index}
            className="collection-row"
            data-active={activeIndex === index}
            key={item.name}
            onFocus={() => setActiveIndex(index)}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => setActiveIndex(index)}
          >
            <span className="collection-index">0{index + 1}</span>
            <span className="collection-content">
              <span className="collection-icon-wrap"><CollectionIcon index={index} /></span>
              <span className="collection-name-main">{item.name}</span>
              <span className="collection-thumb">
                <Image alt={item.alt} fill sizes="(max-width: 760px) 7rem, 16rem" src={item.image} />
              </span>
              <span className="collection-count">({item.count.replace(/ .*/, "")})</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
