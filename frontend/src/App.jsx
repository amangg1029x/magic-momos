import { NavigationProvider, useNav } from "./context/NavigationContext";
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";

function AppInner() {
  const { page } = useNav();
  return page === "menu" ? <MenuPage /> : <HomePage />;
}

export default function App() {
  return (
    <NavigationProvider>
      <AppInner />
    </NavigationProvider>
  );
}