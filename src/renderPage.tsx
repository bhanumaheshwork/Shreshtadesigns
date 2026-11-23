import { useEffect, useState } from 'react';
import Landing from './App';
import { AlbumRoute } from './components/AlbumRoute';
import { ServicesPage } from './components/ServicesPage';
import { StudioPage } from './components/StudioPage';
import { WhatsAppLink } from './components/WhatsAppLink';
import { BRAND_LOGO_URL, BRAND_NAME } from './data/brand';
import type { SitePage } from './data/pages';
import {
  getBrowserRoute,
  installRouter,
  subscribeRoute,
  type RouteState,
} from './utils/router';

function syncDocumentHead(page: SitePage) {
  document.title = `${page.title} | ${BRAND_NAME}`;
  const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (description) {
    description.content = page.description;
  }
}

function PageContent({
  page,
  hash,
  transitionKey,
}: {
  page: SitePage;
  hash: string;
  transitionKey: number;
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
        />
      );
    case 'studio':
      return (
        <StudioPage
          page={page.link}
          logoSrc={BRAND_LOGO_URL}
          transitionKey={transitionKey}
        />
      );
    case 'album':
      return (
        <AlbumRoute
          slide={page.slide}
          logoSrc={BRAND_LOGO_URL}
          transitionKey={transitionKey}
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

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <PageContent
        page={route.page}
        hash={route.hash}
        transitionKey={route.key}
      />
      <WhatsAppLink />
    </>
  );
}

export function renderPage(page: SitePage) {
  return <SiteApp initialPage={page} />;
}
