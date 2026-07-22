"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { MarketplaceService } from "@/types/marketplace";
import styles from "@/app/checkout/checkout.module.css";

export function CheckoutForm({ services }: { services: MarketplaceService[] }) {
  const params = useSearchParams();
  const requestedId = params.get("service");
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [contactMethod, setContactMethod] = useState("Телефон");
  const [details, setDetails] = useState("");
  const selected = useMemo(() => {
    const stored = typeof window === "undefined" ? [] : JSON.parse(window.localStorage.getItem("faro-cart") ?? "[]") as string[];
    const ids = requestedId ? [...new Set([...stored, requestedId])] : stored;
    return services.filter((service) => ids.includes(service.id));
  }, [requestedId, services]);

  if (submitted) {
    return <section className={styles.confirmation}><p className={styles.eyebrow}>Заявка принята</p><h2>Мы свяжемся с вами для подтверждения деталей.</h2><p>Письмо с дальнейшими шагами отправим на {email}.</p></section>;
  }

  return (
    <form className={styles.checkout} onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
      <section className={styles.selection}>
        <h2>Вы выбрали</h2>
        {selected.length ? selected.map((service) => <div className={styles.selectionRow} key={service.id}><span>{service.title}</span><strong>от {new Intl.NumberFormat("ru-RU").format(service.price)} ₽ <small>{service.priceUnit}</small></strong></div>) : <p>Добавьте услугу из каталога, чтобы продолжить.</p>}
      </section>
      <section className={styles.contact}>
        <h2>Контакты</h2>
        <label><span>Имя</span><input required value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label><span>Телефон</span><input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+90 ..." /></label>
        <label><span>Email</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label><span>Как удобнее связаться</span><select value={contactMethod} onChange={(event) => setContactMethod(event.target.value)}><option>Телефон</option><option>WhatsApp</option><option>Email</option></select></label>
        <label><span>Комментарий к заказу</span><textarea value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Город, даты и важные детали" rows={4} /></label>
        <button disabled={!selected.length} type="submit">Отправить заявку</button>
      </section>
    </form>
  );
}
