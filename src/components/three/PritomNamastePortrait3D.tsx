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
 * Loads Pritom's studio portrait, keys out ONLY the exterior white studio background
 * via perimeter flood-fill (preserving his crisp white shirt inside the tan blazer),
 * samples exact blazer & skin colors, and splits into Torso + Head layers for bowing.
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

      const sampleRgb = (nx: number, ny: number) => {
        const sx = Math.min(size - 1, Math.max(0, Math.round(nx * size)));
        const sy = Math.min(size - 1, Math.max(0, Math.round(ny * size)));
        const i = (sy * size + sx) * 4;
        return `rgb(${px[i]}, ${px[i + 1]}, ${px[i + 2]})`;
      };
      const blazerColor = sampleRgb(0.22, 0.90);
      const skinColor = sampleRgb(0.50, 0.56);

      // Flood-fill from top, left, and right edges ONLY so interior white dress shirt stays intact
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

      for (let x = 0; x < size; x++) enqueue(x, 0);
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

      // Soft anti-aliased edge feathering + smooth lower seam blend into 3D blazer torso
      for (let y = 0; y < size; y++) {
        const bottomFade =
          y > size * 0.91 ? Math.max(0, 1 - (y - size * 0.91) / (size * 0.09)) : 1;

        for (let x = 0; x < size; x++) {
          const idx = y * size + x;
          const p = idx * 4;

          if (isBg[idx]) {
            px[p + 3] = 0;
          } else {
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

      const makeLayerCanvas = (mode: 'torso' | 'head') => {
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const cctx = c.getContext('2d');
        if (!cctx) return c;
        cctx.drawImage(baseCanvas, 0, 0);
        const lData = cctx.getImageData(0, 0, size, size);
        const lp = lData.data;

        const splitStart = Math.round(size * 0.65);
        const splitEnd = Math.round(size * 0.73);

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

      const torsoTexture = new THREE.CanvasTexture(makeLayerCanvas('torso'));
      torsoTexture.colorSpace = THREE.SRGBColorSpace;
      torsoTexture.anisotropy = Math.min(8, maxAnisotropy);
      torsoTexture.needsUpdate = true;

      const headTexture = new THREE.CanvasTexture(makeLayerCanvas('head'));
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

  // 0.88m plane aligns Pritom's photo shoulders (±0.43m) and white shirt (±0.11m) 1:1 with the 3D blazer & arms
  const portraitPlaneGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(0.88, 0.88, 24, 24);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const r2 = (x * x) / 0.24 + (y * y) / 0.30;
      const z = Math.max(0, (1 - r2) * 0.055);
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

  const materials = useMemo(() => {
    const blazer = new THREE.MeshStandardMaterial({
      color: portraitData?.blazerColor ?? '#b1967e',
      roughness: 0.78,
      metalness: 0.04,
    });
    const blazerDark = new THREE.MeshStandardMaterial({
      color: '#957b65',
      roughness: 0.82,
      metalness: 0.04,
    });
    const shirt = new THREE.MeshStandardMaterial({
      color: '#f3f3f5',
      roughness: 0.72,
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
    return { blazer, blazerDark, shirt, skin, torsoMat, headMat };
  }, [portraitData]);

  useEffect(() => {
    return () => {
      Object.values(materials).forEach((m) => m.dispose());
    };
  }, [materials]);

  // Full upper-body skeletal rig:
  // Combines Pritom's actual split portrait (TorsoBone -> HeadBone) with a proportional
  // tailored tan-blazer torso extension & full arms/hands that execute a complete
  // traditional Namaskar (Anjali Mudra) at heart center when scrolling.
  const rig = useMemo(() => {
    const root = new THREE.Group();

    const torsoBone = new THREE.Bone();
    torsoBone.name = 'TorsoBone';
    torsoBone.position.set(0, -0.05, 0);
    root.add(torsoBone);

    const headBone = new THREE.Bone();
    headBone.name = 'HeadBone';
    headBone.position.set(0, 0.10, 0.015);
    torsoBone.add(headBone);

    // Torso Photo Layer (shoulders, collar, lapels, upper chest)
    const torsoMesh = new THREE.Mesh(portraitPlaneGeo, materials.torsoMat);
    torsoMesh.position.set(0, 0.30, 0.01);
    torsoBone.add(torsoMesh);

    // Head Photo Layer (seamless at rest; bows respectfully during Namaskar)
    const headMesh = new THREE.Mesh(portraitPlaneGeo, materials.headMat);
    headMesh.position.set(0, 0.20, 0);
    headBone.add(headMesh);

    // Seamless Lower Blazer Torso & White Dress Shirt Extension
    const lowerBlazerGroup = new THREE.Group();
    lowerBlazerGroup.position.set(0, -0.32, -0.015);

    const blazerBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.30, 0.60, 28),
      materials.blazer
    );
    blazerBody.scale.set(1.16, 1, 0.52);
    blazerBody.castShadow = true;
    blazerBody.receiveShadow = true;
    lowerBlazerGroup.add(blazerBody);

    // Crisp white shirt placket peeking naturally between blazer lapels
    const shirtFront = new THREE.Mesh(
      new THREE.CylinderGeometry(0.115, 0.075, 0.56, 20),
      materials.shirt
    );
    shirtFront.position.set(0, 0.02, 0.115);
    shirtFront.scale.set(1.0, 1, 0.42);
    lowerBlazerGroup.add(shirtFront);

    // Blazer front button
    const button = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.016, 0.01, 16),
      materials.blazerDark
    );
    button.rotation.x = Math.PI / 2;
    button.position.set(0, -0.06, 0.185);
    lowerBlazerGroup.add(button);

    torsoBone.add(lowerBlazerGroup);

    // Full Proportional Arms anchored cleanly at his blazer shoulders
    const buildArmChain = (side: 1 | -1) => {
      const prefix = side === 1 ? 'Left' : 'Right';
      const upperArm = new THREE.Bone();
      upperArm.name = `${prefix}UpperArm`;
      upperArm.position.set(side * 0.35, -0.02, -0.02);
      torsoBone.add(upperArm);

      const foreArm = new THREE.Bone();
      foreArm.name = `${prefix}ForeArm`;
      foreArm.position.set(0, -0.33, 0);
      upperArm.add(foreArm);

      const hand = new THREE.Bone();
      hand.name = `${prefix}Hand`;
      hand.position.set(0, -0.305, 0);
      foreArm.add(hand);

      // Shoulder cap blending smoothly into photo blazer shoulders
      const shoulderCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.095, 18, 16),
        materials.blazer
      );
      upperArm.add(shoulderCap);

      // Upper blazer sleeve (0.33m)
      const sleeveUpper = new THREE.Mesh(
        new THREE.CylinderGeometry(0.092, 0.076, 0.33, 22),
        materials.blazer
      );
      sleeveUpper.position.set(0, -0.165, 0);
      sleeveUpper.castShadow = true;
      upperArm.add(sleeveUpper);

      const elbowJoint = new THREE.Mesh(
        new THREE.SphereGeometry(0.076, 18, 16),
        materials.blazer
      );
      foreArm.add(elbowJoint);

      // Forearm blazer sleeve (0.28m)
      const sleeveFore = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.058, 0.28, 22),
        materials.blazer
      );
      sleeveFore.position.set(0, -0.14, 0);
      sleeveFore.castShadow = true;
      foreArm.add(sleeveFore);

      // Crisp white dress shirt cuff
      const shirtCuff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.056, 0.051, 0.036, 20),
        materials.shirt
      );
      shirtCuff.position.set(0, -0.292, 0);
      foreArm.add(shirtCuff);

      // Wrist & Proportional Sculpted Palm + Articulated Fingers
      const wrist = new THREE.Mesh(
        new THREE.CylinderGeometry(0.037, 0.034, 0.034, 16),
        materials.skin
      );
      wrist.position.set(0, -0.012, 0);
      hand.add(wrist);

      const palm = new THREE.Mesh(
        new THREE.BoxGeometry(0.030, 0.115, 0.096),
        materials.skin
      );
      palm.position.set(0, -0.076, 0);
      palm.castShadow = true;
      hand.add(palm);

      const fOffsets = [-0.034, -0.011, 0.012, 0.034];
      const fLengths = [0.074, 0.088, 0.082, 0.062];
      fOffsets.forEach((fz, i) => {
        const finger = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.0105, fLengths[i], 6, 10),
          materials.skin
        );
        finger.position.set(0, -0.172, fz);
        finger.castShadow = true;
        hand.add(finger);
      });

      const thumb = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.0115, 0.062, 6, 10),
        materials.skin
      );
      thumb.position.set(side * -0.005, -0.072, 0.062);
      thumb.rotation.x = 0.45;
      hand.add(thumb);
    };

    buildArmChain(1);
    buildArmChain(-1);

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
      const elbowPos = uDir.clone().multiplyScalar(0.33);
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

    // Full Namaskar Scroll Choreography:
    // 0.00 - 0.10: Natural relaxed standing pose (arms comfortably at sides)
    // 0.10 - 0.34: Arms sweep smoothly forward & upward; elbows fold toward heart center
    // 0.34 - 0.72: Full Namaskar — palms pressed flush together at heart center + deep respectful bow
    // 0.72 - 1.00: Head lifts warmly back up while holding the full Namaskar palms joined at chest
    const times = [0.0, 0.10, 0.32, 0.54, 0.72, 1.0];

    const buildArmTracks = (side: 1 | -1) => {
      const prefix = side === 1 ? 'Left' : 'Right';
      // 1. Relaxed standing arms at sides (forearm reach = 0.305m)
      const p0 = solveArm(
        side,
        [side * 0.04, -0.33, 0.02],
        [side * 0.05, -0.63, 0.05],
        [0.05, 0, side * -0.05]
      );
      // 2. Gentle initiation
      const p1 = solveArm(
        side,
        [side * 0.08, -0.31, 0.08],
        [side * 0.02, -0.52, 0.24],
        [0.55, 0, side * -0.04]
      );
      // 3. Sweeping elbows & forearms upward toward sternum
      const p2 = solveArm(
        side,
        [side * 0.08, -0.29, 0.12],
        [side * -0.14, -0.25, 0.29],
        [Math.PI * 0.85, side * 0.04, side * 0.02]
      );
      // 4. Full Namaskar — exact 0.305m forearm reach bringing palms flush to x = ±0.017 at heart center
      const p3 = solveArm(
        side,
        [side * -0.08, -0.26, 0.18],
        [side * -0.333, -0.14, 0.30],
        [Math.PI + 0.14, 0, side * 0.02]
      );
      // 5. Hold full Namaskar through respectful bow
      const p4 = p3;
      // 6. Keep full Namaskar hands poised cleanly at heart center as head lifts
      const p5 = solveArm(
        side,
        [side * -0.08, -0.26, 0.18],
        [side * -0.333, -0.15, 0.30],
        [Math.PI + 0.12, 0, side * 0.02]
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

    const tracks: THREE.KeyframeTrack[] = [
      makeEulerTrack('TorsoBone', times, [
        [0, 0, 0],
        [0.01, 0, 0],
        [0.04, 0, 0],
        [0.09, 0, 0], // respectful torso lean forward
        [0.09, 0, 0],
        [0.02, 0, 0],
      ]),
      makeEulerTrack('HeadBone', times, [
        [0, 0, 0],
        [-0.02, 0, 0],
        [0.05, 0, 0],
        [0.18, 0, 0], // full dignified Namaskar head bow
        [0.19, 0, 0],
        [0.0, 0, 0],
      ]),
      ...buildArmTracks(1),
      ...buildArmTracks(-1),
    ];

    const clip = new THREE.AnimationClip('FullNamaskar', 1.0, tracks);
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
    const p = reducedMotion ? 0.62 : THREE.MathUtils.clamp(scrollProgressRef.current, 0, 1);

    rig.action.time = p;
    rig.mixer.update(0);

    if (stageGroupRef.current) {
      const baseX = isCompact ? 0 : 0.48;
      const baseY = isCompact ? 0.16 : 0.02;
      const px = reducedMotion ? 0 : pointer.x * 0.10;
      const py = reducedMotion ? 0 : pointer.y * 0.05;
      const floatY = reducedMotion ? 0 : Math.sin(t * 1.1) * 0.010;

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
        -0.08 + px + p * 0.05,
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
    <group ref={stageGroupRef} position={[isCompact ? 0 : 0.48, isCompact ? 0.16 : 0.02, 0]}>
      {/* Architectural Halo Framing */}
      <mesh ref={ringRef} position={[0, 0.10, -0.28]}>
        <torusGeometry args={[0.76, 0.0045, 12, 96]} />
        <meshStandardMaterial
          color="#6366f1"
          metalness={0.85}
          roughness={0.2}
          emissive="#4338ca"
          emissiveIntensity={0.28}
        />
      </mesh>
      <mesh position={[0, 0.10, -0.34]}>
        <circleGeometry args={[0.73, 64]} />
        <meshBasicMaterial color="#141422" transparent opacity={0.42} />
      </mesh>

      <primitive object={rig.root} />
    </group>
  );
}
