import { useState, useEffect, useMemo } from "react";
import { useCart } from "../hooks/useCart";
import api from "../services/api";

import Header from "../components/Header";
import Footer from "../components/Footer";
import MenuPageHero from "../components/MenuPageHero";
import MenuCategoryFilter from "../components/MenuCategoryFilter";
import MenuGrid from "../components/MenuGrid";
import CartSidebar from "../components/CartSidebar";

export default function MenuPage() {
    const cart = useCart();
    const [menuItems, setMenuItems] = useState([]);
    const [menuLoading, setMenuLoading] = useState(true);

    const [cartOpen, setCartOpen] = useState(false);
    const [category, setCategory] = useState("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
        api.menu.getAll()
        .then(({ items }) => setMenuItems(items))
        .catch(console.error)
        .finally(() => setMenuLoading(false));
    }, []);

    /* category → item count map (for filter pill badges) */
    const counts = useMemo(() => {
        return menuItems.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] ?? 0) + 1;
            return acc;
        }, {});
    }, [menuItems]);


    return (
        <div className="relative min-h-screen bg-mm-black overflow-x-hidden">
            {/* shared sticky header with cart icon */}
            <Header
                cartCount={cart.count}
                onCartOpen={() => setCartOpen(true)}
            />

            <main>
                {/* page banner + search */}
                <MenuPageHero
                    search={search}
                    onSearch={(v) => {
                        setSearch(v);
                        if (v) setCategory("all"); // reset category on search
                    }}
                />

                {/* sticky category tabs */}
                <MenuCategoryFilter
                    active={category}
                    onChange={(cat) => { setCategory(cat); setSearch(""); }}
                    counts={counts}
                />

                {/* item grid with filtering */}
                <MenuGrid
                    category={category}
                    search={search}
                    cartItems={cart.items}
                    onAdd={cart.addItem}
                    onUpdate={cart.updateQty}
                />
            </main>

            <Footer />

            {/* cart drawer */}
            <CartSidebar
                open={cartOpen}
                onClose={() => setCartOpen(false)}
                items={cart.items}
                total={cart.total}
                onUpdate={cart.updateQty}
                onRemove={cart.removeItem}
                onClear={cart.clearCart}
            />
        </div>
    );
}