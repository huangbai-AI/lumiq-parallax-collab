import { useTranslations } from "next-intl";
import ProductDetailTemplate from "@/components/ProductDetailTemplate";

export default function PrintProductPage() {
  const t = useTranslations("Book");

  return (
    <ProductDetailTemplate
      slug="print"
      accent="#9d7a3c"
      accentSoft="#eee1c8"
      backLabel={t("all")}
      productName="Lumiq Print"
      title={`${t("titleBefore")} ${t("titleEm")}`}
      lede={t("lede")}
      conceptNotice={t("conceptNotice")}
      priceLabel="USD 69"
      ctaLabel={t("buy")}
      heroImage={{
        src: "/assets/print-detail/lumiq-print-sunlit-cover-v1.png",
        alt: t("alt"),
      }}
      story={{
        eyebrow: t("eyebrow"),
        title: t("sectionTitle"),
        body: t("body"),
        image: {
          src: "/assets/print-detail/generated/print-child-receives-book-v2.png",
          alt: t("alt"),
        },
        bullets: [1, 2, 3, 4].map((number) => t(`s${number}`)),
      }}
      scenesEyebrow={t("eyebrow")}
      scenesTitle={t("detailsTitle")}
      scenes={[
        {
          eyebrow: "01",
          title: t("titleEm"),
          body: t("lede"),
          image: {
            src: "/assets/print-detail/generated/print-craft-detail-v2.png",
            alt: t("alt"),
          },
        },
        {
          eyebrow: "02",
          title: t("sectionTitle"),
          body: t("body"),
          image: {
            src: "/assets/print-detail/generated/print-family-reading-v2.png",
            alt: t("alt"),
          },
        },
      ]}
      features={{
        eyebrow: t("eyebrow"),
        title: t("detailsTitle"),
        intro: t("body"),
        items: [1, 2, 3, 4].map((number) => ({
          title: t(`s${number}`),
          body: t(`s${number}Body`),
        })),
        image: {
          src: "/assets/print-detail/generated/print-personalized-page-closeup-v2.png",
          alt: t("alt"),
        },
      }}
      darkSection={{
        eyebrow: t("eyebrow"),
        title: t("sectionTitle"),
        intro: t("body"),
        items: [1, 2, 3, 4].map((number) => ({
          title: t(`s${number}`),
          body: t(`s${number}Body`),
        })),
        image: {
          src: "/assets/print-detail/lumiq-print-navy-plinth-v2.png",
          alt: t("alt"),
        },
      }}
      finalTitle={`${t("titleBefore")} ${t("titleEm")}`}
      finalBody={t("lede")}
    />
  );
}
