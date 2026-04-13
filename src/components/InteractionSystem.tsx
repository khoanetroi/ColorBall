import { useEffect, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { useXREvent } from '@react-three/xr';
import * as THREE from 'three';
import { useGameStore } from '../store/GameStore';

export function InteractionSystem() {
  const { camera, scene, raycaster, gl } = useThree();
  const setDraggedBallId = useGameStore((state) => state.setDraggedBallId);
  const requestCandyDispense = useGameStore((state) => state.requestCandyDispense);

  const findTaggedObject = (object: THREE.Object3D | null) => {
    let current: THREE.Object3D | null = object;

    while (current) {
      if (current.userData?.name) {
        return current;
      }

      current = current.parent;
    }

    return null;
  };

  const handleInteraction = useCallback((origin: THREE.Vector3, direction: THREE.Vector3, inputSource?: any) => {
    raycaster.set(origin, direction);
    
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    for (const intersect of intersects) {
      const taggedObject = findTaggedObject(intersect.object);
      const taggedName = taggedObject?.userData?.name;
      const taggedId = taggedObject?.userData?.id;

      if (taggedName === 'candy-machine' || taggedName === 'candy-lever') {
        requestCandyDispense();
        // Trigger haptics if available
        if (inputSource?.gamepad?.hapticActuators?.length > 0) {
          inputSource.gamepad.hapticActuators[0].pulse(0.8, 100);
        }
        return;
      }

      if (taggedName === 'ball' && typeof taggedId === 'string') {
        setDraggedBallId(taggedId);
        // Trigger haptics if available
        if (inputSource?.gamepad?.hapticActuators?.length > 0) {
          inputSource.gamepad.hapticActuators[0].pulse(0.4, 50);
        }
        return;
      }
    }
  }, [scene.children, raycaster, requestCandyDispense, setDraggedBallId]);

  // 1. VR Controller Interactions
  useXREvent('selectstart', (e: any) => {
    const inputSourceState = e.data; // In v6, e.data is the XRInputSourceState
    const inputSource = inputSourceState.inputSource;
    
    // Get world direction based on the controller state
    const origin = new THREE.Vector3().setFromMatrixPosition(inputSourceState.object.matrixWorld);
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(inputSourceState.object.quaternion);
    
    handleInteraction(origin, direction, inputSource);
  });

  useXREvent('selectend', () => {
    setDraggedBallId(null);
  });

  // 2. Desktop Mouse Interactions
  useEffect(() => {
    if (gl.xr.isPresenting) return; // Disable mouse listeners in VR to save perf

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;

      // FPS mode center-screen raycast
      const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      handleInteraction(camera.position, direction);
    };

    const handleMouseUp = () => {
      setDraggedBallId(null);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [camera, gl.xr.isPresenting, handleInteraction, setDraggedBallId]);

  return null;
}
