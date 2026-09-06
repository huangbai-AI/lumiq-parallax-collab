import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  ArrowDown,
  ArrowUpRight,
  ArrowRight,
  HeartHandshake,
  LockKeyhole,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PRODUCT_BY_ID, type ProductId } from "@/lib/products";
import HomeMotion from "@/components/home/HomeMotion";
import HomeExperiences from "@/components/home/HomeExperiences";
import HomeWaitlist from "@/components/home/HomeWaitlist";
import "./homepage.css";

const collection: ProductId[] = ["tablet", "ola", "ola-go", "nest", "print"];
const principles = [
  { key: "privacy", icon: LockKeyhole, href: "/legal/privacy" },
  { key: "children", icon: ShieldCheck, href: "/legal/child-safety" },
  { key: "parents", icon: SlidersHorizontal, href: "/legal/child-safety" },
  { key: "responsible", icon: HeartHandshake, href: "/legal/child-safety" },
] as const;

export default async function Home() {
  const t = await getTranslations("HomeRefresh");
  const home = await getTranslations("Home");
  return (
    <main id="main-content" className="lh-home" tabIndex={-1}>
      <HomeMotion />
      <section
        id="top"
        className="lh-hero"
        aria-labelledby="hero-title"
        data-home-section
      >
        <div className="lh-hero-art" data-parallax="0.09">
          <Image
            src="/assets/home-pearl/home-products-bg.webp"
            alt={t("heroAlt")}
            fill
            sizes="100vw"
            priority
          />
        </div>
        <div className="lh-wrap lh-hero-layout">
          <div className="lh-hero-copy">
            <p className="lh-eyebrow">
              <span className="lh-dot" />
              LUMIQ STUDIO
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
        </div>
        <a className="lh-scroll-cue" href="#ola">
          <ArrowDown size={16} />
          {t("scroll")}
        </a>
        <span className="lh-hero-note" aria-hidden="true">
          01 / 07
        </span>
      </section>
      <section
        id="ola"
        className="lh-ola"
        aria-labelledby="ola-title"
        data-home-section
      >
        <div className="lh-ola-art" data-parallax="0.06">
          <Image
            src="/assets/home-pearl/ola-bg.webp"
            alt={t("olaAlt")}
            fill
            sizes="100vw"
          />
        </div>
        <div className="lh-wrap lh-ola-layout">
          <div className="lh-ola-copy" data-home-reveal>
            <p className="lh-eyebrow">02 / {t("olaKicker")}</p>
            <h2 id="ola-title">
              {t("olaTitle")}
              <br />
              <span className="lh-muted">{t("olaAccent")}</span>
            </h2>
            <p className="lh-lead">{t("olaBody")}</p>
            <ul className="lh-ola-features">
              <li>
                <Sparkles size={19} />
                {home("panoramaOlaFeature2")}
              </li>
              <li>
                <HeartHandshake size={19} />
                {home("panoramaOlaFeature3")}
              </li>
              <li>
                <ArrowUpRight size={19} />
                {home("panoramaOlaFeature4")}
              </li>
            </ul>
            <Link className="lh-text-link" href="/products/ola">
              {home("panoramaOlaCta")}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      <section
        id="products"
        className="lh-collection lh-section"
        aria-labelledby="products-title"
        data-home-section
      >
        <div className="lh-wrap">
          <div className="lh-section-head" data-home-reveal>
            <div>
              <p className="lh-eyebrow">03 / {t("collectionKicker")}</p>
              <h2 id="products-title">{t("collectionTitle")}</h2>
            </div>
            <p className="lh-section-intro">{t("collectionBody")}</p>
          </div>
          <div className="lh-product-grid">
            {collection.map((id, index) => {
              const product = PRODUCT_BY_ID[id];
              return (
                <Link
                  key={id}
                  href={product.href}
                  className={`lh-product lh-product-${id}`}
                  data-home-reveal
                >
                  <div className="lh-product-copy">
                    <span className="lh-product-type">
                      {t(`products.${id}.type`)}
                    </span>
                    <h3>{t(`products.${id}.name`)}</h3>
                    <p>{t(`products.${id}.body`)}</p>
                  </div>
                  <div className="lh-product-art">
                    <Image
                      src={product.image}
                      alt={t(`products.${id}.name`)}
                      fill
                      sizes={
                        index < 2
                          ? "(max-width: 1023px) 92vw, 700px"
                          : "(max-width: 480px) 90vw, (max-width: 1023px) 46vw, 460px"
                      }
                    />
                  </div>
                  <span className="lh-product-bottom">
                    <span>{t("explore")}</span>
                    <ArrowUpRight size={21} />
                  </span>
                </Link>
              );
            })}
          </div>
          <Link href="/products" className="lh-collection-link lh-text-link">
            {t("allProducts")}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      <section
        id="experiences"
        className="lh-experiences lh-section"
        aria-labelledby="experiences-title"
        data-home-section
      >
        <div className="lh-wrap">
          <div className="lh-section-head" data-home-reveal>
            <div>
              <p className="lh-eyebrow">04 / {t("experienceKicker")}</p>
              <h2 id="experiences-title">
                {t("experienceTitle")}
                <br />
                <span>{t("experienceAccent")}</span>
              </h2>
            </div>
            <p className="lh-section-intro">{t("experienceBody")}</p>
          </div>
          <HomeExperiences />
        </div>
      </section>
      <section
        id="safety"
        className="lh-safety lh-section"
        aria-labelledby="safety-title"
        data-home-section
      >
        <div className="lh-wrap lh-safety-layout">
          <div className="lh-safety-copy" data-home-reveal>
            <p className="lh-eyebrow">05 / {t("safetyKicker")}</p>
            <h2 id="safety-title">
              {t("safetyTitle")}
              <br />
              <span className="lh-muted">{t("safetyAccent")}</span>
            </h2>
            <p className="lh-lead">{t("safetyBody")}</p>
            <div className="lh-safety-seal">
              <ShieldCheck size={30} strokeWidth={1.3} />
              <span>{t("safetySeal")}</span>
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
                  <Icon size={25} strokeWidth={1.4} />
                </span>
                <div>
                  <h3>{t(`trust.${key}.title`)}</h3>
                  <p>{t(`trust.${key}.body`)}</p>
                </div>
                <ArrowUpRight className="lh-principle-arrow" size={19} />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section
        id="family"
        className="lh-family"
        aria-labelledby="family-title"
        data-home-section
      >
        <div className="lh-family-art" data-parallax="0.05">
          <Image
            src="/assets/home-pearl/family-bg.webp"
            alt={home("familyAlt")}
            fill
            sizes="100vw"
          />
        </div>
        <div className="lh-wrap lh-family-layout">
          <div className="lh-family-copy" data-home-reveal>
            <p className="lh-eyebrow">06 / {t("familyKicker")}</p>
            <h2 id="family-title">
              {t("familyTitle")}
              <br />
              <span className="lh-muted">{t("familyAccent")}</span>
            </h2>
            <p className="lh-lead">{t("familyBody")}</p>
            <Link href="/story" className="lh-text-link">
              {t("ourStory")}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      <section
        id="join"
        className="lh-join lh-section"
        aria-labelledby="join-title"
        data-home-section
      >
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
    </main>
  );
}
