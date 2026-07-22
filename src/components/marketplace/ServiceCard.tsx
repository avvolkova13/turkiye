import Image from "next/image";
import Link from "next/link";

import { marketplaceCategories } from "@/data/marketplace";
import type { MarketplaceService } from "@/types/marketplace";
import { sitePath } from "@/lib/sitePath";

import styles from "./marketplace.module.css";

type ServiceCardProps = {
  service: MarketplaceService;
};

function formatDuration(minutes: number | null) {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes} мин`;
  if (minutes % 60 === 0) return `${minutes / 60} ч`;
  return `${Math.floor(minutes / 60)} ч ${minutes % 60} мин`;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const duration = formatDuration(service.durationMinutes);
  const price = new Intl.NumberFormat("ru-RU").format(service.price);
  const categoryName = marketplaceCategories.find(({ id }) => id === service.categoryId)?.name ?? service.type;

  return (
    <article className={styles.serviceCard}>
      <Link aria-label={`Подробнее: ${service.title}`} className={styles.serviceCardLink} href={`/services/${service.slug}`}>
        <div className={styles.serviceCardMedia}>
          <Image
            alt={service.title}
            fill
            sizes="(max-width: 720px) 100vw, (max-width: 1080px) 50vw, 33vw"
            src={sitePath(service.imagePath)}
          />
          <span className={styles.serviceType}>{categoryName}</span>
        </div>
        <div className={styles.serviceCardContent}>
          <div>
            <h2>{service.title}</h2>
            <p>{service.description}</p>
          </div>
          <div className={styles.serviceMeta}>
            <span>{duration ?? service.deliveryMethod}</span>
            <strong>
              <span className={styles.priceLabel}>Цена</span>
              {" "}от {price} ₽ <small>{service.priceUnit}</small>
            </strong>
          </div>
        </div>
      </Link>
    </article>
  );
}
