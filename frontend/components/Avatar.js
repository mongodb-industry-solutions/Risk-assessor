import React, { useEffect, useRef, useState } from 'react';
import { useMarkers } from "../context/Markers";
import { connectTalkStream, destroyStream, playIdleVideo, setRTCPeerConnection, startTalkStream } from '@/handlers/avatar';
import Play from "@leafygreen-ui/icon/dist/Play";
import Stop from "@leafygreen-ui/icon/dist/Stop";
import IconButton from "@leafygreen-ui/icon-button";
import { H2, Body } from "@leafygreen-ui/typography";


const Avatar = () => {
  const { llmResponse, setLoading } = useMarkers();
  const videoRef = useRef(null);
  const [isIntroPlaying, setIsIntroPlaying] = useState(false);

  const intro =
    "Welcome to the leafy business loan risk assessor, it assumes the scenario of an application for a business loan to start/expand a business that requires a physical real estate (eg. a bakery shop, restaurant, etc). \n 1. Please indicate the business location of your real estate. \n 2. Please provide a brief description of your loan purpose and business plan. \n 3. Please scroll down to see the response after submission.";
  

  const introParagraphs = intro.split("\n").map((line, index) => (
    <Body key={index} style={{ marginTop: "5px",fontSize : "18px" }} >
      {line}
    </Body>
  ));

useEffect(() => {
  console.log('USE EFFECT 1') 
  videoRef.current.src = 'Avatar_idle.mp4';
  videoRef.current.play();
  setRTCPeerConnection();
  connectTalkStream()
  .then(res => {
    //console.log('connectTalkStream response ', videoRef.current.src, res)
    // if(videoRef.current.src.includes('Avatar_intro.mp4'))
    //     return
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
    const cleanedLlmResponse =  "  " + llmResponse.replace(/\*/g, '');
    console.log('llmResponse:', cleanedLlmResponse);
    startTalkStream(cleanedLlmResponse)
    .then(res => {setLoading(false);})
    return () => {
      console.log('clean component destroyStream')
      destroyStream()
    };
  }
}, [llmResponse]);

const handleButtonClick = () => {
  if (isIntroPlaying) {
    // If intro is currently playing, switch to idle
    videoRef.current.src = 'Avatar_idle.mp4';
    videoRef.current.loop = true;
  } else {
    // If idle is currently playing, switch to intro
    videoRef.current.src = 'Avatar_intro.mp4';
    videoRef.current.muted = false; // Assuming you don't want the intro to loop
  }
  videoRef.current.play().catch(error => console.error("Video play failed", error));
  setIsIntroPlaying(!isIntroPlaying); // Toggle the state
};

return (
  <div>
    <div style={{ 
      display: 'flex', 
      justifyContent: 'left', 
      alignItems: 'left', 
    }}>
      <H2>Instructions</H2>
      <IconButton aria-label="Play" style={{ margin: '8px 5px'}} onClick={handleButtonClick}>
        {isIntroPlaying ? <Stop /> : <Play />}
      </IconButton>
    </div>
    <div>
      {introParagraphs}
    </div>
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
    }}>
      <video 
        id="stream-video-element" 
        width="400" 
        height="400" 
        autoPlay muted
        src='Avatar_idle.mp4'
        playsInline=""
        ref={videoRef}
      />
    </div>
  </div>
);
};

export default Avatar;