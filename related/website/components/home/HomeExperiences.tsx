"use client";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  MessageCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState, type KeyboardEvent } from "react";
import { Link } from "@/i18n/navigation";

const experiences = [
  { key: "stories", icon: BookOpen, href: "/products/tablet" },
  { key: "companion", icon: MessageCircle, href: "/products/ola" },
  { key: "routines", icon: CalendarDays, href: "/products/nest" },
] as const;

export default function HomeExperiences() {
  const t = useTranslations("HomeRefresh");
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % experiences.length;
    else if (event.key === "ArrowLeft")
      next = (index + experiences.length - 1) % experiences.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = experiences.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };
  return (
    <div className="lh-experience-browser">
      <div className="lh-house-scene" data-active={experiences[active].key}>
        <div className="lh-house-orbit" aria-hidden="true" />
        <div className="lh-house-art">
          <Image
            src="/assets/home-interactive/original-house.webp"
            alt={t("houseAlt")}
            fill
            sizes="(max-width:767px) 100vw, 1000px"
          />
        </div>
        <div
          className="lh-experience-tabs"
          role="tablist"
          aria-label={t("experienceKicker")}
        >
          {experiences.map(({ key, icon: Icon }, index) => (
            <button
              key={key}
              ref={(el) => {
                tabs.current[index] = el;
              }}
              className={"lh-house-hotspot lh-hotspot-" + key}
              type="button"
              role="tab"
              id={"experience-tab-" + key}
              aria-controls={"experience-panel-" + key}
              aria-selected={active === index}
              tabIndex={active === index ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              <span className="lh-hotspot-icon">
                <Icon size={20} />
              </span>
              <span>{t(`experiences.${key}.label`)}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="lh-experience-details">
        {experiences.map(({ key, href }, index) => (
          <div
            key={key}
            className="lh-experience-panel"
            id={"experience-panel-" + key}
            role="tabpanel"
            aria-labelledby={"experience-tab-" + key}
            hidden={active !== index}
            tabIndex={0}
          >
            <span className="lh-experience-number">0{index + 1} / 03</span>
            <h3>{t(`experiences.${key}.title`)}</h3>
            <p>{t(`experiences.${key}.body`)}</p>
            <ol className="lh-experience-steps">
              {[1, 2, 3].map((step) => (
                <li key={step}>
                  <span>0{step}</span>
                  {t(`experiences.${key}.step${step}`)}
                </li>
              ))}
            </ol>
            <Link href={href} className="lh-text-link">
              {t("seeExperience")}
              <ArrowRight size={18} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
