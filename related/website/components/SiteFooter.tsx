"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { PRODUCT_CATALOG } from "@/lib/products";
import Image from "next/image";

export default function SiteFooter() {
  const t = useTranslations("Footer");

  return (
    <footer className="footer">
      <div className="container">
        <div className="foot-grid">
          <div>
            <div className="foot-logo">
              <Image
                src="/lumiq-logo.png"
                alt="Lumiq Studios"
                className="foot-logo-img"
                width={360}
                height={96}
              />
            </div>
            <p className="foot-blurb">{t("blurb")}</p>
          </div>
          <div className="foot-nav">
            <h4>{t("products")}</h4>
            <ul>
              {PRODUCT_CATALOG.map((product) => (
                <li key={product.id}>
                  <Link href={product.href}>{product.name}</Link>
                </li>
              ))}
              <li>
                <Link href="/plans">{t("plansPricing")}</Link>
              </li>
            </ul>
          </div>
          <div className="foot-nav">
            <h4>{t("company")}</h4>
            <ul>
              <li>
                <Link href="/about">{t("about")}</Link>
              </li>
              <li>
                <Link href="/story">{t("brandStory")}</Link>
              </li>
              <li>
                <Link href="/media">{t("mediaReviews")}</Link>
              </li>
              <li>
                <Link href="/contact">{t("contact")}</Link>
              </li>
            </ul>
          </div>
          <div className="foot-nav">
            <h4>{t("legal")}</h4>
            <ul>
              <li>
                <Link href="/legal/privacy">{t("privacy")}</Link>
              </li>
              <li>
                <Link href="/legal/terms">{t("terms")}</Link>
              </li>
              <li>
                <Link href="/legal/cookies">{t("cookies")}</Link>
              </li>
              <li>
                <Link href="/legal/child-safety">{t("childSafety")}</Link>
              </li>
            </ul>
          </div>
          <div className="foot-nav">
            <h4>{t("follow")}</h4>
            <div className="pending-link-list">
              <span>Instagram</span>
              <span>TikTok</span>
              <span>YouTube</span>
              <small>{t("linksPending")}</small>
            </div>
          </div>
        </div>
        <div className="foot-bottom">
          <div>{t("rights")}</div>
          <div className="foot-tag">{t("tagline")}</div>
        </div>
      </div>
    </footer>
  );
}
