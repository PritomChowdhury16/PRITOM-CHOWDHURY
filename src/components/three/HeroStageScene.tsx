import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PritomNamastePortrait3D } from './PritomNamastePortrait3D';

interface HeroStageSceneProps {
  scrollProgressRef: React.MutableRefObject<number>;
  portraitUrl: string;
  isSoftwareGl: boolean;
  reducedMotion: boolean;
  onReady?: () => void;
}

function StudioEnvironment({ onReady }: { onReady?: () => void }) {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmremGenerator = new THREE.PMREMGenerator(gl);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.6;
    pmremGenerator.dispose();
    onReady?.();

    return () => {
      scene.environment = null;
      envTarget.dispose();
    };
  }, [gl, scene, onReady]);

  return null;
}

function CameraChoreographer({
  scrollProgressRef,
  reducedMotion,
}: {
  scrollProgressRef: React.MutableRefObject<number>;
  reducedMotion: boolean;
}) {
  const { camera, size } = useThree();
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const targetLook = useMemo(() => new THREE.Vector3(), []);
  const currentLook = useMemo(() => new THREE.Vector3(0.18, 0.08, 0), []);
  const isCompact = size.width < 900;

  useFrame((_, delta) => {
    const p = reducedMotion ? 0.62 : THREE.MathUtils.clamp(scrollProgressRef.current, 0, 1);

    const camX = isCompact ? 0 : THREE.MathUtils.lerp(-0.14, 0.05, p);
    const camY = isCompact ? 0.04 : THREE.MathUtils.lerp(0.06, -0.02, p);
    const camZ = isCompact
      ? THREE.MathUtils.lerp(3.05, 2.60, p)
      : THREE.MathUtils.lerp(2.75, 2.35, p);

    const lookX = isCompact ? 0 : THREE.MathUtils.lerp(0.14, 0.20, p);
    const lookY = isCompact ? 0.04 : THREE.MathUtils.lerp(0.04, -0.04, p);

    targetPos.set(camX, camY, camZ);
    targetLook.set(lookX, lookY, 0);

    const lambda = reducedMotion ? 20 : 6;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetPos.x, lambda, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetPos.y, lambda, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetPos.z, lambda, delta);

    currentLook.x = THREE.MathUtils.damp(currentLook.x, targetLook.x, lambda, delta);
    currentLook.y = THREE.MathUtils.damp(currentLook.y, targetLook.y, lambda, delta);
    currentLook.z = THREE.MathUtils.damp(currentLook.z, targetLook.z, lambda, delta);

    camera.lookAt(currentLook);
  });

  return null;
}

export function HeroStageScene({
  scrollProgressRef,
  portraitUrl,
  isSoftwareGl,
  reducedMotion,
  onReady,
}: HeroStageSceneProps) {
  return (
    <Canvas
      shadows={!isSoftwareGl}
      dpr={isSoftwareGl ? 1 : [1, 2]}
      camera={{ position: [-0.14, 0.06, 2.75], fov: 36, near: 0.1, far: 30 }}
      gl={{
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      className="w-full h-full"
    >
      <color attach="background" args={['#09090b']} />
      <fog attach="fog" args={['#09090b', 5.5, 14]} />

      <StudioEnvironment onReady={onReady} />

      <hemisphereLight args={['#e0e7ff', '#1c1917', 0.72]} />
      <directionalLight
        position={[2.4, 3.2, 3.2]}
        intensity={1.55}
        color="#fff6eb"
        castShadow={!isSoftwareGl}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-2.2, 1.6, 2.2]} intensity={0.75} color="#a5b4fc" />
      <spotLight
        position={[1.8, 2.2, -1.8]}
        intensity={9}
        distance={8}
        angle={0.7}
        penumbra={0.85}
        color="#6366f1"
      />

      <CameraChoreographer
        scrollProgressRef={scrollProgressRef}
        reducedMotion={reducedMotion}
      />

      <PritomNamastePortrait3D
        portraitUrl={portraitUrl}
        scrollProgressRef={scrollProgressRef}
        reducedMotion={reducedMotion}
      />
    </Canvas>
  );
}
