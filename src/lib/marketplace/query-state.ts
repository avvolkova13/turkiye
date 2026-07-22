import type {
  CatalogFilters,
  MarketplaceDemoDate,
  MarketplaceDuration,
  MarketplaceLanguage,
  MarketplaceRegion,
  MarketplaceServiceType,
} from "@/types/marketplace";
import { marketplaceDestinations } from "../../data/marketplace";

type SearchParams = Record<string, string | string[] | undefined>;

const categories = new Set<MarketplaceServiceType>([
  "excursions",
  "tickets",
  "transfers",
  "taxi",
  "visa",
  "yachts",
  "shopping",
  "spa",
  "airline-tickets",
  "guides",
  "activities",
  "digital",
  "connectivity",
  "insurance",
  "rental",
  "services",
]);
const durations = new Set<MarketplaceDuration>([
  "up-to-2-hours",
  "half-day",
  "full-day",
  "multi-day",
]);
const languages = new Set<MarketplaceLanguage>(["Русский", "Английский", "Турецкий"]);
const regions = new Set<MarketplaceRegion>(["aegean"]);
const destinationIds = new Set(marketplaceDestinations.map(({ id }) => id));

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function numberValue(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isEnabled(value: string | undefined): boolean {
  return value === "1";
}

function isDemoDate(value: string | undefined): value is MarketplaceDemoDate {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

export function parseCatalogQuery(searchParams: SearchParams): CatalogFilters {
  const text = firstValue(searchParams.q)?.trim();
  const category = firstValue(searchParams.category);
  const destination = firstValue(searchParams.destination)?.trim();
  const region = firstValue(searchParams.region)?.trim();
  const date = firstValue(searchParams.date);
  const duration = firstValue(searchParams.duration);
  const language = firstValue(searchParams.language);

  return {
    ...(text ? { text } : {}),
    ...(category && categories.has(category as MarketplaceServiceType)
      ? { category: category as MarketplaceServiceType }
      : {}),
    ...(destination && destinationIds.has(destination) ? { destination } : {}),
    ...(region && regions.has(region as MarketplaceRegion) ? { region: region as MarketplaceRegion } : {}),
    ...(isDemoDate(date) ? { date } : {}),
    ...(numberValue(firstValue(searchParams.minPrice)) !== undefined
      ? { minPrice: numberValue(firstValue(searchParams.minPrice)) }
      : {}),
    ...(numberValue(firstValue(searchParams.maxPrice)) !== undefined
      ? { maxPrice: numberValue(firstValue(searchParams.maxPrice)) }
      : {}),
    ...(duration && durations.has(duration as MarketplaceDuration)
      ? { duration: duration as MarketplaceDuration }
      : {}),
    ...(language && languages.has(language as MarketplaceLanguage)
      ? { language: language as MarketplaceLanguage }
      : {}),
    ...(isEnabled(firstValue(searchParams.transfer)) ? { transfer: true } : {}),
    ...(isEnabled(firstValue(searchParams.kids)) ? { children: true } : {}),
    ...(isEnabled(firstValue(searchParams.digital)) ? { digital: true } : {}),
    ...(isEnabled(firstValue(searchParams.today)) ? { orderToday: true } : {}),
  };
}

export function serializeCatalogQuery(filters: CatalogFilters): string {
  const query = new URLSearchParams();

  if (filters.text?.trim()) query.set("q", filters.text.trim());
  if (filters.category) query.set("category", filters.category);
  if (filters.destination) query.set("destination", filters.destination);
  if (filters.region) query.set("region", filters.region);
  if (filters.date) query.set("date", filters.date);
  if (Number.isFinite(filters.minPrice)) query.set("minPrice", String(filters.minPrice));
  if (Number.isFinite(filters.maxPrice)) query.set("maxPrice", String(filters.maxPrice));
  if (filters.duration) query.set("duration", filters.duration);
  if (filters.language) query.set("language", filters.language);
  if (filters.transfer) query.set("transfer", "1");
  if (filters.children) query.set("kids", "1");
  if (filters.digital) query.set("digital", "1");
  if (filters.orderToday) query.set("today", "1");

  return query.toString();
}
