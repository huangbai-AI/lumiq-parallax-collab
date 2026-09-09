"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { GlassProduct } from "./GlassCards";

const GlassCanvas = dynamic(() => import("./GlassCards").then(m => m.GlassCanvas), { ssr: false });

export default function HomeGlassProducts({ products }: { products: GlassProduct[] }) {
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
  const select = (index: number) => host.current?.dispatchEvent(new CustomEvent("lumiq:product-select", { bubbles: true, detail: index }));
  return <div ref={host} className="lh-glass-products" onKeyDown={e => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault(); select((selected + (e.key === "ArrowRight" ? 1 : products.length - 1)) % products.length);
  }}>
    {enabled && <GlassCanvas selected={selected} select={select} products={products} carousel running={running} />}
  </div>;
}
