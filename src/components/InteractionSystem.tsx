import { useEffect } from 'react';
import { useXREvent } from '@react-three/xr';
import { useGameStore } from '../store/GameStore';

export function InteractionSystem() {
  const setDraggedBallId = useGameStore((state) => state.setDraggedBallId);
  const setDragPointer = useGameStore((state) => state.setDragPointer);

  useXREvent('selectend', () => {
    setDraggedBallId(null);
    setDragPointer(null);
  });

  useEffect(() => {
    const handleMouseUp = () => {
      setDraggedBallId(null);
      setDragPointer(null);
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('pointercancel', handleMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('pointercancel', handleMouseUp);
    };
  }, [setDragPointer, setDraggedBallId]);

  return null;
}