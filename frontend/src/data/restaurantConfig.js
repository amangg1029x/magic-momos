/**
 * restaurantConfig.js
 * Single source of truth for the restaurant's location and delivery radius.
 * Edit RESTAURANT_LOCATION or DELIVERY_RADIUS_KM here if either ever changes
 * — nothing else in the app should hardcode these values.
 */

export const RESTAURANT_LOCATION = {
  name: "Magic Momos",
  // 28°29'59.924"N, 77°20'0.628"E
  latitude: 28.502812,
  longitude: 77.329165,
};

// Maximum distance (in km) we currently deliver to.
// Bump this up as the business grows — it's the only line that needs to change.
export const DELIVERY_RADIUS_KM = 5;