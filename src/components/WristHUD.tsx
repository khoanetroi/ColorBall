import { Text as DreiText } from '@react-three/drei';
import { useXRInputSourceState, XRSpace } from '@react-three/xr';
import { useMemo } from 'react';
import { useGameStore } from '../store/GameStore';

export function WristHUD() {
  // In @react-three/xr v6, use the type 'controller' and handedness 'left'
  const controllerState = useXRInputSourceState('controller', 'left');
  
  const score = useGameStore((state) => state.score);
  const targetScore = useGameStore((state) => state.targetScore);
  const timeLeft = useGameStore((state) => state.timeLeft);
  const level = useGameStore((state) => state.level);
  const difficulty = useGameStore((state) => state.difficulty);

  const timeLabel = useMemo(() => {
    if (timeLeft <= 0) return '∞';
    const minutes = Math.floor(timeLeft / 60);
    const seconds = Math.floor(timeLeft % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  // Only render if the controller is active and it has a gripSpace
  if (!controllerState || !controllerState.inputSource.gripSpace) return null;

  return (
    <XRSpace space={controllerState.inputSource.gripSpace}>
      <group 
        position={[0, 0.06, 0.08]} 
        rotation={[-Math.PI / 2.5, 0, 0]}
      >
        {/* HUD Background (Glass) */}
        <mesh>
          <planeGeometry args={[0.26, 0.16]} />
          <meshStandardMaterial 
            color="#fff1f2" 
            transparent 
            opacity={0.85} 
            roughness={0} 
            metalness={0.1}
          />
        </mesh>

        {/* Decorative Border */}
        <mesh position={[0, 0, -0.001]}>
          <planeGeometry args={[0.27, 0.17]} />
          <meshStandardMaterial color="#fb7185" />
        </mesh>

        {/* Title */}
        <DreiText 
          position={[0, 0.06, 0.001]} 
          fontSize={0.012} 
          color="#be185d" 
          fontWeight="900"
        >
          COLOR HUD 🎨
        </DreiText>

        {/* Stats Grid */}
        <group position={[0, -0.005, 0.001]}>
          {/* Candy */}
          <group position={[-0.07, 0.02, 0]}>
            <DreiText fontSize={0.007} color="#9d174d" fontWeight="bold">SCORE</DreiText>
            <DreiText position={[0, -0.012, 0]} fontSize={0.012} color="#2b241d" fontWeight="900">
              {score}/{targetScore}
            </DreiText>
          </group>

          {/* Level */}
          <group position={[0.01, 0.02, 0]}>
            <DreiText fontSize={0.007} color="#9d174d" fontWeight="bold">STAGE</DreiText>
            <DreiText position={[0, -0.012, 0]} fontSize={0.012} color="#2b241d" fontWeight="900">
              L{level === 0 ? 'T' : level}
            </DreiText>
          </group>

          {/* Time */}
          <group position={[0.08, 0.02, 0]}>
            <DreiText fontSize={0.007} color="#9d174d" fontWeight="bold">CLOCK</DreiText>
            <DreiText position={[0, -0.012, 0]} fontSize={0.012} color="#2b241d" fontWeight="900">
              {timeLabel}
            </DreiText>
          </group>
        </group>

        {/* Status Area */}
        <mesh position={[0, -0.06, 0.001]}>
          <planeGeometry args={[0.22, 0.012]} />
          <meshStandardMaterial color="#fb7185" opacity={0.15} transparent />
        </mesh>
        <DreiText 
          position={[0, -0.06, 0.002]} 
          fontSize={0.007} 
          color="#be185d" 
          fontWeight="900"
        >
          {difficulty === 'hard' ? 'HARD MODE ⏱' : 'EASY MODE ∞'}
        </DreiText>
      </group>
    </XRSpace>
  );
}
