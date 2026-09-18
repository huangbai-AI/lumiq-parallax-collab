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

const PRODUCT_AUTOPLAY_MS = 5000;

export default function ProductsShowcase() {
  const t = useTranslations("Products");
  const rootRef = useRef<HTMLElement>(null);
  const heroMediaRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const wheelReadyAtRef = useRef(0);
  const wheelDeltaRef = useRef(0);
  const wheelDeltaExpiresAtRef = useRef(0);
  const [active, setActive] = useState(0);
  const [stageFullyVisible, setStageFullyVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [autoplayEpoch, setAutoplayEpoch] = useState(0);
  const products = [
    {
      id: "pal",
      href: PRODUCT_BY_ID.ola.href,
      img: PRODUCT_BY_ID.ola.image,
      tag: "01",
      name: "Lumiq Ola",
      copyIndex: 3,
    },
    {
      id: "ola-go",
      href: PRODUCT_BY_ID["ola-go"].href,
      img: PRODUCT_BY_ID["ola-go"].image,
      tag: "02",
      name: "Lumiq Ola Go",
      copyIndex: 4,
    },
    {
      id: "tablet",
      href: PRODUCT_BY_ID.tablet.href,
      img: PRODUCT_BY_ID.tablet.image,
      tag: "03",
      name: "Lumiq Tablet",
      copyIndex: 1,
    },
    {
      id: "book",
      href: PRODUCT_BY_ID.print.href,
      img: PRODUCT_BY_ID.print.image,
      tag: "04",
      name: "Lumiq Print",
      copyIndex: 2,
    },
    {
      id: "nest",
      href: PRODUCT_BY_ID.nest.href,
      img: PRODUCT_BY_ID.nest.image,
      tag: "05",
      name: "Lumiq Nest 15",
      copyIndex: 5,
    },
  ].map(({ copyIndex, ...product }) => ({
    ...product,
    pill: t(`p${copyIndex}Pill`),
    sub: t(`p${copyIndex}Sub`),
    desc: t(`p${copyIndex}Desc`),
    specs: [1, 2, 3, 4].map((n) => t(`p${copyIndex}S${n}`)),
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

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const nav = document.querySelector<HTMLElement>(".site-nav");
    let frame = 0;
    const updateStageVisibility = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const rect = stage.getBoundingClientRect();
        const navBottom = nav?.getBoundingClientRect().bottom ?? 0;
        const tolerance = 2;
        const availableHeight = window.innerHeight - navBottom;
        const fitsBelowNav = rect.height <= availableHeight + tolerance;
        const fullyVisible = fitsBelowNav
          ? rect.top >= navBottom - tolerance &&
            rect.bottom <= window.innerHeight + tolerance
          : rect.top <= navBottom + tolerance &&
            rect.bottom >= window.innerHeight - tolerance;
        setStageFullyVisible((current) =>
          current === fullyVisible ? current : fullyVisible,
        );
      });
    };
    const resizeObserver = new ResizeObserver(updateStageVisibility);
    resizeObserver.observe(stage);
    if (nav) resizeObserver.observe(nav);
    window.addEventListener("scroll", updateStageVisibility, { passive: true });
    window.addEventListener("resize", updateStageVisibility);
    updateStageVisibility();
    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", updateStageVisibility);
      window.removeEventListener("resize", updateStageVisibility);
    };
  }, []);

  useEffect(() => {
    const syncVisibility = () => setPageVisible(document.visibilityState === "visible");
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  useEffect(() => {
    if (!stageFullyVisible || !pageVisible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(
      () => setActive((current) => (current + 1) % products.length),
      PRODUCT_AUTOPLAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [active, autoplayEpoch, pageVisible, products.length, stageFullyVisible]);

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

  const selectProduct = (index: number) => {
    setActive((index + products.length) % products.length);
    setAutoplayEpoch((epoch) => epoch + 1);
  };

  const stepProduct = (direction: 1 | -1) => {
    setActive((currentIndex) =>
      (currentIndex + direction + products.length) % products.length,
    );
    setAutoplayEpoch((epoch) => epoch + 1);
  };

  const onStageWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    const nav = document.querySelector<HTMLElement>(".site-nav");
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const navBottom = nav?.getBoundingClientRect().bottom ?? 0;
    const tolerance = 2;
    const availableHeight = window.innerHeight - navBottom;
    const isFullyVisible = rect.height <= availableHeight + tolerance
      ? rect.top >= navBottom - tolerance && rect.bottom <= window.innerHeight + tolerance
      : rect.top <= navBottom + tolerance && rect.bottom >= window.innerHeight - tolerance;
    if (!isFullyVisible) return;

    const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX)
      ? event.deltaY
      : event.deltaX;
    if (!delta) return;
    event.preventDefault();

    const now = performance.now();
    if (now < wheelReadyAtRef.current) return;
    if (now > wheelDeltaExpiresAtRef.current || Math.sign(delta) !== Math.sign(wheelDeltaRef.current)) {
      wheelDeltaRef.current = 0;
    }
    wheelDeltaRef.current += delta;
    wheelDeltaExpiresAtRef.current = now + 180;
    if (Math.abs(wheelDeltaRef.current) < 12) return;

    wheelReadyAtRef.current = now + 520;
    const direction = wheelDeltaRef.current > 0 ? 1 : -1;
    wheelDeltaRef.current = 0;
    stepProduct(direction);
  };

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
              id={`product-tab-${p.id}`}
              aria-controls="product-panel"
              aria-selected={i === active}
              tabIndex={i === active ? 0 : -1}
              className={`prod-tab${i === active ? " on" : ""}`}
              onClick={() => selectProduct(i)}
              onKeyDown={(event) => {
                const next = event.key === "ArrowRight" ? (i + 1) % products.length
                  : event.key === "ArrowLeft" ? (i + products.length - 1) % products.length
                  : event.key === "Home" ? 0 : event.key === "End" ? products.length - 1 : null;
                if (next === null) return;
                event.preventDefault();
                selectProduct(next);
                const target = document.getElementById(`product-tab-${products[next].id}`);
                target?.focus({ preventScroll: true });
                target?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
              }}
            >
              <span className="prod-tab-num serif">{p.tag}</span>
              <span className="prod-tab-name">{p.name}</span>
              <span className="prod-tab-sub">{p.sub}</span>
            </button>
          ))}
        </div>

        <div
          ref={stageRef}
          className="prod-stage reveal"
          id="product-panel"
          role="tabpanel"
          aria-labelledby={`product-tab-${current.id}`}
          data-carousel-ready={stageFullyVisible ? "true" : "false"}
          tabIndex={0}
          onWheel={onStageWheel}
        >
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
                onClick={() => stepProduct(-1)}
              >
                <ArrowLeft size={18} strokeWidth={1.8} />
              </button>
              <span className="prod-counter">{current.tag} / 05</span>
              <button
                type="button"
                aria-label={t("next")}
                onClick={() => stepProduct(1)}
              >
                <ArrowRight size={18} strokeWidth={1.8} />
              </button>
            </div>
          </div>

          <div
            key={`${current.id}-${autoplayEpoch}-${stageFullyVisible}-${pageVisible}`}
            className={`prod-autoplay-progress${stageFullyVisible && pageVisible ? " running" : ""}`}
            aria-hidden="true"
          >
            <span />
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
        .prod-page { --prod-flow-bg: url('/assets/subpage-backgrounds-20260915/generated-set-02/flow-02-diagonal-convergence.webp'); background-color: #fbfbfe; background-image: var(--prod-flow-bg); background-position: center; background-repeat: no-repeat; background-size: cover; background-attachment: fixed; color: var(--ink); padding-top: 6.5rem; line-height: 1.6; }
        .prod-page .container { max-width: 1200px; }

        .prod-kicker { display: block; font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 1rem; }
        .prod-ghost-link { color: var(--ink-2); border-bottom: 1px solid var(--ink-4); padding-bottom: 2px; font-size: 0.95rem; transition: color .25s, border-color .25s; }
        .prod-ghost-link:hover { color: var(--ink); border-color: var(--ink); }

        .prod-topbar { border-bottom: 1px solid var(--border); }
        .prod-topbar-inner { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 0.9rem 1.75rem; padding: 0.7rem 1.5rem; font-size: 0.6875rem; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-3); }
        .prod-topbar-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--ink-4); }

        .prod-page > .prod-hero { display: grid; grid-template-columns: 1.05fr 1fr; gap: 4rem; align-items: center; padding-top: clamp(3.5rem, 5vw, 4.5rem); padding-bottom: clamp(3.5rem, 5vw, 4.5rem); }
        .prod-page > section::before { display: none; }
        .prod-hero-text h1 { font-size: clamp(2.75rem, 6vw, 4.75rem); line-height: 1.03; letter-spacing: -0.02em; margin: 0 0 1.5rem; }
        .prod-hero-text h1 em { font-style: italic; color: var(--gold); }
        .prod-lead { color: var(--ink-2); font-size: 1.125rem; line-height: 1.7; max-width: 30rem; }
        .prod-cta-row { display: flex; align-items: center; gap: 1.75rem; margin-top: 2.25rem; flex-wrap: wrap; }
        .prod-hero-media { display: flex; align-items: center; justify-content: center; aspect-ratio: 4 / 3; overflow: visible; }
        .prod-hero-media img { width: 112%; height: 112%; max-width: none; object-fit: contain; display: block; filter: drop-shadow(0 24px 28px rgba(31,23,14,.12)) drop-shadow(0 7px 10px rgba(31,23,14,.08)); transform: translate(var(--px, 0px), var(--py, 0px)) scale(.98); transition: transform 0.5s ease-out; will-change: transform; }

        .prod-page > .prod-feats { position: relative; isolation: isolate; padding: clamp(1.5rem, 2.8vw, 2.5rem) 0; background: transparent !important; border: 0; box-shadow: none; -webkit-backdrop-filter: none; backdrop-filter: none; }
        .prod-page > .prod-feats::before, .prod-page > .prod-feats::after { display: none; }
        .prod-feats-grid { position: relative; z-index: 1; display: flex; flex-wrap: wrap; justify-content: center; width: calc(100vw - 5rem); max-width: none !important; margin-left: calc((100vw - 100%) / -2 + 2.5rem); gap: clamp(1rem, 2.1vw, 2.5rem); }
        .prod-feat { display: flex; flex: 1 1 12rem; align-items: center; gap: .9rem; min-width: 0; max-width: none; padding: .85rem 1.15rem .85rem .85rem; border: 1px solid rgba(255,255,255,.78); border-radius: 999px; background: linear-gradient(135deg, rgba(255,255,255,.32), rgba(232,240,255,.13)); box-shadow: inset 0 1px 0 rgba(255,255,255,.9), inset 0 -1px 0 rgba(255,255,255,.22), 0 14px 30px rgba(43,54,86,.11); -webkit-backdrop-filter: blur(26px) saturate(150%); backdrop-filter: blur(26px) saturate(150%); transition: transform .25s ease, background .25s ease, box-shadow .25s ease; }
        .prod-feat:hover { transform: translateY(-2px); background: linear-gradient(135deg, rgba(255,255,255,.47), rgba(226,237,255,.21)); box-shadow: inset 0 1px 0 rgba(255,255,255,.96), inset 0 -1px 0 rgba(255,255,255,.3), 0 18px 34px rgba(43,54,86,.15); }
        .prod-feat-ico { width: 38px; height: 38px; border: 1px solid rgba(255,255,255,.82); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: var(--ink); background: linear-gradient(135deg, rgba(255,255,255,.5), rgba(218,230,255,.18)); box-shadow: inset 0 1px 0 rgba(255,255,255,.92), 0 5px 12px rgba(43,54,86,.08); -webkit-backdrop-filter: blur(16px) saturate(150%); backdrop-filter: blur(16px) saturate(150%); flex-shrink: 0; transition: background .25s ease, transform .25s ease; }
        .prod-feat:hover .prod-feat-ico { background: linear-gradient(135deg, rgba(255,255,255,.7), rgba(213,226,255,.3)); color: var(--ink); transform: scale(1.05); }
        .prod-feat strong { display: block; font-size: .875rem; line-height: 1.2; color: var(--ink); }
        .prod-feat small { display: block; font-size: .75rem; line-height: 1.25; color: var(--ink-3); margin-top: .18rem; }

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

        .prod-stage { position: relative; isolation: isolate; display: grid; grid-template-columns: minmax(340px, .92fr) minmax(420px, 1.08fr); column-gap: clamp(2.5rem, 5vw, 6rem); row-gap: clamp(.65rem, 1vw, 1rem); align-items: stretch; width: calc(100vw - (100vw - 100%) / 2 - 1.5rem); margin-left: calc((100vw - 100%) / -4 - .25rem); height: clamp(560px, calc(100vh - 7.25rem), 700px); min-height: 0; padding: clamp(1rem, 1.8vw, 1.65rem); overflow: hidden; border: 1px solid rgba(255,255,255,.78); border-radius: 38px; background: linear-gradient(118deg, rgba(255,255,255,.56) 0%, rgba(255,255,255,.26) 52%, rgba(244,247,255,.18) 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,.92), inset 0 -1px 0 rgba(255,255,255,.28), 0 24px 70px rgba(43,54,86,.13), 0 6px 20px rgba(43,54,86,.06); -webkit-backdrop-filter: blur(30px) saturate(160%); backdrop-filter: blur(30px) saturate(160%); }
        .prod-stage::before { content: ""; position: absolute; z-index: -1; inset: 0; pointer-events: none; background: radial-gradient(circle at 18% 8%, rgba(255,255,255,.72), transparent 38%), linear-gradient(105deg, rgba(255,255,255,.2), transparent 46%, rgba(192,206,255,.11)); }
        .prod-stage::after { content: ""; position: absolute; z-index: 2; inset: 1px; pointer-events: none; border-radius: 37px; box-shadow: inset 0 0 40px rgba(255,255,255,.18); }
        .prod-stage[data-carousel-ready="true"] { overscroll-behavior: contain; }
        .prod-stage-media { position: relative; z-index: 1; display: block; width: 100%; min-width: 0; align-self: stretch; aspect-ratio: 1 / 1; overflow: hidden; border: 1px solid rgba(255,255,255,.62); border-radius: 28px; background: linear-gradient(145deg, rgba(255,255,255,.34), rgba(255,255,255,.12)); color: inherit; box-shadow: inset 0 1px 0 rgba(255,255,255,.68), 0 18px 44px rgba(43,54,86,.08); -webkit-backdrop-filter: blur(12px) saturate(130%); backdrop-filter: blur(12px) saturate(130%); }
        .prod-stage-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; padding: clamp(1rem, 3vw, 2.25rem); opacity: 0; transform: scale(1.03); transition: opacity 0.6s ease, transform 0.9s ease; }
        .prod-stage-media img.nest { padding: clamp(1.25rem, 3vw, 2.5rem); }
        .prod-stage-media img.on { opacity: 1; transform: scale(1); }
        .prod-stage-media:hover img.on { transform: scale(1.025); }

        .prod-stage-panel { position: relative; z-index: 3; min-width: 0; display: flex; flex-direction: column; justify-content: center; padding: clamp(.25rem, .7vw, .75rem) clamp(.25rem, 1.5vw, 1.5rem) clamp(.25rem, .7vw, .75rem) 0; }
        @keyframes prodFade { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .prod-panel-body { animation: prodFade 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }
        .prod-index { display: block; font-size: clamp(2.75rem, 4vw, 4rem); line-height: .9; color: var(--lilac-2); }
        .prod-pill { display: inline-block; font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--gold); margin: 0.55rem 0 0.65rem; }
        .prod-panel-body h3 { font-size: clamp(1.9rem, 3vw, 2.6rem); line-height: 1.1; margin: 0; }
        .prod-sub { font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-3); margin: 0.45rem 0 0.7rem; }
        .prod-panel-body p { color: var(--ink-2); line-height: 1.55; margin-bottom: 1rem; }
        .prod-page .prod-specs { width: 100%; list-style: none; margin: 0; padding: 0 0 1.15rem; }
        .prod-page .prod-specs li { display: flex; align-items: center; gap: 0.7rem; padding: 0.38rem 0; border-bottom: 1px dashed var(--border); font-size: 0.9375rem; color: var(--ink-2); }
        .prod-tick { width: 5px; height: 5px; background: var(--gold); flex-shrink: 0; }
        .prod-page .prod-product-link { position: relative; display: inline-flex; align-items: center; justify-content: center; width: fit-content; min-height: 44px; margin-top: .15rem; padding: .68rem 1.5rem; border-radius: 999px; background: var(--ink); color: #fff; font-size: .9375rem; font-weight: 600; line-height: 1.2; transition: color .25s ease, background .25s ease, box-shadow .25s ease, transform .25s ease; }
        .prod-page .prod-product-link:hover { background: var(--gold); color: #fff; transform: translateY(-2px); box-shadow: 0 12px 26px rgba(24,18,10,.14); }
        .prod-page .prod-product-link:focus-visible { outline: 2px solid var(--ink); outline-offset: 4px; }

        .prod-stage-nav { display: flex; align-items: center; gap: 1.25rem; margin-top: 1rem; }
        .prod-stage-nav button { width: 42px; height: 42px; border-radius: 50%; border: 1px solid rgba(255,255,255,.76); background: rgba(255,255,255,.48); color: var(--ink); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: inset 0 1px 0 rgba(255,255,255,.75); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); transition: background .25s, color .25s, border-color .25s; }
        .prod-stage-nav button:hover { background: var(--ink); color: #fff; border-color: var(--ink); }
        .prod-counter { font-size: 0.8125rem; letter-spacing: 0.14em; color: var(--ink-3); }
        .prod-autoplay-progress { position: relative; z-index: 3; grid-column: 1 / -1; width: 100%; height: 3px; overflow: hidden; border-radius: 999px; background: rgba(26,42,68,.1); box-shadow: inset 0 1px 2px rgba(26,42,68,.08); }
        .prod-autoplay-progress span { display: block; width: 0; height: 100%; border-radius: inherit; background: linear-gradient(90deg, rgba(95,113,151,.72), rgba(184,142,45,.92)); box-shadow: 0 0 12px rgba(184,142,45,.22); }
        @keyframes prodAutoplayProgress { from { width: 0; } to { width: 100%; } }
        .prod-autoplay-progress.running span { animation: prodAutoplayProgress 5s linear forwards; }

        .prod-page > .prod-story-invite { padding-top: 0; padding-bottom: 0; border: 0; background: transparent; }
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
          .prod-feats-grid { display: flex; justify-content: center; gap: .65rem; }
          .prod-feat { flex-basis: 14rem; max-width: none; border: 1px solid rgba(255,255,255,.58); }
          .prod-page > .prod-lineup { padding-top: 4rem; padding-bottom: 3.5rem; }
          .prod-tabs { display: flex; overflow-x: auto; gap: .6rem; margin: 1.5rem 0; padding: 5px 4px 12px; scrollbar-width: thin; }
          .prod-tab { flex: 0 0 auto; min-height: 48px; padding: .75rem 1rem; border: 1px solid var(--border-h); border-radius: 999px; }
          .prod-tab.on { background: var(--navy); color: #fff; border-color: var(--navy); }
          .prod-tab::before, .prod-tab-num, .prod-tab-sub { display: none; }
          .prod-tab-name { margin: 0; font-family: var(--font-sans); font-size: 14px; font-weight: 600; white-space: nowrap; }
          .prod-stage { grid-template-columns: 1fr; column-gap: 0; row-gap: 1.5rem; width: 100%; margin-left: 0; transform: none; height: auto; min-height: 0; padding: 1.25rem; border-radius: 30px; }
          .prod-stage-panel { padding: 0 .5rem .75rem; }
          .prod-page > .prod-story-invite .prod-story-invite-inner { grid-template-columns: 1fr; gap: 2rem; min-height: 0; padding-top: 5rem; padding-bottom: 5rem; }
          .prod-promise-grid { grid-template-columns: repeat(2, 1fr); }
          .prod-promise-item:nth-child(odd) { border-left: none; }
          .prod-promise-item:nth-child(n+3) { border-top: 1px solid var(--border); }
        }
        @media (max-width: 640px) {
          .prod-page > .prod-hero { padding-top: 3rem; padding-bottom: 3rem; }
          .prod-page > .prod-lineup { padding-top: 3.5rem; padding-bottom: 3rem; }
          .prod-feats-grid, .prod-promise-grid { grid-template-columns: 1fr; }
          .prod-feat { flex-basis: 100%; padding: .72rem .9rem; border: 1px solid rgba(255,255,255,.58) !important; }
          .prod-promise-item { border-left: none !important; border-top: 1px solid var(--border); padding: 1.4rem .5rem; }
          .prod-promise-item:first-child { border-top: none; }
          .prod-topbar-inner { gap: 0.5rem 1rem; letter-spacing: 0.12em; }
          .prod-stage-media { border-radius: 20px; }
          .prod-hero-media img { width: 108%; height: 108%; transform: scale(.98); }
          .prod-page .prod-product-link { width: 100%; min-height: 48px; }
          .prod-page > .prod-story-invite .prod-story-invite-inner { padding-top: 4.5rem; padding-bottom: 4.5rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .prod-hero-media img, .prod-stage-media img, .prod-story-link svg { transition: none; }
          .prod-autoplay-progress { display: none; }
        }
      `}</style>
    </main>
  );
}
