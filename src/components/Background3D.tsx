import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

function FloatingSymbols() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      // Base rotation
      group.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      
      // Interactive rotation based on pointer
      const targetRotationX = (state.pointer.y * Math.PI) / 8;
      const targetRotationY = (state.pointer.x * Math.PI) / 8;
      
      group.current.rotation.x += (targetRotationX - group.current.rotation.x) * 0.1;
      group.current.rotation.z += (targetRotationY - group.current.rotation.z) * 0.1;
    }
  });

  return (
    <group ref={group}>
      {/* Abstract geometric shapes representing Physics/Math */}
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2} position={[-4, 2, -5]}>
        <mesh>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#4f46e5" wireframe />
        </mesh>
      </Float>

      <Float speed={2} rotationIntensity={1.5} floatIntensity={2} position={[5, -1, -3]}>
        <mesh>
          <octahedronGeometry args={[1.2, 0]} />
          <meshStandardMaterial color="#06b6d4" wireframe />
        </mesh>
      </Float>

      <Float speed={1.2} rotationIntensity={2} floatIntensity={1.5} position={[3, 3, -6]}>
        <mesh>
          <torusGeometry args={[0.8, 0.2, 16, 32]} />
          <meshStandardMaterial color="#8b5cf6" wireframe />
        </mesh>
      </Float>
      
      <Float speed={1.8} rotationIntensity={1} floatIntensity={2} position={[-3, -2, -4]}>
        <mesh>
          <dodecahedronGeometry args={[0.9, 0]} />
          <meshStandardMaterial color="#ec4899" wireframe />
        </mesh>
      </Float>
      
      {/* Central focus orb */}
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5} position={[0, 0, -8]}>
        <mesh>
          <sphereGeometry args={[2, 32, 32]} />
          <meshStandardMaterial color="#3b82f6" transparent opacity={0.1} wireframe />
        </mesh>
      </Float>
    </group>
  );
}

export function Background3D() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f46e5" />
        <FloatingSymbols />
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  );
}
