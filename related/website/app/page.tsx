import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  ArrowRight,
  HeartHandshake,
  LockKeyhole,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PRODUCT_BY_ID, type ProductId } from "@/lib/products";
import HomeMotion from "@/components/home/HomeMotion";
import HomeExperiences from "@/components/home/HomeExperiences";
import HomeWaitlist from "@/components/home/HomeWaitlist";
import HomeFamily from "@/components/home/HomeFamily";
import "./homepage.css";
import "./opening-video.css";
import "./home-floors-3-4.css";

const collection: ProductId[] = ["tablet", "ola", "ola-go", "nest", "print"];
// Five masks reveal the existing rendered letters, not a browser font.
const glassSlices = [
  [0, 20],
  [20, 42],
  [42, 69.5],
  [69.5, 77.5],
  [77.5, 100],
];
const artwork: Record<ProductId, string> = {
  tablet: "home-products-20260907/tablet-angle",
  ola: "home-products-20260907/ola-angle",
  "ola-go": "home-interactive/go",
  nest: "home-products-20260907/nest15-angle-confirmed",
  print: "home-interactive/print",
};
const principles = [
  { key: "children", icon: ShieldCheck, href: "/legal/child-safety" },
  { key: "privacy", icon: LockKeyhole, href: "/legal/privacy" },
  { key: "parents", icon: SlidersHorizontal, href: "/legal/child-safety" },
  { key: "responsible", icon: HeartHandshake, href: "/legal/child-safety" },
] as const;

export default async function Home() {
  const t = await getTranslations("HomeRefresh");
  return (
    <HomeMotion>
      <div className="lh-opening">
        <div className="lh-opening-stage">
          <div className="lh-video-layer" aria-hidden="true">
            <div className="lh-video-start-poster" />
            <div className="lh-video-end-poster" />
            <video
              className="lh-opening-video"
              muted
              playsInline
              preload="none"
              tabIndex={-1}
            />
          </div>
          <div
            className="lh-atmosphere lh-opening-atmosphere"
            aria-hidden="true"
          />
          <section
            id="top"
            className="lh-hero"
            aria-labelledby="hero-title"
            data-home-section
          >
            <div className="lh-glass-word" aria-hidden="true">
              <div className="lh-glass-art">
                {glassSlices.map(([left, right], index) => (
                  <span
                    className="lh-glass-glyph"
                    key={index}
                    style={{ clipPath: `inset(0 ${100 - right}% 0 ${left}%)` }}
                  >
                    <Image
                      src="/assets/home-interactive/glass-wordmark-original.webp"
                      alt=""
                      fill
                      sizes="(max-width: 1692px) 91vw, 1540px"
                      unoptimized
                      priority
                    />
                  </span>
                ))}
              </div>
            </div>
            <div className="lh-wrap lh-hero-layout">
              <div className="lh-hero-copy">
                <p className="lh-eyebrow">
                  <span className="lh-dot" /> LUMIQ STUDIO
                </p>
                <h1 id="hero-title">
                  {t("hero1")}
                  <br />
                  {t("hero2")}
                  <br />
                  <span>{t("hero3")}</span>
                </h1>
                <p className="lh-lead">{t("heroBody")}</p>
                <div className="lh-actions">
                  <a href="#products" className="lh-button">
                    {t("discover")}
                    <ArrowRight size={18} />
                  </a>
                  <Link href="/story#brand-film" className="lh-text-link">
                    {t("ourStory")}
                    <ArrowUpRight size={18} />
                  </Link>
                </div>
              </div>
              <div
                className="lh-hero-stage"
                aria-label={t("heroAlt")}
                role="img"
              >
                <div className="lh-hero-plinth" aria-hidden="true" />
                <div className="lh-hero-object lh-hero-nest">
                  <Image
                    src="/assets/home-interactive/nest15-confirmed.webp"
                    alt=""
                    fill
                    sizes="(max-width: 767px) 36vw, 350px"
                    priority
                  />
                </div>
                <div className="lh-hero-object lh-hero-ola">
                  <Image
                    src="/assets/home-interactive/ola.webp"
                    alt=""
                    fill
                    sizes="(max-width: 767px) 40vw, 430px"
                    priority
                  />
                </div>
                <div className="lh-hero-object lh-hero-tablet">
                  <Image
                    src="/assets/home-interactive/tablet.webp"
                    alt=""
                    fill
                    sizes="(max-width: 767px) 40vw, 410px"
                    priority
                  />
                </div>
                <div className="lh-hero-object lh-hero-go">
                  <Image
                    src="/assets/home-interactive/go.webp"
                    alt=""
                    fill
                    sizes="150px"
                    priority
                  />
                </div>
              </div>
            </div>
            <a className="lh-scroll-cue" href="#ola">
              <span>
                <ArrowDown size={17} />
              </span>
              {t("scroll")}
            </a>
            <span className="lh-section-index" aria-hidden="true">
              01 — 07
            </span>
          </section>
          <section
            id="ola"
            className="lh-ola"
            aria-labelledby="ola-title"
            data-home-section
          >
            <div className="lh-wrap lh-ola-layout">
              <div className="lh-ola-copy" data-home-reveal>
                <p className="lh-eyebrow">02 / {t("olaKicker")}</p>
                <h2 id="ola-title">
                  {t("brandTitle")}
                  <br />
                  <span className="lh-muted">{t("brandAccent")}</span>
                </h2>
                <p className="lh-lead">{t("brandBody")}</p>
                <Link className="lh-text-link" href="/products/ola">
                  {t("meetOla")}
                  <ArrowRight size={18} />
                </Link>
              </div>
              <div className="lh-brand-character" aria-hidden="true">
                <Image
                  src="/assets/home-interactive/ola-character.webp"
                  alt=""
                  fill
                  sizes="(max-width: 767px) 180px, 340px"
                />
              </div>
              <div className="lh-rhythm-cards">
                {(["learn", "connect", "care"] as const).map((key, i) => (
                  <article
                    className={"lh-rhythm-card lh-rhythm-" + key}
                    key={key}
                  >
                    <div className="lh-rhythm-photo">
                      <Image
                        src={"/assets/home-video/" + key + ".webp"}
                        alt={t(`rhythms.${key}.alt`)}
                        fill
                        sizes="(max-width: 520px) 42vw, (max-width: 1100px) 28vw, 320px"
                      />
                    </div>
                    <div className="lh-rhythm-copy">
                      <span className="lh-micro-index">0{i + 1}</span>
                      <h3>{t(`rhythms.${key}.title`)}</h3>
                      <p>{t(`rhythms.${key}.body`)}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
      <section
        id="products"
        className="lh-products"
        aria-labelledby="products-title"
        data-home-section
      >
        <div className="lh-products-stage">
          <div className="lh-products-heading">
            <h2 id="products-title">{t("productsHeading")}</h2>
            <span className="lh-products-count" aria-hidden="true">
              <span data-products-current>01</span>
              <span>—</span>
              <span>05</span>
            </span>
          </div>
          <div className="lh-products-viewport" id="home-products-rail">
            <div className="lh-products-track">
              {collection.map((id, index) => (
                <div
                  className={"lh-product-slot lh-product-slot-" + id}
                  key={id}
                >
                  <Link
                    href={PRODUCT_BY_ID[id].href}
                    className={"lh-product lh-product-" + id}
                  >
                    <div className="lh-product-art">
                      <div className="lh-product-float">
                        <Image
                          src={
                            "/assets/" + artwork[id] + ".webp"
                          }
                          alt={t(`products.${id}.name`)}
                          fill
                          sizes="(max-width: 520px) 78vw, 440px"
                          quality={90}
                        />
                      </div>
                    </div>
                    <div className="lh-product-copy">
                      <span className="lh-product-type">
                        {t(`products.${id}.type`)}
                      </span>
                      <h3>{t(`products.${id}.name`)}</h3>
                      <p>{t(`products.${id}.body`)}</p>
                    </div>
                    <span className="lh-product-bottom">
                      <span>{t("explore")}</span>
                      <span className="lh-product-arrow">
                        <ArrowUpRight size={19} />
                      </span>
                    </span>
                    <span className="lh-product-number" aria-hidden="true">
                      0{index + 1}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <div className="lh-products-footer">
            <p className="lh-products-hint">
              <span className="lh-products-scroll-hint">
                {t("productsScroll")}
              </span>
              <span className="lh-products-swipe-hint">
                {t("productsSwipe")}
              </span>
            </p>
            <div className="lh-products-progress" aria-hidden="true">
              <span />
            </div>
            <div className="lh-products-controls">
              <button
                type="button"
                data-products-previous
                aria-label={t("productsPrevious")}
                aria-controls="home-products-rail"
              >
                <ArrowLeft size={20} />
              </button>
              <button
                type="button"
                data-products-next
                aria-label={t("productsNext")}
                aria-controls="home-products-rail"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>
      <section
        id="experiences"
        className="lh-experiences lh-room-section"
        aria-labelledby="experiences-title"
        data-home-section
      >
        <HomeExperiences />
      </section>
      <section
        id="safety"
        className="lh-safety lh-section"
        aria-labelledby="safety-title"
        data-home-section
      >
        <div className="lh-wrap">
          <div className="lh-safety-top">
            <div className="lh-safety-copy" data-home-reveal>
              <p className="lh-eyebrow">05 / {t("safetyKicker")}</p>
              <h2 id="safety-title">
                {t("safetyTitle")}
                <br />
                <span className="lh-muted">{t("safetyAccent")}</span>
              </h2>
              <p className="lh-lead">{t("safetyBody")}</p>
              <div className="lh-safety-seal">
                <ShieldCheck size={24} strokeWidth={1.3} />
                <span>{t("safetySeal")}</span>
              </div>
            </div>
            <div className="lh-safety-image">
              <Image
                src="/assets/home-interactive/trust-family.webp"
                alt={t("trustAlt")}
                fill
                sizes="(max-width: 767px) 100vw, 850px"
              />
              <span className="lh-photo-veil" aria-hidden="true" />
            </div>
          </div>
          <div className="lh-principles">
            {principles.map(({ key, icon: Icon, href }) => (
              <Link
                href={href}
                key={key}
                className="lh-principle"
                data-home-reveal
              >
                <span className="lh-principle-icon">
                  <Icon size={28} strokeWidth={1.3} />
                </span>
                <h3>{t(`trust.${key}.title`)}</h3>
                <p>{t(`trust.${key}.body`)}</p>
                <ArrowUpRight className="lh-principle-arrow" size={19} />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section
        id="family"
        className="lh-family lh-section"
        aria-labelledby="family-title"
        data-home-section
      >
        <div className="lh-wrap lh-section-head" data-home-reveal>
          <div>
            <p className="lh-eyebrow">06 / {t("familyKicker")}</p>
            <h2 id="family-title">
              {t("familyTitle")}
              <br />
              <span className="lh-muted">{t("familyAccent")}</span>
            </h2>
          </div>
          <div className="lh-section-intro">
            <p>{t("familyBody")}</p>
            <Link href="/story" className="lh-text-link">
              {t("ourStory")}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
        <HomeFamily />
      </section>
      <section
        id="join"
        className="lh-join lh-section"
        aria-labelledby="join-title"
        data-home-section
      >
        <div className="lh-join-art" aria-hidden="true">
          <Image
            src="/assets/home-pearl/join-bg.webp"
            alt=""
            fill
            sizes="100vw"
          />
        </div>
        <div className="lh-wrap lh-join-layout">
          <div data-home-reveal>
            <p className="lh-eyebrow">07 / {t("joinKicker")}</p>
            <h2 id="join-title">
              {t("joinTitle")}
              <br />
              <span className="lh-muted">{t("joinAccent")}</span>
            </h2>
            <p className="lh-lead">{t("joinBody")}</p>
          </div>
          <HomeWaitlist />
        </div>
      </section>
    </HomeMotion>
  );
}
