"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Box,
  Cpu,
  GraduationCap,
  Lock,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { PRODUCT_BY_ID } from "@/lib/products";

export default function ProductsShowcase() {
  const t = useTranslations("Products");
  const rootRef = useRef<HTMLElement>(null);
  const heroMediaRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const products = [
    {
      id: "tablet",
      href: PRODUCT_BY_ID.tablet.href,
      img: PRODUCT_BY_ID.tablet.image,
      tag: "01",
      name: "Lumiq Tablet",
    },
    {
      id: "book",
      href: PRODUCT_BY_ID.print.href,
      img: PRODUCT_BY_ID.print.image,
      tag: "02",
      name: "Lumiq Print",
    },
    {
      id: "pal",
      href: PRODUCT_BY_ID.ola.href,
      img: PRODUCT_BY_ID.ola.image,
      tag: "03",
      name: "Lumiq Ola",
    },
    {
      id: "ola-go",
      href: PRODUCT_BY_ID["ola-go"].href,
      img: PRODUCT_BY_ID["ola-go"].image,
      tag: "04",
      name: "Lumiq Ola Go",
    },
    {
      id: "nest",
      href: PRODUCT_BY_ID.nest.href,
      img: PRODUCT_BY_ID.nest.image,
      tag: "05",
      name: "Lumiq Nest 15",
    },
  ].map((product, index) => ({
    ...product,
    pill: t(`p${index + 1}Pill`),
    sub: t(`p${index + 1}Sub`),
    desc: t(`p${index + 1}Desc`),
    specs: [1, 2, 3, 4].map((n) => t(`p${index + 1}S${n}`)),
  }));
  const features = [Cpu, Box, GraduationCap, ShieldCheck].map(
    (Icon, index) => ({
      Icon,
      title: t(`f${index + 1}Title`),
      sub: t(`f${index + 1}Sub`),
    }),
  );
  const promises = [Truck, RotateCcw, BadgeCheck, Lock].map((Icon, index) => ({
    Icon,
    title: t(`pr${index + 1}Title`),
    sub: t(`pr${index + 1}Sub`),
  }));

  useEffect(() => {
    if (!rootRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    rootRef.current
      .querySelectorAll(".reveal")
      .forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const onHeroMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = heroMediaRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--px", `${(x * 16).toFixed(1)}px`);
    el.style.setProperty("--py", `${(y * 12).toFixed(1)}px`);
  };

  const onHeroLeave = () => {
    const el = heroMediaRef.current;
    if (!el) return;
    el.style.setProperty("--px", "0px");
    el.style.setProperty("--py", "0px");
  };

  const current = products[active];

  return (
    <main ref={rootRef} className="prod-page editorial-page">
      {/* Announcement bar */}
      <div className="prod-topbar" role="note">
        <div className="prod-topbar-inner">
          <span>{t("shipping")}</span>
          <span className="prod-topbar-dot" aria-hidden />
          <span>{t("returns")}</span>
          <span className="prod-topbar-dot" aria-hidden />
          <span>{t("warranty")}</span>
        </div>
      </div>

      {/* Hero */}
      <section className="container prod-hero">
        <div className="prod-hero-text reveal">
          <span className="prod-kicker">{t("kicker")}</span>
          <h1 className="serif">
            {t("title1")}
            <br />
            <em>{t("title2")}</em>
          </h1>
          <p className="prod-lead">{t("lead")}</p>
          <div className="prod-cta-row">
            <a href="#lineup" className="btn btn-navy">
              {t("explore")}
            </a>
            <Link href="/plans" className="prod-ghost-link">
              {t("compare")}
            </Link>
          </div>
        </div>
        <div
          className="prod-hero-media reveal d2"
          ref={heroMediaRef}
          onMouseMove={onHeroMove}
          onMouseLeave={onHeroLeave}
        >
          <Image
            src="/assets/products/lumiq-ola-tablet-hero.webp"
            alt={t("heroAlt")}
            width={1268}
            height={944}
            sizes="(max-width: 820px) 100vw, 50vw"
            priority
          />
        </div>
      </section>

      {/* Feature strip */}
      <section className="prod-feats reveal">
        <div className="container prod-feats-grid">
          {features.map(({ Icon, title, sub }) => (
            <div key={title} className="prod-feat">
              <span className="prod-feat-ico">
                <Icon size={20} strokeWidth={1.6} />
              </span>
              <span>
                <strong>{title}</strong>
                <small>{sub}</small>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive lineup */}
      <section id="lineup" className="container prod-lineup">
        <div className="prod-lineup-head reveal">
          <span className="prod-kicker">{t("lineup")}</span>
          <h2 className="serif">{t("lineupTitle")}</h2>
        </div>

        <div
          className="prod-tabs reveal"
          role="tablist"
          aria-label={t("productsAria")}
        >
          {products.map((p, i) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={`prod-tab${i === active ? " on" : ""}`}
              onClick={() => setActive(i)}
            >
              <span className="prod-tab-num serif">{p.tag}</span>
              <span className="prod-tab-name">{p.name}</span>
              <span className="prod-tab-sub">{p.sub}</span>
            </button>
          ))}
        </div>

        <div className="prod-stage reveal">
          <div className="prod-stage-media">
            {products.map((p, i) => (
              <Image
                key={p.id}
                src={p.img}
                alt={i === active ? p.name : ""}
                width={1000}
                height={1000}
                sizes="(max-width: 820px) 100vw, 55vw"
                className={`${i === active ? "on" : ""}${p.id === "nest" ? " nest" : ""}`}
                loading={i === 0 ? undefined : "lazy"}
              />
            ))}
          </div>

          <div className="prod-stage-panel">
            <div className="prod-panel-body" key={current.id}>
              <span className="prod-index serif" aria-hidden>
                {current.tag}
              </span>
              <span className="prod-pill">{current.pill}</span>
              <h3 className="serif">{current.name}</h3>
              <div className="prod-sub">{current.sub}</div>
              <p>{current.desc}</p>
              <ul className="prod-specs">
                {current.specs.map((s) => (
                  <li key={s}>
                    <span className="prod-tick" aria-hidden />
                    {s}
                  </li>
                ))}
              </ul>
              <Link href={current.href} className="prod-product-link">
                {t("discover", { name: current.name })}
              </Link>
            </div>

            <div className="prod-stage-nav">
              <button
                type="button"
                aria-label={t("previous")}
                onClick={() =>
                  setActive((active + products.length - 1) % products.length)
                }
              >
                <ArrowLeft size={18} strokeWidth={1.8} />
              </button>
              <span className="prod-counter">{current.tag} / 05</span>
              <button
                type="button"
                aria-label={t("next")}
                onClick={() => setActive((active + 1) % products.length)}
              >
                <ArrowRight size={18} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Brand story invitation */}
      <section className="prod-story-invite reveal">
        <div className="container prod-story-invite-inner">
          <div className="prod-story-invite-heading">
            <span className="prod-kicker">{t("why")}</span>
            <h2 className="serif">{t("whyTitle")}</h2>
          </div>
          <div className="prod-story-invite-copy">
            <p>{t("whyBody")}</p>
            <Link href="/story" className="prod-story-link">
              <span>{t("story")}</span>
              <ArrowRight size={16} strokeWidth={1.7} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="prod-promise reveal">
        <div className="container prod-promise-grid">
          {promises.map(({ Icon, title, sub }) => (
            <div key={title} className="prod-promise-item">
              <span className="prod-promise-ico">
                <Icon size={22} strokeWidth={1.6} />
              </span>
              <strong>{title}</strong>
              <small>{sub}</small>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        .prod-page { background: #fff; color: var(--ink); padding-top: 6.5rem; line-height: 1.6; }
        .prod-page .container { max-width: 1200px; }

        .prod-kicker { display: block; font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 1rem; }
        .prod-ghost-link { color: var(--ink-2); border-bottom: 1px solid var(--ink-4); padding-bottom: 2px; font-size: 0.95rem; transition: color .25s, border-color .25s; }
        .prod-ghost-link:hover { color: var(--ink); border-color: var(--ink); }

        .prod-topbar { border-bottom: 1px solid var(--border); }
        .prod-topbar-inner { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 0.9rem 1.75rem; padding: 0.7rem 1.5rem; font-size: 0.6875rem; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-3); }
        .prod-topbar-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--ink-4); }

        .prod-page > .prod-hero { display: grid; grid-template-columns: 1.05fr 1fr; gap: 4rem; align-items: center; padding-top: clamp(3.5rem, 5vw, 4.5rem); padding-bottom: clamp(3.5rem, 5vw, 4.5rem); }
        .prod-hero-text h1 { font-size: clamp(2.75rem, 6vw, 4.75rem); line-height: 1.03; letter-spacing: -0.02em; margin: 0 0 1.5rem; }
        .prod-hero-text h1 em { font-style: italic; color: var(--gold); }
        .prod-lead { color: var(--ink-2); font-size: 1.125rem; line-height: 1.7; max-width: 30rem; }
        .prod-cta-row { display: flex; align-items: center; gap: 1.75rem; margin-top: 2.25rem; flex-wrap: wrap; }
        .prod-hero-media { display: flex; align-items: center; justify-content: center; aspect-ratio: 4 / 3; overflow: visible; }
        .prod-hero-media img { width: 112%; height: 112%; max-width: none; object-fit: contain; display: block; filter: drop-shadow(0 24px 28px rgba(31,23,14,.12)) drop-shadow(0 7px 10px rgba(31,23,14,.08)); transform: translate(var(--px, 0px), var(--py, 0px)) scale(.98); transition: transform 0.5s ease-out; will-change: transform; }

        .prod-page > .prod-feats { padding-top: 0; padding-bottom: 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .prod-feats-grid { display: grid; grid-template-columns: repeat(4, 1fr); }
        .prod-feat { display: flex; align-items: center; gap: 1rem; padding: 1.75rem 1.75rem; border-left: 1px solid var(--border); }
        .prod-feat:first-child { border-left: none; }
        .prod-feat-ico { width: 44px; height: 44px; border: 1px solid var(--border-h); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: var(--ink); flex-shrink: 0; transition: background .3s, color .3s, border-color .3s; }
        .prod-feat:hover .prod-feat-ico { background: var(--ink); color: #fff; border-color: var(--ink); }
        .prod-feat strong { display: block; font-size: 0.9375rem; color: var(--ink); }
        .prod-feat small { display: block; font-size: 0.8125rem; color: var(--ink-3); margin-top: 0.15rem; }

        .prod-page > .prod-lineup { padding-top: clamp(4rem, 6vw, 5rem); padding-bottom: clamp(4rem, 6vw, 5rem); scroll-margin-top: 5rem; }
        .prod-lineup-head h2 { font-size: clamp(2rem, 4vw, 3rem); line-height: 1.12; margin: 0; max-width: 680px; }

        .prod-tabs { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1.25rem; margin: 3rem 0 3.5rem; }
        .prod-tab { text-align: left; background: none; border: 0; border-top: 1px solid var(--border); padding: 1.25rem 0 0; cursor: pointer; position: relative; color: var(--ink-4); font-family: inherit; transition: color .3s; }
        .prod-tab::before { content: ""; position: absolute; top: -1px; left: 0; width: 0; height: 2px; background: var(--gold); transition: width .5s cubic-bezier(0.22, 1, 0.36, 1); }
        .prod-tab:hover { color: var(--ink-2); }
        .prod-tab.on { color: var(--ink); }
        .prod-tab.on::before { width: 100%; }
        .prod-tab-num { display: block; font-size: 0.9375rem; font-style: italic; }
        .prod-tab-name { display: block; font-family: var(--font-serif); font-size: 1.375rem; margin-top: 0.35rem; }
        .prod-tab-sub { display: block; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 0.35rem; }

        .prod-stage { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 4rem; align-items: stretch; }
        .prod-stage-media { position: relative; display: block; width: 100%; min-width: 0; align-self: center; aspect-ratio: 1 / 1; overflow: hidden; border: 1px solid rgba(20,20,20,.08); border-radius: 24px; background: radial-gradient(circle at 50% 48%, #fff 0%, var(--cream-3) 72%); color: inherit; box-shadow: 0 20px 54px rgba(24,18,10,.08); }
        .prod-stage-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; padding: clamp(1rem, 3vw, 2.25rem); opacity: 0; transform: scale(1.03); transition: opacity 0.6s ease, transform 0.9s ease; }
        .prod-stage-media img.nest { padding: clamp(1.25rem, 3vw, 2.5rem); }
        .prod-stage-media img.on { opacity: 1; transform: scale(1); }
        .prod-stage-media:hover img.on { transform: scale(1.025); }

        .prod-stage-panel { min-width: 0; display: flex; flex-direction: column; justify-content: center; }
        @keyframes prodFade { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .prod-panel-body { animation: prodFade 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }
        .prod-index { display: block; font-size: 4rem; line-height: 1; color: var(--lilac-2); }
        .prod-pill { display: inline-block; font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--gold); margin: 0.85rem 0 0.9rem; }
        .prod-panel-body h3 { font-size: clamp(1.9rem, 3vw, 2.6rem); line-height: 1.1; margin: 0; }
        .prod-sub { font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-3); margin: 0.6rem 0 1rem; }
        .prod-panel-body p { color: var(--ink-2); line-height: 1.7; margin-bottom: 1.5rem; }
        .prod-page .prod-specs { width: 100%; list-style: none; margin: 0; padding: 0 0 2.25rem; }
        .prod-page .prod-specs li { display: flex; align-items: center; gap: 0.7rem; padding: 0.55rem 0; border-bottom: 1px dashed var(--border); font-size: 0.9375rem; color: var(--ink-2); }
        .prod-tick { width: 5px; height: 5px; background: var(--gold); flex-shrink: 0; }
        .prod-page .prod-product-link { position: relative; display: inline-flex; align-items: center; justify-content: center; width: fit-content; min-height: 48px; margin-top: .25rem; padding: .8rem 1.6rem; border-radius: 999px; background: var(--ink); color: #fff; font-size: .9375rem; font-weight: 600; line-height: 1.2; transition: color .25s ease, background .25s ease, box-shadow .25s ease, transform .25s ease; }
        .prod-page .prod-product-link:hover { background: var(--gold); color: #fff; transform: translateY(-2px); box-shadow: 0 12px 26px rgba(24,18,10,.14); }
        .prod-page .prod-product-link:focus-visible { outline: 2px solid var(--ink); outline-offset: 4px; }

        .prod-stage-nav { display: flex; align-items: center; gap: 1.25rem; margin-top: 2.25rem; }
        .prod-stage-nav button { width: 42px; height: 42px; border-radius: 50%; border: 1px solid var(--border-h); background: #fff; color: var(--ink); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: background .25s, color .25s, border-color .25s; }
        .prod-stage-nav button:hover { background: var(--ink); color: #fff; border-color: var(--ink); }
        .prod-counter { font-size: 0.8125rem; letter-spacing: 0.14em; color: var(--ink-3); }

        .prod-page > .prod-story-invite { padding-top: 0; padding-bottom: 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); background: var(--cream-2); }
        .prod-page > .prod-story-invite .prod-story-invite-inner { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(18rem, .85fr); gap: clamp(3rem, 8vw, 7rem); align-items: center; min-height: clamp(22rem, 28vw, 27rem); padding-top: clamp(5rem, 7vw, 7rem); padding-bottom: clamp(5rem, 7vw, 7rem); }
        .prod-story-invite .prod-kicker { margin-bottom: .8rem; }
        .prod-story-invite-heading h2 { max-width: 36rem; font-size: clamp(1.85rem, 3.2vw, 2.5rem); line-height: 1.16; }
        .prod-story-invite-copy p { color: var(--ink-2); font-size: .975rem; line-height: 1.75; margin: .15rem 0 1.5rem; }
        .prod-story-link { display: inline-flex; align-items: center; gap: .55rem; color: var(--ink-2); font-size: .875rem; font-weight: 600; }
        .prod-story-link svg { transition: transform .25s ease; }
        .prod-story-link:hover { color: var(--gold); }
        .prod-story-link:hover svg { transform: translateX(3px); }
        .prod-story-link:focus-visible { outline: 2px solid var(--ink); outline-offset: 5px; }

        .prod-page > .prod-promise { padding-top: 0; padding-bottom: 0; }
        .prod-promise-grid { display: grid; grid-template-columns: repeat(4, 1fr); }
        .prod-promise-item { display: flex; flex-direction: column; gap: 0.35rem; padding: 2.75rem 1.75rem; border-left: 1px solid var(--border); }
        .prod-promise-item:first-child { border-left: none; }
        .prod-promise-ico { color: var(--gold); margin-bottom: 0.5rem; }
        .prod-promise-item strong { font-size: 0.9375rem; color: var(--ink); }
        .prod-promise-item small { font-size: 0.8125rem; color: var(--ink-3); line-height: 1.5; }

        @media (max-width: 960px) {
          .prod-page > .prod-hero { grid-template-columns: 1fr; gap: 2.5rem; padding-top: 3.5rem; padding-bottom: 3.5rem; }
          .prod-feats-grid { grid-template-columns: repeat(2, 1fr); }
          .prod-feat:nth-child(odd) { border-left: none; }
          .prod-feat:nth-child(n+3) { border-top: 1px solid var(--border); }
          .prod-page > .prod-lineup { padding-top: 4rem; padding-bottom: 3.5rem; }
          .prod-tabs { grid-template-columns: 1fr; gap: 0.5rem; margin: 2.25rem 0 2.5rem; }
          .prod-tab { padding: 0.9rem 0 0.9rem; }
          .prod-stage { grid-template-columns: 1fr; gap: 2.5rem; }
          .prod-page > .prod-story-invite .prod-story-invite-inner { grid-template-columns: 1fr; gap: 2rem; min-height: 0; padding-top: 5rem; padding-bottom: 5rem; }
          .prod-promise-grid { grid-template-columns: repeat(2, 1fr); }
          .prod-promise-item:nth-child(odd) { border-left: none; }
          .prod-promise-item:nth-child(n+3) { border-top: 1px solid var(--border); }
        }
        @media (max-width: 640px) {
          .prod-page > .prod-hero { padding-top: 3rem; padding-bottom: 3rem; }
          .prod-page > .prod-lineup { padding-top: 3.5rem; padding-bottom: 3rem; }
          .prod-feats-grid, .prod-promise-grid { grid-template-columns: 1fr; }
          .prod-feat, .prod-promise-item { border-left: none !important; border-top: 1px solid var(--border); padding: 1.4rem 0.5rem; }
          .prod-feat:first-child, .prod-promise-item:first-child { border-top: none; }
          .prod-topbar-inner { gap: 0.5rem 1rem; letter-spacing: 0.12em; }
          .prod-stage-media { border-radius: 20px; }
          .prod-hero-media img { width: 108%; height: 108%; transform: scale(.98); }
          .prod-page .prod-product-link { width: 100%; min-height: 48px; }
          .prod-page > .prod-story-invite .prod-story-invite-inner { padding-top: 4.5rem; padding-bottom: 4.5rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .prod-hero-media img, .prod-stage-media img, .prod-story-link svg { transition: none; }
        }
      `}</style>
    </main>
  );
}
