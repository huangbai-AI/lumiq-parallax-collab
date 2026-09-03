"use client";

import Image from "next/image";
import {
  ArrowRight,
  BellRing,
  BookOpen,
  CalendarDays,
  CloudSun,
  HeartHandshake,
  Home as HomeIcon,
  MessageCircle,
  Play,
  ShieldCheck,
  Sparkles,
  TabletSmartphone,
  UserRound,
  UsersRound,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {useCallback, useRef} from "react";
import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import "./homepage.css";

type SectionId = "top" | "ola" | "tablet" | "nest-15" | "family" | "join";
const videoAnchorFrames = [0, 97, 195, 293] as const;

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

function mapJourneyToVideo(progress: number) {
  const position = Math.min(1, Math.max(0, progress)) * 3;
  const segment = Math.min(2, Math.floor(position));
  const localProgress = position - segment;
  const from = videoAnchorFrames[segment];
  const to = videoAnchorFrames[segment + 1];

  return (from + (to - from) * localProgress) / videoAnchorFrames[3];
}

function usePearlVideoScroller() {
  const rootRef = useRef<HTMLElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeIndexRef = useRef(0);
  const scrollFrameRef = useRef(0);
  const wheelTimerRef = useRef(0);
  const scrollLockedRef = useRef(false);

  const goToScene = useCallback((nextIndex: number, instant = false) => {
    const root = rootRef.current;
    if (!root || scrollLockedRef.current) return;

    const scenes = Array.from(
      root.querySelectorAll<HTMLElement>("[data-pearl-scene]"),
    );
    if (!scenes.length) return;

    const index = Math.max(0, Math.min(scenes.length - 1, nextIndex));
    const target = scenes[index].offsetTop;
    const start = window.scrollY;
    activeIndexRef.current = index;

    if (Math.abs(target - start) < 2) {
      window.scrollTo(0, target);
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const duration = reduceMotion || instant ? 1 : 900;
    const startedAt = performance.now();

    scrollLockedRef.current = true;
    document.documentElement.classList.add("pearl-is-gliding");

    const animate = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 0.5 - Math.cos(Math.PI * progress) / 2;
      window.scrollTo(0, start + (target - start) * eased);

      if (progress < 1) {
        scrollFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      window.scrollTo(0, target);
      scrollFrameRef.current = 0;
      document.documentElement.classList.remove("pearl-is-gliding");
      window.clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = window.setTimeout(() => {
        scrollLockedRef.current = false;
      }, 140);
    };

    scrollFrameRef.current = requestAnimationFrame(animate);
  }, []);

  const goToId = useCallback(
    (id: SectionId) => {
      const index = ["top", "ola", "tablet", "nest-15", "family", "join"].indexOf(id);
      if (index >= 0) goToScene(index);
    },
    [goToScene],
  );

  useGSAP(() => {
    const root = rootRef.current;
    const journey = journeyRef.current;
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!root || !journey || !stage || !video) return;

    const documentElement = document.documentElement;
    documentElement.classList.add("pearl-home-page");
    document.body.classList.add("pearl-home-page");

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      root.classList.add("pearl-reduced-motion");
      return () => {
        root.classList.remove("pearl-reduced-motion");
        documentElement.classList.remove("pearl-home-page");
        document.body.classList.remove("pearl-home-page");
      };
    }

    documentElement.classList.add("pearl-scroll-video-active");

    const scenes = Array.from(
      root.querySelectorAll<HTMLElement>("[data-pearl-scene]"),
    );
    let targetProgress = 0;
    let currentProgress = 0;
    let lastVideoFrame: number = videoAnchorFrames[3];
    let requestedFrame = -1;
    let animationFrame = 0;
    let objectUrl = "";
    let userReady = false;
    const abortController = new AbortController();
    const isMobile = window.matchMedia("(max-width: 900px)").matches;

    const journeyTrigger = ScrollTrigger.create({
      trigger: journey,
      start: "top top",
      end: "bottom bottom",
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        targetProgress = mapJourneyToVideo(self.progress);
      },
    });
    targetProgress = mapJourneyToVideo(journeyTrigger.progress);

    const currentScene = () =>
      scenes.reduce(
        (nearest, scene, index) => {
          const distance = Math.abs(scene.offsetTop - window.scrollY);
          return distance < nearest.distance ? {index, distance} : nearest;
        },
        {index: 0, distance: Number.POSITIVE_INFINITY},
      ).index;

    const updateActiveScene = () => {
      activeIndexRef.current = currentScene();
    };

    const onWheel = (event: WheelEvent) => {
      if (
        event.ctrlKey ||
        Math.abs(event.deltaY) < 0.5 ||
        Math.abs(event.deltaY) <= Math.abs(event.deltaX) ||
        !window.matchMedia("(pointer: fine)").matches
      ) {
        return;
      }

      const index = currentScene();
      const direction = event.deltaY > 0 ? 1 : -1;
      const nextIndex = Math.max(0, Math.min(scenes.length - 1, index + direction));
      if (nextIndex === index) return;

      event.preventDefault();
      window.clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = window.setTimeout(() => {
        if (!scrollFrameRef.current) scrollLockedRef.current = false;
      }, 140);

      if (scrollLockedRef.current) return;
      goToScene(nextIndex);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        (event.target instanceof Element &&
          event.target.closest("a, button, input, textarea, select"))
      ) {
        return;
      }

      const index = currentScene();
      let nextIndex = index;
      if (
        ["ArrowDown", "PageDown"].includes(event.key) ||
        (event.key === " " && !event.shiftKey)
      ) {
        nextIndex = Math.min(scenes.length - 1, index + 1);
      } else if (
        ["ArrowUp", "PageUp"].includes(event.key) ||
        (event.key === " " && event.shiftKey)
      ) {
        nextIndex = Math.max(0, index - 1);
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = scenes.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      goToScene(nextIndex);
    };

    window.addEventListener("scroll", updateActiveScene, {passive: true});
    window.addEventListener("wheel", onWheel, {passive: false});
    window.addEventListener("keydown", onKeyDown);
    updateActiveScene();

    gsap.utils
      .toArray<HTMLElement>(".pearl-video-floor", root)
      .forEach((floor) => {
        const fadeTargets = floor.querySelectorAll<HTMLElement>(
          ".pearl-copy, .pearl-hero-discover",
        );
        if (!fadeTargets.length) return;

        gsap
          .timeline({
            scrollTrigger: {
              trigger: floor,
              start: "top 80%",
              end: "bottom 20%",
              scrub: true,
            },
          })
          .set(fadeTargets, {autoAlpha: 0})
          .to(fadeTargets, {autoAlpha: 0, duration: 0.25, ease: "none"})
          .fromTo(
            fadeTargets,
            {autoAlpha: 0},
            {autoAlpha: 1, duration: 0.2, ease: "none"},
          )
          .to(fadeTargets, {autoAlpha: 1, duration: 0.1, ease: "none"})
          .to(fadeTargets, {autoAlpha: 0, duration: 0.2, ease: "none"})
          .to(fadeTargets, {autoAlpha: 0, duration: 0.25, ease: "none"});
      });

    ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        root.style.setProperty("--pearl-progress", self.progress.toFixed(4));
      },
    });

    const updateEdgeMask = () => {
      const stageRect = stage.getBoundingClientRect();
      const ratio = video.videoWidth / video.videoHeight || 16 / 9;

      if (
        window.innerWidth < 901 ||
        !Number.isFinite(ratio) ||
        ratio <= 0
      ) {
        stage.classList.remove("pearl-has-edge-mask");
        return;
      }

      stage.classList.toggle(
        "pearl-has-edge-mask",
        stageRect.width / stageRect.height > ratio + 0.01,
      );
    };

    const edgeObserver = new ResizeObserver(updateEdgeMask);
    edgeObserver.observe(stage);
    edgeObserver.observe(video);
    let resizeFrame = 0;
    let resizeSceneIndex = activeIndexRef.current;
    const onResize = () => {
      if (!resizeFrame) resizeSceneIndex = activeIndexRef.current;
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0;
        updateEdgeMask();
        ScrollTrigger.refresh();
        const scene = scenes[resizeSceneIndex];
        if (scene && !scrollFrameRef.current) {
          window.scrollTo(0, scene.offsetTop);
          activeIndexRef.current = resizeSceneIndex;
        }
      });
    };
    window.addEventListener("resize", onResize);
    updateEdgeMask();

    const renderVideoFrame = () => {
      if (video.readyState >= 1) {
        currentProgress += (targetProgress - currentProgress) * (isMobile ? 0.34 : 0.28);
        if (Math.abs(targetProgress - currentProgress) < 0.00035) {
          currentProgress = targetProgress;
        }

        const nextFrame = Math.round(currentProgress * lastVideoFrame);
        if (!video.seeking && nextFrame !== requestedFrame) {
          requestedFrame = nextFrame;
          video.currentTime = nextFrame / 24;
        }
      }
      animationFrame = requestAnimationFrame(renderVideoFrame);
    };

    const playAndPause = () => {
      const promise = video.play();
      if (promise) {
        promise.then(() => video.pause()).catch(() => undefined);
      }
    };

    const primeVideo = () => {
      if (userReady) return;
      userReady = true;
      playAndPause();
    };

    const onLoadedMetadata = () => {
      lastVideoFrame = Math.max(1, Math.round(video.duration * 24) - 1);
      currentProgress = targetProgress;
      requestedFrame = Math.round(currentProgress * lastVideoFrame);
      video.currentTime = requestedFrame / 24;
      updateEdgeMask();
      ScrollTrigger.refresh();
    };

    const onVideoReady = () => {
      stage.classList.add("is-video-ready");
      if (userReady) playAndPause();
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("loadeddata", onVideoReady, {once: true});
    window.addEventListener("pointerdown", primeVideo, {once: true, passive: true});
    window.addEventListener("touchstart", primeVideo, {once: true, passive: true});

    const source = isMobile
      ? "/assets/home-pearl/lumiq-scroll-world-720.mp4"
      : "/assets/home-pearl/lumiq-scroll-world-1080.mp4";

    fetch(source, {signal: abortController.signal})
      .then((response) => {
        if (!response.ok) throw new Error(`Video request failed: ${response.status}`);
        return response.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        video.src = objectUrl;
        video.load();
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        root.classList.add("pearl-video-failed");
      });

    animationFrame = requestAnimationFrame(renderVideoFrame);

    return () => {
      abortController.abort();
      cancelAnimationFrame(animationFrame);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("loadeddata", onVideoReady);
      window.removeEventListener("scroll", updateActiveScene);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerdown", primeVideo);
      window.removeEventListener("touchstart", primeVideo);
      edgeObserver.disconnect();
      cancelAnimationFrame(resizeFrame);
      if (scrollFrameRef.current) cancelAnimationFrame(scrollFrameRef.current);
      window.clearTimeout(wheelTimerRef.current);
      scrollFrameRef.current = 0;
      scrollLockedRef.current = false;
      video.removeAttribute("src");
      video.load();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      stage.classList.remove("is-video-ready");
      stage.classList.remove("pearl-has-edge-mask");
      root.classList.remove("pearl-video-failed");
      documentElement.classList.remove(
        "pearl-home-page",
        "pearl-is-gliding",
        "pearl-scroll-video-active",
      );
      document.body.classList.remove("pearl-home-page");
    };
  }, {scope: rootRef});

  return {rootRef, journeyRef, stageRef, videoRef, goToId};
}

function PearlVideoFloor({
  id,
  className,
  fallbackImage,
  children,
  priority = false,
}: {
  id: SectionId;
  className: string;
  fallbackImage: string;
  children: React.ReactNode;
  priority?: boolean;
}) {
  return (
    <section
      id={id}
      data-pearl-scene
      className={`pearl-panel pearl-video-floor ${className}`}
      aria-labelledby={`${id}-title`}
    >
      <div className="pearl-media-frame pearl-fallback-frame" aria-hidden="true">
        <Image
          className="pearl-panel-bg pearl-video-floor-fallback"
          src={fallbackImage}
          alt=""
          fill
          sizes="100vw"
          unoptimized
          priority={priority}
        />
      </div>
      <div className="pearl-overlay-frame">{children}</div>
    </section>
  );
}

function PearlPanel({
  id,
  className,
  image,
  children,
  priority = false,
}: {
  id: SectionId;
  className: string;
  image: string;
  children: React.ReactNode;
  priority?: boolean;
}) {
  return (
    <section
      id={id}
      data-pearl-scene
      className={`pearl-panel ${className}`}
      aria-labelledby={`${id}-title`}
    >
      <div className="pearl-media-frame" aria-hidden="true">
        <Image
          className="pearl-panel-bg"
          src={image}
          alt=""
          fill
          sizes="100vw"
          unoptimized
          priority={priority}
        />
      </div>
      <div className="pearl-overlay-frame">{children}</div>
    </section>
  );
}

function FeatureList({
  items,
}: {
  items: {label: string; icon: LucideIcon}[];
}) {
  return (
    <ul className="pearl-feature-list">
      {items.map(({label, icon: Icon}) => (
        <li key={label}>
          <span className="pearl-feature-icon" aria-hidden="true">
            <Icon size={17} strokeWidth={1.8} />
          </span>
          <strong>{label}</strong>
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  const t = useTranslations("Home");
  const common = useTranslations("Common");
  const footer = useTranslations("Footer");
  const {rootRef, journeyRef, stageRef, videoRef, goToId} =
    usePearlVideoScroller();

  const sceneLink =
    (id: SectionId) =>
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      goToId(id);
    };

  return (
    <main ref={rootRef} className="pearl-home" aria-label="LumiQ Home">
      <div className="pearl-progress" aria-hidden="true" />

      <div ref={journeyRef} className="pearl-video-journey">
        <div ref={stageRef} className="pearl-video-stage" aria-hidden="true">
          <div className="pearl-media-frame">
            <Image
              className="pearl-video-poster"
              src="/assets/home-pearl/lumiq-scroll-world-poster.jpg"
              alt=""
              fill
              sizes="100vw"
              unoptimized
              priority
            />
            <video
              ref={videoRef}
              className="pearl-scroll-video"
              muted
              playsInline
              preload="none"
              tabIndex={-1}
            />
          </div>
        </div>

        <div className="pearl-video-scenes">
          <PearlVideoFloor
            id="top"
            className="pearl-panel-hero"
            fallbackImage="/assets/home-pearl/home-products-bg.webp"
            priority
          >
            <div className="pearl-copy pearl-copy-hero">
              <p className="pearl-overline">LumiQ Studio</p>
              <h1 id="top-title">
                {t("panoramaHero1")}
                <br />
                {t("panoramaHero2")}
              </h1>
              <span className="pearl-rule" aria-hidden="true" />
              <p className="pearl-lead">{t("panoramaHeroBody")}</p>
            </div>
            <Link className="pearl-hero-discover" href="/story#brand-film">
              <span aria-hidden="true">
                <Play size={17} fill="currentColor" />
              </span>
              {t("discoverLumiq")}
            </Link>
          </PearlVideoFloor>

          <PearlVideoFloor
            id="ola"
            className="pearl-panel-ola"
            fallbackImage="/assets/home-pearl/ola-bg.webp"
          >
            <div className="pearl-copy pearl-copy-left">
              <p className="pearl-overline">{t("olaKicker")}</p>
              <h2 id="ola-title">{t("panoramaOlaTitle")}</h2>
              <p className="pearl-subtitle">{t("panoramaOlaSubtitle")}</p>
              <FeatureList
                items={[
                  {label: t("panoramaOlaFeature1"), icon: UserRound},
                  {label: t("panoramaOlaFeature2"), icon: Sparkles},
                  {label: t("panoramaOlaFeature3"), icon: MessageCircle},
                  {label: t("panoramaOlaFeature4"), icon: TabletSmartphone},
                ]}
              />
              <div className="pearl-actions">
                <Link className="pearl-primary" href="/products/ola">
                  {t("panoramaOlaCta")} <ArrowRight size={16} />
                </Link>
                <a className="pearl-next" href="#tablet" onClick={sceneLink("tablet")}>
                  {t("panoramaNextTablet")}
                </a>
              </div>
            </div>
          </PearlVideoFloor>

          <PearlVideoFloor
            id="tablet"
            className="pearl-panel-tablet"
            fallbackImage="/assets/home-pearl/tablet-bg.webp"
          >
            <div className="pearl-copy pearl-copy-right">
              <p className="pearl-overline">{t("tabletKicker")}</p>
              <h2 id="tablet-title">{t("panoramaTabletTitle")}</h2>
              <p className="pearl-subtitle">{t("panoramaTabletSubtitle")}</p>
              <FeatureList
                items={[
                  {label: t("panoramaTabletFeature1"), icon: BookOpen},
                  {label: t("panoramaTabletFeature2"), icon: WandSparkles},
                  {label: t("panoramaTabletFeature3"), icon: ShieldCheck},
                  {label: t("panoramaTabletFeature4"), icon: BellRing},
                ]}
              />
              <div className="pearl-actions">
                <Link className="pearl-primary" href="/products/tablet">
                  {t("panoramaTabletCta")} <ArrowRight size={16} />
                </Link>
                <a className="pearl-next" href="#nest-15" onClick={sceneLink("nest-15")}>
                  {t("panoramaNextNest")}
                </a>
              </div>
            </div>
          </PearlVideoFloor>

          <PearlVideoFloor
            id="nest-15"
            className="pearl-panel-nest"
            fallbackImage="/assets/home-pearl/nest-15-bg.webp"
          >
            <div className="pearl-copy pearl-copy-left">
              <p className="pearl-overline">{t("nestKicker")}</p>
              <h2 id="nest-15-title">{t("panoramaNestTitle")}</h2>
              <p className="pearl-subtitle">{t("panoramaNestSubtitle")}</p>
              <FeatureList
                items={[
                  {label: t("panoramaNestFeature1"), icon: CalendarDays},
                  {label: t("panoramaNestFeature2"), icon: CloudSun},
                  {label: t("panoramaNestFeature3"), icon: HomeIcon},
                ]}
              />
              <div className="pearl-actions">
                <Link className="pearl-primary" href="/prelaunch">
                  {t("panoramaNestCta")} <ArrowRight size={16} />
                </Link>
                <a className="pearl-next" href="#family" onClick={sceneLink("family")}>
                  {t("panoramaNextTogether")}
                </a>
              </div>
            </div>
          </PearlVideoFloor>
        </div>
      </div>

      <PearlPanel
        id="family"
        className="pearl-panel-family"
        image="/assets/home-pearl/family-bg.webp"
      >
        <div className="pearl-copy pearl-copy-left pearl-family-copy">
          <p className="pearl-overline">{t("panoramaFamilyKicker")}</p>
          <h2 id="family-title">{t("panoramaFamilyTitle")}</h2>
          <p className="pearl-lead">{t("storyBody")}</p>
          <FeatureList
            items={[
              {label: t("panoramaFamilyWord1"), icon: UsersRound},
              {label: t("panoramaFamilyWord2"), icon: HeartHandshake},
              {label: t("panoramaFamilyWord3"), icon: Sparkles},
            ]}
          />
          <div className="pearl-actions">
            <Link className="pearl-primary" href="/story">
              {t("panoramaFamilyCta")} <ArrowRight size={16} />
            </Link>
            <a className="pearl-next" href="#join" onClick={sceneLink("join")}>
              {t("panoramaContinue")}
            </a>
          </div>
        </div>
      </PearlPanel>

      <PearlPanel
        id="join"
        className="pearl-panel-join"
        image="/assets/home-pearl/join-bg.webp"
      >
        <div className="pearl-join-copy">
          <p className="pearl-overline">{t("panoramaJoinKicker")}</p>
          <h2 id="join-title">{t("panoramaJoinTitle")}</h2>
          <p>{t("panoramaJoinBody")}</p>
          <Link className="pearl-primary pearl-join-action" href="/prelaunch">
            {t("panoramaJoinCta")} <ArrowRight size={17} />
          </Link>
        </div>
        <div className="pearl-home-foot">
          <Image
            src="/assets/brand/lumiq-logo-transparent-dark.png"
            alt="LumiQ Studio"
            width={800}
            height={300}
          />
          <nav aria-label={footer("company")}>
            <Link href="/story">{common("brandStory")}</Link>
            <Link href="/products">{common("products")}</Link>
            <Link href="/faq">{common("faq")}</Link>
          </nav>
          <span>{footer("rights")}</span>
        </div>
      </PearlPanel>
    </main>
  );
}
