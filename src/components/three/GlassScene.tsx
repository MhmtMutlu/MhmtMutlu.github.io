import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshTransmissionMaterial } from '@react-three/drei/core/MeshTransmissionMaterial';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

type Theme = 'light' | 'dark';

const PALETTE = {
  light: { bg: '#f2f4f8', a: '#a9c4f5', b: '#9fdcd8', c: '#c5ceda', particle: '#2563eb', env: 1.0 },
  dark: { bg: '#060a12', a: '#10306b', b: '#0b4a4a', c: '#1a2336', particle: '#60a5fa', env: 0.6 },
} as const;

function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>('light');
  useEffect(() => {
    const read = () => setTheme((document.documentElement.dataset.theme as Theme) || 'light');
    read();
    window.addEventListener('themechange', read);
    return () => window.removeEventListener('themechange', read);
  }, []);
  return theme;
}

/** Scroll progress of the hero (0 at top → 1 when hero has scrolled away). */
function useScrollProgress() {
  const p = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const h = window.innerHeight;
      p.current = THREE.MathUtils.clamp(window.scrollY / (h * 0.9), 0, 1);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return p;
}

/** Gradient backdrop rendered inside the scene so the transmission material has something to refract. */
const auroraVert = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;

function Aurora({ theme }: { theme: Theme }) {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const target = useMemo(() => ({ a: new THREE.Color(), b: new THREE.Color(), c: new THREE.Color(), bg: new THREE.Color() }), []);
  const { viewport } = useThree();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBg: { value: new THREE.Color(PALETTE.light.bg) },
      uA: { value: new THREE.Color(PALETTE.light.a) },
      uB: { value: new THREE.Color(PALETTE.light.b) },
      uC: { value: new THREE.Color(PALETTE.light.c) },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    [],
  );
  useEffect(() => {
    const p = PALETTE[theme];
    target.a.set(p.a); target.b.set(p.b); target.c.set(p.c); target.bg.set(p.bg);
  }, [theme, target]);
  useFrame((state, dt) => {
    const u = mat.current.uniforms;
    u.uTime.value += dt;
    const k = 1 - Math.pow(0.02, dt);
    u.uA.value.lerp(target.a, k); u.uB.value.lerp(target.b, k); u.uC.value.lerp(target.c, k); u.uBg.value.lerp(target.bg, k);
    u.uMouse.value.lerp(new THREE.Vector2(state.pointer.x, state.pointer.y), k * 0.5);
  });
  return (
    <mesh position={[0, 0, -6]} scale={[viewport.width * 2.2, viewport.height * 2.2, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={auroraVert}
        fragmentShader={`
          uniform float uTime; uniform vec3 uBg; uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec2 uMouse;
          varying vec2 vUv;
          float blob(vec2 uv, vec2 c, float r){ float d = distance(uv, c); return smoothstep(r, 0.0, d); }
          void main(){
            vec2 uv = vUv;
            float t = uTime * 0.08;
            vec2 c1 = vec2(0.25 + 0.12*sin(t*1.3), 0.7 + 0.1*cos(t*0.9)) + uMouse*0.04;
            vec2 c2 = vec2(0.78 + 0.1*cos(t*1.1), 0.3 + 0.12*sin(t*0.7)) - uMouse*0.03;
            vec2 c3 = vec2(0.55 + 0.15*sin(t*0.6), 0.85 + 0.08*cos(t*1.4));
            vec3 col = uBg;
            col = mix(col, uA, blob(uv, c1, 0.55) * 0.9);
            col = mix(col, uB, blob(uv, c2, 0.5) * 0.85);
            col = mix(col, uC, blob(uv, c3, 0.4) * 0.6);
            float v = smoothstep(1.1, 0.35, distance(uv, vec2(0.5)));
            col = mix(uBg, col, v);
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  );
}

function Particles({ count, color }: { count: number; color: string }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 9;
      arr[i * 3 + 2] = -1 - Math.random() * 4;
    }
    return arr;
  }, [count]);
  const target = useMemo(() => new THREE.Color(color), [color]);
  useFrame((state, dt) => {
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    ref.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.04) * 0.05;
    (ref.current.material as THREE.PointsMaterial).color.lerp(target, 1 - Math.pow(0.02, dt));
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} sizeAttenuation transparent opacity={0.7} depthWrite={false} color={color} />
    </points>
  );
}

/** Builds a small studio environment with emissive panels via PMREM, avoiding HDR loaders. */
function useStudioEnvironment(theme: Theme) {
  const { gl, scene } = useThree();
  useEffect(() => {
    const intensity = PALETTE[theme].env;
    const pmrem = new THREE.PMREMGenerator(gl);
    const studio = new THREE.Scene();
    const panel = (color: string, strength: number, position: [number, number, number], scale: [number, number]) => {
      const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, toneMapped: false });
      material.color.multiplyScalar(strength);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
      mesh.position.set(...position);
      mesh.scale.set(scale[0], scale[1], 1);
      mesh.lookAt(0, 0, 0);
      studio.add(mesh);
    };
    panel('#ffffff', intensity * 1.2, [4, 3, 4], [6, 2]);
    panel('#9fdcd8', intensity, [-5, 2, -2], [4, 4]);
    panel('#a9c4f5', intensity * 1.5, [0, -4, 3], [8, 1]);
    const target = pmrem.fromScene(studio, 0.04);
    scene.environment = target.texture;
    return () => {
      scene.environment = null;
      target.dispose();
      pmrem.dispose();
      studio.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          (obj.material as THREE.Material).dispose();
        }
      });
    };
  }, [gl, scene, theme]);
}

function GlassKnot({ mobile, progress, theme }: { mobile: boolean; progress: React.RefObject<number>; theme: Theme }) {
  const group = useRef<THREE.Group>(null!);
  const mesh = useRef<THREE.Mesh>(null!);
  const { viewport } = useThree();
  const geo = useMemo(() => new THREE.TorusKnotGeometry(1, 0.36, mobile ? 160 : 260, mobile ? 24 : 40, 2, 3), [mobile]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    mesh.current.position.y = Math.sin(t * 1.2) * 0.12;
    mesh.current.rotation.z = Math.sin(t * 0.6) * 0.08;
    const p = progress.current;
    const ease = 1 - Math.pow(1 - p, 3);
    mesh.current.rotation.x += dt * 0.12;
    mesh.current.rotation.y += dt * 0.18;
    const tx = state.pointer.x * 0.35;
    const ty = state.pointer.y * 0.25;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, tx, 3, dt);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -ty, 3, dt);

    const baseScale = mobile ? 0.5 : 0.95;
    const s = THREE.MathUtils.lerp(baseScale, baseScale * 0.28, ease);
    group.current.scale.setScalar(s);
    const restX = mobile ? 0 : viewport.width * 0.24;
    const targetX = THREE.MathUtils.lerp(restX, viewport.width / 2 - 1.1, ease);
    const targetY = THREE.MathUtils.lerp(mobile ? viewport.height * 0.22 : 0, viewport.height / 2 - 1.0, ease);
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, targetX, 6, dt);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, targetY, 6, dt);
  });

  return (
    <group ref={group} position={[mobile ? 0 : 2.4, mobile ? 2.2 : 0, 0]}>
      <mesh ref={mesh} geometry={geo}>
          <MeshTransmissionMaterial
            transmission={1}
            samples={mobile ? 4 : 8}
            resolution={mobile ? 384 : 768}
            backside
            backsideThickness={0.25}
            thickness={0.55}
            roughness={0.04}
            ior={1.5}
            chromaticAberration={0.65}
            anisotropy={0.3}
            distortion={0.35}
            distortionScale={0.5}
            temporalDistortion={0.12}
            clearcoat={1}
            clearcoatRoughness={0.05}
            attenuationDistance={3}
            attenuationColor={theme === 'dark' ? '#bfd7ff' : '#ffffff'}
            color="#ffffff"
          />
      </mesh>
    </group>
  );
}

function FirstFrameSignal({ onReady }: { onReady: () => void }) {
  const fired = useRef(false);
  useFrame(() => {
    if (fired.current) return;
    fired.current = true;
    onReady();
  });
  return null;
}

function Scene({ mobile, onReady }: { mobile: boolean; onReady: () => void }) {
  const theme = useTheme();
  const progress = useScrollProgress();
  useStudioEnvironment(theme);
  return (
    <>
      <Aurora theme={theme} />
      <Particles count={mobile ? 220 : 520} color={PALETTE[theme].particle} />
      <GlassKnot mobile={mobile} progress={progress} theme={theme} />
      <ambientLight intensity={0.4} />
      <FirstFrameSignal onReady={onReady} />
    </>
  );
}

export default function GlassScene({ mobile, onReady }: { mobile: boolean; onReady: () => void }) {
  return (
    <Canvas
      dpr={[1, mobile ? 1.5 : 2]}
      camera={{ position: [0, 0, 7], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}
      eventSource={document.body}
      eventPrefix="client"
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <Scene mobile={mobile} onReady={onReady} />
    </Canvas>
  );
}
