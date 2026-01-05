import { Blossom } from "@blossom-carousel/core";
import "./style.css";

export class BlossomCarousel extends HTMLElement {
  private carouselInstance!: ReturnType<typeof Blossom>;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    this.setAttribute("blossom-carousel", "true");
    const slot = document.createElement("slot");
    shadow.appendChild(slot);
  }

  connectedCallback(): void {
    this.carouselInstance = Blossom(this, {
      repeat: this.hasAttribute("repeat"),
    });
    this.carouselInstance.init();
  }

  disconnectedCallback(): void {
    this.carouselInstance.destroy();
  }

  prev(options?: unknown): void {
    this.carouselInstance.prev(options);
  }

  next(options?: unknown): void {
    this.carouselInstance.next(options);
  }
}

customElements.define("blossom-carousel", BlossomCarousel);
