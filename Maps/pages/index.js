// pages/index.js
import { useState, useEffect } from 'react';

function Home() {
  const [address, setAddress] = useState('1633 Broadway 38th floor, New York, NY 10019, United States');
  //const [coordinates, setCoordinates] = useState(null);
  const [IMG, setIMG] = useState();

  useEffect(() => {
    // Fetch coordinates when the component mounts
    fetchCoordinates();
  }, []); // Empty dependency array ensures the effect runs only once, similar to componentDidMount

  const fetchCoordinates = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/coordinates/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address })
      });
      const data = await response.json();
      console.log('data:', data);
      // setCoordinates(data);
      getImg(data)
    } catch (error) {
      console.error('Error fetching coordinates:', error);
    }
  };

  const getImg = async (data) => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(data),
        redirect: "follow"
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/static-map/`, requestOptions)
      
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      console.log('imageUrl:', imageUrl);

      setIMG(imageUrl);
    } catch (error) {
      console.error('Error fetching coordinates:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    fetchCoordinates();
  };

  return (
    <div>
      <h1>Find Coordinates</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Enter Address:
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '18px' }} // Apply styles here
          />
        </label>
        <button type="submit">Submit</button>
      </form>
      {IMG && (
        <div>
          <h2>Map:</h2>
          {/* <MapComponent coordinates={coordinates} /> */}
          <img src={IMG}/>
        </div>
      )}
    </div>
  );
}

export default Home;
