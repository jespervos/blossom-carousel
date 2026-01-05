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
}

export interface CarouselOptions {
  repeat?: boolean;
}

export interface AxisOption {
  axis: "x" | "y";
}
