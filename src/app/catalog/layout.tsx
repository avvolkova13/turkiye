import type { ReactNode } from "react";

import { MarketplaceShell } from "@/components/marketplace/MarketplaceShell";

export default function CatalogLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <MarketplaceShell
      currentPath="/catalog"
      description="Экскурсии, трансферы и полезные сервисы для спокойного начала путешествия."
      title="Каталог для поездки в Турцию"
    >
      {children}
    </MarketplaceShell>
  );
}
