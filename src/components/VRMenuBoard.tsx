import { useState } from 'react';
import { Text as DreiText, RoundedBox } from '@react-three/drei';
import { useGameStore, GameState } from '../store/GameStore';
import * as THREE from 'three';

function MenuButton({ position, label, color, hoverColor, onClick, active = false, width = 1.8, height = 0.6, fontSize = 0.18 }: {
  position: [number, number, number];
  label: string;
  color: string;
  hoverColor: string;
  onClick: () => void;
  active?: boolean;
  width?: number;
  height?: number;
  fontSize?: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
    >
      <RoundedBox args={[width, height, 0.1]} radius={0.1} smoothness={4} castShadow>
        <meshStandardMaterial
          color={hovered ? hoverColor : (active ? hoverColor : color)}
          emissive={active ? hoverColor : (hovered ? hoverColor : '#000000')}
          emissiveIntensity={active ? 0.4 : (hovered ? 0.2 : 0)}
          roughness={0.4}
        />
      </RoundedBox>
      <DreiText position={[0, 0, 0.08]} fontSize={fontSize} color={active || hovered ? '#ffffff' : '#1e293b'} fontWeight="bold">
        {label}
      </DreiText>
    </group>
  );
}

function ColorPaletteLogo({ position }: { position: [number, number, number] }) {
  // Primary, Secondary, Black, White
  const colors = [
    '#ef4444', // Red
    '#3b82f6', // Blue
    '#eab308', // Yellow
    '#f97316', // Orange
    '#22c55e', // Green
    '#a855f7', // Purple
    '#000000', // Black
    '#ffffff', // White
  ];
  
  return (
    <group position={position}>
      {colors.map((c, i) => (
        <mesh key={i} position={[(i - 3.5) * 0.4, 0, 0]} castShadow>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshStandardMaterial color={c} roughness={0.2} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

export function VRMenuBoard({ position = [0, 3.5, 8] as [number, number, number], rotation = [0, Math.PI, 0] as [number, number, number] }) {
  const difficulty = useGameStore((s) => s.difficulty);
  const level = useGameStore((s) => s.level);
  const score = useGameStore((s) => s.score);
  const targetScore = useGameStore((s) => s.targetScore);
  const gameState = useGameStore((s) => s.gameState);
  const timeLeft = useGameStore((s) => s.timeLeft);
  const setDifficulty = useGameStore((s) => s.setDifficulty);
  const startLevel = useGameStore((s) => s.startLevel);
  const startTutorial = useGameStore((s) => s.startTutorial);
  const advanceLevel = useGameStore((s) => s.advanceLevel);
  const resetGame = useGameStore((s) => s.resetGame);
  const requestCandyDispense = useGameStore((s) => s.requestCandyDispense);

  const isPlaying = gameState === GameState.Playing;
  const statusText = gameState === GameState.Victory ? '🎉 WIN' : gameState === GameState.GameOver ? '⏰ TIME OUT' : '▶ PLAYING';
  
  // Show infinity if easy mode and timeLeft is 0, else show formatted time
  const timeLabel = (timeLeft <= 0 && difficulty === 'easy') 
    ? '∞' 
    : `${Math.floor(Math.max(0, timeLeft) / 60)}:${Math.floor(Math.max(0, timeLeft) % 60).toString().padStart(2, '0')}`;

  const boardW = 9;
  const boardH = 8.5;

  return (
    <group position={position} rotation={rotation}>
      {/* Main Board Background */}
      <mesh castShadow receiveShadow>
        <planeGeometry args={[boardW, boardH]} />
        <meshStandardMaterial color="#f0f4ff" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Border */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[boardW + 0.3, boardH + 0.3]} />
        <meshStandardMaterial color="#6366f1" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* ========== LOGO SECTION (y = 3.6) ========== */}
      <ColorPaletteLogo position={[0, 3.6, 0.1]} />

      {/* ========== ROW 1: TITLE (y = 2.8) ========== */}
      <DreiText position={[0, 2.8, 0.05]} fontSize={0.5} color="#4338ca" fontWeight="900" letterSpacing={0.02}>
        VR COLOR CIRCLE
      </DreiText>

      {/* ========== ROW 2: STATUS BAR (y = 1.8) ========== */}
      <group position={[0, 1.8, 0.05]}>
        <mesh>
          <planeGeometry args={[8.0, 0.8]} />
          <meshStandardMaterial color="#e0e7ff" transparent opacity={0.5} />
        </mesh>
        
        {/* Status */}
        <DreiText position={[-3.6, 0, 0.02]} fontSize={0.25} color="#6366f1" fontWeight="bold" anchorX="left">
          {statusText}
        </DreiText>
        
        {/* Level & Score */}
        <DreiText position={[0, 0, 0.02]} fontSize={0.25} color="#4338ca" fontWeight="bold">
          Lvl {level}  |  Score {score}/{targetScore}
        </DreiText>

        {/* Timer Box */}
        <group position={[2.6, 0, 0.02]}>
          <mesh position={[0.4, 0, -0.01]}>
            <planeGeometry args={[1.5, 0.6]} />
            <meshStandardMaterial color={timeLeft > 0 && timeLeft < 30 ? '#fee2e2' : '#ffffff'} />
          </mesh>
          <DreiText position={[-0.2, 0, 0.01]} fontSize={0.28} color={timeLeft > 0 && timeLeft < 30 ? '#ef4444' : '#4338ca'} fontWeight="900" anchorX="left">
            ⏱ {timeLabel}
          </DreiText>
        </group>
      </group>

      {/* ========== ROW 3: DIFFICULTY (y = 0.5) ========== */}
      <DreiText position={[0, 0.9, 0.05]} fontSize={0.22} color="#6366f1" fontWeight="bold" anchorX="center">
        DIFFICULTY
      </DreiText>
      <group position={[0, 0.4, 0.05]}>
        <MenuButton
          position={[-1.6, 0, 0]}
          label="☀ Easy (∞ Time)"
          color="#d1fae5"
          hoverColor="#10b981"
          onClick={() => setDifficulty('easy')}
          active={difficulty === 'easy'}
          width={2.8}
          height={0.65}
        />
        <MenuButton
          position={[1.6, 0, 0]}
          label="⏱ Hard (Timed)"
          color="#fee2e2"
          hoverColor="#ef4444"
          onClick={() => setDifficulty('hard')}
          active={difficulty === 'hard'}
          width={2.8}
          height={0.65}
        />
      </group>

      {/* ========== ROW 4: LEVEL SELECT (y = -0.8) ========== */}
      <DreiText position={[0, -0.3, 0.05]} fontSize={0.22} color="#6366f1" fontWeight="bold" anchorX="center">
        SELECT LEVEL
      </DreiText>
      <group position={[0, -0.8, 0.05]}>
        <MenuButton position={[-3.0, 0, 0]} label="Tutorial" color="#fef3c7" hoverColor="#f59e0b" onClick={() => startTutorial()} active={level === 0 && isPlaying} width={1.8} height={0.65} />
        <MenuButton position={[-1.0, 0, 0]} label="Level 1" color="#dbeafe" hoverColor="#3b82f6" onClick={() => startLevel(1)} active={level === 1 && isPlaying} width={1.8} height={0.65} />
        <MenuButton position={[1.0, 0, 0]} label="Level 2" color="#e0e7ff" hoverColor="#6366f1" onClick={() => startLevel(2)} active={level === 2 && isPlaying} width={1.8} height={0.65} />
        <MenuButton position={[3.0, 0, 0]} label="Level 3" color="#ede9fe" hoverColor="#8b5cf6" onClick={() => startLevel(3)} active={level === 3 && isPlaying} width={1.8} height={0.65} />
      </group>

      {/* ========== ROW 5: ACTIONS (y = -2.1) ========== */}
      <DreiText position={[0, -1.6, 0.05]} fontSize={0.22} color="#6366f1" fontWeight="bold" anchorX="center">
        ACTIONS
      </DreiText>
      <group position={[0, -2.1, 0.05]}>
        <MenuButton position={[-2.4, 0, 0]} label="🟡 Spawn Ball" color="#dbeafe" hoverColor="#3b82f6" onClick={() => requestCandyDispense()} width={2.4} height={0.65} />
        <MenuButton position={[0, 0, 0]} label="➡ Next Level" color="#d1fae5" hoverColor="#10b981" onClick={() => advanceLevel()} width={2.2} height={0.65} />
        <MenuButton position={[2.4, 0, 0]} label="🔄 Reset" color="#fee2e2" hoverColor="#ef4444" onClick={() => resetGame()} width={2.0} height={0.65} />
      </group>

      {/* ========== INFO FOOTER (y = -3.5) ========== */}
      <group position={[0, -3.5, 0.05]}>
        <mesh>
          <planeGeometry args={[8.0, 0.6]} />
          <meshStandardMaterial color="#fef3c7" transparent opacity={0.3} />
        </mesh>
        <DreiText position={[0, 0.08, 0.01]} fontSize={0.16} color="#92400e" fontWeight="bold" maxWidth={7.5} textAlign="center">
          Turn around to find this board — Easy = no timer | Hard = timed challenge
        </DreiText>
        <DreiText position={[0, -0.15, 0.01]} fontSize={0.14} color="#78350f" fontWeight="600" maxWidth={7.5} textAlign="center">
          Point at buttons and click to interact
        </DreiText>
      </group>
    </group>
  );
}
