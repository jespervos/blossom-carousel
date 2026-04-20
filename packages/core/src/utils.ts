export function lerp(x: number, y: number, t: number): number {
  return (1 - t) * x + t * y;
}

export function damp(x: number, y: number, t: number, delta: number): number {
  return lerp(x, y, 1 - Math.exp(Math.log(1 - t) * (delta / (1000 / 60))));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
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

export function resolveCSSLength(parent: Element, value: string): number {
  const num = parseFloat(value);
  if (!isNaN(num) && !value.includes("calc")) return num;
  if (value === "auto" || value === "normal" || !value) return 0;
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.visibility = "hidden";
  container.style.width = `${(parent as HTMLElement).clientWidth}px`;
  const temp = document.createElement("div");
  temp.style.width = value;
  container.appendChild(temp);
  document.body.appendChild(container);
  const resolved = temp.getBoundingClientRect().width;
  container.remove();
  return resolved;
}
