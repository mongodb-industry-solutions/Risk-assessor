import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Legend from './Legend';
import {SearchInput} from '@leafygreen-ui/search-input';
import styles from '../styles/map.module.css';
import Pin from '@leafygreen-ui/icon/dist/Pin';
import IconButton from '@leafygreen-ui/icon-button';
import ApiResponseContext from '../context/ApiResponseContext';


const icons = {
  selected: L.icon({
    iconUrl: 'http://localhost:3000/gray.png',
    iconSize: [23, 40],
    shadowSize: [23, 40],
    iconAnchor: [11, 20],
  }),
  2016: L.icon({
    iconUrl: 'http://localhost:3000/blue.png',
    iconSize: [23, 40],
    shadowSize: [23, 40],
    iconAnchor: [11, 20],
  }),
  2017: L.icon({
    iconUrl: 'http://localhost:3000/green.png',
    iconSize: [23, 40],
    shadowSize: [23, 40],
    iconAnchor: [11, 20],
  }),
  2018: L.icon({
    iconUrl: 'http://localhost:3000/yellow.png',
    iconSize: [23, 40],
    shadowSize: [23, 40],
    iconAnchor: [11, 20],
  }),
  2019: L.icon({
    iconUrl: 'http://localhost:3000/orange.png',
    iconSize: [23, 40],
    shadowSize: [23, 40],
    iconAnchor: [11, 20],
  }),
  2020: L.icon({
    iconUrl: 'http://localhost:3000/red.png',
    iconSize: [23, 40],
    shadowSize: [23, 40],
    iconAnchor: [11, 20],
  }),
};

const Map = ({ showIcon, coordinates }) => {
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [zoom, setZoom] = useState(4);
  const [apiResponse, setApiResponse] = useState(null);
  const [showMarkers, setShowMarkers] = useState(false);
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState(null);
  
  
  const handleMapClick = (coords) => {
    setSelectedCoords(coords);
    setShowMarkers(false);
  };
  
  useEffect(() => {
    if (coordinates) {
      setPosition(coordinates);
      handleMapClick(coordinates);
      setZoom(18);
    }

    fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/coordinates?latitude=${coordinates.lat}&longitude=${coordinates.lng}`)
            .then(response => response.json())
            .then(data => setApiResponse(JSON.stringify(data, null, 2)))
            .catch((error) => console.error('Error:', error));

  }, [coordinates]);

  const handleButtonClick = () => {
    setShowMarkers(prevShowMarkers => !prevShowMarkers);
    setZoom(prevZoom => prevZoom === 11 ? 18 : 11);
  };

  const fetchCoordinates = async (address) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/address/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address })
      });
      const data = await response.json();
      //console.log('fetchCoordinates:', data[0]);
      return { lat: data[0].latitude, lng: data[0].longitude };
    } catch (error) {
      console.error('Error fetching coordinates:', error);
    }
  };
  
  const MapEvents = () => {
    const map = useMapEvents({
      click: (e) => {
        setPosition(e.latlng);
        handleMapClick(e.latlng);
        setZoom(18);
  
        map.once('moveend', () => {
          fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/coordinates?latitude=${e.latlng.lat}&longitude=${e.latlng.lng}`)
            .then(response => response.json())
            .then(data => setApiResponse(JSON.stringify(data, null, 2)))
            .catch((error) => console.error('Error:', error));

          fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/rev_geocode?latitude=${e.latlng.lat}&longitude=${e.latlng.lng}`)
            .then(response => response.json())
            .then(data => {
              setAddress(data.address);
            })
            .catch((error) => console.error('Error:', error));
        });
      }
    });
  
    useEffect(() => {
      if (position) {
        map.flyTo(position, zoom,  {
            animate: true,
            duration: 0.5
          });
      }
    }, [zoom, position]);
  
    return null;
  };

  const bounds = [
    [24.396308, -125.000000],
    [49.384358, -66.934570]
  ];

  return (
    <ApiResponseContext.Provider value={apiResponse}>
        <div className={styles.mapContainer}>
            <div className={styles.searchBar}> 
                <SearchInput className={styles.searchInput} value={address}
                    onChange={event => setAddress(event.target.value)}
                    onKeyDown={event => {
                        if (event.key === 'Enter') {
                        fetchCoordinates(address).then(coords => {
                            if (coords) {
                                setPosition(coords);
                                handleMapClick(coords);
                                setZoom(18);
                            }
                        });
                        }
                    }}/>
                {showIcon && 
                    <IconButton className={styles.iconButton} onClick={handleButtonClick} aria-label="Some Menu">
                        <Pin />
                    </IconButton> }
            </div>  
            <div className={styles.mapBox}> 
                <MapContainer center={[37.8, -96]} zoom={zoom} style={{ height: '500px', width: '100%', zIndex: '1' }} maxBounds={bounds} minZoom={4}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution={selectedCoords ? `Selected Coordinates: ${selectedCoords.lat}, ${selectedCoords.lng}`: ''} />
                    <MapEvents />
                    {position !== null && <Marker position={position} icon={icons.selected}/>}
                    {showMarkers && apiResponse && JSON.parse(apiResponse).slice(1).map((item, index) => (
                    <Circle center={position} radius={5000} fillOpacity={0.02} />
                    ))}
                    {showMarkers && apiResponse && JSON.parse(apiResponse).slice(1).map((item, index) => (
                    <Marker key={index} position={[item.latitude, item.longitude]} icon={icons[item.year]} />
                    ))}
                </MapContainer>
                <div className={styles.solution}> 
                    {showMarkers && <Legend />}
                </div>
            </div>
        </div>
    </ApiResponseContext.Provider>
  );
};

export default Map;