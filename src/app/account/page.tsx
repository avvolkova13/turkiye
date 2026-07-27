import { MarketplaceShell } from "@/components/marketplace/MarketplaceShell";
import { AccountOrders } from "@/components/marketplace/AccountOrders";

export default function AccountPage() {
  return (
    <MarketplaceShell currentPath="/account" title="Личный кабинет" description="Ваши заказы, инструкции и каналы доставки в одном месте.">
      <AccountOrders />
    </MarketplaceShell>
  );
}
