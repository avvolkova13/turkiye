import type {
  MarketplaceScenario,
  MarketplaceService,
} from "@/types/marketplace";

export const scenarioLabels: Record<MarketplaceScenario, string> = {
  experience: "Найти впечатление",
  transfer: "Заказать трансфер",
  "self-service": "Собрать поездку самому",
  support: "Получить помощь",
};

export const scenarioDescriptions: Record<MarketplaceScenario, string> = {
  experience: "Экскурсии, прогулки и активности с понятными условиями.",
  transfer: "Маршрут, дата и автомобиль — оставьте заявку на поездку.",
  "self-service": "Карты, eSIM и цифровые материалы для самостоятельной поездки.",
  support: "Документы и сервисы, которые помогают до и во время поездки.",
};

export const scenarioCtas: Record<MarketplaceScenario, string> = {
  experience: "Выбрать дату",
  transfer: "Заказать трансфер",
  "self-service": "Настроить услугу",
  support: "Получить помощь",
};

export const durationLabels = {
  "up-to-2-hours": "До 2 часов",
  "half-day": "Полдня",
  "full-day": "Полный день",
  "multi-day": "Несколько дней",
} as const;

export function getServiceScenario(service: MarketplaceService): MarketplaceScenario {
  if (service.type === "transfers" || service.type === "taxi") return "transfer";
  if (service.isDigital || ["connectivity", "insurance", "rental"].includes(service.type)) {
    return "self-service";
  }
  if (["services", "visa"].includes(service.type)) return "support";
  return "experience";
}
