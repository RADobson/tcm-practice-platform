'use client';

import { useRef, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import type {
  MeridianData,
  MeridianPoint,
  TreatedPoint,
  QiFlowConfig,
  MeridianFlowState,
  QiFlowState,
} from '@/lib/types';
import { MERIDIANS } from '@/lib/meridian-data';
import {
  interpolateFlowStates,
  getParticleParams,
  getMeridianPathologyColour,
} from '@/lib/qi-flow-engine';

// ============================================================
// MAIN COMPONENT
// ============================================================

interface MeridianBody3DProps {
  treatedPoints: TreatedPoint[];
  beforeState: QiFlowConfig;
  afterState: QiFlowConfig;
  patientGender: string;
  onPointClick?: (point: MeridianPoint, meridian: MeridianData, treated?: TreatedPoint) => void;
}

export default function MeridianBody3D({
  treatedPoints,
  beforeState,
  afterState,
  patientGender,
  onPointClick,
}: MeridianBody3DProps) {
  const [flowState, setFlowState] = useState<QiFlowState>('before');
  const [transitioning, setTransitioning] = useState(false);
  const transitionProgress = useRef(0);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  const toggleState = useCallback(() => {
    setTransitioning(true);
    transitionProgress.current = 0;
    setFlowState(prev => prev === 'before' ? 'after' : 'before');
  }, []);

  const treatedPointIds = useMemo(
    () => new Set(treatedPoints.map(p => p.point_id)),
    [treatedPoints]
  );

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 0.9, 2.5], fov: 45 }}
        style={{ background: '#050510' }}
        gl={{ antialias: true, alpha: false }}
      >
        <ambientLight intensity={0.15} />
        <directionalLight position={[5, 5, 5]} intensity={0.3} color="#D4A574" />
        <directionalLight position={[-3, 3, -3]} intensity={0.15} color="#00F0FF" />
        <pointLight position={[0, 2, 0]} intensity={0.2} color="#ffffff" />

        <BodyModel gender={patientGender} />

        {MERIDIANS.map(meridian => (
          <MeridianPathway
            key={meridian.id}
            meridian={meridian}
            flowState={flowState}
            beforeState={beforeState}
            afterState={afterState}
            transitioning={transitioning}
            transitionProgress={transitionProgress}
            setTransitioning={setTransitioning}
            treatedPointIds={treatedPointIds}
            treatedPoints={treatedPoints}
            hoveredPoint={hoveredPoint}
            setHoveredPoint={setHoveredPoint}
            onPointClick={onPointClick}
          />
        ))}

        <OrbitControls
          enablePan={false}
          minDistance={1.2}
          maxDistance={5}
          minPolarAngle={Math.PI * 0.1}
          maxPolarAngle={Math.PI * 0.9}
          target={[0, 0.85, 0]}
          enableDamping
          dampingFactor={0.05}
        />

        <Stars />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
        <button
          onClick={toggleState}
          className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 backdrop-blur-sm ${
            flowState === 'before'
              ? 'bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30'
              : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
          }`}
        >
          {flowState === 'before' ? 'Showing: Before Treatment' : 'Showing: After Treatment'}
        </button>
        <button
          onClick={toggleState}
          className="px-4 py-3 rounded-xl bg-dark-200/80 border border-dark-50 text-gray-300 text-sm hover:bg-dark-100/80 backdrop-blur-sm transition-colors"
        >
          Toggle {flowState === 'before' ? 'After' : 'Before'}
        </button>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-dark-400/80 backdrop-blur-sm border border-dark-50 rounded-xl p-4 text-xs space-y-2 z-10 max-w-[200px]">
        <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px] mb-2">Legend</p>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,240,255,0.6)]" />
          <span className="text-gray-300">Treated Point</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gray-500" />
          <span className="text-gray-300">Other Point</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-400 opacity-70" />
          <span className="text-gray-300">Heat / Excess</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-400 opacity-70" />
          <span className="text-gray-300">Cold / Deficiency</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-6 right-4 text-[11px] text-gray-500 z-10 text-right">
        <p>Drag to rotate</p>
        <p>Scroll to zoom</p>
        <p>Click points for details</p>
      </div>
    </div>
  );
}

// ============================================================
// BODY MODEL — Parametric semi-transparent humanoid
// ============================================================

function BodyModel({ gender }: { gender: string }) {
  const bodyRef = useRef<THREE.Group>(null);

  const isFemale = gender === 'female';

  return (
    <group ref={bodyRef}>
      {/* Head */}
      <mesh position={[0, 1.62, 0]}>
        <sphereGeometry args={[0.1, 24, 24]} />
        <meshPhysicalMaterial
          color="#1a1520"
          transparent
          opacity={0.25}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.48, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.08, 16]} />
        <meshPhysicalMaterial color="#1a1520" transparent opacity={0.2} roughness={0.8} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={
          isFemale
            ? [0.14, 0.12, 0.5, 16]
            : [0.17, 0.14, 0.5, 16]
        } />
        <meshPhysicalMaterial color="#1a1520" transparent opacity={0.2} roughness={0.8} />
      </mesh>

      {/* Chest */}
      <mesh position={[0, 1.32, 0.02]}>
        <sphereGeometry args={
          isFemale ? [0.16, 24, 24] : [0.18, 24, 24]
        } />
        <meshPhysicalMaterial color="#1a1520" transparent opacity={0.15} roughness={0.8} />
      </mesh>

      {/* Pelvis / Hips */}
      <mesh position={[0, 0.92, 0]}>
        <sphereGeometry args={
          isFemale ? [0.16, 24, 16] : [0.14, 24, 16]
        } />
        <meshPhysicalMaterial color="#1a1520" transparent opacity={0.2} roughness={0.8} />
      </mesh>

      {/* Left arm upper */}
      <mesh position={[-0.24, 1.28, 0]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.035, 0.04, 0.3, 12]} />
        <meshPhysicalMaterial color="#1a1520" transparent opacity={0.18} roughness={0.8} />
      </mesh>

      {/* Left arm lower */}
      <mesh position={[-0.3, 1.0, 0.02]} rotation={[0.1, 0, 0.1]}>
        <cylinderGeometry args={[0.03, 0.035, 0.3, 12]} />
        <meshPhysicalMaterial color="#1a1520" transparent opacity={0.18} roughness={0.8} />
      </mesh>

      {/* Right arm upper */}
      <mesh position={[0.24, 1.28, 0]} rotation={[0, 0, -0.15]}>
        <cylinderGeometry args={[0.035, 0.04, 0.3, 12]} />
        <meshPhysicalMaterial color="#1a1520" transparent opacity={0.18} roughness={0.8} />
      </mesh>

      {/* Right arm lower */}
      <mesh position={[0.3, 1.0, 0.02]} rotation={[0.1, 0, -0.1]}>
        <cylinderGeometry args={[0.03, 0.035, 0.3, 12]} />
        <meshPhysicalMaterial color="#1a1520" transparent opacity={0.18} roughness={0.8} />
      </mesh>

      {/* Left leg upper */}
      <mesh position={[-0.08, 0.68, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.4, 12]} />
        <meshPhysicalMaterial color="#1a1520" transparent opacity={0.18} roughness={0.8} />
      </mesh>

      {/* Left leg lower */}
      <mesh position={[-0.08, 0.32, 0.01]}>
        <cylinderGeometry args={[0.035, 0.045, 0.4, 12]} />
        <meshPhysicalMaterial color="#1a1520" transparent opacity={0.18} roughness={0.8} />
      </mesh>

      {/* Right leg upper */}
      <mesh position={[0.08, 0.68, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.4, 12]} />
        <meshPhysicalMaterial color="#1a1520" transparent opacity={0.18} roughness={0.8} />
      </mesh>

      {/* Right leg lower */}
      <mesh position={[0.08, 0.32, 0.01]}>
        <cylinderGeometry args={[0.035, 0.045, 0.4, 12]} />
        <meshPhysicalMaterial color="#1a1520" transparent opacity={0.18} roughness={0.8} />
      </mesh>

      {/* Left foot */}
      <mesh position={[-0.08, 0.08, 0.03]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.05, 0.04, 0.1]} />
        <meshPhysicalMaterial color="#1a1520" transparent opacity={0.18} roughness={0.8} />
      </mesh>

      {/* Right foot */}
      <mesh position={[0.08, 0.08, 0.03]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.05, 0.04, 0.1]} />
        <meshPhysicalMaterial color="#1a1520" transparent opacity={0.18} roughness={0.8} />
      </mesh>

      {/* Left hand */}
      <mesh position={[-0.35, 0.82, 0.04]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshPhysicalMaterial color="#1a1520" transparent opacity={0.18} roughness={0.8} />
      </mesh>

      {/* Right hand */}
      <mesh position={[0.35, 0.82, 0.04]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshPhysicalMaterial color="#1a1520" transparent opacity={0.18} roughness={0.8} />
      </mesh>
    </group>
  );
}

// ============================================================
// MERIDIAN PATHWAY — Line + particles + points
// ============================================================

interface MeridianPathwayProps {
  meridian: MeridianData;
  flowState: QiFlowState;
  beforeState: QiFlowConfig;
  afterState: QiFlowConfig;
  transitioning: boolean;
  transitionProgress: React.MutableRefObject<number>;
  setTransitioning: (v: boolean) => void;
  treatedPointIds: Set<string>;
  treatedPoints: TreatedPoint[];
  hoveredPoint: string | null;
  setHoveredPoint: (id: string | null) => void;
  onPointClick?: (point: MeridianPoint, meridian: MeridianData, treated?: TreatedPoint) => void;
}

function MeridianPathway({
  meridian,
  flowState,
  beforeState,
  afterState,
  transitioning,
  transitionProgress,
  setTransitioning,
  treatedPointIds,
  treatedPoints,
  hoveredPoint,
  setHoveredPoint,
  onPointClick,
}: MeridianPathwayProps) {
  const curveRef = useRef<THREE.CatmullRomCurve3 | null>(null);

  // Build smooth curve from pathway coordinates
  const curve = useMemo(() => {
    const points = meridian.pathway.map(
      ([x, y, z]) => new THREE.Vector3(x, y, z)
    );
    const c = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
    curveRef.current = c;
    return c;
  }, [meridian.pathway]);

  // Generate tube geometry for the meridian line
  const tubeGeometry = useMemo(
    () => new THREE.TubeGeometry(curve, 64, 0.003, 8, false),
    [curve]
  );

  // Get current flow state for this meridian
  const currentFlowState = useMemo(() => {
    const target = flowState === 'before' ? beforeState : afterState;
    return target.meridian_states[meridian.id] || {
      flow_speed: 0.7,
      intensity: 0.6,
      pathologies: [],
    };
  }, [flowState, beforeState, afterState, meridian.id]);

  const pathologyColour = getMeridianPathologyColour(currentFlowState);
  const lineColour = pathologyColour || meridian.colour;

  return (
    <group>
      {/* Meridian line — outer glow */}
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial
          color={lineColour}
          transparent
          opacity={0.15 * currentFlowState.intensity}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Meridian line — core */}
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial
          color={lineColour}
          transparent
          opacity={0.6 * currentFlowState.intensity}
        />
      </mesh>

      {/* Qi flow particles */}
      <QiParticles
        curve={curve}
        flowState={currentFlowState}
        baseColour={meridian.colour}
      />

      {/* Acupuncture points */}
      {meridian.points.map(point => {
        const isTreated = treatedPointIds.has(point.id);
        const isHovered = hoveredPoint === point.id;
        const treated = treatedPoints.find(t => t.point_id === point.id);

        return (
          <AcuPoint
            key={point.id}
            point={point}
            meridian={meridian}
            isTreated={isTreated}
            isHovered={isHovered}
            treated={treated}
            onHover={setHoveredPoint}
            onClick={onPointClick}
          />
        );
      })}
    </group>
  );
}

// ============================================================
// QI PARTICLES — Animated flow along meridian
// ============================================================

interface QiParticlesProps {
  curve: THREE.CatmullRomCurve3;
  flowState: MeridianFlowState;
  baseColour: string;
}

function QiParticles({ curve, flowState, baseColour }: QiParticlesProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const params = useMemo(
    () => getParticleParams(flowState, baseColour),
    [flowState, baseColour]
  );

  const particleCount = params.count;
  const offsets = useMemo(
    () => new Float32Array(particleCount).map((_, i) => i / particleCount),
    [particleCount]
  );

  const positions = useMemo(
    () => new Float32Array(particleCount * 3),
    [particleCount]
  );

  const sizes = useMemo(
    () => new Float32Array(particleCount).fill(params.size),
    [particleCount, params.size]
  );

  useFrame((_, delta) => {
    if (!particlesRef.current) return;

    const geo = particlesRef.current.geometry;
    const posAttr = geo.getAttribute('position');
    if (!posAttr) return;

    for (let i = 0; i < particleCount; i++) {
      offsets[i] = (offsets[i] + delta * params.speed * 0.3) % 1;
      const t = offsets[i];
      const point = curve.getPointAt(t);
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    }

    posAttr.needsUpdate = true;
  });

  const particleMaterial = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color(params.colour),
        size: params.size,
        transparent: true,
        opacity: params.opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    [params.colour, params.size, params.opacity]
  );

  return (
    <points ref={particlesRef} material={particleMaterial}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={particleCount}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
          count={particleCount}
        />
      </bufferGeometry>
    </points>
  );
}

// ============================================================
// ACUPUNCTURE POINT — Clickable, hoverable sphere
// ============================================================

interface AcuPointProps {
  point: MeridianPoint;
  meridian: MeridianData;
  isTreated: boolean;
  isHovered: boolean;
  treated?: TreatedPoint;
  onHover: (id: string | null) => void;
  onClick?: (point: MeridianPoint, meridian: MeridianData, treated?: TreatedPoint) => void;
}

function AcuPoint({
  point,
  meridian,
  isTreated,
  isHovered,
  treated,
  onHover,
  onClick,
}: AcuPointProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const baseSize = isTreated ? 0.012 : 0.006;
  const [x, y, z] = point.position;

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Pulse animation for treated points
    if (isTreated) {
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.2;
      meshRef.current.scale.setScalar(scale);
    }

    // Hover grow
    if (isHovered && meshRef.current) {
      meshRef.current.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), delta * 8);
    }

    // Glow animation
    if (glowRef.current && isTreated) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.2 + Math.sin(Date.now() * 0.004) * 0.15;
    }
  });

  return (
    <group position={[x, y, z]}>
      {/* Glow sphere (treated points only) */}
      {isTreated && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[baseSize * 3, 16, 16]} />
          <meshBasicMaterial
            color="#00F0FF"
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Main point sphere */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(point.id);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = 'default';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(point, meridian, treated);
        }}
      >
        <sphereGeometry args={[baseSize, 16, 16]} />
        <meshStandardMaterial
          color={isTreated ? '#00F0FF' : '#888888'}
          emissive={isTreated ? '#00F0FF' : '#444444'}
          emissiveIntensity={isTreated ? 0.8 : 0.2}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Hover label */}
      {isHovered && (
        <Billboard>
          <Html
            center
            style={{
              pointerEvents: 'none',
              transform: 'translateY(-24px)',
            }}
          >
            <div className="bg-dark-400/95 backdrop-blur-sm border border-dark-50 rounded-lg px-3 py-1.5 whitespace-nowrap shadow-xl">
              <p className="text-xs font-semibold text-cyan-400 m-0">{point.id}</p>
              <p className="text-[10px] text-gray-300 m-0">{point.name_pinyin} · {point.name_chinese}</p>
              {isTreated && treated && (
                <p className="text-[10px] text-earth-300 m-0 mt-0.5">
                  {treated.technique_chinese} ({treated.technique})
                </p>
              )}
            </div>
          </Html>
        </Billboard>
      )}
    </group>
  );
}

// ============================================================
// BACKGROUND STARS
// ============================================================

function Stars() {
  const count = 500;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial color="#334455" size={0.02} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}
