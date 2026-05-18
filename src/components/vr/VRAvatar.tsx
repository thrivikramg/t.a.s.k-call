"use client";

import { useGLTF, useFBX, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { VRTrackingData } from "@/store/vr/useVRStore";

interface VRAvatarProps {
  url: string;
  trackingData?: VRTrackingData;
}

export default function VRAvatar({ url, trackingData }: VRAvatarProps) {
  const { scene } = useGLTF(url);
  const blinkRef = useRef(0);
  const nextBlinkRef = useRef(0);

  const fbx = useFBX("/avatar1-sit.fbx");
  const { actions } = useAnimations(fbx.animations, scene);

  useEffect(() => {
    nextBlinkRef.current = Date.now() + Math.random() * 5000 + 1000;
    
    // Play the sitting animation
    if (actions && Object.keys(actions).length > 0) {
      const actionName = Object.keys(actions)[0];
      if (actions[actionName]) {
        actions[actionName].play();
      }
    }
  }, [actions, scene]);

  useFrame((state, delta) => {
    const now = Date.now();
    
    // Automatic Blinking logic
    if (now > nextBlinkRef.current) {
      blinkRef.current = 1; // Close eyes
      nextBlinkRef.current = now + Math.random() * 5000 + 2000;
    } else if (now > nextBlinkRef.current - 150) {
      blinkRef.current = 0; // Open eyes
    }

    if (!trackingData) return;

    // Apply head rotation
    let head = scene.getObjectByName("Head") || scene.getObjectByName("Neck");
    
    if (head) {
      head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, trackingData.headRotation[0], 0.3);
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, trackingData.headRotation[1], 0.3);
      head.rotation.z = THREE.MathUtils.lerp(head.rotation.z, trackingData.headRotation[2], 0.3);
    } else {
      scene.rotation.x = THREE.MathUtils.lerp(scene.rotation.x, trackingData.headRotation[0] * 0.5, 0.1);
      scene.rotation.y = THREE.MathUtils.lerp(scene.rotation.y, trackingData.headRotation[1] * 0.5, 0.1);
    }

    // Apply Morph Targets (Blendshapes)
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.morphTargetInfluences && child.morphTargetDictionary) {
        const dict = child.morphTargetDictionary;
        
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
            blinkRef.current,
            0.5
          );
        }
        if (eyeBlinkRightIdx !== undefined) {
          child.morphTargetInfluences[eyeBlinkRightIdx] = THREE.MathUtils.lerp(
            child.morphTargetInfluences[eyeBlinkRightIdx],
            blinkRef.current,
            0.5
          );
        }
      }
    });
  });

  // Position is adjusted so the avatar's bottom rests on the chair
  return <primitive object={scene} position={[0, -1.5, 0.2]} scale={1.0} />;
}
