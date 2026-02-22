import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * 
 * @param {Object} children 
 * @returns {JSX.element}
 */
export default function ScrollToTop({ children }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return children;
}
