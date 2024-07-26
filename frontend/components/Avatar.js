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
  const [videoState, setVideoState] = useState({
    sdpResponse: null, //this will be true if we connected successfully to D-ID plugin (200 code)
    isIntroPlaying: false, // 
    isDidPlaying: false, // 
  });

  const intro =
    "Welcome to the leafy business loan risk assessor, it assumes the scenario of an application for a business loan to start/expand a business that requires a physical real estate (eg. a bakery shop, restaurant, etc). \n 1. Please indicate the business location of your real estate. \n 2. Please provide a brief description of your loan purpose and business plan. \n 3. Please scroll down to see the response after submission.";
  

  const introParagraphs = intro.split("\n").map((line, index) => (
    <Body baseFontSize={16} key={index} style={{ marginTop: "5px" }}>
      {line}
    </Body>
  ));

  const onVideoFinishHnd = () => {
    playIdleVideo()
    setVideoState({
      ...videoState,
      isDidPlaying: false,
      isIntroPlaying: false
    })
  }

useEffect(() => {
  console.log('USE EFFECT 1') 
  videoRef.current.src = 'Avatar_idle.mp4';
  videoRef.current.play();
  setRTCPeerConnection();
  connectTalkStream()
  .then(res => {
    //console.log('connectTalkStream response ', videoRef.current.src, res)
    setVideoState({
      ...videoState,
      sdpResponse: res.sdpResponse.status === 200
    })
    videoRef.current.addEventListener("ended", onVideoFinishHnd)
  })
  .catch(err => {
    setVideoState({
      ...videoState,
      sdpResponse: false
    })
  })
}, [])


useEffect(() => {
  console.log('USE EFFECT 2')
  if (llmResponse !== null && llmResponse !== '') {
    const cleanedLlmResponse =  "  " + llmResponse.replace(/\*/g, '');
    console.log('llmResponse:', cleanedLlmResponse);
    startTalkStream(cleanedLlmResponse)
    .then(res => { // then will be called after D-DID stream has been created
      setLoading(false);
      setVideoState({
        ...videoState,
        isDidPlaying: true
      })
    })  
    .catch(err => {
      setVideoState({
        ...videoState,
        isDidPlaying: false,
      })
    })
    return () => {
      console.log('clean component destroyStream')
      destroyStream()
    };
  }
}, [llmResponse]);

const handleButtonClick = () => {
  if (videoState.isIntroPlaying) {
    // If intro is currently playing, switch to idle
    videoRef.current.src = 'Avatar_idle.mp4';
    videoRef.current.loop = true;
  } else {
    // If idle is currently playing, switch to intro
    videoRef.current.src = 'Avatar_intro.mp4';
    videoRef.current.loop = false;
    videoRef.current.muted = false;
  }
  videoRef.current.play().catch(error => console.error("Video play failed", error));
  setVideoState({...videoState, isIntroPlaying: !videoState.isIntroPlaying}); // Toggle the state
};

return (
  <div>
    <div style={{ 
      display: 'flex', 
      justifyContent: 'left', 
      alignItems: 'left', 
    }}>
      <H2>Instructions</H2>
      <IconButton 
        aria-label="Play" 
        style={{ margin: '8px 5px'}} 
        disabled={videoState.isDidPlaying} 
        onClick={handleButtonClick}
      >
        {videoState.isIntroPlaying ? <Stop /> : <Play />}
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