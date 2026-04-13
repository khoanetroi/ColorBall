import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RigidBody, RapierRigidBody, BallCollider } from '@react-three/rapier';
import { type BallColorCode, getHexColor } from '../store/ColorSystem';
import { useGameStore } from '../store/GameStore';

export const Ball = ({ color, position, id }: { color: BallColorCode; position: [number, number, number]; id: string }) => {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const ballMeshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const draggedBallId = useGameStore((state) => state.draggedBallId);
  const removeBall = useGameStore((state) => state.removeBall);
  const isCurrentlyDragged = draggedBallId === id;

  useEffect(() => {
    const timer = setTimeout(() => {
      // Don't despawn if the player is holding it
      if (!isCurrentlyDragged) {
        removeBall(id);
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [id, isCurrentlyDragged, removeBall]);

  useFrame((state, delta) => {
    if (isCurrentlyDragged && rigidBodyRef.current) {
      // Use (0,0) for center-view dragging in FPS
      const vec = new THREE.Vector3(0, 0, 0.5);
      vec.unproject(state.camera);
      vec.sub(state.camera.position).normalize();
      
      const distance = 4;
      const targetPos = new THREE.Vector3().copy(state.camera.position).add(vec.multiplyScalar(distance));
      
      const currentPos = rigidBodyRef.current.translation();
      const posVector = new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z);
      const diff = new THREE.Vector3().subVectors(targetPos, posVector);
      
      // Use dynamic velocity spring to pull ball towards target.
      // This allows Rapier to naturally handle wall collisions and prevent clipping.
      rigidBodyRef.current.setLinvel({
        x: diff.x * 12,
        y: diff.y * 12,
        z: diff.z * 12
      }, true);
      
      // Dampen rotation while holding
      rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }

    if (!ballMeshRef.current) {
      return;
    }

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
      <mesh
        ref={ballMeshRef}
        position={[0, 0.08, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color={getHexColor(color)}
          roughness={1.0}
          metalness={0.0}
        />

        {/* Blush / Cheek Details */}
        <mesh position={[0.12, 0.05, 0.26]} scale={0.4}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#fda4af" />
        </mesh>
        <mesh position={[-0.12, 0.05, 0.26]} scale={0.4}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#fda4af" />
        </mesh>

        {/* Left Ear */}
        <mesh position={[-0.18, 0.24, 0]} rotation={[0, 0, 0.3]}>
          <coneGeometry args={[0.12, 0.25, 16]} />
          <meshStandardMaterial color={getHexColor(color)} roughness={1.0} metalness={0.0} />
        </mesh>
        
        {/* Right Ear */}
        <mesh position={[0.18, 0.24, 0]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.12, 0.25, 16]} />
          <meshStandardMaterial color={getHexColor(color)} roughness={1.0} metalness={0.0} />
        </mesh>

        {/* Little Tail */}
        <mesh position={[0, -0.05, -0.28]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={1.0} metalness={0.0} />
        </mesh>
      </mesh>
    </RigidBody>
  );
};