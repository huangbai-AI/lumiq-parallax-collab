import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const openingVideoQuery =
  "(min-width: 1101px) and (min-height: 600px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/** One AI shot: intro, scroll transition, then an independent quiet tail loop. */
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
  const mm = gsap.matchMedia();
  if (new URLSearchParams(window.location.search).get("opening") === "code")
    return () => {};
  let handledAnchor = false;
  let introInitialized = false;
  let introFinished = false;

  mm.add(openingVideoQuery, () => {
    opening.dataset.videoMode = "true";
    let alive = true;
    let frame = 0;
    // Measured on the continuous H3 movie; no source or element swap here.
    const introEnd = 2.4;
    const frameDuration = 1 / 60;
    // Finish the composition before unpinning, leaving room to rest on screen two.
    const settleAt = 0.86;
    const anchorAt = 0.92;
    let idleDelay: ReturnType<typeof setTimeout> | undefined;
    let idle: gsap.core.Timeline | undefined;
    let handoffAt = 0;
    let handoffFrom = 0;
    let userScrolled = false;
    let targetTime = introEnd;
    const playhead = { progress: 0 };
    const ambient = { time: 0 };
    const endTime = () => Number.isFinite(video.duration)
      ? Math.max(introEnd, video.duration - 0.045) : introEnd;
    const stopIdle = () => {
      clearTimeout(idleDelay);
      if (!idle) return;
      idle.kill();
      idle = undefined;
      handoffFrom = video.currentTime;
      handoffAt = performance.now();
      video.dataset.motion = "scroll";
      schedule();
    };
    const queueIdle = () => {
      clearTimeout(idleDelay);
      idleDelay = setTimeout(() => {
        if (!alive || idle || document.hidden || video.error || video.readyState < 2 ||
          !introFinished || playhead.progress < 0.999 || !scroll ||
          window.scrollY < scroll.start + (scroll.end - scroll.start) * settleAt - 1 ||
          window.scrollY > scroll.end + 1) return;
        const end = endTime();
        // The earlier shot is still transitioning; 1.1s stays inside the clean scene.
        const start = end - 1.1;
        if (video.seeking || Math.abs(video.currentTime - end) > 0.025) {
          schedule();
          queueIdle();
          return;
        }
        ambient.time = end;
        handoffAt = 0;
        video.dataset.motion = "idle";
        // A continuous breathing curve turns without the former long near-still hold.
        // It never writes to the scroll/card timeline.
        idle = gsap.timeline({ repeat: -1, onUpdate: schedule })
          .to(ambient, { time: start, duration: 1.35, ease: "sine.inOut" })
          .to(ambient, { time: end, duration: 1.35, ease: "sine.inOut" });
        schedule();
      }, 220);
    };
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
      if (!alive || !introInitialized || document.hidden || video.error || video.readyState < 2) return;
      if (!introFinished) {
        if (video.currentTime >= introEnd) finishIntro();
        else schedule();
        return;
      }
      if (video.seeking) return; // seeked schedules the latest target again.
      let desired = idle ? ambient.time : targetTime;
      if (!idle && handoffAt) {
        const p = Math.min(1, (performance.now() - handoffAt) / 280);
        desired = handoffFrom + (targetTime - handoffFrom) * (1 - Math.pow(1 - p, 3));
        if (p === 1) handoffAt = 0;
        else schedule();
      }
      if (Math.abs(video.currentTime - desired) > frameDuration / 2)
        video.currentTime = desired;
      else layer.dataset.ready = "true";
    };
    const schedule = () => {
      if (!frame && alive) frame = requestAnimationFrame(tick);
    };
    const update = () => {
      heroCopy.inert = playhead.progress > 0.5;
      brandCopy.inert = cards.inert = playhead.progress < 0.68;
      targetTime = introEnd + playhead.progress * (endTime() - introEnd);
      video.dataset.scrollProgress = String(playhead.progress);
      // Layout refresh/scroll restoration is not an intentional skip of the entrance.
      if (introInitialized && playhead.progress > 0.03 && !introFinished &&
        (userScrolled || window.scrollY > window.innerHeight * 0.6)) finishIntro();
      schedule();
    };
    const ready = () => {
      if (!alive || !introInitialized || video.readyState < 2) return;
      clearTimeout(loadDeadline);
      if (introFinished) { update(); queueIdle(); return; }
      layer.dataset.ready = "true";
      video.playbackRate = 1.2;
      if (!document.hidden) void video.play().then(schedule).catch(finishIntro);
    };
    const failed = () => {
      stopIdle();
      finishIntro();
      delete layer.dataset.ready;
    };
    const visibility = () => {
      stopIdle();
      if (document.hidden) video.pause();
      else if (!introFinished && video.readyState >= 2) ready();
      else queueIdle();
      schedule();
    };
    const onScroll = () => { stopIdle(); queueIdle(); };
    const scrollIntent = () => {
      userScrolled = true;
      if (introInitialized && !introFinished) finishIntro();
    };
    const onWheel = (event: WheelEvent) => { if (event.deltaY !== 0) scrollIntent(); };
    const interruptSnap = () => {
      const snapping = scroll?.getTween(true);
      if (snapping) snapping.kill();
    };
    const onKey = (event: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
        scrollIntent();
        interruptSnap();
      }
    };
    video.addEventListener("loadeddata", ready);
    video.addEventListener("error", failed);
    video.addEventListener("ended", finishIntro);
    video.addEventListener("seeked", schedule);
    video.addEventListener("canplay", schedule);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", interruptSnap, { passive: true });
    layer.dataset.intro = introFinished ? "complete" : "pending";
    video.muted = true;
    // The 2.4-second letter entrance plays in two seconds.
    video.playbackRate = 1.2;
    video.defaultPlaybackRate = 1.2;
    video.preload = "auto";
    video.src = "/assets/home-video/opening-user-clean-float60-20260907.mp4";
    video.load();
    // Slow or blocked loading leaves the approved static composition usable.
    const loadDeadline = setTimeout(failed, 8000);

    const timeline = gsap.timeline({
      scrollTrigger: {
        id: "home-opening-video",
        trigger: stage,
        pin: stage,
        start: "top top",
        end: () => `+=${window.innerHeight * 1.9}`,
        scrub: 0.4,
        snap: {
          snapTo: (value: number, self?: ScrollTrigger) => {
            if (document.hidden || !introFinished) return value;
            // Both compositions have an anchor. Only finish a deliberate transition;
            // small scrolls remain free, and scrolling past screen two always exits.
            if (self?.direction === 1 && value >= 0.28 && value < anchorAt) return anchorAt;
            if (self?.direction === -1 && value > anchorAt && value < 1) return anchorAt;
            if (self?.direction === -1 && value > 0 && value < 0.64) return 0;
            return value;
          },
          inertia: false,
          delay: 0.2,
          duration: { min: 0.4, max: 1.1 },
          ease: "power2.inOut",
        },
        invalidateOnRefresh: true,
        refreshPriority: 2,
        onRefresh: update,
        onScrubComplete: queueIdle,
        onSnapComplete: queueIdle,
      },
    });
    timeline
      .to(playhead, { progress: 1, duration: settleAt, ease: "none", onUpdate: update }, 0)
      .to({}, { duration: 1 - settleAt }, settleAt)
      // This shot holds the products until about 4.4s; keep the copy through the hold.
      .to(heroCopy, { autoAlpha: 0, y: -45, duration: 0.2 * settleAt, ease: "none" }, 0.3 * settleAt)
      // Posters are only a fallback beneath the decoded movie.
      .to(".lh-video-end-poster", { opacity: 1, duration: 0.3 * settleAt, ease: "none" }, 0.38 * settleAt)
      .fromTo(brandCopy, { y: 35, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.2 * settleAt, ease: "power1.out" }, 0.64 * settleAt);
    rhythmCards.forEach((card, index) => {
      timeline.fromTo(
        card,
        { y: 90 + index * 28, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.18 * settleAt, ease: "power2.out" },
        (0.68 + index * 0.07) * settleAt,
      );
    });
    const scroll = timeline.scrollTrigger;
    const resetFrame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (!handledAnchor && window.location.hash === "#ola")
        window.scrollTo({ top: scroll!.start + (scroll!.end - scroll!.start) * anchorAt, behavior: "instant" });
      handledAnchor = true;
      if (!introInitialized) {
        const target = document.getElementById(window.location.hash.slice(1));
        const hero = opening.querySelector(".lh-hero")!;
        const lowerAnchor = !!target && target !== root && !hero.contains(target);
        introFinished = lowerAnchor || window.scrollY > window.innerHeight * 0.6;
        introInitialized = true;
        if (!introFinished) {
          // A refresh within the opening returns to its first frame, even when the
          // browser restores a small scroll offset or the URL carries #top.
          window.scrollTo({ top: 0, behavior: "instant" });
          scroll?.update();
          const scrub = scroll?.getTween();
          if (scrub) scrub.progress(1);
          timeline.progress(0);
        }
        layer.dataset.intro = introFinished ? "complete" : "pending";
      }
      update();
      ready();
    });
    update();
    return () => {
      alive = false;
      stopIdle();
      clearTimeout(loadDeadline);
      cancelAnimationFrame(resetFrame);
      cancelAnimationFrame(frame);
      video.removeEventListener("loadeddata", ready);
      video.removeEventListener("error", failed);
      video.removeEventListener("ended", finishIntro);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", interruptSnap);
      video.removeEventListener("seeked", schedule);
      video.removeEventListener("canplay", schedule);
      delete video.dataset.scrollProgress;
      delete video.dataset.motion;
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
