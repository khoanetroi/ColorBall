import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useXRInputSource, XRController, Hands } from '@react-three/xr';
import * as THREE from 'three';

export function VRPlayer() {
  const { camera, gl } = useThree();
  const playerRef = useRef<THREE.Group>(null);
  
  // Joystick Locomotion is now handled in FirstPersonControls to share the RigidBody
  // This component now focuses on VR Visuals and Hand Tracking

  return (
    <group ref={playerRef}>
      {/* VR Hand Tracking (Pinch to select) */}
      <Hands />
      
      {/* VR Controller Visuals */}
      <XRController />
    </group>
  );
}
