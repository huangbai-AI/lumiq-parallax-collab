import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const openingVideoQuery =
  "(min-width: 1101px) and (min-height: 720px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/** The AI intro plays once; separate AI transition footage follows scrolling. */
export function mountOpeningVideo(root: HTMLElement) {
  const opening = root.querySelector<HTMLElement>(".lh-opening")!;
  const stage = opening.querySelector<HTMLElement>(".lh-opening-stage")!;
  const video = opening.querySelector<HTMLVideoElement>(".lh-opening-video")!;
  const layer = opening.querySelector<HTMLElement>(".lh-video-layer")!;
  const transition = opening.querySelector<HTMLVideoElement>(".lh-opening-transition")!;
  const heroCopy = opening.querySelector<HTMLElement>(".lh-hero-copy")!;
  const brandCopy = opening.querySelector<HTMLElement>(".lh-ola-copy")!;
  const cards = opening.querySelector<HTMLElement>(".lh-rhythm-cards")!;
  const cue = opening.querySelector<HTMLAnchorElement>(".lh-scroll-cue")!;
  const mm = gsap.matchMedia();
  if (new URLSearchParams(window.location.search).get("opening") === "code")
    return () => {};
  let handledAnchor = false;
  let introFinished = window.scrollY > 40 || !!window.location.hash;

  mm.add(openingVideoQuery, () => {
    opening.dataset.videoMode = "true";
    let alive = true;
    let frame = 0;
    let targetTime = 0;
    let loadDeadline: ReturnType<typeof setTimeout> | undefined;
    const playhead = { progress: 0 };
    const finishIntro = () => {
      if (!alive) return;
      introFinished = true;
      clearTimeout(loadDeadline);
      layer.dataset.intro = "complete";
      video.pause();
    };
    const seek = () => {
      frame = 0;
      if (!alive || document.hidden || transition.readyState < 2 || transition.seeking)
        return;
      if (Math.abs(transition.currentTime - targetTime) > 0.018)
        transition.currentTime = targetTime;
    };
    const schedule = () => {
      if (!frame && alive) frame = requestAnimationFrame(seek);
    };
    const update = () => {
      heroCopy.inert = playhead.progress > 0.3;
      brandCopy.inert = cards.inert = playhead.progress < 0.68;
      const endTime = Number.isFinite(transition.duration)
        ? Math.max(0, transition.duration - 0.045) : 0;
      targetTime = playhead.progress * endTime;
      transition.dataset.scrollProgress = String(playhead.progress);
      schedule();
      // Never trap a visitor waiting for an intro or replay it on reverse scroll.
      if (playhead.progress > 0.03 && !introFinished) finishIntro();
    };
    const ready = () => {
      if (!alive || introFinished) return;
      layer.dataset.ready = "true";
      if (!document.hidden) void video.play().catch(finishIntro);
    };
    const transitionReady = () => {
      if (!alive) return;
      transition.pause();
      layer.dataset.transitionReady = "true";
      update();
    };
    const transitionFailed = () => {
      delete layer.dataset.transitionReady;
    };
    const visibility = () => {
      if (document.hidden) video.pause();
      else if (!introFinished && video.readyState >= 2) ready();
      schedule();
    };
    video.addEventListener("loadeddata", ready);
    video.addEventListener("error", finishIntro);
    video.addEventListener("ended", finishIntro);
    document.addEventListener("visibilitychange", visibility);
    transition.addEventListener("loadeddata", transitionReady);
    transition.addEventListener("error", transitionFailed);
    transition.addEventListener("seeked", schedule);
    transition.addEventListener("canplay", schedule);
    // This second movie never autoplays: both forward and reverse motion are
    // driven by currentTime, independently of the one-time letter intro.
    transition.muted = true;
    transition.preload = "auto";
    transition.src = "/assets/home-video/hero-brand-scroll-20260907.mp4";
    transition.load();
    if (introFinished) finishIntro();
    else {
      layer.dataset.intro = "pending";
      video.muted = true;
      video.preload = "auto";
      video.src = "/assets/home-video/hero-intro-20260907.mp4";
      video.load();
      // A blocked or slow video must still leave the approved hero fully visible.
      loadDeadline = setTimeout(finishIntro, 8000);
    }

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
      .to(playhead, { progress: 1, duration: 1, ease: "none", onUpdate: update }, 0)
      .to(heroCopy, { autoAlpha: 0, y: -45, duration: 0.2, ease: "none" }, 0.08)
      .to(cue, { autoAlpha: 0, duration: 0.08 }, 0.04)
      // Posters are only a fallback beneath the opaque decoded transition.
      .to(".lh-video-end-poster", { opacity: 1, duration: 0.3, ease: "none" }, 0.38)
      .fromTo(brandCopy, { y: 35, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.2, ease: "power1.out" }, 0.68)
      .fromTo(cards, { y: 55, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.2, ease: "power1.out" }, 0.74);
    const trigger = timeline.scrollTrigger!;
    const closer = (event: MouseEvent) => {
      event.preventDefault();
      window.scrollTo({
        top: trigger.start + (trigger.end - trigger.start) * 0.95,
        behavior: "smooth",
      });
    };
    cue.addEventListener("click", closer);
    const resetFrame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (!handledAnchor && window.location.hash === "#ola")
        window.scrollTo({ top: trigger.end, behavior: "instant" });
      handledAnchor = true;
    });
    update();
    return () => {
      alive = false;
      clearTimeout(loadDeadline);
      cancelAnimationFrame(resetFrame);
      cancelAnimationFrame(frame);
      cue.removeEventListener("click", closer);
      video.removeEventListener("loadeddata", ready);
      video.removeEventListener("error", finishIntro);
      video.removeEventListener("ended", finishIntro);
      document.removeEventListener("visibilitychange", visibility);
      transition.removeEventListener("loadeddata", transitionReady);
      transition.removeEventListener("error", transitionFailed);
      transition.removeEventListener("seeked", schedule);
      transition.removeEventListener("canplay", schedule);
      transition.pause();
      transition.removeAttribute("src");
      transition.load();
      delete transition.dataset.scrollProgress;
      video.pause();
      video.removeAttribute("src");
      video.load();
      delete opening.dataset.videoMode;
      delete layer.dataset.ready;
      delete layer.dataset.transitionReady;
      delete layer.dataset.intro;
      heroCopy.inert = brandCopy.inert = cards.inert = false;
    };
  });
  return () => mm.revert();
}
