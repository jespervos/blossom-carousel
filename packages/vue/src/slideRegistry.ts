import type { App } from "vue";

const REGISTRY_KEY = Symbol.for("blossom-carousel.slideCounts");

type SlideCountRegistry = Map<string, number>;

type AppWithRegistry = App & {
  [REGISTRY_KEY]?: SlideCountRegistry;
};

function getRegistry(app: App): SlideCountRegistry {
  const scoped = app as AppWithRegistry;
  if (!scoped[REGISTRY_KEY]) {
    scoped[REGISTRY_KEY] = new Map();
  }
  return scoped[REGISTRY_KEY];
}

/** Registers a slide count for a carousel id on the current Vue app instance. */
export function setSlideCount(app: App, id: string, count: number): void {
  getRegistry(app).set(id, count);
}

/** Returns the registered slide count for a carousel id, or 0 when unknown. */
export function getSlideCount(app: App, id: string | undefined): number {
  if (!id) return 0;
  return getRegistry(app).get(id) ?? 0;
}
