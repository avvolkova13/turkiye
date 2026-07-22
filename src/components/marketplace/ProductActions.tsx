"use client";

import { useState } from "react";

import styles from "./product-actions.module.css";

export function ProductActions({ serviceId }: { serviceId: string }) {
  const [added, setAdded] = useState(false);

  function addToCart() {
    setAdded(true);
    window.localStorage.setItem("faro-cart", JSON.stringify([serviceId]));
  }

  return (
    <div className={styles.actions}>
      <button className={styles.primary} onClick={addToCart} type="button">
        {added ? "В корзине" : "Добавить в корзину"}
      </button>
      <button className={styles.secondary} onClick={addToCart} type="button">
        Купить сейчас
      </button>
    </div>
  );
}
