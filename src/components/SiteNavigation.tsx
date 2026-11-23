import { useEffect, useRef, useState, type MouseEventHandler } from 'react';
import { BRAND_NAME } from '../data/brand';
import { SERVICES_HREF, STUDIO_LINKS, type StudioLink } from '../data/siteNavigation';
import './SiteNavigation.css';

const menuLinks = [{ label: 'Services', href: SERVICES_HREF }, ...STUDIO_LINKS];

interface SiteNavigationProps {
  logoSrc: string;
  activePage?: StudioLink;
  onHomeClick?: MouseEventHandler<HTMLAnchorElement>;
}

export function SiteNavigation({ logoSrc, activePage, onHomeClick }: SiteNavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    drawerRef.current?.querySelector('a')?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      toggleRef.current?.focus();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  const drawerId = activePage ? 'studio-menu' : 'sheetnav';

  return (
    <div className={`site-navigation${activePage ? ' site-navigation--page' : ''}${menuOpen ? ' is-menu-open' : ''}`}>
      <nav className="nav" aria-label="Main">
        <a
          className="brand-link"
          href="/"
          onClick={(event) => {
            setMenuOpen(false);
            onHomeClick?.(event);
          }}
          aria-label={`${BRAND_NAME} home`}
        >
          <img className="brand-logo" src={logoSrc} alt="" referrerPolicy="no-referrer" />
        </a>
        <ul>
          {menuLinks.slice(0, -1).map(({ href, label }) => (
            <li key={href}>
              <a className="l" href={href} aria-current={activePage?.href === href ? 'page' : undefined}>
                {label}
              </a>
            </li>
          ))}
        </ul>
        <a className="enq" href="/enquire/" aria-current={activePage?.id === 'enquire' ? 'page' : undefined}>
          Enquire
        </a>
        <button
          ref={toggleRef}
          className="menu"
          type="button"
          aria-expanded={menuOpen}
          aria-controls={drawerId}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </nav>
      <nav ref={drawerRef} className="sheetnav" id={drawerId} aria-label="Menu" inert={!menuOpen}>
        {menuLinks.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            aria-current={activePage?.href === href ? 'page' : undefined}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </a>
        ))}
      </nav>
      <nav className="fallback-nav" aria-label="Site pages">
        {menuLinks.map(({ href, label }) => <a href={href} key={href}>{label}</a>)}
      </nav>
    </div>
  );
}
