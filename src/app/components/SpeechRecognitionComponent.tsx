'use client'

import React, { useState } from 'react';

interface SpeechRecognitionComponentProps {}

const SpeechRecognitionComponent: React.FC<SpeechRecognitionComponentProps> = () => {
  const [transcription, setTranscription] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);

  const startRecording = () => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onaudiostart = function(event: any) {
        console.log('Audio capturing started');
    };

    recognition.onresult = (event: any) => {
      const transcript: string = event.results[event.results.length - 1][0].transcript;
      setTranscription(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div>
      <button onClick={startRecording}>
        {isListening ? 'Stop Recording' : 'Start Recording'}
      </button>
      <p>{transcription}</p>
      {isListening && <p>Listening...</p>}
    </div>
  );
};

export default SpeechRecognitionComponent;