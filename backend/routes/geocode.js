const express = require("express");
const Client = require("@googlemaps/google-maps-services-js");

const router = express.Router();
const KEY = process.env.GOOGLE_MAPS_API_KEY;

// GET /api/geocode/search?q=IIT+Delhi
router.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 3) return res.json([]);
  try {
    const response = await client.placeAutocomplete({
      params: {
        input: q,
        key: KEY,
        language: "en",
        components: ["country:in"],
        types: "geocode",
      },
    });
    const predictions = response.data.predictions.map((p) => ({
      placeId: p.place_id,
      displayName: p.description,
      shortName: p.structured_formatting.main_text,
      secondary: p.structured_formatting.secondary_text,
    }));
    res.json(predictions);
  } catch (err) {
    console.error("Places Autocomplete error:", err.message);
    res.status(500).json([]);
  }
});

// GET /api/geocode/details?placeId=ChIJ...
router.get("/details", async (req, res) => {
  const { placeId } = req.query;
  if (!placeId) return res.status(400).json(null);
  try {
    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        key: KEY,
        fields: ["geometry", "formatted_address", "address_components"],
      },
    });
    const result = response.data.result;
    const comps = result.address_components || [];
    const get = (type) =>
      comps.find((c) => c.types.includes(type))?.long_name || "";

    res.json({
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      displayName: result.formatted_address,
      street: [get("route"), get("sublocality_level_2") || get("sublocality_level_1")]
        .filter(Boolean).join(", "),
      city: get("locality") || get("administrative_area_level_2"),
      pincode: get("postal_code"),
    });
  } catch (err) {
    console.error("Place Details error:", err.message);
    res.status(500).json(null);
  }
});

// GET /api/geocode/reverse?lat=28.6&lng=77.2
router.get("/reverse", async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json(null);
  try {
    const response = await client.reverseGeocode({
      params: { latlng: { lat: parseFloat(lat), lng: parseFloat(lng) }, key: KEY },
    });
    const result = response.data.results[0];
    if (!result) return res.json(null);
    const comps = result.address_components || [];
    const get = (type) =>
      comps.find((c) => c.types.includes(type))?.long_name || "";

    res.json({
      displayName: result.formatted_address,
      street: [get("route"), get("sublocality_level_2") || get("sublocality_level_1")]
        .filter(Boolean).join(", "),
      city: get("locality") || get("administrative_area_level_2"),
      pincode: get("postal_code"),
    });
  } catch (err) {
    console.error("Reverse geocode error:", err.message);
    res.status(500).json(null);
  }
});

module.exports = router;