"use client";

import {Component, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode} from "react";
import {Canvas, useFrame, useThree} from "@react-three/fiber";
import {Environment, Lightformer, MeshTransmissionMaterial} from "@react-three/drei";
import {CanvasTexture, ExtrudeGeometry, LinearToneMapping, OrthographicCamera, Shape, SRGBColorSpace} from "three";
import {toCreasedNormals} from "three/examples/jsm/utils/BufferGeometryUtils.js";

function paintStudio(canvas: HTMLCanvasElement, phase: number) {
  const context = canvas.getContext('2d')!;
  const base = context.createLinearGradient(0, 0, 440, 512);
  base.addColorStop(0, '#f4f6fa');
  base.addColorStop(.32, '#c7cfd8');
  base.addColorStop(.65, '#e4e8ef');
  base.addColorStop(1, '#eef0f5');
  context.fillStyle = base;
  context.fillRect(0, 0, 512, 512);
  for (const [offset, color] of [[0, 'rgba(153,196,235,.38)'], [Math.PI, 'rgba(194,176,224,.30)']] as const) {
    const x = 256 + Math.cos(phase + offset) * 190;
    const y = 256 + Math.sin(phase + offset) * 150;
    const light = context.createRadialGradient(x, y, 0, x, y, 340);
    light.addColorStop(0, color);
    light.addColorStop(1, 'rgba(235,240,250,0)');
    context.fillStyle = light;
    context.fillRect(0, 0, 512, 512);
  }
}

// One continuous solid, not separate CSS bands. The neutral transmission
// background is a studio approximation; it does not capture the live DOM.
function GlassSlab({running}: {running: boolean}) {
  const {size, camera, invalidate} = useThree();
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(invalidate, 1000 / 12);
    return () => window.clearInterval(timer);
  }, [running, invalidate]);
  // Commit the projection and geometry together. R3F's automatic projection
  // resize can otherwise expose the old slab in the new viewport for a frame.
  useLayoutEffect(() => {
    const lens = camera as OrthographicCamera;
    lens.left = -size.width / 200;
    lens.right = size.width / 200;
    lens.top = size.height / 200;
    lens.bottom = -size.height / 200;
    lens.updateProjectionMatrix();
    invalidate();
  }, [size.width, size.height, camera, invalidate]);
  const geometry = useMemo(() => {
    const w = Math.max(.4, size.width / 100 - .4);
    const h = Math.max(.4, size.height / 100 - .4);
    const r = Math.min(.32, w / 3, h / 3);
    const shape = new Shape();
    shape.moveTo(-w / 2 + r, -h / 2);
    shape.lineTo(w / 2 - r, -h / 2);
    shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    shape.lineTo(w / 2, h / 2 - r);
    shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    shape.lineTo(-w / 2 + r, h / 2);
    shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    shape.lineTo(-w / 2, -h / 2 + r);
    shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    const solid = new ExtrudeGeometry(shape, {
      depth: .18, bevelEnabled: true, bevelSize: .18,
      bevelThickness: .16, bevelSegments: 16, curveSegments: 24, steps: 1,
    });
    solid.center();
    return toCreasedNormals(solid, Math.PI / 3);
  }, [size.width, size.height]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const backdrop = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    paintStudio(canvas, 0);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }, []);
  useEffect(() => () => backdrop.dispose(), [backdrop]);
  const lastPaint = useRef(-1);
  useFrame(({clock}) => {
    const elapsed = clock.getElapsedTime();
    if (elapsed - lastPaint.current < 1 / 20) return;
    lastPaint.current = elapsed;
    paintStudio(backdrop.image as HTMLCanvasElement, elapsed * Math.PI * 2 / 40);
    backdrop.needsUpdate = true;
  });
  return <>
    <ambientLight intensity={.35} />
    <Environment resolution={128}>
      <Lightformer position={[-3, 3, 4]} rotation={[0, -.35, -.35]} scale={[3, 7, 1]} intensity={3.2} />
      <Lightformer position={[4, 1, 3]} rotation={[0, .45, .2]} scale={[1.3, 6, 1]} intensity={1.8} />
      <Lightformer position={[0, -4, 2]} scale={[6, 3, 1]} intensity={.65} />
    </Environment>
    <mesh geometry={geometry}>
      <MeshTransmissionMaterial background={backdrop} color="#ffffff"
        transmission={.96} roughness={.3} thickness={.5} ior={1.46}
        clearcoat={.55} clearcoatRoughness={.18} envMapIntensity={1.05}
        chromaticAberration={0} distortion={0} temporalDistortion={0}
        samples={8} resolution={256} />
    </mesh>
  </>;
}

class MaterialFallback extends Component<{children: ReactNode}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  render() { return this.state.failed ? <FrostedFallback /> : this.props.children; }
}

function FrostedFallback() {
  return <div style={{position: 'absolute', inset: 0, borderRadius: 'inherit', background: 'rgba(237,240,245,.7)', backdropFilter: 'blur(30px)'}} />;
}

export default function GlassCardMaterial({animated = false}: {animated?: boolean}) {
  const container = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const update = () => setRunning(visible && !reduced.matches && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    if (container.current) observer.observe(container.current);
    reduced.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); reduced.removeEventListener('change', update); document.removeEventListener('visibilitychange', update); };
  }, []);
  return <div ref={container} className="prod-glass-material" aria-hidden="true" style={{position: "absolute", inset: 0, borderRadius: 'inherit', pointerEvents: "none", zIndex: 0}}>
    <MaterialFallback>
      <Canvas orthographic camera={{position: [0, 0, 10], manual: true, near: .1, far: 30}}
        resize={{scroll: false, debounce: 0, offsetSize: true}}
        frameloop="demand" dpr={[1, 1.5]} gl={{alpha: true, antialias: true, toneMapping: LinearToneMapping, toneMappingExposure: 1.3}}
        fallback={<FrostedFallback />}>
        <GlassSlab running={running && animated} />
      </Canvas>
    </MaterialFallback>
    <style jsx global>{`
      .prod-glass-material canvas { width: 100% !important; height: 100% !important; }
      .prod-glass-material { filter: drop-shadow(0 12px 16px rgba(37,43,52,.16)); }
    `}</style>
  </div>;
}
