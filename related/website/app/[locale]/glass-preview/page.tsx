"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, Lightformer, MeshTransmissionMaterial, useFBO, useTexture } from "@react-three/drei";
import { CanvasTexture, ExtrudeGeometry, Group, MathUtils, NoToneMapping, PerspectiveCamera, ShaderMaterial, Shape, SRGBColorSpace, Texture } from "three";
import "./preview.css";

const products = [
  { name: "LumiQ Go", image: "/assets/home-interactive/go.webp" },
  { name: "LumiQ Tablet", image: "/assets/home-products-refined-20260907/tablet-pair.webp" },
  { name: "LumiQ OLA", image: "/assets/home-products-refined-20260907/ola-original-transparent.webp" },
];

type CardPointer = { x: number; y: number; hovered: boolean };

function GlassScene({ selected, select, sideView, content }: {
  selected: number; select: (index: number) => void; sideView: boolean; content: boolean;
}) {
  const { camera, size } = useThree();
  const opticalObjects = useRef<Group>(null);
  const pointers = useMemo(() => products.map(() => ({ x: 0, y: 0, hovered: false })), []);
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
    const g = new ExtrudeGeometry(s, { depth: .18, bevelEnabled: true, bevelThickness: .035, bevelSize: .075, bevelSegments: 6, curveSegments: 16, steps: 1 });
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
    {products.map((product, index) => <GlassCard key={product.name} geometry={geometry} index={index}
      active={selected === index} select={select} sideView={sideView} content={content} buffer={buffer.texture} pointer={pointers[index]} />)}
    {/* Mirror geometry across the contact plane; keep the original backdrop continuous. */}
    <group position={[0, -4.56, 0]} scale={[1, -1, 1]}>
      {products.map((product, index) => <GlassCard key={product.name} geometry={geometry} index={index}
        active={selected === index} select={select} sideView={sideView} content={content} buffer={buffer.texture} pointer={pointers[index]} reflected />)}
    </group>
    </group>
  </>;
}

function GlassCard({ geometry, index, active, select, sideView, content, buffer, pointer, reflected = false }: {
  geometry: ExtrudeGeometry; index: number; active: boolean; select: (index: number) => void; sideView: boolean; content: boolean; buffer: Texture; pointer: CardPointer; reflected?: boolean;
}) {
  const group = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!group.current) return;
    const angle = sideView ? .82 : index === 2 ? -.28 : .28;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hovering = pointer.hovered && !reduced;
    group.current.rotation.y = MathUtils.damp(group.current.rotation.y, angle + (hovering ? pointer.x * .07 : 0), 7, delta);
    group.current.rotation.x = MathUtils.damp(group.current.rotation.x, hovering ? -pointer.y * .045 : 0, 7, delta);
    group.current.updateMatrix();
    const m = group.current.matrix.elements;
    group.current.position.y = -2.28 + Math.abs(m[1]) * 1.625 + Math.abs(m[5]) * 2.325 + Math.abs(m[9]) * .125;
  });
  // Keep the beveled bottom on the reflecting floor at either card scale.
  return <group ref={group} position={[(index - 1) * 3.55, -2.28 + 2.325 * (active ? 1 : .9), 0]} scale={active ? 1 : .9}>
    {!reflected && <GlassShadow />}
    <mesh geometry={geometry} onPointerMove={reflected ? undefined : e => {
      e.stopPropagation();
      const local = group.current!.worldToLocal(e.point.clone());
      pointer.x = MathUtils.clamp(local.x / 1.625, -1, 1);
      pointer.y = MathUtils.clamp(local.y / 2.325, -1, 1);
      pointer.hovered = true;
      select(index);
    }} onPointerOut={reflected ? undefined : () => { pointer.hovered = false; }}
      onPointerOver={reflected ? undefined : () => select(index)} onClick={reflected ? undefined : () => select(index)}>
      <MeshTransmissionMaterial buffer={buffer} thickness={.25}
        transmission={1} roughness={active ? .7 : .38} ior={1.65} transparent opacity={reflected ? .45 : 1}
        clearcoat={1} clearcoatRoughness={.045} attenuationColor="#dcd5ea" attenuationDistance={2.5}
        chromaticAberration={0} anisotropicBlur={0} distortion={0}
        samples={16} resolution={512} backsideResolution={256} color="#ffffff" />
    </mesh>
    <PearlFlow index={index} reflected={reflected} />
    {content && <CardArtwork index={index} active={active} reflected={reflected} />}
    {content && !reflected && <Html transform position={[0, 0, .16]} distanceFactor={4}>
      <button className="glass-sample-content" onMouseEnter={() => select(index)} onFocus={() => select(index)}
        onPointerMove={e => {
          if (e.pointerType === "touch") return;
          const rect = e.currentTarget.getBoundingClientRect();
          pointer.x = MathUtils.clamp((e.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
          pointer.y = MathUtils.clamp(1 - (e.clientY - rect.top) / rect.height * 2, -1, 1);
          pointer.hovered = true;
        }} onPointerLeave={() => { pointer.hovered = false; }}
        onClick={() => select(index)} aria-pressed={active}>
        <span className="glass-accessible-label">{products[index].name} · {active ? "选中 · 70% 磨砂" : "未选中 · 38% 磨砂"}</span>
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

/* Original artwork participates in the mirrored card as well as the foreground. */
function CardArtwork({ index, active, reflected }: { index: number; active: boolean; reflected: boolean }) {
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
    ctx.fillText(active ? "选中 · 70% 磨砂" : "未选中 · 38% 磨砂", 512, 192);
    const map = new CanvasTexture(canvas); map.colorSpace = SRGBColorSpace;
    return map;
  }, [index, active]);
  useEffect(() => () => label.dispose(), [label]);
  return <>
    <mesh position={[0, .45, .16]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent opacity={reflected ? .55 : 1} depthWrite={false} toneMapped={false} />
    </mesh>
    <mesh position={[0, -1.55, .16]}>
      <planeGeometry args={[2.8, .7]} />
      <meshBasicMaterial map={label} transparent opacity={reflected ? .55 : 1} depthWrite={false} toneMapped={false} />
    </mesh>
  </>;
}

function PearlFlow({ index, reflected }: { index: number; reflected: boolean }) {
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ time: { value: 0 }, strength: { value: 1 } }), []);
  useFrame(({ clock }) => {
    if (!material.current) return;
    const live = material.current.uniforms;
    live.time.value = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : clock.elapsedTime / 22 + index * .8;
    live.strength.value = reflected ? .55 : 1;
  });
  return <mesh position={[0, 0, .2]} renderOrder={3} raycast={() => {}}>
    <planeGeometry args={[4.85, 6.25]} />
    <shaderMaterial ref={material} transparent depthWrite={false} uniforms={uniforms}
      vertexShader={`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
      fragmentShader={`varying vec2 vUv; uniform float time; uniform float strength;
        void main(){
          vec2 p=(vUv-.5)*vec2(4.85,6.25);
          vec2 q=abs(p)-vec2(1.33,2.03);
          float d=length(max(q,0.))+min(max(q.x,q.y),0.)-.295;
          float edge=1.-smoothstep(-.03,0.,d);
          float x=vUv.x+vUv.y*.42-.7-.38*sin(time);
          float band=exp(-x*x*30.);
          vec3 tint=mix(vec3(.78,.72,.94),vec3(.73,.88,.98),vUv.y);
          tint=mix(tint,vec3(1.,.82,.9),.5+.5*sin(time+vUv.y*3.));
          float rim=exp(-abs(d)*35.);
          float bloom=exp(-d*d/ .022)*.48;
          float diffusion=exp(-d*d/ .14)*.24;
          float inner=exp(-abs(d)*3.)*edge*.1;
          float alpha=min(.86,(rim*.22+bloom+diffusion+inner+edge*band*.05)*strength);
          gl_FragColor=vec4(mix(tint,vec3(1.),.78+.22*rim),alpha);
        }`} />
  </mesh>;
}

export default function GlassPreview() {
  const [selected, select] = useState(1);
  const [sideView, setSideView] = useState(false);
  const [content, setContent] = useState(true);
  return <main className="glass-preview">
    <header><p>材质样板 · 尚未替换首页</p><h1>玻璃、微光与倒影。</h1>
      <p>选中 70% 磨砂 · 未选中 38% 磨砂。悬停或点击切换。</p></header>
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
