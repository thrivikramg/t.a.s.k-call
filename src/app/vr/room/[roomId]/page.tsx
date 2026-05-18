"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useVRStore } from "@/store/vr/useVRStore";
import { useVRWebRTC } from "@/hooks/vr/useVRWebRTC";
import { useGyroscope } from "@/hooks/vr/useGyroscope";
import { useAudioLevel } from "@/hooks/vr/useAudioLevel";
import VRScene from "@/components/vr/VRScene";
import VRAvatar from "@/components/vr/VRAvatar";
import VRControls from "@/components/vr/VRControls";
import VRChair from "@/components/vr/VRChair";
import VRScreen from "@/components/vr/VRScreen";
import { useFrame, useThree } from "@react-three/fiber";
import { Text, Billboard, DeviceOrientationControls } from "@react-three/drei";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";

export default function VRRoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const router = useRouter();

  const {
    userId,
    setUserId,
    userName,
    setUserName,
    participants,
    isMuted,
    isSharingScreen,
    screenSharerId
  } = useVRStore();

  const { localStream, remoteScreenStream, sendTrackingUpdate, toggleScreenShare } = useVRWebRTC(roomId);
  const { orientation, requestPermission, hasPermission } = useGyroscope();
  const mouthOpen = useAudioLevel(localStream);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

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

  const handleLeave = () => {
    router.push("/vr");
  };

  const handleRecenter = () => {
    // Implement recenter logic if needed (e.g., offset orientation)
  };



  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {!hasPermission && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-6">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center backdrop-blur-xl">
            <h1 className="text-2xl font-bold mb-4 text-white">Permission Required</h1>
            <p className="text-zinc-400 mb-8 text-sm">
              We need access to your device orientation to enable VR head tracking. Please grant permission to continue.
            </p>
            <button
              onClick={requestPermission}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium py-3 rounded-lg transition-all"
            >
              Grant Permission
            </button>
          </div>
        </div>
      )}

      <VRScene>
        {isMobile && hasPermission ? (
          <DeviceOrientationControls />
        ) : (
          <CameraController />
        )}
        <TrackingBroadcaster sendTrackingUpdate={sendTrackingUpdate} mouthOpen={mouthOpen} />

        {/* Screen Share Display */}
        {isSharingScreen && remoteScreenStream && (
          <VRScreen stream={remoteScreenStream} position={[0, 1.5, -4]} />
        )}

        {/* Render Participants */}
        {Object.values(participants).map((participant, index) => {
          const list = Object.values(participants);

          let x, z;
          let lookAtTarget: [number, number, number] = [0, 0, 0];

          if (isSharingScreen) {
            // Theater mode: line up from left to right, beside the user
            const rowSpacing = 1.5; // 1.5 meters between seats
            const sign = index % 2 === 0 ? -1 : 1; // Alternate left and right
            const magnitude = Math.ceil((index + 1) / 2); // 1, 1, 2, 2...
            x = sign * magnitude * rowSpacing;
            z = 0; // Sit in the exact same row as the local user (camera is at z=0)
            lookAtTarget = [0, 1.5, -4]; // Look towards the center of the screen
          } else {
            // Circle mode: Custom distribution
            const baseAngle = -Math.PI / 2; // Directly in front
            const step = Math.PI / 12; // 15 degrees separation
            const sign = index % 2 === 1 ? 1 : -1;
            const magnitude = Math.ceil(index / 2);
            const angle = index === 0 ? baseAngle : baseAngle + sign * magnitude * step;

            const radius = 2.5;
            x = Math.cos(angle) * radius;
            z = Math.sin(angle) * radius;
            lookAtTarget = [0, 0, 0]; // Look at the local user
          }

          return (
            <ParticipantGroup key={participant.userId} position={[x, 0, z]} lookAtTarget={lookAtTarget}>
              {/* Username above head always facing camera */}
              <Billboard position={[0, 1.2, 0]}>
                <Text
                  fontSize={0.2}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.02}
                  outlineColor="black"
                >
                  {participant.userName}
                </Text>
              </Billboard>
              {/* Chair placed at ground level (-1.5) */}
              <VRChair position={[0, -1.5, 0]} />
              <VRAvatar url={participant.avatar} trackingData={participant.trackingData} />
            </ParticipantGroup>
          );
        })}
      </VRScene>

      <VRControls 
        onLeave={handleLeave} 
        onRecenter={handleRecenter} 
        onToggleScreenShare={isMobile ? undefined : toggleScreenShare} 
      />
    </div>
  );
}

// Desktop fallback camera control (mouse drag)
function CameraController() {
  const { camera, gl } = useThree();
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      // Rotate camera (drag to look)
      camera.rotation.y -= deltaX * 0.005;
      camera.rotation.x += deltaY * 0.005; // Flipped to fix inverted control
      camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseUp = () => {
      isDragging.current = false;
    };

    gl.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [camera, gl]);

  return null;
}

// Broadcaster to send local camera rotation and mouth state to peers
function TrackingBroadcaster({ sendTrackingUpdate, mouthOpen }: { sendTrackingUpdate: (data: any) => void, mouthOpen: number }) {
  const { camera } = useThree();
  const lastUpdateRef = useRef(0);

  useFrame(() => {
    const now = Date.now();
    if (now - lastUpdateRef.current > 33) { // ~30fps
      sendTrackingUpdate({
        headRotation: [camera.rotation.x, camera.rotation.y, camera.rotation.z],
        mouthOpen: mouthOpen,
      });
      lastUpdateRef.current = now;
    }
  });

  return null;
}

// Helper component to handle participant positioning and lookAt
function ParticipantGroup({ position, lookAtTarget = [0, 0, 0], children }: { position: [number, number, number]; lookAtTarget?: [number, number, number]; children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (groupRef.current) {
      // Look at the target
      groupRef.current.lookAt(...lookAtTarget);
    }
  }, [position, lookAtTarget]);

  return (
    <group ref={groupRef} position={position}>
      {children}
    </group>
  );
}
