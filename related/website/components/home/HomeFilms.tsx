"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
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
  const [travel, setTravel] = useState(0);
  const switching = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const select = useCallback((step: number) => {
    if (switching.current) return;
    switching.current = true;
    video.current?.pause();
    setPlaying(false);
    setTravel(step);
    timer.current = setTimeout(() => {
      setActive(index => (index + step + films.length) % films.length);
      setTravel(0);
      switching.current = false;
    }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 800);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
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
        select(Math.sign(event.deltaY));
      }
    };
    target.addEventListener("wheel", wheel, { passive: false });
    return () => target.removeEventListener("wheel", wheel);
  }, [select]);
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
    const placeCharacter = () => {
      const cardLeft = target.parentElement!.offsetLeft + target.offsetLeft + target.clientWidth * .09;
      // Preserve the afternoon character height; align V2's fingertip with the card.
      const width = innerWidth >= 768
        ? Math.min(innerWidth * .34, 760) * 16 / 9
        : Math.max(0, cardLeft + 3) / .89;
      clip.style.width = `${width}px`;
      clip.style.left = `${cardLeft + 3 - width * .89}px`;
    };
    const resize = new ResizeObserver(placeCharacter);
    resize.observe(target);
    resize.observe(clip.parentElement!);
    window.addEventListener("resize", placeCharacter);
    placeCharacter();
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
      clip.pause(); observer.disconnect(); resize.disconnect();
      window.removeEventListener("resize", placeCharacter);
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
      </header>
      <div className="lh-films-layout">
      <div ref={stage} className="lh-films-stage" data-moving={travel !== 0} onTouchStart={e => { touchStart.current = e.touches[0].clientY; }}
        onTouchEnd={e => {
          if (touchStart.current !== null) {
            const distance = e.changedTouches[0].clientY - touchStart.current;
            if (Math.abs(distance) > 50) select(distance < 0 ? 1 : -1);
          }
          touchStart.current = null;
        }}>
        {[-2, -1, 0, 1, 2].map(offset => {
          const index = (active + offset + films.length) % films.length;
          const slot = offset - travel;
          return <div key={`${active}-${offset}`} className="lh-film-slot" style={{ "--slot": slot, "--card-scale": slot === 0 ? 1 : 70 / 91, "--card-height": slot === 0 ? 1 : .8, "--card-opacity": slot === 0 ? 1 : .45 } as CSSProperties} aria-hidden={Math.abs(slot) > 1}>
          {offset !== 0 ? <button className={`lh-film-preview lh-film-preview-${offset < 0 ? "top" : "bottom"}`}
            tabIndex={Math.abs(slot) > 1 || travel !== 0 ? -1 : 0} disabled={travel !== 0}
            type="button" onClick={() => select(Math.sign(offset))} aria-label={`${t(offset < 0 ? "previous" : "next")}: ${t(`${films[index]}.title`)}`}>
            <Image src={`/assets/films-20260908/${films[index]}.jpg`} alt="" width={1280} height={720} unoptimized />
          </button> : <article className="lh-film-card" aria-label={`${active + 1} / ${films.length}`} data-playing={playing}>
          <video ref={video} playsInline preload="none" poster={`/assets/films-20260908/${films[active]}.jpg`}
            aria-label={t(`${films[active]}.title`)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}>
            <source src={`/assets/films-20260908/${films[active]}.mp4`} type="video/mp4" />
            <a href={`/assets/films-20260908/${films[active]}.mp4`}>{t("open")}</a>
          </video>
          <button className="lh-film-toggle" type="button" onClick={toggle} aria-label={t(playing ? "pause" : "play")}>
            {playing ? <Pause size={26} /> : <Play size={30} fill="currentColor" />}
          </button>
        </article>}
        </div>;
        })}
      </div>
      <nav className="lh-films-controls" aria-label={t("carousel")}>
        <button type="button" onClick={() => select(-1)} disabled={travel !== 0} aria-label={t("previous")}><ArrowUp size={24} /></button>
        <span aria-live="polite" aria-atomic="true"><strong>{String(active + 1).padStart(2, "0")}</strong><span>/</span><span>03</span></span>
        <button type="button" onClick={() => select(1)} disabled={travel !== 0} aria-label={t("next")}><ArrowDown size={24} /></button>
      </nav>
      </div>
      <video ref={character} className="lh-film-character" muted playsInline preload="none" aria-hidden="true" poster="/assets/character-20260911/poster-v2.png">
        <source src="/assets/character-20260911/ola-girl-v2-alpha.webm" type="video/webm" />
      </video>
    </div>
  );
}
