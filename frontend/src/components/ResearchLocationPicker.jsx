import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "../utils/leafletConfig";

const defaultCenter = [20.5937, 78.9629];

function LocationClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect([event.latlng.lng, event.latlng.lat]);
    },
  });

  return null;
}

function LocationMapSync() {
  const map = useMap();

  useEffect(() => {
    const handleLocationSelected = (event) => {
      const selection = event.detail;
      const coordinates = selection.coordinates || selection;
      if (coordinates?.length === 2) {
        map.flyTo([coordinates[1], coordinates[0]], 13, { duration: 1.2 });
      }
    };

    window.addEventListener("research-location-selected", handleLocationSelected);
    return () => window.removeEventListener("research-location-selected", handleLocationSelected);
  }, [map]);

  return null;
}

function MapSearch({ onSelect }) {
  const map = useMap();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const searchLocation = async (event) => {
    event?.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setError("");
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query.trim())}`, {
        headers: { Accept: "application/json" }
      });
      const results = await response.json();

      if (!results.length) {
        setError("Location not found");
        return;
      }

      const result = results[0];
      const coordinates = [Number(result.lon), Number(result.lat)];
      map.flyTo([coordinates[1], coordinates[0]], 13, { duration: 1.2 });
      onSelect({ coordinates, location: result.display_name });
      setQuery(result.display_name);
    } catch {
      setError("Could not search location");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="research-map-search">
      <div className="research-map-search-row">
        <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && searchLocation(event)} placeholder="Search location" aria-label="Search location" />
        <button type="button" onClick={searchLocation} disabled={searching}>{searching ? "..." : "Search"}</button>
      </div>
      {error && <small>{error}</small>}
    </div>
  );
}

function ResearchLocationPicker({ value, onChange }) {
  const [selected, setSelected] = useState(value);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [center] = useState(value ? [value[1], value[0]] : defaultCenter);
  const position = selected ? [selected[1], selected[0]] : null;
  const selectLocation = async (coordinates) => {
    setSelected(coordinates);
    onChange(coordinates);

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coordinates[1]}&lon=${coordinates[0]}`, {
        headers: { Accept: "application/json" }
      });
      const result = await response.json();
      if (result.display_name) {
        setSelectedLabel(result.display_name);
        onChange({ coordinates, location: result.display_name });
      }
    } catch {
      // Coordinates are already available if reverse geocoding is unavailable.
    }
  };

  useEffect(() => {
    const handleLocationSelected = (event) => {
      const selection = event.detail;
      setSelected(selection.coordinates || selection);
      if (selection.location) setSelectedLabel(selection.location);
    };
    window.addEventListener("research-location-selected", handleLocationSelected);
    return () => window.removeEventListener("research-location-selected", handleLocationSelected);
  }, []);

  return (
    <div>
      <div className="research-location-map">
        <MapContainer center={center} zoom={5} scrollWheelZoom style={{ height: "280px", width: "100%" }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapSearch onSelect={(selection) => {
            setSelected(selection.coordinates);
            setSelectedLabel(selection.location);
            onChange(selection);
          }} />
          <LocationMapSync />
          <LocationClickHandler onSelect={selectLocation} />
          {position && <Marker position={position}><Popup><strong>{selectedLabel || "Selected location"}</strong><br />Latitude: {position[0].toFixed(6)}<br />Longitude: {position[1].toFixed(6)}</Popup></Marker>}
        </MapContainer>
      </div>
      <small className="field-help">
        Click the map to select the observation location.
        {selected ? ` Longitude: ${selected[0].toFixed(6)}, Latitude: ${selected[1].toFixed(6)}` : ""}
      </small>
    </div>
  );
}

export default ResearchLocationPicker;
