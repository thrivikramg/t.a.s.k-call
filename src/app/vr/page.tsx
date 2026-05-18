"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useVRStore } from "@/store/vr/useVRStore";
import { v4 as uuidv4 } from "uuid";

export default function VRLandingPage() {
  const router = useRouter();
  const [roomInput, setRoomInput] = useState("");
  const { setRoomId, userName, setUserName } = useVRStore();

  const handleCreateRoom = () => {
    const newRoomId = uuidv4().substring(0, 8);
    setRoomId(newRoomId);
    router.push(`/vr/select-avatar?room=${newRoomId}`);
  };

  const handleJoinRoom = () => {
    if (roomInput.trim()) {
      setRoomId(roomInput.trim());
      router.push(`/vr/select-avatar?room=${roomInput.trim()}`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900 opacity-50 z-0" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] z-0" />

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-4xl w-full px-6 flex flex-col items-center"
      >
        {/* App Name */}
        <motion.h1 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-6xl font-bold font-sans tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-4 text-center"
        >
          VR MODE
        </motion.h1>
        
        <p className="text-zinc-400 text-lg md:text-xl mb-12 text-center max-w-2xl">
          Immersive split-screen VR for Google Cardboard. Meet others in a 3D space using just your phone.
        </p>

        {/* Glassmorphism Card */}
        <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <div className="space-y-6">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Your Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="Enter your name"
              />
            </div>

            {/* Create Room Button */}
            <button
              onClick={handleCreateRoom}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/20"
            >
              Create VR Room
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-zinc-800 w-full"></div>
              <span className="bg-zinc-900/50 px-3 text-sm text-zinc-500 absolute">or</span>
            </div>

            {/* Join Room Input + Button */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Join with ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                  placeholder="Enter room ID"
                />
                <button
                  onClick={handleJoinRoom}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-6 rounded-lg transition-all border border-zinc-700 hover:border-zinc-600"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Elements (Visual Polish) */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-600 rounded-full filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-pink-600 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000" />
    </div>
  );
}
