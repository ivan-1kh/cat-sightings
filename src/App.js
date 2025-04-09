import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// --- Fix for default marker icon issue ---
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;
// --- End of fix ---

let catList = [
  ["4/3/2025  1:14:36 AM", "Cofwefwsfee", "2314513234", 32.693748, 35.298947], // In Israel (example)
  ["4/2/2025  12:24:27 PM", "Coffee", "2314513234", 51.505, -0.09],          // Near initial view (London)
  ["4/1/2025  8:38:46 PM", "Coffwee", "2314513234", 51.51, -0.1],            // Near initial view (London)
  ["3/31/2025  12:41:08 PM", "Coffefwe", "2314513234", 40.7128, -74.0060],       // New York (out of initial view)
  ["4/3/2025  12:10:25 AM", "Coffdwsfee", "2314513234", -33.8688, 151.2093],     // Sydney (out of initial view)
  ["3/31/2025  9:00:37 PM", "Coffefeae", "2314513234", 51.500, -0.11],          // Near initial view (London)
];

let processed = false;


// Helper component to listen to map events
function MapBoundsUpdater({ setBounds }) {
  const map = useMapEvents({
    // Update bounds on initial load
    load: () => {
      if (map) { // Ensure map instance exists
        setBounds(map.getBounds());
      }
    },
    // Update bounds when map stops moving or zooming
    moveend: () => {
      if (map) {
        setBounds(map.getBounds());
      }
    },
    zoomend: () => {
      if (map) {
        setBounds(map.getBounds());
      }
    },
  });

  // This component doesn't render anything visual
  return null;
}


function App() {

  const [searchQuery, setSearchQuery] = useState(null);

  const searchQueryChange = (event) => { setSearchQuery(event.target.value); };

  const [fromDD, setFromDD] = useState(null);
  const [fromMM, setFromMM] = useState(null);
  const [fromYY, setFromYY] = useState(null);

  const [toDD, setToDD] = useState(null);
  const [toMM, setToMM] = useState(null);
  const [toYY, setToYY] = useState(null);


  const fromDDChange = (event) => { setFromDD(parseInt(event.target.value)); };
  const fromMMChange = (event) => { setFromMM(parseInt(event.target.value)); };
  const fromYYChange = (event) => { setFromYY(parseInt(event.target.value)); };

  const toDDChange = (event) => { setToDD(parseInt(event.target.value)); };
  const toMMChange = (event) => { setToMM(parseInt(event.target.value)); };
  const toYYChange = (event) => { setToYY(parseInt(event.target.value)); };


  // Set the initial position [latitude, longitude] and zoom level
  const position = [51.505, -0.09]; // Example: London Eye coordinates
  const zoomLevel = 13;

  // State to hold the current map bounds (Leaflet LatLngBounds object)
  const [mapBounds, setMapBounds] = useState(null);
  // State to hold the cats that are currently visible within the map bounds
  const [visibleCats, setVisibleCats] = useState([]);

  // Effect hook to filter cats whenever mapBounds changes
  useEffect(() => {
    if (mapBounds) {
      const filtered = catList.filter(cat => {
        const catLatLng = L.latLng(cat[3], cat[4]); // Create LatLng for the cat
        return mapBounds.contains(catLatLng);       // Check if bounds contain the cat's location
      });
      setVisibleCats(filtered);
    } else {
      // Optional: Handle the case before bounds are set (e.g., show all or none)
      // For now, let's show none until the map loads and provides bounds
      setVisibleCats([]);
    }
  }, [mapBounds]); // Dependency array: re-run effect only when mapBounds changes

  useEffect(() => {

    if (processed) return;

    //preprocessing: "time", name, sn, lng, lat, dd, mm, yy

    catList.forEach((cat) => {

      let timestamp = cat[0].split(" ");

      cat[0] = timestamp[2] + " " + timestamp[3];

      timestamp = timestamp[0].split("/");

      cat[5] = parseInt(timestamp[1]);
      cat[6] = parseInt(timestamp[0]);
      cat[7] = parseInt(timestamp[2]);

      processed = true;
    });

  }, []);


  return (
    <div className="App">
      <div className='filters-container'>
        <h1>Filters</h1>

        <input type="text" placeholder='Search' onChange={searchQueryChange} />

        <p>from:</p>
        <div id="fromDate">
          <input style={{ width: "2rem" }} type="text" placeholder='dd' onChange={fromDDChange} />
          <input style={{ width: "2rem" }} type="text" placeholder='mm' onChange={fromMMChange} />
          <input style={{ width: "5rem" }} type="text" placeholder='yy' onChange={fromYYChange} />
        </div>

        <p>to:</p>
        <div id="toDate">
          <input style={{ width: "2rem" }} type="text" placeholder='dd' onChange={toDDChange} />
          <input style={{ width: "2rem" }} type="text" placeholder='mm' onChange={toMMChange} />
          <input style={{ width: "5rem" }} type="text" placeholder='yy' onChange={toYYChange} />
        </div>

        <ul>
          {/* console.log("Rendering visible cats:", visibleCats); */} {/* Optional: for debugging */}
          {visibleCats.map((cat, index) => { // Use visibleCats here!

            if (searchQuery && !(cat[1].includes(searchQuery))) {

              return <></>;
            }

            const catDateNum = cat[7] * 10000 + cat[6] * 100 + cat[5];
            const fromDateNum = fromYY * 10000 + fromMM * 100 + fromDD;
            const toDateNum = toYY * 10000 + toMM * 100 + toDD;

            if ((fromDD && fromMM && fromYY && toDD && toMM && toYY) && !(
              catDateNum >= fromDateNum && catDateNum <= toDateNum
            )) {

              return <></>;
            }

            return (
              <li key={`${cat[1]}-${index}`} // Add a unique key for React lists
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "2px solid black",
                  borderRadius: "2rem",
                  margin: "0.5rem 0" // Add some margin between items
                }}>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center"
                }}>
                  <h1 style={{ margin: "1rem" }}>{cat[1]}</h1>
                  <p style={{ margin: "1rem" }}>{cat[2]}</p>
                </div>
                <h2 style={{ margin: "1rem" }}>{cat[5] + "/" + cat[6] + "/" + cat[7] + " " + cat[0]}</h2>
              </li>
            );
          })}
          {/* Optional: Show a message if no cats are in view */}
          {visibleCats.length === 0 && mapBounds && (
            <p style={{ textAlign: 'center', marginTop: '1rem' }}>No cats found in the current map view.</p>
          )}
        </ul>
      </div>
      <MapContainer
        center={position}
        zoom={zoomLevel}
        scrollWheelZoom={true}
        className="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Add the event listener component */}
        <MapBoundsUpdater setBounds={setMapBounds} />

        {/* Map over the ORIGINAL catList to display ALL markers on the map */}
        {catList.map((cat, index) => {

          if (searchQuery && !(cat[1].includes(searchQuery))) {

            return <></>;
          }


          const catDateNum = cat[7] * 10000 + cat[6] * 100 + cat[5];
          const fromDateNum = fromYY * 10000 + fromMM * 100 + fromDD;
          const toDateNum = toYY * 10000 + toMM * 100 + toDD;

          if ((fromDD && fromMM && fromYY && toDD && toMM && toYY) && !(
            catDateNum >= fromDateNum && catDateNum <= toDateNum
          )) {

            return <></>;
          }

          return (
            <Marker key={`${cat[1]}-marker-${index}`} position={[cat[3], cat[4]]}>
              <Popup style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                border: "2px solid black",
                borderRadius: "2rem"
              }}>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center"
                }}>
                  <h1 style={{ margin: "1rem" }}>{cat[1]}</h1>
                  <p style={{ margin: "1rem" }}>{cat[2]}</p>
                </div>
                <h2 style={{ margin: "1rem" }}>{cat[5] + "/" + cat[6] + "/" + cat[7] + " " + cat[0]}</h2>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default App;