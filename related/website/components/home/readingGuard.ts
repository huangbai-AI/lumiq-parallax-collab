/** Two deliberate downward gestures advance cards, then native scrolling resumes. */
export function mountCarouselWheelGate(target: HTMLElement, advance: () => void, busy: () => boolean) {
  let lastWheel = -Infinity;
  let lastGesture = -Infinity;
  let lastDelta = 0;
  let requested = 0;
  let pendingExit = 0;
  let pumpTimer: ReturnType<typeof setTimeout> | undefined;
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
    target.dataset.wheelLocked = "true";
    window.scrollTo({ top: holdY, behavior: "instant" });
  };
  const unlock = () => {
    locked = false;
    delete target.dataset.wheelLocked;
  };
  const pump = () => {
    clearTimeout(pumpTimer);
    if (released || !locked) return;
    if (busy()) {
      pumpTimer = setTimeout(pump, 30);
      return;
    }
    if (advances < Math.min(requested, 2)) {
      advance();
      advances += 1;
      pumpTimer = setTimeout(pump, 30);
    } else if (requested >= 3) {
      released = true;
      unlock();
      window.scrollBy({ top: pendingExit, behavior: "smooth" });
    }
  };
  const resetOnExit = () => {
    const bounds = target.getBoundingClientRect();
    if (bounds.bottom <= 0 || bounds.top >= innerHeight) {
      advances = 0;
      released = false;
      lastWheel = lastGesture = -Infinity;
      requested = advances = pendingExit = 0;
      clearTimeout(pumpTimer);
      unlock();
    }
    if (locked && scrollY < holdY - 2) { clearTimeout(pumpTimer); requested = advances; unlock(); }
    const top = bounds.top - landingTop;
    // Native wheel momentum can finish after the wheel callback. Latch the landing,
    // rather than losing the gate when that final movement overshoots by a few pixels.
    if (performance.now() - lastDownInput < 250 && !released && !locked && previousTop > 2 && top <= 2 && top > -innerHeight * .5) hold();
    if (locked && !released && scrollY > holdY + 1) window.scrollTo({ top: holdY, behavior: "instant" });
    previousTop = top;
  };
  const wheel = (event: WheelEvent) => {
    if (event.deltaY < 0) { clearTimeout(pumpTimer); requested = advances; unlock(); return; }
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
    // A short gesture gap accepts ordinary mouse notches. Equal, strong wheel
    // pulses also count separately; a decaying trackpad tail stays one gesture.
    const gesture = now - lastWheel > 140 ||
      (delta >= 80 && Math.abs(delta - lastDelta) < 1 && now - lastGesture >= 80);
    lastWheel = now;
    lastDelta = delta;
    event.preventDefault();
    if (gesture) {
      lastGesture = now;
      requested = Math.min(3, requested + 1);
      if (requested === 3) pendingExit = Math.max(80, delta);
      pump();
    }
  };
  window.addEventListener("wheel", wheel, { passive: false });
  window.addEventListener("scroll", resetOnExit, { passive: true });
  return () => {
    clearTimeout(pumpTimer);
    unlock();
    window.removeEventListener("wheel", wheel);
    window.removeEventListener("scroll", resetOnExit);
  };
}
