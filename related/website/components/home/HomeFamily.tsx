"use client";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const moments = ["morning", "afternoon", "evening"] as const;

export default function HomeFamily() {
  const t = useTranslations("HomeRefresh");
  const strip = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const syncActive = useCallback(() => {
    const element = strip.current;
    if (!element || !element.clientWidth) return;
    const first = element.children[0] as HTMLElement;
    const second = element.children[1] as HTMLElement;
    const step = second.offsetLeft - first.offsetLeft;
    if (step <= 0) return;
    setActive(Math.max(0, Math.min(2, Math.round(element.scrollLeft / step))));
  }, []);
  useEffect(() => {
    const element = strip.current;
    if (!element) return;
    const observer = new ResizeObserver(syncActive);
    observer.observe(element);
    return () => observer.disconnect();
  }, [syncActive]);
  const move = (direction: number) => {
    const element = strip.current;
    if (!element) return;
    const next = Math.max(0, Math.min(2, active + direction));
    const card = element.children[next] as HTMLElement;
    element.scrollTo({
      left: card.offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };
  return (
    <>
      <div className="lh-family-frame">
        <div className="lh-family-art">
          <Image
            src="/assets/home-interactive/family-panorama.webp"
            alt={t("familyPanoramaAlt")}
            fill
            sizes="100vw"
          />
        </div>
        <div className="lh-family-captions">
          {moments.map((key) => (
            <span key={key}>{t(`familyMoments.${key}`)}</span>
          ))}
        </div>
      </div>
      <div className="lh-family-mobile">
        <div
          ref={strip}
          className="lh-family-strip"
          role="region"
          aria-label={t("familyPanoramaAlt")}
          tabIndex={0}
          onScroll={syncActive}
        >
          {moments.map((key, index) => (
            <figure className="lh-family-moment" key={key}>
              <div className="lh-family-moment-photo">
                <Image
                  src="/assets/home-interactive/family-panorama.webp"
                  alt={t(`familyMoments.${key}`)}
                  fill
                  sizes="1100px"
                  style={{ objectPosition: `${index * 50}% center` }}
                />
              </div>
              <figcaption>
                <span>0{index + 1}</span>
                {t(`familyMoments.${key}`)}
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="lh-family-controls">
          <span aria-live="polite">0{active + 1} / 03</span>
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={active === 0}
            aria-label={t("previousMoment")}
          >
            <ArrowLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            disabled={active === 2}
            aria-label={t("nextMoment")}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
