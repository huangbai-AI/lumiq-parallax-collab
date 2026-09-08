"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";

const films = ["everyday-companion", "worlds-together", "welcome-home"] as const;

export default function HomeFilms() {
  const t = useTranslations("HomeFilms");
  const [active, setActive] = useState(0);
  const video = useRef<HTMLVideoElement>(null);
  const touchStart = useRef<number | null>(null);
  const select = (index: number) => {
    video.current?.pause();
    setActive((index + films.length) % films.length);
  };
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) element.pause();
    });
    const onHidden = () => { if (document.hidden) element.pause(); };
    observer.observe(element);
    document.addEventListener("visibilitychange", onHidden);
    return () => { element.pause(); observer.disconnect(); document.removeEventListener("visibilitychange", onHidden); };
  }, [active]);
  return (
    <div className="lh-films" role="region" aria-roledescription={t("carousel")} aria-labelledby="films-title">
      <header className="lh-films-heading">
        <p className="lh-eyebrow">{t("eyebrow")}</p>
        <h2 id="films-title">{t("heading")}</h2>
      </header>
      <article className="lh-film-card" key={films[active]} aria-label={`${active + 1} / ${films.length}`}>
        <video ref={video} controls playsInline preload="none" poster={`/assets/films-20260908/${films[active]}.jpg`} aria-label={t(`${films[active]}.title`)}>
          <source src={`/assets/films-20260908/${films[active]}.mp4`} type="video/mp4" />
          <a href={`/assets/films-20260908/${films[active]}.mp4`}>{t("open")}</a>
        </video>
        <div className="lh-film-copy"
          onTouchStart={event => { touchStart.current = event.touches[0].clientX; }}
          onTouchEnd={event => {
            if (touchStart.current !== null) {
              const distance = event.changedTouches[0].clientX - touchStart.current;
              if (Math.abs(distance) > 50) select(active + (distance < 0 ? 1 : -1));
            }
            touchStart.current = null;
          }}>
          <h3>{t(`${films[active]}.title`)}</h3>
          <p>{t(`${films[active]}.body`)}</p>
        </div>
      </article>
      <nav className="lh-films-controls" aria-label={t("carousel")}>
        <button type="button" onClick={() => select(active - 1)} aria-label={t("previous")}><ArrowLeft size={20} /></button>
        <span aria-live="polite" aria-atomic="true">{String(active + 1).padStart(2, "0")} <span aria-hidden="true">/</span> 03</span>
        <button type="button" onClick={() => select(active + 1)} aria-label={t("next")}><ArrowRight size={20} /></button>
      </nav>
    </div>
  );
}
