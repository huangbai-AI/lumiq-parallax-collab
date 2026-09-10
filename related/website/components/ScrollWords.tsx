"use client";
import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

/** Temporary word spans retain React's original text nodes for safe updates and navigation. */
export default function ScrollWords() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;
    const root = document.querySelector("main");
    if (!root) return;
    const seen = new WeakSet<Element>();
    const waiting = new Set<HTMLElement>();
    const cleanups = new Set<() => void>();
    let frame = 0;
    const segmenter = new Intl.Segmenter(document.documentElement.lang || "en", { granularity: "word" });
    const reveal = (element: HTMLElement) => {
      waiting.delete(element);
      observer.unobserve(element);
      const label = element.getAttribute("aria-label");
      element.setAttribute("aria-label", element.textContent || "");
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      while (walker.nextNode()) nodes.push(walker.currentNode as Text);
      const words: HTMLSpanElement[] = [];
      const restore: (() => void)[] = [];
      for (const node of nodes) {
        const text = node.data;
        if (!text.trim()) continue;
        const fragment = document.createDocumentFragment();
        const inserted: Node[] = [];
        for (const part of segmenter.segment(text)) {
          const span = document.createElement("span");
          span.textContent = part.segment;
          span.setAttribute("aria-hidden", "true");
          if (part.segment.trim()) { span.className = "scroll-word"; words.push(span); }
          fragment.append(span); inserted.push(span);
        }
        node.before(fragment); node.data = "";
        restore.push(() => { inserted.forEach(n => n.parentNode?.removeChild(n)); if (!node.data) node.data = text; });
      }
      const step = Math.min(65, 1100 / Math.max(1, words.length - 1));
      const animations = words.map((word, i) => word.animate([
        { opacity: 0, transform: "translateY(.8em)" },
        { opacity: 1, transform: "translateY(0)" },
      ], { duration: 950, delay: i * step, easing: "cubic-bezier(.25,.65,.25,1)", fill: "both" }));
      // Reveal the container only after every delayed word has its initial pose.
      element.removeAttribute("data-word-pending");
      const cleanup = () => {
        animations.forEach(a => a.cancel()); restore.forEach(fn => fn());
        if (label === null) element.removeAttribute("aria-label"); else element.setAttribute("aria-label", label);
        cleanups.delete(cleanup);
      };
      cleanups.add(cleanup);
      Promise.all(animations.map(a => a.finished.catch(() => {}))).then(() => { if (cleanups.has(cleanup)) cleanup(); });
    };
    const tick = () => {
      frame = 0;
      for (const element of waiting) {
        if (!element.isConnected) { waiting.delete(element); continue; }
        // Pinned opening copy can intersect the viewport before its parent becomes visible.
        let visible = true;
        for (let parent: HTMLElement | null = element; parent; parent = parent.parentElement) {
          const style = getComputedStyle(parent);
          if (parent.inert || style.visibility === "hidden" || (parent !== element && Number(style.opacity) < .15)) { visible = false; break; }
        }
        if (visible) reveal(element);
      }
      if (waiting.size) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        if (entry.isIntersecting) waiting.add(element); else waiting.delete(element);
      }
      if (waiting.size && !frame) frame = requestAnimationFrame(tick);
    }, { rootMargin: "0px 0px -10% 0px", threshold: .05 });
    const scan = () => root.querySelectorAll<HTMLElement>("h1,h2,h3,h4,p").forEach(element => {
      if (seen.has(element) || !element.textContent?.trim() || element.closest("button, a, form, [aria-live], .lh-loading, .glass-sample-content, [data-no-word-reveal]") || element.querySelector("a,button,input")) return;
      seen.add(element); element.setAttribute("data-word-pending", ""); observer.observe(element);
    });
    // Observe inserted route/carousel content, but never our own temporary word wrappers.
    const mutation = new MutationObserver(scan);
    mutation.observe(root, { childList: true, subtree: true });
    scan();
    const stop = () => {
      observer.disconnect(); mutation.disconnect(); cancelAnimationFrame(frame);
      cleanups.forEach(fn => fn());
      root.querySelectorAll("[data-word-pending]").forEach(e => e.removeAttribute("data-word-pending"));
    };
    reduced.addEventListener("change", stop, { once: true });
    return () => { reduced.removeEventListener("change", stop); stop(); };
  }, [pathname]);
  return null;
}
