"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/hooks/useStore";
import Scene from "@/components/ar/Scene";
import Avatar from "@/components/ar/Avatar";

const AVATARS = [
  { id: "1", name: "Cyber Punk", path: "/avatar1.glb" },
  { id: "2", name: "Neon Glow", path: "/avatar2.glb" },
  { id: "3", name: "Future Mech", path: "/avatar3.glb" },
];

function SelectAvatarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("room");
  
  const { selectedAvatar, setSelectedAvatar, userName, setUserName } = useStore();
  const [currentSelection, setCurrentSelection] = useState(selectedAvatar);
  const [nameInput, setNameInput] = useState(userName);

  const handleProceed = () => {
    setUserName(nameInput || "User");
    setSelectedAvatar(currentSelection);
    if (roomId) {
      router.push(`/room/${roomId}`);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-indigo-900 opacity-50 z-0" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-6xl w-full px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
      >
        {/* Left Side: 3D Preview */}
        <div className="h-[500px] bg-zinc-900/30 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden relative">
          <div className="absolute top-4 left-4 z-20">
            <span className="text-xs font-medium text-cyan-400 uppercase tracking-widest">Preview</span>
            <h2 className="text-xl font-bold">{userName}'s Avatar</h2>
          </div>
          <Scene>
            <Avatar url={currentSelection} trackingData={{ headRotation: [0, 0, 0], mouthOpen: 0, eyeBlinkLeft: 0, eyeBlinkRight: 0 }} />
          </Scene>
        </div>

        {/* Right Side: Selection */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-2">Choose Your Avatar</h1>
          <p className="text-zinc-400 mb-8">Select the persona you want to project to others.</p>

          {/* Name Input */}
          <div className="mb-6">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-widest block mb-2">Your Name</label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full bg-zinc-800/30 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="Enter your name"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 mb-8">
            {AVATARS.map((avatar) => (
              <div
                key={avatar.id}
                onClick={() => setCurrentSelection(avatar.path)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  currentSelection === avatar.path
                    ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
                    : "border-zinc-800 bg-zinc-800/30 hover:border-zinc-700"
                }`}
              >
                <div>
                  <h3 className="font-medium">{avatar.name}</h3>
                  <p className="text-xs text-zinc-500">{avatar.path}</p>
                </div>
                {currentSelection === avatar.path && (
                  <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1.010 0 010 1.414l-8 8a1.010 0 01-1.414 0l-4-4a1.010 0 011.414-1.414L8 12.586l7.293-7.293a1.010 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleProceed}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Enter Room
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function SelectAvatar() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <SelectAvatarContent />
    </Suspense>
  );
}
