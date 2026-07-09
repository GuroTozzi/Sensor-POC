import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
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

/** Fixed elevated viewing direction (not user-orbitable) — gives the scene
 * the angled, technical look of the reference without ever rotating/tilting
 * on user input. Only distance (zoom) and target (pan) change. */
const VIEW_DIRECTION = new THREE.Vector3(1, 0.72, 1.35).normalize();
const BASE_DISTANCE = 7;

const CAGE_WIDTH = 3.6;
const CAGE_HEIGHT = 2.4;
const CAGE_DEPTH = 2.4;
const FLOOR_Y = -CAGE_HEIGHT / 2;

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

function WireframeCage() {
  const edges = useMemo(() => {
    const geometry = new THREE.BoxGeometry(CAGE_WIDTH, CAGE_HEIGHT, CAGE_DEPTH);
    return new THREE.EdgesGeometry(geometry);
  }, []);

  return (
    <lineSegments geometry={edges}>
      <lineBasicMaterial color="#3a4a63" transparent opacity={0.55} />
    </lineSegments>
  );
}

/** Flat technical reticle used as the cage floor. */
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

function FloorGrid() {
  const { minor, major } = useMemo(() => buildGridPositions(CAGE_WIDTH, 0.3, 3), []);

  return (
    <group position={[0, FLOOR_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[minor, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#1c2940" transparent opacity={0.6} />
      </lineSegments>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[major, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#334155" transparent opacity={0.85} />
      </lineSegments>
      <mesh rotation={[0, 0, 0]} position={[0, 0, -0.001]}>
        <planeGeometry args={[CAGE_WIDTH, CAGE_WIDTH]} />
        <meshBasicMaterial color="#0a1424" transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

const AXIS_LENGTH = 1.5;

function AxisTick({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.04, 12, 12]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function Axes() {
  return (
    <group>
      <Line points={[[0, FLOOR_Y, 0], [AXIS_LENGTH, FLOOR_Y, 0]]} color="#8B5CF6" lineWidth={1.5} />
      <Line points={[[0, FLOOR_Y, 0], [0, FLOOR_Y + AXIS_LENGTH, 0]]} color="#EF4444" lineWidth={1.5} />
      <Line points={[[0, FLOOR_Y, 0], [0, FLOOR_Y, AXIS_LENGTH]]} color="#22C55E" lineWidth={1.5} />
      <AxisTick position={[AXIS_LENGTH, FLOOR_Y, 0]} color="#8B5CF6" />
      <AxisTick position={[0, FLOOR_Y + AXIS_LENGTH, 0]} color="#EF4444" />
      <AxisTick position={[0, FLOOR_Y, AXIS_LENGTH]} color="#22C55E" />
    </group>
  );
}

function OscillatingSolid({ amplitudeX, amplitudeY, dataState, shape, amplification }: Visualization3DProps) {
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

  const color = dataState === "valid" ? "#8B5CF6" : dataState === "unreliable" ? "#F59E0B" : "#64748B";
  const emissive = dataState === "valid" ? "#7C3AED" : dataState === "unreliable" ? "#92600a" : "#1f2937";

  return (
    <>
      <mesh ref={shadowRef} position={[0, FLOOR_Y + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.45, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>
      <group ref={groupRef}>
        <mesh ref={meshRef}>
          {geometry}
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={dataState === "valid" ? 0.5 : 0.2}
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

function Scene(props: Visualization3DProps) {
  const { zoom, panX, panY } = props;
  return (
    <>
      <color attach="background" args={["#050b14"]} />
      <fog attach="fog" args={["#050b14", 8, 16]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 5, 4]} intensity={1.1} color="#e2e8f0" />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} color="#7C3AED" />
      <pointLight position={[0, 1.5, 3]} intensity={0.4} color="#06B6D4" />

      <PerspectiveCamera makeDefault fov={30} near={0.1} far={100} />
      <CameraRig zoom={zoom} panX={panX} panY={panY} />

      <WireframeCage />
      <FloorGrid />
      <Axes />
      <OscillatingSolid {...props} />
    </>
  );
}

export function Visualization3D(props: Visualization3DProps) {
  return (
    <Canvas dpr={[1, 2]} gl={{ antialias: true }}>
      <Scene {...props} />
    </Canvas>
  );
}
