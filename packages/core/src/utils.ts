export function lerp(x: number, y: number, t: number): number {
  return (1 - t) * x + t * y;
}

export function damp(x: number, y: number, t: number, delta: number): number {
  return lerp(x, y, 1 - Math.exp(Math.log(1 - t) * (delta / (1000 / 60))));
}

export function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  } else if (value > max) {
    return max;
  }

  return value;
}

export function round(value: number, precision: number = 0): number {
  const multiplier = Math.pow(10, precision);
  return Math.round(value * multiplier) / multiplier;
}

export function project(
  target: number,
  velocity: number,
  friction: number
): number {
  return target + velocity / (1 - friction);
}
