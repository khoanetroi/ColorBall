export function LevelProps() {
  return (
    <group>
      {/* Wooden Gangway towards the Silo */}
      <group position={[-6, 0.1, -4]} rotation={[0, 0.2, 0]}>
        <Board position={[0, 0, 0]} />
        <Board position={[1.2, 0.02, 0.1]} />
        <Board position={[2.4, -0.01, -0.05]} />
        <Board position={[3.6, 0.03, 0.12]} />
      </group>

      {/* Wooden Gangway towards the Nesting Station */}
      <group position={[6, 0.1, -4]} rotation={[0, -0.2, 0]}>
        <Board position={[0, 0, 0]} />
        <Board position={[-1.2, 0.02, 0.1]} />
        <Board position={[-2.4, -0.01, -0.05]} />
        <Board position={[-3.6, 0.03, 0.12]} />
      </group>

      {/* Central Stone Path towards the Mill */}
      <group position={[0, 0.1, -6]}>
        <Stone position={[0, 0.02, -1]} rotation={[0, 0.2, 0]} scale={1.2} />
        <Stone position={[-0.8, -0.02, -2.5]} rotation={[0, -0.4, 0]} scale={0.9} />
        <Stone position={[0.6, 0.01, -4]} rotation={[0, 0.3, 0]} scale={1.1} />
        <Stone position={[-0.2, 0.04, -5.5]} rotation={[0, 0.1, 0]} scale={1.3} />
      </group>

      {/* Harvest Markers (Stacks of hay bales) */}
      <BaleMarker position={[-11, 0, -2]} />
      <BaleMarker position={[11, 0, -2]} />
      <BaleMarker position={[4, 0, -14]} scale={0.8} />
    </group>
  );
}

function Board({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} receiveShadow castShadow>
      <boxGeometry args={[1.0, 0.08, 0.4]} />
      <meshStandardMaterial color="#6b3f24" roughness={0.9} />
    </mesh>
  );
}

function Stone({ position, rotation = [0, 0, 0], scale = 1 }: { position: [number, number, number]; rotation?: [number, number, number]; scale?: number }) {
  return (
    <mesh position={position} rotation={rotation} scale={scale} receiveShadow>
      <boxGeometry args={[1.4, 0.1, 1.2]} />
      <meshStandardMaterial color="#4b3a2d" roughness={1} />
    </mesh>
  );
}

function BaleMarker({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.6, 8]} />
        <meshStandardMaterial color="#d7a94a" />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow rotation={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.6, 8]} />
        <meshStandardMaterial color="#d7a94a" />
      </mesh>
      <mesh position={[0, 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.52, 0.04, 6, 12]} />
        <meshStandardMaterial color="#8b5e34" />
      </mesh>
    </group>
  );
}
