"use client";

import { useVRStore } from "@/store/vr/useVRStore";

interface VRControlsProps {
  onLeave: () => void;
  onRecenter: () => void;
  onToggleScreenShare?: () => void;
}

export default function VRControls({ onLeave, onRecenter, onToggleScreenShare }: VRControlsProps) {
  const { isMuted, toggleMute, isSharingScreen } = useVRStore();

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  const ControlsGroup = () => (
    <div className="flex gap-4 items-center bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 backdrop-blur-sm">
      {/* Mute */}
      <button
        onClick={toggleMute}
        className={`p-3 rounded-full transition-all ${isMuted ? "bg-red-500 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H3a1 1 0 01-1-1V8a1 1 0 011-1h1.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10a7.971 7.971 0 00-2.343-5.657 1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.414 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.758 4.243 1 1 0 01-1.414-1.414A3.982 3.982 0 0013 10a3.982 3.982 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H3a1 1 0 01-1-1V8a1 1 0 011-1h1.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
            <path d="M14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10a7.971 7.971 0 00-2.343-5.657 1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.414 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.758 4.243 1 1 0 01-1.414-1.414A3.982 3.982 0 0013 10a3.982 3.982 0 00-1.172-2.828 1 1 0 010-1.414z" />
          </svg>
        )}
      </button>

      {/* Share Screen */}
      {onToggleScreenShare && (
        <button
          onClick={onToggleScreenShare}
          className={`p-3 rounded-full transition-all ${isSharingScreen ? "bg-purple-500 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>
      )}

      {/* Recenter */}
      <button onClick={onRecenter} className="p-3 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.582m0 0a8.001 8.001 0 01-15.356-2m0 0H15" />
        </svg>
      </button>

      {/* Fullscreen */}
      <button onClick={handleFullscreen} className="p-3 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
        </svg>
      </button>

      {/* Leave */}
      <button onClick={onLeave} className="p-3 rounded-full bg-red-500 text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="absolute bottom-10 inset-x-0 pointer-events-none flex z-50">
      {/* Left Eye UI */}
      <div className="w-1/2 h-full flex items-center justify-center pointer-events-auto">
        <ControlsGroup />
      </div>
      
      {/* Right Eye UI */}
      <div className="w-1/2 h-full flex items-center justify-center pointer-events-auto">
        <ControlsGroup />
      </div>
    </div>
  );
}
