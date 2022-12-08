/*
My WebGL App
*/

// Import modules
import * as THREE from "./mods/three.module.js"
import Stats from "./mods/stats.module.js"
import { OrbitControls } from "./mods/OrbitControls.js"

import { TWEEN } from "./mods/tween.module.min.js" // module for tween animations
import { GUI } from "./mods/lil-gui.module.min.js"

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

let fish1,
  fish2,
  bubbles,
  gui,
  starFish,
  water = null
let controlBoxParams = {
  rotateSpeed: 0,
  y: 0,
  x: 0,
  z: 0,
}
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
  createCtrBox()
  renderer.setAnimationLoop(() => {
    update()
    render()
  })
}

// Animations
function update() {
  TWEEN.update()
}

// Statically rendered content
function render() {
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
function createCtrBox() {
  gui = new GUI()
  gui
    .add(controlBoxParams, "z", -60, 30)
    .min(1000)
    .max(7000)
    .step(50)
    .onChange(function (value) {
      const tween = new TWEEN.Tween(fishes.rotation)
        .to({ y: Math.PI / 2 }, value) // relative animation
        .onComplete(function () {
          if (Math.abs(fishes.rotation.y) >= 2 * Math.PI) {
            fishes.rotation.y = fishes.rotation.y % (2 * Math.PI)
          }
        })
        .start()
      tween.repeat(Infinity)
    })
    .name("rotation")
  gui
    .add(controlBoxParams, "x", -30, 30)
    .step(5)
    .onChange(function (value) {
      fish2.position.x = value
    })
    .name("Fish 2 ")
}
// Light objects
function createLights() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 1)
  scene.add(ambientLight)
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

  starFish.rotation.x = Math.PI / 2
  // starFish.rotation.y = (-Math.PI / 4) * 1.15
  starFish.position.x = 30
  starFish.position.y = -14
  starFish.position.z = 5
  scene.add(starFish)
  const tween = new TWEEN.Tween(starFish.rotation)
    .to({ y: Math.PI / 2 }, 10000) // relative animation
    .onComplete(function () {
      if (Math.abs(starFish.rotation.x) >= 2 * Math.PI) {
        starFish.rotation.x = starFish.rotation.x % (2 * Math.PI)
      }
    })
    .start()
  tween.repeat(Infinity)
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
  createBubbles()
  createFish1()
  createFish2()
  createStarFish()
  createGroupFishes()
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
