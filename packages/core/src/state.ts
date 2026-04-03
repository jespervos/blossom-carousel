export type CarouselState = {
  scroller: HTMLElement | null;
  end: number;
  endY: number;
  isDragging: boolean;
  scrollerScrollWidth: number;
  scrollerWidth: number;
  scrollerScrollHeight: number;
  scrollerHeight: number;
  padding: { start: number; end: number };
  paddingBlock: { start: number; end: number };
  scrollPadding: { start: number; end: number };
  scrollPaddingBlock: { start: number; end: number };
  slidePositions: Array<{
    x: number;
    y: number;
    target: HTMLElement | null;
    width: number;
    height: number;
  }>;
  hasSnap: boolean;
  snapMandatory?: boolean;
  dir: number;
};

export function createState(): CarouselState {
  return {
    scroller: null,
    end: 300,
    endY: 300,
    isDragging: false,
    scrollerScrollWidth: 300,
    scrollerWidth: 300,
    scrollerScrollHeight: 300,
    scrollerHeight: 300,
    padding: { start: 0, end: 0 },
    paddingBlock: { start: 0, end: 0 },
    scrollPadding: { start: 0, end: 0 },
    scrollPaddingBlock: { start: 0, end: 0 },
    slidePositions: [],
    hasSnap: false,
    snapMandatory: false,
    dir: 1,
  };
}
