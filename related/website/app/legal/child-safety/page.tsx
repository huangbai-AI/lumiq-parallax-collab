import SubPage from "@/components/SubPage";
import DraftNotice from "@/components/DraftNotice";
import {useTranslations} from "next-intl";

export default function ChildSafetyPage() {
  const t = useTranslations("Legal");
  return (
    <SubPage eyebrow={t("eyebrow")} title={t("childSafety.title")} intro={t("childSafety.intro")}>
      <DraftNotice>{t("draft")}</DraftNotice>
      <p>{t("childSafety.p1")}</p>
      <h2>{t("childSafety.h1")}</h2>
      <p>{t("childSafety.p2")}</p>
      <h2>{t("childSafety.h2")}</h2>
      <p>{t("childSafety.p3")}</p>
      <h2>{t("childSafety.h3")}</h2>
      <p>{t("childSafety.p4")}</p>
      <h2>{t("childSafety.h4")}</h2>
      <p>{t("childSafety.p5")}</p>
      <h2>{t("childSafety.h5")}</h2>
      <p>{t("childSafety.p6")}</p>
    </SubPage>
  );
}
