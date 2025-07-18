import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from '@vladmandic/face-api';
import { Camera, Download, Zap, Power } from 'lucide-react';

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
  const [isBooting, setIsBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [bootText, setBootText] = useState('INITIALIZING...');

  useEffect(() => {
    const bootSequence = async () => {
      const bootMessages = [
        'INITIALIZING...',
        'LOADING SYSTEM MODULES...',
        'CALIBRATING CAMERA...',
        'LOADING AI MODELS...',
        'FACE DETECTION READY',
        'S-LINE FILTER LOADED',
        'SYSTEM READY!',
      ];

      for (let i = 0; i < bootMessages.length; i++) {
        setBootText(bootMessages[i]);
        setBootProgress(((i + 1) * 100) / bootMessages.length);
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      // Load face detection models
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models');
        setModelsLoaded(true);
      } catch (error) {
        console.error('Error loading face detection models:', error);
        setModelsLoaded(true);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsBooting(false);
    };

    bootSequence();
  }, []);

  const applyRedLineFilter = useCallback(
    async (canvas: HTMLCanvasElement, video: HTMLVideoElement) => {
      const context = canvas.getContext('2d');
      if (!context) return;

      try {
        let result = null;

        if (modelsLoaded) {
          const detectFace = faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks(true);

          result = await Promise.race([
            detectFace,
            new Promise((resolve) => setTimeout(() => resolve(null), 2000)),
          ]);
        }

        if (result && result.landmarks) {
          const faceBox = result.detection.box;
          const landmarks = result.landmarks;

          const jawLine = landmarks.getJawOutline();
          const topOfHead = Math.max(0, faceBox.y - faceBox.height * 0.3);
          const bottomOfFace = Math.max(...jawLine.map((p) => p.y));

          const numLines = Math.floor(Math.random() * 4) + 2;

          for (let i = 0; i < numLines; i++) {
            const x = faceBox.x + Math.random() * faceBox.width;
            const startY = Math.max(0, topOfHead - Math.random() * 100);
            const endY = topOfHead + Math.random() * 50;

            // Create curved line path
            const controlX1 = x + (Math.random() - 0.5) * 30;
            const controlY1 = startY + (endY - startY) * 0.3;
            const controlX2 = x + (Math.random() - 0.5) * 40;
            const controlY2 = startY + (endY - startY) * 0.7;

            // Outer glow
            context.shadowColor = '#ff0000';
            context.shadowBlur = 15;
            context.beginPath();
            context.moveTo(x, startY);
            context.bezierCurveTo(
              controlX1,
              controlY1,
              controlX2,
              controlY2,
              x + (Math.random() - 0.5) * 20,
              endY
            );
            context.strokeStyle = '#ff0000';
            context.lineWidth = 6;
            context.stroke();

            // Inner bright line
            context.shadowBlur = 0;
            context.beginPath();
            context.moveTo(x, startY);
            context.bezierCurveTo(
              controlX1,
              controlY1,
              controlX2,
              controlY2,
              x + (Math.random() - 0.5) * 20,
              endY
            );
            context.strokeStyle = '#ff6666';
            context.lineWidth = 3;
            context.stroke();

            // Core bright line
            context.beginPath();
            context.moveTo(x, startY);
            context.bezierCurveTo(
              controlX1,
              controlY1,
              controlX2,
              controlY2,
              x + (Math.random() - 0.5) * 20,
              endY
            );
            context.strokeStyle = '#ffaaaa';
            context.lineWidth = 1;
            context.stroke();
          }
        } else {
          // Fallback curved lines
          const numLines = Math.floor(Math.random() * 3) + 1;
          for (let i = 0; i < numLines; i++) {
            const x = canvas.width * 0.3 + Math.random() * (canvas.width * 0.4);
            const startY = canvas.height * 0.1;
            const endY = canvas.height * 0.4;

            const controlX1 = x + (Math.random() - 0.5) * 50;
            const controlY1 = startY + (endY - startY) * 0.3;
            const controlX2 = x + (Math.random() - 0.5) * 60;
            const controlY2 = startY + (endY - startY) * 0.7;

            context.shadowColor = '#ff0000';
            context.shadowBlur = 15;
            context.beginPath();
            context.moveTo(x, startY);
            context.bezierCurveTo(
              controlX1,
              controlY1,
              controlX2,
              controlY2,
              x + (Math.random() - 0.5) * 30,
              endY
            );
            context.strokeStyle = '#ff0000';
            context.lineWidth = 6;
            context.stroke();
          }
        }
      } catch (error) {
        console.error('Error applying red line filter:', error);
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

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Enhanced retro filter
      context.globalCompositeOperation = 'multiply';
      const gradient = context.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(0, 'rgba(255, 182, 193, 0.4)');
      gradient.addColorStop(0.5, 'rgba(147, 112, 219, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 105, 180, 0.4)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.globalCompositeOperation = 'source-over';

      await applyRedLineFilter(canvas, video);

      // Enhanced vignette
      const vignetteGradient = context.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) / 2
      );
      vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignetteGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
      vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
      context.fillStyle = vignetteGradient;
      context.fillRect(0, 0, canvas.width, canvas.height);

      const dataURL = canvas.toDataURL('image/png');
      setCapturedImage(dataURL);
    } catch (error) {
      console.error('Error capturing photo:', error);
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

  if (isBooting) {
    return (
      <div className="flex flex-col items-center space-y-6">
        {/* Boot Screen */}
        <div className="relative">
          <div className="w-[640px] h-[480px] bg-black border-4 border-green-500 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(34,197,94,0.5)] flex flex-col justify-center items-center">
            {/* CRT scanlines */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
              <div
                className="h-full w-full"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.1) 2px, rgba(0,255,0,0.1) 4px)',
                }}
              ></div>
            </div>

            {/* Boot content */}
            <div className="z-10 text-center space-y-6">
              <Power className="w-16 h-16 text-green-400 animate-pulse mx-auto" />
              <div className="font-mono text-green-400 space-y-2">
                <div className="text-2xl font-bold">S-LINE OS v2.0</div>
                <div className="text-lg">{bootText}</div>
              </div>

              {/* Progress bar */}
              <div className="w-80 bg-gray-800 rounded-full h-4 border border-green-500">
                <div
                  className="bg-gradient-to-r from-green-600 to-green-400 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                  style={{ width: `${bootProgress}%` }}
                ></div>
              </div>
              <div className="font-mono text-green-300 text-sm">
                {Math.round(bootProgress)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Enhanced Camera Display */}
      <div className="relative">
        {/* Outer frame with enhanced neon effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 rounded-xl blur-sm opacity-75 animate-pulse"></div>

        <div className="relative border-4 border-pink-500 rounded-lg overflow-hidden shadow-[0_0_40px_rgba(236,72,153,0.6)] bg-black">
          {/* Corner decorations */}
          <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-pink-400 z-10"></div>
          <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-pink-400 z-10"></div>
          <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-pink-400 z-10"></div>
          <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-pink-400 z-10"></div>

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

          {/* Enhanced scanlines */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
              }}
            ></div>
          </div>

          {/* Status indicators */}
          <div className="absolute top-4 left-4 flex space-x-2 z-10">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
          </div>

          {/* Timestamp overlay */}
          <div className="absolute bottom-4 right-4 font-mono text-green-400 text-sm bg-black bg-opacity-50 px-2 py-1 rounded z-10">
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Enhanced Controls */}
      <div className="flex space-x-4">
        {!capturedImage ? (
          <button
            onClick={capturePhoto}
            disabled={isCapturing}
            className="group relative bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 px-8 py-4 rounded-lg text-white font-bold text-lg font-mono border-2 border-pink-400 shadow-[0_0_25px_rgba(236,72,153,0.4)] hover:shadow-[0_0_40px_rgba(236,72,153,0.6)] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 overflow-hidden"
          >
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

            <div className="relative flex items-center space-x-2">
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
              className="group relative bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-8 py-4 rounded-lg text-white font-bold text-lg font-mono border-2 border-green-400 shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] transition-all duration-300 transform hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-2">
                <Download className="w-6 h-6 group-hover:animate-bounce" />
                <span>DOWNLOAD</span>
              </div>
            </button>
            <button
              onClick={retakePhoto}
              className="group relative bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 px-8 py-4 rounded-lg text-white font-bold text-lg font-mono border-2 border-orange-400 shadow-[0_0_25px_rgba(249,115,22,0.4)] hover:shadow-[0_0_40px_rgba(249,115,22,0.6)] transition-all duration-300 transform hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-2">
                <Camera className="w-6 h-6 group-hover:animate-pulse" />
                <span>RETAKE</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Status */}
      <div className="text-center space-y-2">
        <p className="text-pink-300 font-mono text-sm animate-pulse">
          S-LINE EFFECT READY • AI ENHANCED
        </p>
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
};

export default CameraBooth;