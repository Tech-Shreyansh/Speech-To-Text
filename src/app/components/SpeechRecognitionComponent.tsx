'use client'

import React, { useState, useEffect } from 'react';

interface SpeechRecognitionComponentProps {}

const SpeechRecognitionComponent: React.FC<SpeechRecognitionComponentProps> = () => {
  const [transcription, setTranscription] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [averageIntensity, setAverageIntensity] = useState<number>(0);
  let analyser: AnalyserNode;
  let bufferLength: number;
  let dataArray: Uint8Array;

  const updateVoiceIntensity = () => {
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const avgIntensity = (sum / bufferLength / 255) * 10;
    setAverageIntensity(avgIntensity);
    requestAnimationFrame(updateVoiceIntensity);
  };

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        updateVoiceIntensity();
      })
      .catch(error => {
        console.error('Error accessing microphone:', error);
      });
  }, []);

  const startRecording = () => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-US';
    setTranscription("");
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200">
      {!isListening && (
        <button onClick={startRecording} className="px-4 py-2 mb-4 text-white bg-blue-500 rounded-lg shadow-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 transition duration-300 ease-in-out">
          Start Recording
        </button>
      )}
      {transcription && <p className="mb-4 text-lg">{transcription}</p>}
      {isListening && (
        <div className="flex flex-col items-center">
          {/* <p className="mb-2 text-lg">Voice Intensity: {averageIntensity.toFixed(2)}</p> */}
          <div className="relative w-64 h-4 bg-blue-200 rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-blue-500 rounded-lg" style={{ width: `${averageIntensity * 10}%` }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeechRecognitionComponent;