"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./product-actions.module.css";

export function ProductActions({ serviceId }: { serviceId: string }) {
  const [added, setAdded] = useState(false);
  const router = useRouter();

  function addToCart() {
    const current = JSON.parse(window.localStorage.getItem("faro-cart") ?? "[]") as string[];
    const next = current.includes(serviceId) ? current : [...current, serviceId];
    setAdded(true);
    window.localStorage.setItem("faro-cart", JSON.stringify(next));
  }

  return (
    <div className={styles.actions}>
      <button className={styles.primary} onClick={addToCart} type="button">
        {added ? "В корзине" : "Добавить в корзину"}
      </button>
      <button className={styles.secondary} onClick={() => { addToCart(); router.push(`/checkout?service=${serviceId}`); }} type="button">
        Купить сейчас
      </button>
      {added && <a className={styles.cartLink} href="/checkout">Перейти к оформлению</a>}
    </div>
  );
}
