import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import api from "../services/api";

const NavContext = createContext(null);

// ── Browser History helpers ───────────────────────────────────────────────────
// We push a history state for every page so the browser Back button works.
// The state payload is { page, pageData } so we can restore on popstate.
// On native platforms we skip all of this — the hardware back button is handled
// by the Capacitor App listener below.
function pushHistory(page, pageData) {
  window.history.pushState({ page, pageData }, "", `#${page}`);
}

export function NavigationProvider({ children }) {
  const isNative = Capacitor.isNativePlatform();
  const [page, setPage]         = useState(isNative ? "menu" : "home");
  const [pageData, setPageData] = useState(null);

  // Navigation stack to keep track of pages visited
  const [stack, setStack] = useState(() => [
    { page: isNative ? "menu" : "home", pageData: null }
  ]);

  // ── Push a browser history entry on first mount (web only) ─────────────────
  useEffect(() => {
    if (isNative) return;
    // Only push if the URL has no hash already (fresh load)
    if (!window.location.hash) {
      pushHistory(isNative ? "menu" : "home", null);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const navigate = (target, data = null, options = {}) => {
    let actualTarget = target;
    // Prevent navigating to home on native if we want to force Menu as base
    if (isNative && target === "home") {
      actualTarget = "menu";
    }

    if (actualTarget === "menu") {
      // Reset stack on menu page
      setStack([{ page: "menu", pageData: null }]);
      setPage("menu");
      setPageData(null);
    } else {
      setStack((prev) => [...prev, { page: actualTarget, pageData: data }]);
      setPage(actualTarget);
      setPageData(data);
    }

    // Sync the browser history so the Back button knows about this page
    if (!isNative) {
      pushHistory(actualTarget, data);
    }

    if (!options.noScroll) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    if (page === "menu") {
      if (isNative) {
        App.exitApp();
      }
      return;
    }

    if (stack.length > 1) {
      setStack((prev) => {
        const newStack = prev.slice(0, -1);
        const lastPage = newStack[newStack.length - 1];
        setPage(lastPage.page);
        setPageData(lastPage.pageData);
        return newStack;
      });
    } else {
      // Fallback: reset to menu if stack has 1 or fewer items but we aren't on menu
      setStack([{ page: "menu", pageData: null }]);
      setPage("menu");
      setPageData(null);
    }
  };

  // Keep a ref to goBack to avoid re-registering listeners on every render
  const goBackRef = useRef(goBack);
  useEffect(() => {
    goBackRef.current = goBack;
  });

  // ── Browser Back / Forward button (web only) ────────────────────────────────
  useEffect(() => {
    if (isNative) return;

    const handlePopState = (event) => {
      if (event.state && event.state.page) {
        // Restore the page the browser history entry recorded
        const { page: targetPage, pageData: targetData } = event.state;

        if (targetPage === "menu") {
          setStack([{ page: "menu", pageData: null }]);
          setPage("menu");
          setPageData(null);
        } else {
          // Re-build a minimal stack ending at this page
          setStack((prev) => {
            // Walk back to find if this page exists earlier in the stack
            const idx = prev.findLastIndex((e) => e.page === targetPage);
            if (idx !== -1) {
              const newStack = prev.slice(0, idx + 1);
              setPage(newStack[newStack.length - 1].page);
              setPageData(newStack[newStack.length - 1].pageData);
              return newStack;
            }
            // Not found — fallback to a stack with just this page
            setPage(targetPage);
            setPageData(targetData ?? null);
            return [{ page: targetPage, pageData: targetData ?? null }];
          });
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // No state means we've gone back before our first pushState entry
        // (e.g., the very initial browser page). Just go to the root.
        setStack([{ page: isNative ? "menu" : "home", pageData: null }]);
        setPage(isNative ? "menu" : "home");
        setPageData(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isNative]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Hardware Back button on Android (native only) ───────────────────────────
  useEffect(() => {
    if (!isNative) return;

    const listenerPromise = App.addListener("backButton", () => {
      goBackRef.current();
    });

    return () => {
      listenerPromise.then((handle) => handle.remove());
    };
  }, [isNative]);

  // ── Settings ────────────────────────────────────────────────────────────────
  const [settings, setSettings] = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.settings.get();
      if (res.success && res.settings) {
        setSettings(res.settings);
      }
    } catch (err) {
      console.error("Failed to load store settings:", err);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    const interval = setInterval(fetchSettings, 30000);
    return () => clearInterval(interval);
  }, [fetchSettings]);

  // ── Store open/closed status ────────────────────────────────────────────────
  const getStoreOpenStatus = () => {
    if (!settings) return { open: true, status: "open" };
    if (settings.storeStatusOverride === "open")   return { open: true,  status: "open"   };
    if (settings.storeStatusOverride === "closed")  return { open: false, status: "closed" };
    if (settings.storeStatusOverride === "busy")    return { open: true,  status: "busy"   };

    const openTime  = settings.openTime  || "11:00";
    const closeTime = settings.closeTime || "23:00";

    const now = new Date();
    // India time offset: UTC + 5:30
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const currentHour = istNow.getUTCHours();
    const currentMin  = istNow.getUTCMinutes();
    const currentMinutes = currentHour * 60 + currentMin;

    const [openHour,  openMin]  = openTime.split(":").map(Number);
    const [closeHour, closeMin] = closeTime.split(":").map(Number);
    const openMinutes  = openHour  * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    let isOpen = false;
    if (closeMinutes > openMinutes) {
      isOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
    } else {
      isOpen = currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
    }

    return { open: isOpen, status: isOpen ? "open" : "closed" };
  };

  const storeStatus = getStoreOpenStatus();

  return (
    <NavContext.Provider value={{ page, pageData, navigate, goBack, isNative, stack, settings, fetchSettings, storeStatus }}>
      {children}
    </NavContext.Provider>
  );
}

export const useNav = () => useContext(NavContext);