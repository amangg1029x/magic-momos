import { createContext, useContext, useState } from "react";

const NavContext = createContext(null);

export function NavigationProvider({ children }) {
  const [page,     setPage]     = useState("home");
  const [pageData, setPageData] = useState(null);

  const navigate = (target, data = null, options = {}) => {
    setPage(target);
    setPageData(data);
    if (!options.noScroll) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <NavContext.Provider value={{ page, pageData, navigate }}>
      {children}
    </NavContext.Provider>
  );
}

export const useNav = () => useContext(NavContext);