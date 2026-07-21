import { Suspense } from "react";
import Link from "next/link";

import { CatalogBrowser } from "@/components/marketplace/CatalogBrowser";
import { parseCatalogQuery } from "@/lib/marketplace/query-state";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-static";

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const filters = parseCatalogQuery(await searchParams);

  return (
    <>
      <section aria-labelledby="search-results-heading">
        <h2 id="search-results-heading">Результаты поиска</h2>
        {filters.text ? (
          <p>Показываем варианты по запросу «{filters.text}».</p>
        ) : (
          <p>Введите запрос или выберите фильтры, чтобы сузить каталог.</p>
        )}
        <Link href="/catalog">Начать путешествие</Link>
      </section>
      <Suspense fallback={<p role="status">Загружаем каталог…</p>}>
        <CatalogBrowser initialFilters={filters} />
      </Suspense>
    </>
  );
}
