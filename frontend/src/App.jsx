import { NavigationProvider, useNav } from "./context/NavigationContext";
import HomePage  from "./pages/HomePage";
import MenuPage  from "./pages/MenuPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";

function AppInner() {
  const { page } = useNav();
  if (page === "menu")  return <MenuPage />;
  if (page === "about") return <AboutPage />;
  if (page === "contact") return <ContactPage />;
  if (page === "success") return <OrderSuccessPage />;
  return <HomePage />;
}

export default function App() {
  return (
    <NavigationProvider>
      <AppInner />
    </NavigationProvider>
  );
}