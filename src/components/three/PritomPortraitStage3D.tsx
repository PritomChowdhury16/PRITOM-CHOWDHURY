import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

interface PritomPortraitStage3DProps {
  portraitUrl: string;
  scrollProgressRef: React.MutableRefObject<number>;
  reducedMotion: boolean;
}

/**
 * Loads Pritom's actual portrait image at full clarity with SRGB color space
 * and anisotropic filtering for crisp rendering inside the 3D spatial frame.
 */
function usePortraitTexture(portraitUrl: string): THREE.Texture | null {
  const { gl } = useThree();

  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const loader = new THREE.TextureLoader();
    const tex = loader.load(portraitUrl, (loaded) => {
      loaded.colorSpace = THREE.SRGBColorSpace;
      loaded.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
      loaded.needsUpdate = true;
    });
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [portraitUrl, gl]);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  return texture;
}

/**
 * Creates a rounded-rectangle beveled architectural frame geometry via ExtrudeGeometry.
 */
function createRoundedFrameGeometry(
  outerW: number,
  outerH: number,
  innerW: number,
  innerH: number,
  depth: number,
  radius: number
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const hw = outerW / 2;
  const hh = outerH / 2;

  shape.moveTo(-hw + radius, -hh);
  shape.lineTo(hw - radius, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + radius);
  shape.lineTo(hw, hh - radius);
  shape.quadraticCurveTo(hw, hh, hw - radius, hh);
  shape.lineTo(-hw + radius, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - radius);
  shape.lineTo(-hw, -hh + radius);
  shape.quadraticCurveTo(-hw, -hh, -hw + radius, -hh);

  // Cutout window for the recessed portrait
  const hole = new THREE.Path();
  const ihw = innerW / 2;
  const ihh = innerH / 2;
  const ir = Math.max(0.02, radius * 0.65);

  hole.moveTo(-ihw + ir, -ihh);
  hole.lineTo(-ihw, -ihh + ir);
  hole.lineTo(-ihw, ihh - ir);
  hole.quadraticCurveTo(-ihw, ihh, -ihw + ir, ihh);
  hole.lineTo(ihw - ir, ihh);
  hole.quadraticCurveTo(ihw, ihh, ihw, ihh - ir);
  hole.lineTo(ihw, -ihh + ir);
  hole.quadraticCurveTo(ihw, -ihh, ihw - ir, -ihh);
  hole.lineTo(-ihw + ir, -ihh);

  shape.holes.push(hole);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.016,
    bevelSize: 0.014,
    bevelSegments: 3,
    curveSegments: 24,
  });
  geo.center();
  return geo;
}

export function PritomPortraitStage3D({
  portraitUrl,
  scrollProgressRef,
  reducedMotion,
}: PritomPortraitStage3DProps) {
  const { size, pointer } = useThree();
  const stageRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const accentLayerRef = useRef<THREE.Group>(null);

  const portraitTexture = usePortraitTexture(portraitUrl);

  // Responsive placement: right-of-center on desktop, centered & lifted slightly on mobile
  const isCompactViewport = size.width < 900;

  const geometries = useMemo(() => {
    // 3:4 portrait aspect ratio inside architectural frame
    const frameGeo = createRoundedFrameGeometry(1.16, 1.54, 1.02, 1.38, 0.075, 0.055);
    const backplateGeo = new THREE.BoxGeometry(1.12, 1.50, 0.035);
    const portraitPlaneGeo = new THREE.PlaneGeometry(1.04, 1.40);
    const glassOverlayGeo = new THREE.PlaneGeometry(1.04, 1.40);
    const bezelTrimGeo = createRoundedFrameGeometry(1.20, 1.58, 1.155, 1.535, 0.014, 0.06);
    return { frameGeo, backplateGeo, portraitPlaneGeo, glassOverlayGeo, bezelTrimGeo };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((g) => g.dispose());
    };
  }, [geometries]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const p = reducedMotion ? 0.5 : THREE.MathUtils.clamp(scrollProgressRef.current, 0, 1);

    if (stageRef.current) {
      // Position shifts cleanly between desktop right-column showcase and mobile upper-center
      const basePosX = isCompactViewport ? 0 : THREE.MathUtils.lerp(0.62, 0.54, p);
      const basePosY = isCompactViewport ? 0.34 : THREE.MathUtils.lerp(0.0, 0.04, p);
      const basePosZ = isCompactViewport ? -0.35 : THREE.MathUtils.lerp(0, 0.25, p);

      const pointerX = reducedMotion ? 0 : pointer.x * 0.14;
      const pointerY = reducedMotion ? 0 : pointer.y * 0.09;
      const scrollRotY = THREE.MathUtils.lerp(-0.18, 0.08, p);
      const scrollRotX = THREE.MathUtils.lerp(0.03, -0.02, p);

      const floatY = reducedMotion ? 0 : Math.sin(t * 1.15) * 0.025;

      const lambda = reducedMotion ? 20 : 6;
      stageRef.current.position.x = THREE.MathUtils.damp(
        stageRef.current.position.x,
        basePosX,
        lambda,
        delta
      );
      stageRef.current.position.y = THREE.MathUtils.damp(
        stageRef.current.position.y,
        basePosY + floatY,
        lambda,
        delta
      );
      stageRef.current.position.z = THREE.MathUtils.damp(
        stageRef.current.position.z,
        basePosZ,
        lambda,
        delta
      );

      stageRef.current.rotation.y = THREE.MathUtils.damp(
        stageRef.current.rotation.y,
        scrollRotY + pointerX,
        lambda,
        delta
      );
      stageRef.current.rotation.x = THREE.MathUtils.damp(
        stageRef.current.rotation.x,
        scrollRotX - pointerY,
        lambda,
        delta
      );
    }

    if (!reducedMotion) {
      if (ring1Ref.current) {
        ring1Ref.current.rotation.z += delta * 0.12;
      }
      if (ring2Ref.current) {
        ring2Ref.current.rotation.z -= delta * 0.08;
      }
      if (accentLayerRef.current) {
        accentLayerRef.current.position.x = -0.14 - pointer.x * 0.06;
        accentLayerRef.current.position.y = 0.06 - pointer.y * 0.05;
      }
    }
  });

  return (
    <group ref={stageRef} position={[isCompactViewport ? 0 : 0.62, 0, 0]}>
      {/* Main Beveled Anodized Obsidian Monolith Frame */}
      <mesh geometry={geometries.frameGeo} castShadow receiveShadow>
        <meshStandardMaterial color="#18181f" metalness={0.82} roughness={0.24} />
      </mesh>

      {/* Hairline Electric Indigo Architectural Rim */}
      <mesh geometry={geometries.bezelTrimGeo} position={[0, 0, 0.036]}>
        <meshStandardMaterial
          color="#6366f1"
          metalness={0.75}
          roughness={0.2}
          emissive="#4338ca"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Solid Dark Backplate */}
      <mesh geometry={geometries.backplateGeo} position={[0, 0, -0.025]} castShadow>
        <meshStandardMaterial color="#111116" metalness={0.5} roughness={0.55} />
      </mesh>

      {/* Pritom's Actual High-Resolution Portrait Plane */}
      <mesh geometry={geometries.portraitPlaneGeo} position={[0, 0, 0.004]}>
        <meshBasicMaterial
          map={portraitTexture ?? undefined}
          color={portraitTexture ? '#ffffff' : '#1f2029'}
          toneMapped={false}
        />
      </mesh>

      {/* Subtle Anti-Reflective Museum Glass Sheen */}
      <mesh geometry={geometries.glassOverlayGeo} position={[0, 0, 0.022]}>
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.04}
          roughness={0.08}
          metalness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.06}
        />
      </mesh>

      {/* Secondary Floating AI Design & Web Grid Planes Behind Portrait for 3D Parallax Depth */}
      <group ref={accentLayerRef} position={[-0.14, 0.06, -0.22]}>
        <mesh position={[-0.45, 0.42, -0.05]}>
          <planeGeometry args={[0.58, 0.42]} />
          <meshStandardMaterial
            color="#1e1b4b"
            transparent
            opacity={0.35}
            roughness={0.4}
            metalness={0.4}
          />
        </mesh>
        <mesh position={[-0.45, 0.42, -0.045]}>
          <planeGeometry args={[0.58, 0.42]} />
          <meshBasicMaterial color="#818cf8" wireframe transparent opacity={0.28} />
        </mesh>

        <mesh position={[0.48, -0.46, -0.08]}>
          <planeGeometry args={[0.54, 0.36]} />
          <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.22} />
        </mesh>
      </group>

      {/* Subtle Orbital Geometry Rings Framing the Portrait */}
      <mesh ref={ring1Ref} position={[0, 0, -0.18]} rotation={[0.18, -0.15, 0]}>
        <torusGeometry args={[1.06, 0.0055, 12, 96]} />
        <meshStandardMaterial color="#6366f1" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh ref={ring2Ref} position={[0, 0, -0.26]} rotation={[-0.22, 0.24, 0]}>
        <torusGeometry args={[1.22, 0.004, 12, 96]} />
        <meshStandardMaterial color="#52525b" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}
