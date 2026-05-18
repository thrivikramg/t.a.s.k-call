import React from "react";

export default function VRChair({ position = [0, 0, 0], rotation = [0, 0, 0] }: { position?: [number, number, number], rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Seat */}
      <mesh position={[0, 0.5, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.6, 0.1, 0.6]} />
        <meshStandardMaterial color="#1f2937" roughness={0.7} />
      </mesh>
      
      {/* Backrest */}
      <mesh position={[0, 1.0, -0.25]} receiveShadow castShadow>
        <boxGeometry args={[0.6, 0.6, 0.1]} />
        <meshStandardMaterial color="#1f2937" roughness={0.7} />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.25, 0.25, 0.25]} receiveShadow castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.5]} />
        <meshStandardMaterial color="#4b5563" metalness={0.5} />
      </mesh>
      <mesh position={[0.25, 0.25, 0.25]} receiveShadow castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.5]} />
        <meshStandardMaterial color="#4b5563" metalness={0.5} />
      </mesh>
      <mesh position={[-0.25, 0.25, -0.25]} receiveShadow castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.5]} />
        <meshStandardMaterial color="#4b5563" metalness={0.5} />
      </mesh>
      <mesh position={[0.25, 0.25, -0.25]} receiveShadow castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.5]} />
        <meshStandardMaterial color="#4b5563" metalness={0.5} />
      </mesh>
    </group>
  );
}
