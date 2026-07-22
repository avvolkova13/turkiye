export type MarketplaceServiceType =
  | "excursions"
  | "tickets"
  | "transfers"
  | "guides"
  | "activities"
  | "digital"
  | "connectivity"
  | "insurance"
  | "rental"
  | "services"
  | "taxi"
  | "visa"
  | "yachts"
  | "shopping"
  | "spa"
  | "airline-tickets";

/**
 * This catalog is seeded for interface development only. It intentionally
 * communicates no live inventory or purchase availability.
 */
export type MarketplaceServiceStatus = "demo";
export type MarketplaceCurrency = "RUB";
export type MarketplaceLanguage = "Русский" | "Английский" | "Турецкий";
export type MarketplaceDuration =
  | "up-to-2-hours"
  | "half-day"
  | "full-day"
  | "multi-day";
export type MarketplaceDemoDate = `${number}-${number}-${number}`;
export type MarketplaceRegion = "aegean";

export interface MarketplaceDestination {
  id: string;
  name: string;
  slug: string;
  region: string;
  description: string;
  imagePath: string;
}

export interface MarketplaceCategory {
  id: MarketplaceServiceType;
  name: string;
  description: string;
}

export interface MarketplaceService {
  id: string;
  slug: string;
  title: string;
  categoryId: MarketplaceServiceType;
  destinationId: string | null;
  type: MarketplaceServiceType;
  description: string;
  imagePath: string;
  images: string[];
  price: number;
  currency: MarketplaceCurrency;
  priceUnit: string;
  duration: MarketplaceDuration | null;
  durationMinutes: number | null;
  languages: MarketplaceLanguage[];
  hasTransfer: boolean;
  suitableForChildren: boolean;
  isDigital: boolean;
  orderToday: boolean;
  /** Interface-only dates for demo filtering; they are not live availability. */
  demoDates?: MarketplaceDemoDate[];
  included: string[];
  excluded: string[];
  cancellation: string;
  meetingPoint: string | null;
  deliveryMethod: string;
  status: MarketplaceServiceStatus;
  isMockData: true;
}

export interface ServiceVariant {
  id: string;
  serviceId: string;
  title: string;
  price: number;
  currency: MarketplaceCurrency;
  priceUnit: string;
  durationMinutes: number | null;
  status: MarketplaceServiceStatus;
  isMockData: true;
}

export type CatalogFilterKey =
  | "text"
  | "category"
  | "destination"
  | "region"
  | "minPrice"
  | "maxPrice"
  | "duration"
  | "language"
  | "transfer"
  | "children"
  | "digital"
  | "orderToday";

export interface CatalogFilters {
  text?: string;
  category?: MarketplaceServiceType;
  destination?: string;
  region?: MarketplaceRegion;
  date?: MarketplaceDemoDate;
  minPrice?: number;
  maxPrice?: number;
  duration?: MarketplaceDuration;
  language?: MarketplaceLanguage;
  transfer?: boolean;
  children?: boolean;
  digital?: boolean;
  orderToday?: boolean;
}

export type CatalogSort =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "duration";

export interface CatalogResult {
  items: MarketplaceService[];
  total: number;
  hasNextPage: boolean;
}

export interface MarketplaceNavigationItem {
  label: string;
  href: string;
}
