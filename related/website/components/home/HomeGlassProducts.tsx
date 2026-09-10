"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { GlassProduct } from "./GlassCards";

const GlassCanvas = dynamic(() => import("./GlassCards").then(m => m.GlassCanvas), { ssr: false });

export default function HomeGlassProducts({ products }: { products: GlassProduct[] }) {
  const character = useRef<HTMLVideoElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [running, setRunning] = useState(false);
  const [selected, setSelected] = useState(0);
  useEffect(() => {
    const section = host.current!.closest<HTMLElement>(".lh-products")!;
    const desktop = matchMedia("(min-width: 768px)");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2");
    if (!context) return;
    context.getExtension("WEBGL_lose_context")?.loseContext();
    const resize = () => { setEnabled(desktop.matches); section.toggleAttribute("data-glass-3d", desktop.matches); };
    const sync = () => setSelected(Number(section.dataset.activeProduct || 0));
    const observer = new MutationObserver(sync);
    observer.observe(section, { attributes: true, attributeFilter: ["data-active-product"] });
    const visibility = new IntersectionObserver(([entry]) => setRunning(entry.isIntersecting), { rootMargin: "150px" });
    visibility.observe(section); desktop.addEventListener("change", resize); resize(); sync();
    return () => { observer.disconnect(); visibility.disconnect(); desktop.removeEventListener("change", resize); section.removeAttribute("data-glass-3d"); };
  }, []);
  useEffect(() => {
    const clip = character.current;
    const target = host.current?.closest<HTMLElement>(".lh-products");
    if (!clip || !target) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let frame = 0;
    const position = () => {
      const progress = Math.max(0, Math.min(1, (clip.currentTime - 2.2) / 2.3));
      target.style.setProperty("--girl-arrival", String(progress));
      if (!clip.paused && !clip.ended) frame = requestAnimationFrame(position);
    };
    const onPlay = () => { cancelAnimationFrame(frame); position(); };
    clip.addEventListener("play", onPlay);
    clip.addEventListener("seeked", onPlay);
    const sync = () => {
      if (!visible || document.hidden || reduced.matches) clip.pause();
      else if (!clip.ended) void clip.play().catch(() => {});
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
      if (!visible) { clip.pause(); clip.currentTime = 0; target.style.setProperty("--girl-arrival", "0"); }
      sync();
    }, { threshold: 0.35 });
    observer.observe(target);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    return () => {
      clip.pause(); observer.disconnect(); cancelAnimationFrame(frame);
      clip.removeEventListener("play", onPlay); clip.removeEventListener("seeked", onPlay);
      target.style.removeProperty("--girl-arrival");
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);
  const select = (index: number) => host.current?.dispatchEvent(new CustomEvent("lumiq:product-select", { bubbles: true, detail: index }));
  return <>
    <video ref={character} className="lh-product-character" muted playsInline preload="none" aria-hidden="true" poster="/assets/character-20260910/ola-girl-poster.png">
      <source src="/assets/character-20260910/ola-girl-alpha.webm" type="video/webm" />
    </video>
    <div ref={host} className="lh-glass-products" onKeyDown={e => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault(); select((selected + (e.key === "ArrowRight" ? 1 : products.length - 1)) % products.length);
  }}>
    {enabled && <GlassCanvas selected={selected} select={select} products={products} carousel running={running} />}
  </div></>;
}
