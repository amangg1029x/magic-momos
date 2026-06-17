const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const PHOTON_BASE = "https://photon.komoot.io";

export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `${NOMINATIM_BASE}/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address || {};

    const city =
      addr.city || addr.town || addr.village || addr.suburb || addr.state_district || "";
    const pincode = addr.postcode || "";
    const street =
      [addr.road, addr.neighbourhood || addr.suburb].filter(Boolean).join(", ") ||
      data.display_name?.split(",").slice(0, 2).join(",") ||
      "";

    return { city, pincode, street, displayName: data.display_name || "" };
  } catch {
    return null;
  }
}

export async function forwardGeocode(query) {
  try {
    const res = await fetch(
      `${NOMINATIM_BASE}/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=1`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.length) return null;
    const { lat, lon, display_name } = data[0];
    return { lat: parseFloat(lat), lng: parseFloat(lon), displayName: display_name };
  } catch {
    return null;
  }
}

export async function searchGeocode(query) {
  if (!query || query.trim().length < 3) return [];
  try {
    const res = await fetch(
      `${PHOTON_BASE}/api?q=${encodeURIComponent(query)}&limit=5&lang=en&bbox=68.1,6.5,97.4,35.5`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return [];
    const data = await res.json();

    return (data.features || []).map((f) => {
      const p = f.properties || {};
      const shortName = [p.name, p.street, p.city || p.town || p.village, p.state]
        .filter(Boolean)
        .join(", ");
      const displayName = shortName || p.name || "";
      return {
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        displayName,
        shortName,
      };
    });
  } catch {
    return [];
  }
}