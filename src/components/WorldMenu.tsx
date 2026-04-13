import { GroupProps } from '@react-three/fiber';
import { RoundedBox, Text as DreiText } from '@react-three/drei';
import { GameState, useGameStore } from '../store/GameStore';

const clampProgress = (value: number) => Math.min(1, Math.max(0, value));

export function WorldMenu(props: GroupProps) {
  const score = useGameStore((state) => state.score);
  const targetScore = useGameStore((state) => state.targetScore);
  const timeLeft = useGameStore((state) => state.timeLeft);
  const objective = useGameStore((state) => state.objective);
  const level = useGameStore((state) => state.level);
  const gameState = useGameStore((state) => state.gameState);
  const combo = useGameStore((state) => state.combo);
  const bestCombo = useGameStore((state) => state.bestCombo);

  const progress = targetScore > 0 ? clampProgress(score / targetScore) : 0;
  const progressWidth = Math.max(0.1, 2.8 * progress);
  const progressOffset = -1.4 + progressWidth / 2;

  const statusLabel =
    gameState === GameState.Victory ? 'STAGE CLEAR!' : gameState === GameState.GameOver ? 'TIME OUT' : 'IN PLAY';

  const statusColor =
    gameState === GameState.Victory ? '#22c55e' : gameState === GameState.GameOver ? '#ef4444' : '#f59e0b';

  const timeLabel = (() => {
    if (timeLeft <= 0) return '∞';
    const mins = Math.floor(timeLeft / 60);
    const secs = Math.floor(timeLeft % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  })();

  return (
    <group {...props}>
      {/* Wooden Post */}
      <mesh position={[0, -2.2, -0.1]} castShadow>
        <boxGeometry args={[0.15, 3.2, 0.15]} />
        <meshStandardMaterial color="#451a03" roughness={0.9} />
      </mesh>

      {/* Main Wooden Board (Vertical Container) */}
      <group position={[0, 0, 0]}>
        {/* Board Frame */}
        <RoundedBox args={[3.6, 4.8, 0.15]} radius={0.15} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#7c2d12" roughness={0.8} />
        </RoundedBox>

        {/* Paper/Inner Surface */}
        <RoundedBox args={[3.2, 4.4, 0.08]} radius={0.1} smoothness={4} position={[0, 0, 0.05]}>
          <meshStandardMaterial color="#fef3c7" roughness={0.4} />
        </RoundedBox>

        {/* --- Content --- */}
        <group position={[0, 0, 0.1]}>
          <DreiText position={[0, 1.8, 0]} fontSize={0.24} color="#451a03" fontWeight="900">FIELD PROGRESS</DreiText>
          <DreiText position={[0, 1.5, 0]} fontSize={0.18} color="#78350f" fontWeight="700">
             Stage {level === 0 ? 'Tutorial' : `L${level}`}
          </DreiText>

          {/* Status Badge */}
          <group position={[0, 1.0, 0]}>
            <RoundedBox args={[2.4, 0.5, 0.02]} radius={0.1} smoothness={4}>
               <meshStandardMaterial color={statusColor} />
            </RoundedBox>
            <DreiText position={[0, 0, 0.03]} fontSize={0.25} color="#ffffff" fontWeight="900" textAlign="center">
               {statusLabel}
            </DreiText>
          </group>

          <DreiText position={[0, 0.4, 0]} fontSize={0.16} color="#78350f" fontWeight="800" maxWidth={2.8} textAlign="center">
            {objective.toUpperCase()}
          </DreiText>

          {/* Progress Section */}
          <group position={[0, -0.4, 0]}>
             <DreiText position={[-1.4, 0.4, 0]} fontSize={0.14} color="#a16207" fontWeight="bold" anchorX="left">
                FEED PROGRESS
             </DreiText>
             {/* Track */}
             <RoundedBox args={[3.0, 0.2, 0.05]} radius={0.1} smoothness={4} position={[0, 0.15, 0]}>
                <meshStandardMaterial color="#fef08a" />
             </RoundedBox>
             {/* Fill */}
             <group position={[progressOffset, 0.15, 0.02]}>
                <RoundedBox args={[progressWidth, 0.15, 0.05]} radius={0.07} smoothness={4}>
                   <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={0.2} />
                </RoundedBox>
             </group>
             <DreiText position={[0, -0.15, 0]} fontSize={0.22} color="#854d0e" fontWeight="900">
                {score} / {targetScore}
             </DreiText>
          </group>

          {/* Stats Row */}
          <group position={[0, -1.2, 0]}>
             <DreiText position={[-0.8, 0, 0]} fontSize={0.16} color="#78350f" fontWeight="bold">
                TIME: {timeLabel}
             </DreiText>
             <DreiText position={[0.8, 0, 0]} fontSize={0.16} color="#78350f" fontWeight="bold">
                STREAK: x{combo}
             </DreiText>
          </group>

          <mesh position={[0, -1.5, 0]}>
             <boxGeometry args={[2.8, 0.02, 0.01]} />
             <meshBasicMaterial color="#d97706" opacity={0.3} transparent />
          </mesh>

          {/* Steps Guide (Small) */}
          <group position={[0, -1.9, 0]}>
             <DreiText fontSize={0.12} color="#92400e" fontWeight="bold" maxWidth={2.8} textAlign="center">
                1: FEED SILO ➔ 2: MIX FROG ➔ 3: FEED MICE
             </DreiText>
             <DreiText position={[0, -0.25, 0]} fontSize={0.10} color="#78350f" fontWeight="900">
                BEST COMBO: x{bestCombo}
             </DreiText>
          </group>
        </group>

        {/* Decorative corner nails */}
        {[[-1.6, 2.2], [1.6, 2.2], [-1.6, -2.2], [1.6, -2.2]].map(([x, y], i) => (
           <mesh key={i} position={[x, y, 0.08]}>
              <circleGeometry args={[0.04, 16]} />
              <meshStandardMaterial color="#451a03" />
           </mesh>
        ))}
      </group>
    </group>
  );
}
