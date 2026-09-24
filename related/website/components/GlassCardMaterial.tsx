"use client";

import {Component, useEffect, useLayoutEffect, useMemo, type ReactNode} from "react";
import {Canvas, useThree} from "@react-three/fiber";
import {Environment, Lightformer, MeshTransmissionMaterial} from "@react-three/drei";
import {CanvasTexture, ExtrudeGeometry, NoToneMapping, OrthographicCamera, Shape, SRGBColorSpace} from "three";

// One continuous solid, not separate CSS bands. The neutral transmission
// background is a studio approximation; it does not capture the live DOM.
function GlassSlab() {
  const {size, camera, invalidate} = useThree();
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
    return solid;
  }, [size.width, size.height]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const backdrop = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const context = canvas.getContext("2d")!;
    const light = context.createLinearGradient(0, 0, 440, 512);
    light.addColorStop(0, "#fafbfc");
    light.addColorStop(.3, "#c7cfd8");
    light.addColorStop(.58, "#e3e8ed");
    light.addColorStop(.82, "#f7f8fa");
    light.addColorStop(1, "#e0e5ea");
    context.fillStyle = light;
    context.fillRect(0, 0, 512, 512);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }, []);
  useEffect(() => () => backdrop.dispose(), [backdrop]);
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

export default function GlassCardMaterial() {
  return <div className="prod-glass-material" aria-hidden="true" style={{position: "absolute", inset: 0, borderRadius: 'inherit', pointerEvents: "none", zIndex: 0}}>
    <MaterialFallback>
      <Canvas orthographic camera={{position: [0, 0, 10], manual: true, near: .1, far: 30}}
        resize={{scroll: false, debounce: 0, offsetSize: true}}
        frameloop="demand" dpr={[1, 1.5]} gl={{alpha: true, antialias: true, toneMapping: NoToneMapping}}
        fallback={<FrostedFallback />}>
        <GlassSlab />
      </Canvas>
    </MaterialFallback>
    <style jsx global>{`
      .prod-glass-material canvas { width: 100% !important; height: 100% !important; }
    `}</style>
  </div>;
}
