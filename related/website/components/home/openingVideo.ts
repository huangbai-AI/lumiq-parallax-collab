import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const openingVideoQuery =
  "(min-width: 1101px) and (min-height: 720px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/** AI footage reveals the glass letters once; native scrolling remains available. */
export function mountOpeningVideo(root: HTMLElement) {
  const opening = root.querySelector<HTMLElement>(".lh-opening")!;
  const stage = opening.querySelector<HTMLElement>(".lh-opening-stage")!;
  const video = opening.querySelector<HTMLVideoElement>(".lh-opening-video")!;
  const layer = opening.querySelector<HTMLElement>(".lh-video-layer")!;
  const heroCopy = opening.querySelector<HTMLElement>(".lh-hero-copy")!;
  const brandCopy = opening.querySelector<HTMLElement>(".lh-ola-copy")!;
  const character = opening.querySelector<HTMLElement>(".lh-brand-character")!;
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
    let loadDeadline: ReturnType<typeof setTimeout> | undefined;
    const playhead = { progress: 0 };
    const finishIntro = () => {
      if (!alive) return;
      introFinished = true;
      clearTimeout(loadDeadline);
      layer.dataset.intro = "complete";
      video.pause();
    };
    const update = () => {
      heroCopy.inert = playhead.progress > 0.3;
      brandCopy.inert = cards.inert = playhead.progress < 0.46;
      // Never trap a visitor waiting for an intro or replay it on reverse scroll.
      if (playhead.progress > 0.03 && !introFinished) finishIntro();
    };
    const ready = () => {
      if (!alive || introFinished) return;
      layer.dataset.ready = "true";
      if (!document.hidden) void video.play().catch(finishIntro);
    };
    const visibility = () => {
      if (document.hidden) video.pause();
      else if (!introFinished && video.readyState >= 2) ready();
    };
    video.addEventListener("loadeddata", ready);
    video.addEventListener("error", finishIntro);
    video.addEventListener("ended", finishIntro);
    document.addEventListener("visibilitychange", visibility);
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
        end: () => `+=${window.innerHeight * 1.2}`,
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
      .to(layer, { autoAlpha: 0, yPercent: -6, duration: 0.48, ease: "none" }, 0.08)
      .fromTo(character, { y: 35, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.28, ease: "power1.out" }, 0.36)
      .fromTo(brandCopy, { y: 35, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.24, ease: "power1.out" }, 0.42)
      .fromTo(cards, { y: 55, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.28, ease: "power1.out" }, 0.48);
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
      cue.removeEventListener("click", closer);
      video.removeEventListener("loadeddata", ready);
      video.removeEventListener("error", finishIntro);
      video.removeEventListener("ended", finishIntro);
      document.removeEventListener("visibilitychange", visibility);
      video.pause();
      video.removeAttribute("src");
      video.load();
      delete opening.dataset.videoMode;
      delete layer.dataset.ready;
      delete layer.dataset.intro;
      heroCopy.inert = brandCopy.inert = cards.inert = false;
    };
  });
  return () => mm.revert();
}
