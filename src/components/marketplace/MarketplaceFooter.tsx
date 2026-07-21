import Link from "next/link";

import styles from "./marketplace.module.css";

export function MarketplaceFooter() {
  return (
    <footer className={styles.marketplaceFooter}>
      <div className={styles.footerInner}>
        <p className={styles.footerMark}>Faro · Турция</p>
        <p className={styles.footerNote}>
          Каталог создан для выбора маршрута. Наличие и условия уточняются перед заказом.
        </p>
        <nav aria-label="Навигация в подвале" className={styles.footerNav}>
          <Link href="/catalog">Каталог</Link>
          <Link href="/destinations">Направления</Link>
          <Link href="/search">Поиск</Link>
        </nav>
      </div>
    </footer>
  );
}
