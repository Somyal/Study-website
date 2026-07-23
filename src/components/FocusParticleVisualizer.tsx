import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';

interface ParticleCloudProps {
  isActive: boolean;
  count?: number;
}

function ParticleCloud({ isActive, count = 200 }: ParticleCloudProps) {
  const meshRef = useRef<THREE.Points>(null);
  const radiusRef = useRef(1.8);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.cbrt(Math.random());
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      const v = 0.6 + Math.random() * 0.4;
      colors[i * 3] = v * 0.79;
      colors[i * 3 + 1] = v * 0.66;
      colors[i * 3 + 2] = v * 0.3;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
      depthWrite: false,
    });
    return { geometry: geom, material: mat };
  }, [count]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const target = isActive ? 2.8 : 1.8;
    radiusRef.current += (target - radiusRef.current) * Math.min(delta * 2, 1);
    meshRef.current.scale.setScalar(radiusRef.current);
    const speed = isActive ? 0.3 : 0.08;
    meshRef.current.rotation.y += delta * speed;
    meshRef.current.rotation.x += delta * speed * 0.2;
  });

  return (
    <points ref={meshRef} geometry={geometry} material={material} />
  );
}

interface FocusParticleVisualizerProps {
  isActive: boolean;
  count?: number;
}

export const FocusParticleVisualizer: React.FC<FocusParticleVisualizerProps> = ({
  isActive,
  count = 200,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: false }}
      >
        <ParticleCloud isActive={isActive} count={count} />
      </Canvas>
    </div>
  );
};
