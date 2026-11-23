// Both sticky slideshows use the same gesture cadence. The cooldown starts with the wipe.
const TRANSITION_MS = 970;
const COOLDOWN_MS = 1120;
const WHEEL_IDLE_MS = 180;
const GESTURE_THRESHOLD = 24;
const HORIZONTAL_SWIPE_THRESHOLD = 28;

type RenderSlide = (from: number, to: number, progress: number) => void;

export function bindSlideTrack(
  track: HTMLElement,
  panel: HTMLElement,
  count: number,
  render: RenderSlide,
  movePage: (top: number) => void,
) {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const last = count - 1;
  let index = -1;
  let visible = 0;
  let frame = 0;
  let readyAt = 0;
  let wheelTime = -Infinity;
  let wheelDistance = 0;
  let wheelAxis: 'x' | 'y' | null = null;
  let wheelUsed = false;
  let touchStart: { x: number; y: number } | undefined;
  let touchAxis: 'x' | 'y' | null = null;
  let touchOrigin = 0;
  let touchUsed = false;
  let lastInputWasTouch = false;
  let entryDirection = 0;
  let entryTime = 0;
  let touchEntry: number | undefined;
  let releaseTimer = 0;
  const followingSection = track.closest('section')?.nextElementSibling;
  let span = 0;

  function measureSpan() {
    const overlap = followingSection ? Math.min(0, parseFloat(getComputedStyle(followingSection).marginTop) || 0) : 0;
    // End the pin before the following section starts covering the final panel.
    span = Math.max(1, track.offsetHeight - panel.offsetHeight + overlap);
  }

  function releaseEntry() {
    window.clearTimeout(releaseTimer);
    touchEntry = undefined;
  }

  function bounds() {
    const top = Math.round(window.scrollY + track.getBoundingClientRect().top);
    return { top, end: top + span, step: span / last };
  }

  function settle(next: number) {
    cancelAnimationFrame(frame);
    frame = 0;
    visible = index = next;
    render(next, next, 1);
  }

  function select(next: number) {
    const clamped = Math.max(0, Math.min(last, next));
    releaseEntry();
    entryDirection = 0;
    const { top, step } = bounds();
    const from = visible;
    movePage(Math.round(top + step * clamped));
    if (clamped === index) return;

    index = clamped;
    const start = performance.now();
    readyAt = start + COOLDOWN_MS;
    cancelAnimationFrame(frame);
    if (from === clamped || motion.matches) {
      settle(clamped);
      return;
    }
    const animate = (now: number) => {
      const t = Math.min(1, (now - start) / TRANSITION_MS);
      if (t >= 1) {
        settle(clamped);
      } else {
        visible = t < 0.55 ? from : clamped;
        render(from, clamped, t);
        frame = requestAnimationFrame(animate);
      }
    };
    animate(start);
  }

  function syncPosition() {
    const { top, end, step } = bounds();
    const y = window.scrollY;
    if (touchEntry !== undefined) {
      if (Math.abs(y - touchEntry) > 1) movePage(touchEntry);
      if (!touchStart) {
        window.clearTimeout(releaseTimer);
        releaseTimer = window.setTimeout(releaseEntry, WHEEL_IDLE_MS);
      }
      return;
    }
    // Keep in-flight wipe animations uninterrupted unless the page jumps outside the track.
    const outsideTrack = y < top - 48 || y > end + 48;
    if (frame && !outsideTrack) return;

    // A native fling can enter from a neighbouring section after the finger lifts.
    // Land on the first (or last) panel and consume only that incoming gesture.
    if (entryDirection && performance.now() - entryTime < 1600 && y >= top && y <= end) {
      const first = entryDirection > 0;
      entryDirection = 0;
      wheelUsed = touchUsed = true;
      settle(first ? 0 : last);
      if (lastInputWasTouch) {
        touchEntry = first ? top : end;
        if (!touchStart) releaseTimer = window.setTimeout(releaseEntry, WHEEL_IDLE_MS);
      }
      movePage(first ? top : end);
      return;
    }
    const next = Math.max(0, Math.min(last, Math.round((y - top) / step)));
    if (index !== next) {
      readyAt = 0;
      settle(next);
    }
  }

  function isPinned(direction: number) {
    const { top, end } = bounds();
    const y = window.scrollY;
    const pinned = y >= top - 6 && y <= end + 6;
    if (direction !== 0) {
      entryDirection = !pinned && ((direction > 0 && y < top) || (direction < 0 && y > end))
        ? direction : 0;
      entryTime = performance.now();
    }
    return pinned;
  }

  function isPageGesture(event: Event) {
    return event.cancelable && !event.defaultPrevented &&
      !(event.target instanceof Element && event.target.closest('dialog, .is-menu-open, input, textarea, select, [contenteditable="true"], [data-lenis-prevent]')) &&
      (window.visualViewport?.scale ?? 1) <= 1;
  }

  function atExit(direction: number) {
    return direction > 0 ? index === last : index === 0;
  }

  function onWheel(event: WheelEvent) {
    if (!isPageGesture(event) || event.ctrlKey) return;
    const absX = Math.abs(event.deltaX);
    const absY = Math.abs(event.deltaY);
    if (absX === 0 && absY === 0) return;

    const horizontal = absX > absY || (event.shiftKey && absY > 0);
    const axis: 'x' | 'y' = horizontal ? 'x' : 'y';
    const rawDelta = absX > absY ? event.deltaX : event.deltaY;
    const direction = Math.sign(rawDelta);
    if (!direction) return;

    releaseEntry();
    lastInputWasTouch = false;
    const now = performance.now();
    if (
      now - wheelTime > WHEEL_IDLE_MS ||
      wheelAxis !== axis ||
      Math.sign(wheelDistance) !== direction
    ) {
      wheelDistance = 0;
      wheelUsed = false;
      wheelAxis = axis;
    }
    wheelTime = now;

    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? panel.clientHeight : 1;
    wheelDistance += rawDelta * unit;

    if (horizontal) {
      if (!isPinned(0)) return;
      // Prevent browser horizontal back/forward navigation while browsing pinned slides.
      event.preventDefault();
      if (now < readyAt) wheelUsed = true;
      if (!wheelUsed && Math.abs(wheelDistance) >= GESTURE_THRESHOLD) {
        wheelUsed = true;
        if (!atExit(direction)) select(index + direction);
      }
      return;
    }

    if (!isPinned(direction)) return;
    if (!wheelUsed && now >= readyAt && atExit(direction)) return;

    event.preventDefault();
    if (now < readyAt) wheelUsed = true;
    if (!wheelUsed && Math.abs(wheelDistance) >= GESTURE_THRESHOLD) {
      wheelUsed = true;
      select(index + direction);
    }
  }

  function onTouchStart(event: TouchEvent) {
    releaseEntry();
    if (event.touches.length === 1) {
      const t = event.touches[0];
      touchStart = { x: t.clientX, y: t.clientY };
    } else {
      touchStart = undefined;
    }
    touchAxis = null;
    touchOrigin = window.scrollY;
    lastInputWasTouch = true;
    touchUsed = false;
    entryDirection = 0;
  }

  function onTouchMove(event: TouchEvent) {
    if (!touchStart || event.touches.length !== 1 || !isPageGesture(event)) return;
    const touch = event.touches[0];
    const dx = touchStart.x - touch.clientX;
    const dy = touchStart.y - touch.clientY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (!touchAxis) {
      if (absX < 8 && absY < 8) return;
      touchAxis = absX > absY * 1.1 ? 'x' : 'y';
    }

    if (touchAxis === 'x') {
      if (!isPinned(0)) return;
      const direction = Math.sign(dx);
      if (!direction) return;
      event.preventDefault();
      if (performance.now() < readyAt) touchUsed = true;
      if (!touchUsed && absX >= HORIZONTAL_SWIPE_THRESHOLD) {
        touchUsed = true;
        if (!atExit(direction)) select(index + direction);
      }
      return;
    }

    const direction = Math.sign(dy);
    if (!direction) return;
    const { top, end } = bounds();
    const edge = direction > 0 ? top : end;
    const approach = (edge - touchOrigin) * direction;
    if (approach > 1 && approach <= window.innerHeight && !touchUsed) {
      // Follow the finger up to the pin. Letting a native fling start this close
      // to the boundary can carry iOS past the introductory slide on release.
      event.preventDefault();
      const travel = Math.min(approach, absY);
      entryDirection = 0;
      if (travel === approach) {
        touchUsed = true;
        settle(direction > 0 ? 0 : last);
      }
      movePage(Math.round(touchOrigin + direction * travel));
      return;
    }
    if (!isPinned(direction)) return;
    if (!touchUsed && performance.now() >= readyAt && atExit(direction)) return;

    event.preventDefault();
    if (performance.now() < readyAt) touchUsed = true;
    if (!touchUsed && absY >= GESTURE_THRESHOLD) {
      touchUsed = true;
      select(index + direction);
    }
  }

  function onTouchEnd() {
    touchStart = undefined;
    touchAxis = null;
    if (touchEntry !== undefined) {
      releaseTimer = window.setTimeout(releaseEntry, WHEEL_IDLE_MS);
    }
  }

  function onKey(event: KeyboardEvent) {
    releaseEntry();
    entryDirection = 0;
    if (event.altKey || event.metaKey || event.ctrlKey || !isPageGesture(event)) return;
    const horizontalKey = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (horizontalKey) {
      if (!isPinned(0)) return;
      if (atExit(horizontalKey)) return;
      event.preventDefault();
      if (!event.repeat && performance.now() >= readyAt) select(index + horizontalKey);
      return;
    }
    const direction = ['ArrowDown', 'PageDown'].includes(event.key) ? 1 :
      ['ArrowUp', 'PageUp'].includes(event.key) ? -1 : 0;
    if (!direction || !isPinned(direction)) return;
    if (atExit(direction) && performance.now() >= readyAt) return;
    event.preventDefault();
    if (!event.repeat && performance.now() >= readyAt) select(index + direction);
  }

  function onResize() {
    measureSpan();
    if (!frame) {
      syncPosition();
      render(index, index, 1);
    }
  }

  function clearEntry() { entryDirection = 0; releaseEntry(); }
  function onMotionChange() { settle(index); }
  const abort = new AbortController();
  const { signal } = abort;
  const input = { capture: true, passive: false, signal };
  window.addEventListener('wheel', onWheel, input);
  window.addEventListener('touchstart', onTouchStart, { passive: true, signal });
  window.addEventListener('touchmove', onTouchMove, input);
  window.addEventListener('touchend', onTouchEnd, { passive: true, signal });
  window.addEventListener('touchcancel', onTouchEnd, { passive: true, signal });
  window.addEventListener('keydown', onKey, { signal });
  window.addEventListener('pointerdown', clearEntry, { signal });
  window.addEventListener('hashchange', clearEntry, { signal });
  window.addEventListener('scroll', syncPosition, { passive: true, signal });
  window.addEventListener('resize', onResize, { signal });
  motion.addEventListener('change', onMotionChange, { signal });
  measureSpan();
  syncPosition();
  return {
    select,
    destroy() {
      abort.abort();
      releaseEntry();
      cancelAnimationFrame(frame);
    },
  };
}
