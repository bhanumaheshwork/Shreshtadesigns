import { findPage, legacyPageHref, type SitePage } from '../data/pages';

export type NavigationType = 'initial' | 'push' | 'replace' | 'pop';

export interface SavedScrollPosition {
  windowY: number;
  containerY: number;
}

export interface RouteState {
  pathname: string;
  search: string;
  hash: string;
  page: SitePage;
  key: number;
  navigationType: NavigationType;
  savedScroll?: SavedScrollPosition;
}

type RouteListener = (state: RouteState) => void;

const listeners = new Set<RouteListener>();
const prefetchedImages = new Set<string>();
const scrollPositions = new Map<number, SavedScrollPosition>();
const ASSET_EXT_RE = /\.(?:webp|png|jpe?g|gif|svg|ico|avif|css|js|mjs|json|xml|txt|pdf|woff2?)$/i;

let routeCounter = 0;
let activeHistoryId = 0;
let dispatchingHash = false;

function readHistoryRouteId(): number {
  const state = window.history.state;
  if (state && typeof state === 'object' && typeof (state as { __routeId?: unknown }).__routeId === 'number') {
    return (state as { __routeId: number }).__routeId;
  }
  return 0;
}

function buildHistoryState(routeId: number) {
  const existing = window.history.state;
  if (existing && typeof existing === 'object') {
    return { ...existing, __routeId: routeId };
  }
  return { __routeId: routeId };
}

function saveCurrentScroll() {
  if (typeof window === 'undefined') return;
  const scroller = document.querySelector<HTMLElement>('.ceremony-page');
  scrollPositions.set(activeHistoryId, {
    windowY: window.scrollY,
    containerY: scroller ? scroller.scrollTop : 0,
  });
}

function resolveCanonicalPath(pathname: string, page: SitePage): string {
  return page.kind === 'missing' ? pathname : page.path;
}

export function createRouteState(
  pathname: string,
  search: string,
  hash: string,
  navigationType: NavigationType,
  savedScroll?: SavedScrollPosition,
): RouteState {
  const page = findPage(pathname);
  return {
    pathname: resolveCanonicalPath(pathname, page),
    search,
    hash,
    page,
    key: navigationType === 'initial' ? 0 : ++routeCounter,
    navigationType,
    savedScroll,
  };
}

export function getBrowserRoute(navigationType: NavigationType = 'initial'): RouteState {
  const historyId = readHistoryRouteId();
  const savedScroll = navigationType === 'pop' ? scrollPositions.get(historyId) : undefined;
  activeHistoryId = historyId;
  return createRouteState(
    window.location.pathname,
    window.location.search,
    window.location.hash,
    navigationType,
    savedScroll,
  );
}

function notify(state: RouteState) {
  listeners.forEach((listener) => listener(state));
}

export function subscribeRoute(listener: RouteListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function preferredScrollBehavior(): ScrollBehavior {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'instant';
  }
  return 'smooth';
}

function scrollActivePageToTop() {
  const behavior = preferredScrollBehavior();
  const scroller = document.querySelector<HTMLElement>('.ceremony-page');
  if (scroller) {
    scroller.scrollTo({ top: 0, behavior });
  } else {
    window.scrollTo({ top: 0, behavior });
  }
}

export function isInternalPageUrl(url: URL): boolean {
  if (typeof window === 'undefined') return false;
  if (url.origin !== window.location.origin) return false;
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
  if (url.pathname.startsWith('/api/')) return false;
  if (ASSET_EXT_RE.test(url.pathname)) return false;
  return true;
}

function canPrefetchOnConnection(): boolean {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  if (nav.connection?.saveData) return false;
  const effectiveType = nav.connection?.effectiveType;
  if (effectiveType === 'slow-2g' || effectiveType === '2g') return false;
  return true;
}

export function prefetchRoute(href: string) {
  if (typeof window === 'undefined') return;
  if (!canPrefetchOnConnection()) return;
  let url: URL;
  try {
    url = new URL(href, window.location.origin);
  } catch {
    return;
  }
  if (!isInternalPageUrl(url)) return;
  const page = findPage(url.pathname);
  if (page.kind === 'missing' || !page.image || prefetchedImages.has(page.image)) return;
  prefetchedImages.add(page.image);
  const img = new Image();
  img.decoding = 'async';
  img.src = page.image;
}

export function navigate(to: string, options?: { replace?: boolean }) {
  if (typeof window === 'undefined') return;

  let url: URL;
  try {
    url = new URL(to, window.location.origin);
  } catch {
    window.location.assign(to);
    return;
  }

  if (!isInternalPageUrl(url)) {
    window.location.assign(to);
    return;
  }

  const targetPage = findPage(url.pathname);
  const targetPathname = resolveCanonicalPath(url.pathname, targetPage);
  const targetFull = `${targetPathname}${url.search}${url.hash}`;

  const currentPage = findPage(window.location.pathname);
  const currentPathname = resolveCanonicalPath(window.location.pathname, currentPage);
  const sameDocument =
    targetPathname === currentPathname && url.search === window.location.search;

  if (sameDocument) {
    if (url.hash === window.location.hash) {
      if (!url.hash) {
        scrollActivePageToTop();
      } else {
        const targetEl = document.getElementById(url.hash.slice(1));
        targetEl?.scrollIntoView({ block: 'start', behavior: preferredScrollBehavior() });
      }
      return;
    }

    saveCurrentScroll();
    if (options?.replace) {
      window.history.replaceState(buildHistoryState(activeHistoryId), '', targetFull);
    } else {
      activeHistoryId = ++routeCounter;
      window.history.pushState(buildHistoryState(activeHistoryId), '', targetFull);
    }
    notify(createRouteState(targetPathname, url.search, url.hash, options?.replace ? 'replace' : 'push'));
    dispatchingHash = true;
    try {
      window.dispatchEvent(new Event('hashchange'));
    } finally {
      dispatchingHash = false;
    }
    return;
  }

  saveCurrentScroll();

  if (options?.replace) {
    window.history.replaceState(buildHistoryState(activeHistoryId), '', targetFull);
  } else {
    activeHistoryId = ++routeCounter;
    window.history.pushState(buildHistoryState(activeHistoryId), '', targetFull);
  }

  notify(createRouteState(targetPathname, url.search, url.hash, options?.replace ? 'replace' : 'push'));
}

function findAnchorFromEvent(event: Event): HTMLAnchorElement | null {
  const target = event.target;
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLAnchorElement>('a[href]');
}

export function installRouter(): () => void {
  const handleClick = (event: MouseEvent) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const anchor = findAnchorFromEvent(event);
    if (!anchor) return;
    if (anchor.hasAttribute('download')) return;
    const targetAttr = anchor.getAttribute('target');
    if (targetAttr && targetAttr !== '_self') return;

    const rawHref = anchor.getAttribute('href');
    if (!rawHref || rawHref.startsWith('#')) return;

    let url: URL;
    try {
      url = new URL(anchor.href, window.location.origin);
    } catch {
      return;
    }

    if (!isInternalPageUrl(url)) return;

    event.preventDefault();
    navigate(`${url.pathname}${url.search}${url.hash}`);
  };

  const handlePrefetch = (event: Event) => {
    const anchor = findAnchorFromEvent(event);
    if (!anchor) return;
    const rawHref = anchor.getAttribute('href');
    if (!rawHref || rawHref.startsWith('#')) return;
    prefetchRoute(anchor.href);
  };

  const handlePopState = () => {
    if (window.location.pathname === '/') {
      const legacy = legacyPageHref(window.location.hash);
      if (legacy) {
        navigate(legacy, { replace: true });
        return;
      }
    }
    notify(getBrowserRoute('pop'));
  };

  const handleHashChange = () => {
    if (dispatchingHash) return;
    if (window.location.pathname === '/') {
      const legacy = legacyPageHref(window.location.hash);
      if (legacy) {
        navigate(legacy, { replace: true });
        return;
      }
    }
    notify(getBrowserRoute('pop'));
  };

  const previousRestoration = window.history.scrollRestoration;
  window.history.scrollRestoration = 'manual';
  activeHistoryId = readHistoryRouteId();
  if (!window.history.state || typeof (window.history.state as { __routeId?: unknown }).__routeId !== 'number') {
    window.history.replaceState(buildHistoryState(activeHistoryId), '', window.location.href);
  }

  document.addEventListener('click', handleClick);
  document.addEventListener('pointerenter', handlePrefetch, true);
  document.addEventListener('focusin', handlePrefetch, true);
  document.addEventListener('touchstart', handlePrefetch, { passive: true, capture: true });
  window.addEventListener('popstate', handlePopState);
  window.addEventListener('hashchange', handleHashChange);

  return () => {
    window.history.scrollRestoration = previousRestoration;
    document.removeEventListener('click', handleClick);
    document.removeEventListener('pointerenter', handlePrefetch, true);
    document.removeEventListener('focusin', handlePrefetch, true);
    document.removeEventListener('touchstart', handlePrefetch, true);
    window.removeEventListener('popstate', handlePopState);
    window.removeEventListener('hashchange', handleHashChange);
  };
}
