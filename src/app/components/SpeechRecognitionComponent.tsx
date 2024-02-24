'use client'

import React, { useState, useEffect } from 'react';

interface SpeechRecognitionComponentProps {}

const SpeechRecognitionComponent: React.FC<SpeechRecognitionComponentProps> = () => {
  const [transcription, setTranscription] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
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
    setWaveformData(prevData => [...prevData.slice(-200), avgIntensity]); // Keep last 200 data points
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

  const renderWaveform = () => {
    const pathData = waveformData.map((intensity, index) => `${index * 3},${50 - intensity * 20}`).join(" ");
    return <polyline points={pathData} fill="none" stroke="#3182ce" strokeWidth="2" />;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200">
      {!isListening && (
        <button onClick={startRecording} className="px-4 py-2 mb-4 text-white bg-blue-500 rounded-lg shadow-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 transition duration-300 ease-in-out">
          Start Recording
        </button>
      )}
      {transcription && <p className="mb-4 text-lg px-4 md:w-2/5">{transcription}</p>}
      {isListening && (
        <div className="flex flex-col items-center h-full">
          <svg width="600" height="100">
            {renderWaveform()}
          </svg>
        </div>
      )}
    </div>
  );
};

export default SpeechRecognitionComponent;