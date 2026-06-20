import { createContext, useContext, useState } from "react";
import { Capacitor } from "@capacitor/core";

const NavContext = createContext(null);

export function NavigationProvider({ children }) {
  const isNative = Capacitor.isNativePlatform();
  const [page,     setPage]     = useState(isNative ? "menu" : "home");
  const [pageData, setPageData] = useState(null);

  const navigate = (target, data = null, options = {}) => {
    // Prevent navigating to home on native if we want to force Menu as base
    if (isNative && target === "home") {
      setPage("menu");
    } else {
      setPage(target);
    }
    setPageData(data);
    if (!options.noScroll) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <NavContext.Provider value={{ page, pageData, navigate, isNative }}>
      {children}
    </NavContext.Provider>
  );
}

export const useNav = () => useContext(NavContext);