// ParentComponent.js
import React, { useState, useEffect } from 'react';
import Map from './Map';
import BusinessPlan from './BusinessPlan';

const ParentComponent = () => {
  const [apiResponse, setApiResponse] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showMarkers, setShowMarkers] = useState(false);
  const [zoom, setZoom] = useState(11);

  const handleMapClick = async (latlng) => {
    // Fetch data here and setApiResponse
    // Set isLoading to false when done
  };

  const handleButtonClick = () => {
    setShowMarkers(prevShowMarkers => !prevShowMarkers);
    setZoom(prevZoom => prevZoom === 11 ? 18 : 11);
  };

  useEffect(() => {
    // Fetch initial data here and setApiResponse
    // Set isLoading to false when done
  }, []);

  return (
    <div>
      {isLoading ? 'Loading...' : (
        <>
          <Map 
            onMapClick={handleMapClick} 
            onButtonClick={handleButtonClick} 
            showMarkers={showMarkers} 
            zoom={zoom} 
          />
          <BusinessPlan apiResponse={apiResponse} />
        </>
      )}
    </div>
  );
};

export default ParentComponent;