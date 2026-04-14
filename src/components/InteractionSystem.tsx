import { useCallback, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useXREvent } from '@react-three/xr';
import * as THREE from 'three';
import { useGameStore } from '../store/GameStore';
import { canGrabAtDistance, resolveGrabDistance } from '../utils/grab';

function findTaggedObject(object: THREE.Object3D | null, tag: string) {
  let current: THREE.Object3D | null = object;

  while (current) {
    if (current.userData?.name === tag) {
      return current;
    }

    current = current.parent;
  }

  return null;
}

export function InteractionSystem() {
  const { camera, scene, raycaster, gl } = useThree();
  const setDraggedBallId = useGameStore((state) => state.setDraggedBallId);
  const setDragPointer = useGameStore((state) => state.setDragPointer);
  const requestCandyDispense = useGameStore((state) => state.requestCandyDispense);

  const handleDesktopGrab = useCallback((event: MouseEvent) => {
    if (event.button !== 0 || gl.xr.isPresenting) {
      return;
    }

    const isPointerLocked = document.pointerLockElement === gl.domElement;
    const rect = gl.domElement.getBoundingClientRect();
    const hasClientCoordinates = Number.isFinite(event.clientX) && Number.isFinite(event.clientY);
    const withinCanvas = hasClientCoordinates
      && event.clientX >= rect.left
      && event.clientX <= rect.right
      && event.clientY >= rect.top
      && event.clientY <= rect.bottom;

    if (!isPointerLocked && !withinCanvas) {
      return;
    }

    const ndc = isPointerLocked || !hasClientCoordinates
      ? new THREE.Vector2(0, 0)
      : new THREE.Vector2(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -(((event.clientY - rect.top) / rect.height) * 2 - 1),
        );

    raycaster.setFromCamera(ndc, camera);

    for (const intersect of raycaster.intersectObjects(scene.children, true)) {
      const ballObject = findTaggedObject(intersect.object, 'ball');
      const ballId = ballObject?.userData?.id;

      if (typeof ballId === 'string') {
        if (!canGrabAtDistance(intersect.distance)) {
          return;
        }

        const origin = new THREE.Vector3();
        const direction = new THREE.Vector3();

        camera.getWorldPosition(origin);
        camera.getWorldDirection(direction);

        setDraggedBallId(ballId);
        setDragPointer({
          origin: [origin.x, origin.y, origin.z],
          direction: [direction.x, direction.y, direction.z],
          distance: resolveGrabDistance(intersect.distance),
        });
        return;
      }

      const machineObject = findTaggedObject(intersect.object, 'candy-machine');
      if (machineObject) {
        requestCandyDispense();
        return;
      }
    }
  }, [camera, gl.domElement, gl.xr, raycaster, requestCandyDispense, scene.children, setDragPointer, setDraggedBallId]);

  useXREvent('selectend', () => {
    setDraggedBallId(null);
    setDragPointer(null);
  });

  useEffect(() => {
    window.addEventListener('mousedown', handleDesktopGrab);

    const handleMouseUp = () => {
      setDraggedBallId(null);
      setDragPointer(null);
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('pointercancel', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleDesktopGrab);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('pointercancel', handleMouseUp);
    };
  }, [handleDesktopGrab, setDragPointer, setDraggedBallId]);

  return null;
}