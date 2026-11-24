import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
} from "react-leaflet";
import mapService from "../services/mapService";
import Shell from "../components/Shell";
import "../utils/leafletConfig";

function WildlifeMap() {
  const [mapData, setMapData] = useState({
    sightings: [],
    habitats: [],
    incidents: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const loadMapData = async () => {
      try {
        const data = await mapService.getWildlifeMapData();
        setMapData({
          sightings: data.sightings || [],
          habitats: data.habitats || [],
          incidents: data.incidents || [],
        });
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message ||
            "Failed to load wildlife map data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, []);

  return (
    <Shell active="map">
      <div className="container-fluid py-4">

        <div className="mb-4">
          <h2>Wildlife Map</h2>
          <p className="text-muted">
            View verified wildlife sightings, habitats and active incidents.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            Loading wildlife map...
          </div>
        ) : (
          <div
            style={{
              height: "600px",
              width: "100%",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              scrollWheelZoom={true}
              style={{
                height: "100%",
                width: "100%",
              }}
            >

              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* SIGHTINGS */}
              {mapData.sightings.map((sighting) => {
                const coordinates = sighting.coordinates;

                if (
                  !coordinates ||
                  coordinates.length < 2
                ) {
                  return null;
                }

                const longitude = coordinates[0];
                const latitude = coordinates[1];

                return (
                  <Marker
                    key={`sighting-${sighting._id}`}
                    position={[latitude, longitude]}
                  >
                    <Popup>
                      <strong>Wildlife Sighting</strong>

                      <br />

                      Species:{" "}
                      {sighting.species?.commonName ||
                        "Unknown"}

                      <br />

                      Scientific Name:{" "}
                      {sighting.species?.scientificName ||
                        "N/A"}

                      <br />

                      Animal Count:{" "}
                      {sighting.animalCount}

                      <br />

                      Condition:{" "}
                      {sighting.condition}

                      <br />

                      Location:{" "}
                      {sighting.location}
                    </Popup>
                  </Marker>
                );
              })}

              {/* HABITATS */}
              {mapData.habitats.map((habitat) => {
                const coordinates =
                  habitat.location?.coordinates ||
                  habitat.coordinates;

                if (
                  !coordinates ||
                  coordinates.length < 2
                ) {
                  return null;
                }

                const longitude = coordinates[0];
                const latitude = coordinates[1];

                return (
                  <CircleMarker
                    key={`habitat-${habitat._id}`}
                    center={[latitude, longitude]}
                    radius={12}
                  >
                    <Popup>
                      <strong>Habitat</strong>

                      <br />

                      Name: {habitat.name}

                      <br />

                      Type: {habitat.habitatType}

                      <br />

                      Area: {habitat.area}{" "}
                      {habitat.areaUnit}

                      <br />

                      Location: {habitat.location?.address ||
                        habitat.location}
                    </Popup>
                  </CircleMarker>
                );
              })}

              {/* INCIDENTS */}
              {mapData.incidents.map((incident) => {
                const coordinates =
                  incident.coordinates;

                if (
                  !coordinates ||
                  coordinates.length < 2
                ) {
                  return null;
                }

                const longitude = coordinates[0];
                const latitude = coordinates[1];

                return (
                  <CircleMarker
                    key={`incident-${incident._id}`}
                    center={[latitude, longitude]}
                    radius={10}
                  >
                    <Popup>
                      <strong>Wildlife Incident</strong>

                      <br />

                      Type: {incident.incidentType}

                      <br />

                      Title: {incident.title}

                      <br />

                      Severity: {incident.severity}

                      <br />

                      Status: {incident.status}

                      <br />

                      Location: {incident.location}
                    </Popup>
                  </CircleMarker>
                );
              })}

            </MapContainer>
          </div>
        )}
      </div>
    </Shell>
  );
}

export default WildlifeMap;