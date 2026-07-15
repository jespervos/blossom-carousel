import { mergeDotElement } from "./dotTemplate";

export class BlossomDot extends HTMLElement {
  private button?: HTMLButtonElement;

  connectedCallback(): void {
    const existing = this.querySelector(":scope > button");
    if (existing instanceof HTMLButtonElement) {
      this.button = existing;
      return;
    }

    this.button = document.createElement("button");
    this.button.type = "button";
    while (this.firstChild) {
      this.button.appendChild(this.firstChild);
    }
    this.appendChild(this.button);
  }

  applyNavigation(index: number, active: boolean, forId: string): void {
    if (!this.button) this.connectedCallback();
    if (this.button) mergeDotElement(this.button, index, active, forId);
  }
}

customElements.define("blossom-dot", BlossomDot);
