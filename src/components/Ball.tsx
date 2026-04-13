import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RigidBody, RapierRigidBody, BallCollider } from '@react-three/rapier';
import { type BallColorCode, getHexColor } from '../store/ColorSystem';
import { useGameStore } from '../store/GameStore';
import { RoundedBox } from '@react-three/drei';

export const Ball = ({ color, position, id }: { color: BallColorCode; position: [number, number, number]; id: string }) => {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const ballMeshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  const draggedBallId = useGameStore((state) => state.draggedBallId);
  const removeBall = useGameStore((state) => state.removeBall);
  const isCurrentlyDragged = draggedBallId === id;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isCurrentlyDragged) {
        removeBall(id);
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [id, isCurrentlyDragged, removeBall]);

  useFrame((state, delta) => {
    if (isCurrentlyDragged && rigidBodyRef.current) {
      const vec = new THREE.Vector3(0, 0, 0.5);
      vec.unproject(state.camera);
      vec.sub(state.camera.position).normalize();
      
      const distance = 4;
      const targetPos = new THREE.Vector3().copy(state.camera.position).add(vec.multiplyScalar(distance));
      
      const currentPos = rigidBodyRef.current.translation();
      const posVector = new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z);
      const diff = new THREE.Vector3().subVectors(targetPos, posVector);
      
      rigidBodyRef.current.setLinvel({
        x: diff.x * 12,
        y: diff.y * 12,
        z: diff.z * 12
      }, true);
      
      rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }

    if (!ballMeshRef.current) return;

    const velocity = rigidBodyRef.current?.linvel();
    const speed = velocity ? Math.sqrt((velocity.x * velocity.x) + (velocity.y * velocity.y) + (velocity.z * velocity.z)) : 0;
    const squish = Math.min(speed * 0.02, 0.18);
    const hoverBoost = hovered || isCurrentlyDragged ? 0.08 : 0;
    const targetScaleX = 1 - (squish * 0.4) + (hoverBoost * 0.15);
    const targetScaleY = 1 + squish + hoverBoost;
    const targetScaleZ = targetScaleX;

    ballMeshRef.current.scale.x = THREE.MathUtils.damp(ballMeshRef.current.scale.x, targetScaleX, 12, delta);
    ballMeshRef.current.scale.y = THREE.MathUtils.damp(ballMeshRef.current.scale.y, targetScaleY, 12, delta);
    ballMeshRef.current.scale.z = THREE.MathUtils.damp(ballMeshRef.current.scale.z, targetScaleZ, 12, delta);
    ballMeshRef.current.rotation.y += delta * (hovered || isCurrentlyDragged ? 0.8 : 0.18);
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      colliders={false}
      mass={1}
      type="dynamic"
      gravityScale={isCurrentlyDragged ? 0 : 1}
      linearDamping={0.15}
      angularDamping={0.9}
      restitution={0.72}
      friction={0.35}
      userData={{ name: 'ball', color, id }}
    >
      <BallCollider args={[0.38]} />
      <group
        ref={ballMeshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Main Body */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial
            color={getHexColor(color)}
            roughness={0.2}
            metalness={0.0}
            emissive={getHexColor(color)}
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* --- KAWAII FACE --- */}
        <group position={[0, 0.05, 0.28]}>
          {/* Eyes */}
          <group position={[-0.14, 0, 0]}>
             <mesh rotation={[0.1, 0, 0]}>
                <sphereGeometry args={[0.07, 16, 16]} scale={[1, 1.2, 0.2]} />
                <meshStandardMaterial color="#020617" roughness={0} />
             </mesh>
             <mesh position={[0.02, 0.03, 0.02]}>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshBasicMaterial color="white" />
             </mesh>
             <mesh position={[-0.02, -0.02, 0.02]}>
                <sphereGeometry args={[0.012, 8, 8]} />
                <meshBasicMaterial color="white" />
             </mesh>
          </group>

          <group position={[0.14, 0, 0]}>
             <mesh rotation={[0.1, 0, 0]}>
                <sphereGeometry args={[0.07, 16, 16]} scale={[1, 1.2, 0.2]} />
                <meshStandardMaterial color="#020617" roughness={0} />
             </mesh>
             <mesh position={[0.02, 0.03, 0.02]}>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshBasicMaterial color="white" />
             </mesh>
             <mesh position={[-0.02, -0.02, 0.02]}>
                <sphereGeometry args={[0.012, 8, 8]} />
                <meshBasicMaterial color="white" />
             </mesh>
          </group>

          {/* :3 Mouth */}
          <group position={[0, -0.08, 0]}>
             <mesh position={[-0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[0.04, 0.012, 12, 24, Math.PI]} />
                <meshStandardMaterial color="#334155" />
             </mesh>
             <mesh position={[0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[0.04, 0.012, 12, 24, Math.PI]} />
                <meshStandardMaterial color="#334155" />
             </mesh>
          </group>
        </group>

        {/* Blush */}
        <mesh position={[0.2, -0.02, 0.24]} scale={0.4}>
          <sphereGeometry args={[0.1, 16, 16]} scale={[1, 0.6, 0.2]} />
          <meshBasicMaterial color="#fda4af" transparent opacity={0.6} />
        </mesh>
        <mesh position={[-0.2, -0.02, 0.24]} scale={0.4}>
          <sphereGeometry args={[0.1, 16, 16]} scale={[1, 0.6, 0.2]} />
          <meshBasicMaterial color="#fda4af" transparent opacity={0.6} />
        </mesh>

        {/* Ears */}
        <group position={[-0.18, 0.22, 0]} rotation={[0, 0, 0.4]}>
          <mesh castShadow>
             <sphereGeometry args={[0.15, 16, 16]} scale={[1, 1.2, 0.4]} />
             <meshStandardMaterial color={getHexColor(color)} roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.02, 0.05]} scale={[0.7, 0.8, 0.1]}>
             <sphereGeometry args={[0.12, 16, 16]} />
             <meshStandardMaterial color="#fecaca" />
          </mesh>
        </group>
        
        <group position={[0.18, 0.22, 0]} rotation={[0, 0, -0.4]}>
          <mesh castShadow>
             <sphereGeometry args={[0.15, 16, 16]} scale={[1, 1.2, 0.4]} />
             <meshStandardMaterial color={getHexColor(color)} roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.02, 0.05]} scale={[0.7, 0.8, 0.1]}>
             <sphereGeometry args={[0.12, 16, 16]} />
             <meshStandardMaterial color="#fecaca" />
          </mesh>
        </group>

        <mesh position={[0, -0.1, -0.28]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={1.0} metalness={0.0} />
        </mesh>
      </group>
    </RigidBody>
  );
};