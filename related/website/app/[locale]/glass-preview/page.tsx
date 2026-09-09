"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, Lightformer, MeshReflectorMaterial, MeshTransmissionMaterial, useFBO, useTexture } from "@react-three/drei";
import { CanvasTexture, ExtrudeGeometry, Group, MathUtils, NoToneMapping, PerspectiveCamera, ShaderMaterial, Shape, SRGBColorSpace, Texture } from "three";
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
  const opticalObjects = useRef<Group>(null);
  const buffer = useFBO(768, 768);
  useFrame(({ gl, scene }) => {
    if (!opticalObjects.current) return;
    const previous = gl.getRenderTarget();
    opticalObjects.current.visible = false;
    gl.setRenderTarget(buffer);
    gl.render(scene, camera);
    gl.setRenderTarget(previous);
    opticalObjects.current.visible = true;
  }, -1);
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
    const g = new ExtrudeGeometry(s, { depth: .18, bevelEnabled: true, bevelThickness: .035, bevelSize: .035, bevelSegments: 6, curveSegments: 16, steps: 1 });
    g.center();
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => {
    (camera as PerspectiveCamera).fov = MathUtils.radToDeg(2 * Math.atan(Math.max(7.2, 11.5 * size.height / size.width) / (2 * Math.hypot(36, 2.2))));
    camera.lookAt(0, -.9, 0);
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return <>
    <ambientLight intensity={2} />
    <mesh position={[0, 0, -2]}>
      <planeGeometry args={[17, 9.56]} />
      <meshBasicMaterial map={background} toneMapped={false} />
    </mesh>
    <Environment resolution={256}>
      <color attach="background" args={["#b8b3c5"]} />
      <Lightformer form="rect" intensity={4} position={[-4, 3, 4]} scale={[1.2, 8, 1]} color="#fff4fc" />
      <Lightformer form="rect" intensity={3} position={[5, 1, 3]} scale={[1, 7, 1]} color="#dae8ff" />
      <Lightformer form="rect" intensity={2} position={[0, 6, 2]} rotation={[Math.PI / 2, 0, 0]} scale={[12, 2, 1]} />
    </Environment>
    <group ref={opticalObjects}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.28, 0]}>
      <planeGeometry args={[40, 40]} />
      <MeshReflectorMaterial resolution={768} blur={[40, 16]} mirror={.85} mixBlur={.3}
        mixStrength={.95} depthScale={.2} minDepthThreshold={.8} maxDepthThreshold={1.2}
        color="#f5f3f9" envMapIntensity={.3} metalness={0} roughness={.2} />
    </mesh>
    {products.map((product, index) => <GlassCard key={product.name} geometry={geometry} index={index}
      active={selected === index} select={select} sideView={sideView} content={content} buffer={buffer.texture} />)}
    </group>
  </>;
}

function GlassCard({ geometry, index, active, select, sideView, content, buffer }: {
  geometry: ExtrudeGeometry; index: number; active: boolean; select: (index: number) => void; sideView: boolean; content: boolean; buffer: Texture;
}) {
  const group = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!group.current) return;
    const angle = sideView ? .82 : index === 2 ? -.28 : .28;
    group.current.rotation.y = MathUtils.damp(group.current.rotation.y, angle, 7, delta);
  });
  // Keep the beveled bottom on the reflecting floor at either card scale.
  return <group ref={group} position={[(index - 1) * 3.55, -2.28 + 2.285 * (active ? 1 : .9), 0]} scale={active ? 1 : .9}>
    <GlassShadow />
    <mesh geometry={geometry} onPointerOver={() => select(index)} onClick={() => select(index)}>
      <MeshTransmissionMaterial buffer={buffer} thickness={.25}
        transmission={1} roughness={active ? .7 : .1} ior={1.45}
        clearcoat={1} clearcoatRoughness={.045} attenuationColor="#dcd5ea" attenuationDistance={2.5}
        chromaticAberration={0} anisotropicBlur={0} distortion={0}
        samples={12} resolution={512} backsideResolution={256} color="#ffffff" />
    </mesh>
    <PearlFlow index={index} active={active} />
    {content && <CardArtwork index={index} active={active} />}
    {content && <Html transform position={[0, 0, .16]} distanceFactor={4}>
      <button className="glass-sample-content" onMouseEnter={() => select(index)} onFocus={() => select(index)}
        onClick={() => select(index)} aria-pressed={active}>
        <span className="glass-accessible-label">{products[index].name} · {active ? "选中 · 70% 磨砂" : "未选中 · 10% 磨砂"}</span>
      </button>
    </Html>}
  </group>;
}

function GlassShadow() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas"); canvas.width = 512; canvas.height = 768;
    const ctx = canvas.getContext("2d")!;
    ctx.shadowColor = "#67507866"; ctx.shadowBlur = 32; ctx.shadowOffsetY = 10;
    ctx.fillStyle = "#675078"; ctx.beginPath(); ctx.roundRect(38, 40, 436, 680, 32); ctx.fill();
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath(); ctx.roundRect(38, 40, 436, 680, 32); ctx.fill();
    const map = new CanvasTexture(canvas); map.colorSpace = SRGBColorSpace; return map;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh position={[0, -.03, -.17]}>
    <planeGeometry args={[3.65, 5.12]} />
    <meshBasicMaterial map={texture} transparent opacity={.6} depthWrite={false} toneMapped={false} />
  </mesh>;
}

/* Original artwork is inside the 3D scene so the floor reflects the complete card. */
function CardArtwork({ index, active }: { index: number; active: boolean }) {
  const texture = useTexture(products[index].image);
  const aspect = texture.image.width / texture.image.height;
  const width = Math.min(2.55, 2.95 * aspect), height = width / aspect;
  const label = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024; canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    ctx.textAlign = "center"; ctx.fillStyle = "#233448";
    ctx.font = "600 74px Arial, sans-serif";
    ctx.fillText(products[index].name, 512, 100);
    ctx.fillStyle = "#687286"; ctx.font = "38px Arial, sans-serif";
    ctx.fillText(active ? "选中 · 70% 磨砂" : "未选中 · 10% 磨砂", 512, 192);
    const map = new CanvasTexture(canvas); map.colorSpace = SRGBColorSpace;
    return map;
  }, [index, active]);
  useEffect(() => () => label.dispose(), [label]);
  return <>
    <mesh position={[0, .45, .16]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
    <mesh position={[0, -1.55, .16]}>
      <planeGeometry args={[2.8, .7]} />
      <meshBasicMaterial map={label} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  </>;
}

function PearlFlow({ index, active }: { index: number; active: boolean }) {
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ time: { value: 0 }, strength: { value: .1 } }), []);
  useFrame(({ clock }) => {
    if (!material.current) return;
    uniforms.time.value = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : clock.elapsedTime / 22 + index * .8;
    uniforms.strength.value = active ? .16 : .09;
  });
  return <mesh position={[0, 0, .13]}>
    <planeGeometry args={[3.08, 4.48]} />
    <shaderMaterial ref={material} transparent depthWrite={false} uniforms={uniforms}
      vertexShader={`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
      fragmentShader={`varying vec2 vUv; uniform float time; uniform float strength;
        void main(){
          vec2 p=(vUv-.5)*vec2(3.08,4.48);
          vec2 q=abs(p)-vec2(1.34,2.04);
          float d=length(max(q,0.))+min(max(q.x,q.y),0.)-.2;
          float edge=1.-smoothstep(-.03,0.,d);
          float x=vUv.x+vUv.y*.42-.7-.38*sin(time);
          float band=exp(-x*x*30.);
          vec3 tint=mix(vec3(.8,.75,.94),vec3(.76,.89,.96),vUv.y);
          tint=mix(tint,vec3(1.,.85,.91),.5+.5*sin(time+vUv.y*3.));
          gl_FragColor=vec4(mix(tint,vec3(1.),.42),edge*band*strength);
        }`} />
  </mesh>;
}

export default function GlassPreview() {
  const [selected, select] = useState(1);
  const [sideView, setSideView] = useState(false);
  const [content, setContent] = useState(true);
  return <main className="glass-preview">
    <header><p>材质样板 · 尚未替换首页</p><h1>玻璃、微光与倒影。</h1>
      <p>选中 70% 磨砂 · 未选中 10% 磨砂。悬停或点击切换。</p></header>
    <div className="glass-preview-controls">
      {products.map((p, i) => <button key={p.name} aria-pressed={selected === i} onClick={() => select(i)}>{p.name}</button>)}
      <button aria-pressed={sideView} onClick={() => setSideView(!sideView)}>侧面查看厚度</button>
      <button aria-pressed={!content} onClick={() => setContent(!content)}>只看玻璃</button>
    </div>
    <div className="glass-preview-scroll"><div className="glass-preview-canvas">
      <Canvas camera={{ position: [0, 1.3, 36], fov: 12, near: .1, far: 100 }} dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, toneMapping: NoToneMapping }} fallback={<p>此样板需要启用 WebGL 的浏览器。</p>}>
        <color attach="background" args={["#f5f3f9"]} />
        <Suspense fallback={<Html center>正在加载玻璃材质…</Html>}>
          <GlassScene selected={selected} select={select} sideView={sideView} content={content} />
        </Suspense>
      </Canvas>
    </div></div>
  </main>;
}
