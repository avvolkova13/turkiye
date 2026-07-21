import { marketplaceCategories, marketplaceDestinations, marketplaceServices } from "../../data/marketplace";
import type {
  CatalogFilters,
  CatalogResult,
  CatalogSort,
  MarketplaceDuration,
  MarketplaceLanguage,
  MarketplaceService,
  MarketplaceServiceType,
} from "../../types/marketplace";

const PAGE_SIZE = 12;

const categoryIds = new Set<MarketplaceServiceType>(
  marketplaceCategories.map(({ id }) => id),
);
const destinationIds = new Set(marketplaceDestinations.map(({ id }) => id));
const durationValues = new Set<MarketplaceDuration>([
  "up-to-2-hours",
  "half-day",
  "full-day",
  "multi-day",
]);
const languageValues = new Set<MarketplaceLanguage>([
  "Русский",
  "Английский",
  "Турецкий",
]);
const sortValues = new Set<CatalogSort>([
  "relevance",
  "price-asc",
  "price-desc",
  "duration",
]);

const destinationNames = new Map(
  marketplaceDestinations.map(({ id, name }) => [id, name]),
);
const categoryNames = new Map(
  marketplaceCategories.map(({ id, name }) => [id, name]),
);

function normalized(value: string): string {
  return value.trim().toLocaleLowerCase("ru-RU");
}

function searchText(service: MarketplaceService): string {
  return normalized(
    [
      service.title,
      service.description,
      categoryNames.get(service.categoryId) ?? "",
      service.destinationId ? destinationNames.get(service.destinationId) ?? "" : "",
      ...service.included,
    ].join(" "),
  );
}

function relevance(service: MarketplaceService, query: string): number {
  if (!query) return 0;

  const terms = normalized(query).split(/\s+/).filter(Boolean);
  const title = normalized(service.title);
  const description = normalized(service.description);
  const category = normalized(categoryNames.get(service.categoryId) ?? "");
  const destination = normalized(
    service.destinationId ? destinationNames.get(service.destinationId) ?? "" : "",
  );

  return terms.reduce((score, term) => {
    return (
      score +
      (title.includes(term) ? 4 : 0) +
      (description.includes(term) ? 2 : 0) +
      (category.includes(term) ? 1 : 0) +
      (destination.includes(term) ? 1 : 0)
    );
  }, 0);
}

function isKnownCategory(value: unknown): value is MarketplaceServiceType {
  return typeof value === "string" && categoryIds.has(value as MarketplaceServiceType);
}

function isKnownDuration(value: unknown): value is MarketplaceDuration {
  return typeof value === "string" && durationValues.has(value as MarketplaceDuration);
}

function isKnownLanguage(value: unknown): value is MarketplaceLanguage {
  return typeof value === "string" && languageValues.has(value as MarketplaceLanguage);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function filterMarketplaceServices(
  filters: CatalogFilters,
  sort: CatalogSort,
): CatalogResult {
  const query = typeof filters.text === "string" ? normalized(filters.text) : "";
  const category = isKnownCategory(filters.category) ? filters.category : undefined;
  const destination =
    typeof filters.destination === "string" && destinationIds.has(filters.destination)
      ? filters.destination
      : undefined;
  const minPrice = isFiniteNumber(filters.minPrice) ? filters.minPrice : undefined;
  const maxPrice = isFiniteNumber(filters.maxPrice) ? filters.maxPrice : undefined;
  const duration = isKnownDuration(filters.duration) ? filters.duration : undefined;
  const language = isKnownLanguage(filters.language) ? filters.language : undefined;
  const selectedSort = sortValues.has(sort) ? sort : "relevance";

  const filtered = marketplaceServices.filter((service) => {
    if (query && !searchText(service).includes(query)) return false;
    if (category && service.categoryId !== category) return false;
    if (destination && service.destinationId !== destination) return false;
    if (minPrice !== undefined && service.price < minPrice) return false;
    if (maxPrice !== undefined && service.price > maxPrice) return false;
    if (duration && service.duration !== duration) return false;
    if (language && !service.languages.includes(language)) return false;
    if (filters.transfer === true && !service.hasTransfer) return false;
    if (filters.children === true && !service.suitableForChildren) return false;
    if (filters.digital === true && !service.isDigital) return false;
    if (filters.orderToday === true && !service.orderToday) return false;
    return true;
  });

  const indexed = filtered.map((service, index) => ({ service, index }));
  indexed.sort((left, right) => {
    if (selectedSort === "price-asc") return left.service.price - right.service.price || left.index - right.index;
    if (selectedSort === "price-desc") return right.service.price - left.service.price || left.index - right.index;
    if (selectedSort === "duration") {
      return (
        (left.service.durationMinutes ?? Number.POSITIVE_INFINITY) -
          (right.service.durationMinutes ?? Number.POSITIVE_INFINITY) ||
        left.index - right.index
      );
    }
    return relevance(right.service, query) - relevance(left.service, query) || left.index - right.index;
  });

  return {
    items: indexed.slice(0, PAGE_SIZE).map(({ service }) => service),
    total: indexed.length,
    hasNextPage: indexed.length > PAGE_SIZE,
  };
}
