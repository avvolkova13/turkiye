import Image from "next/image";

import { Collections } from "@/components/home/Collections";
import { DirectionStory } from "@/components/home/DirectionStory";
import { Header } from "@/components/home/Header";
import { HeroCanvasScene } from "@/components/home/HeroCanvasScene";
import { MotionProvider } from "@/components/home/motion/MotionProvider";
import { Newsletter } from "@/components/home/Newsletter";
import { RevealObserver } from "@/components/home/RevealObserver";
import { siteConfig } from "@/config/site";
import { affordableItems, directionScenes, heroFragments } from "@/data/home";
import { sitePath } from "@/lib/sitePath";

const brandName = siteConfig.publicBrandName ?? "Türkiye";

const services = [
  ["Круиз по Босфору", "Стамбул", "от 2 900 ₽"],
  ["Трансфер из аэропорта", "Анталья", "от 3 700 ₽"],
  ["Воздушный шар", "Каппадокия", "от 14 900 ₽"],
  ["Туристическая eSIM", "Вся Турция", "от 790 ₽"],
] as const;

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Перейти к содержанию
      </a>
      <Header brandName={brandName} />
      <MotionProvider />
      <RevealObserver />

      <main id="main-content">
        <HeroCanvasScene
          fragments={heroFragments}
        />

        <DirectionStory scenes={directionScenes} />

        <section
          className="manifesto-section"
          id="manifesto"
          data-header-tone="dark"
          data-reveal
        >
          <h2 className="visually-hidden">О сервисе путешествий по Турции</h2>
          <div className="manifesto-heading">
            <p>Один сервис для всей поездки</p>
            <span>От 50 ₽ до маршрута, который меняет всё</span>
          </div>
          <div className="manifesto-layout">
            <div className="manifesto-aside">
              <p>Türkiye</p>
              <strong>Est. 2026</strong>
              <div className="manifesto-aside-image">
                <Image
                  alt="Деталь утреннего Стамбула у воды"
                  fill
                  sizes="(max-width: 760px) 34vw, 12vw"
                  src={sitePath("/images/istanbul-motion.jpg")}
                />
              </div>
            </div>
            <div className="manifesto-cards">
              <article>
                <div className="manifesto-card-image">
                  <Image
                    alt="Бухта у побережья Каша"
                    fill
                    sizes="(max-width: 760px) 100vw, 15vw"
                    src={sitePath("/images/kas-coast.jpg")}
                  />
                </div>
                <strong>Маршруты, которые остаются</strong>
                <span>Эгейское побережье</span>
              </article>
              <article>
                <div className="manifesto-card-image">
                  <Image
                    alt="Свет раннего утра в Каппадокии"
                    fill
                    sizes="(max-width: 760px) 100vw, 15vw"
                    src={sitePath("/images/cappadocia-rocks.jpg")}
                  />
                </div>
                <strong>Места вне привычного списка</strong>
                <span>Каппадокия · на рассвете</span>
              </article>
            </div>
            <div className="manifesto-main">
              <p className="manifesto-copy">
                Здесь можно купить карту прогулки, подключить связь, заказать трансфер
                или собрать поездку на несколько дней — без пяти сайтов и десятка
                переписок.
              </p>
            </div>
          </div>
          <div className="manifesto-signature">
            <span>Один сервис</span>
            <span>Вся Турция</span>
            <span>Любой масштаб</span>
          </div>
        </section>

        <section className="ideas-section" id="ideas" data-header-tone="dark">
          <div className="section-heading ideas-heading" data-reveal>
            <p>Три способа начать</p>
            <h2>С чего начать поездку</h2>
          </div>
          <div className="ideas-composition">
            <article className="idea idea-lead" data-reveal>
              <a href="#bundles" aria-label="Стамбул впервые: готовый маршрут на три дня">
                <div className="idea-media">
                  <Image
                    alt="Тёплый свод и ритм арок стамбульского базара"
                    fill
                    sizes="(max-width: 760px) 100vw, 58vw"
                src={sitePath("/images/spice-bazaar.jpg")}
                  />
                </div>
                <div className="idea-copy">
                  <span>Маршрут · 3 дня</span>
                  <h3>Стамбул впервые</h3>
                  <p>Город не по списку достопримечательностей, а по смене света и районов.</p>
                </div>
              </a>
            </article>
            <article className="idea idea-offset" data-reveal>
              <a href="#services" aria-label="Что забронировать до прилёта в Анталью">
                <div className="idea-media">
                  <Image
                    alt="Белые минеральные террасы Памуккале"
                    fill
                    sizes="(max-width: 760px) 100vw, 30vw"
                src={sitePath("/images/pamukkale.jpg")}
                  />
                </div>
                <div className="idea-copy">
                  <span>До прилёта · 5 решений</span>
                  <h3>Анталья без суеты</h3>
                </div>
              </a>
            </article>
            <article className="idea idea-note" data-reveal>
              <a href="#collections" aria-label="Каппадокия без автомобиля">
                <div className="idea-media">
                  <Image
                    alt="Воздушные шары над мягкими утренними долинами Каппадокии"
                    fill
                    sizes="(max-width: 760px) 100vw, 22vw"
                src={sitePath("/images/cappadocia-soft.jpg")}
                  />
                </div>
                <div className="idea-copy">
                  <span>Самостоятельно · 2 дня</span>
                  <h3>Каппадокия без автомобиля</h3>
                </div>
              </a>
            </article>
          </div>
        </section>

        <section className="services-section" id="services" data-header-tone="light">
          <div className="services-stage" data-reveal>
            <div className="services-image">
              <Image
                alt="Паром на Босфоре в золотом вечернем свете"
                fill
                sizes="(max-width: 760px) 100vw, 52vw"
                src={sitePath("/images/bosphorus-ferry.jpg")}
              />
              <span>Сейчас выбирают</span>
            </div>
            <div className="services-intro">
              <p>Выберите первый шаг</p>
              <h2>Услуги для ближайшей поездки</h2>
            </div>
          </div>
          <div className="service-index">
            {services.map(([name, place, price], index) => (
              <a href="#collections" key={name} data-reveal>
                <span className="service-number">0{index + 1}</span>
                <span className="service-name">{name}</span>
                <span className="service-place">{place}</span>
                <span className="service-price">{price}</span>
              </a>
            ))}
          </div>
        </section>

        <Collections />

        <section
          className="affordable-section"
          id="affordable"
          data-header-tone="dark"
          data-reveal
        >
          <div className="affordable-title">
            <span>Полезные вещи, которые лучше купить заранее</span>
            <h2>
              Для поездки — <em>от 50 ₽</em>
            </h2>
          </div>
          <div className="affordable-list">
            {affordableItems.map(([name, price], index) => (
              <a href="#newsletter" key={name}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{name}</strong>
                <b>{price}</b>
              </a>
            ))}
          </div>
        </section>

        <section className="bundles-section" id="bundles" data-header-tone="light" data-reveal>
          <div className="bundle-visual bundle-visual-left" data-reveal>
            <Image
              alt="Современная архитектура Стамбула в вечернем свете"
              fill
              sizes="(max-width: 760px) 70vw, 16vw"
              src={sitePath("/images/istanbul-modern.jpg")}
            />
          </div>
          <div className="bundle-visual bundle-visual-right" data-reveal>
            <Image
              alt="Тихая бухта Эгейского побережья Турции"
              fill
              sizes="(max-width: 760px) 92vw, 42vw"
              src={sitePath("/images/aegean-bodrum.jpg")}
            />
          </div>
          <div className="bundles-copy" data-reveal>
            <div className="bundles-intro">
              <p>Соберите поездку без пяти чатов и вкладок</p>
              <h2>Основное — уже собрано</h2>
            </div>
            <div className="bundle-links">
              {[
                ["Спокойный прилёт", "трансфер · связь · поддержка"],
                ["Стамбул впервые", "3 дня · маршрут · Босфор"],
                ["Анталья с ребёнком", "7 дней · море · семейный ритм"],
                ["Каппадокия без забот", "2 дня · трансфер · рассвет"],
              ].map(([bundle, details]) => (
                <a href="#final-cta" key={bundle}>
                  <span className="bundle-name">
                    <strong>{bundle}</strong>
                    <small>{details}</small>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section
          className="statement-section"
          id="statement"
          data-header-tone="light"
          data-reveal
        >
          <h2 className="visually-hidden">Наша позиция</h2>
          <p className="statement-label">Наша позиция</p>
          <blockquote>
            Хорошая поездка начинается с понятного плана.
          </blockquote>
          <p className="statement-signature">Команда сервиса путешествий по Турции</p>
        </section>

        <section className="principles-section" id="principles" data-header-tone="dark">
          <h2 data-reveal>Выбирайте проще. Планируйте яснее. Путешествуйте спокойнее.</h2>
          <ol>
            <li className="principle-one" data-reveal>
              <span>01</span>
              <strong>Вы выбираете</strong>
              <p>Направление, впечатление или маленькую полезную деталь.</p>
            </li>
            <li className="principle-two" data-reveal>
              <span>02</span>
              <strong>Мы подтверждаем</strong>
              <p>Фиксируем детали и оставляем только ясный план.</p>
            </li>
            <li className="principle-three" data-reveal>
              <span>03</span>
              <strong>Вы путешествуете</strong>
              <p>Без лишних вкладок, звонков и организационного шума.</p>
            </li>
          </ol>
        </section>

        <section className="final-cta-section" id="final-cta" data-header-tone="light">
          <Image
            alt="Ночная панорама Галатской башни и огней Стамбула"
            fill
            sizes="100vw"
            src={sitePath("/images/galata-night.jpg")}
          />
          <div className="final-cta-shade" />
          <div className="final-cta-copy" data-reveal>
            <span>Ваше следующее место</span>
            <h2>С чего начнём вашу Турцию?</h2>
            <p>Выберите город, услугу или готовый план — остальное соберём по шагам.</p>
            <a className="primary-action light-action" href="#directions">
              Начать путешествие
            </a>
          </div>
        </section>

        <section
          className="newsletter-section"
          id="newsletter"
          data-header-tone="dark"
          data-reveal
        >
          <div>
            <p>Полезные идеи перед следующей поездкой</p>
            <h2>Маршруты, места и практичные советы — без рекламного шума.</h2>
          </div>
          <Newsletter />
        </section>
      </main>

      <footer className="page-footer" id="page-footer" data-header-tone="light">
        <div className="footer-wordmark">
          <Image alt="Faro" height={68} src={sitePath("/faro-logo.svg")} width={161} />
        </div>
        <div className="footer-grid">
          <nav aria-label="Направления в Турции">
            <span>Направления</span>
            <a href="#directions">Стамбул</a>
            <a href="#directions">Анталья</a>
            <a href="#directions">Каппадокия</a>
            <a href="#collections">Эгейское море</a>
          </nav>
          <nav aria-label="Сервисы в путешествии">
            <span>В путешествии</span>
            <a href="#services">Впечатления</a>
            <a href="#services">Транспорт</a>
            <a href="#affordable">Связь и помощь</a>
            <a href="#bundles">Наборы</a>
          </nav>
          <nav aria-label="Информация о сервисе">
            <span>Сервис</span>
            <a href="#statement">О подходе</a>
            <a href="#principles">Как это работает</a>
            <a href="#newsletter">Поддержка</a>
          </nav>
          <div className="footer-meta">
            <span>Язык и валюта</span>
            <strong>Русский · RUB</strong>
            <small>Поддержка ежедневно · 09:00–21:00</small>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026</span>
          <span>Главная о путешествиях по Турции</span>
          <span>Все права защищены</span>
        </div>
      </footer>
    </>
  );
}
