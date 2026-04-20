import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text as DreiText } from '@react-three/drei';
import * as THREE from 'three';
import { BallColor, getHexColor, type BallColorCode } from '../store/ColorSystem';
import { useGameStore } from '../store/GameStore';

type ColorGuideBoardProps = {
  mode?: 'core' | 'special';
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

// Level 2: Primary + Primary = Secondary
const level2Recipes: RecipeStep[] = [
  { left: BallColor.Red, modifier: BallColor.Blue, result: BallColor.Purple, resultLabel: 'Purple' },
  { left: BallColor.Red, modifier: BallColor.Yellow, result: BallColor.Orange, resultLabel: 'Orange' },
  { left: BallColor.Blue, modifier: BallColor.Yellow, result: BallColor.Green, resultLabel: 'Green' },
];

const level3Recipes: RecipeStep[] = [
  { left: BallColor.Red, modifier: BallColor.Orange, result: BallColor.RedOrange, resultLabel: 'Red-Orange' },
  { left: BallColor.Red, modifier: BallColor.Purple, result: BallColor.RedPurple, resultLabel: 'Red-Purple' },
  { left: BallColor.Blue, modifier: BallColor.Purple, result: BallColor.BluePurple, resultLabel: 'Blue-Purple' },
  { left: BallColor.Blue, modifier: BallColor.Green, result: BallColor.BlueGreen, resultLabel: 'Blue-Green' },
  { left: BallColor.Yellow, modifier: BallColor.Green, result: BallColor.YellowGreen, resultLabel: 'Yellow-Green' },
  { left: BallColor.Yellow, modifier: BallColor.Orange, result: BallColor.YellowOrange, resultLabel: 'Yellow-Orange' },
];

// Special: Base + White = Pastel
const pastelRecipes: RecipeStep[] = [
  { left: BallColor.Red, modifier: BallColor.White, result: BallColor.Pink, resultLabel: 'Sweet Pink' },
  { left: BallColor.Blue, modifier: BallColor.White, result: BallColor.SkyBlue, resultLabel: 'Sky Blue' },
  { left: BallColor.Green, modifier: BallColor.White, result: BallColor.Mint, resultLabel: 'Minty Fresh' },
  { left: BallColor.Purple, modifier: BallColor.White, result: BallColor.Lavender, resultLabel: 'Lavender' },
];

// Special: Base + Black = Shade
const shadeRecipes: RecipeStep[] = [
  { left: BallColor.Red, modifier: BallColor.Black, result: BallColor.Maroon, resultLabel: 'Maroon' },
  { left: BallColor.Blue, modifier: BallColor.Black, result: BallColor.Navy, resultLabel: 'Midnight Navy' },
  { left: BallColor.Yellow, modifier: BallColor.Black, result: BallColor.Brown, resultLabel: 'Roasted Brown' },
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
  // More compact layout to avoid overlap
  const rowStep = 0.44;
  const cardHeight = rows.length > 4 ? 4.4 : 3.4;
  const headerOffset = cardHeight / 2 - 0.25;
  const rowStart = rows.length > 4 ? 0.6 : 0.4;
  const footerY = -(cardHeight / 2) + 0.25;

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <planeGeometry args={[3.62, cardHeight]} />
        <meshStandardMaterial color={background} roughness={1} />
      </mesh>

      <mesh position={[0, headerOffset, 0.01]}>
        <planeGeometry args={[2.96, 0.28]} />
        <meshStandardMaterial color={accent} roughness={1} transparent opacity={0.32} />
      </mesh>

      <DreiText position={[-1.36, headerOffset, 0.02]} fontSize={0.09} color="#9d174d" fontWeight="900" anchorX="left" letterSpacing={0.02}>
        {badge}
      </DreiText>

      <DreiText position={[0, headerOffset - 0.45, 0.02]} fontSize={0.22} color="#5b1f14" fontWeight="900" anchorX="center" letterSpacing={0.01}>
        {title}
      </DreiText>

      <DreiText position={[0, headerOffset - 0.8, 0.02]} maxWidth={3.05} textAlign="center" fontSize={0.075} color="#7c2d12" fontWeight="700" anchorX="center">
        {subtitle}
      </DreiText>

      <group position={[0, headerOffset - rowStart - 0.7, 0.02]}>
        {rows.map((recipe, index) => (
          <FormulaRow
            key={`${recipe.left}-${recipe.modifier}-${recipe.result}`}
            recipe={recipe}
            y={-index * rowStep}
            stripeColor={index % 2 === 0 ? '#ffffff' : '#fef3c7'}
          />
        ))}
      </group>

      <DreiText position={[0, footerY, 0.02]} fontSize={0.08} color="#9d174d" fontWeight="700" anchorX="center">
        {footer}
      </DreiText>
    </group>
  );
}



export function ColorGuideBoard({ mode = 'core', position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: ColorGuideBoardProps) {
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

  if (level < 2 || (mode === 'special' && level < 3)) {
    return null;
  }

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group ref={groupRef}>
        <group position={[0, 2.8, 0.24]}>
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
          <planeGeometry args={[9.2, 5.8]} />
          <meshStandardMaterial color="#ffcf8a" side={THREE.DoubleSide} transparent opacity={0.55} roughness={0.15} metalness={0.2} />
        </mesh>
        
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[9.54, 6.14]} />
          <meshStandardMaterial color="#f472b6" side={THREE.DoubleSide} transparent opacity={0.35} roughness={0.15} metalness={0.2} />
        </mesh>

        {[
          [-4.4, 2.7, Math.PI / 4], [4.4, 2.7, -Math.PI / 4],
          [-4.4, -2.7, -Math.PI / 4], [4.4, -2.7, Math.PI / 4],
        ].map(([x, y, r], i) => (
          <mesh key={i} position={[x, y, 0.02]} rotation={[0, 0, r]}>
            <planeGeometry args={[1.65, 0.58]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#84cc16' : '#fb7185'} opacity={0.68} transparent />
          </mesh>
        ))}

        <group position={[0, 2.2, 0.03]}>
          {/* Logo with relevant colors */}
          <group position={[0, 0.45, 0]}>
            {(mode === 'core' 
              ? ['#ef4444', '#3b82f6', '#eab308', '#f97316', '#22c55e', '#a855f7']
              : ['#ef4444', '#3b82f6', '#22c55e', '#ffffff', '#000000']
            ).map((c, i, arr) => (
              <mesh key={i} position={[(i - (arr.length - 1)/2) * 0.35, 0, 0]}>
                <sphereGeometry args={[0.08, 32, 32]} />
                <meshStandardMaterial color={c} roughness={0.2} metalness={0.1} />
              </mesh>
            ))}
          </group>
          <DreiText position={[0, 0.02, 0]} fontSize={0.32} color="#be185d" fontWeight="900" letterSpacing={0.02}>
            {mode === 'core' ? 'CORE RECIPES' : 'SPECIAL BLENDS'}
          </DreiText>
          <DreiText position={[0, -0.3, 0]} fontSize={0.11} color="#7c2d12" fontWeight="700" anchorX="center">
            {mode === 'core' ? 'Level 2 & 3 mixing guide' : 'Pastel & Shade mixing guide'}
          </DreiText>
        </group>

        {mode === 'core' ? (
          <>
            <group position={[-2.25, -0.3, 0.03]}>
              <RecipeCard
                position={[0, 0, 0]}
                badge="LEVEL 2"
                title="SECONDARY ♡"
                subtitle="Mix Primary colors to get Secondary."
                background="#fdf2f8"
                accent="#f43f5e"
                rows={level2Recipes}
                footer="Primary + Primary = Secondary"
              />
            </group>

            <group position={[2.25, -0.3, 0.03]}>
              <RecipeCard
                position={[0, 0, 0]}
                badge="LEVEL 3"
                title="TERTIARY ✦"
                subtitle="Mix Primary with Secondary to get Tertiary."
                background="#eff6ff"
                accent="#60a5fa"
                rows={level3Recipes}
                footer="Primary + Secondary = Tertiary"
              />
            </group>
          </>
        ) : (
          <>
            <group position={[-2.25, -0.3, 0.03]}>
              <RecipeCard
                position={[0, 0, 0]}
                badge="PASTEL"
                title="SWEET BLENDS🍬"
                subtitle="Mix base colors with WHITE for light shades."
                background="#f0fdf4"
                accent="#10b981"
                rows={pastelRecipes}
                footer="Any Color + White = Pastel"
              />
            </group>

            <group position={[2.25, -0.3, 0.03]}>
              <RecipeCard
                position={[0, 0, 0]}
                badge="SHADE"
                title="DARK BLENDS🌑"
                subtitle="Mix base colors with BLACK for deep tones."
                background="#f8fafc"
                accent="#64748b"
                rows={shadeRecipes}
                footer="Any Color + Black = Shade"
              />
            </group>
          </>
        )}

        <group position={[0, -2.55, 0.03]}>
          <mesh>
            <planeGeometry args={[7.8, 0.4]} />
            <meshStandardMaterial color="#fff7cc" roughness={1} />
          </mesh>
          <DreiText position={[0, 0.0, 0.01]} fontSize={0.11} color="#7c2d12" fontWeight="900" anchorX="center" letterSpacing={0.01}>
            {mode === 'core' 
              ? 'Rainbow Candy 🌈 can be made by mixing any TWO Secondary colors!'
              : 'Try mixing different base colors with Black or White!'}
          </DreiText>
        </group>
      </group>
    </group>
  );
}