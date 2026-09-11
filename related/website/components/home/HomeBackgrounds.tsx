"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const backgroundVideoSource = "/assets/chapter-backgrounds-20260911/background-scroll-v3-scrub.mp4";

export const chapterImage = (name: string) => `/assets/chapter-backgrounds-20260910/${name}.webp`;

export default function HomeBackgrounds() {
  const [host, setHost] = useState<Element | null>(null);
  const fallback = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => { setHost(document.querySelector(".lumiq-root .bg-layer")); }, []);
  useEffect(() => {
    if (!host) return;
    let frame = 0;
    let loaded = false;
    let start = 0;
    let end = 1;
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
      const desired = progress * Math.max(0, movie.duration - 1 / 30);
      if (Math.abs(movie.currentTime - desired) > 1 / 60) movie.currentTime = desired;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const measure = () => {
      const top = (selector: string) => scrollY + (document.querySelector(selector)?.getBoundingClientRect().top ?? 0);
      start = ScrollTrigger.getById("home-opening-video")?.end ?? top("#products") - innerHeight;
      end = document.documentElement.scrollHeight - innerHeight;
      movie.dataset.scrollStart = String(start);
      movie.dataset.scrollEnd = String(end);
      movie.parentElement!.style.top = `${document.querySelector('.site-nav')?.getBoundingClientRect().height ?? 0}px`;
      schedule();
    };
    const onLoaded = () => { loaded = true; schedule(); };
    const configure = () => {
      movie.pause();
      if (motion.matches) { if (!movie.getAttribute("src")) { movie.src = backgroundVideoSource; movie.load(); } }
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
  }, [host]);
  return host ? createPortal(<div className="lh-fixed-backgrounds" aria-hidden="true">
    <video ref={video} data-background-video muted playsInline preload="auto" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0 }} />
    <div data-background-fallback ref={fallback} style={{ backgroundImage: `url('${chapterImage("products")}')` }} />
  </div>, host) : null;
}
