"use client";

import type {
  CatalogFilters,
  MarketplaceDuration,
  MarketplaceLanguage,
  MarketplaceServiceType,
} from "@/types/marketplace";

import styles from "./marketplace.module.css";

type SelectOption<T extends string> = {
  label: string;
  value: T;
};

export type FilterPanelOptions = {
  categories?: SelectOption<MarketplaceServiceType>[];
  destinations?: SelectOption<string>[];
  durations?: SelectOption<MarketplaceDuration>[];
  languages?: SelectOption<MarketplaceLanguage>[];
};

type FilterPanelProps = {
  value: CatalogFilters;
  onChange: (value: CatalogFilters) => void;
  options: FilterPanelOptions;
};

function omitEmptyValues(filters: CatalogFilters): CatalogFilters {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== ""),
  ) as CatalogFilters;
}

export function FilterPanel({ onChange, options, value }: FilterPanelProps) {
  function update(next: Partial<CatalogFilters>) {
    onChange(omitEmptyValues({ ...value, ...next }));
  }

  return (
    <fieldset className={styles.filterPanel}>
      <legend>Фильтры</legend>
      <label>
        <span>Что ищете</span>
        <input
          onChange={(event) => update({ text: event.target.value })}
          placeholder="Город, маршрут, услуга"
          type="search"
          value={value.text ?? ""}
        />
      </label>
      {options.categories && (
        <label>
          <span>Категория</span>
          <select
            onChange={(event) => update({ category: event.target.value as MarketplaceServiceType | undefined })}
            value={value.category ?? ""}
          >
            <option value="">Все категории</option>
            {options.categories.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      )}
      {options.destinations && (
        <label>
          <span>Направление</span>
          <select onChange={(event) => update({ destination: event.target.value || undefined })} value={value.destination ?? ""}>
            <option value="">Любое направление</option>
            {options.destinations.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      )}
      {options.durations && (
        <label>
          <span>Длительность</span>
          <select onChange={(event) => update({ duration: event.target.value as MarketplaceDuration | undefined })} value={value.duration ?? ""}>
            <option value="">Любая длительность</option>
            {options.durations.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      )}
      {options.languages && (
        <label>
          <span>Язык</span>
          <select onChange={(event) => update({ language: event.target.value as MarketplaceLanguage | undefined })} value={value.language ?? ""}>
            <option value="">Любой язык</option>
            {options.languages.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      )}
      <div className={styles.filterChecks}>
        {(["transfer", "children", "digital", "orderToday"] as const).map((key) => (
          <label key={key}>
            <input checked={value[key] ?? false} onChange={(event) => update({ [key]: event.target.checked || undefined })} type="checkbox" />
            <span>{({ transfer: "С трансфером", children: "Подходит детям", digital: "Цифровой формат", orderToday: "Заказать сегодня" } as const)[key]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
