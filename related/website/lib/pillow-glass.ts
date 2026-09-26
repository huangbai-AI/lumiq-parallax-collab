import {BufferGeometry, Float32BufferAttribute} from 'three';

export function createPillowGeometry(width: number, height: number) {
  const around = 128, rings = 48;
  const depth = Math.min(.58, width * .24, height * .24);
  const positions: number[] = [0, 0, -depth];
  const indices: number[] = [];
  const signedPower = (v: number, power: number) => Math.sign(v) * Math.pow(Math.abs(v), power);
  // A superellipsoid: no planar cap, bevel band, or second rear outline.
  for (let row = 1; row < rings; row++) {
    const latitude = -Math.PI / 2 + row * Math.PI / rings;
    const spread = Math.pow(Math.cos(latitude), .42);
    for (let column = 0; column < around; column++) {
      const angle = column * Math.PI * 2 / around;
      positions.push(
        width / 2 * spread * signedPower(Math.cos(angle), .2),
        height / 2 * spread * signedPower(Math.sin(angle), .2),
        depth * signedPower(Math.sin(latitude), .75),
      );
    }
  }
  const top = positions.length / 3;
  positions.push(0, 0, depth);
  for (let column = 0; column < around; column++) {
    const next = (column + 1) % around;
    indices.push(0, 1 + next, 1 + column);
    for (let row = 0; row < rings - 2; row++) {
      const a = 1 + row * around + column, b = 1 + row * around + next;
      indices.push(a, b, a + around, b, b + around, a + around);
    }
    const last = 1 + (rings - 2) * around;
    indices.push(top, last + column, last + next);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
