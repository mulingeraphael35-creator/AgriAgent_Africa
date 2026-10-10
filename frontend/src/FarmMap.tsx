
import {
  CircleMarker,
  MapContainer,
  Polygon,
  Popup,
  TileLayer,
} from "react-leaflet";

const fields = [
  {
    name: "North Plot",
    crop: "Maize",
    moisture: "Low",
    position: [-1.2921, 36.8219] as [number, number],
    color: "red",
  },
  {
    name: "East Plot",
    crop: "Beans",
    moisture: "Moderate",
    position: [-1.2932, 36.8241] as [number, number],
    color: "orange",
  },
  {
    name: "South Field",
    crop: "Maize",
    moisture: "Good",
    position: [-1.2951, 36.8228] as [number, number],
    color: "green",
  },
  {
    name: "West Field",
    crop: "Vegetables",
    moisture: "Good",
    position: [-1.2938, 36.8192] as [number, number],
    color: "green",
  },
];

const farmBoundary: [number, number][] = [
  [-1.2908, 36.8192],
  [-1.2902, 36.8238],
  [-1.2942, 36.8254],
  [-1.2960, 36.8210],
  [-1.2948, 36.8184],
];


function FarmMap({
  onViewField,
}: {
  onViewField: (
    fieldName: string,
    latitude: number,
    longitude: number
  ) => void;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "420px",
        borderRadius: "18px",
        overflow: "hidden",
      }}
    >
      <MapContainer
        center={[-1.2935, 36.8215]}
        zoom={16}
        scrollWheelZoom={true}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polygon
          positions={farmBoundary}
          pathOptions={{
            color: "#2f7d32",
            fillColor: "#4caf50",
            fillOpacity: 0.12,
            weight: 2,
          }}
        >
          <Popup>
            <strong>AgriAgent Farm</strong>
            <br />
            Mapped farm area
          </Popup>
        </Polygon>

        {fields.map((field) => (
          <CircleMarker
            key={field.name}
            center={field.position}
            radius={10}
            pathOptions={{
              color: field.color,
              fillColor: field.color,
              fillOpacity: 0.85,
              weight: 2,
            }}
            eventHandlers={{
              click: () =>
    onViewField(
      field.name,
      field.position[0],
      field.position[1]
    ),
            }}
          >
            <Popup>
              <strong>{field.name}</strong>
              <br />
              Crop: {field.crop}
              <br />
              Soil moisture: {field.moisture}
              <br />
              Click the marker to open field details.
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

export default FarmMap;