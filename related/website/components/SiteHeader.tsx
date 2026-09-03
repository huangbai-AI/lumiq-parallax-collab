"use client";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import Image from "next/image";

export default function SiteHeader() {
  const t = useTranslations("Common");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHomepage = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = [
    { href: "/", label: t("home") },
    { href: "/story", label: t("brandStory") },
    { href: "/products", label: t("products") },
    { href: "/plans", label: t("plans") },
    { href: "/media", label: t("mediaReviews") },
    { href: "/faq", label: t("faq") },
  ] as const;

  const languages: { locale: Locale; code: string; label: string }[] = [
    { locale: "en", code: "EN", label: t("english") },
    { locale: "zh-hant", code: "繁中", label: t("traditionalChinese") },
    { locale: "ja", code: "日本語", label: t("japanese") },
  ];
  const activeLanguage =
    languages.find((item) => item.locale === locale) ?? languages[0];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    setLangOpen(false);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const switchLanguage = (nextLocale: Locale) => {
    const query = searchParams.toString();
    const hash = typeof window === "undefined" ? "" : window.location.hash;
    router.replace(`${pathname}${query ? `?${query}` : ""}${hash}`, {
      locale: nextLocale,
      scroll: false,
    });
    setLangOpen(false);
    setMenuOpen(false);
  };

  return (
    <nav
      className={`navbar${isHomepage ? " homepage-nav" : ""}${scrolled || menuOpen ? " scrolled" : ""}${menuOpen ? " menu-open" : ""}`}
      style={{ zIndex: 3000, position: "fixed", top: 0, left: 0, right: 0 }}
    >
      <div className="container nav-inner">
        <Link href="/" className="nav-logo" onClick={closeMenu}>
          <Image
            src="/lumiq-logo.png"
            alt="Lumiq Studios"
            className="nav-logo-img"
            width={360}
            height={96}
            priority
          />
        </Link>

        <div
          className="site-desktop-nav hidden md:flex"
          aria-label={t("primaryNavigation")}
        >
          {nav.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={isActive(l.href) ? "active" : ""}
              aria-current={isActive(l.href) ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          <div className="lang-switch site-desktop-action hidden md:block">
            <button
              type="button"
              className="lang-btn"
              onClick={() => setLangOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
            >
              <span aria-hidden="true">🌐</span> {activeLanguage.code}{" "}
              <span className="lang-caret">▾</span>
            </button>
            {langOpen && (
              <ul className="lang-menu" role="listbox">
                {languages.map((o) => (
                  <li key={o.locale}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={locale === o.locale}
                      className={`lang-item${locale === o.locale ? " active" : ""}`}
                      onClick={() => switchLanguage(o.locale)}
                    >
                      {o.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Link
            href="/prelaunch"
            className="btn btn-ghost-navy login-btn site-login-btn"
          >
            {t("login")}
          </Link>

          <button
            type="button"
            className="site-mobile-trigger flex md:hidden"
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <X size={22} strokeWidth={2.2} />
            ) : (
              <Menu size={22} strokeWidth={2.2} />
            )}
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        className={`site-mobile-menu md:hidden ${menuOpen ? "flex open" : "hidden"}`}
        role="menu"
        aria-hidden={!menuOpen}
      >
        <div className="site-mobile-menu-head">
          <span>{t("menu")}</span>
          <button
            type="button"
            className="site-mobile-close"
            aria-label={t("closeMenu")}
            onClick={closeMenu}
          >
            <X size={20} />
          </button>
        </div>
        {nav.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            role="menuitem"
            onClick={closeMenu}
            className={isActive(l.href) ? "active" : ""}
          >
            {l.label}
          </Link>
        ))}
        <div className="site-mobile-languages" aria-label={t("language")}>
          {languages.map((item) => (
            <button
              key={item.locale}
              type="button"
              className={locale === item.locale ? "active" : ""}
              onClick={() => switchLanguage(item.locale)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .navbar {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid transparent;
          transition: background .3s, border-color .3s, box-shadow .3s;
        }
        .navbar.scrolled {
          background: rgba(255,255,255,0.95);
          border-bottom-color: var(--border, rgba(0,0,0,0.08));
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }
        .navbar.homepage-nav {
          border-bottom: 0;
        }
        .navbar.homepage-nav:not(.scrolled) {
          background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.9) 58%, rgba(255,255,255,0.56) 82%, rgba(255,255,255,0.18) 100%);
          backdrop-filter: blur(12px) saturate(112%);
          box-shadow: none;
        }
        .navbar.homepage-nav:not(.scrolled) .nav-logo-img { filter: none; }
        .navbar.homepage-nav:not(.scrolled) .site-desktop-nav a { color: var(--ink-3); }
        .navbar.homepage-nav:not(.scrolled) .lang-btn { color: var(--ink-2); }
        .navbar.homepage-nav:not(.scrolled) .site-desktop-nav a:hover,
        .navbar.homepage-nav:not(.scrolled) .site-desktop-nav a.active { color: var(--ink); }
        .navbar.homepage-nav:not(.scrolled) .login-btn { border-color: var(--ink); color: var(--ink); }
        .navbar.homepage-nav:not(.scrolled) .login-btn:hover { background: var(--ink); color: #fff; }
        .navbar.homepage-nav:not(.scrolled) .site-mobile-trigger { background: rgba(255,255,255,0.72); border-color: var(--border, rgba(0,0,0,0.1)); color: var(--ink); }
        .nav-inner { display: flex; align-items: center; justify-content: space-between; padding: 1rem 2rem; gap: 1.5rem; }
        .nav-logo { display: inline-flex; align-items: center; justify-content: center; width: 112px; height: 42px; overflow: visible; flex: 0 0 auto; }
        .nav-logo-img { width: 100%; height: 100%; object-fit: contain; object-position: center; display: block; }
        .nav-actions { display: flex; align-items: center; gap: 1rem; }
        .site-desktop-nav { align-items: center; gap: 2rem; }
        .site-desktop-nav a { color: var(--ink-3); font-weight: 500; font-size: 0.95rem; transition: color 0.2s; position: relative; }
        .site-desktop-nav a:hover, .site-desktop-nav a.active { color: var(--ink); }
        .site-desktop-nav a.active::after { content: ""; position: absolute; left: 0; right: 0; bottom: -6px; height: 2px; background: var(--gold); border-radius: 2px; }
        .lang-btn { background: transparent; cursor: pointer; color: var(--ink-2); font-size: 0.9rem; padding: 0.4rem 0.6rem; border-radius: 8px; }
        .lang-btn:hover { background: rgba(20,20,20,0.05); }
        .lang-switch { position: relative; }
        .lang-menu { position: absolute; right: 0; top: calc(100% + 6px); background: white; border: 1px solid var(--border); border-radius: 10px; padding: 0.4rem; min-width: 160px; box-shadow: var(--shadow); }
        .lang-item { display: block; width: 100%; text-align: left; padding: 0.5rem 0.75rem; background: transparent; cursor: pointer; border-radius: 6px; font-size: 0.9rem; color: var(--ink-2); }
        .lang-item:hover, .lang-item.active { background: var(--cream-3); color: var(--ink); }
        .login-btn { background: transparent; border: 1px solid var(--ink); color: var(--ink); }
        .login-btn:hover { background: var(--ink); color: white; }
        .site-mobile-trigger { width: 42px; height: 42px; background: rgba(255,255,255,0.6); border: 1px solid var(--border, rgba(0,0,0,0.1)); border-radius: 10px; padding: 0; cursor: pointer; align-items: center; justify-content: center; color: var(--ink, #1a1a1a); z-index: 3002; flex-shrink: 0; }
        .site-mobile-trigger svg { display: block; pointer-events: none; }
        .site-mobile-menu { flex-direction: column; position: absolute; top: 100%; left: 0; right: 0; background: rgba(255,255,255,0.98); backdrop-filter: blur(12px); border-top: 1px solid var(--border, rgba(0,0,0,0.1)); box-shadow: 0 8px 24px rgba(0,0,0,0.08); padding: 0.75rem 1rem 1.25rem; z-index: 3001; }
        .site-mobile-menu-head { display: flex; align-items: center; justify-content: space-between; padding: 0.25rem 0.25rem 0.75rem; color: var(--ink); font-weight: 600; }
        .site-mobile-close { width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--border); border-radius: 10px; background: rgba(255,255,255,0.6); color: var(--ink); cursor: pointer; }
        .site-mobile-menu a { display: block; padding: 0.85rem 0.5rem; color: var(--ink); font-weight: 500; font-size: 1rem; border-bottom: 1px solid var(--border); }
        .site-mobile-menu a:last-child { border-bottom: none; }
        .site-mobile-menu a.active { color: var(--ink); font-weight: 600; }
        .site-mobile-languages { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; padding-top: 1rem; }
        .site-mobile-languages button { padding: .65rem .5rem; border: 1px solid var(--border); border-radius: 9px; background: white; color: var(--ink-3); cursor: pointer; }
        .site-mobile-languages button.active { background: var(--ink); color: white; border-color: var(--ink); }
        .site-login-btn { display: inline-flex !important; padding: 0.45rem 1rem; font-size: 0.8125rem; }
        .nav-logo:focus-visible, .site-desktop-nav a:focus-visible, .lang-btn:focus-visible, .site-mobile-trigger:focus-visible, .site-mobile-close:focus-visible { outline: 2px solid var(--gold); outline-offset: 4px; border-radius: 8px; }
        @media (max-width: 1120px) {
          .site-desktop-nav, .site-desktop-action { display: none !important; }
          .nav-actions { gap: 0.5rem; }
          .nav-inner { padding: 0.85rem 1.25rem; }
          .nav-logo { width: 96px; height: 38px; }
          .site-login-btn { padding: 0.4rem 0.85rem; font-size: 0.8125rem; }
          .site-mobile-trigger { display: inline-flex !important; }
          .navbar.homepage-nav .site-mobile-menu:not(.open) { display: none !important; }
          .site-mobile-menu.open { display: flex !important; }
        }
        @media (max-width: 420px) {
          .nav-inner { gap: 0.5rem; padding-inline: 1rem; }
          .nav-logo { width: 88px; height: 35px; }
          .nav-actions { min-width: 0; gap: 0.375rem; }
          .site-login-btn { padding: 0.4rem 0.7rem; font-size: 0.75rem; white-space: nowrap; }
          .site-mobile-trigger { width: 38px; height: 38px; }
        }
        @media (min-width: 1121px) {
          .site-desktop-nav { display: flex !important; }
          .site-desktop-action { display: block !important; }
          .site-mobile-trigger, .site-mobile-menu { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
