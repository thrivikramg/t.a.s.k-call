"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { TrackingData } from "@/hooks/useStore";

interface AvatarProps {
  url: string;
  trackingData?: TrackingData;
}

export default function Avatar({ url, trackingData }: AvatarProps) {
  const { scene } = useGLTF(url);
  const headRef = useRef<THREE.Group>(null);
  const loggedRef = useRef(false);
  
  // Find the head bone or mesh to rotate
  useEffect(() => {
    scene.traverse((object) => {
      // Common names for head bone
      if (object instanceof THREE.Bone && (object.name.toLowerCase().includes("head") || object.name.toLowerCase().includes("neck"))) {
        console.log("Found head/neck bone:", object.name);
      }

      // Log morph targets for all meshes
      if (object instanceof THREE.Mesh && object.morphTargetInfluences && object.morphTargetDictionary) {
        console.log(`Morph Targets for ${object.name}:`, Object.keys(object.morphTargetDictionary));
      }
    });
  }, [scene]);

  useFrame((state, delta) => {
    if (!trackingData) return;

    // Apply head rotation
    // Find the head bone. For now, let's assume we can traverse and find a bone named "Head"
    // Or we can just rotate the whole scene if we only show head and shoulders.
    // But rotating the head bone is better if the body is static.
    // Let's try to find "Head" or fallback to scene rotation.
    
    let head = scene.getObjectByName("Head") || scene.getObjectByName("Neck");
    
    if (head) {
      // Smoothly interpolate (lerp) rotation
      head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, trackingData.headRotation[0], 0.3);
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, trackingData.headRotation[1], 0.3);
      head.rotation.z = THREE.MathUtils.lerp(head.rotation.z, trackingData.headRotation[2], 0.3);
    } else {
      // Fallback: rotate the whole scene slightly
      scene.rotation.x = THREE.MathUtils.lerp(scene.rotation.x, trackingData.headRotation[0] * 0.5, 0.1);
      scene.rotation.y = THREE.MathUtils.lerp(scene.rotation.y, trackingData.headRotation[1] * 0.5, 0.1);
    }

    // Apply Morph Targets (Blendshapes)
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.morphTargetInfluences && child.morphTargetDictionary) {
        const dict = child.morphTargetDictionary;
        
        // Map common blendshape names
        const mouthOpenIdx = dict["mouth_open"] ?? dict["mouthOpen"] ?? dict["jawOpen"] ?? dict["JawOpen"];
        const eyeBlinkLeftIdx = dict["eyeBlinkLeft"] ?? dict["blinkLeft"] ?? dict["Blink_Left"] ?? dict["eye_blink_left"] ?? dict["blink_left"];
        const eyeBlinkRightIdx = dict["eyeBlinkRight"] ?? dict["blinkRight"] ?? dict["Blink_Right"] ?? dict["eye_blink_right"] ?? dict["blink_right"];

        if (mouthOpenIdx !== undefined) {
          child.morphTargetInfluences[mouthOpenIdx] = THREE.MathUtils.lerp(
            child.morphTargetInfluences[mouthOpenIdx],
            trackingData.mouthOpen,
            0.5
          );
        }
        if (eyeBlinkLeftIdx !== undefined) {
          child.morphTargetInfluences[eyeBlinkLeftIdx] = THREE.MathUtils.lerp(
            child.morphTargetInfluences[eyeBlinkLeftIdx],
            trackingData.eyeBlinkLeft,
            0.5
          );
        }
        if (eyeBlinkRightIdx !== undefined) {
          child.morphTargetInfluences[eyeBlinkRightIdx] = THREE.MathUtils.lerp(
            child.morphTargetInfluences[eyeBlinkRightIdx],
            trackingData.eyeBlinkRight,
            0.5
          );
        }
      }
    });
  });

  return <primitive object={scene} position={[0, -1.5, 0]} scale={1.0} />;
}
