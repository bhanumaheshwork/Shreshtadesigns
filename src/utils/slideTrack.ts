// Both slideshows share the same 980ms gesture cadence. The cooldown starts with the wipe.
const TRANSITION_MS = 980;
const COOLDOWN_MS = 980;
const WHEEL_IDLE_MS = 180;
const GESTURE_THRESHOLD = 24;
const HORIZONTAL_SWIPE_THRESHOLD = 28;
const NAV_HEIGHT = 64;

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
  let touchUsed = false;
  let lastInputWasTouch = false;
  let entryDirection = 0;
  let entryTime = 0;
  let touchEntry: number | undefined;
  let releaseTimer = 0;
  const followingSection = track.closest('section')?.nextElementSibling;
  let compact = false;
  let span = 0;

  function measureSpan() {
    const overlap = followingSection ? Math.min(0, parseFloat(getComputedStyle(followingSection).marginTop) || 0) : 0;
    compact = track.offsetHeight <= panel.offsetHeight + 4;
    // End the pin before the following section starts covering the final panel.
    span = compact ? 0 : Math.max(1, track.offsetHeight - panel.offsetHeight + overlap);
  }

  function releaseEntry() {
    window.clearTimeout(releaseTimer);
    touchEntry = undefined;
  }

  function bounds() {
    const rectTop = Math.round(window.scrollY + track.getBoundingClientRect().top);
    if (compact) {
      const secHeight = track.offsetHeight;
      const available = Math.max(secHeight, window.innerHeight - NAV_HEIGHT);
      const anchor = Math.max(0, Math.round(rectTop - NAV_HEIGHT - (available - secHeight) / 2));
      return { top: anchor, end: anchor, step: 0 };
    }
    return { top: rectTop, end: rectTop + span, step: span / last };
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
    const outsideTrack = compact ? Math.abs(y - top) > 96 : y < top - 48 || y > end + 48;
    if (frame && !outsideTrack) return;

    // A native fling can enter from a neighbouring section after the finger lifts.
    // Land on the first (or last) panel and consume only that incoming gesture.
    if (entryDirection && performance.now() - entryTime < 1600) {
      const captureWindow = Math.max(360, window.innerHeight);
      const entered = compact
        ? entryDirection > 0
          ? y >= top - 12 && y <= top + captureWindow
          : y <= top + 12 && y >= top - captureWindow
        : y >= top && y <= end;
      if (entered) {
        const first = entryDirection > 0;
        entryDirection = 0;
        wheelUsed = touchUsed = true;
        settle(first ? 0 : last);
        const anchor = compact ? top : first ? top : end;
        if (lastInputWasTouch) {
          touchEntry = anchor;
          if (!touchStart) releaseTimer = window.setTimeout(releaseEntry, WHEEL_IDLE_MS);
        }
        movePage(anchor);
        return;
      }
    }

    if (compact) {
      if (index === -1) {
        settle(y > top + 28 ? last : 0);
      } else if (y < top - 80 && index !== 0) {
        readyAt = 0;
        settle(0);
      } else if (y > top + 80 && index !== last) {
        readyAt = 0;
        settle(last);
      }
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
    const tol = compact ? 28 : 12;
    const pinned = y >= top - tol && y <= end + tol;
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
      const onCompactTrack = compact && event.target instanceof Element && track.contains(event.target);
      if (!isPinned(0) && !onCompactTrack) return;
      // Prevent browser horizontal back/forward navigation while browsing slides.
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
      const onCompactTrack = compact && event.target instanceof Element && track.contains(event.target);
      if (!isPinned(0) && !onCompactTrack) return;
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
