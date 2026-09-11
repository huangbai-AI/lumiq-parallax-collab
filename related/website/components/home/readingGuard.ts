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
    // Capture only once the carousel composition has entered, without snapping scroll position.
    if (bounds.top > 180 || bounds.bottom < innerHeight * .55) return;
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
