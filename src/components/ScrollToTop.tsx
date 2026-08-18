import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// react-router's plain <Routes> (unlike a data router's <ScrollRestoration>)
// doesn't reset scroll position on navigation, so client-side route changes
// leave the new page scrolled to wherever the previous page was.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
