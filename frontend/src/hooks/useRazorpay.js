import { useCallback, useRef } from "react";
import { Capacitor } from "@capacitor/core";

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/**
 * useRazorpay
 *
 * IMPORTANT — why this hook branches on platform:
 * Razorpay's own docs explicitly say their web Checkout (checkout.js)
 * "is not recommended" inside a WebView, and list exactly the symptoms
 * you'd hit: netbanking/bank-redirect pages failing to open, UPI intent
 * handoff needing extra config, and downloads not working. That's because
 * checkout.js drives payment flows with window.open() and full-page
 * redirects, which Android's WebView doesn't handle the way a real browser
 * does — no amount of WebViewClient/WebChromeClient patching fully fixes it,
 * because it's fighting the platform rather than using it correctly.
 *
 * The fix is to use Razorpay's official `capacitor-razorpay` plugin when
 * running as a native app — it wraps their real native Android/iOS SDKs,
 * which open netbanking/UPI/wallet flows through proper native Activities
 * instead of WebView popups. In a normal browser (no Capacitor), we keep
 * using the original checkout.js script-injection approach, since that's
 * the correct method there.
 *
 * Usage is identical either way:
 *   const { open } = useRazorpay();
 *   const result = await open({ key, amount, currency, order_id, name, ... });
 *   // result = { razorpay_payment_id, razorpay_order_id, razorpay_signature }
 *   // throws if the user closes the modal or payment fails
 */

// ── Web path: lazy-load checkout.js (unchanged from the original hook) ───────
function loadWebScript() {
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

function openWeb(options) {
  return new Promise((resolve, reject) => {
    let settled = false;

    const rzp = new window.Razorpay({
      ...options,
      handler: (response) => {
        if (settled) return;
        settled = true;
        resolve({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id:   response.razorpay_order_id,
          razorpay_signature:  response.razorpay_signature,
        });
      },
      modal: {
        ...options.modal,
        ondismiss: () => {
          if (settled) return;
          settled = true;
          const err = new Error("Payment cancelled.");
          err.cancelled = true;
          reject(err);
        },
      },
    });

    rzp.on("payment.failed", (response) => {
      if (settled) return;
      settled = true;
      const err = new Error(
        response?.error?.description || "Payment failed. Please try again."
      );
      err.razorpayError = response?.error;
      reject(err);
    });

    rzp.open();
  });
}

// ── Native path: capacitor-razorpay plugin (wraps real native SDKs) ──────────
// Imported lazily inside the function rather than at module top-level so
// that web-only builds (or builds that haven't run `npm install
// capacitor-razorpay` yet) don't crash at import time — this matches how
// the rest of your app already treats Capacitor as optional.
async function openNative(options) {
  let Checkout;
  try {
    ({ Checkout } = await import("capacitor-razorpay"));
  } catch (e) {
    throw new Error(
      "Native payment plugin not installed. Run: npm install capacitor-razorpay, " +
      "register Checkout.class in MainActivity.java, then npx cap sync."
    );
  }

  // capacitor-razorpay expects amount/currency as strings, and does not
  // use the `handler`/`modal.ondismiss`/`.on('payment.failed', ...)` callback
  // shape that checkout.js uses — it resolves/rejects a single promise.
  const nativeOptions = {
    key:         options.key,
    amount:      String(options.amount),
    currency:    options.currency || "INR",
    name:        options.name,
    description: options.description,
    order_id:    options.order_id,
    prefill:     options.prefill,
    theme:       options.theme,
  };

  try {
    const data = await Checkout.open(nativeOptions);
    // The plugin returns { response: "<json string>" } on success.
    const parsed = typeof data.response === "string" ? JSON.parse(data.response) : data.response;
    return {
      razorpay_payment_id: parsed.razorpay_payment_id,
      razorpay_order_id:   parsed.razorpay_order_id,
      razorpay_signature:  parsed.razorpay_signature,
    };
  } catch (error) {
    // Per Razorpay's docs, native failures arrive as error.code containing
    // a JSON string (not a normal Error/message) — normalise it here so
    // every caller (CheckoutPage, OrderSuccessPage retry flow) can keep
    // using err.message / err.cancelled the same way regardless of platform.
    let description = "Payment failed. Please try again.";
    let cancelled = false;
    try {
      const errObj = JSON.parse(error.code ?? error.message ?? "{}");
      description = errObj.description || description;
      // Razorpay's native SDK uses code 0 / "BAD_REQUEST_ERROR" with a
      // "Payment Cancelled" description when the user backs out manually.
      cancelled = /cancel/i.test(errObj.description || "") || errObj.code === 0;
    } catch {
      // error wasn't JSON — fall back to whatever message we got
      description = error.message || description;
    }
    const err = new Error(description);
    err.cancelled = cancelled;
    err.razorpayError = error;
    throw err;
  }
}

export function useRazorpay() {
  // Guards against a dismissed modal calling both reject() and the
  // ondismiss handler in some edge cases — only settle the promise once.
  // (Only used by the web path; the native path is single-shot already.)
  const settledRef = useRef(false);

  const open = useCallback(async (options) => {
    if (Capacitor.isNativePlatform()) {
      return openNative(options);
    }

    settledRef.current = false;
    await loadWebScript();
    return openWeb(options);
  }, []);

  return { open };
}