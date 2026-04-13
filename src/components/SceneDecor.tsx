import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';

export function SceneDecor() {
  return (
    <group>
      {/* Background Props on the Island Edges */}
      <RoyalBarn position={[-16, 0.05, -15]} scale={1.2} rotation={[0, 0.4, 0]} />
      <RoyalSilo position={[16, 0.05, -14]} scale={1.3} />
      
      {/* Cliff-side Windmill */}
      <HighFidelityWindmill position={[20, 0, 8]} scale={1.5} rotation={[0, -0.6, 0]} />
      
      {/* Puffy Ghibli Trees */}
      <GhibliTree position={[-18, 0, 10]} scale={2.2} />
      <GhibliTree position={[-14, 0, 14]} scale={1.8} />
      <GhibliTree position={[15, 0, 12]} scale={1.9} />
      <GhibliTree position={[-20, 0, -5]} scale={2.5} />
      <GhibliTree position={[22, 0, -10]} scale={2.0} />

      {/* Farm Scarecrow */}
      <FarmScarecrow position={[-6, 0.6, -10]} scale={1.2} rotation={[0, 0.4, 0]} />
      <FarmScarecrow position={[14, 0.6, 6]} scale={1.0} rotation={[0, -0.6, 0]} />

      {/* Floating Low-Poly Clouds */}
      <FloatingCloud position={[-12, 12, -15]} scale={1.5} speed={0.4} />
      <FloatingCloud position={[10, 15, -20]} scale={2.0} speed={0.3} />
      <FloatingCloud position={[18, 10, 5]} scale={1.2} speed={0.5} />
      <FloatingCloud position={[-18, 14, 8]} scale={1.8} speed={0.35} />

      {/* Scattered Hay Bales */}
      <HayBale position={[-8, 0.1, 8]} scale={1.2} rotation={[0, 0.5, 0]} />
      <HayBale position={[-6, 0.1, 7]} scale={1.0} rotation={[0, -0.2, 0]} />
      <HayBale position={[12, 0.1, -10]} scale={1.3} rotation={[0, 0.8, 0]} />
      <HayBale position={[14, 0.1, -11]} scale={1.1} rotation={[0, -0.4, 0]} />

      {/* Sunflowers & Daisies clusters */}
      <FlowerCluster position={[-12, 0.1, -4]} type="sunflower" count={5} />
      <FlowerCluster position={[12, 0.1, -2]} type="daisy" count={8} />
      <FlowerCluster position={[18, 0.1, 10]} type="sunflower" count={4} />

      {/* White Picket Fences */}
      <PicketFence position={[-10, 0, -4]} rotation={Math.PI / 4} length={3} />
      <PicketFence position={[10, 0, -4]} rotation={-Math.PI / 4} length={3} />
      <PicketFence position={[0, 0, -15]} rotation={0} length={6} />
      <PicketFence position={[-18, 0, 0]} rotation={Math.PI / 2} length={5} />
      <PicketFence position={[18, 0, 0]} rotation={Math.PI / 2} length={5} />

      {/* Butterfly Particles */}
      <ButterflySwarm position={[0, 2, 0]} count={12} />
      
      {/* Guidance Paths (Polished with soft pulse) */}
      <GuidancePath start={[-10, -6]} end={[0, -11]} color="#fcd34d" segments={6} />
      <GuidancePath start={[0, -11]} end={[10, -6]} color="#fbbf24" segments={6} />
    </group>
  );
}

function HeartShape({ color = "#f43f5e", scale = 1 }) {
  return (
    <group scale={scale}>
      <mesh position={[-0.1, 0.1, 0]}><sphereGeometry args={[0.12, 16, 16]} /><meshStandardMaterial color={color} /></mesh>
      <mesh position={[0.1, 0.1, 0]}><sphereGeometry args={[0.12, 16, 16]} /><meshStandardMaterial color={color} /></mesh>
      <mesh position={[0, -0.05, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.16, 0.3, 16]} /><meshStandardMaterial color={color} /></mesh>
    </group>
  );
}

function RoyalBarn({ position, scale = 1, rotation = [0, 0, 0] }: any) {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      {/* Main Structure with Planks */}
      <RoundedBox args={[5, 2.8, 3.5]} radius={0.2} smoothness={4} castShadow receiveShadow>
         <meshStandardMaterial color="#b45309" roughness={0.8} />
      </RoundedBox>
      <mesh position={[0, 0, 1.76]}>
         <boxGeometry args={[4.8, 2.6, 0.05]} />
         <meshStandardMaterial color="#92400e" roughness={0.9} />
      </mesh>
      {/* Roof with Overhangs */}
      <group position={[0, 1.4, 0]}>
         <mesh rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[3.2, 1.8, 4]} />
            <meshStandardMaterial color="#451a03" roughness={0.7} />
         </mesh>
         <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[3.3, 1.85, 4]} />
            <meshStandardMaterial color="#451a03" wireframe opacity={0.1} transparent />
         </mesh>
      </group>
      {/* Barn Door with "X" detail */}
      <group position={[0, -0.4, 1.78]}>
         <mesh>
            <boxGeometry args={[1.8, 2.0, 0.1]} />
            <meshStandardMaterial color="#fef3c7" />
         </mesh>
         <mesh rotation={[0, 0, 0.6]}><boxGeometry args={[0.1, 2.4, 0.12]} /><meshStandardMaterial color="#b45309" /></mesh>
         <mesh rotation={[0, 0, -0.6]}><boxGeometry args={[0.1, 2.4, 0.12]} /><meshStandardMaterial color="#b45309" /></mesh>
      </group>
      {/* Attic Windows */}
      <group position={[0, 1.2, 1.8]}>
         <HeartShape scale={2.5} color="#ffffff" />
      </group>
      {/* Side Windows */}
      <mesh position={[-2.6, 0.4, 0]} rotation={[0, Math.PI/2, 0]}>
         <boxGeometry args={[1.2, 1.2, 0.1]} />
         <meshStandardMaterial color="#fef3c7" />
      </mesh>
      <mesh position={[2.6, 0.4, 0]} rotation={[0, -Math.PI/2, 0]}>
         <boxGeometry args={[1.2, 1.2, 0.1]} />
         <meshStandardMaterial color="#fef3c7" />
      </mesh>
    </group>
  );
}

function RoyalSilo({ position, scale = 1 }: any) {
  return (
    <group position={position} scale={scale}>
      {/* Silo Body with Metal Texture */}
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
         <cylinderGeometry args={[1.4, 1.5, 4.0, 12]} />
         <meshStandardMaterial color="#d1d5db" metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Paneled Details */}
      {[0, 1, 2, 3].map(i => (
        <mesh key={i} position={[0, i * 1.0, 0]} rotation={[0, 0, 0]}>
           <torusGeometry args={[1.42, 0.05, 8, 32]} />
           <meshStandardMaterial color="#9ca3af" />
        </mesh>
      ))}
      {/* Dome Cap */}
      <mesh position={[0, 4.0, 0]} castShadow>
         <sphereGeometry args={[1.45, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
         <meshStandardMaterial color="#d97706" roughness={0.4} />
      </mesh>
      {/* Ladder */}
      <group position={[0.7, 1.8, 1.25]} rotation={[0, 0.2, 0]}>
         {[0,1,2,3,4,5,6].map(i => (
           <mesh key={i} position={[0, i * 0.4, 0]}><boxGeometry args={[0.4, 0.04, 0.04]} /><meshStandardMaterial color="#4b5563" /></mesh>
         ))}
      </group>
    </group>
  );
}

function GhibliTree({ position, scale = 1 }: any) {
  return (
    <group position={position} scale={scale}>
      {/* Textured Trunk */}
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
         <cylinderGeometry args={[0.15, 0.3, 1.6, 8]} />
         <meshStandardMaterial color="#451a03" roughness={1.0} />
      </mesh>
      {/* Layered Puffy Leaves */}
      <group position={[0, 1.8, 0]}>
         <RoundedBox args={[1.2, 1.2, 1.2]} radius={0.5} smoothness={4} castShadow>
            <meshStandardMaterial color="#34d399" roughness={1.0} />
         </RoundedBox>
         <RoundedBox args={[1.0, 1.0, 1.0]} radius={0.4} smoothness={4} position={[0.4, 0.6, 0.2]} castShadow>
            <meshStandardMaterial color="#6ee7b7" roughness={1.0} />
         </RoundedBox>
         <RoundedBox args={[0.9, 0.9, 0.9]} radius={0.4} smoothness={4} position={[-0.4, 0.4, -0.3]} castShadow>
            <meshStandardMaterial color="#059669" roughness={1.0} />
         </RoundedBox>
         {/* Tiny Red Apples */}
         {[0,1,2].map(i => (
            <mesh key={i} position={[Math.sin(i*2)*0.6, Math.cos(i*2)*0.6, 0.5]}><sphereGeometry args={[0.08, 8, 8]} /><meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={0.5} /></mesh>
         ))}
      </group>
    </group>
  );
}

function FloatingCloud({ position, scale = 1, speed = 1 }: any) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * speed * 0.2) * 3;
      ref.current.position.z = position[2] + Math.cos(state.clock.elapsedTime * speed * 0.2) * 2;
      ref.current.scale.setScalar(scale + Math.sin(state.clock.elapsedTime * 0.5) * 0.05);
    }
  });
  return (
    <group ref={ref} position={position}>
       <mesh castShadow><sphereGeometry args={[1, 16, 16]} scale={[1.2, 0.8, 1]} /><meshStandardMaterial color="white" transparent opacity={0.8} depthWrite={false} /></mesh>
       <mesh position={[0.8, -0.2, 0]} castShadow><sphereGeometry args={[0.7, 16, 16]} /><meshStandardMaterial color="white" transparent opacity={0.8} depthWrite={false} /></mesh>
       <mesh position={[-0.7, -0.1, 0.2]} castShadow><sphereGeometry args={[0.8, 16, 16]} /><meshStandardMaterial color="white" transparent opacity={0.8} depthWrite={false} /></mesh>
    </group>
  );
}

function FlowerCluster({ position, type = 'sunflower', count = 4 }: any) {
  return (
    <group position={position}>
      {Array.from({ length: count }).map((_, i) => (
        <group key={i} position={[Math.sin(i * 3) * 1.2, 0, Math.cos(i * 3) * 1.2]} scale={0.5 + Math.random() * 0.5}>
           <mesh position={[0, 0.4, 0]} castShadow><cylinderGeometry args={[0.02, 0.03, 0.8, 8]} /><meshStandardMaterial color="#065f46" /></mesh>
           <group position={[0, 0.8, 0]} rotation={[0.4, 0, 0]}>
              {type === 'sunflower' ? (
                <>
                  <mesh><circleGeometry args={[0.3, 16]} /><meshStandardMaterial color="#fcd34d" /></mesh>
                  <mesh position={[0,0,0.01]}><circleGeometry args={[0.12, 16]} /><meshStandardMaterial color="#451a03" /></mesh>
                </>
              ) : (
                <>
                  <mesh><circleGeometry args={[0.2, 16]} /><meshStandardMaterial color="white" /></mesh>
                  <mesh position={[0,0,0.01]}><circleGeometry args={[0.06, 16]} /><meshStandardMaterial color="yellow" /></mesh>
                </>
              )}
           </group>
        </group>
      ))}
    </group>
  );
}

function HighFidelityWindmill({ position, scale = 1, rotation = [0, 0, 0] }: any) {
  const bladesRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.z = state.clock.elapsedTime * 0.8;
    }
  });

  return (
    <group position={position} scale={scale} rotation={rotation}>
      {/* Windmill Base */}
      <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
         <cylinderGeometry args={[0.5, 0.8, 3.6, 8]} />
         <meshStandardMaterial color="#d9d2bf" />
      </mesh>
      {/* Roof Cap */}
      <mesh position={[0, 3.6, 0]} castShadow>
         <coneGeometry args={[0.9, 0.8, 8]} />
         <meshStandardMaterial color="#8b5e34" />
      </mesh>
      {/* Blades */}
      <group position={[0, 3.2, 0.8]} ref={bladesRef}>
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
          <mesh key={i} rotation={[0, 0, angle]}>
            <group position={[0, 1.4, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.2, 2.5, 0.05]} />
                <meshStandardMaterial color="#fef3c7" />
              </mesh>
              {/* Blade Lattice */}
              {[0.5, 1.0, 1.5, 2.0].map(j => (
                <mesh key={j} position={[0, j - 1.25, 0]}><boxGeometry args={[0.6, 0.04, 0.02]} /><meshStandardMaterial color="#d97706" opacity={0.6} transparent /></mesh>
              ))}
            </group>
          </mesh>
        ))}
      </group>
    </group>
  );
}

function PicketFence({ position, rotation, length }: any) {
  const segments = Math.floor(length * 2.5);
  const spacing = 0.4;
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {Array.from({ length: segments }).map((_, i) => (
        <group key={i} position={[i * spacing - (length / 2), 0, 0]}>
           <mesh position={[0, 0.4, 0]} castShadow receiveShadow><boxGeometry args={[0.08, 0.8, 0.02]} /><meshStandardMaterial color="#f8fafc" /></mesh>
           <group position={[0, 0.8, 0]} rotation={[0, 0, Math.PI / 4]}><mesh><boxGeometry args={[0.06, 0.06, 0.03]} /><meshStandardMaterial color="#f8fafc" /></mesh></group>
        </group>
      ))}
      <mesh position={[0, 0.55, 0]}><boxGeometry args={[length, 0.04, 0.03]} /><meshStandardMaterial color="#f8fafc" /></mesh>
      <mesh position={[0, 0.3, 0]}><boxGeometry args={[length, 0.04, 0.03]} /><meshStandardMaterial color="#f8fafc" /></mesh>
    </group>
  );
}

function ButterflySwarm({ position, count }: any) {
  return (
    <group position={position}>
      {Array.from({ length: count }).map((_, i) => <Butterfly key={i} delay={i * 0.5} />)}
    </group>
  );
}

function Butterfly({ delay }: any) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime + delay;
      ref.current.position.x = Math.sin(t * 0.5) * 6;
      ref.current.position.y = 2 + Math.sin(t * 1.5) * 2;
      ref.current.position.z = Math.cos(t * 0.4) * 6;
      ref.current.rotation.y = t * 0.5;
      ref.current.children[0].rotation.z = Math.sin(t * 15) * 0.8;
      ref.current.children[1].rotation.z = -Math.sin(t * 15) * 0.8;
    }
  });
  const color = ["#f472b6", "#60a5fa", "#fbbf24"][Math.floor(Math.random()*3)];
  return (
    <group ref={ref}>
       <mesh position={[0.12, 0, 0]} rotation={[0, 0, 0]}><boxGeometry args={[0.2, 0.15, 0.02]} /><meshStandardMaterial color={color} side={THREE.DoubleSide} /></mesh>
       <mesh position={[-0.12, 0, 0]} rotation={[0, 0, 0]}><boxGeometry args={[0.2, 0.15, 0.02]} /><meshStandardMaterial color={color} side={THREE.DoubleSide} /></mesh>
    </group>
  );
}

function HayBale({ position, scale = 1, rotation = [0, 0, 0] }: any) {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      <RoundedBox args={[1.4, 0.7, 1.0]} radius={0.2} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color="#fbbf24" roughness={1.0} />
      </RoundedBox>
      <mesh position={[0.3, 0, 0]}><boxGeometry args={[0.05, 0.72, 1.05]} /><meshStandardMaterial color="#b45309" /></mesh>
      <mesh position={[-0.3, 0, 0]}><boxGeometry args={[0.05, 0.72, 1.05]} /><meshStandardMaterial color="#b45309" /></mesh>
    </group>
  );
}

function GuidancePath({ start, end, color = "#fcd34d", segments = 8 }: { start: [number, number], end: [number, number], color?: string, segments?: number }) {
  const points = useMemo(() => {
    const temp = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      temp.push([start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t] as [number, number]);
    }
    return temp;
  }, [start, end, segments]);

  return (
    <group>
      {points.map((p, i) => (
        <PathMarker key={i} position={[p[0], 0.05, p[1]]} color={color} delay={i * 0.3} />
      ))}
    </group>
  );
}

function PathMarker({ position, color, delay }: { position: [number, number, number], color: string, delay: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      const t = (state.clock.elapsedTime + delay) % 3;
      const pulse = Math.sin((t / 3) * Math.PI);
      ref.current.scale.set(pulse * 0.8, pulse * 0.8, pulse * 0.8);
      if (ref.current.material instanceof THREE.MeshStandardMaterial) {
        ref.current.material.opacity = pulse * 0.4;
      }
    }
  });

  return (
    <group position={position}>
      {/* Dirt Path Marker */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35, 16]} />
        <meshStandardMaterial color="#92400e" roughness={1.0} />
      </mesh>
      {/* Soft Glow Pulse */}
      <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.3, 32]} />
        <meshStandardMaterial color={color} transparent emissive={color} emissiveIntensity={1} depthWrite={false} />
      </mesh>
    </group>
  );
}

function FarmScarecrow({ position, scale = 1, rotation = [0,0,0] }: any) {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.08, 0.1, 1.2, 8]} />
        <meshStandardMaterial color="#8b5e34" />
      </mesh>
      <group position={[0, 1.2, 0]}>
        <RoundedBox args={[0.8, 0.15, 0.12]} radius={0.05} smoothness={4} castShadow>
           <meshStandardMaterial color="#fcd34d" />
        </RoundedBox>
        {/* Head */}
        <mesh position={[0, 0.3, 0]} castShadow>
           <sphereGeometry args={[0.25, 16, 16]} />
           <meshStandardMaterial color="#fef3c7" />
        </mesh>
        {/* Hat */}
        <mesh position={[0, 0.55, 0]} castShadow>
           <coneGeometry args={[0.35, 0.4, 4]} />
           <meshStandardMaterial color="#92400e" />
        </mesh>
        {/* Arms */}
        <mesh position={[-0.4, 0, 0]} rotation={[0, 0, 0.4]}><boxGeometry args={[0.1, 0.6, 0.05]} /><meshStandardMaterial color="#fcd34d" /></mesh>
        <mesh position={[0.4, 0, 0]} rotation={[0, 0, -0.4]}><boxGeometry args={[0.1, 0.6, 0.05]} /><meshStandardMaterial color="#fcd34d" /></mesh>
      </group>
    </group>
  );
}
