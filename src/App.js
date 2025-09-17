// App.js
import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const App = () => {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null); // Reference to store the map instance

  useEffect(() => {
    // Initialize map only if it hasn't been initialized
    if (!mapRef.current) {
      const newMap = L.map('map').setView([17.6868, 83.2185], 13); // Centered at Visakhapatnam (VSKP)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(newMap);

      mapRef.current = newMap; // Store the map instance
    }

    // Cleanup function to remove map on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleSearch = async () => {
    if (!fromLocation || !toLocation) {
      alert('Please enter both From and To locations.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/passenger/routes/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromLocation,
          to: toLocation,
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Search error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search From"
          value={fromLocation}
          onChange={(e) => setFromLocation(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="To"
          value={toLocation}
          onChange={(e) => setToLocation(e.target.value)}
          className="input-field"
        />
        <button onClick={handleSearch} disabled={loading} className="search-button">
          {loading ? 'Searching...' : 'Nearest Bus'}
        </button>
      </div>
      <div id="map" className="map-container"></div>
      {searchResults && (
        <div className="results">
          <h3>Search Results:</h3>
          <pre>{JSON.stringify(searchResults, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default App;