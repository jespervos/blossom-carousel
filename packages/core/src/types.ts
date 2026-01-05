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
  repeat?: boolean;
}

export interface AxisOption {
  axis: "x" | "y";
}

export type AlignOption = "start" | "center" | "end";
