import React, { useEffect, useState } from "react";
import * as THREE from "three";

interface VRScreenProps {
  stream: MediaStream;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export default function VRScreen({ stream, position = [0, 2, -5], rotation = [0, 0, 0] }: VRScreenProps) {
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);
  const [videoAspect, setVideoAspect] = useState<number>(16 / 9);

  useEffect(() => {
    if (!stream) return;

    const video = document.createElement("video");
    video.srcObject = stream;
    video.crossOrigin = "Anonymous";
    video.loop = true;
    video.muted = true; // Mute local video element, audio is handled separately
    video.playsInline = true;
    
    video.onloadedmetadata = () => {
      if (video.videoWidth && video.videoHeight) {
        setVideoAspect(video.videoWidth / video.videoHeight);
      }
    };

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Video play error:", err);
        }
      });
    }

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;

    setVideoTexture(texture);

    return () => {
      if (playPromise !== undefined) {
        playPromise.then(() => {
          video.pause();
          video.srcObject = null;
        }).catch(() => {
          video.srcObject = null;
        });
      } else {
        video.pause();
        video.srcObject = null;
      }
      texture.dispose();
    };
  }, [stream]);

  if (!videoTexture) return null;

  // Base width is 8. Height is calculated based on actual aspect ratio.
  const width = 8;
  const height = width / videoAspect;

  return (
    <group position={position} rotation={rotation}>
      {/* Screen Mesh */}
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={videoTexture} toneMapped={false} />
      </mesh>
      
      {/* Screen Frame/Glow */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[width + 0.2, height + 0.2]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.5} roughness={0.1} />
      </mesh>
    </group>
  );
}
