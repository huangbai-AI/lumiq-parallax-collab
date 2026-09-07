"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { mountEndingChapters } from "./endingChapters";
import { mountProductRail } from "./productRail";
import { mountOpeningVideo, openingVideoQuery } from "./openingVideo";
import { preloadScenes } from "./preloadScenes";
import HomeLoading from "./HomeLoading";
gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Native scrolling drives either the video opening or the preserved code option. */
export default function HomeMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const [gate, setGate] = useState("loading");
  const [hydrated, setHydrated] = useState(false);
  const prepared = gate !== "loading";
  const onPrepared = useCallback(() => setGate("revealing"), []);
  const onOpened = useCallback(() => setGate("open"), []);
  useEffect(() => { setHydrated(true); }, []);
  useEffect(() => {
    if (gate === "open") window.dispatchEvent(new Event("lumiq:home-enter"));
  }, [gate]);
  useGSAP(
    () => {
      if (!prepared) return;
      const fontsChanged = () => ScrollTrigger.refresh();
      document.fonts.addEventListener("loadingdone", fontsChanged);
      const releaseImages = root.current ? preloadScenes(root.current) : () => {};
      const releaseOpening = root.current
        ? mountOpeningVideo(root.current)
        : () => {};
      // Opening layout is reserved before the horizontal product floor is measured.
      const releaseProducts = root.current
        ? mountProductRail(root.current)
        : () => {};
      const releaseEnding = root.current ? mountEndingChapters(root.current) : () => {};
      const mm = gsap.matchMedia();
      mm.add(
        {
          desktop:
            "(min-width: 1101px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)",
          video: openingVideoQuery,
        },
        (context) => {
          if (!context.conditions?.desktop) return;
          const select = gsap.utils.selector(root);
          const hero = select(".lh-hero")[0] as HTMLElement;
          const brand = select(".lh-ola")[0] as HTMLElement;
          if (!root.current?.querySelector(".lh-opening[data-video-mode]")) {
            // Finite intro: a small glass word settles behind the real products.
            if (window.scrollY < 40) {
              gsap.from(".lh-glass-art", {
                scale: 0.21,
                y: 80,
                opacity: 0.1,
                duration: 1.65,
                ease: "power3.inOut",
              });
              gsap.from(".lh-glass-glyph", {
                opacity: 0,
                stagger: 0.075,
                duration: 0.65,
                ease: "power2.out",
              });
              gsap.from(".lh-hero-object img", {
                y: 45,
                opacity: 0,
                stagger: 0.09,
                duration: 1.15,
                delay: 0.4,
                ease: "power3.out",
              });
            }
            gsap.to(".lh-glass-word", {
              yPercent: -32,
              opacity: 0,
              ease: "none",
              scrollTrigger: {
                trigger: hero,
                start: "top top",
                end: "bottom 15%",
                scrub: 0.7,
              },
            });
            gsap.to(".lh-opening-atmosphere", {
              y: -130,
              ease: "none",
              scrollTrigger: {
                trigger: ".lh-opening",
                start: "top top",
                end: "bottom top",
                scrub: 0.8,
              },
            });
            gsap.to(".lh-hero-copy", {
              y: -80,
              opacity: 0,
              ease: "none",
              scrollTrigger: {
                trigger: hero,
                start: "30% top",
                end: "bottom 30%",
                scrub: 0.5,
              },
            });
            // Shared OLA lingers as the environment scrolls away, handing off to the character.
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: hero,
                  start: "25% top",
                  end: "bottom top",
                  scrub: 0.8,
                },
              })
              .to(
                ".lh-hero-ola",
                {
                  y: () => hero.offsetHeight * 0.5,
                  x: -70,
                  scale: 0.8,
                  duration: 0.7,
                  ease: "none",
                },
                0,
              )
              .to(".lh-hero-ola", { opacity: 0, duration: 0.2 }, 0.3)
              .to(
                ".lh-hero-tablet, .lh-hero-nest, .lh-hero-go",
                {
                  y: -100,
                  opacity: 0,
                  stagger: 0.04,
                  duration: 0.6,
                  ease: "none",
                },
                0,
              );
            gsap.from(".lh-brand-character", {
              y: 120,
              x: -40,
              rotation: -5,
              opacity: 0,
              ease: "power2.out",
              scrollTrigger: {
                trigger: brand,
                start: "top 88%",
                end: "top 18%",
                scrub: 0.7,
              },
            });
            gsap.from(".lh-rhythm-card", {
              y: 150,
              opacity: 0,
              rotation: 2,
              stagger: 0.14,
              ease: "power2.out",
              scrollTrigger: {
                trigger: brand,
                start: "top 85%",
                end: "top 10%",
                scrub: 0.8,
              },
            });
            gsap.to(".lh-brand-character img", {
              y: -85,
              opacity: 0,
              ease: "none",
              scrollTrigger: {
                trigger: brand,
                start: "55% top",
                end: "bottom 5%",
                scrub: 0.6,
              },
            });
          }
          gsap.fromTo(
            ".lh-room-canvas",
            { y: 28 },
            {
              y: -20,
              ease: "none",
              scrollTrigger: {
                trigger: ".lh-experiences",
                start: "top bottom",
                end: "bottom top",
                scrub: 0.9,
              },
            },
          );
          select("[data-home-reveal]").forEach((element: Element) => {
            if (element.closest(".lh-opening[data-video-mode]")) return;
            gsap.from(element, {
              y: 42,
              duration: 0.85,
              ease: "power3.out",
              scrollTrigger: { trigger: element, start: "top 92%", once: true },
            });
          });
          let alive = true;
          document.fonts.ready.then(() => {
            if (alive) ScrollTrigger.refresh();
          });
          return () => {
            alive = false;
          };
        },
      );
      mm.add(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          const cleanups: (() => void)[] = [];
          root.current
            ?.querySelectorAll<HTMLElement>(".lh-product")
            .forEach((card) => {
              const art = card.querySelector(".lh-product-float");
              const rx = gsap.quickTo(art, "rotationX", {
                duration: 0.55,
                ease: "power3.out",
              });
              const ry = gsap.quickTo(art, "rotationY", {
                duration: 0.55,
                ease: "power3.out",
              });
              let bounds: DOMRect | null = null;
              const enter = () => {
                bounds = card.getBoundingClientRect();
              };
              const move = (event: PointerEvent) => {
                if (!bounds) return;
                rx((0.5 - (event.clientY - bounds.top) / bounds.height) * 9);
                ry(((event.clientX - bounds.left) / bounds.width - 0.5) * 12);
              };
              const leave = () => {
                bounds = null;
                rx(0);
                ry(0);
              };
              card.addEventListener("pointerenter", enter);
              card.addEventListener("pointermove", move);
              card.addEventListener("pointerleave", leave);
              window.addEventListener("scroll", leave, { passive: true });
              cleanups.push(() => {
                card.removeEventListener("pointerenter", enter);
                card.removeEventListener("pointermove", move);
                card.removeEventListener("pointerleave", leave);
                window.removeEventListener("scroll", leave);
              });
            });
          return () => cleanups.forEach((cleanup) => cleanup());
        },
      );
      return () => {
        document.fonts.removeEventListener("loadingdone", fontsChanged);
        releaseImages();
        mm.revert();
        releaseEnding();
        releaseProducts();
        releaseOpening();
      };
    },
    { scope: root, dependencies: [prepared], revertOnUpdate: true },
  );
  return (
    <>
    <HomeLoading root={root} onPrepared={onPrepared} onOpened={onOpened} />
    <main ref={root} id="main-content" className="lh-home" data-home-state={gate} inert={hydrated && gate !== "open"} tabIndex={-1}>
      {children}
    </main>
    </>
  );
}
