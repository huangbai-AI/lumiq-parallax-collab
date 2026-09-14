import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const endingMotionQuery =
  "(min-width: 768px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)";

/** Family photograph entry and its scroll-driven story chapters. */
export function mountEndingChapters(root: HTMLElement) {
  const family = root.querySelector<HTMLElement>("#family");
  const track = family?.querySelector<HTMLElement>(".lh-family-scroll");
  const stage = track?.querySelector<HTMLElement>(".lh-family-anchor");
  const frame = stage?.querySelector<HTMLElement>(".lh-family-stage");
  const heading = stage?.querySelector<HTMLElement>(".lh-family-heading");
  const navigation = stage?.querySelector<HTMLElement>(".lh-chapter-navigation");
  if (!family || !track || !stage || !frame || !heading || !navigation) return () => {};

  const measureNav = () => {
    const height = document.querySelector(".site-nav")?.getBoundingClientRect().height ?? 86;
    root.style.setProperty("--lh-ending-nav", `${height}px`);
  };
  measureNav();
  ScrollTrigger.addEventListener("refreshInit", measureNav);
  const mm = gsap.matchMedia();
  mm.add(endingMotionQuery, () => {
    const elements = [track, stage, frame, heading, navigation];
    const styles = elements.map((element) => element.getAttribute("style"));
    track.dataset.anchored = "true";
    const navHeight = () => parseFloat(root.style.getPropertyValue("--lh-ending-nav"));
    let width = 0;
    let viewport = 0;
    let familyTravel = 0;
    let familyBox = { width: 0, height: 0, top: 0, left: 0 };
    const column = (element: HTMLElement, columnWidth: number) => {
      element.style.width = `${columnWidth}px`;
      element.style.left = `${(width - columnWidth) / 2}px`;
    };
    const measure = () => {
      width = root.clientWidth;
      viewport = window.innerHeight - navHeight();
      const compact = width < 900;
      const gutter = width < 768 ? 24 : Math.max(32, width * 0.045);
      const maxWidth = Math.min(1480, width - gutter * 2);
      column(heading, Math.min(maxWidth, 1100));

      column(navigation, maxWidth);
      const headingHeight = heading.offsetHeight;
      const familyWidth = Math.min(maxWidth, Math.max(200, viewport - headingHeight - navigation.offsetHeight - 92) * 16 / 9);
      column(navigation, familyWidth);
      const familyHeight = familyWidth * 9 / 16;
      const compositionHeight = headingHeight + 24 + familyHeight + 18 + navigation.offsetHeight;
      const headingTop = Math.max(16, (viewport - compositionHeight) * 0.3);
      heading.style.top = `${headingTop}px`;
      familyBox = { width: familyWidth, height: familyHeight, top: headingTop + headingHeight + 24, left: (width - familyWidth) / 2 };
      navigation.style.top = `${familyBox.top + familyHeight + 18}px`;
      const familyHeightTotal = Math.max(viewport, headingTop + compositionHeight + 24);
      stage.style.setProperty("--stage-height", `${familyHeightTotal}px`);
      familyTravel = viewport * (compact ? 2.2 : 2.8);
      track.style.height = `${familyHeightTotal + familyTravel}px`;
    };
    measure();
    ScrollTrigger.addEventListener("refreshInit", measure);

    const fullBleed = {
      width: () => width, height: () => viewport, left: 0, top: 0, "--edge-fade": 1,
    };
    const buttons = Array.from(navigation.querySelectorAll<HTMLElement>('[role="tab"]'));
    const shrinkEnd = 0.36;
    const familyDuration = 1.2;
    const chapterStops = [0, 1, 2].map((index) => (shrinkEnd + ((index + 0.5) / 3) * (1 - shrinkEnd)) / familyDuration);
    let active = -1;
    const render = (progress: number) => {
      const chapters = gsap.utils.clamp(0, 1, (progress - shrinkEnd) / (1 - shrinkEnd));
      const next = Math.min(2, Math.floor(chapters * 3));
      buttons.forEach((button, index) => button.style.setProperty(
        "--chapter-progress", String(gsap.utils.clamp(0, 1, chapters * 3 - index)),
      ));
      if (next === active) return;
      active = next;
      family.dataset.chapter = String(next);
      family.dispatchEvent(new CustomEvent("lumiq:chapter-change", { detail: next }));
    };
    const familyTimeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        id: "home-family-chapters", trigger: track,
        start: () => `top ${navHeight()}`, end: () => `+=${familyTravel}`,
        scrub: 0.45, invalidateOnRefresh: true,
        onUpdate: (self) => render(self.progress * familyDuration),
        onRefresh: (self) => render(self.progress * familyDuration),
      },
    });
    familyTimeline
      .fromTo(frame, fullBleed, {
        width: () => familyBox.width, height: () => familyBox.height,
        left: () => familyBox.left, top: () => familyBox.top,
        "--edge-fade": 0.12, duration: shrinkEnd - 0.03,
      }, 0.03)
      .fromTo(heading, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.26)
      .fromTo(navigation, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.12 }, 0.24)
      .to({}, { duration: familyDuration - shrinkEnd });

    const scroll = familyTimeline.scrollTrigger!;
    const select = (event: Event) => {
      const index = (event as CustomEvent<number>).detail;
      if (!Number.isInteger(index) || index < 0 || index > 2) return;
      const snapping = scroll.getTween(true);
      if (snapping) snapping.kill();
      const progress = chapterStops[index];
      window.scrollTo({ top: scroll.start + progress * (scroll.end - scroll.start), behavior: "instant" });
      ScrollTrigger.update();
      familyTimeline.progress(scroll.progress);
      render(scroll.progress * familyDuration);
    };
    family.addEventListener("lumiq:chapter-select", select);
    render(scroll.progress * familyDuration);
    return () => {
      ScrollTrigger.removeEventListener("refreshInit", measure);
      family.removeEventListener("lumiq:chapter-select", select);
      delete track.dataset.anchored;
      delete family.dataset.chapter;
      buttons.forEach((button) => button.style.removeProperty("--chapter-progress"));
      elements.forEach((element, index) => {
        if (styles[index] === null) element.removeAttribute("style");
        else element.setAttribute("style", styles[index]!);
      });
    };
  });
  return () => {
    mm.revert();
    ScrollTrigger.removeEventListener("refreshInit", measureNav);
    root.style.removeProperty("--lh-ending-nav");
  };
}
