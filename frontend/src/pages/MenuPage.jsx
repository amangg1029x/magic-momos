import { useState, useMemo, useEffect } from "react";
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

    useEffect(() => {
        api.menu.getAll()
            .then(({ items }) => setMenuItems(items))
            .catch((err) => setMenuError(err.message || "Failed to load menu."))
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

                {/* loading state */}
                {menuLoading && (
                    <div className="flex justify-center py-24">
                        <div className="w-9 h-9 rounded-full border-4 border-mm-border border-t-mm-red animate-spin" />
                    </div>
                )}

                {/* error state */}
                {!menuLoading && menuError && (
                    <div className="max-w-md mx-auto text-center py-24 px-5">
                        <p className="text-5xl mb-4">😕</p>
                        <h3 className="font-display text-2xl text-mm-cream mb-2">Couldn't load the menu</h3>
                        <p className="font-body text-sm text-mm-muted">{menuError}</p>
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