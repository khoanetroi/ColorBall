import { useRef, useState, useEffect, useCallback, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RigidBody, RapierRigidBody, BallCollider } from '@react-three/rapier';
import { QuadraticBezierLine, type QuadraticBezierLineRef } from '@react-three/drei';
import { type BallColorCode, getHexColor } from '../store/ColorSystem';
import { useGameStore } from '../store/GameStore';

const GRAB_SHELL_RADIUS = 0.68;
const GRAB_DISTANCE_BIAS = 0.15;
const GRAB_SPRING_STRENGTH = 16;
const LINE_SAG_BASE = 0.12;
const LINE_WOBBLE_BASE = 0.08;

type GrabLineProps = {
  active: boolean;
  ballId: string;
  ballRef: RefObject<RapierRigidBody | null>;
  color: string;
};

function GrabLine({ active, ballId, ballRef, color }: GrabLineProps) {
  const dragPointer = useGameStore((state) => state.dragPointer);
  const lineRef = useRef<QuadraticBezierLineRef>(null);
  const startRef = useRef(new THREE.Vector3());
  const endRef = useRef(new THREE.Vector3());
  const midRef = useRef(new THREE.Vector3());
  const sideRef = useRef(new THREE.Vector3(1, 0, 0));
  const wobbleSeed = useRef(ballId.split('').reduce((accumulator, char) => accumulator + char.charCodeAt(0), 0));

  useFrame((state, delta) => {
    if (!active || !dragPointer || !ballRef.current || !lineRef.current) {
      return;
    }

    startRef.current.set(dragPointer.origin[0], dragPointer.origin[1], dragPointer.origin[2]);

    const currentBall = ballRef.current.translation();
    endRef.current.set(currentBall.x, currentBall.y, currentBall.z);

    const direction = endRef.current.clone().sub(startRef.current);
    const distance = direction.length();

    if (distance > 0.0001) {
      direction.normalize();
    } else {
      direction.set(0, 1, 0);
    }

    sideRef.current.crossVectors(direction, new THREE.Vector3(0, 1, 0));
    if (sideRef.current.lengthSq() < 0.0001) {
      sideRef.current.set(1, 0, 0);
    } else {
      sideRef.current.normalize();
    }

    const targetMid = startRef.current.clone().add(endRef.current).multiplyScalar(0.5);
    const sagAmount = LINE_SAG_BASE + Math.min(0.65, distance * 0.18);
    const wobbleAmount = LINE_WOBBLE_BASE + Math.min(0.1, distance * 0.03);
    const wobblePhase = state.clock.elapsedTime * 18 + wobbleSeed.current;

    targetMid.addScaledVector(new THREE.Vector3(0, -1, 0), sagAmount);
    targetMid.addScaledVector(sideRef.current, Math.sin(wobblePhase) * wobbleAmount);
    targetMid.addScaledVector(direction, Math.sin(wobblePhase * 0.7) * wobbleAmount * 0.2);

    midRef.current.lerp(targetMid, 1 - Math.exp(-delta * 18));
    lineRef.current.setPoints(startRef.current, endRef.current, midRef.current);
  });

  if (!active || !dragPointer) {
    return null;
  }

  return (
    <QuadraticBezierLine
      ref={lineRef}
      start={dragPointer.origin}
      end={dragPointer.origin}
      mid={midRef.current}
      lineWidth={0.055}
      color={color}
      transparent
      opacity={0.9}
      depthTest={false}
      renderOrder={9999}
      raycast={() => null}
    />
  );
}

export const Ball = ({ color, position, id }: { color: BallColorCode; position: [number, number, number]; id: string }) => {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const ballMeshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  const draggedBallId = useGameStore((state) => state.draggedBallId);
  const setDraggedBallId = useGameStore((state) => state.setDraggedBallId);
  const setDragPointer = useGameStore((state) => state.setDragPointer);
  const removeBall = useGameStore((state) => state.removeBall);
  const isCurrentlyDragged = draggedBallId === id;

  const capturePointer = useCallback((event: any) => {
    if (typeof event?.pointerId === 'number' && typeof event?.target?.setPointerCapture === 'function') {
      event.target.setPointerCapture(event.pointerId);
    }
  }, []);

  const releasePointer = useCallback((event: any) => {
    if (typeof event?.pointerId === 'number' && typeof event?.target?.releasePointerCapture === 'function') {
      event.target.releasePointerCapture(event.pointerId);
    }
  }, []);

  const handlePointerDown = useCallback((event: any) => {
    event.stopPropagation();
    capturePointer(event);
    setHovered(true);
    const currentPos = rigidBodyRef.current?.translation();
    const origin = event.ray.origin as THREE.Vector3;
    const direction = event.ray.direction as THREE.Vector3;

    const distance = currentPos
      ? Math.max(0.55, new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z).distanceTo(origin) - GRAB_DISTANCE_BIAS)
      : Math.max(0.55, event.distance ?? 0.55);

    setDragPointer({
      origin: [origin.x, origin.y, origin.z],
      direction: [direction.x, direction.y, direction.z],
      distance,
    });
    setDraggedBallId(id);
  }, [id, setDragPointer, setDraggedBallId]);

  const handlePointerMove = useCallback((event: any) => {
    if (!isCurrentlyDragged) return;

    event.stopPropagation();
    capturePointer(event);
    const origin = event.ray.origin as THREE.Vector3;
    const direction = event.ray.direction as THREE.Vector3;
    const currentDistance = useGameStore.getState().dragPointer?.distance ?? 0;

    setDragPointer({
      origin: [origin.x, origin.y, origin.z],
      direction: [direction.x, direction.y, direction.z],
      distance: currentDistance,
    });
  }, [isCurrentlyDragged, setDragPointer]);

  const handlePointerUp = useCallback((event: any) => {
    event.stopPropagation();
    releasePointer(event);
    if (isCurrentlyDragged) {
      setDraggedBallId(null);
      setDragPointer(null);
    }
  }, [capturePointer, isCurrentlyDragged, releasePointer, setDragPointer, setDraggedBallId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isCurrentlyDragged) {
        removeBall(id);
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [id, isCurrentlyDragged, removeBall]);

  useFrame((_, delta) => {
    if (isCurrentlyDragged && rigidBodyRef.current) {
      const dragPointer = useGameStore.getState().dragPointer;

      if (dragPointer) {
        const origin = new THREE.Vector3(dragPointer.origin[0], dragPointer.origin[1], dragPointer.origin[2]);
        const direction = new THREE.Vector3(dragPointer.direction[0], dragPointer.direction[1], dragPointer.direction[2]).normalize();
        const targetPos = origin.add(direction.multiplyScalar(dragPointer.distance));
        const currentPos = rigidBodyRef.current.translation();
        const current = new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z);
        const springAlpha = 1 - Math.exp(-delta * GRAB_SPRING_STRENGTH);
        const softenedTarget = current.lerp(targetPos, springAlpha);

        rigidBodyRef.current.setTranslation({
          x: softenedTarget.x,
          y: softenedTarget.y,
          z: softenedTarget.z,
        }, true);
        rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
      }
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
    <>
      <GrabLine active={isCurrentlyDragged} ballId={id} ballRef={rigidBodyRef} color={getHexColor(color)} />
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
        >
          <mesh
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <sphereGeometry args={[GRAB_SHELL_RADIUS, 16, 16]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} depthTest={false} />
          </mesh>

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
    </>
  );
};