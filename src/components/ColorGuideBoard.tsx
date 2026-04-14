import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text as DreiText } from '@react-three/drei';
import * as THREE from 'three';
import { BallColor, getHexColor, type BallColorCode } from '../store/ColorSystem';
import { useGameStore } from '../store/GameStore';

type ColorGuideBoardProps = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
};

type ChipProps = {
  color: BallColorCode;
  position: [number, number, number];
  label?: string;
  rainbow?: boolean;
  radius?: number;
  labelSize?: number;
};

type RecipeStep = {
  left: BallColorCode;
  modifier: BallColorCode;
  result: BallColorCode;
  resultLabel: string;
  resultRainbow?: boolean;
};

type RecipeCardProps = {
  position: [number, number, number];
  badge: string;
  title: string;
  subtitle: string;
  background: string;
  accent: string;
  rows: RecipeStep[];
  footer: string;
};

const level2Recipes: RecipeStep[] = [
  { left: BallColor.Red, modifier: BallColor.White, result: BallColor.Pink, resultLabel: 'Pink' },
  { left: BallColor.Blue, modifier: BallColor.White, result: BallColor.SkyBlue, resultLabel: 'Sky Blue' },
  { left: BallColor.Green, modifier: BallColor.White, result: BallColor.Mint, resultLabel: 'Mint' },
  { left: BallColor.Purple, modifier: BallColor.White, result: BallColor.Lavender, resultLabel: 'Lavender' },
];

const level3Recipes: RecipeStep[] = [
  { left: BallColor.Red, modifier: BallColor.Black, result: BallColor.Maroon, resultLabel: 'Maroon' },
  { left: BallColor.Blue, modifier: BallColor.Black, result: BallColor.Navy, resultLabel: 'Navy' },
  { left: BallColor.Yellow, modifier: BallColor.Black, result: BallColor.Brown, resultLabel: 'Brown' },
];

function ColorChip({ color, position, label, rainbow = false, radius = 0.13, labelSize = 0.072 }: ChipProps) {
  const chipRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!rainbow || !chipRef.current) {
      return;
    }

    const material = chipRef.current.material as THREE.MeshStandardMaterial;
    const hue = (state.clock.elapsedTime * 0.18) % 1;
    const rainbowColor = new THREE.Color().setHSL(hue, 0.9, 0.58);
    material.color.copy(rainbowColor);
    material.emissive.copy(rainbowColor);
    material.emissiveIntensity = 0.9 + Math.sin(state.clock.elapsedTime * 3.5) * 0.2;
  });

  const chipColor = rainbow ? '#ffffff' : getHexColor(color);

  return (
    <group position={position}>
      <mesh ref={chipRef} castShadow>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshStandardMaterial color={chipColor} roughness={0.25} emissive={chipColor} emissiveIntensity={rainbow ? 0.85 : 0.12} />
      </mesh>
      {label ? (
        <DreiText position={[0, -(radius + 0.09), 0]} fontSize={labelSize} color="#431407" fontWeight="900" anchorX="center">
          {label}
        </DreiText>
      ) : null}
    </group>
  );
}

function FormulaRow({ recipe, y, stripeColor }: { recipe: RecipeStep; y: number; stripeColor: string }) {
  return (
    <group position={[0, y, 0]}>
      <mesh>
        <planeGeometry args={[3.2, 0.46]} />
        <meshStandardMaterial color={stripeColor} transparent opacity={0.28} roughness={1} />
      </mesh>

      <group position={[0, 0.01, 0.01]}>
        <ColorChip color={recipe.left} position={[-1.02, 0, 0]} />
        <DreiText position={[-0.58, 0, 0]} fontSize={0.14} color="#7c2d12" fontWeight="900" anchorX="center">
          +
        </DreiText>
        <ColorChip color={recipe.modifier} position={[-0.16, 0, 0]} />
        <DreiText position={[0.26, 0, 0]} fontSize={0.14} color="#7c2d12" fontWeight="900" anchorX="center">
          =
        </DreiText>
        <ColorChip color={recipe.result} position={[0.82, 0, 0]} rainbow={recipe.resultRainbow} />
        <DreiText position={[1.2, 0, 0.01]} fontSize={0.078} color="#431407" fontWeight="900" anchorX="left">
          {recipe.resultLabel}
        </DreiText>
      </group>
    </group>
  );
}

function RecipeCard({ position, badge, title, subtitle, background, accent, rows, footer }: RecipeCardProps) {
  const rowStart = rows.length > 3 ? 0.36 : 0.28;
  const rowStep = rows.length > 3 ? 0.49 : 0.56;
  const footerY = rows.length > 3 ? -1.52 : -1.34;

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <planeGeometry args={[3.62, 3.18]} />
        <meshStandardMaterial color={background} roughness={1} />
      </mesh>

      <mesh position={[0, 1.22, 0.01]}>
        <planeGeometry args={[2.96, 0.34]} />
        <meshStandardMaterial color={accent} roughness={1} transparent opacity={0.32} />
      </mesh>

      <DreiText position={[-1.36, 1.22, 0.02]} fontSize={0.102} color="#9d174d" fontWeight="900" anchorX="left" letterSpacing={0.02}>
        {badge}
      </DreiText>

      <DreiText position={[0, 0.84, 0.02]} fontSize={0.245} color="#5b1f14" fontWeight="900" anchorX="center" letterSpacing={0.01}>
        {title}
      </DreiText>

      <DreiText position={[0, 0.74, 0.02]} maxWidth={3.05} textAlign="center" fontSize={0.069} color="#7c2d12" fontWeight="700" anchorX="center">
        {subtitle}
      </DreiText>

      <group position={[0, -0.08, 0.02]}>
        {rows.map((recipe, index) => (
          <FormulaRow
            key={`${recipe.left}-${recipe.modifier}-${recipe.result}`}
            recipe={recipe}
            y={rowStart - index * rowStep}
            stripeColor={index % 2 === 0 ? '#ffffff' : '#fef3c7'}
          />
        ))}
      </group>

      <DreiText position={[0, footerY, 0.02]} fontSize={0.076} color="#9d174d" fontWeight="700" anchorX="center">
        {footer}
      </DreiText>
    </group>
  );
}

export function ColorGuideBoard({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: ColorGuideBoardProps) {
  const level = useGameStore((state) => state.level);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    const elapsed = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(elapsed * 1.05) * 0.06;
    groupRef.current.rotation.z = Math.sin(elapsed * 0.45) * 0.015;
  });

  if (level < 2) {
    return null;
  }

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group ref={groupRef}>
        <group position={[0, 3.05, 0.24]}>
          <mesh position={[0, 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.44, 14]} />
            <meshStandardMaterial color="#7c2d12" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.02, 0]} rotation={[Math.PI, 0, 0]} castShadow>
            <coneGeometry args={[0.34, 0.34, 20]} />
            <meshStandardMaterial color="#b45309" roughness={0.55} metalness={0.2} />
          </mesh>
          <mesh position={[0, -0.18, 0.03]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color="#fff4cc" emissive="#fff4cc" emissiveIntensity={2.2} roughness={0.15} />
          </mesh>
          <spotLight position={[0, -0.18, 0.9]} intensity={20} distance={28} angle={0.62} penumbra={0.78} color="#ffe8ad" decay={1.5} />
          <pointLight position={[0, -0.22, 0.55]} intensity={5.6} distance={22} color="#ffe7a8" decay={1.9} />
          <pointLight position={[0, -0.3, 1.05]} intensity={2.2} distance={10} color="#fff7d6" decay={2} />
        </group>

        <mesh castShadow receiveShadow>
          <planeGeometry args={[8.6, 5.55]} />
          <meshStandardMaterial color="#ffcf8a" side={THREE.DoubleSide} roughness={1} />
        </mesh>

        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[8.92, 5.86]} />
          <meshStandardMaterial color="#f472b6" side={THREE.DoubleSide} roughness={1} />
        </mesh>

        {[
          [-4.1, 2.8, Math.PI / 4], [4.1, 2.8, -Math.PI / 4],
          [-4.1, -2.8, -Math.PI / 4], [4.1, -2.8, Math.PI / 4],
        ].map(([x, y, r], i) => (
          <mesh key={i} position={[x, y, 0.02]} rotation={[0, 0, r]}>
            <planeGeometry args={[1.45, 0.48]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#84cc16' : '#fb7185'} opacity={0.68} transparent />
          </mesh>
        ))}

        <group position={[0, 2.28, 0.03]}>
          <DreiText fontSize={0.33} color="#be185d" fontWeight="900" letterSpacing={0.02}>
            COLOR GUIDE ✨
          </DreiText>
          <DreiText position={[0, -0.28, 0]} fontSize={0.1} color="#7c2d12" fontWeight="700" anchorX="center">
            Sweet formula cheatsheet for the mixer machines
          </DreiText>

          <mesh position={[-3.28, -0.02, -0.01]}>
            <circleGeometry args={[0.11, 20]} />
            <meshStandardMaterial color="#f472b6" roughness={1} />
          </mesh>
          <mesh position={[3.28, -0.02, -0.01]}>
            <circleGeometry args={[0.11, 20]} />
            <meshStandardMaterial color="#60a5fa" roughness={1} />
          </mesh>
        </group>

        <group position={[-2.15, -0.04, 0.03]}>
          <RecipeCard
            position={[0, 0, 0]}
            badge="LEVEL 2"
            title="PASTELS ♡"
            subtitle="White softens each base color into lighter candy tones."
            background="#fdf2f8"
            accent="#f43f5e"
            rows={level2Recipes}
            footer="White keeps every recipe soft and bright."
          />
        </group>

        <group position={[2.15, -0.04, 0.03]}>
          <RecipeCard
            position={[0, 0, 0]}
            badge="LEVEL 3"
            title="SHADES ✦"
            subtitle="Black deepens each base color into darker candy tones."
            background="#eff6ff"
            accent="#60a5fa"
            rows={level3Recipes}
            footer="Black makes the palette deeper and heavier."
          />
        </group>

        <group position={[0, -1.98, 0.03]}>
          <mesh>
            <planeGeometry args={[6.2, 0.52]} />
            <meshStandardMaterial color="#fff7cc" roughness={1} />
          </mesh>
          <ColorChip color={BallColor.Rainbow} position={[-2.52, 0.03, 0.02]} label="Rainbow" rainbow radius={0.14} labelSize={0.07} />
          <DreiText position={[-1.86, 0.0, 0.02]} fontSize={0.104} color="#7c2d12" fontWeight="900" anchorX="left" letterSpacing={0.01}>
            Secondary + Secondary = Rainbow
          </DreiText>
        </group>
      </group>
    </group>
  );
}