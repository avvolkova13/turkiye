"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { marketplaceCategories, marketplaceDestinations } from "@/data/marketplace";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { getVisibleMarketplaceServices } from "@/lib/marketplace/catalog";
import { parseCatalogQuery, serializeCatalogQuery } from "@/lib/marketplace/query-state";
import type { CatalogFilters, CatalogSort } from "@/types/marketplace";

import { FilterPanel } from "./FilterPanel";
import { ServiceCard } from "./ServiceCard";
import styles from "./catalog.module.css";

type CatalogBrowserProps = {
  initialFilters: CatalogFilters;
  initialSort?: string | string[];
  initialPage?: number;
};

const sortOptions: { label: string; value: CatalogSort }[] = [
  { label: "По релевантности", value: "relevance" },
  { label: "Сначала дешевле", value: "price-asc" },
  { label: "Сначала дороже", value: "price-desc" },
  { label: "По длительности", value: "duration" },
];

const quickFilters: { label: string; value: CatalogFilters; reset?: boolean }[] = [
  { label: "Сегодня", value: { orderToday: true } },
  { label: "Завтра", value: { date: "2026-08-15" } },
  { label: "До 1 000 ₽", value: { maxPrice: 1000 } },
  { label: "Начать путешествие", value: {}, reset: true },
];

function selectedSort(value: string | string[] | undefined): CatalogSort {
  const sort = Array.isArray(value) ? value[0] : value;
  return sortOptions.some((option) => option.value === sort)
    ? (sort as CatalogSort)
    : "relevance";
}

function selectedPage(value: string | null | undefined): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function sameFilters(left: CatalogFilters, right: CatalogFilters): boolean {
  return serializeCatalogQuery(left) === serializeCatalogQuery(right);
}

function numberFromInput(value: number): number | undefined {
  return Number.isFinite(value) ? value : undefined;
}

export function CatalogBrowser({ initialFilters, initialSort }: CatalogBrowserProps) {
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const filtersFromUrl = parseCatalogQuery(Object.fromEntries(searchParams.entries()));
  const resolvedFilters = query ? filtersFromUrl : initialFilters;
  const resolvedSort = searchParams.get("sort") ?? initialSort;

  return (
    <CatalogBrowserContent
      filters={resolvedFilters}
      page={selectedPage(searchParams.get("page"))}
      sort={selectedSort(resolvedSort)}
    />
  );
}

type CatalogBrowserContentProps = {
  filters: CatalogFilters;
  page: number;
  sort: CatalogSort;
};

function CatalogBrowserContent({ filters, page, sort }: CatalogBrowserContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 720px)");
  const [filterDisclosureOpen, setFilterDisclosureOpen] = useState(true);
  const [isPending, startTransition] = useTransition();

  const results = useMemo(
    () => getVisibleMarketplaceServices(filters, sort, page),
    [filters, page, sort],
  );

  const updateUrl = useCallback(
    (nextFilters: CatalogFilters, nextSort: CatalogSort, nextPage: number) => {
      const query = new URLSearchParams(serializeCatalogQuery(nextFilters));
      if (nextSort !== "relevance") query.set("sort", nextSort);
      if (nextPage > 1) query.set("page", String(nextPage));
      const href = query.size ? `${pathname}?${query.toString()}` : pathname;

      startTransition(() => router.replace(href, { scroll: false }));
    },
    [pathname, router],
  );

  function updateFilters(nextFilters: CatalogFilters) {
    updateUrl(nextFilters, sort, 1);
  }

  function resetFilters() {
    startTransition(() => router.replace(pathname, { scroll: false }));
  }

  function updateSort(nextSort: CatalogSort) {
    updateUrl(filters, nextSort, 1);
  }

  function showMore() {
    const nextPage = page + 1;
    updateUrl(filters, sort, nextPage);
  }

  const filterOptions = {
    categories: marketplaceCategories.map(({ id, name }) => ({ label: name, value: id })),
    destinations: marketplaceDestinations.map(({ id, name }) => ({ label: name, value: id })),
    durations: [
      { label: "До 2 часов", value: "up-to-2-hours" as const },
      { label: "Полдня", value: "half-day" as const },
      { label: "Полный день", value: "full-day" as const },
      { label: "Несколько дней", value: "multi-day" as const },
    ],
    languages: [
      { label: "Русский", value: "Русский" as const },
      { label: "Английский", value: "Английский" as const },
      { label: "Турецкий", value: "Турецкий" as const },
    ],
  };
  const hasActiveFilters = serializeCatalogQuery(filters).length > 0;

  return (
    <section aria-label="Поиск и фильтры каталога" className={styles.catalog}>
      <div className={styles.quickFilters} aria-label="Быстрые фильтры">
        {quickFilters.map((quickFilter) => (
          <button
            aria-pressed={quickFilter.reset ? !hasActiveFilters : sameFilters(filters, quickFilter.value)}
            className={styles.quickFilter}
            key={quickFilter.label}
            onClick={() => quickFilter.reset ? resetFilters() : updateFilters(quickFilter.value)}
            type="button"
          >
            {quickFilter.label}
          </button>
        ))}
      </div>

      <details
        className={styles.filterDisclosure}
        onToggle={(event) => setFilterDisclosureOpen(event.currentTarget.open)}
        open={isMobile === true ? filterDisclosureOpen : true}
      >
        <summary>Поиск и фильтры</summary>
        <div className={styles.filterBody}>
          <FilterPanel onChange={updateFilters} options={filterOptions} value={filters} />
          <div className={styles.priceFilters}>
            <label>
              <span>Цена от, ₽</span>
              <input
                inputMode="numeric"
                min="0"
                onChange={(event) => updateFilters({
                  ...filters,
                  minPrice: numberFromInput(event.currentTarget.valueAsNumber),
                })}
                type="number"
                value={filters.minPrice ?? ""}
              />
            </label>
            <label>
              <span>Цена до, ₽</span>
              <input
                inputMode="numeric"
                min="0"
                onChange={(event) => updateFilters({
                  ...filters,
                  maxPrice: numberFromInput(event.currentTarget.valueAsNumber),
                })}
                type="number"
                value={filters.maxPrice ?? ""}
              />
            </label>
            {hasActiveFilters && (
              <button className={styles.clearButton} onClick={() => updateFilters({})} type="button">
                Сбросить фильтры
              </button>
            )}
          </div>
        </div>
      </details>

      <div className={styles.resultsToolbar}>
        <p aria-live="polite" className={styles.resultCount} role="status">
          {isPending ? "Обновляем результаты…" : `Найдено: ${results.total}`}
        </p>
        <label className={styles.sortControl}>
          <span>Сортировка</span>
          <select onChange={(event) => updateSort(event.target.value as CatalogSort)} value={sort}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      {results.total === 0 ? (
        <div className={styles.emptyState} role="status">
          <h2>Ничего не найдено</h2>
          <p>Попробуйте изменить запрос или убрать часть фильтров.</p>
          <button onClick={() => updateFilters({})} type="button">Показать весь каталог</button>
        </div>
      ) : (
        <>
          <div className={styles.serviceList}>
            {results.items.map((service) => <ServiceCard key={service.id} service={service} />)}
          </div>
          {results.hasNextPage && (
            <div className={styles.moreResults}>
              <button
                aria-describedby="catalog-pagination-note"
                onClick={showMore}
                type="button"
              >
                Показать ещё
              </button>
              <p id="catalog-pagination-note">
                Показано {results.items.length} из {results.total} вариантов (страницы 1–{page}).
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
