"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export const chapterBackgrounds = ["products", "films", "experiences", "safety", "family", "join"] as const;
export const chapterImage = (name: string) => `/assets/chapter-backgrounds-20260910/${name}.webp`;
export function chapterBlend(top: number, height: number) {
  const t = Math.max(0, Math.min(1, (height * .85 - top) / (height * .7)));
  return t * t * (3 - 2 * t);
}

export default function HomeBackgrounds() {
  const [host, setHost] = useState<Element | null>(null);
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => { setHost(document.querySelector(".lumiq-root .bg-layer")); }, []);
  useEffect(() => {
    if (!host) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      chapterBackgrounds.forEach((id, index) => {
        const section = document.getElementById(id);
        const layer = layers.current[index];
        if (layer && section) layer.style.opacity = String(index === 0 ? 1 : chapterBlend(section.getBoundingClientRect().top, innerHeight));
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const resize = new ResizeObserver(schedule);
    const home = document.querySelector(".lh-home");
    if (home) resize.observe(home);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("lumiq:home-enter", schedule);
    update();
    return () => { cancelAnimationFrame(frame); resize.disconnect(); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); window.removeEventListener("lumiq:home-enter", schedule); };
  }, [host]);
  return host ? createPortal(<div className="lh-fixed-backgrounds" aria-hidden="true">
    {chapterBackgrounds.map((id, index) => <div key={id} data-chapter-background={id} ref={el => { layers.current[index] = el; }} style={{ backgroundImage: `url('${chapterImage(id)}')`, opacity: index === 0 ? 1 : 0 }} />)}
  </div>, host) : null;
}
