import { Component, useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import Landing from './App';
import { AlbumRoute } from './components/AlbumRoute';
import { ServicesPage } from './components/ServicesPage';
import { StudioPage } from './components/StudioPage';
import { WhatsAppLink } from './components/WhatsAppLink';
import { BRAND_LOGO_URL, BRAND_NAME } from './data/brand';
import { formatPageTitle, SITE_ORIGIN, type SitePage } from './data/pages';
import {
  getBrowserRoute,
  installRouter,
  subscribeRoute,
  type RouteState,
} from './utils/router';

function setMetaTag(selector: string, content: string) {
  const element = document.querySelector<HTMLMetaElement>(selector);
  if (element) {
    element.content = content;
  }
}

function syncDocumentHead(page: SitePage) {
  const fullTitle = formatPageTitle(page);
  const canonicalUrl = `${SITE_ORIGIN}${page.path}`;
  const imageUrl = `${SITE_ORIGIN}${page.image}`;

  document.title = fullTitle;
  setMetaTag('meta[name="description"]', page.description);
  setMetaTag('meta[property="og:title"]', fullTitle);
  setMetaTag('meta[property="og:description"]', page.description);
  setMetaTag('meta[property="og:url"]', canonicalUrl);
  setMetaTag('meta[property="og:image"]', imageUrl);
  setMetaTag('meta[name="twitter:title"]', fullTitle);
  setMetaTag('meta[name="twitter:description"]', page.description);
  setMetaTag('meta[name="twitter:image"]', imageUrl);

  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical && page.kind !== 'missing') {
    canonical.href = canonicalUrl;
  }
}

class RouteErrorBoundary extends Component<
  { routeKey: number; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: { routeKey: number }) {
    if (prevProps.routeKey !== this.props.routeKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main id="main-content" tabIndex={-1} className="missing-page">
          <h1>Unable to display this page</h1>
          <p><a href="/">Return to the {BRAND_NAME} homepage</a></p>
          <p><a href="/services/">Explore wedding services</a></p>
        </main>
      );
    }
    return this.props.children;
  }
}

function PageContent({
  page,
  hash,
  transitionKey,
  restoreScrollTop,
}: {
  page: SitePage;
  hash: string;
  transitionKey: number;
  restoreScrollTop?: number;
}) {
  switch (page.kind) {
    case 'home':
      return <Landing logoSrc={BRAND_LOGO_URL} />;
    case 'services':
      return (
        <ServicesPage
          logoSrc={BRAND_LOGO_URL}
          hash={hash}
          transitionKey={transitionKey}
          restoreScrollTop={restoreScrollTop}
        />
      );
    case 'studio':
      return (
        <StudioPage
          page={page.link}
          logoSrc={BRAND_LOGO_URL}
          transitionKey={transitionKey}
          restoreScrollTop={restoreScrollTop}
        />
      );
    case 'album':
      return (
        <AlbumRoute
          slide={page.slide}
          logoSrc={BRAND_LOGO_URL}
          transitionKey={transitionKey}
          restoreScrollTop={restoreScrollTop}
        />
      );
    case 'missing':
      return (
        <main id="main-content" tabIndex={-1} className="missing-page">
          <h1>Page unavailable</h1>
          <p><a href="/">Return to the {BRAND_NAME} homepage</a></p>
          <p><a href="/services/">Explore wedding services</a></p>
        </main>
      );
  }
}

function SiteApp({ initialPage }: { initialPage: SitePage }) {
  const [route, setRoute] = useState<RouteState>(() => ({
    pathname: initialPage.path,
    search: '',
    hash: '',
    page: initialPage,
    key: 0,
    navigationType: 'initial',
  }));

  useEffect(() => {
    const initialBrowserRoute = getBrowserRoute('initial');
    if (
      initialBrowserRoute.hash !== route.hash ||
      initialBrowserRoute.search !== route.search ||
      initialBrowserRoute.page.path !== route.page.path
    ) {
      setRoute(initialBrowserRoute);
    }

    const unsubscribe = subscribeRoute((nextRoute) => {
      document.documentElement.classList.remove('is-overlay-open');
      if (nextRoute.page.kind !== 'home') {
        delete document.body.dataset.nav;
      }
      syncDocumentHead(nextRoute.page);
      setRoute(nextRoute);
    });
    const uninstall = installRouter();

    return () => {
      unsubscribe();
      uninstall();
    };
    // Run once on client mount to install SPA routing without altering initial hydration output.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (route.key === 0) return;
    if (route.page.kind === 'home') {
      if (route.navigationType === 'pop' && route.savedScroll) {
        window.scrollTo({ top: route.savedScroll.windowY, left: 0, behavior: 'instant' });
      } else if (!route.hash) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    } else if (!route.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [route]);

  const restoreScrollTop = route.navigationType === 'pop' ? route.savedScroll?.containerY : undefined;

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <RouteErrorBoundary routeKey={route.key}>
        <PageContent
          page={route.page}
          hash={route.hash}
          transitionKey={route.key}
          restoreScrollTop={restoreScrollTop}
        />
      </RouteErrorBoundary>
      <WhatsAppLink />
    </>
  );
}

export function renderPage(page: SitePage) {
  return <SiteApp initialPage={page} />;
}
