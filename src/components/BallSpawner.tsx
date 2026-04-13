import { useCallback, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { RoundedBox, Text } from '@react-three/drei';
import { BallColor, getSpawnColorsForLevel } from '../store/ColorSystem';
import { GameState, useGameStore } from '../store/GameStore';

// Balls drop from the higher Pink candy - Adjusted to be further forward and lower for physics stability
const DISPENSE_OFFSET: [number, number, number] = [0, 1.6, 2.6];

export const BallSpawner = ({ 
  position = [0, 0, -6.25],
  rotation = [0, 0, 0]
}: { 
  position?: [number, number, number];
  rotation?: [number, number, number];
}) => {
  const spawnBall = useGameStore((state) => state.spawnBall);
  const gameState = useGameStore((state) => state.gameState);
  const candyDispenseRequests = useGameStore((state) => state.candyDispenseRequests);

  const dispenseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHandledRequestRef = useRef(candyDispenseRequests);
  const isDispensingRef = useRef(false);
  const machineRef = useRef<THREE.Group>(null);
  const leverRef = useRef<THREE.Group>(null);
  const hintRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Group>(null);
  const rightEyeRef = useRef<THREE.Group>(null);
  const seedOrbsRef = useRef<THREE.Group>(null);
  const signRef = useRef<THREE.Group>(null);

  const spawnColors = getSpawnColorsForLevel();

  const dispenseCandy = useCallback(() => {
    if (gameState !== GameState.Playing || dispenseTimeoutRef.current || isDispensingRef.current) {
      return;
    }

    isDispensingRef.current = true;

    const color = spawnColors[Math.floor(Math.random() * spawnColors.length)] ?? BallColor.Red;
    
    // Rotate offset based on spawner rotation
    const rotatedOffset = new THREE.Vector3(...DISPENSE_OFFSET);
    if (rotation[1] !== 0) {
      rotatedOffset.applyEuler(new THREE.Euler(0, rotation[1], 0));
    }
    
    const spawnPosition: [number, number, number] = [
      position[0] + rotatedOffset.x,
      position[1] + rotatedOffset.y,
      position[2] + rotatedOffset.z
    ];
    
    // Slight variance for natural feel
    spawnPosition[0] += (Math.random() - 0.5) * 0.1;
    spawnPosition[2] += (Math.random() - 0.5) * 0.05;

    dispenseTimeoutRef.current = setTimeout(() => {
      spawnBall(color, spawnPosition);
      isDispensingRef.current = false;
      dispenseTimeoutRef.current = null;
    }, 180);
  }, [gameState, position, rotation, spawnBall, spawnColors]);

  useEffect(() => {
    if (gameState !== GameState.Playing) {
      if (dispenseTimeoutRef.current) {
        clearTimeout(dispenseTimeoutRef.current);
        dispenseTimeoutRef.current = null;
      }
      isDispensingRef.current = false;
      return;
    }
    if (candyDispenseRequests <= lastHandledRequestRef.current) {
      return;
    }
    lastHandledRequestRef.current = candyDispenseRequests;
    dispenseCandy();
  }, [candyDispenseRequests, gameState, dispenseCandy]);

  useEffect(() => {
    return () => {
      if (dispenseTimeoutRef.current) {
        clearTimeout(dispenseTimeoutRef.current);
        dispenseTimeoutRef.current = null;
      }
    };
  }, []);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    
    if (machineRef.current) {
      const bounceStr = 0.04;
      const bounceFreq = 1.35;
      const bounce = Math.sin(elapsed * bounceFreq);
      machineRef.current.position.y = position[1] + (bounce > 0 ? bounce * bounceStr : 0);
      machineRef.current.scale.y = 1 + bounce * 0.05;
      machineRef.current.scale.x = machineRef.current.scale.z = 1 - bounce * 0.03;
      machineRef.current.rotation.y = Math.sin(elapsed * 0.3) * 0.05;
    }
    
    if (leverRef.current) {
      const shakeIntensity = isDispensingRef.current ? Math.sin(elapsed * 60) * 0.1 : 0;
      leverRef.current.rotation.z = Math.sin(elapsed * 1.5) * 0.05 + shakeIntensity;
      leverRef.current.position.y = isDispensingRef.current ? Math.sin(elapsed * 60) * 0.02 : 0;
    }

    if (signRef.current) {
      // Magical Hovering Animation
      signRef.current.position.y = 3.5 + Math.sin(elapsed * 1.2) * 0.12;
      signRef.current.rotation.z = Math.sin(elapsed * 0.8) * 0.03;
    }
  });

  return (
    <group ref={machineRef} position={position} rotation={rotation} userData={{ name: 'candy-machine' }}>
      {/* Boba Shop Counter Base */}
      <group position={[0, -1.05, 0]}>
        <RoundedBox args={[2.5, 0.5, 1.8]} radius={0.1} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#581c87" roughness={0.4} />
        </RoundedBox>
        <mesh position={[0, 0.26, 0]}>
           <boxGeometry args={[2.6, 0.05, 1.9]} />
           <meshStandardMaterial color="#faf5ff" roughness={0.6} emissive="#f3e8ff" emissiveIntensity={0.2} />
        </mesh>
      </group>

      {/* Boba Cat Body */}
      <group position={[0, -0.1, 0]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[1.3, 32, 32]} scale={[1, 0.9, 1.1]} />
          <meshStandardMaterial color="#ffffff" roughness={0.8} />
        </mesh>
        <mesh position={[0.6, 0.4, 0.6]} rotation={[0.5, 0.5, 0]}>
          <sphereGeometry args={[0.5, 16, 16]} scale={[1, 0.4, 1]} />
          <meshStandardMaterial color="#ea580c" />
        </mesh>
        <mesh position={[-0.7, 0.2, -0.5]} rotation={[-0.3, -0.4, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} scale={[1, 0.3, 1]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      </group>

      {/* Cat Head */}
      <group position={[0, 1.1, 0.2]}>
        <mesh castShadow>
          <sphereGeometry args={[1.0, 32, 32]} scale={[1.1, 0.9, 1]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.6, 0.7, 0]} rotation={[0, 0, 0.4]}>
          <coneGeometry args={[0.25, 0.5, 4]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.6, 0.7, 0]} rotation={[0, 0, -0.4]}>
          <coneGeometry args={[0.25, 0.5, 4]} />
          <meshStandardMaterial color="#ea580c" />
        </mesh>
        <group position={[0, 0.9, 0]} rotation={[0.1, 0, 0]}>
           <mesh position={[0, 0.1, 0]} castShadow>
              <cylinderGeometry args={[0.25, 0.25, 0.3]} />
              <meshStandardMaterial color="#ffffff" />
           </mesh>
           <mesh position={[0, 0.3, 0]}>
              <sphereGeometry args={[0.3, 16, 16]} scale={[1, 0.5, 1]} />
              <meshStandardMaterial color="#ffffff" />
           </mesh>
        </group>
      </group>

      {/* Cat Paws */}
      <group position={[0, 0.45, 1.45]}>
        <mesh position={[-0.2, 0, 0.15]} castShadow>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.2, 0, 0.15]} castShadow>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Magical Love Dust VFX */}
      <group ref={seedOrbsRef}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <group key={i} position={[Math.cos(i * 1.1) * 2.8, Math.sin(i * 1.4) * 1.8, Math.sin(i * 1.1) * 2.8]}>
             {i % 2 === 0 ? (
               <group rotation={[Math.PI / 2, 0, 0]}>
                  <mesh position={[0, 0.05, 0]}>
                    <sphereGeometry args={[0.06, 12, 12]} scale={[1, 1.2, 0.8]} />
                    <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={2} />
                  </mesh>
                  <mesh position={[0.05, 0.1, 0]}>
                    <sphereGeometry args={[0.04, 12, 12]} />
                    <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={2} />
                  </mesh>
                  <mesh position={[-0.05, 0.1, 0]}>
                    <sphereGeometry args={[0.04, 12, 12]} />
                    <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={2} />
                  </mesh>
               </group>
             ) : (
               <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <octahedronGeometry args={[0.06, 0]} />
                  <meshStandardMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={3} />
               </mesh>
             )}
          </group>
        ))}
      </group>

      {/* Face Details */}
      <group position={[0, 1.1, 1.15]}>
        <group ref={leftEyeRef} position={[-0.35, 0.15, 0.05]}>
          <mesh castShadow>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#111827" roughness={0.0} metalness={0.5} />
          </mesh>
          <mesh position={[0.04, 0.04, 0.08]}>
             <sphereGeometry args={[0.035, 8, 8]} />
             <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
        <group ref={rightEyeRef} position={[0.35, 0.15, 0.05]}>
          <mesh castShadow>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#111827" roughness={0.0} metalness={0.5} />
          </mesh>
          <mesh position={[0.04, 0.04, 0.08]}>
             <sphereGeometry args={[0.035, 8, 8]} />
             <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
        <mesh position={[0, -0.05, 0.1]}>
          <sphereGeometry args={[0.06, 12, 12]} scale={[1, 0.8, 0.5]} />
          <meshStandardMaterial color="#fca5a5" />
        </mesh>
        <group position={[0, -0.2, 0.1]} rotation={[0.2, 0, 0]}>
           <mesh position={[-0.05, 0, 0]} rotation={[0, 0, 0.4]}>
              <boxGeometry args={[0.1, 0.02, 0.01]} />
              <meshBasicMaterial color="#111827" />
           </mesh>
           <mesh position={[0.05, 0, 0]} rotation={[0, 0, -0.4]}>
              <boxGeometry args={[0.1, 0.02, 0.01]} />
              <meshBasicMaterial color="#111827" />
           </mesh>
        </group>
        <group position={[0, -0.05, 0]}>
           {[-0.2, 0, 0.2].map((y, i) => (
             <group key={i} position={[0, y*0.5, 0]}>
                <mesh position={[0.65, 0, 0]} rotation={[0, 0, y * 0.3]}>
                   <boxGeometry args={[0.4, 0.01, 0.01]} />
                   <meshBasicMaterial color="#9ca3af" />
                </mesh>
                <mesh position={[-0.65, 0, 0]} rotation={[0, 0, -y * 0.3]}>
                   <boxGeometry args={[0.4, 0.01, 0.01]} />
                   <meshBasicMaterial color="#9ca3af" />
                </mesh>
             </group>
           ))}
        </group>
        <mesh position={[-0.6, -0.05, -0.1]}>
          <sphereGeometry args={[0.2, 16, 16]} scale={[1, 0.6, 0.2]} />
          <meshStandardMaterial color="#fca5a5" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0.6, -0.05, -0.1]}>
          <sphereGeometry args={[0.2, 16, 16]} scale={[1, 0.6, 0.2]} />
          <meshStandardMaterial color="#fca5a5" transparent opacity={0.5} />
        </mesh>
      </group>

      {/* Ground Target Marker */}
      <group position={[DISPENSE_OFFSET[0], -1.15, DISPENSE_OFFSET[2]]}>
         <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.4, 0.5, 32]} />
            <meshStandardMaterial color="#fbbf24" transparent opacity={0.6} emissive="#fbbf24" emissiveIntensity={2} />
         </mesh>
         <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <circleGeometry args={[0.38, 32]} />
            <meshStandardMaterial color="#fbbf24" transparent opacity={0.2} />
         </mesh>
         <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[0.55, 0.65, 32]} />
            <meshStandardMaterial 
              color="#fbbf24" 
              transparent 
              opacity={(Math.sin(Date.now() * 0.005) * 0.2 + 0.3)} 
              emissive="#fbbf24" 
              emissiveIntensity={1} 
            />
         </mesh>
      </group>

      {/* Wand / Candy Lever */}
      <group ref={leverRef} position={[0, -0.2, 1.6]} rotation={[0.05, 0, 0]} userData={{ name: 'candy-lever' }}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 3.8, 16]} />
          <meshStandardMaterial color="#d97706" roughness={0.8} />
        </mesh>
        {[
          { y: 1.2, c: "#fb7185" },
          { y: 0.6, c: "#fbbf24" },
          { y: 0.0, c: "#38bdf8" },
        ].map((candy, i) => (
          <group key={i} position={[0, candy.y + 1.5, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.42, 32, 32]} />
              <meshStandardMaterial 
                color={candy.c} 
                roughness={0.2} 
                emissive={candy.c} 
                emissiveIntensity={isDispensingRef.current ? 1.5 : 0.2} 
              />
            </mesh>
          </group>
        ))}
        <group position={[0, 2.0, 0]}>
           <mesh ref={hintRef}>
              <sphereGeometry args={[0.6, 16, 16]} />
              <meshStandardMaterial color="#fcd34d" transparent opacity={0.1} emissive="#fcd34d" emissiveIntensity={2} depthWrite={false} />
           </mesh>
        </group>
      </group>

      {/* --- UNIFIED FLOATING SIGNAGE (Overhead Step 1) --- */}
      <group ref={signRef} position={[0, 3.5, 0.2]} rotation={[0, 0, 0]}>
        {/* Sign Board */}
        <group position={[0, 0, 0.1]}>
          <RoundedBox args={[3.2, 1.4, 0.15]} radius={0.15} smoothness={4} castShadow>
             <meshStandardMaterial color="#4c1d95" roughness={0.8} />
          </RoundedBox>
          
          {/* Step Badge */}
          <group position={[-1.1, 0.35, 0.12]}>
            <mesh>
              <circleGeometry args={[0.25, 32]} />
              <meshStandardMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={0.5} />
            </mesh>
            <Text position={[0, 0, 0.02]} fontSize={0.25} color="#451a03" fontWeight="900">1</Text>
          </group>
          
          {/* Main Title */}
          <Text position={[0.2, 0.35, 0.1]} fontSize={0.32} color="#f0abfc" fontWeight="900">CANDY SHOP 🍭</Text>
          <Text position={[0.2, 0.05, 0.1]} fontSize={0.20} color="#ffffff" fontWeight="bold">SPAWN CANDY</Text>
          
          {/* Instructions */}
          <mesh position={[0, -0.25, 0.1]}>
             <boxGeometry args={[2.5, 0.02, 0.01]} />
             <meshBasicMaterial color="#a78bfa" />
          </mesh>
          <Text position={[0, -0.45, 0.1]} fontSize={0.14} color="#fdf4ff" fontWeight="800" maxWidth={2.6} textAlign="center">
             SHAKE THE WAND TO DISPENSE FRESH CAT CANDY!
          </Text>
        </group>
      </group>

      <RigidBody type="fixed">
        <CuboidCollider args={[1.5, 2.0, 1.5]} position={[0, 0, 0]} />
        <CuboidCollider args={[0.8, 2.5, 0.8]} position={[0, 1.0, 1.6]} sensor />
      </RigidBody>
    </group>
  );
};
