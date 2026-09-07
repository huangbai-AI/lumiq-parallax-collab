/** Start the whole upcoming scene, including horizontally hidden products and
 * inactive family images, before it reaches the viewport. Native lazy loading
 * cannot reliably predict a pinned/transformed scene's future position. */
export function preloadScenes(root: HTMLElement) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.querySelectorAll<HTMLImageElement>("img[data-home-image]")
        .forEach(image => { image.loading = "eager"; });
      observer.unobserve(entry.target);
    }
  }, { rootMargin: "1800px 0px" });
  root.querySelectorAll("[data-home-section]").forEach(section => observer.observe(section));
  return () => observer.disconnect();
}
