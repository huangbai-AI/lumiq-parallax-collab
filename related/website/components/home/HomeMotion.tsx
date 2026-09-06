"use client";
import { useEffect } from "react";

/** Content stays visible without JS; motion only enhances large, precise-pointer displays. */
export default function HomeMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".lh-home");
    if (!root) return;
    const media = window.matchMedia(
      "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let cleanup = () => {};
    const configure = () => {
      cleanup();
      if (!media.matches) return;
      const layers = Array.from(
        root.querySelectorAll<HTMLElement>("[data-parallax]"),
      );
      let frame = 0;
      const render = () => {
        frame = 0;
        // Read layout before writing transforms; no idle loop or scroll interception.
        const positions = layers.map((layer) => ({
          layer,
          rect: layer.parentElement!.getBoundingClientRect(),
        }));
        for (const { layer, rect } of positions) {
          if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
          const offset = Math.max(
            -36,
            Math.min(36, -rect.top * Number(layer.dataset.parallax)),
          );
          layer.style.transform = `translate3d(0, ${offset}px, 0)`;
        }
      };
      const schedule = () => {
        if (!frame) frame = requestAnimationFrame(render);
      };
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.animate(
              [
                { transform: "translateY(18px)" },
                { transform: "translateY(0)" },
              ],
              { duration: 650, easing: "cubic-bezier(.2,.7,.2,1)" },
            );
            observer.unobserve(entry.target);
          }
        },
        { threshold: 0.12 },
      );
      root
        .querySelectorAll("[data-home-reveal]")
        .forEach((element) => observer.observe(element));
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule, { passive: true });
      schedule();
      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        layers.forEach((layer) => layer.style.removeProperty("transform"));
        root
          .querySelectorAll("[data-home-reveal]")
          .forEach((element) =>
            element.getAnimations().forEach((animation) => animation.cancel()),
          );
      };
    };
    configure();
    media.addEventListener("change", configure);
    return () => {
      cleanup();
      media.removeEventListener("change", configure);
    };
  }, []);
  return null;
}
