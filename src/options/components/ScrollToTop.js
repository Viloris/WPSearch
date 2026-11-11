import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 *
 * @param {Object} children
 * @returns {JSX.element} Component to automatically scroll to the top of the page whenever the location changes, ensuring that users start at the top of the page when navigating to a new route within the application
 */
export default function ScrollToTop({ children }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return children;
}
