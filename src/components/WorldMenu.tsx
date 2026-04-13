import { RoundedBox, Text as DreiText } from '@react-three/drei';
import { GameState, useGameStore } from '../store/GameStore';

const clampProgress = (value: number) => Math.min(1, Math.max(0, value));

export function WorldMenu() {
  const score = useGameStore((state) => state.score);
  const targetScore = useGameStore((state) => state.targetScore);
  const timeLeft = useGameStore((state) => state.timeLeft);
  const objective = useGameStore((state) => state.objective);
  const level = useGameStore((state) => state.level);
  const gameState = useGameStore((state) => state.gameState);
  const combo = useGameStore((state) => state.combo);
  const bestCombo = useGameStore((state) => state.bestCombo);

  const progress = targetScore > 0 ? clampProgress(score / targetScore) : 0;
  const progressWidth = Math.max(0.18, 2.72 * progress);
  const progressOffset = -1.36 + progressWidth / 2;

  const statusLabel =
    gameState === GameState.Victory ? 'Stage Cleared' : gameState === GameState.GameOver ? 'Time Out' : 'In Play';

  const statusColor =
    gameState === GameState.Victory ? '#15803d' : gameState === GameState.GameOver ? '#b91c1c' : '#d97706';

  const timeLabel = (() => {
    if (timeLeft <= 0) {
      return '∞';
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = Math.floor(timeLeft % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  })();

  return (
    <group position={[0, 16.0, -45.0]} scale={4.0}>
      {/* Decorative Outer Glow/Shadow */}
      <RoundedBox args={[7.2, 3.8, 0.05]} radius={1.0} smoothness={4} position={[0, 0, -0.05]}>
        <meshStandardMaterial color="#ffffff" transparent opacity={0.15} />
      </RoundedBox>

      {/* Main Board - Magical Tablet Aesthetic */}
      <RoundedBox args={[7.0, 3.6, 0.12]} radius={0.6} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color="#fdf2f8" roughness={0.2} metalness={0.1} />
      </RoundedBox>
      
      {/* Inner Screen Area */}
      <RoundedBox args={[6.6, 3.1, 0.08]} radius={0.5} smoothness={4} position={[0, 0, 0.04]}>
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.2} transparent opacity={0.9} />
      </RoundedBox>

      {/* Decorative Corner Stars */}
      {[[-3.2, 1.5], [3.2, 1.5], [-3.2, -1.5], [3.2, -1.5]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.1]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.25, 0.25, 0.05]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.6} />
        </mesh>
      ))}

      <DreiText 
        position={[0, 1.25, 0.14]} 
        fontSize={0.28} 
        color="#be185d" 
        fontWeight="bold"
        anchorX="center" 
        anchorY="middle"
      >
        FIELD PROGRESS
      </DreiText>

      <DreiText 
        position={[0, 0.9, 0.14]} 
        fontSize={0.18} 
        color="#ec4899" 
        anchorX="center" 
        anchorY="middle"
      >
        Stage {level === 0 ? 'Tutorial' : `L${level}`}
      </DreiText>

      <DreiText 
        position={[0, 0.35, 0.14]} 
        fontSize={0.7} 
        color={statusColor} 
        fontWeight="900" 
        anchorX="center" 
        anchorY="middle"
      >
        {statusLabel}
      </DreiText>

      <DreiText 
        position={[0, -0.25, 0.14]} 
        fontSize={0.18} 
        color="#701a75" 
        anchorX="center" 
        anchorY="middle" 
        maxWidth={5.5} 
        textAlign="center"
      >
        {objective}
      </DreiText>

      {/* Progress Bar Area */}
      <group position={[0, -1.0, 0.14]}>
        {/* Background Track */}
        <RoundedBox args={[5.2, 0.28, 0.06]} radius={0.14} smoothness={4}>
          <meshStandardMaterial color="#fbcfe8" roughness={0.4} />
        </RoundedBox>
        
        {/* Progress Fill */}
        <group position={[progressOffset * 1.85, 0, 0.02]}>
          <RoundedBox args={[progressWidth * 1.85, 0.2, 0.06]} radius={0.1} smoothness={4}>
            <meshStandardMaterial
              color={gameState === GameState.Victory ? '#10b981' : gameState === GameState.GameOver ? '#f43f5e' : '#f59e0b'}
              emissive={gameState === GameState.Victory ? '#10b981' : gameState === GameState.GameOver ? '#f43f5e' : '#f59e0b'}
              emissiveIntensity={0.3}
              roughness={0.2}
            />
          </RoundedBox>
        </group>

        {/* Labels below bar */}
        <DreiText position={[-2.4, -0.4, 0]} fontSize={0.16} color="#9d174d" fontWeight="bold">
          Feed {score} / {targetScore}
        </DreiText>
        <DreiText position={[2.4, -0.4, 0]} fontSize={0.16} color="#9d174d" fontWeight="bold" anchorX="right">
          Time {timeLabel}
        </DreiText>
        <DreiText position={[0, -0.7, 0]} fontSize={0.14} color="#db2777" anchorX="center">
          Streak x{combo > 0 ? combo : 0}  Best x{bestCombo}
        </DreiText>
      </group>

      {/* Quick How-To Guide */}
      <group position={[0, -2.2, 0]}>
        <RoundedBox args={[5.8, 0.5, 0.08]} radius={0.1} smoothness={4}>
          <meshStandardMaterial color="#fef3c7" roughness={0.3} />
        </RoundedBox>
        <DreiText position={[0, 0, 0.06]} fontSize={0.15} color="#78350f" fontWeight="900">
          1. GET FEED (SILO) ➔ 2. MIX (FROG) ➔ 3. FEED (MICE) = 🍬 TARGET
        </DreiText>
        {/* Decorative Hanging Ropes */}
        <mesh position={[-2.4, 0.35, -0.05]} rotation={[0, 0, 0]}>
           <cylinderGeometry args={[0.02, 0.02, 0.45]} />
           <meshStandardMaterial color="#451a03" />
        </mesh>
        <mesh position={[2.4, 0.35, -0.05]} rotation={[0, 0, 0]}>
           <cylinderGeometry args={[0.02, 0.02, 0.45]} />
           <meshStandardMaterial color="#451a03" />
        </mesh>
      </group>
    </group>

  );
}
