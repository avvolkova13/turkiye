"use client";

import { useState } from "react";
import type { CatalogFilters, MarketplaceDemoDate, MarketplaceDuration, MarketplaceServiceType } from "@/types/marketplace";
import styles from "./catalog.module.css";

type ExperienceSearchFormProps = {
  value: CatalogFilters;
  onSubmit: (value: CatalogFilters) => void;
};

const formatOptions: { label: string; value: MarketplaceServiceType }[] = [
  { label: "Экскурсия", value: "excursions" },
  { label: "Активность", value: "activities" },
  { label: "Гид", value: "guides" },
  { label: "Билет или прогулка на яхте", value: "tickets" },
];

const durationOptions: { label: string; value: MarketplaceDuration }[] = [
  { label: "До 2 часов", value: "up-to-2-hours" },
  { label: "Полдня", value: "half-day" },
  { label: "Полный день", value: "full-day" },
  { label: "Несколько дней", value: "multi-day" },
];

export function ExperienceSearchForm({ onSubmit, value }: ExperienceSearchFormProps) {
  const [draft, setDraft] = useState(value);

  return (
    <form className={styles.contextForm} onSubmit={(event) => { event.preventDefault(); onSubmit({ ...draft, scenario: "experience" }); }}>
      <div className={styles.contextFormIntro}>
        <span className={styles.eyebrow}>Впечатления</span>
        <p>Укажите город и дату, затем выберите формат и длительность.</p>
      </div>
      <div className={styles.formGrid}>
        <label><span>Город или направление</span><input value={draft.destination ?? ""} onChange={(event) => setDraft({ ...draft, destination: event.target.value || undefined })} placeholder="Стамбул, Анталья, Каппадокия" /></label>
        <label><span>Дата поездки</span><input type="date" value={draft.date ?? ""} onChange={(event) => setDraft({ ...draft, date: (event.target.value || undefined) as MarketplaceDemoDate | undefined })} /></label>
        <label>
          <span>Формат</span>
          <select value={draft.category ?? ""} onChange={(event) => setDraft({ ...draft, category: (event.target.value || undefined) as MarketplaceServiceType | undefined })}>
            <option value="">Любой формат</option>
            {formatOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label>
          <span>Длительность</span>
          <select value={draft.duration ?? ""} onChange={(event) => setDraft({ ...draft, duration: (event.target.value || undefined) as MarketplaceDuration | undefined })}>
            <option value="">Любая длительность</option>
            {durationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>
      <button className={styles.primaryAction} type="submit">Показать варианты</button>
    </form>
  );
}
