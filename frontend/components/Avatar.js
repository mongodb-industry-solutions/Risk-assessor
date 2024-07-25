import React, { useEffect, useRef } from 'react';
import { useMarkers } from "../context/Markers";
import { connectTalkStream, destroyStream, playIdleVideo, setRTCPeerConnection, startTalkStream } from '@/handlers/avatar';


const Avatar = () => {
  const { llmResponse, setLoading } = useMarkers();
  const videoRef = useRef(null);


useEffect(() => {
  console.log('USE EFFECT 1')
  setRTCPeerConnection();
  connectTalkStream()
  .then(res => {
    //console.log('connectTalkStream response ', videoRef.current.src, res)
    if(videoRef.current.src.includes('Avatar_intro.mp4'))
        return
    videoRef.current.src = 'Avatar_intro.mp4';
    var playPromise = videoRef.current.play();
    playPromise.then(() => {
      // if uncomment it will through:
      //muting failed and the element was paused instead because the user didn't interact with the document before 
      //videoRef.current.muted = false
    })
    videoRef.current.addEventListener("ended", playIdleVideo)
  })
}, [])


useEffect(() => {
  console.log('USE EFFECT 2')
  if (llmResponse !== null && llmResponse !== '') {
    const cleanedLlmResponse = llmResponse.replace(/\*/g, '');
    console.log('llmResponse:', cleanedLlmResponse);
    startTalkStream(cleanedLlmResponse)
    .then(res => {setLoading(false);})

    return () => {
      console.log('clean component destroyStream')
      destroyStream()
    };
  }
}, [llmResponse]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
    }}>
      <div>
          <video 
            id="stream-video-element" 
            width="400" 
            height="400" 
            autoPlay muted
            src='Avatar_idle.mp4'
            playsInline=""
            ref={videoRef}
          ></video>
        </div>
    </div>
  );
};

export default Avatar;
