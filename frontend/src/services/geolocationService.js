import { Geolocation } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";

/**
 * Gets the current GPS coordinates of the device.
 * Automatically handles native runtime permission requests on Capacitor/mobile.
 */
export async function getCurrentGPSPosition() {
  if (Capacitor.isNativePlatform()) {
    try {
      let permission = await Geolocation.checkPermissions();
      
      if (permission.location !== "granted") {
        permission = await Geolocation.requestPermissions();
      }
      
      if (permission.location !== "granted") {
        throw new Error("LOCATION_PERMISSION_DENIED");
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (err) {
      console.error("[Geolocation] Native error:", err);
      throw err;
    }
  } else {
    // Web browser fallback
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        return reject(new Error("GEOLOCATION_UNSUPPORTED"));
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            reject(new Error("LOCATION_PERMISSION_DENIED"));
          } else {
            reject(new Error("GEOLOCATION_ERROR"));
          }
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }
}
