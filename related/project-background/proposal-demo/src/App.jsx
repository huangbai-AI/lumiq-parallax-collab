import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Mail,
  Menu,
  Minus,
  MousePointer2,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  brandPrinciples,
  companionPlans,
  faqItems,
  navItems,
  pressItems,
  products,
  readerLetters,
  storyPassPlans,
} from "./siteData.js";

gsap.registerPlugin(ScrollTrigger);

const storyFrames = [
  "/assets/direction-2-k0.png",
  "/assets/direction-2-k1.png",
  "/assets/direction-2-k2.png",
  "/assets/direction-2-k3.png",
];

const storySteps = [
  {
    kicker: "01 · A quiet signal",
    title: "Every story begins as a glimmer.",
    body: "The room stays still. Ola waits with the kind of quiet that invites curiosity.",
  },
  {
    kicker: "02 · A companion appears",
    title: "Light finds its way home.",
    body: "A warm presence crosses the scene, guided by the reader’s own pace.",
  },
  {
    kicker: "03 · The threshold",
    title: "The story enters the device.",
    body: "The character and the product become one continuous moment instead of two separate shots.",
  },
  {
    kicker: "04 · Ola is awake",
    title: "Technology becomes company.",
    body: "The final state lands on the product promise: imagination, presence and connection.",
  },
];

function isModifiedClick(event) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function LocalLink({ href, navigate, children, onClick, ...props }) {
  return (
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || isModifiedClick(event) || href.startsWith("mailto:")) return;
        event.preventDefault();
        navigate(href);
      }}
      {...props}
    >
      {children}
    </a>
  );
}

function Header({ pathname, direction, onDirectionChange, navigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <>
      <header className={`site-header ${isHome ? "is-home" : "is-inner"}`}>
        <LocalLink className="brand" href="/" navigate={navigate} aria-label="Lumiq Studio home">
          <img src="/assets/brand/lumiq-logo.png" alt="Lumiq Studio" />
        </LocalLink>

        <nav className="existing-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <LocalLink
                key={item.href}
                className={active ? "is-active" : ""}
                href={item.href}
                navigate={navigate}
              >
                {item.label}
              </LocalLink>
            );
          })}
        </nav>

        {isHome ? (
          <div className="direction-switch" aria-label="Homepage direction">
            <button
              className={direction === "mask" ? "is-active" : ""}
              type="button"
              onClick={() => onDirectionChange("mask")}
            >
              01 Mask
            </button>
            <button
              className={direction === "scroll" ? "is-active" : ""}
              type="button"
              onClick={() => onDirectionChange("scroll")}
            >
              02 Scroll
            </button>
          </div>
        ) : (
          <LocalLink className="header-cta" href="/prelaunch" navigate={navigate}>
            Join prelaunch <ArrowUpRight size={14} />
          </LocalLink>
        )}

        <button
          className="mobile-menu-button"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      <div className={`mobile-menu ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
        <nav aria-label="Mobile navigation">
          {navItems.map((item, index) => (
            <LocalLink key={item.href} href={item.href} navigate={navigate}>
              <span>0{index + 1}</span>
              {item.label}
              <ChevronRight size={18} />
            </LocalLink>
          ))}
          <LocalLink className="mobile-prelaunch" href="/prelaunch" navigate={navigate}>
            Join prelaunch <ArrowUpRight size={16} />
          </LocalLink>
        </nav>
      </div>
    </>
  );
}

function MaskExperience({ navigate }) {
  const rootRef = useRef(null);
  const stillRef = useRef(null);
  const cursorRef = useRef(null);
  const videoRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const still = stillRef.current;
    const cursor = cursorRef.current;
    const video = videoRef.current;
    if (!root || !still || !cursor || !video) return undefined;

    const context = gsap.context(() => {
      gsap.from(".mask-copy > *", {
        y: 28,
        opacity: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: "power3.out",
      });

      const moveMaskX = gsap.quickTo(still, "--mx", { duration: 0.38, ease: "power3.out" });
      const moveMaskY = gsap.quickTo(still, "--my", { duration: 0.38, ease: "power3.out" });
      const moveCursorX = gsap.quickTo(cursor, "x", { duration: 0.22, ease: "power3.out" });
      const moveCursorY = gsap.quickTo(cursor, "y", { duration: 0.22, ease: "power3.out" });

      const handleMove = (event) => {
        const bounds = root.getBoundingClientRect();
        moveMaskX(`${event.clientX - bounds.left}px`);
        moveMaskY(`${event.clientY - bounds.top}px`);
        moveCursorX(event.clientX - 48);
        moveCursorY(event.clientY - 48);
      };

      const handleEnter = () => gsap.to(cursor, { opacity: 1, scale: 1, duration: 0.25 });
      const handleLeave = () => gsap.to(cursor, { opacity: 0, scale: 0.82, duration: 0.2 });

      root.addEventListener("pointermove", handleMove);
      root.addEventListener("pointerenter", handleEnter);
      root.addEventListener("pointerleave", handleLeave);
      video.play().catch(() => {});

      return () => {
        root.removeEventListener("pointermove", handleMove);
        root.removeEventListener("pointerenter", handleEnter);
        root.removeEventListener("pointerleave", handleLeave);
      };
    }, root);

    return () => context.revert();
  }, []);

  return (
    <main ref={rootRef} className="mask-experience">
      <div className="media-stage" aria-hidden="true">
        <video
          ref={videoRef}
          className="media-layer active-video"
          src="/assets/direction-1-active.mp4"
          muted
          loop
          playsInline
          preload="auto"
        />
        <img ref={stillRef} className="media-layer mask-still" src="/assets/direction-1-base.png" alt="" />
        <div className="media-grade" />
      </div>

      <section className="mask-copy" aria-label="Lumiq homepage hero">
        <div className="eyebrow"><Sparkles size={14} /> Warm intelligence, revealed</div>
        <h1>
          AI experiences<br />
          for families<br />
          <span>across generations.</span>
        </h1>
        <p>
          Lumiq creates thoughtful AI experiences for learning, companionship and everyday care —
          technology that understands people instead of asking people to understand technology.
        </p>
        <div className="hero-actions">
          <LocalLink className="primary-action" href="/story" navigate={navigate}>
            Our story <ArrowUpRight size={16} />
          </LocalLink>
          <LocalLink className="text-action" href="/products" navigate={navigate}>
            Browse the collection
          </LocalLink>
        </div>
      </section>

      <div className="interaction-note">
        <MousePointer2 size={16} />
        <span>Move to wake Ola</span>
      </div>

      <div ref={cursorRef} className="mask-cursor" aria-hidden="true"><span>Reveal</span></div>

      <div className="proposal-stamp">
        <span>Direction 01</span>
        <strong>Media overlay + cursor mask</strong>
      </div>
    </main>
  );
}

function ScrollExperience() {
  const storyRef = useRef(null);
  const videoRef = useRef(null);
  const frameRefs = useRef([]);
  const [activeStep, setActiveStep] = useState(0);
  const [videoReady, setVideoReady] = useState(false);

  useLayoutEffect(() => {
    const story = storyRef.current;
    if (!story) return undefined;

    let lastStep = -1;
    const trigger = ScrollTrigger.create({
      trigger: story,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.25,
      onUpdate: (self) => {
        const progress = Math.min(0.999, Math.max(0, self.progress));
        const stepFloat = progress * (storyFrames.length - 1);
        const nextStep = Math.min(storyFrames.length - 1, Math.floor(stepFloat + 0.35));
        if (nextStep !== lastStep) {
          lastStep = nextStep;
          setActiveStep(nextStep);
        }

        frameRefs.current.forEach((frame, index) => {
          if (!frame) return;
          const distance = Math.abs(stepFloat - index);
          gsap.set(frame, { opacity: Math.max(0, 1 - distance), scale: 1 + progress * 0.025 });
        });

        const video = videoRef.current;
        if (videoReady && video?.duration) {
          const targetTime = Math.min(video.duration - 0.04, progress * video.duration);
          if (Math.abs(video.currentTime - targetTime) > 0.035) video.currentTime = targetTime;
        }
      },
    });

    return () => trigger.kill();
  }, [videoReady]);

  return (
    <main ref={storyRef} className="scroll-story">
      <div className="scroll-sticky">
        <div className="story-media" aria-hidden="true">
          {storyFrames.map((frame, index) => (
            <img
              key={frame}
              ref={(node) => { frameRefs.current[index] = node; }}
              className="story-frame"
              src={frame}
              alt=""
              style={{ opacity: index === 0 ? 1 : 0 }}
            />
          ))}
          <video
            ref={videoRef}
            className={`story-video ${videoReady ? "is-ready" : ""}`}
            src="/assets/direction-2-story.mp4"
            muted
            playsInline
            preload="auto"
            onLoadedMetadata={(event) => {
              event.currentTarget.pause();
              event.currentTarget.currentTime = 0.01;
              setVideoReady(true);
            }}
          />
          <div className="story-grade" />
        </div>

        <section className="story-copy" aria-live="polite">
          <p className="story-kicker">{storySteps[activeStep].kicker}</p>
          <h1>{storySteps[activeStep].title}</h1>
          <p className="story-body">{storySteps[activeStep].body}</p>
        </section>

        <div className="story-progress" aria-label={`Story step ${activeStep + 1} of ${storySteps.length}`}>
          <span className="progress-count">0{activeStep + 1}</span>
          <div className="progress-lines">
            {storySteps.map((step, index) => (
              <span key={step.kicker} className={index <= activeStep ? "is-active" : ""} />
            ))}
          </div>
          <span className="progress-count muted">0{storySteps.length}</span>
        </div>

        <div className="scroll-cue"><ArrowDown size={16} /><span>Scroll to direct the film</span></div>

        <div className="proposal-stamp light">
          <span>Direction 02</span>
          <strong>Video anchoring + scroll narrative</strong>
        </div>
      </div>
    </main>
  );
}

function PageIntro({ kicker, title, accent, body, narrow = false }) {
  return (
    <section className={`page-intro ${narrow ? "is-narrow" : ""}`}>
      <p className="page-kicker">{kicker}</p>
      <h1>{title} {accent && <em>{accent}</em>}</h1>
      {body && <p className="page-lead">{body}</p>}
    </section>
  );
}

function Footer({ navigate }) {
  return (
    <footer className="site-footer">
      <div className="footer-mark">
        <img src="/assets/brand/lumiq-logo.png" alt="Lumiq Studio" />
        <p>A light through every chapter.</p>
      </div>
      <nav aria-label="Footer navigation">
        {navItems.slice(1).map((item) => (
          <LocalLink key={item.href} href={item.href} navigate={navigate}>{item.label}</LocalLink>
        ))}
      </nav>
      <p className="footer-note">© 2026 Lumiq Studio · Concept website</p>
    </footer>
  );
}

function StoryPage({ navigate }) {
  return (
    <main className="inner-page story-page">
      <PageIntro
        kicker="Brand Story"
        title="A light through"
        accent="every chapter."
        body="Lumiq Studio believes the most beautiful aspect of technology is gentle companionship. As life changes, the way technology learns, connects and cares should change with it."
      />

      <figure className="wide-editorial-media">
        <img src="/assets/direction-2-k1.png" alt="A glowing companion arriving beside Lumiq Ola" />
        <figcaption>Warmth and intelligence, made present.</figcaption>
      </figure>

      <section className="story-editorial-grid">
        <h2>Technology should understand people.</h2>
        <div className="story-prose">
          <p>
            A child may need encouragement to explore. A busy family may need help remembering the details
            of everyday life. Someone living alone may want a familiar presence nearby. Technology should
            remain accessible, thoughtful and easy to trust at every stage.
          </p>
          <p>
            Through AI learning tablets, interactive stories, holographic companions and connected home
            experiences, Lumiq can become a learning partner, an attentive assistant or a quiet presence.
            Different forms, one continuous purpose.
          </p>
          <blockquote>“Intelligence is most meaningful when it is guided by warmth.”</blockquote>
        </div>
      </section>

      <section className="principles-section">
        <div className="section-heading">
          <p className="page-kicker">Four principles</p>
          <h2>Held quietly.<br />Felt every day.</h2>
        </div>
        <div className="principle-grid">
          {brandPrinciples.map((principle) => (
            <article key={principle.number}>
              <span>{principle.number}</span>
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="story-closing">
        <p className="page-kicker">One continuous purpose</p>
        <h2>Lumiq is not here to replace family, friendship or human care.</h2>
        <p>It is here to make care easier to express, support easier to access and connection more present.</p>
        <LocalLink className="dark-action" href="/products" navigate={navigate}>
          Meet the collection <ArrowRight size={17} />
        </LocalLink>
      </section>

      <Footer navigate={navigate} />
    </main>
  );
}

function ProductsPage({ navigate }) {
  const [activeProduct, setActiveProduct] = useState(products[0].id);
  const product = products.find((item) => item.id === activeProduct) || products[0];

  return (
    <main className="inner-page products-page">
      <section className="product-hero">
        <div>
          <p className="page-kicker">Lumiq Studio collection</p>
          <h1>AI interaction.<br /><em>Reimagined.</em></h1>
          <p>
            Future-ready AI experiences that learn and grow with a family — designed to end in stories,
            companionship and connection, not scrolling.
          </p>
          <div className="hero-actions dark-actions">
            <a className="dark-action" href="#lineup">Explore the lineup <ArrowDown size={16} /></a>
            <LocalLink className="underline-action" href="/plans" navigate={navigate}>Compare plans</LocalLink>
          </div>
        </div>
        <img src="/assets/direction-2-k3.png" alt="Lumiq Ola with its holographic companion" />
      </section>

      <section className="lineup-section" id="lineup">
        <div className="section-heading centered-heading">
          <p className="page-kicker">The lineup</p>
          <h2>Three experiences.<br />One gentle universe.</h2>
        </div>

        <div className="product-tabs" role="tablist" aria-label="Lumiq products">
          {products.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={item.id === activeProduct}
              className={item.id === activeProduct ? "is-active" : ""}
              onClick={() => setActiveProduct(item.id)}
            >
              <span>{item.order}</span>
              <strong>{item.name}</strong>
              <small>{item.eyebrow}</small>
            </button>
          ))}
        </div>

        <article className="product-feature" key={product.id}>
          <div className="product-feature-copy">
            <p className="page-kicker">{product.eyebrow}</p>
            <h2>{product.name}</h2>
            <p>{product.short}</p>
            <ul>
              {product.features.slice(0, 3).map((feature) => (
                <li key={feature}><Check size={15} />{feature}</li>
              ))}
            </ul>
            <LocalLink className="dark-action" href={`/products/${product.id}`} navigate={navigate}>
              Discover {product.name} <ArrowRight size={16} />
            </LocalLink>
          </div>
          <div className="product-feature-media">
            <img src={product.image} alt={product.name} style={{ objectPosition: product.imagePosition }} />
          </div>
        </article>
      </section>

      <section className="product-closing">
        <p className="page-kicker">Connected by one purpose</p>
        <h2>Technology that fits the rhythm of real life.</h2>
        <p>Each Lumiq experience can stand alone, and becomes more continuous when it travels with the family.</p>
        <LocalLink className="underline-action" href="/story" navigate={navigate}>Read our story</LocalLink>
      </section>

      <Footer navigate={navigate} />
    </main>
  );
}

function ProductDetailPage({ product, navigate }) {
  return (
    <main className="inner-page detail-page">
      <section className="detail-hero">
        <div className="detail-copy">
          <p className="page-kicker">{product.eyebrow}</p>
          <h1>{product.name}</h1>
          <p>{product.short}</p>
          <strong>{product.price}</strong>
          <LocalLink className="dark-action" href="/prelaunch" navigate={navigate}>
            Reserve interest <ArrowRight size={16} />
          </LocalLink>
        </div>
        <img src={product.image} alt={product.name} style={{ objectPosition: product.imagePosition }} />
      </section>

      <section className="detail-features">
        <div className="section-heading">
          <p className="page-kicker">Key features</p>
          <h2>Designed around the person, not the device.</h2>
        </div>
        <div className="feature-list">
          {product.features.map((feature, index) => (
            <article key={feature}>
              <span>0{index + 1}</span>
              <h3>{feature}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="detail-next">
        <h2>See how the whole collection connects.</h2>
        <LocalLink className="dark-action" href="/products" navigate={navigate}>
          Back to products <ArrowRight size={16} />
        </LocalLink>
      </section>
      <Footer navigate={navigate} />
    </main>
  );
}

function PlanCards({ plans, yearly, navigate }) {
  return (
    <div className="plan-grid">
      {plans.map((plan) => (
        <article key={plan.name} className={plan.featured ? "is-featured" : ""}>
          {plan.featured && <span className="popular-label">Most popular</span>}
          <p className="plan-note">{plan.note}</p>
          <h3>{plan.name}</h3>
          <p className="plan-price">{yearly ? plan.yearly : plan.monthly}<small>/mo</small></p>
          <ul>
            {plan.features.map((feature) => <li key={feature}><Check size={15} />{feature}</li>)}
          </ul>
          <LocalLink className="plan-action" href="/prelaunch" navigate={navigate}>Choose {plan.name}</LocalLink>
        </article>
      ))}
    </div>
  );
}

function PlansPage({ navigate }) {
  const [yearly, setYearly] = useState(true);

  return (
    <main className="inner-page plans-page">
      <PageIntro
        kicker="Plans"
        title="Pick the way you want to"
        accent="live with us."
        body="One-time hardware. Monthly subscriptions where they add real value. No tricks."
        narrow
      />

      <section className="hardware-grid">
        {products.map((product) => (
          <article key={product.id}>
            <img src={product.image} alt={product.name} style={{ objectPosition: product.imagePosition }} />
            <div>
              <h2>{product.name}</h2>
              <p>{product.eyebrow}</p>
              <strong>{product.price}</strong>
              <div>
                <LocalLink className="dark-action" href="/prelaunch" navigate={navigate}>Reserve</LocalLink>
                <LocalLink className="underline-action" href={`/products/${product.id}`} navigate={navigate}>Learn more</LocalLink>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="subscriptions-section">
        <div className="billing-toggle" aria-label="Billing period">
          <button className={yearly ? "is-active" : ""} type="button" onClick={() => setYearly(true)}>
            Yearly <small>Save up to 12%</small>
          </button>
          <button className={!yearly ? "is-active" : ""} type="button" onClick={() => setYearly(false)}>Monthly</button>
        </div>

        <div className="plan-group">
          <p className="page-kicker">Lumiq Tablet · Story Pass</p>
          <h2>Continue your story.</h2>
          <PlanCards plans={storyPassPlans} yearly={yearly} navigate={navigate} />
        </div>

        <div className="plan-group">
          <p className="page-kicker">Lumiq Ola · Companion plan</p>
          <h2>Choose the level of continuity.</h2>
          <PlanCards plans={companionPlans} yearly={yearly} navigate={navigate} />
        </div>
      </section>

      <Footer navigate={navigate} />
    </main>
  );
}

function MediaPage({ navigate }) {
  return (
    <main className="inner-page media-page">
      <PageIntro
        kicker="Media & Review"
        title="What people are"
        accent="saying."
        body="A small selection of press features and reader letters that have meant a lot to us."
        narrow
      />

      <section className="press-section">
        <p className="page-kicker">In the press</p>
        {pressItems.map((item) => (
          <article key={item.publication}>
            <div><strong>{item.publication}</strong><span>{item.date}</span></div>
            <blockquote>“{item.quote}”</blockquote>
            <button type="button" aria-label={`${item.action} — concept link`}>{item.action} <ArrowRight size={15} /></button>
          </article>
        ))}
      </section>

      <section className="letters-section">
        <div className="section-heading">
          <p className="page-kicker">Reader letters</p>
          <h2>A small chorus,<br />speaking softly.</h2>
        </div>
        <div className="letter-grid">
          {readerLetters.map((letter) => (
            <article key={letter.author}>
              <blockquote>“{letter.quote}”</blockquote>
              <p>{letter.author}</p>
            </article>
          ))}
        </div>
      </section>

      <Footer navigate={navigate} />
    </main>
  );
}

function FaqPage({ navigate }) {
  const [query, setQuery] = useState("");
  const [openQuestion, setOpenQuestion] = useState(faqItems[0].question);
  const visibleFaqs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return faqItems;
    return faqItems.filter((item) => `${item.question} ${item.answer}`.toLowerCase().includes(normalized));
  }, [query]);

  return (
    <main className="inner-page faq-page">
      <PageIntro
        kicker="FAQ"
        title="Questions,"
        accent="gently answered."
        body="Still curious? Email hello@lumiqstudio.com and our team will reply as soon as possible."
        narrow
      />

      <section className="faq-shell">
        <label className="faq-search">
          <Search size={18} />
          <input
            type="search"
            placeholder="Search the answers…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <span>{visibleFaqs.length} / {faqItems.length}</span>
        </label>

        <div className="faq-list">
          {visibleFaqs.map((item) => {
            const open = openQuestion === item.question;
            return (
              <article key={item.question} className={open ? "is-open" : ""}>
                <button type="button" aria-expanded={open} onClick={() => setOpenQuestion(open ? "" : item.question)}>
                  {item.question}
                  {open ? <Minus size={18} /> : <Plus size={18} />}
                </button>
                <div className="faq-answer"><p>{item.answer}</p></div>
              </article>
            );
          })}
          {visibleFaqs.length === 0 && <p className="no-results">No matching answer yet. Try a broader phrase.</p>}
        </div>
      </section>

      <section className="faq-contact">
        <Mail size={20} />
        <div><p>Still curious?</p><a href="mailto:hello@lumiqstudio.com">hello@lumiqstudio.com</a></div>
      </section>
      <Footer navigate={navigate} />
    </main>
  );
}

function PrelaunchPage({ navigate }) {
  const [submitted, setSubmitted] = useState(false);
  return (
    <main className="inner-page prelaunch-page">
      <section className="prelaunch-card">
        <div className="prelaunch-copy">
          <p className="page-kicker">Prelaunch</p>
          <h1>Stay close to<br /><em>what comes next.</em></h1>
          <p>Join the early list for product updates, studio notes and invitations to future previews.</p>
        </div>
        {submitted ? (
          <div className="form-success">
            <Sparkles size={28} />
            <h2>You’re on the list.</h2>
            <p>Thank you. This local prototype keeps the confirmation on this device only.</p>
            <LocalLink className="dark-action" href="/" navigate={navigate}>Back home</LocalLink>
          </div>
        ) : (
          <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
            <label>Name<input name="name" required placeholder="Your name" /></label>
            <label>Email<input name="email" type="email" required placeholder="you@example.com" /></label>
            <label>Interested in
              <select name="interest" defaultValue="ola">
                <option value="tablet">Lumiq Tablet</option>
                <option value="ola">Lumiq Ola + Ola Go</option>
                <option value="print">Lumiq Print</option>
                <option value="studio">The whole studio</option>
              </select>
            </label>
            <button type="submit">Join prelaunch <ArrowRight size={16} /></button>
            <small>Prototype form · no information leaves this page.</small>
          </form>
        )}
      </section>
      <Footer navigate={navigate} />
    </main>
  );
}

function NotFoundPage({ navigate }) {
  return (
    <main className="inner-page not-found-page">
      <p className="page-kicker">404</p>
      <h1>This chapter is still being written.</h1>
      <LocalLink className="dark-action" href="/" navigate={navigate}>Return home</LocalLink>
    </main>
  );
}

function resolvePage(pathname, navigate) {
  if (pathname === "/") return null;
  if (pathname === "/story") return <StoryPage navigate={navigate} />;
  if (pathname === "/products") return <ProductsPage navigate={navigate} />;
  if (pathname === "/plans") return <PlansPage navigate={navigate} />;
  if (pathname === "/media") return <MediaPage navigate={navigate} />;
  if (pathname === "/faq") return <FaqPage navigate={navigate} />;
  if (pathname === "/prelaunch") return <PrelaunchPage navigate={navigate} />;
  if (pathname.startsWith("/products/")) {
    const productId = pathname.split("/").filter(Boolean)[1];
    const product = products.find((item) => item.id === productId);
    if (product) return <ProductDetailPage product={product} navigate={navigate} />;
  }
  return <NotFoundPage navigate={navigate} />;
}

export function App() {
  const [direction, setDirection] = useState("mask");
  const [pathname, setPathname] = useState(() => window.location.pathname || "/");

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname || "/");
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const titles = {
      "/": "Lumiq Studio — Homepage Directions",
      "/story": "Brand Story — Lumiq Studio",
      "/products": "Products — Lumiq Studio",
      "/plans": "Plans — Lumiq Studio",
      "/media": "Media & Review — Lumiq Studio",
      "/faq": "FAQ — Lumiq Studio",
      "/prelaunch": "Prelaunch — Lumiq Studio",
    };
    document.title = titles[pathname] || "Lumiq Studio";
  }, [pathname]);

  const navigate = (href) => {
    const [nextPathRaw, hash = ""] = href.split("#");
    const nextPath = nextPathRaw || pathname;
    window.history.pushState({}, "", `${nextPath}${hash ? `#${hash}` : ""}`);
    setPathname(nextPath);
    requestAnimationFrame(() => {
      if (hash) document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.scrollTo({ top: 0, behavior: "instant" });
    });
  };

  const changeDirection = (nextDirection) => {
    setDirection(nextDirection);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" }));
  };

  const innerPage = resolvePage(pathname, navigate);

  return (
    <div className={`prototype-shell direction-${direction} route-${pathname === "/" ? "home" : "inner"}`}>
      <Header
        pathname={pathname}
        direction={direction}
        onDirectionChange={changeDirection}
        navigate={navigate}
      />
      {pathname === "/" ? (
        direction === "mask" ? <MaskExperience navigate={navigate} /> : <ScrollExperience />
      ) : innerPage}
    </div>
  );
}
