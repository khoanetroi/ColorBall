import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';

const WALK_SPEED = 7;
const JUMP_FORCE = 6;

export function FirstPersonControls() {
  
  const rbRef = useRef<RapierRigidBody>(null);
  const keys = useRef({ w: false, a: false, s: false, d: false, space: false });
  const isGrounded = useRef(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyW') keys.current.w = true;
      if (e.code === 'KeyA') keys.current.a = true;
      if (e.code === 'KeyS') keys.current.s = true;
      if (e.code === 'KeyD') keys.current.d = true;
      if (e.code === 'Space') keys.current.space = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW') keys.current.w = false;
      if (e.code === 'KeyA') keys.current.a = false;
      if (e.code === 'KeyS') keys.current.s = false;
      if (e.code === 'KeyD') keys.current.d = false;
      if (e.code === 'Space') keys.current.space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state) => {
    if (!rbRef.current) return;

    const { camera, pointer, raycaster } = state;

    // Center raycaster for interaction
    if (document.pointerLockElement) {
      pointer.set(0, 0);
      raycaster.setFromCamera(pointer, camera);
    }

    const velocity = rbRef.current.linvel();
    const movement = new THREE.Vector3();

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    if (keys.current.w) movement.add(forward);
    if (keys.current.s) movement.sub(forward);
    if (keys.current.d) movement.add(right);
    if (keys.current.a) movement.sub(right);

    movement.normalize().multiplyScalar(WALK_SPEED);

    // Jump logic
    if (keys.current.space && isGrounded.current) {
      rbRef.current.setLinvel({ x: velocity.x, y: JUMP_FORCE, z: velocity.z }, true);
      isGrounded.current = false;
    }

    // Apply horizontal movement and preserve vertical velocity from physics
    rbRef.current.setLinvel({ x: movement.x, y: rbRef.current.linvel().y, z: movement.z }, true);

    // Sync camera to player position (smoothly instead of directly clipping)
    const pos = rbRef.current.translation();
    camera.position.lerp(new THREE.Vector3(pos.x, pos.y + 0.85, pos.z), 0.7);
    
    // Check if grounded (simple height check for now)
    if (Math.abs(rbRef.current.linvel().y) < 0.1) {
       isGrounded.current = true;
    }

    // Respawn if fell
    if (pos.y < -15) {
      rbRef.current.setTranslation({ x: 0, y: 3, z: 8 }, true);
      rbRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }
  });

  return (
    <>
      <PointerLockControls makeDefault />
      <RigidBody
        ref={rbRef}
        colliders={false}
        position={[0, 2.65, 8]}
        enabledRotations={[false, false, false]}
        mass={1}
        type="dynamic"
      >
        <CapsuleCollider args={[0.6, 0.4]} />
      </RigidBody>
    </>
  );
}

