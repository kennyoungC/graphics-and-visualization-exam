/*
My WebGL App
*/

// Import modules
import * as THREE from "./mods/three.module.js"
import Stats from "./mods/stats.module.js"
import { OrbitControls } from "./mods/OrbitControls.js"

import { Water } from "./mods/Water2.js" // lib for water effect

// Global variables
let mainContainer = null
let fpsContainer = null
let stats = null
let camera = null
let renderer = null
let scene = null
let fishes = null

let camControls = null
// Global Meshes

let plane,
  floor,
  box,
  sphere,
  cone = null

let water = null

function init() {
  fpsContainer = document.querySelector("#fps")
  mainContainer = document.querySelector("#webgl-scene")
  scene = new THREE.Scene()
  const cubeTextureLoader = new THREE.CubeTextureLoader()
  cubeTextureLoader.setPath("img/water/")

  const cubeTexture = cubeTextureLoader.load([
    "px.png",
    "nx.png",
    "py.png",
    "ny.png",
    "pz.png",
    "nz.png",
  ])

  scene.background = cubeTexture

  createStats()
  createCamera()
  createControls()
  createMeshes()
  createLights()
  createRenderer()
  renderer.setAnimationLoop(() => {
    update()
    render()
  })
}

// Animations
function update() {}

// Statically rendered content
function render() {
  particle.rotation.x += 0.001
  particle.rotation.y -= 0.03
  stats.begin()
  renderer.render(scene, camera)
  stats.end()
}

// FPS counter
function createStats() {
  stats = new Stats()
  stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
  fpsContainer.appendChild(stats.dom)
}

// Camera object
function createCamera() {
  const fov = 60
  const aspect = mainContainer.clientWidth / mainContainer.clientHeight
  const near = 1
  const far = 500 // meters
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
  camera.position.x = 10
  camera.position.y = 20
  camera.position.z = 50
  camera.lookAt(scene.position)
}

// Interactive controls
function createControls() {
  camControls = new OrbitControls(camera, mainContainer)
  camControls.autoRotate = false
}

// Light objects
function createLights() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 1)
  scene.add(ambientLight)
}
function createWheel() {
  const texture = new THREE.TextureLoader().load("img/tire.jpg")
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(20, 5)

  const bump = new THREE.TextureLoader().load("img/tire_bump.jpg")
  bump.wrapS = THREE.RepeatWrapping
  bump.wrapT = THREE.RepeatWrapping
  bump.repeat.set(20, 5)

  let geometry = new THREE.TorusGeometry(3, 1, 16, 100)
  let material = new THREE.MeshStandardMaterial({
    map: texture,
    bumpMap: bump,
    bumpScale: 0.2,
  })
  tire = new THREE.Mesh(geometry, material)

  // tire.position.set(0, 4, -10);
  // tire.translateY(4);
  // tire.translateZ(-10);
  // scene.add( tire );

  // create rim
  const ballTexture = new THREE.TextureLoader().load("img/ball.jpg")
  let rimGeometry = new THREE.SphereGeometry(2, 32, 16)
  let rimMaterial = new THREE.MeshStandardMaterial({
    map: ballTexture,
    side: THREE.DoubleSide,
    transparent: true,
  })
  rim = new THREE.Mesh(rimGeometry, rimMaterial)

  wheel = new THREE.Group()
  wheel.add(tire)
  wheel.add(rim)

  //wheel.position.set(0, 4, -10);
  //scene.add(wheel);

  tire.translateZ(-15)
  rim.translateZ(-15)
  wheel.position.set(7, 4, 10)
  scene.add(wheel)
}
function createRotateTween() {
  let position = { rotStep: -Math.PI }
  let tween1 = new TWEEN.Tween(position).to({ rotStep: Math.PI }, 8000)
  tween1.easing(TWEEN.Easing.Linear.None)
  tween1.onUpdate(() => {
    tire.rotation.y = position.rotStep
    tire.position.x = 15 * Math.sin(position.rotStep)
    tire.position.z = 15 * Math.cos(position.rotStep)
  })
  tween1.repeat(Infinity) // 1,2 arba Infinity
  tween1.start() // stop

  let rotation = { rotZ: -Math.PI }
  let tween2 = new TWEEN.Tween(rotation).to({ rotZ: Math.PI }, 4000)
  tween2.easing(TWEEN.Easing.Linear.None)
  tween2.onUpdate(() => {
    tire.rotation.z = -rotation.rotZ
  })
  tween2.repeat(Infinity) // 1,2 arba Infinity
  tween2.start() // stop
}
function createGroupRotateTween() {
  let position = { rotStep: -Math.PI }
  let tween1 = new TWEEN.Tween(position).to({ rotStep: Math.PI }, 8000)
  tween1.easing(TWEEN.Easing.Linear.None)
  tween1.onUpdate(() => {
    wheel.rotation.y = position.rotStep
  })
  tween1.repeat(Infinity) // 1,2 arba Infinity
  tween1.start() // stop

  let rotation = { rotZ: -Math.PI }
  let tween2 = new TWEEN.Tween(rotation).to({ rotZ: Math.PI }, 4000)
  tween2.easing(TWEEN.Easing.Linear.None)
  tween2.onUpdate(() => {
    wheel.rotation.z = rotation.rotZ
    rim.rotation.z = -2 * rotation.rotZ
  })
  tween2.repeat(Infinity) // 1,2 arba Infinity
  tween2.start() // stop
}

// Create sprite
function createBubbles() {
  const bubblesTexture = new THREE.TextureLoader().load("img/bubbles.png")
  const bubblesMaterial = new THREE.SpriteMaterial({
    map: bubblesTexture,
    color: 0xffffff,
  })
  bubbles = new THREE.Sprite(bubblesMaterial)
  bubbles.scale.set(7, 5, 3)
  bubbles.position.x = -10
  bubbles.position.y = 5
  bubbles.position.z = 10
  scene.add(bubbles)
}
function createFish1() {
  const geometry = new THREE.PlaneGeometry(10, 10, 1)
  const texture = new THREE.TextureLoader().load("img/Fish1.png")
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  const colorMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
  })

  fish1 = new THREE.Mesh(geometry, colorMaterial)

  fish1.position.set(-12, -12, 13)
  scene.add(fish1)
}
function createFish2() {
  const geometry = new THREE.PlaneGeometry(10, 10, 1)
  const texture = new THREE.TextureLoader().load("img/Fish2.png")
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  const colorMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
  })

  fish2 = new THREE.Mesh(geometry, colorMaterial)

  fish2.position.set(8, -10, 7)
}
function createStarFish() {
  const geometry = new THREE.PlaneGeometry(10, 10, 1)
  const texture = new THREE.TextureLoader().load("img/starfish.png")
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  const colorMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
  })

  starFish = new THREE.Mesh(geometry, colorMaterial)

  // texture.anisotropy = 30
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1, 1)
  let doorMaterial = new THREE.MeshStandardMaterial({ map: texture })
  let doorMesh = new THREE.Mesh(door, doorMaterial)
  doorMesh.rotation.y = Math.PI * 0.5
  doorMesh.position.x = -1.85
  doorMesh.position.y = 5
  doorMesh.position.z = -5
  scene.add(doorMesh)
}

function createWindow() {
  let window = new THREE.PlaneGeometry(4, 6, 7.5)
  const texture = new THREE.TextureLoader().load("img/wooden_door.jpg")

  // texture.anisotropy = 30
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1, 1)
  let windowMaterial = new THREE.MeshStandardMaterial({ map: texture })
  let windowMesh = new THREE.Mesh(window, windowMaterial)
  windowMesh.rotation.y = Math.PI * 0.5
  windowMesh.position.x = -1.85
  windowMesh.position.y = 7
  windowMesh.position.z = -15
  scene.add(windowMesh)
}

function createWater() {
  let waterParams = {
    color: "#93B0FF",
    scale: 4,
    flowX: 0.6,
    flowY: 0.6,
    // sound: true
  }
  const waterGeometry = new THREE.CircleGeometry(30, 30)
  water = new Water(waterGeometry, {
    color: waterParams.color,
    scale: waterParams.scale,
    flowDirection: new THREE.Vector2(waterParams.flowX, waterParams.flowY),
    textureWidth: 1024,
    textureHeight: 1024,
  })
  water.rotation.x = -0.5 * Math.PI
  water.position.y = 0.5
  water.position.x = 0
  water.position.z = 0
  // water.position.y = 1
  // water.position.x = 10
  // water.position.z = 10
  scene.add(water)
}
function createGroupFishes() {
  fishes = new THREE.Group()
  fishes.add(fish1)
  fishes.add(fish2)
  scene.add(fishes)

  const tween = new TWEEN.Tween(fishes.rotation)
    .to({ y: Math.PI / 2 }, 10000) // relative animation
    .onComplete(function () {
      if (Math.abs(fishes.rotation.y) >= 2 * Math.PI) {
        fishes.rotation.y = fishes.rotation.y % (2 * Math.PI)
      }
    })
    .start()
  tween.repeat(Infinity)
}

// Meshes and other visible objects
function createMeshes() {
  createPlane()
  createSideWall()
  const sideWall2 = createSideWall()
  sideWall2.position.z = -3
  createBackWall()
  const roof1 = createRoof()
  const roof2 = createRoof()
  roof1.position.x = -5.5
  roof2.rotation.y = (Math.PI / 4) * 1.15
  roof2.position.x = -14
  createFrontWall()
  createRod()
  const rod2 = createRod()
  rod2.position.x = 5
  const rod3 = createRod()
  rod3.position.z = 9
  const rod4 = createRod()
  rod4.position.z = 9
  rod4.position.x = 7
  createGarageRoof()
  createDoor()
  createWindow()
  createFloor()
  createWater()
  createCloud()
}

// Renderer object and features
function createRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.setSize(mainContainer.clientWidth, mainContainer.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap //THREE.BasicShadowMap | THREE.PCFShadowMap | THREE.PCFSoftShadowMap
  mainContainer.appendChild(renderer.domElement)
}

window.addEventListener("resize", (e) => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

init()
