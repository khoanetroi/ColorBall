import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text as DreiText } from '@react-three/drei';
import { GameState, useGameStore } from '../store/GameStore';
import * as THREE from 'three';

const clampProgress = (value: number) => Math.min(1, Math.max(0, value));

export function WorldMenu(props: any) {
  const score = useGameStore((state) => state.score);
  const targetScore = useGameStore((state) => state.targetScore);
  const timeLeft = useGameStore((state) => state.timeLeft);
  const level = useGameStore((state) => state.level);
  const gameState = useGameStore((state) => state.gameState);
  const combo = useGameStore((state) => state.combo);

  const groupRef = useRef<THREE.Group>(null);

  // Smooth swaying/breathing animation
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.position.y = Math.sin(t * 1.2) * 0.08;
      groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.02;
    }
  });

  const progress = targetScore > 0 ? clampProgress(score / targetScore) : 0;
  
  const statusLabel =
    gameState === GameState.Victory ? 'COMPLETED!' : gameState === GameState.GameOver ? 'TIME OUT' : 'IN PROGRESS';

  const statusColor =
    gameState === GameState.Victory ? '#059669' : gameState === GameState.GameOver ? '#dc2626' : '#db2777';

  const timeLabel = timeLeft <= 0 ? '∞' : `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;

  return (
    <group {...props}>
      <group ref={groupRef}>
        {/* --- STICKER HUD BASE (ZERO THICKNESS) --- */}
        <group position={[0, 0, 0]}>
          {/* Main Paper Plane (Solid Cream) */}
          <mesh castShadow receiveShadow>
             <planeGeometry args={[7.8, 5.2]} />
             <meshStandardMaterial color="#fffcf2" side={THREE.DoubleSide} roughness={1} />
          </mesh>

          {/* Sticker Border (Shocking Pink) */}
          <mesh position={[0, 0, -0.01]}>
             <planeGeometry args={[8.1, 5.5]} />
             <meshStandardMaterial color="#f472b6" side={THREE.DoubleSide} roughness={1} />
          </mesh>

          {/* --- WASHI TAPE DECORATIONS (CORNERS) --- */}
          {[
            [-4.0, 2.7, Math.PI / 4], [4.0, 2.7, -Math.PI / 4],
            [-4.0, -2.7, -Math.PI / 4], [4.0, -2.7, Math.PI / 4]
          ].map(([x, y, r], i) => (
             <mesh key={i} position={[x, y, 0.02]} rotation={[0, 0, r]}>
                <planeGeometry args={[1.5, 0.5]} />
                <meshStandardMaterial color={i % 2 === 0 ? "#70e0f0" : "#fb7185"} opacity={0.7} transparent />
             </mesh>
          ))}
          {/* --- HEADER UI (ADJUSTED PADDING) --- */}
          <group position={[0, 2.2, 0.03]}>
             <DreiText fontSize={0.4} color="#be185d" fontWeight="900" letterSpacing={0.02}>
                FARMER'S TO-DO LIST 🐈
             </DreiText>
             <group position={[0, -0.3, 0]}>
                <DreiText position={[-3.3, 0, 0]} fontSize={0.16} color="#9d174d" fontWeight="800" anchorX="left">
                   LEVEL: {level}
                </DreiText>
                <DreiText position={[3.3, 0, 0]} fontSize={0.16} color="#9d174d" fontWeight="800" anchorX="right">
                   CHRONO: {timeLabel}
                </DreiText>
             </group>
          </group>

          {/* --- TASK LIST (ORGANIZED) --- */}
          <group position={[0, 0.5, 0.03]}>
             {/* Task Card 1 */}
             <group position={[0, 0.5, 0]}>
                <mesh position={[0, 0, -0.01]}>
                   <planeGeometry args={[7.0, 0.7]} />
                   <meshStandardMaterial color="#fef2f2" roughness={1} />
                </mesh>
                <DreiText position={[-3.2, 0, 0]} fontSize={0.22} color="#431407" fontWeight="900" anchorX="left">
                   1. 🍎 HARVESTING
                </DreiText>
                <DreiText position={[-0.4, 0, 0]} fontSize={0.14} color="#9d174d" fontWeight="600" anchorX="left">
                   Visit the Storage Silo to collect raw units.
                </DreiText>
             </group>

             {/* Task Card 2 */}
             <group position={[0, -0.4, 0]}>
                <mesh position={[0, 0, -0.01]}>
                   <planeGeometry args={[7.0, 0.7]} />
                   <meshStandardMaterial color="#fefce8" roughness={1} />
                </mesh>
                <DreiText position={[-3.2, 0, 0]} fontSize={0.22} color="#431407" fontWeight="900" anchorX="left">
                   2. 👩‍🍳 BREWING
                </DreiText>
                <DreiText position={[-0.4, 0, 0]} fontSize={0.14} color="#9d174d" fontWeight="600" anchorX="left">
                   Submit units to Chef Froggy for processing.
                </DreiText>
             </group>

             {/* Task Card 3 */}
             <group position={[0, -1.3, 0]}>
                <mesh position={[0, 0, -0.01]}>
                   <planeGeometry args={[7.0, 0.7]} />
                   <meshStandardMaterial color="#f0fdf4" roughness={1} />
                </mesh>
                <DreiText position={[-3.2, 0, 0]} fontSize={0.22} color="#431407" fontWeight="900" anchorX="left">
                   3. 🎁 DELIVERY
                </DreiText>
                <DreiText position={[-0.4, 0, 0]} fontSize={0.14} color="#9d174d" fontWeight="600" anchorX="left">
                   Send final units to the distribution center.
                </DreiText>
             </group>
          </group>

          {/* --- BOTTOM DASHBOARD (PULLED INWARD) --- */}
          <group position={[0, -2.1, 0.03]}>
             {/* Quota Section */}
             <group position={[-3.3, -0.1, 0]}>
                <DreiText position={[0, 0.35, 0]} fontSize={0.18} color="#be185d" fontWeight="900" anchorX="left">
                   QUOTA: {score} / {targetScore} 🍎
                </DreiText>
                {/* Track */}
                <mesh position={[2.0, 0, 0]}>
                   <planeGeometry args={[4.0, 0.18]} />
                   <meshStandardMaterial color="#fb7185" opacity={0.15} transparent />
                </mesh>
                {/* Active Fill */}
                <group position={[(0 + (Math.max(0.01, 4.0 * progress) / 2)), 0, 0.01]}>
                   <mesh>
                      <planeGeometry args={[Math.max(0.01, 4.0 * progress), 0.14]} />
                      <meshStandardMaterial 
                         color="#f472b6" 
                         emissive="#db2777" 
                         emissiveIntensity={1.0} 
                      />
                   </mesh>
                </group>
             </group>

             {/* Stats Corner */}
             <group position={[2.2, -0.1, 0]}>
                <group position={[0, 0, 0]}>
                   <DreiText position={[0, 0.15, 0]} fontSize={0.12} color="#9d174d" fontWeight="bold">STATUS</DreiText>
                   <DreiText position={[0, -0.1, 0]} fontSize={0.18} color={statusColor} fontWeight="900">{statusLabel}</DreiText>
                </group>
                <group position={[1.1, 0, 0]}>
                   <DreiText position={[0, 0.15, 0]} fontSize={0.12} color="#9d174d" fontWeight="bold">STREAK</DreiText>
                   <DreiText position={[0, -0.05, 0]} fontSize={0.28} color={combo > 1 ? "#15803d" : "#9d174d"} fontWeight="900">x{combo}</DreiText>
                </group>
             </group>
          </group>
        </group>
      </group>
    </group>
  );
}
