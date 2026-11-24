import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
} from "react-leaflet";

import mapService from "../../services/mapService";
import Shell from "../../components/Shell";

function ResearcherMap() {
  const [data, setData] = useState({
    sightings: [],
    habitats: [],
    incidents: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const response = await mapService.getWildlifeMapData();

        setData({
          sightings: response.sightings || [],
          habitats: response.habitats || [],
          incidents: response.incidents || [],
        });
      } catch (error) {
        console.error("Map error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, []);

  if (loading) {
    return (
      <Shell active="map">
        <div className="container py-4">
          <h2>Wildlife Map</h2>
          <p>Loading map data...</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell active="map">
      <div className="container-fluid py-4">

        <h2>Wildlife Map</h2>

        <p className="text-muted">
          Analyze verified wildlife sightings, habitats and wildlife incidents.
        </p>

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
            style={{ height: "100%", width: "100%" }}
          >

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* VERIFIED SIGHTINGS */}

            {data.sightings.map((sighting) => {

              if (
                !sighting.coordinates ||
                sighting.coordinates.length < 2
              ) {
                return null;
              }

              const longitude = sighting.coordinates[0];
              const latitude = sighting.coordinates[1];

              return (
                <Marker
                  key={sighting._id}
                  position={[latitude, longitude]}
                >
                  <Popup>

                    <h6>Wildlife Sighting</h6>

                    <p>
                      <strong>Species:</strong>{" "}
                      {sighting.species?.commonName}
                    </p>

                    <p>
                      <strong>Scientific Name:</strong>{" "}
                      {sighting.species?.scientificName}
                    </p>

                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(
                        sighting.sightingDate
                      ).toLocaleDateString()}
                    </p>

                    <p>
                      <strong>Animal Count:</strong>{" "}
                      {sighting.animalCount}
                    </p>

                    <p>
                      <strong>Condition:</strong>{" "}
                      {sighting.condition}
                    </p>

                    <p>
                      <strong>Location:</strong>{" "}
                      {sighting.location}
                    </p>

                  </Popup>
                </Marker>
              );
            })}

            {/* HABITATS */}

            {data.habitats.map((habitat) => {

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
                  key={habitat._id}
                  center={[latitude, longitude]}
                  radius={12}
                >
                  <Popup>

                    <h6>Habitat</h6>

                    <p>
                      <strong>Name:</strong>{" "}
                      {habitat.name}
                    </p>

                    <p>
                      <strong>Type:</strong>{" "}
                      {habitat.habitatType}
                    </p>

                    <p>
                      <strong>Area:</strong>{" "}
                      {habitat.area} {habitat.areaUnit}
                    </p>

                    <p>
                      <strong>Description:</strong>{" "}
                      {habitat.description}
                    </p>

                  </Popup>
                </CircleMarker>
              );
            })}

            {/* INCIDENTS */}

            {data.incidents.map((incident) => {

              if (
                !incident.coordinates ||
                incident.coordinates.length < 2
              ) {
                return null;
              }

              const longitude = incident.coordinates[0];
              const latitude = incident.coordinates[1];

              return (
                <CircleMarker
                  key={incident._id}
                  center={[latitude, longitude]}
                  radius={10}
                >
                  <Popup>

                    <h6>Wildlife Incident</h6>

                    <p>
                      <strong>Type:</strong>{" "}
                      {incident.incidentType}
                    </p>

                    <p>
                      <strong>Title:</strong>{" "}
                      {incident.title}
                    </p>

                    <p>
                      <strong>Severity:</strong>{" "}
                      {incident.severity}
                    </p>

                    <p>
                      <strong>Status:</strong>{" "}
                      {incident.status}
                    </p>

                    <p>
                      <strong>Location:</strong>{" "}
                      {incident.location}
                    </p>

                  </Popup>
                </CircleMarker>
              );
            })}

          </MapContainer>
        </div>

      </div>
    </Shell>
  );
}

export default ResearcherMap;