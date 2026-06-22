import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import api from "../services/api";

const NavContext = createContext(null);

export function NavigationProvider({ children }) {
  const isNative = Capacitor.isNativePlatform();
  const [page, setPage] = useState(isNative ? "menu" : "home");
  const [pageData, setPageData] = useState(null);
  
  // Navigation stack to keep track of pages visited
  const [stack, setStack] = useState(() => [
    { page: isNative ? "menu" : "home", pageData: null }
  ]);

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

  // Keep a ref to goBack to avoid re-registering backButton listener on every render/stack change
  const goBackRef = useRef(goBack);
  useEffect(() => {
    goBackRef.current = goBack;
  });

  // Listen to hardware back button on Android
  useEffect(() => {
    if (!isNative) return;

    const listenerPromise = App.addListener("backButton", () => {
      goBackRef.current();
    });

    return () => {
      listenerPromise.then((handle) => handle.remove());
    };
  }, [isNative]);

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

  const getStoreOpenStatus = () => {
    if (!settings) return { open: true, status: "open" };
    if (settings.storeStatusOverride === "open") return { open: true, status: "open" };
    if (settings.storeStatusOverride === "closed") return { open: false, status: "closed" };
    if (settings.storeStatusOverride === "busy") return { open: true, status: "busy" };

    const openTime = settings.openTime || "11:00";
    const closeTime = settings.closeTime || "23:00";

    const now = new Date();
    // India time offset: UTC + 5:30
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const currentHour = istNow.getUTCHours();
    const currentMin = istNow.getUTCMinutes();
    const currentMinutes = currentHour * 60 + currentMin;

    const [openHour, openMin] = openTime.split(":").map(Number);
    const [closeHour, closeMin] = closeTime.split(":").map(Number);
    const openMinutes = openHour * 60 + openMin;
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