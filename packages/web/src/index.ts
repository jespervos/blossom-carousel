import { Blossom } from "@blossom-carousel/core";
import { createCommands, registerCommands } from "@blossom-carousel/navigation";
import { createRepeat, type Repeat } from "@blossom-carousel/repeat";
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
  static observedAttributes = ["repeat"];

  private carouselInstance!: ReturnType<typeof Blossom>;
  private unregisterCommands?: () => void;
  private looping?: Repeat;
  private connected = false;
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
    this.carouselInstance = Blossom(this, {}); // options are required before core 1.1.10
    this.carouselInstance.init();
    this.connected = true;
    this.updateRepeat();
  }

  disconnectedCallback(): void {
    this.connected = false;
    this.updateRepeat();
    this.unregisterCommands?.();
    this.carouselInstance.destroy();
  }

  attributeChangedCallback(): void {
    // Also called on upgrade, before connectedCallback: that one starts it.
    if (this.connected) this.updateRepeat();
  }

  /** Looping (the `repeat` attribute) works on the element itself, beside core. */
  private updateRepeat(): void {
    const on = this.connected && this.hasAttribute("repeat");
    if (on === !!this.looping) return;
    this.looping?.destroy();
    this.looping = on ? createRepeat(this) : undefined;
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
