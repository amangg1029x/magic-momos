import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";


// Disable pinch-to-zoom and double-tap zoom
if (typeof window !== "undefined") {
  document.addEventListener("touchstart", (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });

  document.addEventListener("gesturestart", (e) => {
    e.preventDefault();
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);