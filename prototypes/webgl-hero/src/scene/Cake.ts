import * as THREE from 'three'
import { mix, random, smooth } from '../animation/config'
import type { makeCakeMaterials } from './materials'

type Materials = ReturnType<typeof makeCakeMaterials>

function organicBox(w: number, h: number, d: number, radius: number, roughness: number) {
  const geometry = new THREE.BoxGeometry(w, h, d, 64, 26, 40)
  const positions = geometry.attributes.position
  const point = new THREE.Vector3()
  const inner = new THREE.Vector3()
  for (let i = 0; i < positions.count; i++) {
    point.fromBufferAttribute(positions, i)
    inner.set(THREE.MathUtils.clamp(point.x, -w / 2 + radius, w / 2 - radius), THREE.MathUtils.clamp(point.y, -h / 2 + radius, h / 2 - radius), THREE.MathUtils.clamp(point.z, -d / 2 + radius, d / 2 - radius))
    point.sub(inner).normalize().multiplyScalar(radius).add(inner)
    const { x, y, z } = point
    const n = Math.sin(x * 35 + y * 21) * Math.sin(z * 43 + y * 26) + Math.sin(x * 71 - z * 29) * 0.4
    point.multiplyScalar(1 + n * roughness)
    positions.setXYZ(i, point.x, point.y, point.z)
  }
  geometry.computeVertexNormals()
  return geometry
}

/** A rounded rectangular ganache sheet; its edges slump over the loaf. */
function frostingGeometry() {
  const geometry = organicBox(3.65, 0.20, 2.12, 0.085, 0)
  const positions = geometry.attributes.position
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i)
    const edge = Math.pow(Math.max(Math.abs(x) / 1.83, Math.abs(z) / 1.065), 9)
    const ripple = Math.sin(x * 6 + z * 3) * 0.023 + Math.sin(x * 13 - z * 5) * 0.008
    const drip = edge * (0.07 + 0.15 * Math.pow(0.5 + 0.5 * Math.sin(x * 7 + z * 11), 5))
    positions.setY(i, y + ripple - drip)
  }
  geometry.computeVertexNormals()
  return geometry
}

export function createCake(materials: Materials, mobile: boolean) {
  const root = new THREE.Group()
  const lower = new THREE.Mesh(organicBox(3.5, 0.72, 1.98, 0.085, 0.012), materials.sponge)
  const upper = new THREE.Mesh(organicBox(3.56, 0.72, 2.02, 0.085, 0.012), materials.sponge)
  const whole = new THREE.Mesh(organicBox(3.56, 1.35, 2.02, 0.10, 0.012), materials.sponge)
  root.add(whole)
  const icing = new THREE.Mesh(frostingGeometry(), materials.fudge)
  root.add(lower, upper, icing)

  // Surface crumbs remain on the assembled cake, giving its silhouette a baked edge.
  const count = mobile ? 1400 : 3000
  const surface = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), materials.sponge, count)
  const rand = random(642)
  const dummy = new THREE.Object3D()
  for (let i = 0; i < count; i++) {
    const side = Math.floor(rand() * 4)
    const x = side < 2 ? (rand() - 0.5) * 3.42 : (side === 2 ? -1.74 : 1.74)
    const z = side < 2 ? (side === 0 ? -0.98 : 0.98) : (rand() - 0.5) * 1.93
    dummy.position.set(x, (rand() - 0.5) * 1.24, z)
    dummy.rotation.set(rand() * 6, rand() * 6, rand() * 6)
    dummy.scale.setScalar(0.009 + rand() * 0.022)
    dummy.updateMatrix()
    surface.setMatrixAt(i, dummy.matrix)
  }
  root.add(surface)


  const update = (p: number) => {
    const awaken = smooth(0.08, 0.32, p)
    const assemble = smooth(0.38, 0.72, p)
    const spacing = (1 - assemble) * mix(0.52, 1.32, awaken)
    whole.scale.y = smooth(0.64, 0.75, p)
    whole.visible = p > 0.64
    lower.visible = upper.visible = p < 0.75
    lower.position.set(-spacing * 0.28, -0.34 - spacing * 0.53, spacing * 0.08)
    upper.position.set(spacing * 0.18, 0.31 + spacing * 0.3, -spacing * 0.1)
    icing.position.set(spacing * 0.08, 0.72 + spacing * 1.14, 0)
    lower.rotation.z = -spacing * 0.075
    upper.rotation.z = spacing * 0.065
    icing.rotation.z = spacing * 0.05
    icing.rotation.y = spacing * 0.11
    surface.scale.y = mix(0.001, 1, smooth(0.59, 0.76, p))
    surface.visible = p > 0.59
    // The cap stretches, then eases down like soft fudge.
    const settle = Math.sin(smooth(0.54, 0.77, p) * Math.PI)
    icing.scale.set(1 + settle * 0.035, 1 + settle * 0.4, 1 + settle * 0.03)
  }
  return { root, update }
}
