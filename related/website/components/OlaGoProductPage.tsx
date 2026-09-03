"use client";

import { useTranslations } from "next-intl";
import ProductDetailTemplate from "@/components/ProductDetailTemplate";

export default function OlaGoProductPage() {
  const t = useTranslations("OlaGo");

  const firstFeatures = ["reminders", "weather", "journal"] as const;
  const connectedFeatures = ["cellular", "location", "safety"] as const;

  return (
    <ProductDetailTemplate
      slug="ola-go"
      accent="#806d5e"
      accentSoft="#e8e0d8"
      backLabel={t("all")}
      productName="Lumiq Ola Go"
      title={t("title")}
      lede={t("lede")}
      conceptNotice={t("conceptNotice")}
      priceLabel={t("included")}
      ctaLabel={t("join")}
      heroImage={{
        src: "/assets/web/lumiq-ola-go.webp",
        alt: t("alt"),
        fit: "contain",
      }}
      story={{
        eyebrow: t("relationshipEyebrow"),
        title: t("relationshipTitle"),
        body: t("relationshipBody"),
        image: {
          src: "/assets/ola-go-detail/generated/ola-go-return-home-v3.png",
          alt: t("alt"),
          fit: "cover",
          position: "center",
        },
      }}
      scenesEyebrow={t("relationshipEyebrow")}
      scenesTitle={t("title")}
      scenes={firstFeatures.map((key, index) => ({
        eyebrow: String(index + 1).padStart(2, "0"),
        title: t(`${key}Title`),
        body: t(`${key}Body`),
        image: {
          src:
            index === 0
              ? "/assets/ola-go-detail/generated/ola-go-schoolbag-v2.png"
              : index === 1
                ? "/assets/ola-go-detail/generated/ola-go-weather-walk-v2.png"
                : "/assets/ola-go-detail/generated/ola-go-bedside-journal-v3.png",
          alt: t("alt"),
        },
      }))}
      features={{
        eyebrow: t("relationshipEyebrow"),
        title: t("relationshipTitle"),
        intro: t("relationshipBody"),
        items: connectedFeatures.map((key) => ({
          title: t(`${key}Title`),
          body: t(`${key}Body`),
        })),
        image: {
          src: "/assets/web/lumiq-ola-go.webp",
          alt: t("alt"),
          fit: "contain",
        },
      }}
      darkSection={{
        eyebrow: t("relationshipEyebrow"),
        title: t("included"),
        intro: t("conceptNotice"),
        items: firstFeatures.map((key) => ({
          title: t(`${key}Title`),
          body: t(`${key}Body`),
        })),
        image: {
          src: "/assets/web/lumiq-ola-go.webp",
          alt: t("alt"),
          fit: "contain",
        },
      }}
      finalTitle={t("relationshipTitle")}
      finalBody={t("relationshipBody")}
      secondaryAction={{ href: "/products/ola", label: t("meetOla") }}
    />
  );
}
