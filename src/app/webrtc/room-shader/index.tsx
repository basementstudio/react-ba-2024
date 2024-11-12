import { useState, useEffect, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { rgbaToVector3 } from "./utils";

import {
  baseGeometry,
  HalfPI,
  PI,
  getCurrentViewport,
  topBottomMaterial,
  leftRightMaterial,
  backgroundMaterial,
} from "./utils";
import { Sensor } from "./sensors";
import { create } from "zustand";
import { v4 } from "uuid";

const meshes: (vp: { w: number; h: number }) => any[] = (vp) => [
  {
    // Right
    position: [vp.w * 0.5, 0, -10],
    scale: [vp.h, 20, 1],
    rotation: [-HalfPI, -HalfPI, 0],
    material: leftRightMaterial,
  },
  {
    // Left
    position: [-vp.w * 0.5, 0, -10],
    scale: [vp.h, 20, 1],
    rotation: [-HalfPI, HalfPI, 0],
    material: leftRightMaterial,
  },
  {
    // Top
    position: [0, vp.h * 0.5, -10],
    scale: [vp.w, 20, 1],
    rotation: [HalfPI, 0, PI],
    material: topBottomMaterial,
  },
  {
    // Bottom
    position: [0, -vp.h * 0.5, -10],
    scale: [vp.w, 20, 1],
    rotation: [-HalfPI, 0, 0],
    material: topBottomMaterial,
  },
  {
    // Back
    position: [0, 0, -vp.h * 2],
    scale: [vp.w, vp.h, 1],
    material: backgroundMaterial,
  },
];

const Walls = () => {
  const [camera, renderer] = useThree((state) => [state.camera, state.gl]);
  const [vp, setVp] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const handleResize = () => setVp(getCurrentViewport(camera, 48));

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [camera]);

  useEffect(() => {
    const bg = rgbaToVector3("rgba(0, 20, 0, 1)");
    topBottomMaterial.uniforms.uBgColor.value = bg;
    leftRightMaterial.uniforms.uBgColor.value = bg;
    backgroundMaterial.uniforms.uBgColor.value = bg;

    const line = rgbaToVector3("rgba(0, 255, 0, 0.5)");
    topBottomMaterial.uniforms.uLineColor.value = line;
    leftRightMaterial.uniforms.uLineColor.value = line;

    const handleResize = () => {
      const ctx = (renderer as any).getContext();
      topBottomMaterial.uniforms.uSize.value = ctx.drawingBufferWidth;
      leftRightMaterial.uniforms.uSize.value = ctx.drawingBufferHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [renderer]);

  useFrame((state) => {
    const time = state.clock.elapsedTime * 0.01;
    topBottomMaterial.uniforms.uTime.value = time;
    leftRightMaterial.uniforms.uTime.value = time;
  });

  return (
    <>
      {meshes(vp).map((mesh, i) => (
        <mesh geometry={baseGeometry} {...mesh} key={i} />
      ))}
    </>
  );
};

const Pointer = ({ position }: { position: [number, number] }) => {
  const { camera, viewport } = useThree();

  useEffect(() => {
    const handleMouseDown = () => {
      const vector = new THREE.Vector3(position[0], position[1], 3)
        .sub(camera.position)
        .normalize()
        .multiplyScalar(20); // Throw velocity
    };

    window.addEventListener("mousedown", handleMouseDown);
    return () => window.removeEventListener("mousedown", handleMouseDown);
  }, [camera, position]);

  const length = 0.02; // Length of cross lines
  const thickness = 0.005; // Thickness of cross lines
  const color = "#00ff00"; // Changed to bright green to match the theme

  return (
    <>
      <group position={[position[0], position[1], 3]}>
        {/* Horizontal line */}
        <mesh>
          <boxGeometry args={[length * 2, thickness, thickness]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>

        {/* Vertical line */}
        <mesh>
          <boxGeometry args={[thickness, length * 2, thickness]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      </group>
    </>
  );
};

interface LaserProps {
  id: string;
  position: [number, number, number];
  velocity: [number, number, number];
}

const Laser = ({ id, position, velocity }: LaserProps) => {
  const groupRef = useRef<THREE.Group | null>(null);
  const positionRef = useRef<THREE.Vector3>(new THREE.Vector3(...position));

  const removeLaser = roomShaderStore((state) => state.removeLaser);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    positionRef.current.x += velocity[0] * delta;
    positionRef.current.y += velocity[1] * delta;
    positionRef.current.z += velocity[2] * delta;

    if (positionRef.current.z < -10) {
      removeLaser(id);
    }

    groupRef.current.position.copy(positionRef.current);
  });

  const laserLength = 2; // Made longer
  const laserRadius = 0.01; // Made thinner

  return (
    <>
      <group ref={groupRef} rotation={[Math.PI / 2, 0, 0]}>
        {/* Core beam */}
        <mesh>
          <cylinderGeometry args={[laserRadius, laserRadius, laserLength, 8]} />
          <meshBasicMaterial color="#ff0000" transparent={true} opacity={0.9} />
        </mesh>

        {/* Outer glow */}
        <mesh>
          <cylinderGeometry
            args={[laserRadius * 2, laserRadius * 2, laserLength, 8]}
          />
          <meshBasicMaterial color="#ff3333" transparent={true} opacity={0.3} />
        </mesh>

        {/* Front glow */}
        <pointLight
          color="#ff0000"
          intensity={2}
          distance={1}
          position={[0, 0, -laserLength / 2]}
        />
      </group>
      <Sensor
        position={positionRef.current}
        halfSize={[laserRadius, laserRadius, laserLength]}
      />
    </>
  );
};

let lastShot = 0;

const COCKPIT_GEOMETRY = new THREE.SphereGeometry(0.3, 8, 8);
const WING_GEOMETRY = new THREE.BoxGeometry(0.8, 0.8, 0.05);
const SHIP_MATERIAL = new THREE.MeshBasicMaterial({
  color: "#00ffff",
  wireframe: true,
});

interface EnemyProps {
  position: [number, number, number];
  id: number;
}

const Enemy = ({ position, id }: EnemyProps) => {
  const positionRef = useRef<THREE.Vector3>(new THREE.Vector3(...position));
  const rotationRef = useRef<THREE.Euler>(new THREE.Euler(0, 0, 0));
  const groupRef = useRef<THREE.Group | null>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    positionRef.current.x +=
      Math.sin(state.clock.elapsedTime + id) * delta * 0.5;
    positionRef.current.z += delta * 2;

    groupRef.current.position.copy(positionRef.current);

    groupRef.current.rotation.x += delta * 1.5;
    groupRef.current.rotation.y += delta * 2;
    groupRef.current.rotation.z += delta;

    rotationRef.current.copy(groupRef.current.rotation);
  });

  const removeEnemy = roomShaderStore((state) => state.removeEnemy);
  const addExplosion = roomShaderStore((state) => state.addExplosion);
  return (
    <>
      <group ref={groupRef}>
        <mesh geometry={COCKPIT_GEOMETRY} material={SHIP_MATERIAL} />
        <group rotation={[0, 0, 0]}>
          <mesh
            position={[0.3, 0, 0]}
            rotation={[0, Math.PI / 2, 0]}
            geometry={WING_GEOMETRY}
            material={SHIP_MATERIAL}
          />
          <mesh
            position={[-0.3, 0, 0]}
            rotation={[0, Math.PI / 2, 0]}
            geometry={WING_GEOMETRY}
            material={SHIP_MATERIAL}
          />
        </group>
      </group>
      <Sensor
        active
        onIntersect={() => {
          removeEnemy(id);
          addExplosion({
            id: v4(),
            position: positionRef.current.toArray(),
          });
        }}
        rotation={rotationRef.current}
        position={positionRef.current}
        halfSize={[0.3, 0.3, 0.3]}
      />
    </>
  );
};

const EXPLOSION_PARTICLES = 15;
const PARTICLE_GEOMETRY = new THREE.SphereGeometry(0.05, 4, 4);
const PARTICLE_MATERIAL = new THREE.MeshBasicMaterial({
  color: "#00ff00",
  wireframe: false,
});

interface ExplosionProps {
  position: [number, number, number];
  id: string;
}

const Explosion = ({ position, id }: ExplosionProps) => {
  const [particles] = useState(() =>
    Array.from({ length: EXPLOSION_PARTICLES }, () => ({
      position,
      velocity: [
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
      ] as [number, number, number],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ] as [number, number, number],
    }))
  );

  const removeExplosion = roomShaderStore((state) => state.removeExplosion);

  useEffect(() => {
    const timeout = setTimeout(() => {
      removeExplosion(id);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [removeExplosion, id]);

  return (
    <>
      {particles.map((particle, i) => (
        <ExplosionParticle key={i} {...particle} />
      ))}
    </>
  );
};

interface ExplosionParticleProps {
  position: [number, number, number];
  rotation: [number, number, number];
  velocity: [number, number, number];
}

const ExplosionParticle = ({
  position,
  rotation,
  velocity,
}: ExplosionParticleProps) => {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);

  useFrame((_state, delta) => {
    if (!meshRef.current) return;
    if (!groupRef.current) return;

    groupRef.current.position.x += velocity[0] * delta;
    groupRef.current.position.y += velocity[1] * delta;
    groupRef.current.position.z += velocity[2] * delta;

    meshRef.current.rotation.x += delta * 2;
    meshRef.current.rotation.y += delta * 2;
    meshRef.current.rotation.z += delta * 2;
  });

  return (
    <group ref={groupRef} position={position as any}>
      <mesh
        rotation={rotation as any}
        ref={meshRef}
        geometry={PARTICLE_GEOMETRY}
        material={PARTICLE_MATERIAL}
      />
    </group>
  );
};

interface LaserData {
  position: [number, number, number];
  velocity: [number, number, number];
  id: string;
}

interface EnemyData {
  position: [number, number, number];
  id: number;
}

interface ExplosionData {
  position: [number, number, number];
  id: string;
}

interface RoomShaderStore {
  lasers: LaserData[];
  addLaser: (laser: LaserData) => void;
  removeLaser: (id: string) => void;
  enemies: EnemyData[];
  addEnemy: (enemy: EnemyData) => void;
  removeEnemy: (id: number) => void;
  explosions: ExplosionData[];
  addExplosion: (explosion: ExplosionData) => void;
  removeExplosion: (id: string) => void;
}

const roomShaderStore = create<RoomShaderStore>((set) => ({
  lasers: [],
  addLaser: (laser) => set((state) => ({ lasers: [...state.lasers, laser] })),
  removeLaser: (id) => {
    set((state) => ({ lasers: state.lasers.filter((l) => l.id !== id) }));
  },
  enemies: [],
  addEnemy: (enemy) => set((state) => ({ enemies: [...state.enemies, enemy] })),
  removeEnemy: (id) => {
    set((state) => ({ enemies: state.enemies.filter((e) => e.id !== id) }));
  },
  explosions: [],
  addExplosion: (explosion) =>
    set((state) => ({ explosions: [...state.explosions, explosion] })),
  removeExplosion: (id) => {
    set((state) => ({
      explosions: state.explosions.filter((e) => e.id !== id),
    }));
  },
}));

export const RoomShader = ({ controls }: { controls: any }) => {
  const [realPosition, setRealPosition] = useState<[number, number]>([0, 0]);
  const lasers = roomShaderStore((state) => state.lasers);
  const addLaser = roomShaderStore((state) => state.addLaser);
  const enemies = roomShaderStore((state) => state.enemies);
  const addEnemy = roomShaderStore((state) => state.addEnemy);
  const explosions = roomShaderStore((state) => state.explosions);

  useEffect(() => {
    if (!controls) return;

    const x = -(((controls?.gyroscope[0] + 180) % 360) - 180);
    const y = ((controls?.gyroscope[1] + 180) % 360) - 180;

    const size = 24;

    const x1 = (x / size) * 2; // Remap from -180 to 1
    const y1 = (y / size) * 2; // Remap from -180 to 1

    setRealPosition([x1, y1]);
  }, [controls]);

  useEffect(() => {
    const SHOT_COOLDOWN = 150;
    const LASER_SPEED = 15;

    if (controls?.a) {
      const now = Date.now();
      if (now - lastShot > SHOT_COOLDOWN) {
        const position = [realPosition[0], realPosition[1], 3] as [
          number,
          number,
          number
        ];

        // Calculate direction vector from pointer position
        const directionX = 0; // Scale down the effect
        const directionY = 0;
        const directionZ = -1; // Forward direction

        // Normalize the direction vector
        const length = Math.sqrt(
          directionX * directionX +
            directionY * directionY +
            directionZ * directionZ
        );
        const velocity = [
          (directionX / length) * LASER_SPEED,
          (directionY / length) * LASER_SPEED,
          (directionZ / length) * LASER_SPEED,
        ] as [number, number, number];

        addLaser({
          position,
          velocity,
          id: v4(),
        });
        lastShot = now;
      }
    }
  }, [controls, realPosition, addLaser]);

  useEffect(() => {
    const SPAWN_INTERVAL = 2000; // Spawn every 2 seconds

    const spawnEnemy = () => {
      // Random position along the top of the screen
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 5;
      const z = -10; // Start far back

      addEnemy({
        position: [x, y, z],
        id: Date.now(),
      });
    };

    // Spawn enemies periodically
    const spawnInterval = setInterval(spawnEnemy, SPAWN_INTERVAL);

    return () => {
      clearInterval(spawnInterval);
    };
  }, [addEnemy]);

  return (
    <div className="absolute inset-0 w-full overflow-hidden rounded-lg border-4 border-neutral-800 bg-black shadow-lg shadow-green-900/20">
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-green-500/5 to-green-500/10" />

      <Canvas dpr={1} flat gl={{ toneMapping: THREE.NoToneMapping }}>
        <Walls />
        {lasers.map((laser) => (
          <Laser key={laser.id} {...laser} />
        ))}
        {enemies.map((enemy) => (
          <Enemy key={enemy.id} {...enemy} />
        ))}
        {explosions.map((explosion) => (
          <Explosion key={explosion.id} {...explosion} />
        ))}
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
        <pointLight position={[-5, 3, 0]} intensity={0.4} color="#00ff00" />
        <pointLight position={[0, -2, -10]} intensity={0.3} color="#00ff00" />
        <Pointer position={realPosition} />
      </Canvas>
    </div>
  );
};
