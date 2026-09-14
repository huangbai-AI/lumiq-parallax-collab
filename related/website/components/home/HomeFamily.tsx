"use client";
import Image from "@/components/home/HomeImage";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { mountCarouselWheelGate } from "./readingGuard";
import { useTranslations } from "next-intl";

const moments = ["morning", "afternoon", "evening"] as const;

export default function HomeFamily() {
  const t = useTranslations("HomeRefresh");
  const [active, setActive] = useState(0);
  const chapters = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [travel, setTravel] = useState(0);
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const advance = useCallback((step: number) => {
    if (!step || busy.current) return;
    busy.current = true;
    setTravel(step);
    timer.current = setTimeout(() => {
      setActive(index => (index + step + moments.length) % moments.length);
      setTravel(0);
      busy.current = false;
    }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 750);
  }, []);

  useEffect(() => {
    const target = chapters.current?.closest<HTMLElement>('.lh-family-anchor');
    if (!target) return;
    const media = matchMedia('(min-width: 1101px) and (min-height: 640px)');
    let release = () => {};
    const configure = () => {
      release();
      release = media.matches ? mountCarouselWheelGate(target, () => advance(1), () => busy.current) : () => {};
    };
    configure();
    media.addEventListener('change', configure);
    return () => { release(); clearTimeout(timer.current); media.removeEventListener('change', configure); };
  }, [advance]);

  const select = (index: number) => {
    const step = (index - active + moments.length) % moments.length;
    advance(step === 2 ? -1 : step);
  };

  const navigate = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    switch (event.key) {
      case "ArrowRight": next = (index + 1) % moments.length; break;
      case "ArrowLeft": next = (index + moments.length - 1) % moments.length; break;
      case "Home": next = 0; break;
      case "End": next = moments.length - 1; break;
      default: return;
    }
    event.preventDefault();
    select(next);
    tabs.current[next]?.focus();
  };

  return (
    <div ref={chapters} className="lh-family-chapters" data-active-family={active} data-travel={travel}>
      <div className="lh-chapter-navigation" role="tablist" aria-label={t("familyPanoramaAlt")}>
        {moments.map((key, index) => (
          <button
            key={key}
            ref={(element) => { tabs.current[index] = element; }}
            type="button"
            role="tab"
            id={`family-tab-${key}`}
            aria-controls={`family-panel-${key}`}
            aria-selected={index === active}
            tabIndex={index === active ? 0 : -1}
            onClick={() => select(index)}
            onKeyDown={(event) => navigate(event, index)}
          >
            <span className="lh-chapter-progress" aria-hidden="true" />
            <span>{t(`familyMoments.${key}`)}</span>
          </button>
        ))}
      </div>
      <div className="lh-family-stage" onTouchStart={event => { touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }} onTouchEnd={event => {
        if (!touchStart.current) return;
        const dx = event.changedTouches[0].clientX - touchStart.current.x;
        const dy = event.changedTouches[0].clientY - touchStart.current.y;
        touchStart.current = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) advance(dx < 0 ? 1 : -1);
      }}>
        {[-2, -1, 0, 1, 2].map(offset => {
          const index = (active + offset + moments.length) % moments.length;
          const key = moments[index];
          const position = offset - travel;
          return (
          <div
            key={offset}
            id={Math.abs(offset) <= 1 ? `family-panel-${key}` : undefined}
            role="tabpanel"
            aria-labelledby={`family-tab-${key}`}
            aria-hidden={offset !== 0}
            inert={offset !== 0}
            tabIndex={offset === 0 ? 0 : -1}
            className="lh-family-scene"
            data-active={position === 0}
            style={{ '--family-offset': position, '--family-scale': position === 0 ? 1 : .78, opacity: position === 0 ? 1 : Math.abs(position) === 1 ? .42 : 0 } as CSSProperties}
          >
            <Image
              src={`/assets/western-scenes-20260908/${key}.webp`}
              alt={t(`familyMoments.${key}`)}
              fill
              quality={90}
              sizes="100vw"
            />
          </div>
        );})}
      </div>
    </div>
  );
}
