import type { ReactNode } from "react";

interface SubPageProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: ReactNode;
}

export default function SubPage({ eyebrow, title, intro, children }: SubPageProps) {
  return (
    <main className="subpage">
      <section className="subpage-hero">
        <div className="container">
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h1 className="serif subpage-title">{title}</h1>
          {intro && <p className="subpage-intro">{intro}</p>}
        </div>
      </section>
      <section className="subpage-body">
        <div className="container prose">{children}</div>
      </section>
    </main>
  );
}
