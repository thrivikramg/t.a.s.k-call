"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import { PerspectiveCamera, Stars } from "@react-three/drei";
import * as THREE from "three";

interface VRSceneProps {
  children: React.ReactNode;
}

function StereoscopicRenderer() {
  const { gl, scene, camera } = useThree();
  const stereoRef = useRef(new THREE.StereoCamera());

  useFrame(() => {
    const size = gl.getSize(new THREE.Vector2());
    
    // Update stereo camera matrices based on the main camera
    stereoRef.current.update(camera as THREE.PerspectiveCamera);
    
    gl.setScissorTest(true);
    
    // Left Eye
    gl.setScissor(0, 0, size.x / 2, size.y);
    gl.setViewport(0, 0, size.x / 2, size.y);
    gl.render(scene, stereoRef.current.cameraL);
    
    // Right Eye
    gl.setScissor(size.x / 2, 0, size.x / 2, size.y);
    gl.setViewport(size.x / 2, 0, size.x / 2, size.y);
    gl.render(scene, stereoRef.current.cameraR);
    
    gl.setScissorTest(false);
  }, 1); // Priority 1 to override default render

  return null;
}

export default function VRScene({ children }: VRSceneProps) {
  return (
    <Canvas
      shadows
      gl={{ preserveDrawingBuffer: true, alpha: true, antialias: true }}
      dpr={[1, 3]}
      className="w-full h-full"
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        {/* Camera at origin, looking forward */}
        <PerspectiveCamera makeDefault position={[0, 0, 0]} fov={90} />
        
        <ambientLight intensity={1.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={2}
          castShadow
        />
        <pointLight position={[-5, -5, -5]} intensity={1} />
        
        {/* Space Background */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* Glowing Platform */}
        <mesh position={[0, -1.6, 0]} receiveShadow>
          <cylinderGeometry args={[5, 5, 0.2, 32]} />
          <meshStandardMaterial color="#050505" roughness={0.2} metalness={0.8} />
        </mesh>
        
        {/* Large Digital Land (Floor) */}
        <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#0a0a14" roughness={0.8} />
        </mesh>
        
        {children}
        
        <StereoscopicRenderer />
      </Suspense>
    </Canvas>
  );
}
