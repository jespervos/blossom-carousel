import { pageScroll } from "./scroll";
import { getMarkerTargets } from "./markers";
import { resolveInlineAlign } from "./snap";
import { getSnapCache } from "./cache";

const COMMAND_NAMESPACE = "--blossom-";
export const COMMANDS = {
  prev: `${COMMAND_NAMESPACE}prev`,
  next: `${COMMAND_NAMESPACE}next`,
  gotoPrefix: `${COMMAND_NAMESPACE}goto-`,
} as const;

/** Set on the button that invokes a command to override its scroll behavior. */
export const BEHAVIOR_ATTR = "data-blossom-behavior";

export interface CommandOptions {
  behavior?: ScrollBehavior;
}

/**
 * Sends a Blossom command to a scroller. The scroller's command handler
 * performs the scroll, so listeners of the `command` event see the same
 * event a navigation button would dispatch.
 */
export function invoke(
  scroller: HTMLElement | null | undefined,
  command: string,
  options: CommandOptions = {},
): void {
  scroller?.dispatchEvent(
    new CustomEvent("command", {
      bubbles: false,
      detail: { command, ...options },
    }),
  );
}

/** Commands bound to whichever scroller `getScroller` returns at call time. */
export function createCommands(
  getScroller: () => HTMLElement | null | undefined,
) {
  return {
    prev: (options?: CommandOptions) =>
      invoke(getScroller(), COMMANDS.prev, options),
    next: (options?: CommandOptions) =>
      invoke(getScroller(), COMMANDS.next, options),
    goTo: (index: number, options?: CommandOptions) =>
      invoke(getScroller(), `${COMMANDS.gotoPrefix}${index}`, options),
  };
}

function commandBehavior(value: unknown): ScrollBehavior | undefined {
  return value === "auto" || value === "smooth" || value === "instant"
    ? value
    : undefined;
}

function behaviorFrom(event: Event): ScrollBehavior {
  const detail = (
    event as CustomEvent<{ behavior?: unknown; source?: Element | null }>
  ).detail;
  const explicit = commandBehavior(detail?.behavior);
  if (explicit) return explicit;

  const source =
    (event as { source?: Element | null }).source ?? detail?.source ?? null;
  return commandBehavior(source?.getAttribute?.(BEHAVIOR_ATTR)) ?? "smooth";
}

const REGISTRY = Symbol.for("blossom-carousel.navigation.registry");

interface Registration {
  count: number;
  handler: EventListener;
}

type WithRegistry = HTMLElement & { [REGISTRY]?: Registration };

function runCommand(
  scroller: HTMLElement,
  command: string,
  behavior: ScrollBehavior,
): void {
  if (command === COMMANDS.prev) {
    pageScroll(scroller, "prev", behavior);
  } else if (command === COMMANDS.next) {
    pageScroll(scroller, "next", behavior);
  } else if (command.startsWith(COMMANDS.gotoPrefix)) {
    const index = Number.parseInt(
      command.slice(COMMANDS.gotoPrefix.length),
      10,
    );
    if (Number.isNaN(index) || index < 0) return;

    // Prefer the cache, but ignore a stale entry whose element has been detached
    // (a slide removed before the cache refresh runs) and read live instead.
    const cached = getSnapCache(scroller)?.markers[index];
    const fresh = cached?.el.isConnected ? cached : undefined;
    const target = fresh?.el ?? getMarkerTargets(scroller)[index];
    if (!target) return;

    const inline =
      fresh?.align ?? resolveInlineAlign(getComputedStyle(target).scrollSnapAlign);
    target.scrollIntoView({ block: "nearest", inline, behavior });
  }
}

/**
 * Attaches a single `command` listener to a scroller that handles the Blossom
 * navigation commands using native scroll APIs only (no Blossom instance).
 *
 * The native `command` event does not bubble, so the listener must live on the
 * target element itself. Registration is idempotent and ref-counted so multiple
 * controls pointing at the same scroller share one handler; the returned cleanup
 * detaches the handler once the last control releases it.
 */
export function registerCommands(scroller: HTMLElement): () => void {
  installFallback();

  const el = scroller as WithRegistry;
  const existing = el[REGISTRY];
  if (existing) {
    existing.count++;
    return () => release(el);
  }

  const handler: EventListener = (event) => {
    const detail = (event as CustomEvent<{ command?: string }>).detail;
    const command =
      (event as { command?: string }).command ?? detail?.command;
    if (typeof command === "string" && command.startsWith(COMMAND_NAMESPACE)) {
      runCommand(scroller, command, behaviorFrom(event));
    }
  };

  scroller.addEventListener("command", handler);
  el[REGISTRY] = { count: 1, handler };

  return () => release(el);
}

function release(el: WithRegistry): void {
  const registration = el[REGISTRY];
  if (!registration) return;
  registration.count--;
  if (registration.count <= 0) {
    el.removeEventListener("command", registration.handler);
    delete el[REGISTRY];
  }
}

/**
 * Manual fallback for engines without the Invoker Commands API: delegate clicks
 * on `button[commandfor]` and dispatch a synthetic `command` event on the
 * target, matching the native event shape. Installed once, only when needed.
 */
let fallbackInstalled = false;
function installFallback(): void {
  if (fallbackInstalled || typeof document === "undefined") return;
  fallbackInstalled = true;

  const supportsInvokers =
    typeof HTMLButtonElement !== "undefined" &&
    "commandForElement" in HTMLButtonElement.prototype;
  if (supportsInvokers) return;

  document.addEventListener("click", (event) => {
    const button = (event.target as Element | null)?.closest?.(
      "button[commandfor]",
    ) as HTMLButtonElement | null;
    if (!button) return;

    const id = button.getAttribute("commandfor");
    const command = button.getAttribute("command");
    if (!id || !command) return;

    const target = document.getElementById(id);
    target?.dispatchEvent(
      new CustomEvent("command", {
        bubbles: false,
        detail: { command, source: button },
      }),
    );
  });
}
