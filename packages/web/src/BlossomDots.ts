import { COMMANDS } from "@blossom-carousel/navigation";
import { connectNavigation, getForId } from "./navigation";

export class BlossomDots extends HTMLElement {
  private cleanup?: () => void;
  private root?: HTMLDivElement;

  connectedCallback(): void {
    const forId = getForId(this);
    this.root = document.createElement("div");
    this.root.className = "blossom-dots";
    this.root.setAttribute("role", "group");
    this.root.setAttribute("aria-label", "Choose slide to display");
    this.replaceChildren(this.root);

    this.cleanup = connectNavigation(forId, (state) => {
      this.render(state, forId);
    });
  }

  private render(state: { count: number; activeIndex: number }, forId: string): void {
    if (!this.root) return;

    this.root.replaceChildren();
    for (let index = 0; index < state.count; index++) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "blossom-dot";
      button.setAttribute("command", `${COMMANDS.gotoPrefix}${index}`);
      button.setAttribute("commandfor", forId);
      if (state.activeIndex === index) {
        button.setAttribute("aria-current", "true");
      }
      button.setAttribute("aria-label", `Go to slide ${index + 1}`);
      this.root.appendChild(button);
    }
  }

  disconnectedCallback(): void {
    this.cleanup?.();
  }
}

customElements.define("blossom-dots", BlossomDots);
