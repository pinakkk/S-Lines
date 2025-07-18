import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from '@vladmandic/face-api';
import { Camera, Download, Zap } from 'lucide-react';

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: 'user',
};

const CameraBooth = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models');
        setModelsLoaded(true);
      } catch (error) {
        console.error('Error loading face detection models:', error);
        setModelsLoaded(true); // Continue without face detection
      }
    };
    loadModels();
  }, []);

  const applyRedLineFilter = useCallback(
    async (canvas: HTMLCanvasElement, video: HTMLVideoElement) => {
      const context = canvas.getContext('2d');
      if (!context) return;

      try {
        let result = null;

        // Add timeout for face detection
        if (modelsLoaded) {
          const detectFace = faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks(true);

          // Race between face detection and timeout
          result = await Promise.race([
            detectFace,
            new Promise((resolve) => setTimeout(() => resolve(null), 2000)), // 2 second timeout
          ]);
        }

        if (result && result.landmarks) {
          const faceBox = result.detection.box;
          const landmarks = result.landmarks;

          // Get face boundaries
          const jawLine = landmarks.getJawOutline();
          const topOfHead = Math.max(0, faceBox.y - faceBox.height * 0.3);
          const bottomOfFace = Math.max(...jawLine.map((p) => p.y));

          // Generate random red lines above the head
          const numLines = Math.floor(Math.random() * 4) + 2; // 2-5 lines

          for (let i = 0; i < numLines; i++) {
            const x = faceBox.x + Math.random() * faceBox.width;
            const startY = Math.max(0, topOfHead - Math.random() * 100);
            const endY = topOfHead + Math.random() * 50;

            // Create glowing red line effect
            context.shadowColor = '#ff0000';
            context.shadowBlur = 10;
            context.beginPath();
            context.moveTo(x, startY);
            context.lineTo(x, endY);
            context.strokeStyle = '#ff0000';
            context.lineWidth = 4;
            context.stroke();

            // Add inner bright line
            context.shadowBlur = 0;
            context.beginPath();
            context.moveTo(x, startY);
            context.lineTo(x, endY);
            context.strokeStyle = '#ff6666';
            context.lineWidth = 2;
            context.stroke();
          }
        } else {
          // Fallback: add random lines in center area if no face detected
          const numLines = Math.floor(Math.random() * 3) + 1;
          for (let i = 0; i < numLines; i++) {
            const x = canvas.width * 0.3 + Math.random() * (canvas.width * 0.4);
            const startY = canvas.height * 0.1;
            const endY = canvas.height * 0.4;

            context.shadowColor = '#ff0000';
            context.shadowBlur = 10;
            context.beginPath();
            context.moveTo(x, startY);
            context.lineTo(x, endY);
            context.strokeStyle = '#ff0000';
            context.lineWidth = 4;
            context.stroke();
          }
        }
      } catch (error) {
        console.error('Error applying red line filter:', error);
        // Apply fallback effect even on error
        const numLines = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numLines; i++) {
          const x = canvas.width * 0.3 + Math.random() * (canvas.width * 0.4);
          const startY = canvas.height * 0.1;
          const endY = canvas.height * 0.4;

          context.shadowColor = '#ff0000';
          context.shadowBlur = 10;
          context.beginPath();
          context.moveTo(x, startY);
          context.lineTo(x, endY);
          context.strokeStyle = '#ff0000';
          context.lineWidth = 4;
          context.stroke();
        }
      }
    },
    [modelsLoaded]
  );

  const capturePhoto = async () => {
    if (!webcamRef.current || !canvasRef.current) return;

    setIsCapturing(true);

    try {
      const video = webcamRef.current.video as HTMLVideoElement;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        setIsCapturing(false);
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Apply retro filter
      context.globalCompositeOperation = 'multiply';
      const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(255, 182, 193, 0.3)');
      gradient.addColorStop(1, 'rgba(147, 112, 219, 0.3)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.globalCompositeOperation = 'source-over';

      // Apply red line filter with timeout
      await applyRedLineFilter(canvas, video);

      // Add retro vignette effect
      const vignetteGradient = context.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) / 2
      );
      vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      context.fillStyle = vignetteGradient;
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Convert to data URL and set as captured image
      const dataURL = canvas.toDataURL('image/png');
      setCapturedImage(dataURL);
    } catch (error) {
      console.error('Error capturing photo:', error);
      // Still try to capture basic photo without effects
      const video = webcamRef.current.video as HTMLVideoElement;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL('image/png');
        setCapturedImage(dataURL);
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const downloadPhoto = () => {
    if (!capturedImage) return;

    const link = document.createElement('a');
    link.download = `s-line-photo-${Date.now()}.png`;
    link.href = capturedImage;
    link.click();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Camera/Photo Display */}
      <div className="relative">
        <div className="border-4 border-pink-500 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(236,72,153,0.5)] bg-black">
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-[640px] h-[480px] object-cover"
            />
          ) : (
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/png"
              videoConstraints={videoConstraints}
              className="w-[640px] h-[480px] object-cover"
            />
          )}
        </div>

        {/* Retro scanlines overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
            }}
          ></div>
        </div>
      </div>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      <div className="flex space-x-4">
        {!capturedImage ? (
          <button
            onClick={capturePhoto}
            disabled={isCapturing}
            className="group bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 px-8 py-4 rounded-lg text-white font-bold text-lg font-mono border-2 border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
          >
            <div className="flex items-center space-x-2">
              {isCapturing ? (
                <Zap className="w-6 h-6 animate-pulse" />
              ) : (
                <Camera className="w-6 h-6 group-hover:animate-pulse" />
              )}
              <span>{isCapturing ? 'CAPTURING...' : 'TAKE PHOTO'}</span>
            </div>
          </button>
        ) : (
          <div className="flex space-x-4">
            <button
              onClick={downloadPhoto}
              className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-8 py-4 rounded-lg text-white font-bold text-lg font-mono border-2 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center space-x-2">
                <Download className="w-6 h-6 group-hover:animate-bounce" />
                <span>DOWNLOAD</span>
              </div>
            </button>
            <button
              onClick={retakePhoto}
              className="group bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 px-8 py-4 rounded-lg text-white font-bold text-lg font-mono border-2 border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center space-x-2">
                <Camera className="w-6 h-6 group-hover:animate-pulse" />
                <span>RETAKE</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Status indicator */}
      <div className="text-center">
        <p className="text-pink-300 font-mono text-sm">
          {!modelsLoaded
            ? 'Loading AI models...'
            : 'Ready to capture with S-Line effect!'}
        </p>
      </div>
    </div>
  );
};

export default CameraBooth;