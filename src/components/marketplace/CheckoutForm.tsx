"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import type { MarketplaceDeliveryChannel, MarketplaceOrder, MarketplaceService } from "@/types/marketplace";
import { createOrderId, readCart, readOrders, writeCart, writeOrders } from "@/lib/marketplace/local-store";
import styles from "@/app/checkout/checkout.module.css";

const money = new Intl.NumberFormat("ru-RU");
const channels: { value: MarketplaceDeliveryChannel; label: string; hint: string }[] = [
  { value: "email", label: "Email", hint: "Билеты и инструкции придут на почту." },
  { value: "whatsapp", label: "WhatsApp", hint: "Отправим подтверждение и детали в WhatsApp." },
  { value: "phone", label: "Телефон", hint: "Свяжемся по телефону для подтверждения." },
];

type Step = "cart" | "details" | "payment";

function stepFromQuery(value: string | null): Step {
  return value === "details" || value === "payment" ? value : "cart";
}

export function CheckoutForm({ services }: { services: MarketplaceService[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const requestedId = params.get("service");
  const orderQuery = params.get("order");
  const step = stepFromQuery(params.get("step"));
  const [cart, setCart] = useState(readCart);
  const [order, setOrder] = useState<MarketplaceOrder | null>(() => orderQuery ? readOrders().find(({ id }) => id === orderQuery) ?? null : null);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryChannel, setDeliveryChannel] = useState<MarketplaceDeliveryChannel>("email");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [comment, setComment] = useState("");
  const [cardholder, setCardholder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  useEffect(() => {
    const sync = () => setCart(readCart());
    window.addEventListener("faro-cart-updated", sync);
    return () => window.removeEventListener("faro-cart-updated", sync);
  }, []);

  const selected = useMemo(() => {
    const ids = new Set(cart.map(({ serviceId }) => serviceId));
    if (requestedId) ids.add(requestedId);
    return services.filter((service) => ids.has(service.id));
  }, [cart, requestedId, services]);

  const quantityFor = (serviceId: string) => cart.find((item) => item.serviceId === serviceId)?.quantity ?? 1;
  const total = selected.reduce((sum, service) => sum + service.price * quantityFor(service.id), 0);
  const deliveryHint = channels.find(({ value }) => value === deliveryChannel)?.hint;

  function navigateTo(nextStep: Step) {
    setError("");
    router.replace(`/checkout?step=${nextStep}`);
  }

  function updateQuantity(serviceId: string, quantity: number) {
    const hasCartItem = cart.some((item) => item.serviceId === serviceId);
    const base = hasCartItem ? cart : [...cart, { serviceId, quantity: 1 }];
    const next = base
      .map((item) => item.serviceId === serviceId ? { ...item, quantity } : item)
      .filter(({ quantity: nextQuantity }) => nextQuantity > 0);
    setCart(next);
    writeCart(next);
  }

  function submitPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const digits = cardNumber.replace(/\D/g, "");
    if (digits.length !== 16 || !/^\d{2}\/\d{2}$/.test(expiry) || !/^\d{3,4}$/.test(cvc)) {
      setError("Проверьте номер карты, срок действия и CVC.");
      return;
    }
    const nextOrder: MarketplaceOrder = {
      id: createOrderId(),
      createdAt: new Date().toISOString(),
      status: "paid",
      customer: { name, email, phone, deliveryChannel, deliveryAddress, comment },
      items: selected.map((service) => ({ serviceId: service.id, title: service.title, price: service.price, currency: service.currency, priceUnit: service.priceUnit, quantity: quantityFor(service.id) })),
      total,
      currency: "RUB",
    };
    writeOrders([nextOrder, ...readOrders()]);
    writeCart([]);
    setOrder(nextOrder);
    router.replace(`/checkout?order=${nextOrder.id}`);
  }

  if (order) {
    return (
      <section className={styles.confirmation}>
        <p className={styles.eyebrow}>Оплата прошла</p>
        <h2>Заказ оформлен</h2>
        <p className={styles.orderNumber}>Номер заказа: <strong>{order.id}</strong></p>
        <div className={styles.confirmationItems}>
          {order.items.map((item) => <div className={styles.selectionRow} key={item.serviceId}><span>{item.title}<small>{item.quantity} шт.</small></span><strong>{money.format(item.price * item.quantity)} ₽</strong></div>)}
        </div>
        <p><strong>Итого: {money.format(order.total)} ₽</strong></p>
        <p>Детали заказа доставим через {channels.find(({ value }) => value === order.customer.deliveryChannel)?.label}.</p>
        <div className={styles.confirmationActions}><Link href="/account">Открыть личный кабинет</Link><Link href="/catalog">Вернуться в каталог</Link></div>
      </section>
    );
  }

  if (!selected.length) {
    return <section className={styles.confirmation}><p className={styles.eyebrow}>Корзина пуста</p><h2>Добавьте товар, чтобы продолжить</h2><p>Выберите eSIM, билет, тур или другую услугу в каталоге.</p><Link href="/catalog">Перейти в каталог</Link></section>;
  }

  return (
    <div className={styles.checkoutFlow}>
      <div className={styles.steps} aria-label="Шаги оформления">
        {["cart", "details", "payment"].map((item, index) => <span className={step === item ? styles.activeStep : ""} key={item}>{index + 1}. {item === "cart" ? "Корзина" : item === "details" ? "Данные" : "Оплата"}</span>)}
      </div>
      {step === "cart" && <section className={styles.selection}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Шаг 1</p><h2>Ваша корзина</h2></div><Link href="/catalog">Добавить ещё</Link></div>{selected.map((service) => <div className={styles.selectionRow} key={service.id}><span><strong>{service.title}</strong><small>{service.priceUnit}</small></span><div className={styles.lineActions}><div className={styles.quantity}><button aria-label={`Уменьшить количество: ${service.title}`} onClick={() => updateQuantity(service.id, quantityFor(service.id) - 1)} type="button">−</button><b>{quantityFor(service.id)}</b><button aria-label={`Увеличить количество: ${service.title}`} onClick={() => updateQuantity(service.id, quantityFor(service.id) + 1)} type="button">+</button></div><strong>{money.format(service.price * quantityFor(service.id))} ₽</strong><button className={styles.removeButton} onClick={() => updateQuantity(service.id, 0)} type="button">Удалить</button></div></div>)}<div className={styles.totalRow}><span>Итого</span><strong>{money.format(total)} ₽</strong></div><button className={styles.nextButton} onClick={() => navigateTo("details")} type="button">Продолжить</button></section>}
      {step === "details" && <form className={styles.checkoutCard} onSubmit={(event) => { event.preventDefault(); if (!deliveryAddress.trim()) { setError("Укажите email, номер телефона или другой канал получения."); return; } navigateTo("payment"); }}><p className={styles.eyebrow}>Шаг 2</p><h2>Куда отправить заказ</h2><div className={styles.formGrid}><label><span>Имя</span><input required value={name} onChange={(event) => setName(event.target.value)} /></label><label><span>Email</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label><span>Телефон</span><input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+90 ..." /></label><label><span>Канал доставки</span><select value={deliveryChannel} onChange={(event) => setDeliveryChannel(event.target.value as MarketplaceDeliveryChannel)}>{channels.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}</select></label></div><label><span>Email, номер или контакт для доставки</span><input required value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} placeholder={deliveryChannel === "email" ? "name@example.com" : "+90 ..."} /><small>{deliveryHint}</small></label><label><span>Комментарий</span><textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={4} placeholder="Даты, город или дополнительные пожелания" /></label>{error && <p className={styles.formError}>{error}</p>}<div className={styles.formActions}><button className={styles.backButton} onClick={() => navigateTo("cart")} type="button">Назад</button><button className={styles.nextButton} type="submit">К оплате</button></div></form>}
      {step === "payment" && <form className={styles.checkoutCard} onSubmit={submitPayment}><p className={styles.eyebrow}>Шаг 3</p><h2>Оплата заказа</h2><p className={styles.demoNotice}>Демонстрационная оплата: деньги не списываются, данные карты не сохраняются.</p><label><span>Имя на карте</span><input required value={cardholder} onChange={(event) => setCardholder(event.target.value)} /></label><label><span>Номер карты</span><input required inputMode="numeric" maxLength={19} value={cardNumber} onChange={(event) => setCardNumber(event.target.value.replace(/[^\d ]/g, ""))} placeholder="0000 0000 0000 0000" /></label><div className={styles.formGrid}><label><span>Срок действия</span><input required maxLength={5} value={expiry} onChange={(event) => setExpiry(event.target.value.replace(/[^\d/]/g, ""))} placeholder="MM/YY" /></label><label><span>CVC</span><input required inputMode="numeric" maxLength={4} value={cvc} onChange={(event) => setCvc(event.target.value.replace(/\D/g, ""))} placeholder="000" /></label></div>{error && <p className={styles.formError}>{error}</p>}<div className={styles.paymentSummary}><span>К оплате</span><strong>{money.format(total)} ₽</strong></div><div className={styles.formActions}><button className={styles.backButton} onClick={() => navigateTo("details")} type="button">Назад</button><button className={styles.nextButton} type="submit">Оплатить {money.format(total)} ₽</button></div></form>}
    </div>
  );
}
