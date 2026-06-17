import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { RESTAURANT_LOCATION, DELIVERY_RADIUS_KM } from "../data/restaurantConfig";

// Leaflet's default marker icon paths break under most bundlers (Vite
// included) because it tries to resolve images relative to the CSS file.
// Point it at the CDN-hosted marker images instead — simplest fix, no
// asset-copying config needed.
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const restaurantIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  className: "mm-restaurant-marker",
});

// Recenters the map whenever the controlled position changes from outside
// (e.g. "Use my location" button), without fighting the user's own pan/zoom.
function RecenterOnChange({ lat, lng }) {
  const map = useMap();
  const prev = useRef({ lat, lng });
  useEffect(() => {
    if (prev.current.lat !== lat || prev.current.lng !== lng) {
      map.setView([lat, lng], map.getZoom() < 14 ? 15 : map.getZoom());
      prev.current = { lat, lng };
    }
  }, [lat, lng, map]);
  return null;
}

/**
 * DeliveryLocationMap
 * Props:
 *   lat, lng       — current marker position (controlled)
 *   onMarkerMove    — (lat, lng) => void, called when the customer drags the pin
 */
export default function DeliveryLocationMap({ lat, lng, onMarkerMove }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-mm-border h-[280px] relative z-0">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* delivery radius, centered on the restaurant */}
        <Circle
          center={[RESTAURANT_LOCATION.latitude, RESTAURANT_LOCATION.longitude]}
          radius={DELIVERY_RADIUS_KM * 1000}
          pathOptions={{ color: "#E8284B", fillColor: "#E8284B", fillOpacity: 0.06, weight: 1.5 }}
        />

        {/* restaurant marker */}
        <Marker
          position={[RESTAURANT_LOCATION.latitude, RESTAURANT_LOCATION.longitude]}
          icon={restaurantIcon}
        />

        {/* customer's draggable marker */}
        <Marker
          position={[lat, lng]}
          icon={markerIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const { lat: newLat, lng: newLng } = e.target.getLatLng();
              onMarkerMove(newLat, newLng);
            },
          }}
        />

        <RecenterOnChange lat={lat} lng={lng} />
      </MapContainer>
    </div>
  );
}