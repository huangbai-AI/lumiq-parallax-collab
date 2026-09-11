"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const backgroundVideoSource = "/assets/background-variants-20260911/version-5.mp4";

export const chapterImage = (name: string) => `/assets/chapter-backgrounds-20260910/${name}.webp`;

export default function HomeBackgrounds() {
  const [host, setHost] = useState<Element | null>(null);
  const [variant, setVariant] = useState(0);
  const fallback = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    setHost(document.querySelector(".lumiq-root .bg-layer"));
    const read = () => {
      const value = new URLSearchParams(location.search).get("background") ?? "";
      setVariant(/^[1-5]$/.test(value) ? Number(value) : 0);
    };
    read(); window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);
  useEffect(() => {
    if (!host) return;
    let frame = 0;
    let loaded = false;
    let start = 0;
    let end = 1;
    let cues: [number, number][] = [];
    const movie = video.current!;
    const motion = matchMedia("(min-width: 1101px) and (prefers-reduced-motion: no-preference)");
    const update = () => {
      frame = 0;
      // Seeking can temporarily lower readyState. Keep the last decoded frame visible.
      const ready = motion.matches && !movie.error && loaded;
      movie.dataset.ready = String(ready);
      movie.style.opacity = ready ? "1" : "0";
      if (fallback.current) fallback.current.style.opacity = ready ? "0" : "1";
      if (!ready || document.hidden || movie.seeking || movie.readyState < 2) return;
      const progress = Math.max(0, Math.min(1, (scrollY - start) / Math.max(1, end - start)));
      let desired = progress * Math.max(0, movie.duration - 1 / 30);
      if (cues.length) {
        const right = cues.findIndex(([position]) => position > scrollY);
        if (right === 0) desired = 0;
        else if (right < 0) desired = 30;
        else {
          const [a, from] = cues[right - 1], [b, to] = cues[right];
          desired = from + (to - from) * (scrollY - a) / Math.max(1, b - a);
        }
        desired = Math.min(desired, Math.max(0, movie.duration - 1 / 30));
      }
      if (Math.abs(movie.currentTime - desired) > 1 / 60) movie.currentTime = desired;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const measure = () => {
      const top = (selector: string) => scrollY + (document.querySelector(selector)?.getBoundingClientRect().top ?? 0);
      start = ScrollTrigger.getById("home-opening-video")?.end ?? top("#products") - innerHeight;
      end = document.documentElement.scrollHeight - innerHeight;
      const nav = document.querySelector('.site-nav')?.getBoundingClientRect().height ?? 0;
      cues = [[start, 0]];
      const add = (position: number, time: number) => cues.push([Math.max(cues[cues.length - 1][0], Math.min(end, position)), time]);
      const chapter = (id: string, selector: string, time: number, settled = 0) => {
        const trigger = ScrollTrigger.getById(id);
        add(trigger ? trigger.start + (trigger.end - trigger.start) * settled : top(selector) - nav, time);
        if (trigger) add(trigger.end, time);
      };
      chapter("home-products-hold", "#products", 5);
      chapter("home-films-hold", "#films", 10);
      chapter("home-room-anchor", "#experiences", 15);
      // These timelines reveal the complete reading layout after their initial shrink.
      chapter("home-trust-anchor", "#safety", 20, .88 / 1.4);
      chapter("home-family-chapters", "#family", 25, .36 / 1.2);
      chapter("home-join-anchor", "#join", 30);
      add(end, 30);
      movie.dataset.scrollStart = String(start);
      movie.dataset.scrollEnd = String(end);
      movie.dataset.scrollCues = JSON.stringify(cues);
      movie.parentElement!.style.top = `${nav}px`;
      schedule();
    };
    const onLoaded = () => { loaded = true; schedule(); };
    const configure = () => {
      movie.pause();
      if (motion.matches) { if (!movie.getAttribute("src")) { movie.src = variant ? `/assets/background-variants-20260911/version-${variant}.mp4` : backgroundVideoSource; movie.load(); } }
      else { loaded = false; movie.removeAttribute("src"); movie.load(); }
      schedule();
    };
    const resize = new ResizeObserver(measure);
    const home = document.querySelector(".lh-home");
    if (home) resize.observe(home);
    resize.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("lumiq:home-enter", schedule);
    document.addEventListener("visibilitychange", schedule);
    movie.addEventListener("loadeddata", onLoaded);
    movie.addEventListener("canplay", schedule);
    movie.addEventListener("seeked", schedule);
    movie.addEventListener("error", schedule);
    motion.addEventListener("change", configure);
    ScrollTrigger.addEventListener("refresh", measure);
    configure();
    measure();
    update();
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", measure); window.removeEventListener("lumiq:home-enter", schedule);
      movie.removeEventListener("loadeddata", onLoaded); movie.removeEventListener("canplay", schedule); movie.removeEventListener("seeked", schedule); movie.removeEventListener("error", schedule);
      motion.removeEventListener("change", configure); ScrollTrigger.removeEventListener("refresh", measure);
      document.removeEventListener("visibilitychange", schedule);
      movie.pause(); movie.removeAttribute("src"); movie.load();
    };
  }, [host, variant]);
  const select = (value: number) => {
    const url = new URL(location.href);
    url.searchParams.set("background", String(value));
    history.replaceState(history.state, "", url);
    setVariant(value);
  };
  return host ? <>{createPortal(<div className="lh-fixed-backgrounds" aria-hidden="true">
    <video ref={video} data-background-video muted playsInline preload="auto" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0 }} />
    <div data-background-fallback ref={fallback} style={{ backgroundImage: `url('${chapterImage("products")}')` }} />
  </div>, host)}{variant > 0 && createPortal(<nav aria-label="背景方案预览" style={{ position: "fixed", bottom: 18, right: 18, zIndex: 1000, display: "flex", alignItems: "center", gap: 6, padding: 8, borderRadius: 24, background: "#ffffffdf", boxShadow: "0 4px 24px #23344826", backdropFilter: "blur(12px)" }}>
    <span style={{ fontSize: 12, padding: "0 6px", color: "#233448" }}>背景</span>
    {[1, 2, 3, 4, 5].map(value => <button key={value} type="button" aria-label={`背景方案 ${value}`} aria-pressed={variant === value} onClick={() => select(value)} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #23344820", background: variant === value ? "#233448" : "transparent", color: variant === value ? "white" : "#233448", cursor: "pointer" }}>{value}</button>)}
  </nav>, document.body)}</> : null;
}
