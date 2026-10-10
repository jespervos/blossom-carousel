import { Blossom } from "@blossom-carousel/core";
import { createCommands, registerCommands } from "@blossom-carousel/navigation";
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
  private unregisterCommands?: () => void;
  private readonly commands = createCommands(() => this);

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    this.setAttribute("blossom-carousel", "true");
    const slot = document.createElement("slot");
    shadow.appendChild(slot);
  }

  connectedCallback(): void {
    this.unregisterCommands = registerCommands(this);
    this.carouselInstance = Blossom(this, {
      repeat: this.hasAttribute("repeat"),
    });
    this.carouselInstance.init();
  }

  disconnectedCallback(): void {
    this.unregisterCommands?.();
    this.carouselInstance.destroy();
  }

  prev(options?: { behavior?: ScrollBehavior }): void {
    this.commands.prev(options);
  }

  next(options?: { behavior?: ScrollBehavior }): void {
    this.commands.next(options);
  }

  goTo(index: number, options?: { behavior?: ScrollBehavior }): void {
    this.commands.goTo(index, options);
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
