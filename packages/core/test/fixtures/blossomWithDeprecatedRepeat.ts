import { Blossom } from "../../src/index";

// `repeat` is a deprecated no-op: existing calls must keep type-checking.
const blossom = Blossom(document.createElement("div"), { repeat: true });
blossom.init();
blossom.destroy();
