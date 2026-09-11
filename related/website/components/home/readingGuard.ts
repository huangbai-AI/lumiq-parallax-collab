/** Two deliberate downward gestures advance cards, then native scrolling resumes. */
export function mountCarouselWheelGate(target: HTMLElement, advance: () => void, busy: () => boolean) {
  let lastWheel = 0;
  let lastDownInput = -Infinity;
  let advances = 0;
  let released = false;
  let locked = false;
  let holdY = 0;
  const landingTop = target.matches(".lh-products-stage") ? 0 : 86;
  let previousTop = target.getBoundingClientRect().top - landingTop;
  const hold = () => {
    holdY = scrollY + target.getBoundingClientRect().top - landingTop;
    locked = true;
    window.scrollTo({ top: holdY, behavior: "instant" });
  };
  const resetOnExit = () => {
    const bounds = target.getBoundingClientRect();
    if (bounds.bottom <= 0 || bounds.top >= innerHeight) {
      advances = 0;
      released = false;
      lastWheel = 0;
      locked = false;
    }
    if (locked && scrollY < holdY - 2) locked = false;
    const top = bounds.top - landingTop;
    // Native wheel momentum can finish after the wheel callback. Latch the landing,
    // rather than losing the gate when that final movement overshoots by a few pixels.
    if (performance.now() - lastDownInput < 250 && !released && !locked && previousTop > 2 && top <= 2 && top > -innerHeight * .5) hold();
    if (locked && !released && scrollY > holdY + 1) window.scrollTo({ top: holdY, behavior: "instant" });
    previousTop = top;
  };
  const wheel = (event: WheelEvent) => {
    if (event.deltaY < 0) { locked = false; return; }
    if (released || event.ctrlKey || event.deltaY <= 0 || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    lastDownInput = performance.now();
    const bounds = target.getBoundingClientRect();
    // Stop the entering gesture exactly at the full composition, never pull the page back.
    const remaining = bounds.top - landingTop;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (!locked && (remaining < -120 || remaining > delta + 2)) return;
    if (!locked && Math.abs(remaining) > 2) {
      event.preventDefault();
      hold();
      lastWheel = performance.now();
      return;
    }
    if (!locked) hold();
    const now = performance.now();
    const quiet = now - lastWheel > 350;
    lastWheel = now;
    // Finish the second animation and its wheel momentum before handing scrolling back.
    if (advances >= 2 && !busy() && quiet) {
      released = true;
      locked = false;
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
