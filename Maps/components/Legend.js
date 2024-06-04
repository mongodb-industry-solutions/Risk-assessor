// Legend.js
import React from 'react';

const yearColors = {
    2016: 'Blue',
    2017: 'Green',
    2018: 'Yellow',
    2019: 'Orange',
    2020: 'Red',
  };

const Legend = () => {
  return (
    <div>
      <div>Legend:</div>
      {Object.entries(yearColors).map(([year, color]) => (
        <div key={year} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: color, marginRight: '10px' }}></div>
          <div>{year}</div>
        </div>
      ))}
    </div>
  );
};

export default Legend;