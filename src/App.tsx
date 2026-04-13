import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Sky, Stars, Sparkles } from '@react-three/drei';
import { RigidBody, Physics, CuboidCollider } from '@react-three/rapier';
import { Ball } from './components/Ball';
import { BallSpawner } from './components/BallSpawner';
import { MachineMerger } from './components/MachineMerger';
import { MachineReceiver } from './components/MachineReceiver';
import { SceneDecor } from './components/SceneDecor';
import { WorldMenu } from './components/WorldMenu';
import { LevelProps } from './components/LevelProps';
import { GameState, useGameStore } from './store/GameStore';
import { FirstPersonControls } from './components/FirstPersonControls';
import { InteractionSystem } from './components/InteractionSystem';

function GameClock() {
  const tick = useGameStore((state) => state.tick);

  useFrame((_, delta) => {
    tick(delta);
  });

  return null;
}

function VRSessionController({ requestId }: { requestId: number }) {
  const { gl } = useThree();

  useEffect(() => {
    if (requestId === 0) {
      return;
    }

    let cancelled = false;

    const openVR = async () => {
      if (typeof navigator === 'undefined' || !('xr' in navigator) || !window.isSecureContext) {
        return;
      }

      const xr = (navigator as Navigator & {
        xr?: {
          requestSession: (mode: 'immersive-vr', options?: XRSessionInit) => Promise<XRSession>;
        };
      }).xr;

      if (!xr || gl.xr.isPresenting) {
        return;
      }

      try {
        const session = await xr.requestSession('immersive-vr', {
          optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'layers'],
        });

        if (cancelled) {
          await session.end();
          return;
        }

        gl.xr.enabled = true;
        session.addEventListener(
          'end',
          () => {
            gl.xr.enabled = false;
          },
          { once: true }
        );
        void gl.xr.setSession(session);
      } catch (error) {
        console.error('Unable to open VR session', error);
        gl.xr.enabled = false;
      }
    };

    void openVR();

    return () => {
      cancelled = true;
    };
  }, [gl, requestId]);

  return null;
}

function EnvironmentParticles() {
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 40; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 45,
          Math.random() * 12 + 1,
          (Math.random() - 0.5) * 45,
        ] as [number, number, number],
        speed: Math.random() * 0.2 + 0.1,
        offset: Math.random() * Math.PI * 2,
      });
    }
    return temp;
  }, []);

  return (
    <group>
      {particles.map((p, i) => (
        <Firefly key={i} {...p} />
      ))}
    </group>
  );
}

function Firefly({ position, speed, offset }: { position: [number, number, number]; speed: number; offset: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed + offset;
    ref.current.position.y = position[1] + Math.sin(t) * 1.5;
    ref.current.position.x = position[0] + Math.cos(t * 0.5) * 2;
  });

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color="#fff4d6" emissive="#ffd666" emissiveIntensity={2} transparent opacity={0.8} />
      </mesh>
      <pointLight intensity={0.15} distance={2} color="#ffd666" />
    </group>
  );
}

function FloatingIsland() {
  return (
    <group>
      {/* Main Island Body */}
      <RigidBody type="fixed" colliders={false} position={[0, -2, 0]}>
        {/* Grass Top Layers - Lush Farm Tiers */}
        <RoundedBox args={[42, 4, 42]} radius={1.4} smoothness={8} receiveShadow position={[0, 0, 0]}>
          <meshStandardMaterial color="#34d399" roughness={1} />
        </RoundedBox>
        

        {/* Dirt/Rock Base - Warm Rich Earth */}
        <RoundedBox args={[39, 3.8, 39]} radius={1.5} smoothness={4} position={[0, -2.5, 0]}>
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </RoundedBox>
        
        {/* Bottom Rock Tip */}
        <mesh position={[0, -5.5, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[18, 6, 6]} />
          <meshStandardMaterial color="#451a03" roughness={0.9} />
        </mesh>

        <CuboidCollider args={[21, 2, 21]} position={[0, 0, 0]} />
      </RigidBody>

      {/* Decorative Floating Rocks */}
      <group position={[-25, -4, -15]} scale={0.6}>
        <RoundedBox args={[8, 6, 8]} radius={2} smoothness={4}>
          <meshStandardMaterial color="#78350f" />
        </RoundedBox>
        <RoundedBox args={[7, 1, 7]} radius={1} smoothness={4} position={[0, 3, 0]}>
          <meshStandardMaterial color="#34d399" />
        </RoundedBox>
      </group>
    </group>
  );
}

function GlobalEnvironment() {
  return (
    <>
      <ambientLight intensity={1.2} color="#fdba74" />
      <hemisphereLight color="#fb923c" groundColor="#78350f" intensity={1.0} />
      
      <directionalLight 
        position={[35, 45, 25]} 
        intensity={4.5} 
        color="#fff7ed" 
        castShadow 
        shadow-mapSize={[4096, 4096]}
        shadow-bias={-0.0001}
        shadow-normalBias={0.04}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-camera-near={0.1}
        shadow-camera-far={180}
      />
      
      <pointLight position={[0, 15, 0]} intensity={1.2} color="#ffedd5" distance={60} />
      
      <Sky 
        sunPosition={[100, 15, 100]} 
        turbidity={10} 
        rayleigh={4} 
        mieCoefficient={0.005} 
        mieDirectionalG={0.8} 
      />
      
      <Stars radius={100} depth={50} count={1000} factor={4} saturation={1} fade speed={1.5} />
      <Sparkles count={300} scale={50} size={4} speed={0.4} opacity={0.6} color="#fcd34d" position={[0, 6, 0]} />

      <EnvironmentParticles />
    </>
  );
}







type GameHUDProps = {
  onOpenVR: () => void;
};

function GameHUD({ onOpenVR }: GameHUDProps) {
  const score = useGameStore((state) => state.score);
  const targetScore = useGameStore((state) => state.targetScore);
  const timeLeft = useGameStore((state) => state.timeLeft);
  const objective = useGameStore((state) => state.objective);
  const combo = useGameStore((state) => state.combo);
  const bestCombo = useGameStore((state) => state.bestCombo);
  const gameState = useGameStore((state) => state.gameState);
  const level = useGameStore((state) => state.level);
  
  const startTutorial = useGameStore((state) => state.startTutorial);
  const startLevel = useGameStore((state) => state.startLevel);
  const advanceLevel = useGameStore((state) => state.advanceLevel);
  const resetGame = useGameStore((state) => state.resetGame);
  const requestCandyDispense = useGameStore((state) => state.requestCandyDispense);

  const timeLabel = useMemo(() => {
    if (timeLeft <= 0) {
      return '∞';
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = Math.floor(timeLeft % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  const statusLabel =
    gameState === GameState.Victory ? 'Stage Cleared' : gameState === GameState.GameOver ? 'Time Out' : 'In Play';

  const statusDotClass =
    gameState === GameState.Victory
      ? 'hud-dot hud-dot--good'
      : gameState === GameState.GameOver
        ? 'hud-dot hud-dot--bad'
        : 'hud-dot';

  return (
    <>
      <div className="hud">
        <div className="hud-panel hud-panel--compact hud-panel--hero">
            <p className="hud-kicker">Harvest Yard</p>
            <p className="hud-title">Color Farm</p>
            <p className="hud-lead">Sort feed, mix colors, and keep the coop running.</p>
          <div className="hud-stats">
            <div className="hud-stat hud-stat--stage">
              <span className="hud-stat-label">Stage</span>
              <span className="hud-stat-value">{level === 0 ? 'Tutorial' : `L${level}`}</span>
            </div>
            <div className="hud-stat hud-stat--score">
              <span className="hud-stat-label">Candy</span>
              <span className="hud-stat-value">
                {score} / {targetScore}
              </span>
            </div>
            <div className="hud-stat hud-stat--combo">
              <span className="hud-stat-label">Streak</span>
              <span className="hud-stat-value">{combo > 0 ? `x${combo}` : '—'}</span>
              <span className="hud-stat-subvalue">Best x{bestCombo}</span>
            </div>
            <div className="hud-stat hud-stat--time">
              <span className="hud-stat-label">Clock</span>
              <span className="hud-stat-value">{timeLabel}</span>
            </div>
          </div>
          <div className="hud-meter">
            <span style={{ width: `${combo === 0 ? 0 : ((((combo - 1) % 3) + 1) / 3) * 100}%` }} />
          </div>
          <p className="hud-objective">{objective}</p>
          <div className="hud-status">
            <span className={statusDotClass} />
            <span>{statusLabel}</span>
          </div>
        </div>

        <div className="hud-panel hud-panel--actions">
          <p className="hud-kicker">Barn Board</p>
          <p className="hud-title hud-title--small">Field Controls</p>
          <p className="hud-help">Switch fields, drop feed, or restart the run.</p>
          <div className="hud-actions">
            <span className="hud-badge">Playground Mode</span>
            <button className="hud-button hud-button--primary" type="button" onClick={onOpenVR}>
              Open VR
            </button>
            <button className="hud-button hud-button--ghost" type="button" onClick={() => startTutorial()}>
              Tutorial
            </button>
            <button className="hud-button hud-button--ghost" type="button" onClick={() => startLevel(1)}>
              Field 1
            </button>
            <button className="hud-button hud-button--ghost" type="button" onClick={() => startLevel(2)}>
              Field 2
            </button>
            <button className="hud-button hud-button--ghost" type="button" onClick={() => startLevel(3)}>
              Field 3
            </button>
            <button className="hud-button hud-button--ghost" type="button" onClick={() => advanceLevel()}>
              Next Field
            </button>
            <button className="hud-button hud-button--primary" type="button" onClick={() => requestCandyDispense()}>
              Drop Feed
            </button>
            <button className="hud-button hud-button--danger" type="button" onClick={() => resetGame()}>
              Restart
            </button>
          </div>
        </div>
      </div>

      {gameState === GameState.Victory && level < 3 && (
        <div className="overlay overlay--victory">
          <div className="overlay-content">
            <h1 className="overlay-title">FIELD COMPLETE</h1>
            <p className="overlay-subtitle">The farm is running smooth. Move on to the next field.</p>
            <div className="overlay-actions">
              <button className="hud-button" type="button" onClick={() => advanceLevel()}>
                Next Stage
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === GameState.Victory && level >= 3 && (
        <div className="overlay overlay--victory">
          <div className="overlay-content">
            <h1 className="overlay-title">HARVEST COMPLETE</h1>
            <p className="overlay-subtitle">You cleared every field and kept the farm in motion.</p>
            <div className="overlay-actions">
              <button className="hud-button" type="button" onClick={() => resetGame()}>
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === GameState.GameOver && (
        <div className="overlay overlay--gameover">
          <div className="overlay-content">
            <h1 className="overlay-title">BARN PAUSED</h1>
            <p className="overlay-subtitle">The timer drained before the coop hit the target.</p>
            <div className="overlay-actions">
              <button className="hud-button hud-button--danger" type="button" onClick={() => resetGame()}>
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  const balls = useGameStore((state) => state.balls);
  const [vrRequestId, setVrRequestId] = useState(0);

  const handleOpenVR = () => {
    if (typeof window === 'undefined' || !window.isSecureContext || !('xr' in navigator)) {
      window.alert('VR mode needs a secure browser with WebXR support.');
      return;
    }

    setVrRequestId((value) => value + 1);
  };

  return (
    <div className="app-shell">
      <div className="crosshair"></div>
      <GameHUD onOpenVR={handleOpenVR} />

      <Canvas
        className="canvas-shell"
        camera={{ position: [0, 5, 12], fov: 60, near: 0.1, far: 500 }}
        dpr={[1, 1.75]}
        shadows
      >
        <color attach="background" args={['#d8ecff']} />
        <fog attach="fog" args={['#d8ecff', 30, 120]} />
        <VRSessionController requestId={vrRequestId} />
        <GameClock />
        
          <WorldMenu />

          <Suspense fallback={null}>
            <Physics gravity={[0, -9.81, 0]} timeStep={1 / 60}>
              <InteractionSystem />
              <FirstPersonControls />
              
              <GlobalEnvironment />
              <FloatingIsland />

              <SceneDecor />
              <LevelProps />

              {/* Machine Placements on the Island */}
              <MachineReceiver position={[10, 0.45, -6]} rotation={[0, -Math.PI / 4, 0]} />
              <MachineMerger position={[0, 1.05, -12]} />
              <BallSpawner position={[-10, 0.45, -6]} rotation={[0, Math.PI / 4, 0]} />

              {balls.map((ball) => (
                <Ball key={ball.id} color={ball.color} position={ball.position} id={ball.id} />
              ))}

            </Physics>
          </Suspense>

      </Canvas>
    </div>
  );
}
