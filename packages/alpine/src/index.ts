import { Blossom, type CarouselOptions } from "@blossom-carousel/core";
import type { Alpine } from "alpinejs";

export default function blossomCarousel(Alpine: Alpine) {
  Alpine.data("carousel", (options: CarouselOptions & { load?: 'always' } = {}) => ({
    blossom: null as ReturnType<typeof Blossom> | null,

    init() {
      // Set the blossom-carousel attribute
      this.$el.setAttribute("blossom-carousel", "true");

      // Check if should load based on media query
      const hasMouse = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
      ).matches;

      // Don't load if the user has no mouse (unless load: 'always')
      if (!hasMouse && options.load !== "always") {
        return;
      }

      this.blossom = Blossom(this.$el, options);
      this.blossom.init();
    },

    destroy() {
      this.blossom?.destroy();
    },
  }));
}
