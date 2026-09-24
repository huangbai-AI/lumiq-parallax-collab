"use client";

import {Component, useEffect, useMemo, type ReactNode} from "react";
import {Canvas, useThree} from "@react-three/fiber";
import {Environment, Lightformer, MeshTransmissionMaterial} from "@react-three/drei";
import {CanvasTexture, ExtrudeGeometry, NoToneMapping, Shape, SRGBColorSpace} from "three";

// One continuous solid, not separate CSS bands. The neutral transmission
// background is a studio approximation; it does not capture the live DOM.
function GlassSlab() {
  const {viewport} = useThree();
  const geometry = useMemo(() => {
    const w = Math.max(.4, viewport.width - .4);
    const h = Math.max(.4, viewport.height - .4);
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
  }, [viewport.width, viewport.height]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const backdrop = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const context = canvas.getContext("2d")!;
    const light = context.createLinearGradient(0, 0, 440, 512);
    light.addColorStop(0, "#f7f8fa");
    light.addColorStop(.3, "#dce1e7");
    light.addColorStop(.62, "#f1f3f6");
    light.addColorStop(1, "#ffffff");
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
      <Lightformer position={[-3, 3, 4]} scale={[5, 7, 1]} intensity={2.5} />
      <Lightformer position={[4, 1, 3]} scale={[2, 6, 1]} intensity={1.2} />
      <Lightformer position={[0, -4, 2]} scale={[6, 2, 1]} intensity={1.8} />
    </Environment>
    <mesh geometry={geometry}>
      <MeshTransmissionMaterial background={backdrop} color="#ffffff"
        transmission={.96} roughness={.3} thickness={.5} ior={1.46}
        clearcoat={.35} clearcoatRoughness={.22} envMapIntensity={.85}
        chromaticAberration={0} distortion={0} temporalDistortion={0}
        samples={8} resolution={256} />
    </mesh>
  </>;
}

class MaterialFallback extends Component<{children: ReactNode}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function GlassCardMaterial() {
  return <div aria-hidden="true" style={{position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0}}>
    <MaterialFallback>
      <Canvas orthographic camera={{position: [0, 0, 10], zoom: 100, near: .1, far: 30}}
        frameloop="demand" dpr={[1, 1.5]} gl={{alpha: true, antialias: true, toneMapping: NoToneMapping}}
        fallback={<span />}>
        <GlassSlab />
      </Canvas>
    </MaterialFallback>
  </div>;
}
