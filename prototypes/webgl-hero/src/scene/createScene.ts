import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { createCake } from './Cake'
import { createIngredients } from './Ingredients'
import { makeCakeMaterials, makeShadowTexture } from './materials'
import { choreography, mix, smooth } from '../animation/config'
import type { MotionState } from '../animation/config'
import { assets } from '../assets'

export async function createScene(host: HTMLElement, motion: MotionState, onLost: () => void) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'high-performance' })
  if (!context) throw new Error('WebGL 2 is unavailable')
  const photoTexture = await new THREE.TextureLoader().loadAsync(assets.cocoaTexture).catch(() => undefined)
  const mobile = host.clientWidth < 900
  const renderer = new THREE.WebGLRenderer({ canvas, context, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1
  renderer.domElement.setAttribute('aria-hidden', 'true')
  host.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 60)
  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const environment = pmrem.fromScene(room, 0.04)
  scene.environment = environment.texture
  scene.environmentIntensity = 0.65
  room.dispose()
  pmrem.dispose()
  const key = new THREE.DirectionalLight('#fff3db', 2.7)
  key.position.set(-3, 7, 5)
  const fill = new THREE.DirectionalLight('#ffd4df', 1.3)
  fill.position.set(5, 2, -3)
  const rim = new THREE.DirectionalLight('#ffffff', 1.7)
  rim.position.set(-3, 3, -4)
  scene.add(key, fill, rim, new THREE.AmbientLight('#fff2e6', 0.7))

  const materials = makeCakeMaterials(photoTexture)
  const cake = createCake(materials, mobile)
  const ingredients = createIngredients(materials, mobile)
  const world = new THREE.Group()
  world.add(cake.root, ingredients.root)
  scene.add(world)

  const shadowTexture = makeShadowTexture()
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(7, 4.5), new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, opacity: 0.8 }))
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = -2.1
  scene.add(shadow)

  let width = host.clientWidth, height = host.clientHeight
  let pointerX = 0, pointerY = 0, lastDpr = 0
  let lastTime = 0
  const target = new THREE.Vector3()
  function resize() {
    width = host.clientWidth
    height = host.clientHeight
    lastDpr = Math.min(window.devicePixelRatio || 1, width < 700 ? choreography.mobileDpr : choreography.desktopDpr)
    renderer.setPixelRatio(lastDpr)
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }
  const redrawSize = () => { resize(); if (!document.hidden) render(lastTime) }
  const observer = new ResizeObserver(redrawSize)
  observer.observe(host)
  resize()
  let resolutionQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
  const resolutionChanged = () => {
    resolutionQuery.removeEventListener('change', resolutionChanged)
    redrawSize()
    resolutionQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
    resolutionQuery.addEventListener('change', resolutionChanged)
  }
  resolutionQuery.addEventListener('change', resolutionChanged)
  const lost = (event: Event) => { event.preventDefault(); onLost() }
  renderer.domElement.addEventListener('webglcontextlost', lost)

  function render(time: number, delta = 16) {
    lastTime = time
    if (Math.min(window.devicePixelRatio || 1, width < 700 ? choreography.mobileDpr : choreography.desktopDpr) !== lastDpr) resize()
    const p = motion.progress
    const narrow = width < 900
    const reveal = smooth(0.70, 0.95, p)
    const passage = Math.sin(smooth(0.04, 0.8, p) * Math.PI)
    const damping = 1 - Math.exp(-Math.min(delta, 64) / 220)
    pointerX = mix(pointerX, motion.paused ? 0 : motion.pointerX, damping)
    pointerY = mix(pointerY, motion.paused ? 0 : motion.pointerY, damping)
    const distance = narrow ? (width < 700 ? 17.3 : 13.8) : width / height < 1.45 ? 13.9 : 12.7
    camera.position.set(Math.sin(p * 2.1) * 0.3, 3.0 + passage * 0.8, distance - reveal * 0.65)
    target.set(0, 0, 0)
    camera.lookAt(target)
    const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance
    const viewWidth = viewHeight * camera.aspect
    world.position.x = narrow ? 0 : viewWidth * 0.208
    world.position.y = narrow ? -0.35 : 0.12
    world.scale.setScalar(narrow ? 0.98 : 1.08)
    world.rotation.set(0.10 + pointerY * 0.045, -0.48 + passage * 0.75 - reveal * 0.08 + pointerX * 0.055, -0.15 + passage * 0.14 + reveal * 0.05)
    world.position.y += motion.paused ? 0 : Math.sin(time * 0.7) * 0.028
    cake.update(p)
    ingredients.update(p, motion.paused ? 0 : time)
    shadow.position.x = world.position.x
    shadow.position.y = narrow ? -2.3 : -2.05
    shadow.scale.setScalar(mix(1.25, 0.88, reveal))
    shadow.material.opacity = mix(0.34, 0.8, reveal)
    key.intensity = mix(2.7, 3.2, reveal)
    renderer.render(scene, camera)
  }

  let disposed = false
  return {
    render,
    dispose() {
      if (disposed) return
      disposed = true
      observer.disconnect()
      resolutionQuery.removeEventListener('change', resolutionChanged)
      renderer.domElement.removeEventListener('webglcontextlost', lost)
      const geometries = new Set<THREE.BufferGeometry>()
      const mats = new Set<THREE.Material>()
      scene.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          geometries.add(object.geometry)
          const list = Array.isArray(object.material) ? object.material : [object.material]
          list.forEach(material => mats.add(material))
          if (object instanceof THREE.InstancedMesh) object.dispose()
        }
      })
      geometries.forEach(geometry => geometry.dispose())
      mats.forEach(material => material.dispose())
      materials.crumbMap.dispose()
      materials.bumpMap.dispose()
      shadowTexture.dispose()
      environment.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
