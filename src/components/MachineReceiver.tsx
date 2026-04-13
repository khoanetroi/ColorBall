import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { RoundedBox, Text } from '@react-three/drei';
import type { IntersectionEnterPayload } from '@react-three/rapier';
import { BallColor, getBallColorLabel, getHexColor, getTargetColorsForLevel, type BallColorCode } from '../store/ColorSystem';
import { GameState, useGameStore } from '../store/GameStore';
import { sfx } from '../utils/audio';

type ReceiverBallData = {
  name?: string;
  color?: BallColorCode;
  id?: string;
};

type ReceiverProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
  level: number;
  sceneSeed: number;
  gameState: number;
  addPoint: (points: number) => void;
  removeBall: (id: string) => void;
};

const pickRandomTarget = (targetColors: readonly BallColorCode[]): BallColorCode => {
  const randomColor = targetColors[Math.floor(Math.random() * targetColors.length)];
  return randomColor ?? BallColor.Red;
};

const HeartMesh = ({ scale = 1, color = "#f43f5e" }) => (
  <group scale={scale}>
    <mesh position={[-0.1, 0.1, 0]}><sphereGeometry args={[0.12, 16, 16]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} /></mesh>
    <mesh position={[0.1, 0.1, 0]}><sphereGeometry args={[0.12, 16, 16]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} /></mesh>
    <mesh position={[0, -0.05, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.16, 0.3, 16]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} /></mesh>
  </group>
);

const ChatBubble = ({ text, color, flash, rotation = [0, 0, 0] }: { text: string; color: string; flash: 'success' | 'error' | null; rotation?: [number, number, number] }) => {
  const bubbleRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (bubbleRef.current) {
      bubbleRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      bubbleRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.2) * 0.05;
    }
  });

  return (
    <group ref={bubbleRef} rotation={rotation}>
      {/* Bubble Tail */}
      <mesh position={[0, -0.6, 0]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[0.2, 0.6, 4]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Main Bubble */}
      <RoundedBox args={[2.8, 1.2, 0.4]} radius={0.3} smoothness={4} castShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </RoundedBox>

      {/* Content */}
      {flash === 'success' ? (
        <group position={[0, 0, 0.22]}>
          <Text fontSize={0.8} position={[0, 0.1, 0]}>😸</Text>
          <Text position={[0, -0.4, 0]} fontSize={0.15} color="#451a03" fontWeight="900">YUMMY!</Text>
        </group>
      ) : flash === 'error' ? (
        <group position={[0, 0, 0.22]}>
          <Text fontSize={0.8} position={[0, 0.1, 0]}>😿</Text>
          <Text position={[0, -0.4, 0]} fontSize={0.15} color="#b91c1c" fontWeight="900">NOT THAT!</Text>
        </group>
      ) : (
        <group position={[0, 0, 0.22]}>
          <Text position={[0, 0.25, 0]} fontSize={0.18} color="#7c2d12" fontWeight="900">I WANT...</Text>
          <Text position={[0, -0.1, 0]} fontSize={0.32} color={color} fontWeight="900" strokeWidth={0.02} strokeColor="#ffffff">
            {text}!
          </Text>
          {/* Small Icon of the color */}
          <mesh position={[0, -0.45, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}
    </group>
  );
};

function MachineReceiverCore({ position, rotation = [0, 0, 0], level, gameState, addPoint, removeBall }: ReceiverProps) {
  const targetColors = useMemo(() => getTargetColorsForLevel(level), [level]);
  const [targetColor, setTargetColor] = useState<BallColorCode>(() => pickRandomTarget(targetColors));
  const [flash, setFlash] = useState<'success' | 'error' | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const machineRef = useRef<THREE.Group>(null);
  const signRef = useRef<THREE.Group>(null);
  const targetLabel = useMemo(() => getBallColorLabel(targetColor).toUpperCase(), [targetColor]);
  const targetHex = useMemo(() => getHexColor(targetColor), [targetColor]);

  const leftPupilRef = useRef<THREE.Group>(null);
  const rightPupilRef = useRef<THREE.Group>(null);
  const leftEarRef = useRef<THREE.Group>(null);
  const rightEarRef = useRef<THREE.Group>(null);
  const leftPawRef = useRef<THREE.Group>(null);
  const rightPawRef = useRef<THREE.Group>(null);
  
  const [blink, setBlink] = useState(false);
  const blinkTimerRef = useRef<number>(0);
  const earTwitchTimerRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current);
        flashTimeoutRef.current = null;
      }
    };
  }, []);

  useFrame((state, delta) => {
    const elapsed = state.clock.elapsedTime;
    blinkTimerRef.current -= delta;
    if (blinkTimerRef.current <= 0) {
      if (blink) { setBlink(false); blinkTimerRef.current = 2 + Math.random() * 4; }
      else { setBlink(true); blinkTimerRef.current = 0.12; }
    }
    earTwitchTimerRef.current -= delta;
    if (earTwitchTimerRef.current <= 0) earTwitchTimerRef.current = 3 + Math.random() * 5;

    if (machineRef.current) {
      const breath = 1 + Math.sin(elapsed * 1.8) * 0.01;
      const munch = flash === 'success' ? 1 + Math.sin(elapsed * 30) * 0.12 : 1.0;
      const verticalMunch = flash === 'success' ? 0.85 + Math.sin(elapsed * 30) * 0.1 : 1.0;
      machineRef.current.scale.x = machineRef.current.scale.z = THREE.MathUtils.lerp(machineRef.current.scale.x, breath * munch, 0.15);
      machineRef.current.scale.y = THREE.MathUtils.lerp(machineRef.current.scale.y, breath * verticalMunch, 0.15);
      machineRef.current.position.y = position[1] + Math.sin(elapsed * 2.5) * 0.04;
    }
    if (leftEarRef.current && rightEarRef.current) {
      let tl=0.4, tr=-0.4;
      if (flash==='success') { tl=0.8+Math.sin(elapsed*40)*0.2; tr=-0.8-Math.sin(elapsed*40)*0.2; }
      else if (flash==='error') { tl=-0.6; tr=0.6; }
      else if (earTwitchTimerRef.current < 0.3) tl+=Math.sin(elapsed*20)*0.1;
      leftEarRef.current.rotation.z = THREE.MathUtils.lerp(leftEarRef.current.rotation.z, tl, 0.15);
      rightEarRef.current.rotation.z = THREE.MathUtils.lerp(rightEarRef.current.rotation.z, tr, 0.15);
    }
    if (leftPawRef.current && rightPawRef.current) {
      const ks = flash==='success' ? 20 : 2, ka = flash==='success' ? 0.15 : 0.02;
      leftPawRef.current.position.y = -0.8 + Math.sin(elapsed * ks) * ka;
      rightPawRef.current.position.y = -0.8 + Math.cos(elapsed * ks) * ka;
    }
    const targetLook = new THREE.Vector3(Math.sin(elapsed * 0.6) * 0.15, Math.cos(elapsed * 0.6) * 0.1, 0.8);
    const eyeCloseScale = blink || flash === 'error' ? 0.05 : 1.0;
    if (leftPupilRef.current) {
      leftPupilRef.current.scale.y = THREE.MathUtils.lerp(leftPupilRef.current.scale.y, eyeCloseScale, 0.3);
      leftPupilRef.current.position.x = THREE.MathUtils.lerp(leftPupilRef.current.position.x, targetLook.x * 0.1, 0.1);
      leftPupilRef.current.position.y = THREE.MathUtils.lerp(leftPupilRef.current.position.y, targetLook.y * 0.1, 0.1);
    }
    if (rightPupilRef.current) {
      rightPupilRef.current.scale.y = THREE.MathUtils.lerp(rightPupilRef.current.scale.y, eyeCloseScale, 0.3);
      rightPupilRef.current.position.x = THREE.MathUtils.lerp(rightPupilRef.current.position.x, targetLook.x * 0.1, 0.1);
      rightPupilRef.current.position.y = THREE.MathUtils.lerp(rightPupilRef.current.position.y, targetLook.y * 0.1, 0.1);
    }

    if (signRef.current) {
      // Magical Hovering Animation
      signRef.current.position.y = 3.6 + Math.sin(elapsed * 1.5) * 0.12;
      signRef.current.rotation.z = Math.sin(elapsed * 0.9) * 0.04;
    }
  });

  const chooseNextTarget = () => setTargetColor(pickRandomTarget(targetColors));

  const handleIntersect = (payload: IntersectionEnterPayload) => {
    if (gameState !== GameState.Playing) return;
    const otherObject = payload.other.rigidBodyObject as { userData?: ReceiverBallData } | undefined;
    const ballData = otherObject?.userData;
    if (ballData?.name === 'ball' && typeof ballData.color === 'number' && typeof ballData.id === 'string') {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      if (ballData.color === targetColor) { sfx.playSuccess(); setFlash('success'); addPoint(1); chooseNextTarget(); }
      else { sfx.playError(); setFlash('error'); addPoint(-1); }
      flashTimeoutRef.current = setTimeout(() => { setFlash(null); flashTimeoutRef.current = null; }, 1200);
      removeBall(ballData.id);
    }
  };

  return (
    <group ref={machineRef} position={position} rotation={rotation} userData={{ name: 'cat-feeder' }}>
      {/* Speech Bubble / Chat Bubble */}
      <group position={[1.8, 2.5, 0.6]}>
         <ChatBubble text={targetLabel} color={targetHex} flash={flash} />
      </group>

      <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
         <cylinderGeometry args={[2.2, 2.4, 0.8, 32]} /><meshStandardMaterial color="#b91c1c" roughness={1.0} />
         <mesh position={[0, 0.41, 0]}><torusGeometry args={[2.1, 0.08, 12, 48]} /><meshStandardMaterial color="#fbbf24" metalness={1} /></mesh>
      </mesh>
      <group position={[0, 0.4, 0]}>
        <mesh castShadow><sphereGeometry args={[1.85, 32, 32]} /><meshStandardMaterial color="#fdfcf0" roughness={0.4} /></mesh>
        <mesh position={[0, -0.6, 1.2]} scale={[1.2, 1.0, 0.4]}><sphereGeometry args={[1.5, 32, 32]} /><meshStandardMaterial color="#fff1f2" roughness={0.6} /></mesh>
        <group ref={leftPawRef} position={[-0.8, -0.8, 1.4]}><sphereGeometry args={[0.3, 16, 16]} scale={[1, 0.7, 1.2]} /><meshStandardMaterial color="#fdfcf0" /></group>
        <group ref={rightPawRef} position={[0.8, -0.8, 1.4]}><sphereGeometry args={[0.3, 16, 16]} scale={[1, 0.7, 1.2]} /><meshStandardMaterial color="#fdfcf0" /></group>
        <group position={[0, 0.6, 1.45]}>
          <group position={[-0.55, 0.2, 0]}>
            <mesh castShadow><sphereGeometry args={[0.55, 32, 32]} /><meshStandardMaterial color="#ffffff" roughness={0} /></mesh>
            <mesh position={[0, blink ? 0.4 : 0.5, 0.1]} visible={blink || flash !== null}><sphereGeometry args={[0.56, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#fdfcf0" /></mesh>
            <group ref={leftPupilRef} position={[0, 0, 0.52]}>{flash==='success' ? <HeartMesh scale={3} /> : <mesh scale={[1,1,0.1]}><sphereGeometry args={[0.32, 32,32]}/><meshStandardMaterial color="#020617"/></mesh>}<mesh position={[0.1, 0.1, 0.05]} visible={flash!=='success'}><sphereGeometry args={[0.12, 16, 16]}/><meshBasicMaterial color="#ffffff"/></mesh></group>
            {flash==='error' && <mesh position={[0, -0.2, 0.55]}><sphereGeometry args={[0.08, 16, 16]} scale={[1, 1.4, 0.6]} /><meshStandardMaterial color="#0ea5e9" transparent opacity={0.8} /></mesh>}
          </group>
          <group position={[0.55, 0.2, 0]}>
            <mesh castShadow><sphereGeometry args={[0.55, 32, 32]} /><meshStandardMaterial color="#ffffff" roughness={0} /></mesh>
            <mesh position={[0, blink ? 0.4 : 0.5, 0.1]} visible={blink || flash !== null}><sphereGeometry args={[0.56, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#fdfcf0" /></mesh>
            <group ref={rightPupilRef} position={[0, 0, 0.52]}>{flash==='success' ? <HeartMesh scale={3} /> : <mesh scale={[1,1,0.1]}><sphereGeometry args={[0.32, 32,32]}/><meshStandardMaterial color="#020617"/></mesh>}<mesh position={[0.1, 0.1, 0.05]} visible={flash!=='success'}><sphereGeometry args={[0.12, 16, 16]}/><meshBasicMaterial color="#ffffff"/></mesh></group>
          </group>
          <mesh position={[0, -0.1, 0.4]}><sphereGeometry args={[0.08, 16, 16]} scale={[1, 0.8, 0.6]} /><meshStandardMaterial color="#fb7185" /></mesh>
          <group position={[0, -0.28, 0.35]} rotation={[flash==='error' ? 1.0 : 0.4, 0, 0]}>
             {flash==='success' ? <mesh position={[0, 0.05, 0.05]}><sphereGeometry args={[0.12, 16, 16]} /><meshStandardMaterial color="#f43f5e" emissive="#f43f5e" /></mesh> : <><mesh position={[-0.08, 0, 0]}><torusGeometry args={[0.08, 0.02, 16, 32, Math.PI * 1.5]} /><meshStandardMaterial color="#fb7185" /></mesh><mesh position={[0.08, 0, 0]}><torusGeometry args={[0.08, 0.02, 16, 32, Math.PI * 1.5]} /><meshStandardMaterial color="#fb7185" /></mesh></>}
             {flash==='success' && <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 1.8, 0, 0]}><capsuleGeometry args={[0.1, 0.2, 4, 8]} /><meshStandardMaterial color="#f43f5e" /></mesh>}
          </group>
          <mesh position={[-0.8, -0.15, -0.2]} castShadow><sphereGeometry args={[0.4, 16, 16]} scale={[1, 0.8, 0.4]} /><meshStandardMaterial color={flash==='success' ? "#fb7185" : "#fecaca"} transparent opacity={0.6} /></mesh>
          <mesh position={[0.8, -0.15, -0.2]} castShadow><sphereGeometry args={[0.4, 16, 16]} scale={[1, 0.8, 0.4]} /><meshStandardMaterial color={flash==='success' ? "#fb7185" : "#fecaca"} transparent opacity={0.6} /></mesh>
        </group>
        <group ref={leftEarRef} position={[-1.1, 1.4, 0]} rotation={[0, 0, 0.4]}><mesh castShadow><sphereGeometry args={[0.5, 32, 32]} scale={[1,1.2,0.2]}/><meshStandardMaterial color="#fdfcf0"/></mesh><mesh position={[0, -0.1, 0.05]} scale={[0.7,0.8,0.2]}><sphereGeometry args={[0.4, 16, 16]}/><meshStandardMaterial color="#fecaca"/></mesh></group>
        <group ref={rightEarRef} position={[1.1, 1.4, 0]} rotation={[0, 0, -0.4]}><mesh castShadow><sphereGeometry args={[0.5, 32, 32]} scale={[1,1.2,0.2]}/><meshStandardMaterial color="#fdfcf0"/></mesh><mesh position={[0, -0.1, 0.05]} scale={[0.7,0.8,0.2]}><sphereGeometry args={[0.4, 16, 16]}/><meshStandardMaterial color="#fecaca"/></mesh></group>
      </group>
      <group position={[0, -0.1, 1.6]} rotation={[0.2, 0, 0]}><mesh rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[1.5, 0.18, 16, 48]}/><meshStandardMaterial color="#fbbf24" metalness={1} emissive={targetHex} emissiveIntensity={0.3}/></mesh><group position={[0, -1.0, 0.15]}><mesh castShadow><sphereGeometry args={[0.45, 32, 32]}/><meshStandardMaterial color={targetHex} emissive={targetHex} emissiveIntensity={0.8} metalness={1} roughness={0}/></mesh><Text position={[0, 0, 0.46]} fontSize={0.16} color="#451a03" fontWeight="900">{targetLabel}</Text></group></group>

      {/* --- UNIFIED FLOATING SIGNAGE (Overhead Step 3) --- */}
      <group ref={signRef} position={[0, 3.8, 0.4]} rotation={[0, 0, 0]}>
        <group position={[0, 0.1, 0.1]}>
          <RoundedBox args={[3.2, 1.4, 0.15]} radius={0.15} smoothness={4} castShadow>
             <meshStandardMaterial color="#7c2d12" roughness={0.8} />
          </RoundedBox>

          {/* Step Badge */}
          <group position={[-1.15, 0.4, 0.12]}>
            <mesh>
              <circleGeometry args={[0.25, 32]} />
              <meshStandardMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={0.5} />
            </mesh>
            <Text position={[0, 0, 0.02]} fontSize={0.25} color="#451a03" fontWeight="900">3</Text>
          </group>

          <Text position={[0.1, 0.4, 0.1]} fontSize={0.32} color="#fcd34d" fontWeight="900" anchorX="center">KITTEN FEAST 🐱</Text>
          <Text position={[0.1, 0.1, 0.1]} fontSize={0.20} color="#ffffff" fontWeight="bold" anchorX="center">SERVE THE GOURMET</Text>
          
          <mesh position={[0, -0.2, 0.1]}>
             <boxGeometry args={[2.5, 0.02, 0.01]} />
             <meshBasicMaterial color="#d6d3d1" />
          </mesh>
          <Text position={[0, -0.45, 0.1]} fontSize={0.14} color="#fdf4ff" fontWeight="800" maxWidth={2.6} textAlign="center">
             SERVE THE MIXED CANDY TO THE DUCHESS TO COMPLETE THE ORDER!
          </Text>
        </group>
      </group>

      <RigidBody type="fixed" colliders={false}><CuboidCollider args={[2.0, 2.0, 2.0]} position={[0, 0, 0]}/><CuboidCollider args={[2.0, 0.4, 2.0]} position={[0, -1.0, 0]}/></RigidBody>
      <RigidBody type="fixed" sensor colliders={false}><CuboidCollider args={[1.2, 0.8, 1.0]} position={[0, -0.2, 1.5]} onIntersectionEnter={handleIntersect}/></RigidBody>
    </group>
  );
}

export const MachineReceiver = ({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number]; }) => {
  const level = useGameStore((state) => state.level);
  const sceneSeed = useGameStore((state) => state.sceneSeed);
  const gameState = useGameStore((state) => state.gameState);
  const addPoint = useGameStore((state) => state.addPoint);
  const removeBall = useGameStore((state) => state.removeBall);
  return (
    <MachineReceiverCore key={`receiver-${sceneSeed}-${level}-${gameState}`} position={position} rotation={rotation} level={level} sceneSeed={sceneSeed} gameState={gameState} addPoint={addPoint} removeBall={removeBall} />
  );
};
