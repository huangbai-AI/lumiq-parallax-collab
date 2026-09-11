"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowUp, ArrowDown, Play, Pause } from "lucide-react";

const films = ["everyday-companion", "worlds-together", "welcome-home"] as const;

export default function HomeFilms() {
  const t = useTranslations("HomeFilms");
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const character = useRef<HTMLVideoElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number | null>(null);
  const lastWheel = useRef(0);
  const [direction, setDirection] = useState(1);
  const select = (index: number) => {
    setDirection(index < active ? -1 : 1);
    video.current?.pause();
    setPlaying(false);
    setActive((index + films.length) % films.length);
  };
  useEffect(() => {
    const target = stage.current;
    if (!target) return;
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      const now = performance.now();
      const quiet = now - lastWheel.current > 350;
      lastWheel.current = now;
      if (quiet) {
        video.current?.pause();
        setPlaying(false);
        const step = Math.sign(event.deltaY);
        setDirection(step);
        setActive(index => (index + step + films.length) % films.length);
      }
    };
    target.addEventListener("wheel", wheel, { passive: false });
    return () => target.removeEventListener("wheel", wheel);
  }, []);
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
  useEffect(() => {
    const clip = character.current;
    const target = stage.current;
    if (!clip || !target) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => {
      if (!visible || document.hidden || reduced.matches) clip.pause();
      else if (!clip.ended) void clip.play().catch(() => {});
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
      if (!visible) { clip.pause(); clip.currentTime = 0; }
      sync();
    }, { threshold: 0.35 });
    observer.observe(target);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    return () => {
      clip.pause(); observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);
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
          <button type="button" onClick={() => select(active - 1)} aria-label={t("previous")}><ArrowUp size={20} /></button>
          <span aria-live="polite" aria-atomic="true">{String(active + 1).padStart(2, "0")} / 03</span>
          <button type="button" onClick={() => select(active + 1)} aria-label={t("next")}><ArrowDown size={20} /></button>
        </nav>
      </header>
      <div ref={stage} className="lh-films-stage" data-direction={direction} onTouchStart={e => { touchStart.current = e.touches[0].clientY; }}
        onTouchEnd={e => {
          if (touchStart.current !== null) {
            const distance = e.changedTouches[0].clientY - touchStart.current;
            if (Math.abs(distance) > 50) select(active + (distance < 0 ? 1 : -1));
          }
          touchStart.current = null;
        }}>
        {[-1, 1].map(direction => {
          const index = (active + direction + films.length) % films.length;
          return <button key={direction} className={`lh-film-preview lh-film-preview-${direction < 0 ? "top" : "bottom"}`}
            type="button" onClick={() => select(active + direction)} aria-label={`${t(direction < 0 ? "previous" : "next")}: ${t(`${films[index]}.title`)}`}>
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
      <video ref={character} className="lh-film-character" muted playsInline preload="none" aria-hidden="true" poster="/assets/character-20260910/ola-girl-poster.png">
        <source src="/assets/character-20260910/ola-girl-alpha.webm" type="video/webm" />
      </video>
    </div>
  );
}
