import { useState } from 'react';
import { Text as DreiText, RoundedBox } from '@react-three/drei';
import { useXRInputSourceState, XRSpace } from '@react-three/xr';
import { useGameStore, GameState } from '../store/GameStore';

function PanelButton({ position, label, color, hoverColor, onClick, active = false, width = 0.08 }: {
  position: [number, number, number];
  label: string;
  color: string;
  hoverColor: string;
  onClick: () => void;
  active?: boolean;
  width?: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
    >
      <RoundedBox args={[width, 0.022, 0.005]} radius={0.004} smoothness={4}>
        <meshStandardMaterial
          color={hovered ? hoverColor : color}
          emissive={active ? hoverColor : '#000000'}
          emissiveIntensity={active ? 0.6 : 0}
          roughness={0.3}
        />
      </RoundedBox>
      <DreiText position={[0, 0, 0.004]} fontSize={0.008} color={active ? '#ffffff' : '#1e293b'} fontWeight="bold">
        {label}
      </DreiText>
    </group>
  );
}

export function VRSettingsPanel() {
  const controllerState = useXRInputSourceState('controller', 'right');

  const difficulty = useGameStore((s) => s.difficulty);
  const level = useGameStore((s) => s.level);
  const gameState = useGameStore((s) => s.gameState);
  const setDifficulty = useGameStore((s) => s.setDifficulty);
  const startLevel = useGameStore((s) => s.startLevel);
  const startTutorial = useGameStore((s) => s.startTutorial);
  const advanceLevel = useGameStore((s) => s.advanceLevel);
  const resetGame = useGameStore((s) => s.resetGame);
  const requestCandyDispense = useGameStore((s) => s.requestCandyDispense);

  if (!controllerState || !controllerState.inputSource.gripSpace) return null;

  const isPlaying = gameState === GameState.Playing;

  return (
    <XRSpace space={controllerState.inputSource.gripSpace}>
      <group
        position={[0, 0.06, 0.08]}
        rotation={[-Math.PI / 2.5, 0, 0]}
      >
        {/* Panel Background */}
        <mesh>
          <planeGeometry args={[0.22, 0.20]} />
          <meshStandardMaterial
            color="#f0f9ff"
            transparent
            opacity={0.92}
            roughness={0}
            metalness={0.1}
          />
        </mesh>

        {/* Border */}
        <mesh position={[0, 0, -0.001]}>
          <planeGeometry args={[0.23, 0.21]} />
          <meshStandardMaterial color="#6366f1" />
        </mesh>

        {/* Title */}
        <DreiText
          position={[0, 0.082, 0.001]}
          fontSize={0.011}
          color="#4338ca"
          fontWeight="900"
        >
          GAME SETTINGS ⚙️
        </DreiText>

        {/* Difficulty Section */}
        <DreiText position={[-0.08, 0.06, 0.001]} fontSize={0.006} color="#6366f1" fontWeight="bold" anchorX="left">
          DIFFICULTY
        </DreiText>
        <group position={[0, 0.04, 0.001]}>
          <PanelButton
            position={[-0.04, 0, 0]}
            label="Easy ∞"
            color="#d1fae5"
            hoverColor="#10b981"
            onClick={() => setDifficulty('easy')}
            active={difficulty === 'easy'}
          />
          <PanelButton
            position={[0.04, 0, 0]}
            label="Hard ⏱"
            color="#fee2e2"
            hoverColor="#ef4444"
            onClick={() => setDifficulty('hard')}
            active={difficulty === 'hard'}
          />
        </group>

        {/* Level Section */}
        <DreiText position={[-0.08, 0.02, 0.001]} fontSize={0.006} color="#6366f1" fontWeight="bold" anchorX="left">
          LEVEL SELECT
        </DreiText>
        <group position={[0, 0, 0.001]}>
          <PanelButton position={[-0.065, 0, 0]} label="L1" color="#e0e7ff" hoverColor="#818cf8" onClick={() => startLevel(1)} active={level === 1 && isPlaying} width={0.04} />
          <PanelButton position={[-0.02, 0, 0]} label="L2" color="#e0e7ff" hoverColor="#818cf8" onClick={() => startLevel(2)} active={level === 2 && isPlaying} width={0.04} />
          <PanelButton position={[0.025, 0, 0]} label="L3" color="#e0e7ff" hoverColor="#818cf8" onClick={() => startLevel(3)} active={level === 3 && isPlaying} width={0.04} />
          <PanelButton position={[0.075, 0, 0]} label="Tut" color="#fef3c7" hoverColor="#f59e0b" onClick={() => startTutorial()} active={level === 0 && isPlaying} width={0.04} />
        </group>

        {/* Actions Section */}
        <DreiText position={[-0.08, -0.025, 0.001]} fontSize={0.006} color="#6366f1" fontWeight="bold" anchorX="left">
          ACTIONS
        </DreiText>
        <group position={[0, -0.045, 0.001]}>
          <PanelButton position={[-0.05, 0, 0]} label="Spawn" color="#dbeafe" hoverColor="#3b82f6" onClick={() => requestCandyDispense()} width={0.06} />
          <PanelButton position={[0.02, 0, 0]} label="Next" color="#d1fae5" hoverColor="#10b981" onClick={() => advanceLevel()} width={0.05} />
          <PanelButton position={[0.075, 0, 0]} label="Reset" color="#fee2e2" hoverColor="#ef4444" onClick={() => resetGame()} width={0.05} />
        </group>

        {/* Status */}
        <DreiText
          position={[0, -0.075, 0.001]}
          fontSize={0.006}
          color="#6366f1"
          fontWeight="900"
        >
          {`L${level} | ${difficulty.toUpperCase()} | ${gameState === GameState.Victory ? 'WIN' : gameState === GameState.GameOver ? 'OVER' : 'PLAY'}`}
        </DreiText>
      </group>
    </XRSpace>
  );
}
