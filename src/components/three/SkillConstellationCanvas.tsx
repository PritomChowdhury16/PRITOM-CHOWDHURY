import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import type { SkillDomain } from '../../data/portfolioData';

interface SkillConstellationCanvasProps {
  domains: SkillDomain[];
  activeDomainId: SkillDomain['id'];
  onSelectDomain: (id: SkillDomain['id']) => void;
  isSoftwareGl: boolean;
  reducedMotion: boolean;
  isVisible: boolean;
}

const DOMAIN_NODES: Array<{
  id: SkillDomain['id'];
  position: [number, number, number];
  color: string;
}> = [
  { id: 'ai-content', position: [0, 0.95, 0.55], color: '#6366F1' },
  { id: 'development', position: [1.15, -0.15, 0.25], color: '#818CF8' },
  { id: 'creative', position: [-1.15, -0.15, 0.25], color: '#A5B4FC' },
  { id: 'analytics', position: [0, -1.05, -0.35], color: '#60A5FA' },
];

function ConstellationNodes({
  activeDomainId,
  onSelectDomain,
  reducedMotion,
}: {
  activeDomainId: SkillDomain['id'];
  onSelectDomain: (id: SkillDomain['id']) => void;
  reducedMotion: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRot = useMemo(() => new THREE.Euler(0, 0, 0), []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Gently orient constellation toward selected domain
    if (activeDomainId === 'ai-content') targetRot.set(0.18, 0, 0);
    else if (activeDomainId === 'development') targetRot.set(0, -0.52, 0);
    else if (activeDomainId === 'creative') targetRot.set(0, 0.52, 0);
    else targetRot.set(-0.26, 0, 0);

    const lambda = reducedMotion ? 16 : 4;
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      targetRot.x,
      lambda,
      delta
    );
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetRot.y + (reducedMotion ? 0 : Math.sin(performance.now() * 0.0004) * 0.14),
      lambda,
      delta
    );
  });

  const edges = useMemo(() => {
    const pairs: Array<[[number, number, number], [number, number, number]]> = [];
    for (let i = 0; i < DOMAIN_NODES.length; i++) {
      pairs.push([[0, 0, 0], DOMAIN_NODES[i].position]);
      const next = DOMAIN_NODES[(i + 1) % DOMAIN_NODES.length];
      pairs.push([DOMAIN_NODES[i].position, next.position]);
    }
    return pairs;
  }, []);

  return (
    <group ref={groupRef}>
      {/* Central Core */}
      <mesh>
        <octahedronGeometry args={[0.26, 0]} />
        <meshStandardMaterial
          color="#18181B"
          metalness={0.8}
          roughness={0.22}
          wireframe={false}
        />
      </mesh>
      <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[0.42, 0.008, 12, 64]} />
        <meshStandardMaterial color="#4F46E5" metalness={0.6} roughness={0.25} />
      </mesh>

      {/* Connecting Constellation Vectors */}
      {edges.map(([start, end], idx) => (
        <Line
          key={idx}
          points={[start, end]}
          color="#6366F1"
          lineWidth={1.2}
          transparent
          opacity={0.35}
        />
      ))}

      {/* Interactive Domain Nodes */}
      {DOMAIN_NODES.map((node) => {
        const isActive = node.id === activeDomainId;
        const scale = isActive ? 1.28 : 0.92;
        return (
          <group
            key={node.id}
            position={node.position}
            scale={[scale, scale, scale]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectDomain(node.id);
            }}
            onPointerOver={() => {
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
            }}
          >
            {/* Outer Orbital Halo */}
            <mesh rotation={[Math.PI / 3, 0.4, 0]}>
              <torusGeometry args={[0.27, 0.012, 12, 48]} />
              <meshStandardMaterial
                color={isActive ? node.color : '#52525B'}
                metalness={0.75}
                roughness={0.2}
              />
            </mesh>
            {/* Inner Geometric Nucleus */}
            <mesh>
              <icosahedronGeometry args={[0.17, 1]} />
              <meshStandardMaterial
                color={isActive ? node.color : '#27272A'}
                roughness={isActive ? 0.22 : 0.55}
                metalness={isActive ? 0.45 : 0.2}
                emissive={isActive ? node.color : '#000000'}
                emissiveIntensity={isActive ? 0.25 : 0}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function SkillConstellationCanvas({
  activeDomainId,
  onSelectDomain,
  isSoftwareGl,
  reducedMotion,
  isVisible,
}: SkillConstellationCanvasProps) {
  return (
    <Canvas
      dpr={isSoftwareGl ? 1 : [1, 2]}
      frameloop={isVisible ? 'always' : 'demand'}
      camera={{ position: [0, 0, 4.1], fov: 38 }}
      gl={{
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      className="w-full h-full"
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 5, 4]} intensity={1.6} color="#ffffff" />
      <directionalLight position={[-4, -3, 2]} intensity={0.8} color="#818cf8" />

      <ConstellationNodes
        activeDomainId={activeDomainId}
        onSelectDomain={onSelectDomain}
        reducedMotion={reducedMotion}
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping={!isSoftwareGl}
        rotateSpeed={0.55}
      />
    </Canvas>
  );
}
