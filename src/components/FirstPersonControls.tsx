import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { useXRInputSourceState } from '@react-three/xr';
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';

const WALK_SPEED = 6;
const VR_WALK_SPEED = 4.5;
const JUMP_FORCE = 6;
const TURN_AMOUNT = Math.PI / 4;
const STICK_DEADZONE = 0.12;

function readThumbstick(gamepad: Gamepad | null | undefined) {
  if (!gamepad?.axes) return null;

  const axes = gamepad.axes;
  const candidates: Array<[number, number]> = [
    [axes[2] ?? 0, axes[3] ?? 0],
    [axes[0] ?? 0, axes[1] ?? 0],
  ];

  for (const [x, y] of candidates) {
    if (Math.abs(x) > STICK_DEADZONE || Math.abs(y) > STICK_DEADZONE) {
      return { x, y };
    }
  }

  return null;
}

export function FirstPersonControls() {
  const { gl, camera } = useThree();
  const rbRef = useRef<RapierRigidBody>(null);
  const keys = useRef({ w: false, a: false, s: false, d: false, space: false });
  const isGrounded = useRef(true);
  const [lastTurnTime, setLastTurnTime] = useState(0);

  // VR Inputs
  const leftController = useXRInputSourceState('controller', 'left');
  const rightController = useXRInputSourceState('controller', 'right');

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

  useFrame((state, _delta) => {
    if (!rbRef.current) return;

    const velocity = rbRef.current.linvel();
    const movement = new THREE.Vector3();
    const isVR = gl.xr.isPresenting;

    // 1. Get Directional Basis (Head/Camera orientation)
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    // 2. Keyboard Input (Always on for hybrid users)
    if (keys.current.w) movement.add(forward);
    if (keys.current.s) movement.sub(forward);
    if (keys.current.d) movement.add(right);
    if (keys.current.a) movement.sub(right);

    // 3. VR Joystick Input (Left Controller - Move)
    const driveStick = readThumbstick(leftController?.inputSource?.gamepad) ?? readThumbstick(rightController?.inputSource?.gamepad);
    if (isVR && driveStick) {
      movement.addScaledVector(forward, -driveStick.y);
      movement.addScaledVector(right, driveStick.x);
    }

    // Apply speed
    if (movement.length() > 0.01) {
      movement.normalize().multiplyScalar(isVR ? VR_WALK_SPEED : WALK_SPEED);
    }

    // 4. VR Snap Turn (Right Controller)
    const turnStick = readThumbstick(rightController?.inputSource?.gamepad);
    if (isVR && turnStick) {
      const rx = turnStick.x;
      const now = state.clock.elapsedTime;
      
      if (Math.abs(rx) > 0.7 && now - lastTurnTime > 0.25) {
        const currentRotation = rbRef.current.rotation();
        const turnQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.sign(rx) * TURN_AMOUNT, 0));
        const newRotation = new THREE.Quaternion(currentRotation.x, currentRotation.y, currentRotation.z, currentRotation.w).multiply(turnQ);
        
        rbRef.current.setRotation(newRotation, true);
        setLastTurnTime(now);
      }
    }

    // 5. Jump
    if (keys.current.space && isGrounded.current && !isVR) {
      rbRef.current.setLinvel({ x: velocity.x, y: JUMP_FORCE, z: velocity.z }, true);
      isGrounded.current = false;
    }

    // Apply translation to physics body
    rbRef.current.setLinvel({ x: movement.x, y: rbRef.current.linvel().y, z: movement.z }, true);

    // 6. Camera & Player Body Sync
    const pos = rbRef.current.translation();
    if (!isVR) {
      // First Person smoothing on Desktop
      camera.position.lerp(new THREE.Vector3(pos.x, pos.y + 0.85, pos.z), 0.7);
    } else {
      // In VR, the Headset is absolute. We keep the physics collider centered under the headset horizontally.
      const headPos = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);
      rbRef.current.setTranslation({ x: headPos.x, y: pos.y, z: headPos.z }, true);
    }

    if (Math.abs(rbRef.current.linvel().y) < 0.1) isGrounded.current = true;

    // Safety Respawn
    if (pos.y < -15) {
      rbRef.current.setTranslation({ x: 0, y: 3, z: 8 }, true);
      rbRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }
  });

  return (
    <>
      {!gl.xr.isPresenting && <PointerLockControls makeDefault />}
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
