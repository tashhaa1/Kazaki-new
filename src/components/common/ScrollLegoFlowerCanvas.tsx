import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface LegoPiece {
  group: THREE.Group;
  targetPos: THREE.Vector3;
  targetRot: THREE.Euler;
  targetQuat: THREE.Quaternion;
  scatterPos: THREE.Vector3;
  scatterQuat: THREE.Quaternion;
  stageStart: number;
  stageEnd: number;
  name: string;
}

const isWebGLAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
};

export const ScrollLegoFlowerCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // References for animation loop
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const autoRotateRef = useRef(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !isWebGLAvailable()) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId = 0;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c090e, 0.025);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    const isMobile = width < 768;
    camera.position.set(0, 3.2, isMobile ? 16.5 : 13.5);
    camera.lookAt(0, 3.2, 0);

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isMobile,
        alpha: true,
        powerPreference: isMobile ? 'default' : 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL Renderer creation failed safely:', e);
      return;
    }

    // 2. Studio Lighting Setup for Realistic Lego Plastic Gloss
    const ambientLight = new THREE.AmbientLight(0xfff5f7, 1.2);
    scene.add(ambientLight);

    // Key Light (Main white highlight from top front-right)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(6, 12, 8);
    scene.add(keyLight);

    // Fill Light (Soft Rose glow from bottom front-left)
    const fillLight = new THREE.DirectionalLight(0xfda4af, 1.6);
    fillLight.position.set(-6, -2, 6);
    scene.add(fillLight);

    // Rim Light (Champagne Gold highlight from behind to illuminate plastic studs edges)
    const rimLight = new THREE.DirectionalLight(0xfef08a, 2.5);
    rimLight.position.set(0, 9, -8);
    scene.add(rimLight);

    // 3. Authentic Lego ABS Plastic Materials
    const sharedStudGeometry = new THREE.CylinderGeometry(0.24, 0.24, 0.14, 20);

    const greenMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x186b36,
      roughness: 0.18,
      metalness: 0.05,
      clearcoat: 0.85,
      clearcoatRoughness: 0.1,
    });

    const crimsonMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xc41426,
      roughness: 0.16,
      metalness: 0.05,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
    });

    const rosePinkMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe11d48,
      roughness: 0.16,
      metalness: 0.05,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
    });

    const goldCoreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.15,
      clearcoat: 0.8,
    });

    const basePedestalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x221f24,
      roughness: 0.22,
      metalness: 0.08,
      clearcoat: 0.6,
    });

    // Helper: Build a Lego brick piece with authentic studs
    const createStuddedMesh = (
      bodyGeometry: THREE.BufferGeometry,
      material: THREE.Material,
      studPositions: [number, number, number][] = []
    ) => {
      const group = new THREE.Group();
      const body = new THREE.Mesh(bodyGeometry, material);
      group.add(body);

      studPositions.forEach(([sx, sy, sz]) => {
        const stud = new THREE.Mesh(sharedStudGeometry, material);
        stud.position.set(sx, sy, sz);
        group.add(stud);
      });

      return group;
    };

    // 4. Construct All Lego Flower Parts and Assembly Stages
    const flowerMasterGroup = new THREE.Group();
    scene.add(flowerMasterGroup);

    const pieces: LegoPiece[] = [];

    const registerPiece = (
      obj: THREE.Group,
      targetPos: [number, number, number],
      targetRot: [number, number, number],
      stageStart: number,
      stageEnd: number,
      scatterOffset: [number, number, number],
      name: string
    ) => {
      flowerMasterGroup.add(obj);

      const targetPosVec = new THREE.Vector3(...targetPos);
      const targetRotEuler = new THREE.Euler(...targetRot);
      const targetQuat = new THREE.Quaternion().setFromEuler(targetRotEuler);

      const scatterPosVec = new THREE.Vector3(
        targetPos[0] + scatterOffset[0],
        targetPos[1] + scatterOffset[1],
        targetPos[2] + scatterOffset[2]
      );

      const scatterRotEuler = new THREE.Euler(
        targetRot[0] + (Math.random() - 0.5) * 3,
        targetRot[1] + (Math.random() - 0.5) * 3,
        targetRot[2] + (Math.random() - 0.5) * 3
      );
      const scatterQuat = new THREE.Quaternion().setFromEuler(scatterRotEuler);

      obj.position.copy(scatterPosVec);
      obj.quaternion.copy(scatterQuat);

      pieces.push({
        group: obj,
        targetPos: targetPosVec,
        targetRot: targetRotEuler,
        targetQuat,
        scatterPos: scatterPosVec,
        scatterQuat,
        stageStart,
        stageEnd,
        name,
      });
    };

    // --- STAGE 0: Pedestal Turntable Base (0.00 -> 0.12) ---
    const basePlateGeom = new THREE.CylinderGeometry(2.2, 2.4, 0.4, 32);
    const basePlate = createStuddedMesh(basePlateGeom, basePedestalMaterial, [
      [-1.2, 0.27, -1.2],
      [1.2, 0.27, -1.2],
      [-1.2, 0.27, 1.2],
      [1.2, 0.27, 1.2],
      [0, 0.27, -1.5],
      [0, 0.27, 1.5],
      [-1.5, 0.27, 0],
      [1.5, 0.27, 0],
    ]);
    registerPiece(basePlate, [0, -0.2, 0], [0, 0, 0], 0.00, 0.10, [0, 8, 0], 'قاعدة التثبيت');

    // --- STAGE 1: Stem Segments (0.08 -> 0.28) ---
    const stemGeom = new THREE.CylinderGeometry(0.38, 0.38, 0.95, 24);

    for (let i = 0; i < 4; i++) {
      const stemSeg = createStuddedMesh(stemGeom, greenMaterial, [[0, 0.54, 0]]);
      const yPos = 0.5 + i * 0.95;
      registerPiece(
        stemSeg,
        [0, yPos, 0],
        [0, 0, 0],
        0.06 + i * 0.05,
        0.16 + i * 0.05,
        [(i % 2 === 0 ? -3 : 3), 10 + i * 2, (Math.random() - 0.5) * 4],
        `ساق الوردة - قطعة ${i + 1}`
      );
    }

    // --- STAGE 2: Stem Connector Leaves (0.24 -> 0.38) ---
    const leafGeom = new THREE.BoxGeometry(0.55, 0.18, 1.6);
    leafGeom.translate(0, 0, 0.8); // pivot at base

    // Leaf 1 (Left branch, angled up)
    const leaf1 = createStuddedMesh(leafGeom, greenMaterial, [
      [0, 0.16, 0.5],
      [0, 0.16, 1.1],
    ]);
    registerPiece(leaf1, [0, 1.8, 0], [0.4, 0.8, -0.5], 0.20, 0.30, [-5, 8, 2], 'ورقة الساق اليسرى');

    // Leaf 2 (Right branch, angled up)
    const leaf2 = createStuddedMesh(leafGeom, greenMaterial, [
      [0, 0.16, 0.5],
      [0, 0.16, 1.1],
    ]);
    registerPiece(leaf2, [0, 2.7, 0], [-0.3, -1.2, 0.6], 0.26, 0.36, [5, 9, -2], 'ورقة الساق اليمنى');

    // --- STAGE 3: Calyx & Sepal Claws (0.35 -> 0.48) ---
    const calyxBaseGeom = new THREE.CylinderGeometry(0.65, 0.4, 0.6, 24);
    const calyxBase = createStuddedMesh(calyxBaseGeom, greenMaterial, [
      [0, 0.37, 0],
      [0.35, 0.37, 0],
      [-0.35, 0.37, 0],
    ]);
    registerPiece(calyxBase, [0, 4.4, 0], [0, 0, 0], 0.32, 0.42, [0, 11, 0], 'كأس الوردة البتلي');

    const sepalGeom = new THREE.ConeGeometry(0.28, 1.1, 4);
    sepalGeom.translate(0, 0.55, 0);

    for (let s = 0; s < 4; s++) {
      const angle = (s * Math.PI) / 2;
      const sepal = new THREE.Group();
      const sepalMesh = new THREE.Mesh(sepalGeom, greenMaterial);
      sepal.add(sepalMesh);

      const rad = 0.55;
      const x = Math.cos(angle) * rad;
      const z = Math.sin(angle) * rad;

      registerPiece(
        sepal,
        [x, 4.3, z],
        [0.6 * Math.sin(angle), -angle, 0.6 * Math.cos(angle)],
        0.36 + s * 0.03,
        0.46 + s * 0.03,
        [Math.cos(angle) * 6, 12, Math.sin(angle) * 6],
        `كأس داعم ${s + 1}`
      );
    }

    // --- STAGE 4: Outer Rose Petals (Large curved Lego hood bricks) (0.46 -> 0.62) ---
    const outerPetalGeom = new THREE.CylinderGeometry(0.9, 0.6, 1.5, 16, 1, false, 0, Math.PI * 0.85);
    outerPetalGeom.center();

    for (let pIdx = 0; pIdx < 6; pIdx++) {
      const angle = (pIdx * Math.PI * 2) / 6;
      const outerPetal = createStuddedMesh(outerPetalGeom, crimsonMaterial, [
        [0, 0.78, 0],
        [-0.4, 0.78, 0],
        [0.4, 0.78, 0],
      ]);

      const dist = 0.95;
      const x = Math.sin(angle) * dist;
      const z = Math.cos(angle) * dist;

      registerPiece(
        outerPetal,
        [x, 5.0, z],
        [0.45 * Math.cos(angle), angle + 0.3, -0.45 * Math.sin(angle)],
        0.44 + pIdx * 0.028,
        0.56 + pIdx * 0.028,
        [Math.sin(angle) * 8, 14, Math.cos(angle) * 8],
        `بتلة خارجية ${pIdx + 1}`
      );
    }

    // --- STAGE 5: Middle Rose Petals (0.58 -> 0.72) ---
    const midPetalGeom = new THREE.CylinderGeometry(0.7, 0.45, 1.25, 16, 1, false, 0, Math.PI * 0.9);
    midPetalGeom.center();

    for (let mIdx = 0; mIdx < 5; mIdx++) {
      const angle = (mIdx * Math.PI * 2) / 5 + 0.4;
      const midPetal = createStuddedMesh(midPetalGeom, rosePinkMaterial, [
        [0, 0.65, 0],
        [-0.3, 0.65, 0],
      ]);

      const dist = 0.55;
      const x = Math.sin(angle) * dist;
      const z = Math.cos(angle) * dist;

      registerPiece(
        midPetal,
        [x, 5.35, z],
        [0.35 * Math.cos(angle), angle + 0.2, -0.35 * Math.sin(angle)],
        0.56 + mIdx * 0.028,
        0.68 + mIdx * 0.028,
        [Math.sin(angle) * 6, 13, Math.cos(angle) * 6],
        `بتلة وسطى ${mIdx + 1}`
      );
    }

    // --- STAGE 6: Inner Rosebud Spiral & Golden Core (0.68 -> 0.78) ---
    const innerPetalGeom = new THREE.CylinderGeometry(0.48, 0.32, 1.0, 12, 1, false, 0, Math.PI * 1.1);
    innerPetalGeom.center();

    for (let inIdx = 0; inIdx < 3; inIdx++) {
      const angle = (inIdx * Math.PI * 2) / 3 + 0.8;
      const innerPetal = createStuddedMesh(innerPetalGeom, crimsonMaterial, [[0, 0.53, 0]]);

      const dist = 0.28;
      const x = Math.sin(angle) * dist;
      const z = Math.cos(angle) * dist;

      registerPiece(
        innerPetal,
        [x, 5.6, z],
        [0.2 * Math.cos(angle), angle + 0.5, -0.2 * Math.sin(angle)],
        0.66 + inIdx * 0.03,
        0.76 + inIdx * 0.03,
        [Math.sin(angle) * 4, 11, Math.cos(angle) * 4],
        `بتلة مركزية ${inIdx + 1}`
      );
    }

    // Golden Flower Core / Stamen Head
    const coreGeom = new THREE.CylinderGeometry(0.3, 0.2, 0.55, 12);
    const goldenCore = createStuddedMesh(coreGeom, goldCoreMaterial, [
      [0, 0.34, 0],
      [0.15, 0.34, 0.15],
      [-0.15, 0.34, -0.15],
    ]);
    registerPiece(goldenCore, [0, 5.8, 0], [0, 0, 0], 0.72, 0.80, [0, 10, 0], 'قلب الوردة الذهبي');

    // 5. Floating Dust / Golden Shimmer Particle Field
    const particleCount = 75;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let p = 0; p < particleCount * 3; p += 3) {
      particlePositions[p] = (Math.random() - 0.5) * 16;
      particlePositions[p + 1] = Math.random() * 12;
      particlePositions[p + 2] = (Math.random() - 0.5) * 12;
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfed7aa,
      size: 0.07,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // 6. Scroll Listener
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(Math.max(scrollY / docHeight, 0), 1) : 0;
      targetProgressRef.current = progress;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.position.z = w < 768 ? 16.5 : 13.5;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Mouse Parallax for Interactive Depth
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.4;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.3;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 7. Render Loop (using performance.now() without deprecated THREE.Clock)
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const currentTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const elapsedTime = (currentTime - startTime) * 0.001;

      // Smooth damp progress towards target
      progressRef.current += (targetProgressRef.current - progressRef.current) * 0.09;
      const curProg = progressRef.current;

      const fullyBuilt = curProg >= 0.78;
      setIsCompleted(fullyBuilt);

      // Animate each piece along its assembly timeline
      pieces.forEach((p) => {
        let t = 0;
        if (curProg <= p.stageStart) {
          t = 0;
        } else if (curProg >= p.stageEnd) {
          t = 1;
        } else {
          t = (curProg - p.stageStart) / (p.stageEnd - p.stageStart);
        }

        // Snappy Cubic Ease Out
        const ease = 1 - Math.pow(1 - t, 3);

        p.group.position.lerpVectors(p.scatterPos, p.targetPos, ease);
        p.group.quaternion.slerpQuaternions(p.scatterQuat, p.targetQuat, ease);

        // Subtle scale snap sensation when snapping into place
        if (t > 0.85 && t < 1.0) {
          const bounce = 1.0 + Math.sin((t - 0.85) * Math.PI * 6.6) * 0.05;
          p.group.scale.set(bounce, bounce, bounce);
        } else {
          p.group.scale.set(1, 1, 1);
        }
      });

      // 8. 360-Degree Continuous Rotation when flower is completed + scroll rotation
      if (fullyBuilt) {
        // Continuous smooth rotation around itself
        const idleSpin = autoRotateRef.current ? elapsedTime * 0.65 : 0;
        // Additional spin directly driven by continuing scroll past completion
        const extraScrollSpin = (curProg - 0.78) * Math.PI * 4.5;
        flowerMasterGroup.rotation.y = idleSpin + extraScrollSpin;

        // Gentle botanical levitation bobbing
        flowerMasterGroup.position.y = Math.sin(elapsedTime * 1.8) * 0.18;
      } else {
        // Subtle natural rotation alignment as pieces assemble
        flowerMasterGroup.rotation.y = curProg * Math.PI * 0.8;
        flowerMasterGroup.position.y = 0;
      }

      // Gentle mouse parallax tilt
      flowerMasterGroup.rotation.x = mouseY * 0.35;
      flowerMasterGroup.rotation.z = -mouseX * 0.35;

      // Shimmer floating particles
      particles.rotation.y = elapsedTime * 0.03;

      if (renderer) {
        try {
          renderer.render(scene, camera);
        } catch {
          // Prevent any unhandled render exception from bubbling
          return;
        }
      }
    };

    animate();

    // Safe Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);

      try {
        if (renderer) {
          renderer.dispose();
          if (container && renderer.domElement && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
        }
        greenMaterial?.dispose?.();
        crimsonMaterial?.dispose?.();
        rosePinkMaterial?.dispose?.();
        goldCoreMaterial?.dispose?.();
        basePedestalMaterial?.dispose?.();
        sharedStudGeometry?.dispose?.();
        particleGeom?.dispose?.();
        particleMat?.dispose?.();
      } catch (err) {
        console.warn('ScrollLegoFlowerCanvas cleanup error:', err);
      }
    };
  }, []);

  return (
    <div className={`fixed inset-0 pointer-events-none -z-10 select-none overflow-hidden ${className}`}>
      {/* Three.js WebGL Canvas Mount Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Luxury Cinematic Ambient Glows Behind the Flower */}
      <div className="absolute inset-0 pointer-events-none -z-20">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] opacity-25 pointer-events-none transition-opacity duration-700"
          style={{
            background: isCompleted
              ? 'radial-gradient(circle, #e11d48 0%, #be123c 45%, transparent 75%)'
              : 'radial-gradient(circle, #059669 0%, #064e3b 45%, transparent 75%)',
          }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[110px] pointer-events-none" />
      </div>

    </div>
  );
};
