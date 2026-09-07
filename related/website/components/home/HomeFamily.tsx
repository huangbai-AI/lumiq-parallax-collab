"use client";
import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";

const moments = ["morning", "afternoon", "evening"] as const;

export default function HomeFamily() {
  const t = useTranslations("HomeRefresh");
  const [active, setActive] = useState(0);
  const chapters = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const section = chapters.current?.closest<HTMLElement>("#family");
    if (!section) return;
    const change = (event: Event) => setActive((event as CustomEvent<number>).detail);
    section.addEventListener("lumiq:chapter-change", change);
    if (section.dataset.chapter) setActive(Number(section.dataset.chapter));
    return () => section.removeEventListener("lumiq:chapter-change", change);
  }, []);

  const select = (index: number) => {
    setActive(index);
    chapters.current?.dispatchEvent(new CustomEvent("lumiq:chapter-select", {
      bubbles: true, detail: index,
    }));
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
    <div ref={chapters} className="lh-family-chapters">
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
      <div className="lh-family-stage">
        {moments.map((key, index) => (
          <div
            key={key}
            id={`family-panel-${key}`}
            role="tabpanel"
            aria-labelledby={`family-tab-${key}`}
            aria-hidden={index !== active}
            inert={index !== active}
            tabIndex={index === active ? 0 : -1}
            className="lh-family-scene"
            data-active={index === active}
          >
            <Image
              src={`/assets/home-immersive-2026-09-07/${key}.webp`}
              alt={t(`familyMoments.${key}`)}
              fill
              quality={90}
              sizes="100vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
