import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { ErrorBoundary } from './ErrorBoundary';

// 3D Atomic Nucleus and Orbiting Quantum Rings with Scroll Reactivity
function JeeAtomCore() {
  const coreRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    const scrollFactor = scrollY * 0.0015;

    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.25 + scrollFactor * 1.5;
      coreRef.current.rotation.x = Math.sin(t * 0.15) * 0.2 + scrollFactor * 0.5;
      // Antigravity drift down slightly as user scrolls
      coreRef.current.position.y = Math.sin(t * 0.8) * 0.15 - Math.min(scrollFactor * 1.2, 3);
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.9 + scrollFactor * 2;
      ring1Ref.current.rotation.y = t * 0.6;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -t * 0.8;
      ring2Ref.current.rotation.z = t * 0.7 + scrollFactor * 2;
    }

    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = t * 1.0;
      ring3Ref.current.rotation.z = -t * 0.5 + scrollFactor * 2;
    }
  });

  return (
    <group ref={coreRef} position={[0, -0.2, -1]} scale={0.88}>
      {/* Central Glowing Nucleus */}
      <mesh>
        <sphereGeometry args={[1.15, 32, 32]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#1d4ed8"
          emissiveIntensity={0.8}
          roughness={0.15}
        />
      </mesh>
      
      {/* Inner Wireframe Shell */}
      <mesh>
        <icosahedronGeometry args={[1.35, 1]} />
        <meshStandardMaterial
          color="#60a5fa"
          wireframe
          transparent
          opacity={0.45}
        />
      </mesh>

      {/* Orbit Ring 1 - Physics Orbital */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.5, 0.04, 16, 100]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.9} />
      </mesh>

      {/* Orbit Ring 2 - Chemistry Electron Cloud */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[3.1, 0.04, 16, 100]} />
        <meshStandardMaterial color="#818cf8" emissive="#4f46e5" emissiveIntensity={0.9} />
      </mesh>

      {/* Orbit Ring 3 - Mathematics Calculus Field */}
      <mesh ref={ring3Ref} rotation={[-Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[3.7, 0.04, 16, 100]} />
        <meshStandardMaterial color="#c084fc" emissive="#7c3aed" emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

// Floating Geometric Math & Physics Polyhedra that drift with scroll & pointer
function FloatingFormulas() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    if (groupRef.current) {
      const targetY = (state.pointer.x * Math.PI) / 6 + scrollY * 0.0008;
      const targetX = (-state.pointer.y * Math.PI) / 6;
      groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.05;
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05;
      groupRef.current.position.y = -Math.sin(scrollY * 0.001) * 0.8;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Physics Vector Octahedron */}
      <Float speed={2} rotationIntensity={1.5} floatIntensity={2} position={[-4.5, 2.2, -2]}>
        <mesh>
          <octahedronGeometry args={[1.1, 0]} />
          <meshStandardMaterial color="#38bdf8" wireframe />
        </mesh>
      </Float>

      {/* Chemistry Crystal Lattice (Icosahedron) */}
      <Float speed={1.8} rotationIntensity={1.8} floatIntensity={2.5} position={[4.5, 2.5, -2.5]}>
        <mesh>
          <icosahedronGeometry args={[1.2, 0]} />
          <meshStandardMaterial color="#a855f7" wireframe />
        </mesh>
      </Float>

      {/* Coordinate Geometry Dodecahedron */}
      <Float speed={2.2} rotationIntensity={1.2} floatIntensity={1.8} position={[-3.8, -2.5, -2]}>
        <mesh>
          <dodecahedronGeometry args={[1.0, 0]} />
          <meshStandardMaterial color="#ec4899" wireframe />
        </mesh>
      </Float>

      {/* Calculus Torus */}
      <Float speed={1.6} rotationIntensity={2} floatIntensity={1.5} position={[4.2, -2.2, -3]}>
        <mesh>
          <torusGeometry args={[0.9, 0.22, 16, 32]} />
          <meshStandardMaterial color="#3b82f6" wireframe />
        </mesh>
      </Float>
    </group>
  );
}

// Fallback CSS animation when WebGL is unavailable on older mobile browsers
function CosmicFallback() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-50 z-0">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-blue-500/20 animate-spin" style={{ animationDuration: '30s' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_15px_#22d3ee]" />
      </div>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-purple-500/20 animate-spin" style={{ animationDuration: '40s', animationDirection: 'reverse' }}>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_15px_#c084fc]" />
      </div>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-blue-600/20 blur-3xl" />
    </div>
  );
}

export function LandingScene3D() {
  const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setWebGLSupported(!!gl);
    } catch (e) {
      setWebGLSupported(false);
    }
  }, []);

  if (webGLSupported === false) {
    return <CosmicFallback />;
  }

  return (
    <ErrorBoundary fallback={<CosmicFallback />}>
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <Canvas
          camera={{ position: [0, 0, 9.2], fov: 48 }}
          gl={{ antialias: true, alpha: true }}
          fallback={<CosmicFallback />}
        >
          <ambientLight intensity={0.7} />
          <pointLight position={[10, 15, 10]} intensity={1.5} color="#93c5fd" />
          <pointLight position={[-10, -10, -5]} intensity={1} color="#c084fc" />
          
          <JeeAtomCore />
          <FloatingFormulas />
          
          <Stars
            radius={60}
            depth={50}
            count={1400}
            factor={3.8}
            saturation={0.5}
            fade
            speed={0.8}
          />
        </Canvas>
      </div>
    </ErrorBoundary>
  );
}
