import { RoundedBox, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

type GuidanceSignProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
  step: string;
  label: string;
  sublabel: string;
  color?: string;
};

export function GuidanceSign({ position, rotation = [0, 0, 0], step, label, sublabel, color = "#78350f" }: GuidanceSignProps) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Post */}
      <mesh position={[0, -0.8, -0.05]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 2.0, 8]} />
        <meshStandardMaterial color="#3f2314" roughness={0.9} />
      </mesh>

      {/* Hanging Sign Group */}
      <group ref={meshRef}>
        {/* Sign Board */}
        <RoundedBox args={[1.8, 1.0, 0.15]} radius={0.15} smoothness={4} castShadow>
          <meshStandardMaterial color={color} roughness={0.8} />
        </RoundedBox>

        {/* Step Badge */}
        <mesh position={[-0.6, 0.35, 0.1]} castShadow>
          <circleGeometry args={[0.22, 32]} />
          <meshStandardMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={0.5} />
        </mesh>
        <Text position={[-0.6, 0.35, 0.12]} fontSize={0.22} color="#451a03" fontWeight="900">
          {step}
        </Text>

        {/* Text */}
        <Text position={[0.1, 0.15, 0.1]} fontSize={0.28} color="#fef3c7" fontWeight="bold">
          {label}
        </Text>
        <Text position={[0, -0.25, 0.1]} fontSize={0.13} color="#fbbf24" fontWeight="900" maxWidth={1.6} textAlign="center">
          {sublabel}
        </Text>

        {/* Decorative Rope */}
         <mesh position={[-0.4, 0.6, -0.05]} rotation={[0, 0, 0.5]}>
            <cylinderGeometry args={[0.015, 0.015, 0.4]} />
            <meshStandardMaterial color="#451a03" />
         </mesh>
         <mesh position={[0.4, 0.6, -0.05]} rotation={[0, 0, -0.5]}>
            <cylinderGeometry args={[0.015, 0.015, 0.4]} />
            <meshStandardMaterial color="#451a03" />
         </mesh>
      </group>
    </group>
  );
}
