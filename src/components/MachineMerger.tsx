import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { RoundedBox, Text } from '@react-three/drei';
import type { IntersectionEnterPayload } from '@react-three/rapier';
import { BallColor, mixColors, getHexColor, type BallColorCode } from '../store/ColorSystem';
import { GameState, useGameStore } from '../store/GameStore';
import { sfx } from '../utils/audio';

type MergerBallData = {
  name?: string;
  color?: BallColorCode;
  id?: string;
};

type MergerProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
  gameState: number;
  spawnBall: (color: BallColorCode, position: [number, number, number]) => void;
  removeBall: (id: string) => void;
};

function SteamVFX() {
  const steamRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!steamRef.current) return;
    const elapsed = state.clock.elapsedTime;
    steamRef.current.children.forEach((child, i) => {
      child.position.y = ((elapsed * 0.8 + i * 0.5) % 2.5);
      child.position.x = Math.sin(elapsed * 0.6 + i) * 1.0;
      child.position.z = Math.cos(elapsed * 0.5 + i) * 0.7;
      (child as THREE.Mesh).scale.setScalar(0.35 * (1 - child.position.y / 2.5));
    });
  });
  return (
    <group ref={steamRef} position={[0, 3.8, 0.2]}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial 
            color={i % 2 === 0 ? "#f43f5e" : "#fbbf24"} 
            emissive={i % 2 === 0 ? "#f43f5e" : "#fbbf24"} 
            emissiveIntensity={4} 
            transparent 
            opacity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

function MachineMergerCore({ position, rotation = [0, 0, 0], gameState, spawnBall, removeBall }: MergerProps) {
  const machineRef = useRef<THREE.Group>(null);
  const signRef = useRef<THREE.Group>(null);
  const [colorA, setColorA] = useState<BallColorCode>(BallColor.None);
  const [colorB, setColorB] = useState<BallColorCode>(BallColor.None);
  const [isMerging, setIsMerging] = useState(false);
  const mergeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const jawRef = useRef<THREE.Group>(null);
  const leftPupilRef = useRef<THREE.Group>(null);
  const rightPupilRef = useRef<THREE.Group>(null);
  const tongueRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    return () => {
      if (mergeTimeoutRef.current) {
        clearTimeout(mergeTimeoutRef.current);
        mergeTimeoutRef.current = null;
      }
    };
  }, []);

  useFrame((state, delta) => {
    const elapsed = state.clock.elapsedTime;
    
    if (machineRef.current) {
      const breath = 1 + Math.sin(elapsed * 1.2) * 0.012;
      const gulp = isMerging ? 1 + Math.sin(elapsed * 45) * 0.1 : 1.0;
      machineRef.current.scale.set(breath * gulp, breath * (isMerging ? 1.05 : 1.0), breath * gulp);
      machineRef.current.position.y = position[1] + Math.sin(elapsed * 1.5) * 0.02;
    }
    
    const targetLook = new THREE.Vector3(Math.sin(elapsed * 0.4) * 0.25, Math.cos(elapsed * 0.4) * 0.15, 0.8);
    if (leftPupilRef.current) {
      leftPupilRef.current.position.x = THREE.MathUtils.lerp(leftPupilRef.current.position.x, targetLook.x * 0.1, 0.1);
      leftPupilRef.current.position.y = THREE.MathUtils.lerp(leftPupilRef.current.position.y, targetLook.y * 0.1, 0.1);
    }
    if (rightPupilRef.current) {
      rightPupilRef.current.position.x = THREE.MathUtils.lerp(rightPupilRef.current.position.x, targetLook.x * 0.1, 0.1);
      rightPupilRef.current.position.y = THREE.MathUtils.lerp(rightPupilRef.current.position.y, targetLook.y * 0.1, 0.1);
    }
    if (jawRef.current) {
      const targetJawRotation = isMerging ? -0.7 : -0.12;
      jawRef.current.rotation.x = THREE.MathUtils.damp(jawRef.current.rotation.x, targetJawRotation, 10, delta);
    }
    if (tongueRef.current && isMerging) {
      tongueRef.current.scale.setScalar(1 + Math.sin(elapsed * 30) * 0.1);
    }

    if (signRef.current) {
      // Magical Hovering Animation
      signRef.current.position.y = 4.8 + Math.sin(elapsed * 1.3) * 0.15;
      signRef.current.rotation.z = Math.cos(elapsed * 0.7) * 0.04;
    }
  });

  const handleInputA = (payload: IntersectionEnterPayload) => {
    if (gameState !== GameState.Playing) return;
    const otherObject = payload.other.rigidBodyObject as { userData?: MergerBallData } | undefined;
    const ballData = otherObject?.userData;
    if (ballData?.name === 'ball' && typeof ballData.color === 'number' && typeof ballData.id === 'string') {
      setColorA(ballData.color);
      removeBall(ballData.id);
      sfx.playSuccess();
      checkMerge(ballData.color, colorB);
    }
  };

  const handleInputB = (payload: IntersectionEnterPayload) => {
    if (gameState !== GameState.Playing) return;
    const otherObject = payload.other.rigidBodyObject as { userData?: MergerBallData } | undefined;
    const ballData = otherObject?.userData;
    if (ballData?.name === 'ball' && typeof ballData.color === 'number' && typeof ballData.id === 'string') {
      setColorB(ballData.color);
      removeBall(ballData.id);
      sfx.playSuccess();
      checkMerge(colorA, ballData.color);
    }
  };

  const checkMerge = (a: BallColorCode, b: BallColorCode) => {
    if (a === BallColor.None || b === BallColor.None || mergeTimeoutRef.current) return;
    const result = mixColors(a, b);
    if (result !== BallColor.None) {
      setIsMerging(true);
      sfx.playMerge();
      mergeTimeoutRef.current = setTimeout(() => {
        const outputOffset = new THREE.Vector3(0, 0.1, 1.4);
        if (rotation[1] !== 0) outputOffset.applyEuler(new THREE.Euler(0, rotation[1], 0));
        const outputPosition: [number, number, number] = [
          position[0] + outputOffset.x,
          position[1] + outputOffset.y,
          position[2] + outputOffset.z
        ];
        spawnBall(result, outputPosition);
        setColorA(BallColor.None);
        setColorB(BallColor.None);
        setIsMerging(false);
        mergeTimeoutRef.current = null;
      }, 900);
    } else {
      setColorA(BallColor.None);
      setColorB(BallColor.None);
    }
  };

  return (
    <group ref={machineRef} position={position} rotation={rotation} userData={{ name: 'froggy-merger' }}>
      <SteamVFX />
      
      {/* --- CUTE CHUBBY SILHOUETTE --- */}
      <group position={[0, 0, 0]}>
        <RoundedBox args={[4.2, 2.5, 3.8]} radius={1.2} position={[0, -0.2, 0]} castShadow>
          <meshStandardMaterial color="#bbf7d0" roughness={0.4} />
        </RoundedBox>
        <group position={[0, -0.1, 1.0]}>
          <mesh scale={[1.2, 1.0, 0.8]}>
            <sphereGeometry args={[1.5, 32, 32]} />
            <meshStandardMaterial color="#fef9c3" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.5, 1.1]} rotation={[0, 0, 0]}>
             <torusKnotGeometry args={[0.15, 0.03, 32, 6, 2, 5]} />
             <meshStandardMaterial color="#fcd34d" transparent opacity={0.4} />
          </mesh>
        </group>
        <mesh position={[0, 1.8, 0.1]} castShadow>
          <sphereGeometry args={[1.6, 32, 32]} />
          <meshStandardMaterial color="#86efac" roughness={0.3} />
        </mesh>
        <mesh position={[-1.1, 1.4, 1.4]} castShadow>
          <sphereGeometry args={[0.35, 16, 16]} scale={[1, 0.8, 0.3]} />
          <meshStandardMaterial color="#fb7185" emissive="#fb7185" emissiveIntensity={0.8} transparent opacity={0.6} />
        </mesh>
        <mesh position={[1.1, 1.4, 1.4]} castShadow>
          <sphereGeometry args={[0.35, 16, 16]} scale={[1, 0.8, 0.3]} />
          <meshStandardMaterial color="#fb7185" emissive="#fb7185" emissiveIntensity={0.8} transparent opacity={0.6} />
        </mesh>
        <mesh position={[0, -0.2, 1.8]} rotation={[0, 0, 0]}>
           <torusKnotGeometry args={[0.25, 0.05, 64, 8, 2, 3]} />
           <meshStandardMaterial color="#fbbf24" metalness={1} roughness={0} />
        </mesh>
        <mesh position={[-0.2, 1.8, 1.6]}>
           <sphereGeometry args={[0.06, 8, 8]} />
           <meshStandardMaterial color="#166534" />
        </mesh>
        <mesh position={[0.2, 1.8, 1.6]}>
           <sphereGeometry args={[0.06, 8, 8]} />
           <meshStandardMaterial color="#166534" />
        </mesh>
      </group>

      {/* --- INTEGRATED EYES --- */}
      <group position={[0, 2.4, 0.5]}>
        <group position={[-0.8, 0, 0.4]}>
          <mesh>
             <sphereGeometry args={[0.65, 32, 32]} />
             <meshStandardMaterial color="#ffffff" roughness={0} />
          </mesh>
          <group ref={leftPupilRef} position={[0, 0, 0.66]}>
             <mesh scale={[1, 1, 0.1]}>
                <sphereGeometry args={[0.35, 32, 32]} />
                <meshStandardMaterial color="#020617" />
             </mesh>
             <mesh position={[0.12, 0.12, 0.05]}>
               <sphereGeometry args={[0.1, 16, 16]} />
               <meshBasicMaterial color="#ffffff" />
             </mesh>
             <mesh position={[-0.08, -0.08, 0.05]}>
               <sphereGeometry args={[0.045, 16, 16]} />
               <meshBasicMaterial color="#ffffff" />
             </mesh>
          </group>
        </group>
        <group position={[0.8, 0, 0.4]}>
          <mesh>
             <sphereGeometry args={[0.65, 32, 32]} />
             <meshStandardMaterial color="#ffffff" roughness={0} />
          </mesh>
          <group ref={rightPupilRef} position={[0, 0, 0.66]}>
             <mesh scale={[1, 1, 0.1]}>
                <sphereGeometry args={[0.35, 32, 32]} />
                <meshStandardMaterial color="#020617" />
             </mesh>
             <mesh position={[0.12, 0.12, 0.05]}>
               <sphereGeometry args={[0.1, 16, 16]} />
               <meshBasicMaterial color="#ffffff" />
             </mesh>
             <mesh position={[-0.08, -0.08, 0.05]}>
               <sphereGeometry args={[0.045, 16, 16]} />
               <meshBasicMaterial color="#ffffff" />
             </mesh>
          </group>
        </group>
      </group>

      <group position={[0, 1.3, 1.2]}>
        <mesh rotation={[Math.PI / 8, 0, 0]}>
           <torusGeometry args={[0.6, 0.06, 12, 32, Math.PI]} />
           <meshStandardMaterial color="#22c55e" />
        </mesh>
      </group>

      <group ref={jawRef} position={[0, 1.0, 0.6]} rotation={[-0.12, 0, 0]}>
        <mesh position={[0, 0, 0.6]} rotation={[Math.PI / 1.1, 0, 0]} castShadow>
          <sphereGeometry args={[0.8, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
          <meshStandardMaterial color="#86efac" />
        </mesh>
        <group position={[0, 0.4, 0.4]}>
           <mesh rotation={[Math.PI / 2, 0, 0]}>
             <capsuleGeometry args={[0.3, 0.6, 4, 8]} />
             <meshStandardMaterial 
                color="#fda4af" 
                emissive="#fbbf24" 
                emissiveIntensity={isMerging ? 6 : 1}
             />
           </mesh>
           <mesh ref={tongueRef} position={[0, -0.02, 0.35]} rotation={[0.4, 0, 0]}>
              <capsuleGeometry args={[0.15, 0.3, 4, 8]} />
              <meshStandardMaterial color="#e11d48" />
           </mesh>
        </group>
      </group>

      {/* --- CUTE HAND POSE --- */}
      <group position={[-2.4, 0.8, 0.8]} rotation={[0.5, 0.4, 0]}>
        <mesh rotation={[0, -0.8, 1.0]}>
          <capsuleGeometry args={[0.18, 1.2, 4, 8]} />
          <meshStandardMaterial color="#16a34a" />
        </mesh>
        {[[-0.2, 0.4], [0, 0.4], [0.2, 0.4]].map(([x, z], i) => (
           <mesh key={i} position={[x, -0.6, z]} rotation={[0.5, 0, 0]}>
              <capsuleGeometry args={[0.06, 0.2, 4, 8]} />
              <meshStandardMaterial color="#16a34a" />
           </mesh>
        ))}
        <mesh position={[-0.2, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.85, 0.9, 0.15, 32, 1, false, 0, Math.PI * 1.8]} />
          <meshStandardMaterial color="#14532d" roughness={0.8} />
        </mesh>
        {colorA !== BallColor.None && (
          <group position={[-0.2, 0.85, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
               <circleGeometry args={[0.45, 32]} />
               <meshBasicMaterial color="#000000" transparent opacity={0.3} />
            </mesh>
            <mesh castShadow>
              <sphereGeometry args={[0.42, 32, 32]} />
              <meshStandardMaterial color={getHexColor(colorA)} emissive={getHexColor(colorA)} emissiveIntensity={0.1} />
            </mesh>
            <mesh position={[0.16, 0.08, 0.35]} scale={0.5}><sphereGeometry args={[0.08, 16, 16]} /><meshBasicMaterial color="#fda4af" /></mesh>
            <mesh position={[-0.16, 0.08, 0.35]} scale={0.5}><sphereGeometry args={[0.08, 16, 16]} /><meshBasicMaterial color="#fda4af" /></mesh>
            <mesh position={[-0.25, 0.35, 0]} rotation={[0, 0, 0.3]}><coneGeometry args={[0.16, 0.35, 16]} /><meshStandardMaterial color={getHexColor(colorA)} /></mesh>
            <mesh position={[0.25, 0.35, 0]} rotation={[0, 0, -0.3]}><coneGeometry args={[0.16, 0.35, 16]} /><meshStandardMaterial color={getHexColor(colorA)} /></mesh>
            <mesh position={[0, -0.05, -0.38]}><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color="#ffffff" roughness={1.0} /></mesh>
          </group>
        )}
      </group>

      <group position={[2.4, 0.8, 0.8]} rotation={[0.5, -0.4, 0]}>
        <mesh rotation={[0, 0.8, -1.0]}>
          <capsuleGeometry args={[0.18, 1.2, 4, 8]} />
          <meshStandardMaterial color="#16a34a" />
        </mesh>
        {[[-0.2, 0.4], [0, 0.4], [0.2, 0.4]].map(([x, z], i) => (
           <mesh key={i} position={[x, -0.6, z]} rotation={[0.5, 0, 0]}>
              <capsuleGeometry args={[0.06, 0.2, 4, 8]} />
              <meshStandardMaterial color="#16a34a" />
           </mesh>
        ))}
        <mesh position={[0.2, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.85, 0.9, 0.15, 32, 1, false, 0, Math.PI * 1.8]} />
          <meshStandardMaterial color="#14532d" roughness={0.8} />
        </mesh>
        {colorB !== BallColor.None && (
          <group position={[0.2, 0.85, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
               <circleGeometry args={[0.45, 32]} />
               <meshBasicMaterial color="#000000" transparent opacity={0.3} />
            </mesh>
            <mesh castShadow>
              <sphereGeometry args={[0.42, 32, 32]} />
              <meshStandardMaterial color={getHexColor(colorB)} emissive={getHexColor(colorB)} emissiveIntensity={0.1} />
            </mesh>
            <mesh position={[0.16, 0.08, 0.35]} scale={0.5}><sphereGeometry args={[0.08, 16, 16]} /><meshBasicMaterial color="#fda4af" /></mesh>
            <mesh position={[-0.16, 0.08, 0.35]} scale={0.5}><sphereGeometry args={[0.08, 16, 16]} /><meshBasicMaterial color="#fda4af" /></mesh>
            <mesh position={[-0.25, 0.35, 0]} rotation={[0, 0, 0.3]}><coneGeometry args={[0.16, 0.35, 16]} /><meshStandardMaterial color={getHexColor(colorB)} /></mesh>
            <mesh position={[0.25, 0.35, 0]} rotation={[0, 0, -0.3]}><coneGeometry args={[0.16, 0.35, 16]} /><meshStandardMaterial color={getHexColor(colorB)} /></mesh>
            <mesh position={[0, -0.05, -0.38]}><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color="#ffffff" roughness={1.0} /></mesh>
          </group>
        )}
      </group>

      {/* --- HAT --- */}
      <group position={[0, 3.25, 0.1]} rotation={[-0.1, 0, 0.05]}>
        <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.45, 0.45, 0.1, 32]} /><meshStandardMaterial color="#fbbf24" metalness={1} roughness={0} /></mesh>
        <mesh position={[0, 0.25, 0]} castShadow><cylinderGeometry args={[0.4, 0.35, 0.5, 32]} /><meshStandardMaterial color="#fafaf9" /></mesh>
        <mesh position={[0, 0.7, -0.1]} rotation={[0.4, 0, 0]} castShadow><sphereGeometry args={[0.65, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.3]} /><meshStandardMaterial color="#ffffff" /></mesh>
        <mesh position={[0, 0.45, -0.05]} rotation={[Math.PI / 2.2, 0, 0]}><torusGeometry args={[0.5, 0.02, 16, 32]} /><meshStandardMaterial color="#f1f5f9" transparent opacity={0.6} /></mesh>
      </group>

      {/* --- UNIFIED FLOATING SIGNAGE (Overhead Step 2) --- */}
      <group ref={signRef} position={[0, 4.8, 0.4]} rotation={[0, 0, 0]}>
        <group position={[0, 0.1, 0.1]}>
          <RoundedBox args={[3.2, 1.4, 0.15]} radius={0.15} smoothness={4} castShadow>
            <meshStandardMaterial color="#422006" />
          </RoundedBox>

          {/* Step Badge */}
          <group position={[-1.15, 0.4, 0.12]}>
            <mesh>
              <circleGeometry args={[0.25, 32]} />
              <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
            </mesh>
            <Text position={[0, 0, 0.02]} fontSize={0.25} color="#451a03" fontWeight="900">2</Text>
          </group>

          <Text position={[0.2, 0.4, 0.1]} fontSize={0.32} color="#fcd34d" fontWeight="900">FROGGY CHEF 🐸</Text>
          <Text position={[0.2, 0.1, 0.1]} fontSize={0.20} color="#ffffff" fontWeight="bold">MIX MAGIC CAT CANDY</Text>
          
          <mesh position={[0, -0.2, 0.1]}>
             <boxGeometry args={[2.5, 0.02, 0.01]} />
             <meshBasicMaterial color="#fbbf24" />
          </mesh>
          <Text position={[0, -0.45, 0.1]} fontSize={0.14} color="#fef3c7" fontWeight="800" maxWidth={2.6} textAlign="center">
             DROP TWO PRIMARY COLORS INTO CHEF'S HANDS TO CREATE NEW FLAVORS!
          </Text>
        </group>
      </group>

      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[2.2, 1.8, 1.8]} position={[0, 0.5, 0]} />
        <CuboidCollider args={[1.0, 1.0, 1.0]} position={[-2.4, 1.5, 0.8]} sensor onIntersectionEnter={handleInputA} />
        <CuboidCollider args={[1.0, 1.0, 1.0]} position={[2.4, 1.5, 0.8]} sensor onIntersectionEnter={handleInputB} />
      </RigidBody>
    </group>
  );
}

export const MachineMerger = ({ 
  position,
  rotation = [0, 0, 0]
}: { 
  position: [number, number, number];
  rotation?: [number, number, number];
}) => {
  const gameState = useGameStore((state) => state.gameState);
  const sceneSeed = useGameStore((state) => state.sceneSeed);
  const spawnBall = useGameStore((state) => state.spawnBall);
  const removeBall = useGameStore((state) => state.removeBall);

  return (
    <MachineMergerCore
      key={`merger-${sceneSeed}-${gameState}`}
      position={position}
      rotation={rotation}
      gameState={gameState}
      spawnBall={spawnBall}
      removeBall={removeBall}
    />
  );
};
