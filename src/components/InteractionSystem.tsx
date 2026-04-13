import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/GameStore';

export function InteractionSystem() {
  const { camera, scene, raycaster } = useThree();
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

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Only left click

      // We use (0, 0) for center-screen raycasting in FPS mode
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      
      const intersects = raycaster.intersectObjects(scene.children, true);
      
      for (const intersect of intersects) {
        const taggedObject = findTaggedObject(intersect.object);
        const taggedName = taggedObject?.userData?.name;
        const taggedId = taggedObject?.userData?.id;

        if (taggedName === 'candy-machine' || taggedName === 'candy-lever') {
          requestCandyDispense();
          return;
        }

        if (taggedName === 'ball' && typeof taggedId === 'string') {
          setDraggedBallId(taggedId);
          return;
        }
      }
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
  }, [camera, scene, raycaster, requestCandyDispense, setDraggedBallId]);

  return null;
}
