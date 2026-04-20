import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text as DreiText, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, GameState } from '../store/GameStore';

export function VRGameOverlay() {
  const { camera } = useThree();
  const gameState = useGameStore((state) => state.gameState);
  const level = useGameStore((state) => state.level);
  const advanceLevel = useGameStore((state) => state.advanceLevel);
  const resetGame = useGameStore((state) => state.resetGame);
  
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Smoothly float the panel in front of the player's face
  useFrame(() => {
    if (!groupRef.current || gameState === GameState.Playing) return;
    
    const targetPosition = new THREE.Vector3();
    camera.getWorldDirection(targetPosition);
    targetPosition.multiplyScalar(4); // 4 meters in front
    targetPosition.add(camera.position);
    targetPosition.y = Math.max(camera.position.y, 2); // Keep it above ground

    groupRef.current.position.lerp(targetPosition, 0.05);
    
    // Always look at the camera, but only rotate around Y axis to keep it upright
    const lookAtPos = new THREE.Vector3(camera.position.x, groupRef.current.position.y, camera.position.z);
    groupRef.current.lookAt(lookAtPos);
  });

  if (gameState === GameState.Playing) return null;

  const isVictory = gameState === GameState.Victory;
  const isGameOver = gameState === GameState.GameOver;
  const isAllClear = isVictory && level >= 3;

  const title = isAllClear ? 'ALL LEVELS COMPLETE!' : isVictory ? 'LEVEL COMPLETE' : "TIME'S UP";
  const subtitle = isAllClear 
    ? 'You mastered all color levels!' 
    : isVictory 
      ? 'Great job!\nMove on to the next color level.' 
      : 'The timer ran out before you reached the target.';
  
  const buttonText = isAllClear ? 'Play Again' : isVictory ? 'Next Level' : 'Try Again';
  
  const panelColor = isVictory ? "#10b981" : "#ef4444";
  const panelEmissive = isVictory ? "#059669" : "#b91c1c";

  return (
    <group ref={groupRef} position={[0, -10, 0]}>
      {/* Glassy Background Panel */}
      <mesh>
        <planeGeometry args={[5, 2.5]} />
        <meshStandardMaterial 
          color={panelColor} 
          emissive={panelEmissive}
          emissiveIntensity={0.2}
          transparent 
          opacity={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Border outline */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[5.2, 2.7]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>

      <DreiText position={[0, 0.6, 0.05]} fontSize={0.4} color="#ffffff" fontWeight="900" letterSpacing={0.05}>
        {title}
      </DreiText>

      <DreiText position={[0, 0.1, 0.05]} fontSize={0.2} color="#f0fdf4" textAlign="center">
        {subtitle}
      </DreiText>

      {/* Interactive Button */}
      <group 
        position={[0, -0.6, 0.1]} 
        onClick={(e) => {
          e.stopPropagation();
          if (isAllClear || isGameOver) resetGame();
          else advanceLevel();
        }} 
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }} 
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
      >
        <RoundedBox args={[2, 0.6, 0.1]} radius={0.1} smoothness={4} castShadow>
          <meshStandardMaterial color={hovered ? "#fef08a" : "#fcd34d"} roughness={0.3} emissive={hovered ? "#ca8a04" : "#000000"} emissiveIntensity={0.2} />
        </RoundedBox>
        <DreiText position={[0, 0, 0.06]} fontSize={0.25} color="#431407" fontWeight="bold">
          {buttonText}
        </DreiText>
      </group>
    </group>
  );
}
