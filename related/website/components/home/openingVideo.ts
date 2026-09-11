import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { guardReadingStop } from "./readingGuard";

export const openingVideoSource = "/assets/home-video/ola-scroll-v16-20260909.mp4";
export const openingVideoQuery =
  "(min-width: 1101px) and (min-height: 600px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/** One continuous shot, held at its approved first frame until the user scrolls. */
export function mountOpeningVideo(root: HTMLElement) {
  if (new URLSearchParams(window.location.search).get("opening") === "code") return () => {};
  const opening = root.querySelector<HTMLElement>(".lh-opening")!;
  const stage = opening.querySelector<HTMLElement>(".lh-opening-stage")!;
  const video = opening.querySelector<HTMLVideoElement>(".lh-opening-video")!;
  const layer = opening.querySelector<HTMLElement>(".lh-video-layer")!;
  const heroCopy = opening.querySelector<HTMLElement>(".lh-hero-copy")!;
  const brandCopy = opening.querySelector<HTMLElement>(".lh-ola-copy")!;
  const cards = opening.querySelector<HTMLElement>(".lh-rhythm-cards")!;
  const mm = gsap.matchMedia();
  mm.add(openingVideoQuery, () => {
    opening.dataset.videoMode = "true";
    layer.dataset.intro = "complete";
    let alive = true;
    let frame = 0;
    const anchor = 0.92;
    const playhead = { progress: 0 };
    const duration = () => Number.isFinite(video.duration) ? video.duration : 6;
    const endTime = () => Math.max(0, duration() - 1 / 30);
    const tick = () => {
      frame = 0;
      if (!alive || document.hidden || video.error || video.readyState < 2 || video.seeking) return;
      const desired = playhead.progress * endTime();
      if (Math.abs(video.currentTime - desired) > 1 / 60) {
        video.currentTime = desired;
        return;
      }
      layer.dataset.ready = "true";
    };
    const schedule = () => { if (alive && !frame) frame = requestAnimationFrame(tick); };
    const update = () => {
      heroCopy.inert = playhead.progress > 0.4;
      brandCopy.inert = cards.inert = playhead.progress < 0.43;
      video.dataset.scrollProgress = String(playhead.progress);
      schedule();
    };
    const ready = () => { video.pause(); schedule(); };
    const failed = () => { video.pause(); delete layer.dataset.ready; };
    const visibility = () => {
      if (document.hidden) video.pause();
      else schedule();
    };
    video.muted = true;
    video.loop = false;
    video.preload = "auto";
    video.addEventListener("loadeddata", ready);
    video.addEventListener("seeked", schedule);
    video.addEventListener("canplay", schedule);
    video.addEventListener("error", failed);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("lumiq:home-enter", ready);
    const source = video.dataset.preparedSrc || openingVideoSource;
    if (video.getAttribute("src") !== source) { video.src = source; video.load(); }
    const timeline = gsap.timeline({ scrollTrigger: {
      id: "home-opening-video", trigger: stage, pin: stage, start: "top top",
      end: () => `+=${window.innerHeight * 2.85}`, scrub: true,
      invalidateOnRefresh: true, refreshPriority: 2, onRefresh: update,
    } });
    timeline
      .to(playhead, { progress: 1, duration: anchor, ease: "none", onUpdate: update }, 0)
      .to({}, { duration: 1 - anchor }, anchor)
      .to(heroCopy, { autoAlpha: 0, y: -35, duration: 0.25, ease: "none" }, 0.05)
      // Text shares the video's scroll timeline in both directions.
      .fromTo(brandCopy, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.22, ease: "none" }, 0.42)
      .fromTo(cards, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.22, ease: "none" }, 0.48);
    const scroll = timeline.scrollTrigger!;
    const releaseReading = guardReadingStop(root, scroll, () => scroll.start + (scroll.end - scroll.start) * anchor);
    const resetFrame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (window.location.hash === "#ola")
        window.scrollTo({ top: scroll.start + (scroll.end - scroll.start) * anchor, behavior: "instant" });
      scroll.update();
      update();
      ready();
    });
    update();
    return () => {
      releaseReading();
      alive = false;
      cancelAnimationFrame(resetFrame);
      cancelAnimationFrame(frame);
      video.removeEventListener("loadeddata", ready);
      video.removeEventListener("seeked", schedule);
      video.removeEventListener("canplay", schedule);
      video.removeEventListener("error", failed);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("lumiq:home-enter", ready);
      video.pause(); video.removeAttribute("src"); video.load();
      delete video.dataset.scrollProgress;
      delete opening.dataset.videoMode;
      delete layer.dataset.ready;
      delete layer.dataset.intro;
      heroCopy.inert = brandCopy.inert = cards.inert = false;
    };
  });
  return () => mm.revert();
}
