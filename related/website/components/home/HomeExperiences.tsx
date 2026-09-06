"use client";
import Image from "next/image";
import { ArrowRight, BookOpen, CalendarDays, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Link } from "@/i18n/navigation";

const experiences = [
  { key: "stories", icon: BookOpen, href: "/products/tablet" },
  { key: "companion", icon: MessageCircle, href: "/products/ola" },
  { key: "routines", icon: CalendarDays, href: "/products/nest" },
] as const;

// Original products and location lines share the same 16:9 background plane.
const roomProducts = [
  { id: "tablet", group: 0, image: "home-products-20260907/tablet-angle", x: 44, y: 22, targetX: 47, targetY: 55 },
  { id: "ola", group: 1, image: "home-products-20260907/ola-angle", x: 87, y: 23, targetX: 77, targetY: 46 },
  { id: "ola-go", group: 1, image: "home-interactive/go", x: 94, y: 64, targetX: 87, targetY: 58 },
  { id: "nest", group: 2, image: "home-products-20260907/nest15-angle-confirmed", x: 45, y: 84, targetX: 75, targetY: 58 },
  { id: "print", group: 0, image: "home-interactive/print", x: 74, y: 88, targetX: 49, targetY: 58 },
] as const;

export default function HomeExperiences() {
  const t = useTranslations("HomeRefresh");
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % experiences.length;
    else if (event.key === "ArrowLeft") next = (index + experiences.length - 1) % experiences.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = experiences.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="lh-room-layout" data-active={experiences[active].key}>
      <div className="lh-room-heading" data-home-reveal>
        <p className="lh-eyebrow">04 / {t("experienceKicker")}</p>
        <h2 id="experiences-title">
          {t("experienceTitle")}<br />
          <span className="lh-muted">{t("experienceAccent")}</span>
        </h2>
        <p className="lh-room-intro">{t("experienceBody")}</p>
      </div>

      <div className="lh-room-map">
        <div className="lh-room-canvas">
          <div className="lh-room-background">
            <Image
              src="/assets/home-rooms-20260907/room-full-4k.webp"
              alt={t("houseAlt")}
              fill
              sizes="(max-width: 1100px) 154vw, (min-width: 1920px) 1920px, 100vw"
              quality={95}
            />
          </div>
          <svg className="lh-room-lines" viewBox="0 0 1000 562.5" aria-hidden="true">
            {roomProducts.map(({ id, group, x, y, targetX, targetY }) => (
              <g key={id} data-selected={active === group}>
                <path d={`M ${x * 10} ${y * 5.625} Q ${x * 10} ${targetY * 5.625} ${targetX * 10} ${targetY * 5.625}`} />
                <circle cx={targetX * 10} cy={targetY * 5.625} r="3.5" />
              </g>
            ))}
          </svg>
          <div className="lh-room-products" role="group" aria-label={t("roomExplore")}>
            {roomProducts.map(({ id, group, image, x, y }) => (
              <button
                key={id}
                className={"lh-room-product lh-room-product-" + id}
                style={{ "--room-x": `${x}%`, "--room-y": `${y}%` } as CSSProperties}
                type="button"
                aria-pressed={active === group}
                aria-controls={"experience-panel-" + experiences[group].key}
                aria-label={`${t(`products.${id}.name`)} · ${t(`roomPlaces.${id}`)}`}
                onClick={() => setActive(group)}
              >
                <span className="lh-room-product-art">
                  <Image src={`/assets/${image}.webp`} alt="" fill sizes="(max-width: 767px) 72px, (max-width: 1100px) 110px, 140px" quality={90} />
                </span>
                <span className="lh-room-product-name">{t(`products.${id}.name`)}</span>
                <span className="lh-room-product-place">{t(`roomPlaces.${id}`)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lh-room-copy">
        <div className="lh-room-tabs" role="tablist" aria-label={t("experienceKicker")}>
          {experiences.map(({ key, icon: Icon }, index) => (
            <button
              key={key}
              ref={(el) => { tabs.current[index] = el; }}
              type="button"
              role="tab"
              id={"experience-tab-" + key}
              aria-controls={"experience-panel-" + key}
              aria-selected={active === index}
              tabIndex={active === index ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              <Icon size={17} aria-hidden="true" />
              <span>{t(`roomTabs.${key}`)}</span>
            </button>
          ))}
        </div>
        <div className="lh-room-details">
          {experiences.map(({ key, href }, index) => (
            <div
              key={key}
              className="lh-experience-panel"
              id={"experience-panel-" + key}
              role="tabpanel"
              aria-labelledby={"experience-tab-" + key}
              data-inactive={active !== index}
              aria-hidden={active !== index}
              inert={active !== index}
              tabIndex={active === index ? 0 : -1}
            >
              <span className="lh-room-caption">{t(`experiences.${key}.caption`)}</span>
              <h3>{t(`experiences.${key}.title`)}</h3>
              <p>{t(`experiences.${key}.body`)}</p>
              <ol className="lh-room-steps">
                {[1, 2, 3].map((step) => (
                  <li key={step}><span>0{step}</span>{t(`experiences.${key}.step${step}`)}</li>
                ))}
              </ol>
              <Link href={href} className="lh-text-link">
                {t("seeExperience")}<ArrowRight size={18} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
