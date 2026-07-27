"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { readCart, writeCart } from "@/lib/marketplace/local-store";

import styles from "./product-actions.module.css";

export function ProductActions({ serviceId }: { serviceId: string }) {
  const [added, setAdded] = useState(false);
  const router = useRouter();

  function addToCart() {
    const current = readCart();
    const existing = current.find((item) => item.serviceId === serviceId);
    const next = existing ? current : [...current, { serviceId, quantity: 1 }];
    setAdded(true);
    writeCart(next);
  }

  return (
    <div className={styles.actions}>
      <button className={styles.primary} onClick={addToCart} type="button">
        {added ? "В корзине" : "Добавить в корзину"}
      </button>
      <button className={styles.secondary} onClick={() => { addToCart(); router.push("/checkout"); }} type="button">
        Купить сейчас
      </button>
      {added && <a className={styles.cartLink} href="/checkout">Перейти к оформлению</a>}
    </div>
  );
}
