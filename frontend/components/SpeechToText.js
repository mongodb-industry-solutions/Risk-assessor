import React, { useState, useRef } from "react";
import Megaphone from '@leafygreen-ui/icon/dist/Megaphone';
import IconButton from '@leafygreen-ui/icon-button';

const SpeechToText = ({ onSpeechResult }) => {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  const handleSpeechRecognitionResult = (event) => {
    let result = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      result += event.results[i][0].transcript;
    }
    onSpeechResult(result);
  };

  const toggleSpeechRecognition = () => {
    if (isRecording) {
      setIsRecording(false);
      recognitionRef.current.stop();
    } else {
      recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      const recognition = recognitionRef.current;
      recognition.continuous = true; // Set to true for continuous recording
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        handleSpeechRecognitionResult(event);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.start();
    }
  };

  return (
    <IconButton  
      onClick={toggleSpeechRecognition} aria-label="Some Menu"
      style={{margin:'3px 5px'}}>
        <Megaphone />
    </IconButton> 
  );
};

export default SpeechToText;
