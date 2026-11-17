import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

interface PritomNamastePortrait3DProps {
  portraitUrl: string;
  scrollProgressRef: React.MutableRefObject<number>;
  reducedMotion: boolean;
}

interface ProcessedPortraitData {
  torsoTexture: THREE.CanvasTexture;
  headTexture: THREE.CanvasTexture;
  blazerColor: string;
  skinColor: string;
}

/**
 * Loads Pritom's studio portrait, cleanly keys out ONLY the exterior white studio
 * background via perimeter flood-fill (preserving his crisp white shirt inside the blazer),
 * feathers edges cleanly for dark-stage compositing, samples his exact blazer & skin colors,
 * and splits into Torso + Head layers so the real head can bow gracefully during Namaskar.
 */
function useProcessedNamastePortrait(
  portraitUrl: string,
  maxAnisotropy: number
): ProcessedPortraitData | null {
  const [data, setData] = useState<ProcessedPortraitData | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    let disposed = false;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (disposed) return;

      const size = 768;
      const baseCanvas = document.createElement('canvas');
      baseCanvas.width = size;
      baseCanvas.height = size;
      const ctx = baseCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, size, size);
      const imageData = ctx.getImageData(0, 0, size, size);
      const px = imageData.data;

      // Sample actual blazer color (left shoulder area) and skin tone (cheek/forehead)
      const sampleRgb = (nx: number, ny: number) => {
        const sx = Math.min(size - 1, Math.max(0, Math.round(nx * size)));
        const sy = Math.min(size - 1, Math.max(0, Math.round(ny * size)));
        const i = (sy * size + sx) * 4;
        return `rgb(${px[i]}, ${px[i + 1]}, ${px[i + 2]})`;
      };
      const blazerColor = sampleRgb(0.22, 0.90);
      const skinColor = sampleRgb(0.50, 0.56);

      // BFS flood-fill from top, left, and right edges ONLY (never bottom edge)
      // so the interior white dress shirt stays 100% intact.
      const total = size * size;
      const isBg = new Uint8Array(total);
      const visited = new Uint8Array(total);
      const queue = new Int32Array(total);
      let head = 0;
      let tail = 0;

      const isNearWhite = (idx: number) => {
        const p = idx * 4;
        const r = px[p];
        const g = px[p + 1];
        const b = px[p + 2];
        const minC = Math.min(r, g, b);
        const maxC = Math.max(r, g, b);
        return minC > 224 && maxC - minC < 28;
      };

      const enqueue = (x: number, y: number) => {
        if (x < 0 || x >= size || y < 0 || y >= size) return;
        const idx = y * size + x;
        if (visited[idx]) return;
        visited[idx] = 1;
        if (isNearWhite(idx)) {
          isBg[idx] = 1;
          queue[tail++] = idx;
        }
      };

      for (let x = 0; x < size; x++) {
        enqueue(x, 0);
      }
      for (let y = 0; y < size; y++) {
        enqueue(0, y);
        enqueue(size - 1, y);
      }

      while (head < tail) {
        const idx = queue[head++];
        const x = idx % size;
        const y = (idx - x) / size;
        if (x > 0) enqueue(x - 1, y);
        if (x < size - 1) enqueue(x + 1, y);
        if (y > 0) enqueue(x, y - 1);
        if (y < size - 1) enqueue(x, y + 1);
      }

      // Apply clean transparency + 2px anti-aliased edge feathering + soft bottom studio fade
      for (let y = 0; y < size; y++) {
        const bottomFade =
          y > size * 0.88 ? Math.max(0, 1 - (y - size * 0.88) / (size * 0.12)) : 1;

        for (let x = 0; x < size; x++) {
          const idx = y * size + x;
          const p = idx * 4;

          if (isBg[idx]) {
            px[p + 3] = 0;
          } else {
            // Check 2px neighborhood for soft anti-aliased silhouette
            let bgNeighbors = 0;
            for (let dy = -2; dy <= 2; dy++) {
              for (let dx = -2; dx <= 2; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
                  if (isBg[ny * size + nx]) bgNeighbors++;
                }
              }
            }
            const edgeAlpha = bgNeighbors > 0 ? Math.max(0.15, 1 - bgNeighbors / 18) : 1;
            px[p + 3] = Math.round(255 * edgeAlpha * bottomFade);
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Split into Torso Layer (collar/blazer shoulders) and Head Layer (face/hair/upper neck)
      // Overlap smoothly between v=0.59 and v=0.66 so bowing has zero visible seam.
      const makeLayerCanvas = (mode: 'torso' | 'head') => {
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const cctx = c.getContext('2d');
        if (!cctx) return c;
        cctx.drawImage(baseCanvas, 0, 0);
        const lData = cctx.getImageData(0, 0, size, size);
        const lp = lData.data;

        const splitStart = Math.round(size * 0.57);
        const splitEnd = Math.round(size * 0.67);

        for (let y = 0; y < size; y++) {
          let factor = 1;
          if (mode === 'head') {
            if (y >= splitEnd) factor = 0;
            else if (y > splitStart) factor = 1 - (y - splitStart) / (splitEnd - splitStart);
          } else {
            if (y <= splitStart) factor = 0;
            else if (y < splitEnd) factor = (y - splitStart) / (splitEnd - splitStart);
          }
          if (factor < 1) {
            const rowStart = y * size * 4;
            for (let x = 0; x < size; x++) {
              lp[rowStart + x * 4 + 3] = Math.round(lp[rowStart + x * 4 + 3] * factor);
            }
          }
        }
        cctx.putImageData(lData, 0, 0);
        return c;
      };

      const torsoCanvas = makeLayerCanvas('torso');
      const headCanvas = makeLayerCanvas('head');

      const torsoTexture = new THREE.CanvasTexture(torsoCanvas);
      torsoTexture.colorSpace = THREE.SRGBColorSpace;
      torsoTexture.anisotropy = Math.min(8, maxAnisotropy);
      torsoTexture.needsUpdate = true;

      const headTexture = new THREE.CanvasTexture(headCanvas);
      headTexture.colorSpace = THREE.SRGBColorSpace;
      headTexture.anisotropy = Math.min(8, maxAnisotropy);
      headTexture.needsUpdate = true;

      setData({ torsoTexture, headTexture, blazerColor, skinColor });
    };

    img.src = portraitUrl;

    return () => {
      disposed = true;
    };
  }, [portraitUrl, maxAnisotropy]);

  useEffect(() => {
    return () => {
      data?.torsoTexture.dispose();
      data?.headTexture.dispose();
    };
  }, [data]);

  return data;
}

function makeDirectQuatTrack(
  boneName: string,
  times: number[],
  quats: THREE.Quaternion[]
): THREE.QuaternionKeyframeTrack {
  const values: number[] = [];
  for (const q of quats) {
    values.push(q.x, q.y, q.z, q.w);
  }
  const track = new THREE.QuaternionKeyframeTrack(`${boneName}.quaternion`, times, values);
  track.setInterpolation(THREE.InterpolateSmooth);
  return track;
}

function makeEulerTrack(
  boneName: string,
  times: number[],
  eulers: Array<[number, number, number]>
): THREE.QuaternionKeyframeTrack {
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const quats = eulers.map(([x, y, z]) => {
    e.set(x, y, z, 'XYZ');
    return q.clone().setFromEuler(e);
  });
  return makeDirectQuatTrack(boneName, times, quats);
}

export function PritomNamastePortrait3D({
  portraitUrl,
  scrollProgressRef,
  reducedMotion,
}: PritomNamastePortrait3DProps) {
  const { gl, size, pointer } = useThree();
  const maxAniso = gl.capabilities.getMaxAnisotropy();
  const portraitData = useProcessedNamastePortrait(portraitUrl, maxAniso);

  const stageGroupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const isCompact = size.width < 900;

  // Create subtly contoured 2.5D portrait plane geometry so the photo has organic volume
  const portraitPlaneGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1.56, 1.56, 24, 24);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // Gentle convex relief curve toward center face & chest
      const r2 = (x * x) / 0.65 + (y * y) / 0.85;
      const z = Math.max(0, (1 - r2) * 0.085);
      pos.setZ(i, z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useEffect(() => {
    return () => {
      portraitPlaneGeo.dispose();
    };
  }, [portraitPlaneGeo]);

  // Materials calibrated directly to Pritom's actual blazer, white shirt cuff, and skin tone
  const materials = useMemo(() => {
    const blazer = new THREE.MeshStandardMaterial({
      color: portraitData?.blazerColor ?? '#b1967e',
      roughness: 0.78,
      metalness: 0.04,
    });
    const cuff = new THREE.MeshStandardMaterial({
      color: '#f2f2f4',
      roughness: 0.68,
      metalness: 0.02,
    });
    const skin = new THREE.MeshStandardMaterial({
      color: portraitData?.skinColor ?? '#d49d82',
      roughness: 0.56,
      metalness: 0.02,
    });
    const torsoMat = new THREE.MeshBasicMaterial({
      map: portraitData?.torsoTexture ?? null,
      transparent: true,
      alphaTest: 0.02,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const headMat = new THREE.MeshBasicMaterial({
      map: portraitData?.headTexture ?? null,
      transparent: true,
      alphaTest: 0.02,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    return { blazer, cuff, skin, torsoMat, headMat };
  }, [portraitData]);

  useEffect(() => {
    return () => {
      Object.values(materials).forEach((m) => m.dispose());
    };
  }, [materials]);

  // Build skeletal rig combining Pritom's layered photo (TorsoBone -> HeadBone)
  // with tailored blazer arms & articulated palms for the scroll-driven Namaskar.
  const rig = useMemo(() => {
    const root = new THREE.Group();

    const torsoBone = new THREE.Bone();
    torsoBone.name = 'TorsoBone';
    torsoBone.position.set(0, -0.32, 0);
    root.add(torsoBone);

    // Head pivot positioned right at base of neck (matching photo split line)
    const headBone = new THREE.Bone();
    headBone.name = 'HeadBone';
    headBone.position.set(0, 0.24, 0.01);
    torsoBone.add(headBone);

    // Attach Torso Photo Layer
    const torsoMesh = new THREE.Mesh(portraitPlaneGeo, materials.torsoMat);
    torsoMesh.position.set(0, 0.44, 0);
    torsoBone.add(torsoMesh);

    // Attach Head Photo Layer (compensated by -headBone.position.y so image aligns 1:1 at rest)
    const headMesh = new THREE.Mesh(portraitPlaneGeo, materials.headMat);
    headMesh.position.set(0, 0.20, 0.002);
    headBone.add(headMesh);

    // Arms group (smoothly rises from behind his blazer shoulders as user scrolls)
    const armsAnchor = new THREE.Bone();
    armsAnchor.name = 'ArmsAnchor';
    armsAnchor.position.set(0, 0, 0);
    torsoBone.add(armsAnchor);

    const buildArmChain = (side: 1 | -1) => {
      const prefix = side === 1 ? 'Left' : 'Right';
      const upperArm = new THREE.Bone();
      upperArm.name = `${prefix}UpperArm`;
      // Anchored directly inside his real blazer shoulders
      upperArm.position.set(side * 0.42, -0.10, -0.05);
      armsAnchor.add(upperArm);

      const foreArm = new THREE.Bone();
      foreArm.name = `${prefix}ForeArm`;
      foreArm.position.set(0, -0.32, 0);
      upperArm.add(foreArm);

      const hand = new THREE.Bone();
      hand.name = `${prefix}Hand`;
      hand.position.set(0, -0.28, 0);
      foreArm.add(hand);

      // Tailored Blazer Sleeve (Upper)
      const sleeveUpper = new THREE.Mesh(
        new THREE.CylinderGeometry(0.088, 0.072, 0.32, 22),
        materials.blazer
      );
      sleeveUpper.position.set(0, -0.16, 0);
      sleeveUpper.castShadow = true;
      upperArm.add(sleeveUpper);

      const elbowJoint = new THREE.Mesh(
        new THREE.SphereGeometry(0.072, 18, 16),
        materials.blazer
      );
      foreArm.add(elbowJoint);

      // Tailored Blazer Sleeve (Forearm)
      const sleeveFore = new THREE.Mesh(
        new THREE.CylinderGeometry(0.070, 0.056, 0.25, 22),
        materials.blazer
      );
      sleeveFore.position.set(0, -0.125, 0);
      sleeveFore.castShadow = true;
      foreArm.add(sleeveFore);

      // Crisp White Shirt Cuff matching his inner shirt
      const shirtCuff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.057, 0.052, 0.032, 20),
        materials.cuff
      );
      shirtCuff.position.set(0, -0.262, 0);
      foreArm.add(shirtCuff);

      // Wrist & Sculpted Palm + Articulated Fingers
      const wrist = new THREE.Mesh(
        new THREE.CylinderGeometry(0.038, 0.034, 0.035, 16),
        materials.skin
      );
      wrist.position.set(0, -0.012, 0);
      hand.add(wrist);

      const palm = new THREE.Mesh(
        new THREE.BoxGeometry(0.026, 0.095, 0.082),
        materials.skin
      );
      palm.position.set(0, -0.072, 0);
      palm.castShadow = true;
      hand.add(palm);

      const fOffsets = [-0.029, -0.010, 0.010, 0.029];
      const fLengths = [0.068, 0.080, 0.076, 0.060];
      fOffsets.forEach((fz, i) => {
        const finger = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.009, fLengths[i], 6, 10),
          materials.skin
        );
        finger.position.set(0, -0.152, fz);
        finger.castShadow = true;
        hand.add(finger);
      });

      const thumb = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.010, 0.052, 6, 10),
        materials.skin
      );
      thumb.position.set(side * -0.004, -0.068, 0.052);
      thumb.rotation.x = 0.45;
      hand.add(thumb);
    };

    buildArmChain(1);
    buildArmChain(-1);

    // Kinematic solver for clean Namaskar alignment
    const aimDownAxis = (dir: THREE.Vector3) =>
      new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir.clone().normalize());

    const solveArm = (
      side: 1 | -1,
      elbowDir: [number, number, number],
      wristOffsetFromShoulder: [number, number, number],
      handWorldEuler: [number, number, number]
    ) => {
      const uDir = new THREE.Vector3(...elbowDir).normalize();
      const qUpper = aimDownAxis(uDir);
      const elbowPos = uDir.clone().multiplyScalar(0.32);
      const wristPos = new THREE.Vector3(...wristOffsetFromShoulder);
      const foreWorldDir = wristPos.sub(elbowPos).normalize();
      const foreLocalDir = foreWorldDir.clone().applyQuaternion(qUpper.clone().invert());
      const qFore = aimDownAxis(foreLocalDir);
      const qCombined = qUpper.clone().multiply(qFore);
      const qHandWorld = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(...handWorldEuler, 'XYZ')
      );
      const qHand = qCombined.clone().invert().multiply(qHandWorld);
      return { upper: qUpper, fore: qFore, hand: qHand };
    };

    // Normalized scroll keyframes:
    // 0.00 -> 0.14: Clean real portrait at rest (arms tucked below/behind blazer edge)
    // 0.14 -> 0.48: Visitor scrolls -> sleeves rise smoothly & palms sweep inward
    // 0.48 -> 0.78: Full Namaskar joined palms at chest + respectful head bow on real photo!
    // 0.78 -> 1.00: Head lifts gracefully back up while holding poised welcoming Namaskar
    const times = [0.0, 0.12, 0.34, 0.56, 0.74, 1.0];

    const buildArmTracks = (side: 1 | -1) => {
      const prefix = side === 1 ? 'Left' : 'Right';
      const p0 = solveArm(
        side,
        [side * 0.12, -0.30, -0.10],
        [side * 0.15, -0.58, -0.10],
        [0, 0, 0]
      );
      const p1 = solveArm(
        side,
        [side * 0.10, -0.28, 0.02],
        [side * 0.08, -0.52, 0.08],
        [0.4, 0, side * 0.1]
      );
      const p2 = solveArm(
        side,
        [side * 0.08, -0.24, 0.14],
        [side * -0.14, -0.26, 0.28],
        [Math.PI * 0.78, side * 0.06, side * 0.05]
      );
      // Joined Namaskar palms cleanly centered at x = ±0.015, y = -0.10 relative to shoulder (below chin!)
      const p3 = solveArm(
        side,
        [side * 0.02, -0.25, 0.18],
        [side * -0.405, -0.10, 0.31],
        [Math.PI - 0.24, side * 0.06, side * 0.03]
      );
      const p4 = p3;
      const p5 = solveArm(
        side,
        [side * 0.03, -0.26, 0.17],
        [side * -0.402, -0.13, 0.30],
        [Math.PI - 0.20, side * 0.05, side * 0.02]
      );

      const poses = [p0, p1, p2, p3, p4, p5];
      return [
        makeDirectQuatTrack(
          `${prefix}UpperArm`,
          times,
          poses.map((p) => p.upper)
        ),
        makeDirectQuatTrack(
          `${prefix}ForeArm`,
          times,
          poses.map((p) => p.fore)
        ),
        makeDirectQuatTrack(
          `${prefix}Hand`,
          times,
          poses.map((p) => p.hand)
        ),
      ];
    };

    // Arms slide subtly forward/up from behind blazer base as scroll begins
    const armsAnchorPosTrack = new THREE.VectorKeyframeTrack(
      'ArmsAnchor.position',
      times,
      [
        0, -0.34, -0.16, // tucked cleanly out of sight at rest
        0, -0.18, -0.06,
        0, -0.02, 0.02,
        0, 0.02, 0.04, // aligned naturally with shoulders during Namaskar
        0, 0.02, 0.04,
        0, 0.0, 0.03,
      ]
    );
    armsAnchorPosTrack.setInterpolation(THREE.InterpolateSmooth);

    const armsAnchorScaleTrack = new THREE.VectorKeyframeTrack(
      'ArmsAnchor.scale',
      times,
      [
        0.72, 0.72, 0.72,
        0.92, 0.92, 0.92,
        1, 1, 1,
        1, 1, 1,
        1, 1, 1,
        1, 1, 1,
      ]
    );
    armsAnchorScaleTrack.setInterpolation(THREE.InterpolateSmooth);

    const tracks: THREE.KeyframeTrack[] = [
      makeEulerTrack('TorsoBone', times, [
        [0, 0, 0],
        [0.01, 0, 0],
        [0.03, 0, 0],
        [0.07, 0, 0], // gentle respectful forward bow
        [0.07, 0, 0],
        [0.02, 0, 0],
      ]),
      makeEulerTrack('HeadBone', times, [
        [0, 0, 0],
        [-0.02, 0, 0],
        [0.04, 0, 0],
        [0.16, 0, 0], // warm Namaskar bow of real portrait head
        [0.18, 0, 0],
        [0.01, 0, 0],
      ]),
      armsAnchorPosTrack,
      armsAnchorScaleTrack,
      ...buildArmTracks(1),
      ...buildArmTracks(-1),
    ];

    const clip = new THREE.AnimationClip('PortraitNamaskar', 1.0, tracks);
    const mixer = new THREE.AnimationMixer(root);
    const action = mixer.clipAction(clip);
    action.play();
    action.paused = true;

    return { root, mixer, action };
  }, [portraitPlaneGeo, materials]);

  useEffect(() => {
    return () => {
      rig.mixer.stopAllAction();
    };
  }, [rig]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const p = reducedMotion ? 0.65 : THREE.MathUtils.clamp(scrollProgressRef.current, 0, 1);

    // Scrub Namaskar animation directly from scroll progress
    rig.action.time = p;
    rig.mixer.update(0);

    if (stageGroupRef.current) {
      const baseX = isCompact ? 0 : 0.60;
      const baseY = isCompact ? 0.24 : 0.02;
      const px = reducedMotion ? 0 : pointer.x * 0.11;
      const py = reducedMotion ? 0 : pointer.y * 0.06;
      const floatY = reducedMotion ? 0 : Math.sin(t * 1.1) * 0.015;

      const lambda = reducedMotion ? 20 : 6;
      stageGroupRef.current.position.x = THREE.MathUtils.damp(
        stageGroupRef.current.position.x,
        baseX,
        lambda,
        delta
      );
      stageGroupRef.current.position.y = THREE.MathUtils.damp(
        stageGroupRef.current.position.y,
        baseY + floatY,
        lambda,
        delta
      );
      stageGroupRef.current.rotation.y = THREE.MathUtils.damp(
        stageGroupRef.current.rotation.y,
        -0.12 + px + p * 0.08,
        lambda,
        delta
      );
      stageGroupRef.current.rotation.x = THREE.MathUtils.damp(
        stageGroupRef.current.rotation.x,
        -py,
        lambda,
        delta
      );
    }

    if (ringRef.current && !reducedMotion) {
      ringRef.current.rotation.z += delta * 0.14;
    }
  });

  return (
    <group ref={stageGroupRef} position={[isCompact ? 0 : 0.60, isCompact ? 0.24 : 0.02, 0]}>
      {/* Subtle Architectural Halo Framing Behind Pritom's Portrait */}
      <mesh ref={ringRef} position={[0, 0.18, -0.28]}>
        <torusGeometry args={[0.92, 0.005, 12, 96]} />
        <meshStandardMaterial
          color="#6366f1"
          metalness={0.85}
          roughness={0.2}
          emissive="#4338ca"
          emissiveIntensity={0.28}
        />
      </mesh>
      <mesh position={[0, 0.18, -0.34]}>
        <circleGeometry args={[0.88, 64]} />
        <meshBasicMaterial color="#141422" transparent opacity={0.45} />
      </mesh>

      <primitive object={rig.root} />
    </group>
  );
}
