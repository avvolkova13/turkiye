import type { MarketplaceCatalogSection, MarketplaceServiceType } from "../types/marketplace";

export const capturedAt = "2026-07-27" as const;
export const eurToRub = 105;

export type SourceProduct = {
  id: string;
  title: string;
  description: string;
  section: MarketplaceCatalogSection;
  type: MarketplaceServiceType;
  sourcePrice: number;
  priceUnit: string;
  sourceUrl: string;
  city?: string;
  imagePath: string;
  durationMinutes?: number | null;
  isDigital?: boolean;
  hasTransfer?: boolean;
  suitableForChildren?: boolean;
};

export function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

const istanbul = "https://istanbul.com/ru";
const trasst = "https://www.trasst.com/";

export const sourceProducts: SourceProduct[] = [
  { id: "hagia-sophia-tour", title: "Экскурсия по Святой Софии", description: "Маршрут по главному византийскому памятнику Стамбула с входом по времени и аудиосопровождением.", section: "Туры", type: "excursions", sourcePrice: 38.5, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/istanbul-waterfront-heritage.webp", durationMinutes: 150 },
  { id: "topkapi-harem-tour", title: "Топкапы и Гарем с гидом", description: "Пешеходная экскурсия по дворцовому комплексу с отдельным временем на Гарем.", section: "Туры", type: "excursions", sourcePrice: 60, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/home-canvas/istanbul-legacy-hotel.webp", durationMinutes: 180 },
  { id: "basilica-cistern-tour", title: "Цистерна Базилика без очереди", description: "Короткий исторический маршрут под землёй Стамбула с организованным входом.", section: "Туры", type: "excursions", sourcePrice: 48, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/basilica-cistern.png", durationMinutes: 120 },
  { id: "prince-islands-day", title: "Принцевы острова с обедом", description: "Однодневная поездка к островам с прогулкой, морским маршрутом и обедом.", section: "Туры", type: "excursions", sourcePrice: 22.5, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/bosphorus-ferry.jpg", durationMinutes: 540, hasTransfer: true },
  { id: "sapanca-masukiye-day", title: "Сапанджа и Машукие за один день", description: "Выезд из Стамбула к озеру и зелёным окрестностям с остановками по маршруту.", section: "Туры", type: "excursions", sourcePrice: 27.5, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/kas-coast.jpg", durationMinutes: 600, hasTransfer: true },

  { id: "basilica-ticket", title: "Цистерна Базилика: билет и аудиогид", description: "Мобильный билет для самостоятельного посещения одной из самых атмосферных достопримечательностей Старого города.", section: "Билеты в музеи и достопримечательности", type: "tickets", sourcePrice: 47.5, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/home-canvas/travertine-texture.webp", durationMinutes: 90, isDigital: true },
  { id: "dolmabahce-ticket", title: "Дворец Долмабахче и Гарем", description: "Цифровой билет с аудиосопровождением для посещения дворца на Босфоре.", section: "Билеты в музеи и достопримечательности", type: "tickets", sourcePrice: 40, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/dolmabahce-palace.png", durationMinutes: 150, isDigital: true },
  { id: "topkapi-ticket", title: "Дворец Топкапы без очереди", description: "Входной билет и аудиомаршрут по дворцовым коллекциям и дворам.", section: "Билеты в музеи и достопримечательности", type: "tickets", sourcePrice: 54, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/istanbul-street.jpg", durationMinutes: 180, isDigital: true },
  { id: "archaeology-museums-ticket", title: "Археологические музеи Стамбула", description: "Мобильный билет для самостоятельного музейного дня в историческом центре.", section: "Билеты в музеи и достопримечательности", type: "tickets", sourcePrice: 16, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/istanbul-contrast.jpg", durationMinutes: 180, isDigital: true },
  { id: "galata-tower-ticket", title: "Галатская башня с аудиогидом", description: "Вход на смотровую площадку с панорамой Золотого Рога и европейской части города.", section: "Билеты в музеи и достопримечательности", type: "tickets", sourcePrice: 32.5, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/galata-night.jpg", durationMinutes: 90, isDigital: true },

  { id: "bosphorus-dinner-cruise", title: "Ужин на Босфоре с шоу", description: "Вечерний круиз с ужином и сценической программой между европейским и азиатским берегами.", section: "Впечатления и экскурсии", type: "yachts", sourcePrice: 35, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/istanbul-waterfront-heritage.png", durationMinutes: 180 },
  { id: "turkish-coffee-workshop", title: "Мастер-класс по кофе на песке", description: "Небольшое знакомство с турецкой кофейной традицией и приготовлением напитка.", section: "Впечатления и экскурсии", type: "activities", sourcePrice: 15, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/turkish-coffee-sand.png", durationMinutes: 90 },
  { id: "mosaic-lamp-workshop", title: "Мозаичный светильник своими руками", description: "Творческий воркшоп, где можно собрать собственный восточный светильник.", section: "Впечатления и экскурсии", type: "activities", sourcePrice: 25, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/home-canvas/istanbul-modern.webp", durationMinutes: 150 },
  { id: "whirling-dervishes", title: "Шоу кружащихся дервишей", description: "Вечерняя программа с традиционной музыкой и церемонией сема.", section: "Впечатления и экскурсии", type: "activities", sourcePrice: 30, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/cappadocia-soft.jpg", durationMinutes: 75 },
  { id: "galata-rooftop-photo", title: "Фотосессия на крыше Галаты", description: "Фотосъёмка с видом на старый город и подбором образа для атмосферных кадров.", section: "Впечатления и экскурсии", type: "activities", sourcePrice: 160, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/istanbul-fog.jpg", durationMinutes: 120 },

  { id: "nomads-rooftop-dinner", title: "Ужин на крыше Nomads Istanbul", description: "Вечерний ужин с панорамой города и живой музыкальной программой.", section: "Рестораны", type: "restaurants", sourcePrice: 85, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/pamukkale.jpg", durationMinutes: 150 },
  { id: "vapeur-magique-breakfast", title: "Завтрак на круизе Le Vapeur Magique", description: "Утренний стол на прогулочном корабле с видами на Босфор.", section: "Рестораны", type: "restaurants", sourcePrice: 60, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/home-canvas/istanbul-fog.webp", durationMinutes: 150 },
  { id: "spice-bazaar-tasting", title: "Дегустационный маршрут по Египетскому базару", description: "Небольшой гастрономический маршрут по специям, сладостям и местным продуктам.", section: "Рестораны", type: "restaurants", sourcePrice: 42, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/home-canvas/ankara-alley.webp", durationMinutes: 120 },
  { id: "bosphorus-supper", title: "Вечерний стол на Босфоре", description: "Спокойный ужин на воде с посадкой на вечерний круиз.", section: "Рестораны", type: "restaurants", sourcePrice: 55, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/home-canvas/bosphorus-ferry.webp", durationMinutes: 180 },
  { id: "istanbul-chef-menu", title: "Авторское меню со вкусами Стамбула", description: "Сет из локальных блюд и современных интерпретаций турецкой кухни.", section: "Рестораны", type: "restaurants", sourcePrice: 70, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/istanbul-motion.jpg", durationMinutes: 150 },

  { id: "ottoman-hammam-massage", title: "Османский хамам и массаж", description: "Ритуал очищения, пенный массаж и расслабляющий уход в традиции стамбульской бани.", section: "Красота и wellness", type: "spa", sourcePrice: 45, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/home-canvas/bodrum-amanruya.webp", durationMinutes: 120 },
  { id: "haseki-hurrem-hammam", title: "Хамам Аясофья Хюррем Султан", description: "Сеанс в историческом хамаме рядом с площадью Султанахмет.", section: "Красота и wellness", type: "spa", sourcePrice: 110, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/antalya-ruins.jpg", durationMinutes: 120 },
  { id: "cemberlitas-hammam", title: "Чемберлиташ Хамами", description: "Классический турецкий банный ритуал в старом городе.", section: "Красота и wellness", type: "spa", sourcePrice: 45, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/perge-ruins.jpg", durationMinutes: 90 },
  { id: "bosporus-wellness-day", title: "Wellness-день у Босфора", description: "Мягкая программа отдыха с массажем, паузой на чай и видом на воду.", section: "Красота и wellness", type: "spa", sourcePrice: 90, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/home-sources/bodrum-amanruya.avif", durationMinutes: 180 },
  { id: "istanbul-spa-evening", title: "Вечерний spa-уход", description: "Восстанавливающий уход для завершения насыщенного дня в городе.", section: "Красота и wellness", type: "spa", sourcePrice: 65, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/home-canvas/kas-coast.webp", durationMinutes: 120 },

  { id: "trasst-esim-1gb", title: "eSIM Турция: 1 ГБ", description: "Небольшой пакет для мессенджеров и навигации с активацией по QR-коду.", section: "eSIM", type: "connectivity", sourcePrice: 0.99, priceUnit: "за пакет", sourceUrl: trasst, imagePath: "/images/home-kits/arrival-kit.webp", durationMinutes: 10080, isDigital: true },
  { id: "trasst-esim-3gb", title: "eSIM Турция: 3 ГБ", description: "Пакет связи для короткой поездки с инструкцией по установке.", section: "eSIM", type: "connectivity", sourcePrice: 2.29, priceUnit: "за пакет", sourceUrl: trasst, imagePath: "/images/home-kits/bosphorus-kit.webp", durationMinutes: 10080, isDigital: true },
  { id: "trasst-esim-10gb", title: "eSIM Турция: 10 ГБ", description: "Универсальный интернет-пакет для города, карт и фотографий.", section: "eSIM", type: "connectivity", sourcePrice: 6.99, priceUnit: "за пакет", sourceUrl: trasst, imagePath: "/images/cappadocia-dawn.jpg", durationMinutes: 20160, isDigital: true },
  { id: "trasst-esim-20gb", title: "eSIM Турция: 20 ГБ", description: "Расширенный пакет для длительной поездки и активного использования сети.", section: "eSIM", type: "connectivity", sourcePrice: 12.99, priceUnit: "за пакет", sourceUrl: trasst, imagePath: "/images/cappadocia-rocks.jpg", durationMinutes: 30240, isDigital: true },
  { id: "trasst-esim-50gb", title: "eSIM Турция: 50 ГБ", description: "Максимальный пакет для длительного путешествия и раздачи интернета.", section: "eSIM", type: "connectivity", sourcePrice: 28.99, priceUnit: "за пакет", sourceUrl: trasst, imagePath: "/images/aegean-bodrum.jpg", durationMinutes: 43200, isDigital: true },

  { id: "istanbul-shuttle-aksaray", title: "Шаттл IST — Аксарай", description: "Односторонний автобусный трансфер из аэропорта Стамбула в центр города.", section: "Трансферы", type: "transfers", sourcePrice: 9.95, priceUnit: "за человека", sourceUrl: trasst, city: "Стамбул", imagePath: "/images/home-canvas/aegean-bodrum.webp", durationMinutes: 90, hasTransfer: true },
  { id: "istanbul-shuttle-besiktas", title: "Шаттл IST — Бешикташ", description: "Фиксированный маршрут из нового аэропорта к району Бешикташ.", section: "Трансферы", type: "transfers", sourcePrice: 9.95, priceUnit: "за человека", sourceUrl: trasst, city: "Стамбул", imagePath: "/images/istanbul-support-neighborhood.webp", durationMinutes: 90, hasTransfer: true },
  { id: "istanbul-shuttle-kadikoy", title: "Шаттл IST — Кадыкёй", description: "Поездка из аэропорта к азиатской стороне Стамбула.", section: "Трансферы", type: "transfers", sourcePrice: 13.95, priceUnit: "за человека", sourceUrl: trasst, city: "Стамбул", imagePath: "/images/home-sources/istanbul-legacy-hotel.avif", durationMinutes: 120, hasTransfer: true },
  { id: "saw-private-transfer", title: "Приватный трансфер из Сабихи", description: "Индивидуальная машина от аэропорта SAW до отеля или адреса проживания.", section: "Трансферы", type: "transfers", sourcePrice: 60, priceUnit: "за автомобиль", sourceUrl: trasst, city: "Стамбул", imagePath: "/images/ankara-alley.jpg", durationMinutes: 90, hasTransfer: true },
  { id: "istanbul-sprinter-transfer", title: "Sprinter из аэропорта Стамбула", description: "Приватный трансфер для группы до 15 человек с встречей в аэропорту.", section: "Трансферы", type: "transfers", sourcePrice: 85, priceUnit: "за автомобиль", sourceUrl: trasst, city: "Стамбул", imagePath: "/images/modern-downtown.jpg", durationMinutes: 100, hasTransfer: true },

  { id: "istanbul-tourist-pass", title: "Istanbul Tourist Pass", description: "Многодневный цифровой пропуск с доступом к десяткам достопримечательностей и маршрутов.", section: "Проездные", type: "digital", sourcePrice: 99, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/istanbul-support-neighborhood.png", durationMinutes: 4320, isDigital: true },
  { id: "istanbul-fast-pass", title: "Istanbul FAST PASS", description: "Компактный городской пропуск для насыщенного дня с билетами без очереди.", section: "Проездные", type: "digital", sourcePrice: 49, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/galata-moon.jpg", durationMinutes: 1440, isDigital: true },
  { id: "istanbul-city-card", title: "Istanbul City Card", description: "Безлимитная транспортная карта для метро, трамваев, автобусов и паромов.", section: "Проездные", type: "digital", sourcePrice: 51, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/turkey-transfer-coast.png", durationMinutes: 4320, isDigital: true },
  { id: "cappadocia-pass", title: "Абонемент в Каппадокию", description: "Пакет входов и впечатлений для самостоятельного знакомства с долинами региона.", section: "Проездные", type: "digital", sourcePrice: 300, priceUnit: "за человека", sourceUrl: istanbul, city: "Каппадокия", imagePath: "/images/home-canvas/cappadocia-dawn.webp", durationMinutes: 10080, isDigital: true },
  { id: "istanbul-fast-day-pass", title: "Проездной и билетный набор на день", description: "Комбинация городской мобильности и нескольких входных билетов для короткого визита.", section: "Проездные", type: "digital", sourcePrice: 47, priceUnit: "за человека", sourceUrl: istanbul, city: "Стамбул", imagePath: "/images/home-sources/cappadocia-cave-hotel.avif", durationMinutes: 1440, isDigital: true },
];
