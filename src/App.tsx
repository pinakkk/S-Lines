import React from 'react';
import CameraBooth from './components/CameraBooth';

const App = () => {
  return (
    <div className="app min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Retro grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      {/* Neon border effect */}
      <div className="absolute inset-4 border-2 border-pink-500 rounded-lg shadow-[0_0_20px_rgba(236,72,153,0.3)]"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-2 text-center font-mono">
          S-LINE
        </h1>
        <h2 className="text-2xl text-pink-300 mb-8 text-center font-mono tracking-wider">
          RETRO PHOTOBOOTH
        </h2>
        <CameraBooth />
      </div>
    </div>
  );
};

export default App;