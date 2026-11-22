import type Lenis from 'lenis';
import type { LenisOptions } from 'lenis';
import { CEREMONY_SLIDES } from '../data/ceremonies';

const SLIDE_COUNT = CEREMONY_SLIDES.length;
export function ceremonyStep(showcase: HTMLElement, stage: HTMLElement) {
  return Math.max(1, (showcase.offsetHeight - stage.offsetHeight) / SLIDE_COUNT);
}

export function paceCeremonyWheel(
  showcase: HTMLElement,
  stage: HTMLElement,
  getLenis: () => Lenis,
): NonNullable<LenisOptions['virtualScroll']> {
  return (input) => {
    const { event, deltaX, deltaY } = input;
    if (event.type !== 'wheel' || event.ctrlKey || Math.abs(deltaY) <= Math.abs(deltaX)) return true;

    const { top, bottom } = showcase.getBoundingClientRect();
    if (top >= window.innerHeight || bottom <= 0) return true;

    const lenis = getLenis();
    const pending = lenis.targetScroll - lenis.animatedScroll;
    const lead = ceremonyStep(showcase, stage) * 0.6;
    const direction = Math.sign(deltaY);
    // Keep the destination close to the visible frame, and drop old momentum on reversal.
    const nextLead = Math.min(lead, Math.max(0, pending * direction) + Math.abs(deltaY));
    input.deltaY = direction * nextLead - pending;
    if (input.deltaY === 0 && event.cancelable) event.preventDefault();
    return true;
  };
}
