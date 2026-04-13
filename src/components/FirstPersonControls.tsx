import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { useXRInputSourceState } from '@react-three/xr';
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';

const WALK_SPEED = 6;
const VR_WALK_SPEED = 4.5;
const JUMP_FORCE = 6;
const TURN_AMOUNT = Math.PI / 4;

export function FirstPersonControls() {
  const { gl, camera } = useThree();
  const rbRef = useRef<RapierRigidBody>(null);
  const keys = useRef({ w: false, a: false, s: false, d: false, space: false });
  const isGrounded = useRef(true);
  const [lastTurnTime, setLastTurnTime] = useState(0);

  // VR Inputs
  const leftController = useXRInputSourceState('left');
  const rightController = useXRInputSourceState('right');

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

  useFrame((state, delta) => {
    if (!rbRef.current) return;

    const velocity = rbRef.current.linvel();
    const movement = new THREE.Vector3();
    const isVR = gl.xr.isPresenting;

    // 1. Get Directional Basis
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    // 2. Desktop Input
    if (!isVR) {
      if (keys.current.w) movement.add(forward);
      if (keys.current.s) movement.sub(forward);
      if (keys.current.d) movement.add(right);
      if (keys.current.a) movement.sub(right);
      movement.normalize().multiplyScalar(WALK_SPEED);
    } 
    // 3. VR Joystick Input (Left Controller)
    else if (leftController?.inputSource?.gamepad) {
      const axes = leftController.inputSource.gamepad.axes;
      const joyX = axes[2] || 0;
      const joyY = axes[3] || 0;

      if (Math.abs(joyX) > 0.1 || Math.abs(joyY) > 0.1) {
        movement.addScaledVector(forward, -joyY);
        movement.addScaledVector(right, joyX);
        movement.multiplyScalar(VR_WALK_SPEED);
      }

      // Snap Turn (Right Controller)
      if (rightController?.inputSource?.gamepad) {
        const rAxes = rightController.inputSource.gamepad.axes;
        const rJoyX = rAxes[2] || 0;
        const now = state.clock.elapsedTime;
        if (Math.abs(rJoyX) > 0.6 && now - lastTurnTime > 0.3) {
          // In XR, we rotate the Rig/Body
          rbRef.current.setRotation(
            new THREE.Quaternion().setFromEuler(
              new THREE.Euler(0, rbRef.current.rotation().y - Math.sign(rJoyX) * TURN_AMOUNT, 0)
            ),
            true
          );
          setLastTurnTime(now);
        }
      }
    }

    // 4. Physics Application
    if (keys.current.space && isGrounded.current && !isVR) {
      rbRef.current.setLinvel({ x: velocity.x, y: JUMP_FORCE, z: velocity.z }, true);
      isGrounded.current = false;
    }

    rbRef.current.setLinvel({ x: movement.x, y: rbRef.current.linvel().y, z: movement.z }, true);

    // 5. Camera Sync
    const pos = rbRef.current.translation();
    if (!isVR) {
      camera.position.lerp(new THREE.Vector3(pos.x, pos.y + 0.85, pos.z), 0.7);
    } else {
      // In VR, the XR session manages the camera, but we must keep the physics body near the player
      // Simple follow: move the body horizontally to match camera world position
      const headPos = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);
      rbRef.current.setTranslation({ x: headPos.x, y: pos.y, z: headPos.z }, true);
    }

    if (Math.abs(rbRef.current.linvel().y) < 0.1) isGrounded.current = true;

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

