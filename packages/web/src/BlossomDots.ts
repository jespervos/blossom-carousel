import { connectNavigation, getForId } from "./navigation";
import {
  cloneDotFromPrototype,
  createDefaultDot,
  findDotPrototype,
  patchDotElement,
  renderCustomDot,
  type RenderDot,
} from "./dotTemplate";

const HTMLElementBase: typeof HTMLElement =
  typeof HTMLElement === "undefined"
    ? (class {} as unknown as typeof HTMLElement)
    : HTMLElement;

export class BlossomDots extends HTMLElementBase {
  private cleanup?: () => void;
  private dotPrototype?: Element | null;
  private forId = "";
  private lastState?: { count: number; activeIndex: number };
  private _renderDot?: RenderDot;

  /**
   * Consumer-supplied callback for building a dot's content per index,
   * mirroring the index/active render-prop in the React/Vue/Svelte packages.
   * When set, it takes over from the `<blossom-dot>` prototype-clone path.
   */
  get renderDot(): RenderDot | undefined {
    return this._renderDot;
  }

  set renderDot(fn: RenderDot | undefined) {
    this._renderDot = fn;
    if (this.lastState) this.render(this.lastState, this.forId, true);
  }

  connectedCallback(): void {
    this.forId = getForId(this);
    this.dotPrototype = findDotPrototype(this);

    this.setAttribute("data-blossom-dots", "");
    this.setAttribute("role", "group");
    this.setAttribute("aria-label", "Choose slide to display");

    this.clearDots();

    this.cleanup = connectNavigation(this.forId, (state) => {
      this.render(state, this.forId);
    });
  }

  private getDotChildren(): Element[] {
    return [...this.children].filter((child) => child !== this.dotPrototype);
  }

  private clearDots(): void {
    for (const child of [...this.childNodes]) {
      if (child instanceof Element && child === this.dotPrototype) continue;
      child.remove();
    }
  }

  private render(
    state: { count: number; activeIndex: number },
    forId: string,
    force = false,
  ): void {
    const prev = this.lastState;
    this.lastState = state;

    if (
      !force &&
      prev?.count === state.count &&
      prev.activeIndex === state.activeIndex
    ) {
      return;
    }

    const children = this.getDotChildren();

    if (
      !force &&
      prev?.count === state.count &&
      children.length === state.count
    ) {
      this.patchActive(prev.activeIndex, state, forId, children);
      return;
    }

    this.clearDots();

    for (let index = 0; index < state.count; index++) {
      const active = state.activeIndex === index;
      this.appendChild(this.renderDotAt(index, active, forId));
    }
  }

  private patchActive(
    prevActiveIndex: number,
    state: { count: number; activeIndex: number },
    forId: string,
    children: Element[],
  ): void {
    const activeChanged = new Set([prevActiveIndex, state.activeIndex]);

    for (let index = 0; index < state.count; index++) {
      const active = state.activeIndex === index;
      const child = children[index];
      if (!child) continue;

      if (this._renderDot) {
        if (!activeChanged.has(index)) continue;
        child.replaceWith(this.renderDotAt(index, active, forId));
        continue;
      }

      patchDotElement(child, index, active, forId);
    }
  }

  private renderDotAt(index: number, active: boolean, forId: string): Node {
    if (this._renderDot) {
      return renderCustomDot(this._renderDot, index, active, forId);
    }
    if (this.dotPrototype) {
      return cloneDotFromPrototype(this.dotPrototype, index, active, forId);
    }
    return createDefaultDot(index, active, forId);
  }

  disconnectedCallback(): void {
    this.cleanup?.();
  }
}

if (
  typeof customElements !== "undefined" &&
  !customElements.get("blossom-dots")
) {
  customElements.define("blossom-dots", BlossomDots);
}
