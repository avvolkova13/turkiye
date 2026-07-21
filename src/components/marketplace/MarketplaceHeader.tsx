import Image from "next/image";
import Link from "next/link";

import { marketplaceNavigation } from "@/data/marketplace";
import { sitePath } from "@/lib/sitePath";

import styles from "./marketplace.module.css";

type MarketplaceHeaderProps = {
  currentPath?: string;
};

export function MarketplaceHeader({ currentPath }: MarketplaceHeaderProps) {
  return (
    <header className={styles.marketplaceHeader}>
      <div className={styles.headerInner}>
        <Link aria-label="Faro — каталог путешествий" className={styles.brand} href="/catalog">
          <Image alt="Faro" height={46} priority src={sitePath("/faro-logo.svg")} width={109} />
        </Link>
        <nav aria-label="Основная навигация" className={styles.primaryNav}>
          {marketplaceNavigation.map((item) => (
            <Link
              aria-current={currentPath === item.href ? "page" : undefined}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
          <Link aria-current={currentPath === "/search" ? "page" : undefined} href="/search">
            Поиск
          </Link>
        </nav>
      </div>
    </header>
  );
}
