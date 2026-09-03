import SubPage from "@/components/SubPage";
import DraftNotice from "@/components/DraftNotice";
import {useTranslations} from "next-intl";

export default function TermsPage() {
  const t = useTranslations("Legal");
  return (
    <SubPage eyebrow={t("eyebrow")} title={t("terms.title")} intro={t("terms.intro")}>
      <DraftNotice>{t("draft")}</DraftNotice>
      <p>{t("terms.p1")}</p>
      <h2>{t("terms.h1")}</h2>
      <p>{t("terms.p2")}</p>
      <h2>{t("terms.h2")}</h2>
      <p>{t("terms.p3")}</p>
      <h2>{t("terms.h3")}</h2>
      <p>{t("terms.p4")}</p>
      <h2>{t("terms.h4")}</h2>
      <p>{t("terms.p5")}</p>
    </SubPage>
  );
}
