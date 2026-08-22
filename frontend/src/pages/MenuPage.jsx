import { useState, useMemo, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import api from "../services/api";

import Header from "../components/Header";
import Footer from "../components/Footer";
import MenuPageHero from "../components/MenuPageHero";
import MenuCategoryFilter from "../components/MenuCategoryFilter";
import MenuGrid from "../components/MenuGrid";
import CartSidebar from "../components/CartSidebar";
import { useNav } from "../context/NavigationContext"

/**
 * MenuPage
 * Props:
 *   cart — the shared useCart() instance from App.jsx
 */
export default function MenuPage({ cart }) {
    const [cartOpen, setCartOpen] = useState(false);
    const [category, setCategory] = useState("all");
    const [search, setSearch]     = useState("");

    // ── Live menu data from the API ───────────────────────────────────────────
    const [menuItems,   setMenuItems]   = useState([]);
    const [menuLoading, setMenuLoading] = useState(true);
    const [menuError,   setMenuError]   = useState("");

    const { isNative } = useNav();

    const fetchMenu = useCallback(() => {
        setMenuLoading(true);
        setMenuError("");
        api.menu.getAll()
            .then((data) => {
                if (Array.isArray(data)) {
                    setMenuItems(data);
                } else if (data && Array.isArray(data.items)) {
                    setMenuItems(data.items);
                } else {
                    setMenuItems([]);
                }
            })
            .catch((err) => {
                setMenuError(err.message || "Failed to load menu. Please check your internet connection.");
            })
            .finally(() => setMenuLoading(false));
    }, []);

    useEffect(() => {
        fetchMenu();
    }, [fetchMenu]);

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

                {/* loading state */}
                {menuLoading && (
                    <div className="flex justify-center py-24">
                        <div className="w-9 h-9 rounded-full border-4 border-mm-border border-t-mm-red animate-spin" />
                    </div>
                )}

                {/* error state */}
                {!menuLoading && menuError && (
                    <div className="max-w-md mx-auto text-center py-24 px-5">
                        <p className="text-5xl mb-4">📡</p>
                        <h3 className="font-display text-2xl text-mm-cream mb-2">Couldn't load the menu</h3>
                        <p className="font-body text-sm text-mm-muted mb-6">{menuError}</p>
                        <button
                            onClick={fetchMenu}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-mm-red hover:bg-red-600 text-white font-body font-700 text-sm shadow-[0_4px_14px_rgba(232,40,75,0.30)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        >
                            <RefreshCw size={16} />
                            Retry
                        </button>
                    </div>
                )}

                {/* item grid with filtering */}
                {!menuLoading && !menuError && (
                    <MenuGrid
                        category={category}
                        search={search}
                        items={menuItems}
                        cartItems={cart.items}
                        onAdd={cart.addItem}
                        onUpdate={cart.updateQty}
                    />
                )}
            </main>

            {!isNative && <Footer />}

            {/* cart drawer */}
            <CartSidebar
                open={cartOpen}
                onClose={() => setCartOpen(false)}
                items={cart.items}
                subtotal={cart.subtotal}
                discount={cart.discount}
                deliveryFee={cart.deliveryFee}
                total={cart.total}
                coupon={cart.coupon}
                couponError={cart.couponError}
                onUpdate={cart.updateQty}
                onRemove={cart.removeItem}
                onClear={cart.clearCart}
                onApplyCoupon={cart.applyCoupon}
                onRemoveCoupon={cart.removeCoupon}
                freeDeliveryThreshold={cart.FREE_DELIVERY_MIN}
                deliveryFeeSetting={cart.DELIVERY_FEE}
            />
        </div>
    );
}