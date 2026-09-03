import SubPage from "@/components/SubPage";
import DraftNotice from "@/components/DraftNotice";
import {useTranslations} from "next-intl";

export default function PrivacyPage() {
  const t = useTranslations("Legal");
  return (
    <SubPage eyebrow={t("eyebrow")} title={t("privacy.title")} intro={t("privacy.intro")}>
      <DraftNotice>{t("draft")}</DraftNotice>
      <h2>{t("privacy.waitlistHeading")}</h2>
      <p>{t("privacy.waitlistBody")}</p>
      <p>{t("privacy.p1")}</p>
      <h2>{t("privacy.h1")}</h2>
      <p>{t("privacy.p2")}</p>
      <h2>{t("privacy.h2")}</h2>
      <p>{t("privacy.p3")}</p>
      <h2>{t("privacy.h3")}</h2>
      <p>{t("privacy.p4")}</p>
    </SubPage>
  );
}
