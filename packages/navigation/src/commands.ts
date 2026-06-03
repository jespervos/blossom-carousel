import { pageScroll } from "./scroll";
import { getMarkerTargets } from "./markers";

/** Custom Invoker command names. Custom commands must be `--`-prefixed. */
export const COMMANDS = {
  prev: "--blossom-prev",
  next: "--blossom-next",
  /** Goto commands are `--blossom-goto-<index>`. */
  gotoPrefix: "--blossom-goto-",
} as const;

const COMMAND_NAMESPACE = "--blossom-";
const REGISTRY = Symbol.for("blossom-carousel.navigation.registry");

interface Registration {
  count: number;
  handler: EventListener;
}

type WithRegistry = HTMLElement & { [REGISTRY]?: Registration };

function runCommand(scroller: HTMLElement, command: string): void {
  if (command === COMMANDS.prev) {
    pageScroll(scroller, "prev");
  } else if (command === COMMANDS.next) {
    pageScroll(scroller, "next");
  } else if (command.startsWith(COMMANDS.gotoPrefix)) {
    const index = Number.parseInt(
      command.slice(COMMANDS.gotoPrefix.length),
      10,
    );
    if (Number.isNaN(index)) return;
    const target = getMarkerTargets(scroller)[index];
    target?.scrollIntoView({
      block: "nearest",
      inline: "start",
      behavior: "smooth",
    });
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
    const command =
      (event as { command?: string }).command ??
      (event as CustomEvent<{ command?: string }>).detail?.command;
    if (typeof command === "string" && command.startsWith(COMMAND_NAMESPACE)) {
      runCommand(scroller, command);
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
      new CustomEvent("command", { bubbles: false, detail: { command } }),
    );
  });
}
