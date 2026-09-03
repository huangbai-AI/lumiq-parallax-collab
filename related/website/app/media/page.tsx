import RevealObserver from "@/components/RevealObserver";
import {useTranslations} from "next-intl";

export default function MediaPage() {
  const t = useTranslations("Media");
  const press = [
    { source: "The Atelier Review", date: t("press1Date"), quote: t("press1Quote") },
    { source: "Slow Design Quarterly", date: t("press2Date"), quote: t("press2Quote") },
    { source: "Kinfolk", date: t("press3Date"), quote: t("press3Quote") },
  ];
  const reviews = [
    { name: "Sora Tanaka", role: t("review1Role"), text: t("review1Text") },
    { name: "Liam Chen", role: t("review2Role"), text: t("review2Text") },
    { name: "Amélie R.", role: t("review3Role"), text: t("review3Text") },
    { name: "Marcus J.", role: t("review4Role"), text: t("review4Text") },
  ];

  return (
    <main className="editorial-page media-page" style={{ paddingTop: "6rem", color: "var(--ink)" }}>
      <RevealObserver />

      <section className="container reveal" style={{ padding: "2rem 2rem 4rem" }}>
        <span className="kicker media-kicker">{t("eyebrow")}</span>
        <h1 className="serif" style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", lineHeight: 1.05, margin: "0 0 1rem", maxWidth: 800 }}>
          {t("title")}
        </h1>
        <p style={{ color: "var(--ink-2)", fontSize: "1.1rem", maxWidth: 560, lineHeight: 1.7 }}>
          {t("intro")}
        </p>
      </section>

      <section className="container reveal" style={{ padding: "0 2rem 4rem" }}>
        <h2 className="media-label">{t("pressTitle")}</h2>
        <div className="media-press-list">
          {press.map((p) => (
            <article key={p.source} className="media-press-row">
              <div className="media-press-meta">
                <span className="media-press-source">{p.source}</span>
                <span className="media-press-date">{p.date}</span>
              </div>
              <blockquote className="serif">&ldquo;{p.quote}&rdquo;</blockquote>
              <span className="media-press-link">{t("readMore")}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="container reveal" style={{ padding: "2rem 2rem 6rem" }}>
        <h2 className="media-label">{t("lettersTitle")}</h2>
        <div className="media-letter-grid">
          {reviews.map((r) => (
            <figure key={r.name} className="media-letter">
              <blockquote>&ldquo;{r.text}&rdquo;</blockquote>
              <figcaption>
                <strong>{r.name}</strong> · {r.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <style>{`
        .media-page .media-kicker { font-size: .9375rem; line-height: 1.4; letter-spacing: .12em; margin-bottom: 1.75rem; }
        .media-page .media-label { font-family: var(--font-sans); font-size: .9375rem; font-weight: 650; line-height: 1.4; letter-spacing: .14em; text-transform: uppercase; color: var(--gold); margin: 0 0 2.25rem; }

        .media-press-list { display: flex; flex-direction: column; }
        .media-press-row { display: grid; grid-template-columns: 220px 1fr auto; gap: 2rem; align-items: center; padding: 2rem 0; border-top: 1px solid var(--border); color: inherit; transition: padding-left .45s cubic-bezier(.22,1,.36,1); }
        .media-press-row:last-child { border-bottom: 1px solid var(--border); }
        .media-press-row:hover { padding-left: 1.25rem; }
        .media-press-meta { display: flex; flex-direction: column; gap: .3rem; }
        .media-press-source { font-weight: 600; font-size: .95rem; color: var(--ink); }
        .media-press-date { font-size: .8rem; color: var(--ink-3); letter-spacing: .06em; }
        .media-press-row blockquote { margin: 0; font-size: 1.3rem; line-height: 1.45; color: var(--ink); font-style: italic; }
        .media-press-link { font-size: .875rem; color: var(--ink-3); white-space: nowrap; display: inline-flex; align-items: center; gap: .4rem; transition: color .25s; }
        .media-press-row:hover .media-press-link { color: var(--gold); }
        .media-arrow { display: inline-block; transition: transform .35s cubic-bezier(.22,1,.36,1); }
        .media-press-row:hover .media-arrow { transform: translateX(5px); }

        .media-letter-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; }
        .media-letter { margin: 0; padding: 1.75rem; background: #fff; border-radius: 10px; border: 1px solid var(--border); transition: transform .4s, box-shadow .4s, border-color .4s; }
        .media-letter:hover { transform: translateY(-5px); box-shadow: var(--shadow); border-color: var(--border-h); }
        .media-letter blockquote { margin: 0 0 1.25rem; color: var(--ink); line-height: 1.6; }
        .media-letter figcaption { color: var(--ink-3); font-size: .9rem; }
        .media-letter figcaption strong { color: var(--ink-2); }

        @media (max-width: 820px) {
          .media-page .media-kicker { font-size: .875rem; margin-bottom: 1.25rem; }
          .media-page .media-label { font-size: .875rem; margin-bottom: 1.5rem; }
          .media-press-row { grid-template-columns: 1fr; gap: .85rem; }
          .media-press-link { justify-self: start; }
        }
      `}</style>
    </main>
  );
}
