/** Two deliberate downward gestures advance cards, then native scrolling resumes. */
export function mountCarouselWheelGate(target: HTMLElement, advance: () => void, busy: () => boolean) {
  let lastWheel = 0;
  let advances = 0;
  let released = false;
  const resetOnExit = () => {
    const bounds = target.getBoundingClientRect();
    if (bounds.bottom <= 0 || bounds.top >= innerHeight) {
      advances = 0;
      released = false;
      lastWheel = 0;
    }
  };
  const wheel = (event: WheelEvent) => {
    if (released || event.ctrlKey || event.deltaY <= 0 || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    const bounds = target.getBoundingClientRect();
    // Stop the entering gesture exactly at the full composition, never pull the page back.
    const landingTop = target.matches(".lh-products-stage") ? 0 : 86;
    const remaining = bounds.top - landingTop;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (remaining < -2 || remaining > delta + 2) return;
    if (remaining > 2) {
      event.preventDefault();
      window.scrollBy({ top: remaining, behavior: "instant" });
      lastWheel = performance.now();
      return;
    }
    const now = performance.now();
    const quiet = now - lastWheel > 350;
    lastWheel = now;
    // Finish the second animation and its wheel momentum before handing scrolling back.
    if (advances >= 2 && !busy() && quiet) {
      released = true;
      return;
    }
    event.preventDefault();
    if (advances < 2 && quiet && !busy()) {
      advances += 1;
      advance();
    }
  };
  window.addEventListener("wheel", wheel, { passive: false });
  window.addEventListener("scroll", resetOnExit, { passive: true });
  return () => {
    window.removeEventListener("wheel", wheel);
    window.removeEventListener("scroll", resetOnExit);
  };
}
