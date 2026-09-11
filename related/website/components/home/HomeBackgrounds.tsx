"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const backgroundVideoSource = "/assets/chapter-backgrounds-20260911/background-scroll-v1.mp4";
const backgroundCues = [0, 4, 8, 12];

export const chapterBackgrounds = ["products", "films", "experiences", "safety", "family", "join"] as const;
export const chapterImage = (name: string) => `/assets/chapter-backgrounds-20260910/${name}.webp`;
export function chapterBlend(top: number, height: number) {
  const t = Math.max(0, Math.min(1, (height * .85 - top) / (height * .7)));
  return t * t * (3 - 2 * t);
}

export default function HomeBackgrounds() {
  const [host, setHost] = useState<Element | null>(null);
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => { setHost(document.querySelector(".lumiq-root .bg-layer")); }, []);
  useEffect(() => {
    if (!host) return;
    let frame = 0;
    const movie = video.current!;
    const motion = matchMedia("(min-width: 1101px) and (prefers-reduced-motion: no-preference)");
    const update = () => {
      frame = 0;
      const ready = motion.matches && !movie.error && movie.readyState >= 2;
      movie.dataset.ready = String(ready);
      movie.style.opacity = ready ? "1" : "0";
      chapterBackgrounds.forEach((id, index) => {
        const section = document.getElementById(id);
        const layer = layers.current[index];
        if (layer && section) layer.style.opacity = String(ready && index < 3 ? 0 : index === 0 ? 1 : chapterBlend(section.getBoundingClientRect().top, innerHeight));
      });
      if (!ready || document.hidden || movie.seeking) return;
      const nav = document.querySelector('.site-nav')?.getBoundingClientRect().height ?? 86;
      const top = (selector: string) => scrollY + (document.querySelector(selector)?.getBoundingClientRect().top ?? 0);
      const opening = ScrollTrigger.getById("home-opening-video");
      const stops = [opening ? opening.start + (opening.end - opening.start) * .92 : top("#products") - innerHeight,
        top(".lh-products-stage"), top(".lh-films-layout") - nav,
        ScrollTrigger.getById("home-room-anchor")?.start ?? top(".lh-room-layout") - nav];
      const end = Math.min(backgroundCues[3], movie.duration - 1 / 30);
      let desired = scrollY >= stops[3] ? end : 0;
      for (let i = 0; i < 3; i++) {
        if (scrollY < stops[i] || scrollY >= stops[i + 1]) continue;
        const progress = (scrollY - stops[i]) / Math.max(1, stops[i + 1] - stops[i]);
        desired = backgroundCues[i] + progress * ((i === 2 ? end : backgroundCues[i + 1]) - backgroundCues[i]);
      }
      if (Math.abs(movie.currentTime - desired) > 1 / 60) movie.currentTime = desired;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const configure = () => {
      movie.pause();
      if (motion.matches) { if (!movie.getAttribute("src")) { movie.src = backgroundVideoSource; movie.load(); } }
      else { movie.removeAttribute("src"); movie.load(); }
      schedule();
    };
    const resize = new ResizeObserver(schedule);
    const home = document.querySelector(".lh-home");
    if (home) resize.observe(home);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("lumiq:home-enter", schedule);
    document.addEventListener("visibilitychange", schedule);
    movie.addEventListener("loadeddata", schedule);
    movie.addEventListener("seeked", schedule);
    movie.addEventListener("error", schedule);
    motion.addEventListener("change", configure);
    ScrollTrigger.addEventListener("refresh", schedule);
    configure();
    update();
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); window.removeEventListener("lumiq:home-enter", schedule);
      movie.removeEventListener("loadeddata", schedule); movie.removeEventListener("seeked", schedule); movie.removeEventListener("error", schedule);
      motion.removeEventListener("change", configure); ScrollTrigger.removeEventListener("refresh", schedule);
      document.removeEventListener("visibilitychange", schedule);
      movie.pause(); movie.removeAttribute("src"); movie.load();
    };
  }, [host]);
  return host ? createPortal(<div className="lh-fixed-backgrounds" aria-hidden="true">
    <video ref={video} data-background-video muted playsInline preload="auto" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0 }} />
    {chapterBackgrounds.map((id, index) => <div key={id} data-chapter-background={id} ref={el => { layers.current[index] = el; }} style={{ backgroundImage: `url('${chapterImage(id)}')`, opacity: index === 0 ? 1 : 0 }} />)}
  </div>, host) : null;
}
