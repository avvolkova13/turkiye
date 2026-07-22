import { Suspense } from "react";
import { marketplaceServices } from "@/data/marketplace";
import { CheckoutForm } from "@/components/marketplace/CheckoutForm";

import styles from "./checkout.module.css";

export default function CheckoutPage() {
  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Faro · Турция</p>
        <h1>Оформление поездки</h1>
        <p>Проверьте выбранные услуги и оставьте контакты — мы уточним детали перед подтверждением.</p>
      </div>
      <Suspense fallback={<p>Загрузка заказа…</p>}>
        <CheckoutForm services={marketplaceServices} />
      </Suspense>
    </main>
  );
}
