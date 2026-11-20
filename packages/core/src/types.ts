export interface Point {
  x: number;
  y: number;
}

export interface HasOverflow {
  x: boolean;
  y: boolean;
}

export interface SnapPosition {
  target: HTMLElement | null;
  x: number;
  y: number;
  width?: number | undefined;
  height?: number | undefined;
}

export interface CarouselOptions {
  /**
   * @deprecated No longer does anything: core does not loop. Looping is provided
   * by the `repeat` prop/attribute of the framework packages, which works with or
   * without core. Kept so that existing calls still type-check.
   */
  repeat?: boolean;
}

export interface AxisOption {
  axis: "x" | "y";
}

export type AlignOption = "start" | "center" | "end";
