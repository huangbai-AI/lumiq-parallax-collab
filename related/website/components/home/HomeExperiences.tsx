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
  {
    key: "stories",
    icon: BookOpen,
    image: "/assets/story/story-tablet-child-panel.png",
    href: "/products/tablet",
  },
  {
    key: "companion",
    icon: MessageCircle,
    image: "/assets/ola-detail/generated/ola-senior-reminder-v2.png",
    href: "/products/ola",
  },
  {
    key: "routines",
    icon: CalendarDays,
    image: "/assets/nest-detail/generated/nest-family-kitchen-v2.png",
    href: "/products/nest",
  },
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
      <div
        className="lh-experience-tabs"
        role="tablist"
        aria-label={t("experienceKicker")}
      >
        {experiences.map(({ key, icon: Icon }, index) => (
          <button
            key={key}
            ref={(element) => {
              tabs.current[index] = element;
            }}
            type="button"
            role="tab"
            id={`experience-tab-${key}`}
            aria-controls={`experience-panel-${key}`}
            aria-selected={active === index}
            tabIndex={active === index ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            <Icon size={19} />
            <span>{t(`experiences.${key}.label`)}</span>
          </button>
        ))}
      </div>
      {experiences.map(({ key, image, href }, index) => (
        <div
          key={key}
          className="lh-experience-panel"
          id={`experience-panel-${key}`}
          role="tabpanel"
          aria-labelledby={`experience-tab-${key}`}
          hidden={active !== index}
          tabIndex={0}
        >
          <div className={`lh-experience-image lh-experience-image-${key}`}>
            <Image
              src={image}
              alt={t(`experiences.${key}.alt`)}
              fill
              sizes="(max-width: 1023px) 92vw, 650px"
            />
            <span className="lh-image-caption">
              {t(`experiences.${key}.caption`)}
            </span>
          </div>
          <div className="lh-experience-content">
            <span className="lh-experience-number" aria-hidden="true">
              0{index + 1}
            </span>
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
            <Link className="lh-text-link" href={href}>
              {t("seeExperience")}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
