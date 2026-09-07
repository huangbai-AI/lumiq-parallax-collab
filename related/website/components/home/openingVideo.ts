import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const openingVideoQuery =
  "(min-width: 1101px) and (min-height: 600px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/** One continuous AI movie: autoplay the opening, then scrub the same source. */
export function mountOpeningVideo(root: HTMLElement) {
  const opening = root.querySelector<HTMLElement>(".lh-opening")!;
  const stage = opening.querySelector<HTMLElement>(".lh-opening-stage")!;
  const video = opening.querySelector<HTMLVideoElement>(".lh-opening-video")!;
  const layer = opening.querySelector<HTMLElement>(".lh-video-layer")!;
  const heroCopy = opening.querySelector<HTMLElement>(".lh-hero-copy")!;
  const brandCopy = opening.querySelector<HTMLElement>(".lh-ola-copy")!;
  const cards = opening.querySelector<HTMLElement>(".lh-rhythm-cards")!;
  const rhythmCards = Array.from(
    opening.querySelectorAll<HTMLElement>(".lh-rhythm-card"),
  );
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
    // Measured on the continuous H3 movie; no source or element swap here.
    const introEnd = 2.4;
    const frameDuration = 1 / 24;
    let targetTime = introEnd;
    const playhead = { progress: 0 };
    const finishIntro = () => {
      if (!alive) return;
      introFinished = true;
      clearTimeout(loadDeadline);
      layer.dataset.intro = "complete";
      video.pause();
      schedule();
    };
    const tick = () => {
      frame = 0;
      if (!alive || document.hidden || video.error || video.readyState < 2) return;
      if (!introFinished) {
        if (video.currentTime >= introEnd) finishIntro();
        else schedule();
        return;
      }
      if (video.seeking) return; // seeked schedules the latest target again.
      if (Math.abs(video.currentTime - targetTime) > frameDuration / 2)
        video.currentTime = targetTime;
      else layer.dataset.ready = "true";
    };
    const schedule = () => {
      if (!frame && alive) frame = requestAnimationFrame(tick);
    };
    const update = () => {
      heroCopy.inert = playhead.progress > 0.5;
      brandCopy.inert = cards.inert = playhead.progress < 0.68;
      const endTime = Number.isFinite(video.duration)
        ? Math.max(introEnd, video.duration - 0.045) : introEnd;
      targetTime = Math.min(endTime, Math.round(
        (introEnd + playhead.progress * (endTime - introEnd)) / frameDuration,
      ) * frameDuration);
      video.dataset.scrollProgress = String(playhead.progress);
      // Scrolling or an anchor can skip the intro, but never replays it backwards.
      if (playhead.progress > 0.03 && !introFinished) finishIntro();
      schedule();
    };
    const ready = () => {
      if (!alive) return;
      clearTimeout(loadDeadline);
      if (introFinished) { update(); return; }
      layer.dataset.ready = "true";
      if (!document.hidden) void video.play().then(schedule).catch(finishIntro);
    };
    const failed = () => {
      finishIntro();
      delete layer.dataset.ready;
    };
    const visibility = () => {
      if (document.hidden) video.pause();
      else if (!introFinished && video.readyState >= 2) ready();
      schedule();
    };
    video.addEventListener("loadeddata", ready);
    video.addEventListener("error", failed);
    video.addEventListener("ended", finishIntro);
    video.addEventListener("seeked", schedule);
    video.addEventListener("canplay", schedule);
    document.addEventListener("visibilitychange", visibility);
    layer.dataset.intro = introFinished ? "complete" : "pending";
    video.muted = true;
    // The 2.4-second letter entrance plays in two seconds.
    video.playbackRate = 1.2;
    video.preload = "auto";
    video.src = "/assets/home-video/opening-user-clean-h3-20260907.mp4";
    video.load();
    // Slow or blocked loading leaves the approved static composition usable.
    const loadDeadline = setTimeout(failed, 8000);

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
      // This shot holds the products until about 4.4s; keep the copy through the hold.
      .to(heroCopy, { autoAlpha: 0, y: -45, duration: 0.2, ease: "none" }, 0.3)
      .to(cue, { autoAlpha: 0, duration: 0.08 }, 0.25)
      // Posters are only a fallback beneath the decoded movie.
      .to(".lh-video-end-poster", { opacity: 1, duration: 0.3, ease: "none" }, 0.38)
      .fromTo(brandCopy, { y: 35, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.2, ease: "power1.out" }, 0.64);
    rhythmCards.forEach((card, index) => {
      timeline.fromTo(
        card,
        { y: 90 + index * 28, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.18, ease: "power2.out" },
        0.68 + index * 0.07,
      );
    });
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
      video.removeEventListener("error", failed);
      video.removeEventListener("ended", finishIntro);
      document.removeEventListener("visibilitychange", visibility);
      video.removeEventListener("seeked", schedule);
      video.removeEventListener("canplay", schedule);
      delete video.dataset.scrollProgress;
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
