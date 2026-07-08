import { describe, expect, it } from "vitest";
import { countSlideMarkers } from "../src/countSlideMarkers.js";

describe("countSlideMarkers", () => {
  it("counts elements carrying the marker attribute", () => {
    expect(
      countSlideMarkers(
        `<ul><li data-blossom-slide>1</li><li data-blossom-slide="">2</li><li data-blossom-slide="true">3</li></ul>`,
      ),
    ).toBe(3);
  });

  it("returns 0 when nothing is marked", () => {
    expect(countSlideMarkers(`<ul><li>1</li><li>2</li></ul>`)).toBe(0);
  });

  it("counts nested marked elements individually", () => {
    expect(
      countSlideMarkers(
        `<div data-blossom-slide><span data-blossom-slide></span></div>`,
      ),
    ).toBe(2);
  });

  it("ignores the attribute name appearing in text content", () => {
    expect(
      countSlideMarkers(
        `<li data-blossom-slide><p>data-blossom-slide is the marker attribute</p></li>`,
      ),
    ).toBe(1);
  });

  it("ignores markers inside comments", () => {
    expect(countSlideMarkers(`<!-- <li data-blossom-slide>1</li> -->`)).toBe(0);
  });

  it("is not confused by > inside quoted attribute values", () => {
    expect(
      countSlideMarkers(`<img alt="a > b" data-blossom-slide><img alt="c > d">`),
    ).toBe(1);
  });

  it("does not match attributes that merely share the prefix", () => {
    expect(countSlideMarkers(`<li data-blossom-slider>1</li>`)).toBe(0);
  });

  it("handles self-closing tags", () => {
    expect(countSlideMarkers(`<img data-blossom-slide/><br/>`)).toBe(1);
  });

  it("handles single-quoted and unquoted attribute values", () => {
    expect(
      countSlideMarkers(`<li class='a "quoted"' data-blossom-slide id=x>1</li>`),
    ).toBe(1);
  });
});
