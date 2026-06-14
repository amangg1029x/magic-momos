import { createContext, useContext, useState } from "react";

const NavContext = createContext(null);

export function NavigationProvider({ children }) {
  const [page, setPage] = useState("home");

  const navigate = (target, options = {}) => {
    setPage(target);
    if (!options.noScroll) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <NavContext.Provider value={{ page, navigate }}>
      {children}
    </NavContext.Provider>
  );
}

export const useNav = () => useContext(NavContext);