import React from 'react';

const yearColors = {
  2019: 'red',
  2020: 'blue',
  2021: 'green',
  2022: 'orange',
  2023: 'purple',
  2024: 'lime',
};

const MapComponent = ({ coordinates }) => {
  
  
  if (!coordinates || coordinates.length === 0) {
    return null; // Return null if coordinates are not provided or empty
  }

  const center = `${coordinates[0].latitude},${coordinates[0].longitude}&markers=color:black%7Clabel:S%7C${coordinates[0].latitude},${coordinates[0].longitude}`;
  const markers = coordinates
    .slice(1) // Exclude the first coordinate used for center
    .map(coord => `&markers=color:${yearColors[coord.year]}%7Clabel:S%7C${coord.latitude},${coord.longitude}`)
    .join('');

  const url = `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=11&size=400x400${markers}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;

  //console.log(url);

  return <img src={url} alt="Map" />;
};

export default MapComponent;
