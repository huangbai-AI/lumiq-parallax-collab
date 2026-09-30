"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { mountHorizontalCarousel } from "./readingNavigation";
import { useTranslations } from "next-intl";
import { ArrowUp, ArrowDown, Play, Pause } from "lucide-react";

const films = ["everyday-companion", "worlds-together", "welcome-home"] as const;

export default function HomeFilms() {
  const t = useTranslations("HomeFilms");
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const character = useRef<HTMLVideoElement>(null);
  const characterHost = useRef<HTMLDivElement>(null);
  const [alphaVideo, setAlphaVideo] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
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
    return mountHorizontalCarousel(target, select, () => switching.current);
  }, [select]);
  useEffect(() => {
    // WebKit can decode this VP9 clip without its alpha channel, leaving a white box.
    // Use the original transparent PNG on Safari/iOS instead of a chroma-key patch.
    const ua = navigator.userAgent;
    setAlphaVideo(!/iPad|iPhone|iPod/.test(ua) && /Chrome|Chromium|Edg|Firefox/.test(ua));
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
    const host = characterHost.current;
    const target = stage.current;
    if (!host || !target) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const placeCharacter = () => {
      if (innerWidth <= 1100) {
        clip?.pause();
        return;
      }
      host.style.removeProperty('top');
      host.style.removeProperty('bottom');
      const cardLeft = target.parentElement!.offsetLeft + target.offsetLeft + target.clientWidth * .09;
      // Preserve the afternoon character height; align V2's fingertip with the card.
      const heading = host.parentElement!.querySelector<HTMLElement>('.lh-films-heading');
      const headingBottom = heading ? heading.offsetTop + heading.offsetHeight : 0;
      // Reserve title clearance on wide, short viewports without moving the film cards.
      const availableHeight = Math.max(0, host.parentElement!.clientHeight * .94 - headingBottom - 24);
      const width = Math.min(innerWidth * .34, 760, availableHeight) * 16 / 9;
      host.style.width = `${width}px`;
      host.style.left = `${cardLeft + 3 - width * .89}px`;
    };
    const resize = new ResizeObserver(placeCharacter);
    resize.observe(target);
    resize.observe(host.parentElement!);
    window.addEventListener("resize", placeCharacter);
    placeCharacter();
    let visible = false;
    const sync = () => {
      if (!clip) return;
      if (!visible || document.hidden || reduced.matches || innerWidth <= 1100) clip.pause();
      else if (!clip.ended) void clip.play().catch(() => {});
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
      if (!visible && clip) { clip.pause(); clip.currentTime = 0; }
      sync();
    }, { threshold: 0.35 });
    observer.observe(target);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    return () => {
      clip?.pause(); observer.disconnect(); resize.disconnect();
      window.removeEventListener("resize", placeCharacter);
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
    };
  }, [alphaVideo]);
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
      <div ref={stage} className="lh-films-stage" data-moving={travel !== 0} onTouchStart={e => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
        onTouchEnd={e => {
          if (touchStart.current !== null) {
            const dx = e.changedTouches[0].clientX - touchStart.current.x;
            const dy = e.changedTouches[0].clientY - touchStart.current.y;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) select(dx < 0 ? 1 : -1);
          }
          touchStart.current = null;
        }}>
        {[-2, -1, 0, 1, 2].map(offset => {
          const index = (active + offset + films.length) % films.length;
          const slot = offset - travel;
          return <div key={`${active}-${offset}`} className="lh-film-slot" data-center={slot === 0} data-main={offset === 0} style={{ "--slot": slot, "--card-scale": slot === 0 ? 1 : 70 / 91, "--card-height": slot === 0 ? 1 : .8, "--card-opacity": slot === 0 || offset === 0 ? 1 : .45 } as CSSProperties} aria-hidden={Math.abs(slot) > 1}>
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
      <div ref={characterHost} className="lh-film-character" data-alpha-video={alphaVideo} aria-hidden="true">
      {alphaVideo ? <video ref={character} muted playsInline preload="none" poster="/assets/character-20260911/poster-v2.png">
        <source src="/assets/character-20260911/ola-girl-v2-alpha.webm" type="video/webm" />
      </video> : <Image src="/assets/character-20260911/poster-v2.png" alt="" fill unoptimized sizes="100vw" />}
      </div>
    </div>
  );
}
