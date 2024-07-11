import React, { useState, useEffect, useRef } from 'react';
import { useMarkers } from "../context/Markers";


const Avatar = () => {
  const { llmResponse } = useMarkers();
  const videoSources = ['Avatar_idle.mp4', 'Avatar_intro.mp4', 'Avatar_idle2.mp4'];
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef(null);

  const handleVideoEnd = () => {
    setCurrentVideoIndex((currentVideoIndex + 1) % videoSources.length);
  };

  const handleUserInteraction = () => {
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => {
        if (videoSources[currentVideoIndex] !== 'Avatar_idle.mp4') {
          videoRef.current.muted = false;
        }
      }).catch(error => {
        console.error('Autoplay was prevented:', error);
      });
    }
  };

useEffect(() => {
  const videoSrc = videoSources[currentVideoIndex];
  videoRef.current.src = videoSrc;
  videoRef.current.muted = true; // Start muted
  videoRef.current.loop = videoSrc === 'Avatar_idle2.mp4';
  
  videoRef.current.play().then(() => {
    if (videoSrc !== 'Avatar_idle.mp4') {
      videoRef.current.muted = false; // Unmute after playback starts
    }
  }).catch(error => {
    console.error('Autoplay was prevented:', error);
  });

  document.addEventListener('click', handleUserInteraction);
  
  return () => {
    document.removeEventListener('click', handleUserInteraction);
  };
}, [currentVideoIndex]);

useEffect(() => {
  if (llmResponse !== null && llmResponse !== '') {
    console.log('llmResponse:', llmResponse);
    const cleanedLlmResponse = llmResponse.replace(/\*/g, '');
    fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.NEXT_PUBLIC_D_ID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_url: 'https://fsi-avatars.s3.amazonaws.com/Avatar.png',
        script: {
          type: 'text',
          input: cleanedLlmResponse
        }
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      const id = data.id;

      return new Promise(resolve => setTimeout(resolve, 2000))
        .then(() => fetch(`https://api.d-id.com/talks/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${process.env.NEXT_PUBLIC_D_ID_API_KEY}`,
          },
        }));
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      const resultUrl = data.result_url;
      videoRef.current.src = resultUrl;
      videoRef.current.muted = false;
      videoRef.current.play().catch(error => {
        console.error('Error playing video:', error);
      });
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }
}, [llmResponse]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
    }}>
      <video 
        ref={videoRef}
        autoPlay 
        onEnded={handleVideoEnd} 
        style={{ maxWidth: '510px', maxHeight: '510px' }} 
      />
    </div>
  );
};

export default Avatar;
