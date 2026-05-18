"use client";

import React, { useEffect } from "react";
import { useStore } from "@/hooks/useStore";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useFaceTracking } from "@/hooks/useFaceTracking";
import Scene from "@/components/ar/Scene";
import Avatar from "@/components/ar/Avatar";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = React.use(params);
  const { userId, setUserId, userName, selectedAvatar, participants, isMuted, toggleMute, setUserName } = useStore();
  
  // Generate random user ID if missing
  useEffect(() => {
    if (!userId) {
      setUserId(uuidv4());
    }
  }, [userId, setUserId]);

  // Generate random name if default on client
  useEffect(() => {
    if (userName === "User") {
      setUserName(`User_${Math.random().toString(36).substring(7)}`);
    }
  }, [userName, setUserName]);
  
  const trackingData = useFaceTracking();
  const { sendTrackingUpdate } = useWebRTC(roomId);

  // Send tracking updates to peers
  useEffect(() => {
    if (trackingData) {
      sendTrackingUpdate(trackingData);
    }
  }, [trackingData, sendTrackingUpdate]);

  const participantList = Object.values(participants);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold font-sans">ARCALL Room</h1>
          <p className="text-xs text-zinc-500">ID: {roomId}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">{userName} (You)</span>
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
        </div>
      </div>

      {/* Grid Layout (Google Meet inspired) */}
      <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        {/* Local Participant */}
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden relative shadow-xl">
          <div className="absolute top-4 left-4 z-10 bg-black/50 px-3 py-1 rounded-full text-xs font-medium">
            You
          </div>
          {isMuted && (
            <div className="absolute top-4 right-4 z-10 bg-red-500/80 p-1.5 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H3a1 1 0 01-1-1V8a1 1 0 011-1h1.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10a7.971 7.971 0 00-2.343-5.657 1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.414 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.758 4.243 1 1 0 01-1.414-1.414A3.982 3.982 0 0013 10a3.982 3.982 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          <Scene>
            <Avatar url={selectedAvatar} trackingData={trackingData} />
          </Scene>
        </div>

        {/* Remote Participants */}
        {participantList.map((participant) => (
          <div key={participant.userId} className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden relative shadow-xl">
            <div className="absolute top-4 left-4 z-10 bg-black/50 px-3 py-1 rounded-full text-xs font-medium">
              {participant.userName}
            </div>
            {participant.isSpeaking && (
              <div className="absolute inset-0 border-2 border-cyan-500 rounded-2xl pointer-events-none animate-pulse"></div>
            )}
            <Scene>
              <Avatar url={participant.avatar} trackingData={participant.trackingData} />
            </Scene>
          </div>
        ))}
      </div>

      {/* Bottom Toolbar */}
      <div className="bg-zinc-900 border-t border-zinc-800 px-6 py-6 flex justify-center items-center gap-6">
        {/* Mute Button */}
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full transition-all transform hover:scale-105 active:scale-95 ${
            isMuted ? "bg-red-500 hover:bg-red-600" : "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
          }`}
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>

        {/* Leave Room Button */}
        <button
          onClick={() => window.location.href = "/"}
          className="bg-red-500 hover:bg-red-600 p-4 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-red-500/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
