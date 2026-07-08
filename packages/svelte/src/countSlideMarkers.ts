import { SLIDE_ATTR } from "@blossom-carousel/navigation";

/**
 * Counts elements carrying the `data-blossom-slide` attribute in an HTML
 * string (the server-rendered output of a carousel's children snippet).
 *
 * A small tag-aware scanner rather than a bare regex, so that:
 * - text content that happens to contain the literal attribute name is not
 *   counted,
 * - a `>` inside a quoted attribute value does not truncate the tag,
 * - comments are skipped.
 */
export function countSlideMarkers(html: string): number {
  let count = 0;
  let i = 0;

  while (i < html.length) {
    if (html[i] !== "<") {
      i++;
      continue;
    }

    if (html.startsWith("<!--", i)) {
      const end = html.indexOf("-->", i + 4);
      if (end === -1) break;
      i = end + 3;
      continue;
    }

    // Only element open tags can carry attributes; skip closing tags,
    // doctype, and stray `<` in text.
    if (!/[a-zA-Z]/.test(html[i + 1] ?? "")) {
      i++;
      continue;
    }

    i++;
    while (i < html.length && !/[\s/>]/.test(html[i])) i++; // tag name

    let marked = false;
    while (i < html.length && html[i] !== ">") {
      const char = html[i];

      if (char === '"' || char === "'") {
        const closing = html.indexOf(char, i + 1);
        if (closing === -1) return count; // malformed; bail out
        i = closing + 1;
        continue;
      }

      if (char === "=") {
        // Skip the value. Quoted values are handled by the branch above on
        // the next iteration; unquoted values run to whitespace or `>`.
        i++;
        while (i < html.length && /\s/.test(html[i])) i++;
        if (html[i] !== '"' && html[i] !== "'") {
          while (i < html.length && !/[\s>]/.test(html[i])) i++;
        }
        continue;
      }

      if (/[\s/]/.test(char)) {
        i++;
        continue;
      }

      const start = i;
      while (i < html.length && !/[\s/=>]/.test(html[i])) i++;
      if (html.slice(start, i) === SLIDE_ATTR) marked = true;
    }

    if (marked) count++;
    i++;
  }

  return count;
}
