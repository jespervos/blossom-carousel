export type CarouselState = {
  scroller: HTMLElement | null;
  end: number;
  isDragging: boolean;
  scrollerScrollWidth: number;
  scrollerWidth: number;
  scrollerScrollHeight: number;
  scrollerHeight: number;
  padding: { start: number; end: number };
  scrollPadding: { start: number; end: number };
  slidePositions: Array<{
    x: number;
    y: number;
    target: HTMLElement | null;
    width: number;
    height: number;
  }>;
  hasSnap: boolean;
  dir: number;
};

export function createState(): CarouselState {
  return {
    scroller: null,
    end: 300,
    isDragging: false,
    scrollerScrollWidth: 300,
    scrollerWidth: 300,
    scrollerScrollHeight: 300,
    scrollerHeight: 300,
    padding: { start: 0, end: 0 },
    scrollPadding: { start: 0, end: 0 },
    slidePositions: [],
    hasSnap: false,
    dir: 1,
  };
}
