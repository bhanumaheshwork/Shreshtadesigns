import type { LenisOptions } from 'lenis';
import { CEREMONY_SLIDES } from '../data/ceremonies';

const SLIDE_COUNT = CEREMONY_SLIDES.length;
const WHEEL_GAP_MS = 140;
const SWIPE_THRESHOLD = 18;
export const CEREMONY_SCROLL_DURATION = 0.72;

export function ceremonyStep(showcase: HTMLElement, stage: HTMLElement) {
  return Math.max(1, (showcase.offsetHeight - stage.offsetHeight) / SLIDE_COUNT);
}

export function ceremonyScrollInput(
  showcase: HTMLElement,
  stage: HTMLElement,
  getScrollTarget: () => number,
  scrollTo: (target: number) => void,
): NonNullable<LenisOptions['virtualScroll']> {
  let wheelTime = -Infinity;
  let wheelDirection = 0;
  let wheelHandled = false;
  let touchDistance = 0;
  let touchHandled = false;
  let requestedPosition: number | undefined;
  let requestedAt = -Infinity;

  return ({ deltaX, deltaY, event }) => {
    const wheel = event instanceof WheelEvent;
    if (wheel && event.ctrlKey) return true;
    if (!wheel && (event as TouchEvent).touches.length > 1) return true;
    if (event.type === 'touchstart') {
      touchDistance = 0;
      touchHandled = false;
      return true;
    }

    const direction = Math.sign(deltaY);
    if (wheel) {
      const reversed = wheelDirection !== 0 && wheelDirection !== direction && Math.abs(deltaY) >= 12;
      if (event.timeStamp - wheelTime > WHEEL_GAP_MS || reversed) wheelHandled = false;
      wheelTime = event.timeStamp;
      if (Math.abs(deltaY) >= 12) wheelDirection = direction;
    }

    if (wheel ? wheelHandled : touchHandled) {
      if (event.cancelable) event.preventDefault();
      return false;
    }

    if ((!wheel && event.type !== 'touchmove') || !event.cancelable || Math.abs(deltaY) <= Math.abs(deltaX)) {
      return true;
    }

    const scroll = window.scrollY;
    const start = showcase.getBoundingClientRect().top + scroll;
    const step = ceremonyStep(showcase, stage);
    const end = start + SLIDE_COUNT * step;
    const projected = (wheel ? getScrollTarget() : scroll) + deltaY;
    const advancing = event.timeStamp - requestedAt < CEREMONY_SCROLL_DURATION * 1000;
    const position = advancing ? requestedPosition ?? scroll : scroll;
    const stops = Array.from({ length: SLIDE_COUNT }, (_, index) =>
      start + (index === 0 ? 0 : index + 0.12) * step,
    );

    let next: number | undefined;
    if (position < start - 2 && direction > 0 && projected >= start - 2) {
      next = stops[0];
    } else if (position > end && direction < 0 && projected <= end) {
      next = stops.at(-1);
    } else if (position >= start - 2 && position <= end) {
      next = direction > 0
        ? stops.find((stop) => stop > position + 2)
        : stops.reverse().find((stop) => stop < position - 2);
    }
    if (next === undefined) return true;

    event.preventDefault();
    if (wheel) {
      wheelDirection = direction;
      wheelHandled = true;
    } else {
      touchDistance += deltaY;
      if (Math.abs(touchDistance) < SWIPE_THRESHOLD) return false;
      touchHandled = true;
    }
    requestedPosition = next;
    requestedAt = event.timeStamp;
    scrollTo(next);
    return false;
  };
}
