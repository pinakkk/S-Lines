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

          // Get more precise head positioning using landmarks
          const faceOutline = landmarks.getFaceOutline();
          const noseBridge = landmarks.getNose();
          const leftEyebrow = landmarks.getLeftEyeBrow();
          const rightEyebrow = landmarks.getRightEyeBrow();

          // Calculate head boundaries more accurately
          const topOfEyebrows = Math.min(
            ...leftEyebrow.map((p) => p.y),
            ...rightEyebrow.map((p) => p.y)
          );

          // Estimate forehead area above eyebrows
          const foreheadHeight = (topOfEyebrows - faceBox.y) * 0.8;
          const topOfHead = Math.max(0, topOfEyebrows - foreheadHeight);

          // Get head width from face outline
          const leftSide = Math.min(...faceOutline.slice(0, 9).map((p) => p.x));
          const rightSide = Math.max(...faceOutline.slice(8, 17).map((p) => p.x));
          const headWidth = rightSide - leftSide;

          const numLines = Math.floor(Math.random() * 4) + 2;

          for (let i = 0; i < numLines; i++) {
            // Position lines more precisely on the head
            const xOffset = (Math.random() - 0.5) * headWidth * 0.6;
            const x = leftSide + headWidth * 0.5 + xOffset;

            // Start lines from above the head and end at forehead/eyebrow area
            const startY = Math.max(0, topOfHead - Math.random() * 80);
            const endY = topOfEyebrows + Math.random() * 30;

            // Create more natural curved line paths
            const controlX1 = x + (Math.random() - 0.5) * 25;
            const controlY1 = startY + (endY - startY) * 0.25;
            const controlX2 = x + (Math.random() - 0.5) * 30;
            const controlY2 = startY + (endY - startY) * 0.75;

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
              x + (Math.random() - 0.5) * 15,
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
              x + (Math.random() - 0.5) * 15,
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
              x + (Math.random() - 0.5) * 15,
              endY
            );
            context.strokeStyle = '#ffaaaa';
            context.lineWidth = 1;
            context.stroke();
          }
        } else {
          // Improved fallback for when no face is detected
          const centerX = canvas.width * 0.5;
          const headTop = canvas.height * 0.15;
          const headBottom = canvas.height * 0.35;
          const headWidth = canvas.width * 0.25;

          const numLines = Math.floor(Math.random() * 3) + 1;
          for (let i = 0; i < numLines; i++) {
            const xOffset = (Math.random() - 0.5) * headWidth;
            const x = centerX + xOffset;
            const startY = headTop - Math.random() * 60;
            const endY = headBottom - Math.random() * 40;

            const controlX1 = x + (Math.random() - 0.5) * 40;
            const controlY1 = startY + (endY - startY) * 0.3;
            const controlX2 = x + (Math.random() - 0.5) * 50;
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
              x + (Math.random() - 0.5) * 25,
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
      <div className="flex flex-col items-center space-y-4 px-4">
        {/* Boot Screen - Responsive */}
        <div className="relative">
          <div className="w-full max-w-[640px] aspect-[4/3] bg-black border-2 sm:border-4 border-green-500 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(34,197,94,0.5)] sm:shadow-[0_0_30px_rgba(34,197,94,0.5)] flex flex-col justify-center items-center">
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
            <div className="z-10 text-center space-y-4 sm:space-y-6 px-4">
              <Power className="w-12 h-12 sm:w-16 sm:h-16 text-green-400 animate-pulse mx-auto" />
              <div className="font-mono text-green-400 space-y-2">
                <div className="text-lg sm:text-2xl font-bold">S-LINE OS v2.0</div>
                <div className="text-sm sm:text-lg">{bootText}</div>
              </div>

              {/* Progress bar */}
              <div className="w-60 sm:w-80 bg-gray-800 rounded-full h-3 sm:h-4 border border-green-500 mx-auto">
                <div
                  className="bg-gradient-to-r from-green-600 to-green-400 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                  style={{ width: `${bootProgress}%` }}
                ></div>
              </div>
              <div className="font-mono text-green-300 text-xs sm:text-sm">
                {Math.round(bootProgress)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4 sm:space-y-6 px-4">
      {/* Enhanced Camera Display - Responsive */}
      <div className="relative w-full max-w-[640px]">
        {/* Outer frame with enhanced neon effect */}
        <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 rounded-lg sm:rounded-xl blur-sm opacity-75 animate-pulse"></div>

        <div className="relative border-2 sm:border-4 border-pink-500 rounded-lg overflow-hidden shadow-[0_0_25px_rgba(236,72,153,0.6)] sm:shadow-[0_0_40px_rgba(236,72,153,0.6)] bg-black">
          {/* Corner decorations */}
          <div className="absolute top-1 left-1 sm:top-2 sm:left-2 w-4 h-4 sm:w-6 sm:h-6 border-l-2 border-t-2 border-pink-400 z-10"></div>
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-4 h-4 sm:w-6 sm:h-6 border-r-2 border-t-2 border-pink-400 z-10"></div>
          <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 w-4 h-4 sm:w-6 sm:h-6 border-l-2 border-b-2 border-pink-400 z-10"></div>
          <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-4 h-4 sm:w-6 sm:h-6 border-r-2 border-b-2 border-pink-400 z-10"></div>

          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full aspect-[4/3] object-cover"
            />
          ) : (
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/png"
              videoConstraints={videoConstraints}
              className="w-full aspect-[4/3] object-cover"
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
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex space-x-1 sm:space-x-2 z-10">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
          </div>

          {/* Timestamp overlay */}
          <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 font-mono text-green-400 text-xs sm:text-sm bg-black bg-opacity-50 px-1 py-0.5 sm:px-2 sm:py-1 rounded z-10">
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Enhanced Controls - Responsive */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full max-w-md sm:max-w-none">
        {!capturedImage ? (
          <button
            onClick={capturePhoto}
            disabled={isCapturing}
            className="group relative bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 px-6 py-3 sm:px-8 sm:py-4 rounded-lg text-white font-bold text-base sm:text-lg font-mono border-2 border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.4)] sm:shadow-[0_0_25px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] sm:hover:shadow-[0_0_40px_rgba(236,72,153,0.6)] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 overflow-hidden w-full sm:w-auto"
          >
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

            <div className="relative flex items-center justify-center space-x-2">
              {isCapturing ? (
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
              ) : (
                <Camera className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-pulse" />
              )}
              <span>{isCapturing ? 'CAPTURING...' : 'TAKE PHOTO'}</span>
            </div>
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <button
              onClick={downloadPhoto}
              className="group relative bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-6 py-3 sm:px-8 sm:py-4 rounded-lg text-white font-bold text-base sm:text-lg font-mono border-2 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)] sm:shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] sm:hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] transition-all duration-300 transform hover:scale-105 overflow-hidden w-full sm:w-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center space-x-2">
                <Download className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-bounce" />
                <span>DOWNLOAD</span>
              </div>
            </button>
            <button
              onClick={retakePhoto}
              className="group relative bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 px-6 py-3 sm:px-8 sm:py-4 rounded-lg text-white font-bold text-base sm:text-lg font-mono border-2 border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.4)] sm:shadow-[0_0_25px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] sm:hover:shadow-[0_0_40px_rgba(249,115,22,0.6)] transition-all duration-300 transform hover:scale-105 overflow-hidden w-full sm:w-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center space-x-2">
                <Camera className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-pulse" />
                <span>RETAKE</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Status - Responsive */}
      <div className="text-center space-y-2">
        <p className="text-pink-300 font-mono text-xs sm:text-sm animate-pulse">
          S-LINE EFFECT READY • AI ENHANCED
        </p>
        <div className="flex justify-center space-x-2">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-pink-500 rounded-full animate-pulse"></div>
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-pulse delay-75"></div>
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-500 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
};

export default CameraBooth;