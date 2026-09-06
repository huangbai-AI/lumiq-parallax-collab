import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const openingVideoQuery =
  "(min-width: 1101px) and (min-height: 720px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/** The movie stays paused. Native document scrolling seeks its latest target frame. */
export function mountOpeningVideo(root: HTMLElement) {
  const opening = root.querySelector<HTMLElement>(".lh-opening")!;
  const stage = opening.querySelector<HTMLElement>(".lh-opening-stage")!;
  const video = opening.querySelector<HTMLVideoElement>(".lh-opening-video")!;
  const layer = opening.querySelector<HTMLElement>(".lh-video-layer")!;
  const heroCopy = opening.querySelector<HTMLElement>(".lh-hero-copy")!;
  const brandCopy = opening.querySelector<HTMLElement>(".lh-ola-copy")!;
  const cards = opening.querySelector<HTMLElement>(".lh-rhythm-cards")!;
  const cue = opening.querySelector<HTMLAnchorElement>(".lh-scroll-cue")!;
  const mm = gsap.matchMedia();
  const codeOption =
    new URLSearchParams(window.location.search).get("opening") === "code";
  if (codeOption) return () => {};
  let handledAnchor = false;
  mm.add(openingVideoQuery, () => {
    opening.dataset.videoMode = "true";
    let frame = 0;
    let alive = true;
    let targetTime = 0;
    const playhead = { progress: 0 };
    const endTime = () =>
      Number.isFinite(video.duration) ? Math.max(0, video.duration - 0.045) : 0;
    const seek = () => {
      frame = 0;
      if (!alive || document.hidden || video.readyState < 2 || video.seeking)
        return;
      if (Math.abs(video.currentTime - targetTime) > 0.018)
        video.currentTime = targetTime;
    };
    const schedule = () => {
      if (!frame && alive) frame = requestAnimationFrame(seek);
    };
    const update = () => {
      targetTime = playhead.progress * endTime();
      video.dataset.scrollProgress = String(playhead.progress);
      heroCopy.inert = playhead.progress > 0.32;
      brandCopy.inert = cards.inert = playhead.progress < 0.68;
      schedule();
    };
    const ready = () => {
      if (!alive) return;
      video.pause();
      layer.dataset.ready = "true";
      update();
    };
    const failed = () => {
      delete layer.dataset.ready;
    };
    // Posters remain in place until a decodable video frame exists.
    video.addEventListener("loadeddata", ready);
    video.addEventListener("error", failed);
    video.addEventListener("seeked", schedule);
    video.addEventListener("canplay", schedule);
    document.addEventListener("visibilitychange", schedule);
    video.muted = true;
    video.preload = "auto";
    video.src = "/assets/home-video/opening-scroll.mp4";
    video.load();
    gsap.set([brandCopy, cards], { autoAlpha: 0 });
    gsap.set(".lh-video-end-poster", { opacity: 0 });
    const timeline = gsap.timeline({
      scrollTrigger: {
        id: "home-opening-video",
        trigger: stage,
        pin: stage,
        start: "top top",
        end: () => `+=${window.innerHeight * 1.6}`,
        scrub: 0.2,
        invalidateOnRefresh: true,
        refreshPriority: 2,
        onRefresh: update,
      },
    });
    timeline
      .to(
        playhead,
        { progress: 1, duration: 1, ease: "none", onUpdate: update },
        0,
      )
      .to(heroCopy, { autoAlpha: 0, y: -55, duration: 0.2, ease: "none" }, 0.08)
      .to(cue, { autoAlpha: 0, duration: 0.08 }, 0.04)
      .to(
        ".lh-video-end-poster",
        { opacity: 1, duration: 0.24, ease: "none" },
        0.4,
      )
      .to(
        ".lh-video-start-poster",
        { opacity: 0, duration: 0.24, ease: "none" },
        0.4,
      )
      .fromTo(
        brandCopy,
        { y: 45 },
        { y: 0, autoAlpha: 1, duration: 0.18, ease: "power1.out" },
        0.68,
      )
      .fromTo(
        cards,
        { y: 85 },
        { y: 0, autoAlpha: 1, duration: 0.2, ease: "power1.out" },
        0.74,
      );
    const trigger = timeline.scrollTrigger!;
    const closer = (event: MouseEvent) => {
      event.preventDefault();
      window.scrollTo({
        top: trigger.start + (trigger.end - trigger.start) * 0.95,
        behavior: "smooth",
      });
    };
    cue.addEventListener("click", closer);
    let resetFrame = requestAnimationFrame(() => {
      resetFrame = 0;
      ScrollTrigger.refresh();
      if (!handledAnchor && window.location.hash === "#ola") {
        window.scrollTo({ top: trigger.end, behavior: "instant" });
      }
      handledAnchor = true;
    });
    update();
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resetFrame);
      cue.removeEventListener("click", closer);
      video.removeEventListener("loadeddata", ready);
      video.removeEventListener("error", failed);
      video.removeEventListener("seeked", schedule);
      video.removeEventListener("canplay", schedule);
      document.removeEventListener("visibilitychange", schedule);
      video.pause();
      video.removeAttribute("src");
      video.load();
      delete opening.dataset.videoMode;
      delete layer.dataset.ready;
      delete video.dataset.scrollProgress;
      heroCopy.inert = brandCopy.inert = cards.inert = false;
    };
  });
  return () => mm.revert();
}
