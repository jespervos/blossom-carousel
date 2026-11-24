import { Blossom } from "@blossom-carousel/core";

const carousel = Blossom(document.body, { repeat: true });
carousel.init();
carousel.next({ align: "center" });

// Each `@ts-expect-error` fails the build if the import silently resolved to `any`.
// @ts-expect-error unknown option
Blossom(document.body, { invalidOption: true });
// @ts-expect-error unknown method
carousel.missing();

export const overflow: boolean = carousel.hasOverflow.x;
