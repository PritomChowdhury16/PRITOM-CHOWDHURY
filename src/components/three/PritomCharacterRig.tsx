import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

export interface PritomCharacterRigProps {
  scrollProgressRef: React.MutableRefObject<number>;
  portraitUrl: string;
  characterGlbUrl: string | null;
  namasteClipName: string;
  reducedMotion: boolean;
}

/**
 * Generates a blended facial texture from Pritom's supplied portrait photo
 * onto a calibrated skin-tone UV canvas so the sculpted 3D head naturally
 * preserves his actual facial features without harsh edges.
 */
function usePortraitFaceTexture(portraitUrl: string): THREE.CanvasTexture | null {
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Base warm skin tone matching Pritom's portrait
    ctx.fillStyle = '#cf9679';
    ctx.fillRect(0, 0, 512, 512);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Clear to base skin tone
      ctx.fillStyle = '#cf9679';
      ctx.fillRect(0, 0, 512, 512);

      // Draw portrait centered in the front UV band (u: 0.25..0.75 of sphere/head)
      // SphereGeometry with phiStart = -Math.PI/2 places u=0.5 directly facing +Z
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(256, 256, 118, 152, 0, 0, Math.PI * 2);
      ctx.clip();

      // Crop tight around the face from the supplied portrait
      const sx = img.width * 0.16;
      const sy = img.height * 0.18;
      const sw = img.width * 0.68;
      const sh = img.height * 0.56;
      ctx.drawImage(img, sx, sy, sw, sh, 128, 100, 256, 306);
      ctx.restore();

      // Soft radial vignette blend into surrounding skin tone
      const grad = ctx.createRadialGradient(256, 254, 72, 256, 254, 148);
      grad.addColorStop(0, 'rgba(207, 150, 121, 0)');
      grad.addColorStop(0.65, 'rgba(207, 150, 121, 0.35)');
      grad.addColorStop(1, 'rgba(207, 150, 121, 1)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      tex.needsUpdate = true;
    };
    img.src = portraitUrl;

    return tex;
  }, [portraitUrl]);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  return texture;
}

/**
 * Generates subtle woven fabric micro-roughness texture for blazer & trousers.
 */
function useSuitFabricTexture(): THREE.CanvasTexture | null {
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 128; y += 2) {
      for (let x = 0; x < 128; x += 2) {
        const v = (x + y) % 4 === 0 ? 148 : 112;
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 6);
    return tex;
  }, []);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  return texture;
}

/**
 * Replaceable Blender GLB/GLTF Character Slot.
 * Automatically binds AnimationClip + AnimationMixer to GSAP scrollProgressRef.
 */
function GLTFCharacterModel({
  url,
  namasteClipName,
  scrollProgressRef,
  reducedMotion,
}: {
  url: string;
  namasteClipName: string;
  scrollProgressRef: React.MutableRefObject<number>;
  reducedMotion: boolean;
}) {
  const gltf = useGLTF(url);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionRef = useRef<THREE.AnimationAction | null>(null);
  const clipDurationRef = useRef<number>(1);

  useEffect(() => {
    if (!gltf.scene) return;
    gltf.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    const mixer = new THREE.AnimationMixer(gltf.scene);
    mixerRef.current = mixer;

    const clip =
      THREE.AnimationClip.findByName(gltf.animations, namasteClipName) ||
      gltf.animations[0];

    if (clip) {
      clipDurationRef.current = clip.duration || 1;
      const action = mixer.clipAction(clip);
      action.play();
      action.paused = true;
      actionRef.current = action;
    }

    return () => {
      mixer.stopAllAction();
      mixerRef.current = null;
      actionRef.current = null;
    };
  }, [gltf, namasteClipName]);

  useFrame(() => {
    const mixer = mixerRef.current;
    const action = actionRef.current;
    if (!mixer || !action) return;
    const p = reducedMotion ? 0.68 : THREE.MathUtils.clamp(scrollProgressRef.current, 0, 1);
    action.time = p * clipDurationRef.current;
    mixer.update(0);
  });

  return <primitive object={gltf.scene} position={[0, 0, 0]} />;
}

class GLTFErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * Helper to create a QuaternionKeyframeTrack from keyframe timestamps and Euler angles.
 */
function makeQuatTrack(
  boneName: string,
  times: number[],
  eulers: Array<[number, number, number]>
): THREE.QuaternionKeyframeTrack {
  const values: number[] = [];
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  for (const [x, y, z] of eulers) {
    e.set(x, y, z, 'XYZ');
    q.setFromEuler(e);
    values.push(q.x, q.y, q.z, q.w);
  }
  const track = new THREE.QuaternionKeyframeTrack(`${boneName}.quaternion`, times, values);
  track.setInterpolation(THREE.InterpolateSmooth);
  return track;
}

/**
 * Built-in Skeletal-Rigged 3D Character of Pritom Chowdhury.
 * Uses a real THREE.Bone hierarchy, THREE.Skeleton, THREE.AnimationClip,
 * and THREE.AnimationMixer scrubbed by GSAP ScrollTrigger.
 */
function ProceduralRiggedPritom({
  scrollProgressRef,
  portraitUrl,
  reducedMotion,
}: {
  scrollProgressRef: React.MutableRefObject<number>;
  portraitUrl: string;
  reducedMotion: boolean;
}) {
  const faceTexture = usePortraitFaceTexture(portraitUrl);
  const fabricTexture = useSuitFabricTexture();

  const materials = useMemo(() => {
    const skin = new THREE.MeshStandardMaterial({
      color: '#cf9679',
      roughness: 0.62,
      metalness: 0.02,
    });
    const face = new THREE.MeshStandardMaterial({
      map: faceTexture ?? undefined,
      color: '#ffffff',
      roughness: 0.58,
      metalness: 0.02,
    });
    const hair = new THREE.MeshStandardMaterial({
      color: '#15171d',
      roughness: 0.86,
      metalness: 0.04,
    });
    const blazer = new THREE.MeshStandardMaterial({
      color: '#1c1d24',
      roughnessMap: fabricTexture ?? undefined,
      roughness: 0.78,
      metalness: 0.06,
    });
    const lapel = new THREE.MeshStandardMaterial({
      color: '#14151b',
      roughness: 0.55,
      metalness: 0.14,
    });
    const shirt = new THREE.MeshStandardMaterial({
      color: '#eceae4',
      roughness: 0.85,
      metalness: 0.02,
    });
    const trousers = new THREE.MeshStandardMaterial({
      color: '#16171d',
      roughness: 0.82,
      metalness: 0.04,
    });
    const shoe = new THREE.MeshStandardMaterial({
      color: '#101116',
      roughness: 0.42,
      metalness: 0.12,
    });
    const pin = new THREE.MeshStandardMaterial({
      color: '#6366f1',
      roughness: 0.25,
      metalness: 0.82,
      emissive: '#312e81',
      emissiveIntensity: 0.35,
    });
    return { skin, face, hair, blazer, lapel, shirt, trousers, shoe, pin };
  }, [faceTexture, fabricTexture]);

  useEffect(() => {
    return () => {
      Object.values(materials).forEach((mat) => mat.dispose());
    };
  }, [materials]);

  // Build skeletal bone hierarchy + AnimationClips
  const rig = useMemo(() => {
    const root = new THREE.Group();
    root.name = 'PritomCharacterRoot';

    // Core spine chain
    const hips = new THREE.Bone();
    hips.name = 'Hips';
    hips.position.set(0, 0.94, 0);

    const spine = new THREE.Bone();
    spine.name = 'Spine';
    spine.position.set(0, 0.12, 0);
    hips.add(spine);

    const chest = new THREE.Bone();
    chest.name = 'Chest';
    chest.position.set(0, 0.22, 0);
    spine.add(chest);

    const neck = new THREE.Bone();
    neck.name = 'Neck';
    neck.position.set(0, 0.23, 0);
    chest.add(neck);

    const head = new THREE.Bone();
    head.name = 'Head';
    head.position.set(0, 0.11, 0);
    neck.add(head);

    // Left Arm chain (+X)
    const leftShoulder = new THREE.Bone();
    leftShoulder.name = 'LeftShoulder';
    leftShoulder.position.set(0.06, 0.17, 0);
    chest.add(leftShoulder);

    const leftUpperArm = new THREE.Bone();
    leftUpperArm.name = 'LeftUpperArm';
    leftUpperArm.position.set(0.14, -0.01, 0);
    leftShoulder.add(leftUpperArm);

    const leftForeArm = new THREE.Bone();
    leftForeArm.name = 'LeftForeArm';
    leftForeArm.position.set(0, -0.27, 0);
    leftUpperArm.add(leftForeArm);

    const leftHand = new THREE.Bone();
    leftHand.name = 'LeftHand';
    leftHand.position.set(0, -0.24, 0);
    leftForeArm.add(leftHand);

    // Right Arm chain (-X)
    const rightShoulder = new THREE.Bone();
    rightShoulder.name = 'RightShoulder';
    rightShoulder.position.set(-0.06, 0.17, 0);
    chest.add(rightShoulder);

    const rightUpperArm = new THREE.Bone();
    rightUpperArm.name = 'RightUpperArm';
    rightUpperArm.position.set(-0.14, -0.01, 0);
    rightShoulder.add(rightUpperArm);

    const rightForeArm = new THREE.Bone();
    rightForeArm.name = 'RightForeArm';
    rightForeArm.position.set(0, -0.27, 0);
    rightUpperArm.add(rightForeArm);

    const rightHand = new THREE.Bone();
    rightHand.name = 'RightHand';
    rightHand.position.set(0, -0.24, 0);
    rightForeArm.add(rightHand);

    // Legs
    const leftUpLeg = new THREE.Bone();
    leftUpLeg.name = 'LeftUpLeg';
    leftUpLeg.position.set(0.095, -0.02, 0);
    hips.add(leftUpLeg);

    const leftLeg = new THREE.Bone();
    leftLeg.name = 'LeftLeg';
    leftLeg.position.set(0, -0.45, 0);
    leftUpLeg.add(leftLeg);

    const leftFoot = new THREE.Bone();
    leftFoot.name = 'LeftFoot';
    leftFoot.position.set(0, -0.42, 0);
    leftLeg.add(leftFoot);

    const rightUpLeg = new THREE.Bone();
    rightUpLeg.name = 'RightUpLeg';
    rightUpLeg.position.set(-0.095, -0.02, 0);
    hips.add(rightUpLeg);

    const rightLeg = new THREE.Bone();
    rightLeg.name = 'RightLeg';
    rightLeg.position.set(0, -0.45, 0);
    rightUpLeg.add(rightLeg);

    const rightFoot = new THREE.Bone();
    rightFoot.name = 'RightFoot';
    rightFoot.position.set(0, -0.42, 0);
    rightLeg.add(rightFoot);

    root.add(hips);

    const allBones = [
      hips,
      spine,
      chest,
      neck,
      head,
      leftShoulder,
      leftUpperArm,
      leftForeArm,
      leftHand,
      rightShoulder,
      rightUpperArm,
      rightForeArm,
      rightHand,
      leftUpLeg,
      leftLeg,
      leftFoot,
      rightUpLeg,
      rightLeg,
      rightFoot,
    ];
    const skeleton = new THREE.Skeleton(allBones);

    // --- Attach multi-part sculpted anatomical meshes to skeleton bones ---

    // Pelvis / Hips
    const pelvisMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.155, 0.165, 0.16, 24),
      materials.trousers
    );
    pelvisMesh.position.set(0, 0.03, 0);
    pelvisMesh.castShadow = true;
    pelvisMesh.receiveShadow = true;
    hips.add(pelvisMesh);

    // Lower torso / waist
    const waistMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.152, 0.145, 0.24, 24),
      materials.blazer
    );
    waistMesh.position.set(0, 0.11, 0);
    waistMesh.scale.set(1.06, 1, 0.72);
    waistMesh.castShadow = true;
    waistMesh.receiveShadow = true;
    spine.add(waistMesh);

    // Inner crew shirt panel
    const innerShirt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.128, 0.122, 0.24, 20),
      materials.shirt
    );
    innerShirt.position.set(0, 0.11, 0.025);
    innerShirt.scale.set(0.9, 1, 0.65);
    chest.add(innerShirt);

    // Chest / Tailored Blazer upper body
    const chestMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.155, 0.26, 24),
      materials.blazer
    );
    chestMesh.position.set(0, 0.11, -0.005);
    chestMesh.scale.set(1.12, 1, 0.72);
    chestMesh.castShadow = true;
    chestMesh.receiveShadow = true;
    chest.add(chestMesh);

    // Blazer shoulders & collar lapels
    const lapelShape = new THREE.Shape();
    lapelShape.moveTo(0, 0);
    lapelShape.lineTo(0.055, 0.18);
    lapelShape.lineTo(0.02, 0.20);
    lapelShape.lineTo(-0.015, 0.02);
    lapelShape.closePath();

    const lapelGeo = new THREE.ExtrudeGeometry(lapelShape, {
      depth: 0.014,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.004,
      bevelSegments: 2,
    });
    const leftLapel = new THREE.Mesh(lapelGeo, materials.lapel);
    leftLapel.position.set(0.025, 0.01, 0.105);
    leftLapel.rotation.set(-0.08, 0.18, -0.18);
    chest.add(leftLapel);

    const rightLapel = new THREE.Mesh(lapelGeo, materials.lapel);
    rightLapel.scale.x = -1;
    rightLapel.position.set(-0.025, 0.01, 0.105);
    rightLapel.rotation.set(-0.08, -0.18, 0.18);
    chest.add(rightLapel);

    // Subtle electric indigo lapel pin
    const lapelPin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.009, 0.009, 0.006, 16),
      materials.pin
    );
    lapelPin.rotation.x = Math.PI / 2;
    lapelPin.position.set(0.068, 0.145, 0.118);
    chest.add(lapelPin);

    // Neck
    const neckMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.052, 0.06, 0.13, 20),
      materials.skin
    );
    neckMesh.position.set(0, 0.055, 0);
    neckMesh.castShadow = true;
    neck.add(neckMesh);

    // Head cranium with Pritom's face texture mapped onto front hemisphere
    const headGeo = new THREE.SphereGeometry(0.118, 36, 28);
    headGeo.rotateY(-Math.PI / 2); // Align u=0.5 directly with +Z
    const headMesh = new THREE.Mesh(headGeo, materials.face);
    headMesh.position.set(0, 0.085, 0.008);
    headMesh.scale.set(0.88, 1.08, 0.94);
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    head.add(headMesh);

    // Subtle chin/jawline contour
    const jawMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.086, 24, 18),
      materials.skin
    );
    jawMesh.position.set(0, 0.032, 0.016);
    jawMesh.scale.set(0.88, 0.72, 0.88);
    head.add(jawMesh);

    // Ears
    const earGeo = new THREE.SphereGeometry(0.022, 12, 12);
    const leftEar = new THREE.Mesh(earGeo, materials.skin);
    leftEar.position.set(0.098, 0.08, -0.005);
    leftEar.scale.set(0.45, 1.15, 0.75);
    head.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, materials.skin);
    rightEar.position.set(-0.098, 0.08, -0.005);
    rightEar.scale.set(0.45, 1.15, 0.75);
    head.add(rightEar);

    // Sculpted short textured dark hair (matching Pritom's portrait)
    const hairCrown = new THREE.Mesh(
      new THREE.SphereGeometry(0.123, 28, 22, 0, Math.PI * 2, 0, Math.PI * 0.56),
      materials.hair
    );
    hairCrown.position.set(0, 0.095, -0.006);
    hairCrown.scale.set(0.90, 1.05, 0.98);
    hairCrown.rotation.x = -0.22;
    hairCrown.castShadow = true;
    head.add(hairCrown);

    const hairBack = new THREE.Mesh(
      new THREE.SphereGeometry(0.118, 22, 18, 0, Math.PI, 0, Math.PI * 0.72),
      materials.hair
    );
    hairBack.position.set(0, 0.086, -0.016);
    hairBack.rotation.y = Math.PI;
    hairBack.scale.set(0.88, 1.02, 0.92);
    head.add(hairBack);

    // Hair front wave tufts
    const tuftGeo = new THREE.SphereGeometry(0.044, 14, 12);
    const tuftPositions: Array<[number, number, number, number, number]> = [
      [-0.045, 0.178, 0.056, 1.2, 0.6],
      [0.0, 0.188, 0.062, 1.3, 0.65],
      [0.046, 0.178, 0.055, 1.1, 0.6],
    ];
    for (const [tx, ty, tz, sx, sy] of tuftPositions) {
      const tuft = new THREE.Mesh(tuftGeo, materials.hair);
      tuft.position.set(tx, ty, tz);
      tuft.scale.set(sx, sy, 0.8);
      head.add(tuft);
    }

    // Helper to build articulated arm + multi-finger palm
    const buildArmMeshes = (
      side: 1 | -1,
      upperArmBone: THREE.Bone,
      foreArmBone: THREE.Bone,
      handBone: THREE.Bone
    ) => {
      // Shoulder cap
      const shoulderCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.064, 18, 16),
        materials.blazer
      );
      shoulderCap.castShadow = true;
      upperArmBone.add(shoulderCap);

      // Upper sleeve
      const upperSleeve = new THREE.Mesh(
        new THREE.CylinderGeometry(0.058, 0.049, 0.27, 18),
        materials.blazer
      );
      upperSleeve.position.set(0, -0.135, 0);
      upperSleeve.castShadow = true;
      upperArmBone.add(upperSleeve);

      // Elbow joint
      const elbowCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.048, 16, 14),
        materials.blazer
      );
      foreArmBone.add(elbowCap);

      // Forearm sleeve
      const forearmSleeve = new THREE.Mesh(
        new THREE.CylinderGeometry(0.048, 0.039, 0.225, 18),
        materials.blazer
      );
      forearmSleeve.position.set(0, -0.112, 0);
      forearmSleeve.castShadow = true;
      foreArmBone.add(forearmSleeve);

      // Shirt cuff
      const cuff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.040, 0.037, 0.025, 16),
        materials.shirt
      );
      cuff.position.set(0, -0.228, 0);
      foreArmBone.add(cuff);

      // Wrist
      const wrist = new THREE.Mesh(
        new THREE.CylinderGeometry(0.028, 0.026, 0.03, 14),
        materials.skin
      );
      wrist.position.set(0, -0.012, 0);
      handBone.add(wrist);

      // Palm (flattened along X so palms kiss cleanly at X=0 in Namaste)
      const palm = new THREE.Mesh(
        new THREE.BoxGeometry(0.022, 0.082, 0.068),
        materials.skin
      );
      palm.position.set(0, -0.064, 0.002);
      palm.castShadow = true;
      handBone.add(palm);

      // 4 fingers + thumb
      const fingerOffsets = [-0.024, -0.008, 0.008, 0.024];
      const fingerLengths = [0.062, 0.072, 0.068, 0.056];
      fingerOffsets.forEach((fz, idx) => {
        const f = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.0075, fingerLengths[idx], 6, 10),
          materials.skin
        );
        f.position.set(0, -0.132, fz);
        f.castShadow = true;
        handBone.add(f);
      });

      // Thumb angled subtly forward/up
      const thumb = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.0085, 0.044, 6, 10),
        materials.skin
      );
      thumb.position.set(side * -0.004, -0.062, 0.044);
      thumb.rotation.x = 0.42;
      handBone.add(thumb);
    };

    buildArmMeshes(1, leftUpperArm, leftForeArm, leftHand);
    buildArmMeshes(-1, rightUpperArm, rightForeArm, rightHand);

    // Helper to build tailored trousers & grounded shoes
    const buildLegMeshes = (
      upLegBone: THREE.Bone,
      legBone: THREE.Bone,
      footBone: THREE.Bone
    ) => {
      const thigh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.082, 0.066, 0.45, 20),
        materials.trousers
      );
      thigh.position.set(0, -0.225, 0);
      thigh.castShadow = true;
      thigh.receiveShadow = true;
      upLegBone.add(thigh);

      const shin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.050, 0.42, 20),
        materials.trousers
      );
      shin.position.set(0, -0.21, 0);
      shin.castShadow = true;
      shin.receiveShadow = true;
      legBone.add(shin);

      const shoeUpper = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.046, 0.11, 8, 14),
        materials.shoe
      );
      shoeUpper.rotation.x = Math.PI / 2;
      shoeUpper.position.set(0, -0.015, 0.045);
      shoeUpper.scale.set(1.0, 1.0, 0.72);
      shoeUpper.castShadow = true;
      footBone.add(shoeUpper);
    };

    buildLegMeshes(leftUpLeg, leftLeg, leftFoot);
    buildLegMeshes(rightUpLeg, rightLeg, rightFoot);

    // --- Real Skeletal AnimationClip for the Scroll-Driven Namaste Greeting ---
    // Normalized time 0.0 -> 1.0 mapped directly to GSAP ScrollTrigger progress:
    // 0.00 - 0.16: Welcome (relaxed stance)
    // 0.16 - 0.35: Notice visitor (torso leans slightly, head turns attentive, arms begin rising)
    // 0.35 - 0.62: Arms rise & elbows bend so both palms meet cleanly at chest center (Namaste)
    // 0.62 - 0.78: Palms held together + respectful forward head bow
    // 0.78 - 1.00: Head rises gracefully, hands soften slightly into composed stance
    const times = [0.0, 0.16, 0.35, 0.58, 0.72, 0.84, 1.0];

    // Helper to compute exact local quaternion aiming a bone's -Y axis along a target direction vector
    const aimDownAxisTo = (targetDir: THREE.Vector3, rollRad = 0): THREE.Quaternion => {
      const dir = targetDir.clone().normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
      if (rollRad !== 0) {
        const rollQ = new THREE.Quaternion().setFromAxisAngle(dir, rollRad);
        q.premultiply(rollQ);
      }
      return q;
    };

    const makeDirectQuatTrack = (
      boneName: string,
      times: number[],
      quats: THREE.Quaternion[]
    ): THREE.QuaternionKeyframeTrack => {
      const values: number[] = [];
      for (const q of quats) {
        values.push(q.x, q.y, q.z, q.w);
      }
      const track = new THREE.QuaternionKeyframeTrack(`${boneName}.quaternion`, times, values);
      track.setInterpolation(THREE.InterpolateSmooth);
      return track;
    };

    // Solve exact Left (+1) and Right (-1) arm quaternions for every Namaste keyframe
    const solveArmPose = (
      side: 1 | -1,
      elbowOffset: [number, number, number],
      wristTargetOffset: [number, number, number],
      handWorldEuler: [number, number, number]
    ) => {
      const upperDir = new THREE.Vector3(...elbowOffset).normalize();
      const qUpper = aimDownAxisTo(upperDir);

      // Desired forearm direction in world/chest space
      const elbowPos = upperDir.clone().multiplyScalar(0.27);
      const wristPos = new THREE.Vector3(...wristTargetOffset);
      const foreWorldDir = wristPos.sub(elbowPos).normalize();

      // Convert forearm direction into UpperArm local space
      const foreLocalDir = foreWorldDir.clone().applyQuaternion(qUpper.clone().invert());
      const qFore = aimDownAxisTo(foreLocalDir);

      // Hand orientation in world/chest space converted into ForeArm local space
      const qCombinedArm = qUpper.clone().multiply(qFore);
      const qHandWorld = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(...handWorldEuler, 'XYZ')
      );
      const qHandLocal = qCombinedArm.clone().invert().multiply(qHandWorld);

      // For symmetrical palms facing inward at center (x = 0):
      // In local hand geometry, palm is built downward (-Y) with flat surface normal along X.
      // Rotating hand so fingers point upward (+Y) and slightly forward (+Z):
      // Left palm inner face points -X; Right palm inner face points +X.
      return {
        upper: qUpper,
        fore: qFore,
        hand: qHandLocal,
        shoulder: new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0, side * -0.10, side * 0.04, 'XYZ')
        ),
      };
    };

    // Keyframe poses for Left (+1) and Right (-1) arms
    const buildArmTracks = (side: 1 | -1) => {
      // 1. Relaxed standing pose
      const p0 = solveArmPose(
        side,
        [side * 0.04, -0.26, 0.02],
        [side * 0.06, -0.50, 0.06],
        [0.04, 0, side * 0.08]
      );
      // 2. Subtle anticipation
      const p1 = solveArmPose(
        side,
        [side * 0.05, -0.25, 0.05],
        [side * 0.07, -0.47, 0.12],
        [0.12, 0, side * 0.06]
      );
      // 3. Noticing visitor — arms begin lifting inward
      const p2 = solveArmPose(
        side,
        [side * 0.07, -0.23, 0.12],
        [side * 0.02, -0.24, 0.27],
        [Math.PI * 0.86, 0, side * 0.12]
      );
      // 4. Namaste palms joined cleanly at sternum center (y ≈ 1.29, z ≈ 0.28)
      // Note: Hand mesh fingers extend along -Y from wrist; rotating X by ~PI flips fingers UP (+Y)
      // with slight ~16° forward tilt, and Y/Z aligns flat palms face-to-face at x=0!
      const p3 = solveArmPose(
        side,
        [side * 0.025, -0.24, 0.14],
        [side * -0.185, -0.175, 0.265],
        [Math.PI - 0.26, side * 0.08, side * 0.04]
      );
      // 5. Hold Namaste during respectful head bow
      const p4 = solveArmPose(
        side,
        [side * 0.025, -0.24, 0.14],
        [side * -0.185, -0.175, 0.265],
        [Math.PI - 0.26, side * 0.08, side * 0.04]
      );
      // 6. Softening release after bow
      const p5 = solveArmPose(
        side,
        [side * 0.06, -0.245, 0.09],
        [side * -0.06, -0.32, 0.22],
        [Math.PI * 0.65, 0, side * 0.05]
      );
      // 7. Composed editorial stance
      const p6 = solveArmPose(
        side,
        [side * 0.045, -0.255, 0.04],
        [side * 0.03, -0.47, 0.11],
        [0.18, 0, side * 0.06]
      );

      const prefix = side === 1 ? 'Left' : 'Right';
      const poses = [p0, p1, p2, p3, p4, p5, p6];

      return [
        makeDirectQuatTrack(
          `${prefix}Shoulder`,
          times,
          poses.map((p) => p.shoulder)
        ),
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
      makeQuatTrack('Spine', times, [
        [0, 0, 0],
        [0.01, 0, 0],
        [0.03, 0, 0],
        [0.02, 0, 0],
        [0.08, 0, 0], // gentle respectful bow forward
        [0.03, 0, 0],
        [0.01, 0, 0],
      ]),
      makeQuatTrack('Chest', times, [
        [0, 0, 0],
        [0.01, 0, 0],
        [0.02, 0, 0],
        [0.02, 0, 0],
        [0.06, 0, 0],
        [0.02, 0, 0],
        [0.0, 0, 0],
      ]),
      makeQuatTrack('Neck', times, [
        [0, 0.04, 0],
        [0, 0.02, 0],
        [-0.03, 0, 0], // attentive lift
        [0.03, 0, 0],
        [0.14, 0, 0], // respectful bow
        [0.04, 0, 0],
        [0.0, 0, 0],
      ]),
      makeQuatTrack('Head', times, [
        [0.02, 0.05, 0],
        [0.0, 0.02, 0],
        [-0.05, 0, 0],
        [0.03, 0, 0],
        [0.19, 0, 0], // Namaste bow
        [0.04, 0, 0],
        [-0.02, 0, 0],
      ]),
      ...buildArmTracks(1),
      ...buildArmTracks(-1),
    ];

    const namasteClip = new THREE.AnimationClip('NamasteGreeting', 1.0, tracks);
    const mixer = new THREE.AnimationMixer(root);
    const namasteAction = mixer.clipAction(namasteClip);
    namasteAction.play();
    namasteAction.paused = true;

    return { root, skeleton, mixer, namasteAction, chest, head };
  }, [materials]);

  useEffect(() => {
    return () => {
      rig.mixer.stopAllAction();
      rig.root.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          (obj as THREE.Mesh).geometry.dispose();
        }
      });
    };
  }, [rig]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const progress = reducedMotion
      ? 0.68
      : THREE.MathUtils.clamp(scrollProgressRef.current, 0, 1);

    // Scrub the skeletal AnimationClip via AnimationMixer time
    rig.namasteAction.time = progress;
    rig.mixer.update(0);

    // Subtle organic breathing micro-motion (disabled when reducedMotion is active)
    if (!reducedMotion) {
      const breath = Math.sin(t * 1.8) * 0.008;
      rig.chest.position.y = 0.22 + breath;
      rig.head.rotation.z = Math.sin(t * 0.9) * 0.012;
    }
  });

  return <primitive object={rig.root} />;
}

export function PritomCharacterRig({
  scrollProgressRef,
  portraitUrl,
  characterGlbUrl,
  namasteClipName,
  reducedMotion,
}: PritomCharacterRigProps) {
  const proceduralFallback = (
    <ProceduralRiggedPritom
      scrollProgressRef={scrollProgressRef}
      portraitUrl={portraitUrl}
      reducedMotion={reducedMotion}
    />
  );

  if (characterGlbUrl) {
    return (
      <GLTFErrorBoundary fallback={proceduralFallback}>
        <React.Suspense fallback={proceduralFallback}>
          <GLTFCharacterModel
            url={characterGlbUrl}
            namasteClipName={namasteClipName}
            scrollProgressRef={scrollProgressRef}
            reducedMotion={reducedMotion}
          />
        </React.Suspense>
      </GLTFErrorBoundary>
    );
  }

  return proceduralFallback;
}
