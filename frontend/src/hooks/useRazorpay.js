import { useCallback, useRef } from "react";

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/**
 * useRazorpay
 *
 * Lazily injects the Razorpay Checkout script (only once, cached across
 * calls) and exposes an `open()` function that wraps the callback-based
 * Checkout API in a Promise, so it's easy to `await` from async handlers.
 *
 * Usage:
 *   const { open } = useRazorpay();
 *   const result = await open({ key, amount, currency, order_id, name, ... });
 *   // result = { razorpay_payment_id, razorpay_order_id, razorpay_signature }
 *   // throws if the user closes the modal or payment fails
 */
function loadScript() {
  // Reuse an in-flight or already-resolved load across multiple hook instances
  if (window.__razorpayScriptPromise) return window.__razorpayScriptPromise;

  window.__razorpayScriptPromise = new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();

    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload  = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay Checkout. Check your connection and try again."));
    document.body.appendChild(script);
  });

  return window.__razorpayScriptPromise;
}

export function useRazorpay() {
  // Guards against a dismissed modal calling both reject() and the
  // ondismiss handler in some edge cases — only settle the promise once.
  const settledRef = useRef(false);

  const open = useCallback(async (options) => {
    await loadScript();
    settledRef.current = false;

    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        ...options,
        handler: (response) => {
          if (settledRef.current) return;
          settledRef.current = true;
          resolve({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_signature:  response.razorpay_signature,
          });
        },
        modal: {
          ...options.modal,
          ondismiss: () => {
            if (settledRef.current) return;
            settledRef.current = true;
            const err = new Error("Payment cancelled.");
            err.cancelled = true;
            reject(err);
          },
        },
      });

      rzp.on("payment.failed", (response) => {
        if (settledRef.current) return;
        settledRef.current = true;
        const err = new Error(
          response?.error?.description || "Payment failed. Please try again."
        );
        err.razorpayError = response?.error;
        reject(err);
      });

      rzp.open();
    });
  }, []);

  return { open };
}
