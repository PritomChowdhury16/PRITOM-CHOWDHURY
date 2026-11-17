import React, { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';

interface HackWithAISculptureProps {
  isSoftwareGl: boolean;
  reducedMotion: boolean;
  isVisible: boolean;
}

function EditorialPrism({ reducedMotion }: { reducedMotion: boolean }) {
  const outerRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    if (outerRef.current) {
      outerRef.current.rotation.y += delta * 0.22;
      outerRef.current.rotation.x = Math.sin(performance.now() * 0.0005) * 0.14;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.36;
      innerRef.current.rotation.z += delta * 0.18;
    }
  });

  return (
    <group ref={outerRef}>
      {/* Precision Gyroscopic Rings */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.32, 0.014, 16, 84]} />
        <meshStandardMaterial color="#6366f1" metalness={0.85} roughness={0.18} />
      </mesh>
      <mesh rotation={[-Math.PI / 4, Math.PI / 5, 0]}>
        <torusGeometry args={[1.05, 0.012, 16, 72]} />
        <meshStandardMaterial color="#e4e4e7" metalness={0.75} roughness={0.25} />
      </mesh>
      {/* Faceted Editorial Core */}
      <mesh ref={innerRef}>
        <octahedronGeometry args={[0.68, 0]} />
        <meshStandardMaterial
          color="#18181b"
          metalness={0.88}
          roughness={0.16}
        />
      </mesh>
      <mesh rotation={[0.4, 0.6, 0]}>
        <octahedronGeometry args={[0.72, 0]} />
        <meshBasicMaterial color="#818cf8" wireframe transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

export function HackWithAISculpture({
  isSoftwareGl,
  reducedMotion,
  isVisible,
}: HackWithAISculptureProps) {
  return (
    <Canvas
      dpr={isSoftwareGl ? 1 : [1, 2]}
      frameloop={isVisible ? 'always' : 'demand'}
      camera={{ position: [0, 0, 4.2], fov: 36 }}
      gl={{
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      className="w-full h-full"
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 4, 4]} intensity={1.8} color="#ffffff" />
      <directionalLight position={[-3, -2, -2]} intensity={1.0} color="#6366f1" />
      <EditorialPrism reducedMotion={reducedMotion} />
    </Canvas>
  );
}
