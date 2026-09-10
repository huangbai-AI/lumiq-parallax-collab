"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Play, Pause } from "lucide-react";

const films = ["everyday-companion", "worlds-together", "welcome-home"] as const;

export default function HomeFilms() {
  const t = useTranslations("HomeFilms");
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const touchStart = useRef<number | null>(null);
  const select = (index: number) => {
    video.current?.pause();
    setPlaying(false);
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
  const toggle = async () => {
    if (!video.current) return;
    if (!video.current.paused) video.current.pause();
    else { try { await video.current.play(); } catch { setPlaying(false); } }
  };
  return (
    <div className="lh-films" role="region" aria-roledescription={t("carousel")} aria-labelledby="films-title">
      <header className="lh-films-heading">
        <div><p className="lh-eyebrow">{t("eyebrow")}</p><h2 id="films-title">{t("heading")}</h2></div>
        <nav className="lh-films-controls" aria-label={t("carousel")}>
          <button type="button" onClick={() => select(active - 1)} aria-label={t("previous")}><ArrowLeft size={20} /></button>
          <span aria-live="polite" aria-atomic="true">{String(active + 1).padStart(2, "0")} / 03</span>
          <button type="button" onClick={() => select(active + 1)} aria-label={t("next")}><ArrowRight size={20} /></button>
        </nav>
      </header>
      <div className="lh-films-stage" onTouchStart={e => { touchStart.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          if (touchStart.current !== null) {
            const distance = e.changedTouches[0].clientX - touchStart.current;
            if (Math.abs(distance) > 50) select(active + (distance < 0 ? 1 : -1));
          }
          touchStart.current = null;
        }}>
        {[-1, 1].map(direction => {
          const index = (active + direction + films.length) % films.length;
          return <button key={direction} className={`lh-film-preview lh-film-preview-${direction < 0 ? "left" : "right"}`}
            type="button" onClick={() => select(index)} aria-label={`${t(direction < 0 ? "previous" : "next")}: ${t(`${films[index]}.title`)}`}>
            <Image src={`/assets/films-20260908/${films[index]}.jpg`} alt="" width={1280} height={720} unoptimized />
          </button>;
        })}
        <article className="lh-film-card" key={films[active]} aria-label={`${active + 1} / ${films.length}`} data-playing={playing}>
          <video ref={video} playsInline preload="none" poster={`/assets/films-20260908/${films[active]}.jpg`}
            aria-label={t(`${films[active]}.title`)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}>
            <source src={`/assets/films-20260908/${films[active]}.mp4`} type="video/mp4" />
            <a href={`/assets/films-20260908/${films[active]}.mp4`}>{t("open")}</a>
          </video>
          <button className="lh-film-toggle" type="button" onClick={toggle} aria-label={t(playing ? "pause" : "play")}>
            {playing ? <Pause size={26} /> : <Play size={30} fill="currentColor" />}
          </button>
        </article>
      </div>
    </div>
  );
}
