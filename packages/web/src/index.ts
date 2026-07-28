import { Blossom } from "@blossom-carousel/core";
import "./style.css";
import "./BlossomPrev";
import "./BlossomNext";
import "./BlossomDot";
import "./BlossomDots";
import "./BlossomDots.css";

const HTMLElementBase: typeof HTMLElement =
  typeof HTMLElement === "undefined"
    ? (class {} as unknown as typeof HTMLElement)
    : HTMLElement;

export class BlossomCarousel extends HTMLElementBase {
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

  prev(options: { align: string }): void {
    this.carouselInstance.prev(options);
  }

  next(options: { align: string }): void {
    this.carouselInstance.next(options);
  }
}

if (
  typeof customElements !== "undefined" &&
  !customElements.get("blossom-carousel")
) {
  customElements.define("blossom-carousel", BlossomCarousel);
}

export { BlossomPrev } from "./BlossomPrev";
export { BlossomNext } from "./BlossomNext";
export { BlossomDot } from "./BlossomDot";
export { BlossomDots } from "./BlossomDots";
