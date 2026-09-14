import * as THREE from 'three'
import { random } from '../animation/config'

/** Seeded, locally generated maps. No external texture fetches or shader noise per frame. */
export function makeCakeMaterials(photoTexture?: THREE.Texture) {
  const rand = random(719)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1024
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#673925'
  ctx.fillRect(0, 0, 1024, 1024)
  for (let i = 0; i < 52000; i++) {
    const x = rand() * 1024, y = rand() * 1024, radius = rand() * 4.2 + 0.3
    const value = Math.floor(rand() * 75 + 27)
    ctx.fillStyle = `rgb(${value + 30}, ${value * 0.61}, ${value * 0.37})`
    ctx.beginPath()
    ctx.ellipse(x, y, radius * 1.5, radius, rand() * 3, 0, Math.PI * 2)
    ctx.fill()
  }
  for (let i = 0; i < 3300; i++) {
    const x = rand() * 1024, y = rand() * 1024, radius = 1 + rand() * 4.5
    ctx.fillStyle = '#25150e'
    ctx.beginPath()
    ctx.ellipse(x, y, radius, radius * 0.66, rand() * 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#915937'
    ctx.lineWidth = 0.6
    ctx.stroke()
  }
  const crumbMap = photoTexture ?? new THREE.CanvasTexture(canvas)
  crumbMap.colorSpace = THREE.SRGBColorSpace
  crumbMap.wrapS = crumbMap.wrapT = THREE.RepeatWrapping
  crumbMap.anisotropy = 4
  const bumpMap = crumbMap.clone()
  bumpMap.colorSpace = THREE.NoColorSpace
  bumpMap.needsUpdate = true
  const sponge = new THREE.MeshStandardMaterial({
    color: '#b6a08d', map: crumbMap, bumpMap, bumpScale: 0.07,
    roughness: 0.92, metalness: 0,
  })
  const fudge = new THREE.MeshPhysicalMaterial({
    color: '#34180d', roughness: 0.48, metalness: 0,
    clearcoat: 0.12, clearcoatRoughness: 0.46, envMapIntensity: 0.32,
    bumpMap, bumpScale: 0.002,
  })
  const chocolate = new THREE.MeshPhysicalMaterial({ color: '#35190f', roughness: 0.55, clearcoat: 0.08, envMapIntensity: 0.4 })
  return { sponge, fudge, chocolate, crumbMap, bumpMap }
}

export function makeShadowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 128
  const context = canvas.getContext('2d')!
  const gradient = context.createRadialGradient(64, 64, 5, 64, 64, 63)
  gradient.addColorStop(0, 'rgba(60,25,15,0.4)')
  gradient.addColorStop(0.45, 'rgba(60,25,15,0.18)')
  gradient.addColorStop(1, 'rgba(60,25,15,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(canvas)
}
