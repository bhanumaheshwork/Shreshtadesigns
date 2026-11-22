import type Lenis from 'lenis';
import type { LenisOptions } from 'lenis';
import { CEREMONY_SLIDES } from '../data/ceremonies';

const SLIDE_COUNT = CEREMONY_SLIDES.length;
const WHEEL_GAP_MS = 140;
const SWIPE_THRESHOLD = 18;
const SCROLL_DURATION = 0.72;
export const CEREMONY_STOPS = CEREMONY_SLIDES.map((_, index) => (index ? index + 0.12 : 0) / SLIDE_COUNT);
export const MANDAP_STOPS = [0.24, 0.55, 0.86];

export function ceremonyStep(showcase: HTMLElement, stage: HTMLElement) {
  return Math.max(1, (showcase.offsetHeight - stage.offsetHeight) / SLIDE_COUNT);
}

interface ScrollScene {
  track: HTMLElement;
  stage: HTMLElement;
  stops: number[];
  enabled?: MediaQueryList;
}

export function sceneScrollInput(
  scenes: ScrollScene[],
  getLenis: () => Lenis,
): NonNullable<LenisOptions['virtualScroll']> {
  let wheelTime = -Infinity;
  let wheelDirection = 0;
  let wheelHandled = false;
  let touchDistance = 0;
  let touchHandled = false;
  let pinching = false;
  let requestedPosition: number | undefined;
  let requestedAt = -Infinity;

  return ({ deltaX, deltaY, event }) => {
    const wheel = event instanceof WheelEvent;
    if (wheel && event.ctrlKey) return true;
    if (!wheel) {
      const { touches } = event as TouchEvent;
      if (touches.length > 1) pinching = true;
      if (pinching) {
        if (touches.length === 0) pinching = false;
        return false;
      }
    }
    const lenis = getLenis();
    const scroll = window.scrollY;
    const advancing = event.timeStamp - requestedAt < SCROLL_DURATION * 1000;

    if (event.type === 'touchstart') {
      touchDistance = 0;
      touchHandled = false;
      // Take over the pan before the browser commits to native momentum near a pinned scene.
      lenis.options.syncTouch = scenes.some(({ track, enabled }) => {
        if (enabled && !enabled.matches) return false;
        const { top, bottom } = track.getBoundingClientRect();
        return top < 2 * window.innerHeight && bottom > -window.innerHeight;
      });
      return !advancing;
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

    const projected = lenis.targetScroll + deltaY;
    const position = advancing ? requestedPosition ?? scroll : scroll;
    let next: number | undefined;
    for (const scene of direction > 0 ? scenes : [...scenes].reverse()) {
      if (scene.enabled && !scene.enabled.matches) continue;
      const start = scene.track.getBoundingClientRect().top + scroll;
      const distance = scene.track.offsetHeight - scene.stage.offsetHeight;
      if (distance <= 0) continue;
      const end = start + distance;
      const stops = scene.stops.map((fraction) => start + fraction * distance);
      if (position < start - 2 && direction > 0 && projected >= start - 2) {
        next = stops[0];
      } else if (position > end && direction < 0 && projected <= end) {
        next = stops.at(-1);
      } else if (position >= start - 2 && position <= end) {
        next = direction > 0
          ? stops.find((stop) => stop > position + 2)
          : stops.reverse().find((stop) => stop < position - 2);
      }
      if (next !== undefined) break;
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
    lenis.scrollTo(next, {
      duration: SCROLL_DURATION,
      easing: (progress) => 0.5 - Math.cos(Math.PI * progress) / 2,
    });
    return false;
  };
}
