import SubPage from "@/components/SubPage";
import DraftNotice from "@/components/DraftNotice";
import {useTranslations} from "next-intl";

export default function CookiesPage() {
  const t = useTranslations("Legal");
  return (
    <SubPage eyebrow={t("eyebrow")} title={t("cookies.title")} intro={t("cookies.intro")}>
      <DraftNotice>{t("draft")}</DraftNotice>
      <p>{t("cookies.p1")}</p>
      <h2>{t("cookies.h1")}</h2>
      <p>{t("cookies.p2")}</p>
      <h2>{t("cookies.h2")}</h2>
      <p>{t("cookies.p3")}</p>
      <h2>{t("cookies.h3")}</h2>
      <p>{t("cookies.p4")}</p>
    </SubPage>
  );
}
