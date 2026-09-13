import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { mix, random, smooth } from '../animation/config'
import type { makeCakeMaterials } from './materials'

export function createIngredients(materials: ReturnType<typeof makeCakeMaterials>, mobile: boolean) {
  const root = new THREE.Group()
  const rand = random(1337)
  const count = mobile ? 70 : 150
  const crumbs = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), materials.sponge, count)
  crumbs.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  root.add(crumbs)
  const data = Array.from({ length: count }, (_, i) => {
    const angle = rand() * Math.PI * 2
    const radius = 2.3 + rand() * 2.2
    return { angle, radius, y: (rand() - 0.5) * 4.7, size: 0.015 + Math.pow(rand(), 2) * 0.065,
      target: new THREE.Vector3((rand() - 0.5) * 3.3, (rand() - 0.5) * 1.25, (rand() - 0.5) * 1.9),
      seed: i * 1.73,
    }
  })
  const shards = Array.from({ length: mobile ? 6 : 11 }, (_, i) => {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(0.36 + rand() * 0.23, 0.12, 0.30 + rand() * 0.2, 2, 0.025), materials.chocolate)
    root.add(mesh)
    return { mesh, angle: i * 2.399, radius: 2.8 + rand() * 1.0, depth: (rand() - 0.5) * 2.5 }
  })

  const dustCount = mobile ? 200 : 600
  const dustPositions = new Float32Array(dustCount * 3)
  const dustSeeds = Array.from({ length: dustCount }, () => [rand() * Math.PI * 2, rand() * 2, rand()])
  const dustGeometry = new THREE.BufferGeometry()
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))
  const dustMaterial = new THREE.ShaderMaterial({
    uniforms: { uOpacity: { value: 0.28 }, uColor: { value: new THREE.Color('#74402b') } },
    vertexShader: `
      varying float vDepth;
      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vDepth = -viewPosition.z;
        gl_Position = projectionMatrix * viewPosition;
        gl_PointSize = clamp(22.0 / vDepth, 1.0, 7.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vDepth;
      void main() {
        float distanceFromCenter = length(gl_PointCoord - 0.5) * 2.0;
        float softness = exp(-distanceFromCenter * distanceFromCenter * 4.5);
        gl_FragColor = vec4(uColor, softness * uOpacity);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    transparent: true, depthWrite: false,
  })
  const dust = new THREE.Points(dustGeometry, dustMaterial)
  root.add(dust)
  const dummy = new THREE.Object3D()

  function update(p: number, time: number) {
    const gather = smooth(0.32, 0.75, p)
    const spread = Math.sin(smooth(0.03, 0.58, p) * Math.PI)
    data.forEach((item, i) => {
      const angle = item.angle + p * 3.7
      const r = item.radius + spread * 0.75
      const drift = Math.sin(time * 0.5 + item.seed) * 0.04 * (1 - gather)
      const target = item.target
      dummy.position.set(
        mix(Math.cos(angle) * r, target.x, gather),
        mix(item.y + Math.sin(angle * 1.5) * spread + drift, target.y, gather),
        mix(Math.sin(angle) * r * 0.6, target.z, gather),
      )
      dummy.rotation.set(item.seed + p * 5, item.angle + p * 6, item.seed * 2 + p * 4)
      dummy.scale.setScalar(item.size * (1 - smooth(0.67, 0.8, p) * 0.9))
      dummy.updateMatrix()
      crumbs.setMatrixAt(i, dummy.matrix)
    })
    crumbs.instanceMatrix.needsUpdate = true
    shards.forEach(({ mesh, angle, radius, depth }, i) => {
      const a = angle + p * 2.8
      const arrive = smooth(0.45 + i * 0.013, 0.73 + i * 0.012, p)
      mesh.position.set(mix(Math.cos(a) * radius, (i % 4 - 1.5) * 0.65, arrive), mix(Math.sin(a) * 2.4 + 0.45, 0.55, arrive), mix(depth, 0, arrive))
      mesh.rotation.set(a * 1.2, a + p * 5, a * 0.7)
      mesh.scale.setScalar(1 - smooth(0.63, 0.81, p))
    })
    for (let i = 0; i < dustCount; i++) {
      const [angle, radius, seed] = dustSeeds[i]
      const a = angle + p * 5
      const r = (2.3 + radius) * (1 - gather * 0.86)
      dustPositions[i * 3] = Math.cos(a) * r
      dustPositions[i * 3 + 1] = (seed - 0.5) * 4 * (1 - gather) + Math.sin(a * 2) * 0.5
      dustPositions[i * 3 + 2] = Math.sin(a) * r * 0.6
    }
    dustGeometry.attributes.position.needsUpdate = true
    dustMaterial.uniforms.uOpacity.value = 0.30 * (1 - smooth(0.55, 0.83, p))
  }
  return { root, update }
}
