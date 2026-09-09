"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, Lightformer, MeshTransmissionMaterial, useTexture } from "@react-three/drei";
import { ExtrudeGeometry, Group, MathUtils, NoToneMapping, OrthographicCamera, Shape } from "three";
import "./preview.css";

const products = [
  { name: "LumiQ Go", image: "/assets/home-interactive/go.webp" },
  { name: "LumiQ Tablet", image: "/assets/home-products-refined-20260907/tablet-pair.webp" },
  { name: "LumiQ OLA", image: "/assets/home-products-refined-20260907/ola-original-transparent.webp" },
];

function GlassScene({ selected, select, sideView, content }: {
  selected: number; select: (index: number) => void; sideView: boolean; content: boolean;
}) {
  const { camera, size } = useThree();
  const background = useTexture("/assets/home-interactive/pearl-light.webp");
  const geometry = useMemo(() => {
    const w = 3.1, h = 4.5, r = .22;
    const s = new Shape();
    s.moveTo(-w / 2 + r, -h / 2);
    s.lineTo(w / 2 - r, -h / 2);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r);
    s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r);
    s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    const g = new ExtrudeGeometry(s, { depth: .06, bevelEnabled: true, bevelThickness: .014, bevelSize: .014, bevelSegments: 4, curveSegments: 16, steps: 1 });
    g.center();
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => {
    (camera as OrthographicCamera).zoom = Math.min(size.width / 11.5, size.height / 5.5);
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return <>
    <mesh position={[0, 0, -1.6]}>
      <planeGeometry args={[12, 6.75]} />
      <meshBasicMaterial map={background} toneMapped={false} />
    </mesh>
    <Environment resolution={256}>
      <color attach="background" args={["#f3f0f8"]} />
      <Lightformer form="rect" intensity={2} position={[-4, 3, 4]} scale={[1.5, 8, 1]} color="#fff8fc" />
      <Lightformer form="rect" intensity={1.8} position={[5, 1, 3]} scale={[2, 7, 1]} color="#e2edff" />
      <Lightformer form="rect" intensity={2} position={[0, 6, 2]} rotation={[Math.PI / 2, 0, 0]} scale={[12, 2, 1]} />
    </Environment>
    {products.map((product, index) => <GlassCard key={product.name} geometry={geometry} index={index}
      active={selected === index} select={select} sideView={sideView} content={content} />)}
  </>;
}

function GlassCard({ geometry, index, active, select, sideView, content }: {
  geometry: ExtrudeGeometry; index: number; active: boolean; select: (index: number) => void; sideView: boolean; content: boolean;
}) {
  const group = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!group.current) return;
    const angle = sideView ? .82 : (1 - index) * .23;
    group.current.rotation.y = MathUtils.damp(group.current.rotation.y, angle, 7, delta);
  });
  return <group ref={group} position={[(index - 1) * 3.55, active ? .06 : -.13, 0]} scale={active ? 1 : .9}>
    <mesh geometry={geometry} onPointerOver={() => select(index)} onClick={() => select(index)}>
      <MeshTransmissionMaterial backside thickness={.088} backsideThickness={.088}
        transmission={1} roughness={active ? .7 : .1} ior={1.45}
        clearcoat={.6} clearcoatRoughness={.12}
        chromaticAberration={0} anisotropicBlur={0} distortion={0}
        samples={12} resolution={512} backsideResolution={256} color="#ffffff" />
    </mesh>
    {content && <Html transform position={[0, 0, .06]} distanceFactor={4}>
      <button className="glass-sample-content" onMouseEnter={() => select(index)} onFocus={() => select(index)}
        onClick={() => select(index)} aria-pressed={active}>
        {/* Original product pixels stay sharp in front of the optical layer. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={products[index].image} alt={products[index].name} />
        <strong>{products[index].name}</strong>
        <span>{active ? "选中 · 70% 磨砂" : "未选中 · 10% 磨砂"}</span>
      </button>
    </Html>}
  </group>;
}

export default function GlassPreview() {
  const [selected, select] = useState(1);
  const [sideView, setSideView] = useState(false);
  const [content, setContent] = useState(true);
  return <main className="glass-preview">
    <header><p>材质样板 · 尚未替换首页</p><h1>薄玻璃，真实的侧面。</h1>
      <p>选中 70% 磨砂 · 未选中 10% 磨砂。悬停或点击切换。</p></header>
    <div className="glass-preview-controls">
      {products.map((p, i) => <button key={p.name} aria-pressed={selected === i} onClick={() => select(i)}>{p.name}</button>)}
      <button aria-pressed={sideView} onClick={() => setSideView(!sideView)}>侧面查看厚度</button>
      <button aria-pressed={!content} onClick={() => setContent(!content)}>只看玻璃</button>
    </div>
    <div className="glass-preview-scroll"><div className="glass-preview-canvas">
      <Canvas orthographic camera={{ position: [0, 0, 12], zoom: 100, near: .1, far: 100 }} dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, toneMapping: NoToneMapping }} fallback={<p>此样板需要启用 WebGL 的浏览器。</p>}>
        <color attach="background" args={["#f5f3f9"]} />
        <Suspense fallback={<Html center>正在加载玻璃材质…</Html>}>
          <GlassScene selected={selected} select={select} sideView={sideView} content={content} />
        </Suspense>
      </Canvas>
    </div></div>
  </main>;
}
