import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "../hooks/useTheme";
import type { DataQualityState, ThreeDShape } from "../data/types";

interface Visualization3DProps {
  amplitudeX: number;
  amplitudeY: number;
  dataState: DataQualityState;
  shape: ThreeDShape;
  zoom: number;
  panX: number;
  panY: number;
  amplification: number;
}

/** Fixed elevated viewing direction — gives the scene the angled, technical look. */
const VIEW_DIRECTION = new THREE.Vector3(1, 0.72, 1.35).normalize();
const BASE_DISTANCE = 7;

const CAGE_WIDTH = 3.6;
const CAGE_HEIGHT = 2.4;
const CAGE_DEPTH = 2.4;
const FLOOR_Y = -CAGE_HEIGHT / 2;
const AXIS_LENGTH = 1.5;

// ── Color palettes ────────────────────────────────────────────────────────────

interface Palette {
  bg: string;
  fog: string;
  cageColor: string;
  cageOpacity: number;
  gridMinorColor: string;
  gridMinorOpacity: number;
  gridMajorColor: string;
  gridMajorOpacity: number;
  floorColor: string;
  floorOpacity: number;
  shadowColor: string;
  shadowOpacity: number;
  axisX: string;
  axisY: string;
  axisZ: string;
  solidValid: string;
  solidValidEmissive: string;
  solidValidEmissiveIntensity: number;
  solidUnreliable: string;
  solidUnreliableEmissive: string;
  solidMissing: string;
  ambientIntensity: number;
  mainLightColor: string;
  mainLightIntensity: number;
  fillLightColor: string;
  fillLightIntensity: number;
  pointLightColor: string;
  pointLightIntensity: number;
}

const DARK_PALETTE: Palette = {
  bg: "#050b14",
  fog: "#050b14",
  cageColor: "#3a4a63",
  cageOpacity: 0.55,
  gridMinorColor: "#1c2940",
  gridMinorOpacity: 0.6,
  gridMajorColor: "#334155",
  gridMajorOpacity: 0.85,
  floorColor: "#0a1424",
  floorOpacity: 0.55,
  shadowColor: "#000000",
  shadowOpacity: 0.35,
  axisX: "#8B5CF6",
  axisY: "#EF4444",
  axisZ: "#22C55E",
  solidValid: "#8B5CF6",
  solidValidEmissive: "#7C3AED",
  solidValidEmissiveIntensity: 0.5,
  solidUnreliable: "#F59E0B",
  solidUnreliableEmissive: "#92600a",
  solidMissing: "#64748B",
  ambientIntensity: 0.5,
  mainLightColor: "#e2e8f0",
  mainLightIntensity: 1.1,
  fillLightColor: "#7C3AED",
  fillLightIntensity: 0.35,
  pointLightColor: "#06B6D4",
  pointLightIntensity: 0.4,
};

const LIGHT_PALETTE: Palette = {
  bg: "#d8deec",
  fog: "#d8deec",
  cageColor: "#7a8aaa",
  cageOpacity: 0.5,
  gridMinorColor: "#a8b4c8",
  gridMinorOpacity: 0.65,
  gridMajorColor: "#7a8aaa",
  gridMajorOpacity: 0.8,
  floorColor: "#c8d2e4",
  floorOpacity: 0.45,
  shadowColor: "#1e293b",
  shadowOpacity: 0.16,
  axisX: "#6d28d9",
  axisY: "#b91c1c",
  axisZ: "#15803d",
  solidValid: "#6d28d9",
  solidValidEmissive: "#6d28d9",
  solidValidEmissiveIntensity: 0.15,
  solidUnreliable: "#b45309",
  solidUnreliableEmissive: "#92400e",
  solidMissing: "#6b7280",
  ambientIntensity: 1.2,
  mainLightColor: "#ffffff",
  mainLightIntensity: 0.9,
  fillLightColor: "#7c3aed",
  fillLightIntensity: 0.1,
  pointLightColor: "#06B6D4",
  pointLightIntensity: 0.0,
};

// ── Subcomponents ─────────────────────────────────────────────────────────────

function CameraRig({ zoom, panX, panY }: { zoom: number; panX: number; panY: number }) {
  const { camera } = useThree();

  useFrame(() => {
    const distance = BASE_DISTANCE / zoom;
    const target = new THREE.Vector3(panX, panY, 0);
    const position = target.clone().add(VIEW_DIRECTION.clone().multiplyScalar(distance));
    camera.position.copy(position);
    camera.lookAt(target);
  });

  return null;
}

function WireframeCage({ p }: { p: Palette }) {
  const edges = useMemo(() => {
    const geometry = new THREE.BoxGeometry(CAGE_WIDTH, CAGE_HEIGHT, CAGE_DEPTH);
    return new THREE.EdgesGeometry(geometry);
  }, []);

  return (
    <lineSegments geometry={edges}>
      <lineBasicMaterial color={p.cageColor} transparent opacity={p.cageOpacity} />
    </lineSegments>
  );
}

function buildGridPositions(size: number, cellSize: number, majorEvery: number) {
  const half = size / 2;
  const steps = Math.round(size / cellSize);
  const minor: number[] = [];
  const major: number[] = [];

  for (let i = 0; i <= steps; i++) {
    const v = -half + i * cellSize;
    const isMajor = i % majorEvery === 0;
    const target = isMajor ? major : minor;
    target.push(-half, v, 0, half, v, 0);
    target.push(v, -half, 0, v, half, 0);
  }

  return { minor: new Float32Array(minor), major: new Float32Array(major) };
}

function FloorGrid({ p }: { p: Palette }) {
  const { minor, major } = useMemo(() => buildGridPositions(CAGE_WIDTH, 0.3, 3), []);

  return (
    <group position={[0, FLOOR_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[minor, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={p.gridMinorColor} transparent opacity={p.gridMinorOpacity} />
      </lineSegments>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[major, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={p.gridMajorColor} transparent opacity={p.gridMajorOpacity} />
      </lineSegments>
      <mesh rotation={[0, 0, 0]} position={[0, 0, -0.001]}>
        <planeGeometry args={[CAGE_WIDTH, CAGE_WIDTH]} />
        <meshBasicMaterial color={p.floorColor} transparent opacity={p.floorOpacity} />
      </mesh>
    </group>
  );
}

function AxisTick({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.04, 12, 12]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function Axes({ p }: { p: Palette }) {
  return (
    <group>
      <Line points={[[0, FLOOR_Y, 0], [AXIS_LENGTH, FLOOR_Y, 0]]} color={p.axisX} lineWidth={1.5} />
      <Line points={[[0, FLOOR_Y, 0], [0, FLOOR_Y + AXIS_LENGTH, 0]]} color={p.axisY} lineWidth={1.5} />
      <Line points={[[0, FLOOR_Y, 0], [0, FLOOR_Y, AXIS_LENGTH]]} color={p.axisZ} lineWidth={1.5} />
      <AxisTick position={[AXIS_LENGTH, FLOOR_Y, 0]} color={p.axisX} />
      <AxisTick position={[0, FLOOR_Y + AXIS_LENGTH, 0]} color={p.axisY} />
      <AxisTick position={[0, FLOOR_Y, AXIS_LENGTH]} color={p.axisZ} />
    </group>
  );
}

function OscillatingSolid({
  amplitudeX, amplitudeY, dataState, shape, amplification, p,
}: Visualization3DProps & { p: Palette }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const frozenPosition = useRef<[number, number]>([0, 0]);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    let x: number;
    let y: number;
    if (dataState === "valid") {
      elapsed.current += delta;
      x = Math.sin(elapsed.current * 1.6) * amplitudeX * amplification * 0.02;
      y = Math.sin(elapsed.current * 1.6 * 0.82 + 0.6) * amplitudeY * amplification * 0.02;
      frozenPosition.current = [x, y];
    } else {
      [x, y] = frozenPosition.current;
    }

    groupRef.current.position.x = x;
    groupRef.current.position.y = y;
    if (shadowRef.current) {
      shadowRef.current.position.x = x;
      shadowRef.current.position.z = y;
    }
  });

  const geometry = useMemo(() => {
    if (shape === "sphere") return <sphereGeometry args={[0.45, 48, 48]} />;
    if (shape === "box") return <boxGeometry args={[0.9, 0.5, 0.5]} />;
    return <boxGeometry args={[0.65, 0.65, 0.65]} />;
  }, [shape]);

  const color =
    dataState === "valid" ? p.solidValid :
    dataState === "unreliable" ? p.solidUnreliable :
    p.solidMissing;

  const emissive =
    dataState === "valid" ? p.solidValidEmissive :
    dataState === "unreliable" ? p.solidUnreliableEmissive :
    "#374151";

  const emissiveIntensity =
    dataState === "valid" ? p.solidValidEmissiveIntensity : 0.12;

  return (
    <>
      <mesh ref={shadowRef} position={[0, FLOOR_Y + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.45, 32]} />
        <meshBasicMaterial color={p.shadowColor} transparent opacity={p.shadowOpacity} />
      </mesh>
      <group ref={groupRef}>
        <mesh ref={meshRef}>
          {geometry}
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={emissiveIntensity}
            roughness={0.3}
            metalness={0.45}
            transparent
            opacity={dataState === "missing" ? 0.45 : 0.95}
          />
        </mesh>
      </group>
    </>
  );
}

interface SceneProps extends Visualization3DProps {
  p: Palette;
}

function Scene({ p, zoom, panX, panY, ...rest }: SceneProps) {
  return (
    <>
      <color attach="background" args={[p.bg]} />
      <fog attach="fog" args={[p.fog, 8, 16]} />
      <ambientLight intensity={p.ambientIntensity} />
      <directionalLight position={[4, 5, 4]} intensity={p.mainLightIntensity} color={p.mainLightColor} />
      <directionalLight position={[-3, 2, -2]} intensity={p.fillLightIntensity} color={p.fillLightColor} />
      {p.pointLightIntensity > 0 && (
        <pointLight position={[0, 1.5, 3]} intensity={p.pointLightIntensity} color={p.pointLightColor} />
      )}

      <PerspectiveCamera makeDefault fov={30} near={0.1} far={100} />
      <CameraRig zoom={zoom} panX={panX} panY={panY} />

      <WireframeCage p={p} />
      <FloorGrid p={p} />
      <Axes p={p} />
      <OscillatingSolid {...rest} zoom={zoom} panX={panX} panY={panY} p={p} />
    </>
  );
}

export function Visualization3D(props: Visualization3DProps) {
  const { theme } = useTheme();
  const p = theme === "dark" ? DARK_PALETTE : LIGHT_PALETTE;

  return (
    <Canvas dpr={[1, 2]} gl={{ antialias: true }}>
      <Scene {...props} p={p} />
    </Canvas>
  );
}
