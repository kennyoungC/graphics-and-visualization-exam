/*
My WebGL App
*/

// Import modules
import * as THREE from "./mods/three.module.js"
import Stats from "./mods/stats.module.js"
import { OrbitControls } from "./mods/OrbitControls.js"
import { TWEEN } from "./mods/tween.module.min.js"
import { GUI } from "./mods/lil-gui.module.min.js"
import { Water } from "./mods/Water2.js" // lib for water effect

// Global variables
let mainContainer = null
let fpsContainer = null
let stats = null
let camera = null
let renderer = null
let scene = null

let camControls = null
// Global Meshes
let gui = null
let controlBoxParams = {
  rotateSpeed: 0,
  scaleWheel: 1,
}
let plane,
  particle,
  floor,
  tire,
  wheel,
  rim = null

let water = null

function init() {
  fpsContainer = document.querySelector("#fps")
  mainContainer = document.querySelector("#webgl-scene")
  scene = new THREE.Scene()

  const background2 = new THREE.TextureLoader().load("img/desert.jpg")
  let skyGeometry = new THREE.SphereGeometry(90, 32, 32)
  let skyMaterial = new THREE.MeshBasicMaterial({
    map: background2,
    side: THREE.BackSide,
  })
  let skyBox = new THREE.Mesh(skyGeometry, skyMaterial)
  scene.add(skyBox)

  createStats()
  createCamera()
  createControls()
  createMeshes()
  createLights()
  createRenderer()

  createRotateTween()
  if (typeof wheel !== undefined) {
    createGroupRotateTween()
  }
  createCtrlBox()
  renderer.setAnimationLoop(() => {
    update()
    render()
  })
}

// Animations
function update() {
  TWEEN.update()
  // animations sliders
  if (typeof wheel !== "undefined") {
    wheel.rotation.z += controlBoxParams.rotateSpeed / 100
    wheel.rotation.y += controlBoxParams.rotateSpeed / 200
  }
}

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
  const fov = 45
  const aspect = mainContainer.clientWidth / mainContainer.clientHeight
  const near = 0.1
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

// Sliders controls
function createCtrlBox() {
  gui = new GUI()
  gui
    .add(controlBoxParams, "rotateSpeed")
    .min(1)
    .max(9)
    .step(0.1)
    .name("Wheel rotation")

  let cntScale = gui
    .add(controlBoxParams, "scaleWheel")
    .min(0.1)
    .max(2)
    .step(0.1)
    .name("Wheel size")
  cntScale.listen()
  cntScale.onChange(function (value) {
    // wheel.scale.set(1, 1, controlBoxParams.scaleWheel);
    tire.scale.set(1, 1, controlBoxParams.scaleWheel)
    rim.scale.set(1, 1, controlBoxParams.scaleWheel)
  })
}

// Light objects
function createLights() {
  const spotLight = new THREE.SpotLight(0xffffff)
  spotLight.position.set(-10, 18, 10)
  spotLight.shadow.mapSize.width = 2048 // default 512
  spotLight.shadow.mapSize.height = 2048 //default 512
  spotLight.intensity = 1.5
  spotLight.distance = 200
  spotLight.angle = Math.PI / 3
  spotLight.penumbra = 0.4 // 0 - 1
  spotLight.decay = 0.2
  spotLight.castShadow = true
  //spotLight.target = sphere;
  scene.add(spotLight)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2) // 0x111111 - 0xaaaaaa, 1 ; 0xffffff, 0.1 - 0.3; 0x404040
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

function createPlane() {
  const texture = new THREE.TextureLoader().load("img/Rock_texture.jpg") // load texture
  texture.anisotropy = 16 // set anisotropy coef.

  // Set min max texture filters
  // texture.magFilter = THREE.NearestFilter;
  texture.magFilter = THREE.LinearFilter // default mag filter

  texture.minFilter = THREE.LinearMipMapLinearFilter // default min filter

  // set repeating params
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(3, 3)
  // texture.repeat.set(0.5, 0.5); // zoom
  // texture.repeat.set(-2, -2); // repeat reversed

  const circleGeometry = new THREE.CircleGeometry(30, 30)
  // const planeMaterial =  new THREE.MeshLambertMaterial({color: 0xcccccc});
  const planeMaterial = new THREE.MeshStandardMaterial({ map: texture }) // map texture to mesh
  plane = new THREE.Mesh(circleGeometry, planeMaterial)
  plane.rotation.x = -0.5 * Math.PI
  plane.position.x = 0
  plane.position.y = 0
  plane.position.z = 0

  plane.receiveShadow = true
  scene.add(plane)
}
function createFloor() {
  const geometry = new THREE.PlaneGeometry(16, 16)
  const texture = new THREE.TextureLoader().load("img/wood.jpg")
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)

  const material = new THREE.MeshStandardMaterial({ map: texture })
  const floor = new THREE.Mesh(geometry, material)

  floor.rotation.x = -0.5 * Math.PI
  floor.position.x = -10
  floor.position.z = -10
  floor.position.y = 1

  scene.add(floor)
}
function createSideWall() {
  const shape = new THREE.Shape()
  shape.moveTo(-8, 0)
  shape.lineTo(8, 0)
  shape.lineTo(8, 8)
  shape.lineTo(0, 18)
  shape.lineTo(-8, 8)
  shape.lineTo(-8, 0)
  const extrudeGeometry = new THREE.ExtrudeGeometry(shape)
  const texture = new THREE.TextureLoader().load("img/wall_bricks_images.jpg")
  // texture.repeat.set(0.5, 0.5)
  const bump = new THREE.TextureLoader().load("img/brick_bump.jpg") // load bump map
  bump.wrapS = THREE.RepeatWrapping
  bump.wrapT = THREE.RepeatWrapping
  bump.repeat.set(0.5, 0.5)

  // Load normal map
  let normal = new THREE.TextureLoader().load("img/wall_brick_normal.jpg") // load bump map
  normal.wrapS = THREE.RepeatWrapping
  normal.wrapT = THREE.RepeatWrapping
  normal.repeat.set(0.5, 0.5)

  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(0.1, 0.05)
  const material = new THREE.MeshStandardMaterial({ map: texture })
  const sideWall = new THREE.Mesh(extrudeGeometry, material)
  sideWall.material.map.wrapS = THREE.RepeatWrapping
  sideWall.material.map.wrapT = THREE.RepeatWrapping
  sideWall.material.map.repeat.set(0.5, 0.5) // zoom texture

  material.bumpMap = bump // add map to material
  material.bumpScale = 0.3 // you can scale bump in or out [-1;1]

  material.normalMap = normal // add map to material
  material.normalScale = new THREE.Vector2(0.5, 0, 5) // you can scale normal in or out [0;1]

  sideWall.position.x = -10
  sideWall.position.z = -18
  sideWall.position.y = 1
  sideWall.receiveShadow = true
  sideWall.castShadow = true
  scene.add(sideWall)
  return sideWall
}
function createBackWall() {
  const shape = new THREE.Shape()
  shape.moveTo(-7.5, 0)
  shape.lineTo(8.5, 0)
  shape.lineTo(8.5, 8.5)
  shape.lineTo(-7.5, 8.5)
  const extrudeGeometry = new THREE.ExtrudeGeometry(shape)
  const texture = new THREE.TextureLoader().load("img/wall_bricks_images.jpg")
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(0.1, 0.05)
  const material = new THREE.MeshStandardMaterial({ map: texture })
  const backWall = new THREE.Mesh(extrudeGeometry, material)
  backWall.position.z = -9.5
  backWall.position.x = -18
  backWall.position.y = 1
  backWall.rotation.y = Math.PI * 0.5
  scene.add(backWall)
}
function createFrontWall() {
  const shape = new THREE.Shape()
  shape.moveTo(-8, 0)
  shape.lineTo(8, 0)
  shape.lineTo(8, 8)
  shape.lineTo(-8, 8)
  shape.lineTo(-8, 0)
  const window = new THREE.Path()
  window.moveTo(3, 3)
  window.lineTo(8, 3)
  window.lineTo(8, 8)
  window.lineTo(3, 8)
  window.lineTo(3, 3)
  shape.holes.push(window)
  const door = new THREE.Path()
  door.moveTo(-3, 0)
  door.lineTo(-3, 8)
  door.lineTo(-8, 8)
  door.lineTo(-8, 0)
  door.lineTo(-3, 0)
  shape.holes.push(door)
  const extrudeGeometry = new THREE.ExtrudeGeometry(shape)
  const texture = new THREE.TextureLoader().load("img/wall_bricks_images.jpg")
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(0.1, 0.05)
  const material = new THREE.MeshStandardMaterial({ map: texture })
  const frontWall = new THREE.Mesh(extrudeGeometry, material)
  frontWall.position.z = -10
  frontWall.position.x = -3
  frontWall.position.y = 1
  frontWall.rotation.y = Math.PI * 0.5
  scene.add(frontWall)
}

function createRoof() {
  const geometry = new THREE.BoxGeometry(14, 17, 1)
  // const texture = new THREE.TextureLoader().load("img/tile.jpg")
  // texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  // texture.repeat.set(2, 1)
  // texture.rotation = Math.PI / 2
  // const textureMaterial = new THREE.MeshStandardMaterial({ map: texture })
  const colorMaterial = new THREE.MeshStandardMaterial({ color: "black" })
  // const materials = [
  //   colorMaterial,
  //   colorMaterial,
  //   colorMaterial,
  //   colorMaterial,
  //   colorMaterial,
  //   textureMaterial,
  // ]
  const roof = new THREE.Mesh(geometry, colorMaterial)

  scene.add(roof)
  roof.rotation.x = Math.PI / 2
  roof.rotation.y = (-Math.PI / 4) * 1.15
  roof.position.x = -5
  roof.position.y = 14
  roof.position.z = -10
  return roof
}
function createGarageRoof() {
  const geometry = new THREE.BoxGeometry(21, 21, 1)
  const texture = new THREE.TextureLoader().load("img/favour.jpg")
  texture.anisotropy = 16

  const bump = new THREE.TextureLoader().load("img/name_bump.jpg") // load bump map
  // const bump = new THREE.TextureLoader().load("img/wood_bump.jpg")
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1, 1)
  texture.rotation = Math.PI / 2
  const textureMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    bumpMap: bump,
    bumpScale: 0.5,
  })
  bump.wrapS = THREE.RepeatWrapping
  bump.wrapT = THREE.RepeatWrapping
  bump.repeat.set(1, 1)
  const roof = new THREE.Mesh(geometry, textureMaterial)

  scene.add(roof)
  roof.rotation.x = Math.PI / 2
  roof.position.x = -3
  roof.position.z = 15
  roof.position.y = 15
  return roof
}
function createDoor() {
  let door = new THREE.PlaneGeometry(4, 7.5, 15)
  const texture = new THREE.TextureLoader().load("img/wooden_door.jpg")

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

function createParticles() {
  const geometry = new THREE.TetrahedronGeometry(2, 0)

  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    shading: THREE.FlatShading,
  })
  particle = new THREE.Object3D()
  for (let i = 0; i < 1000; i++) {
    let mesh = new THREE.Mesh(geometry, material)
    mesh.position
      .set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
      .normalize()
    mesh.position.multiplyScalar(30 + Math.random() * 700)
    mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2)
    particle.add(mesh)
  }

  scene.add(particle)
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
function createRod() {
  const geometry = new THREE.CylinderGeometry(
    0.4,
    0.4,
    15,
    35,
    8,
    false,
    0,
    6.28
  )
  const material = new THREE.MeshStandardMaterial({ color: 0x540c0f })
  const cylinder = new THREE.Mesh(geometry, material)
  scene.add(cylinder)
  cylinder.position.set(-10, 7.5, 23)
  cylinder.receiveShadow = true
  cylinder.castShadow = true

  // cylinder.position.x = -9.5
  // cylinder.position.y = 2.5
  // cylinder.position.z = 3.1

  scene.add(cylinder)
  return cylinder
}

// Create sprite
function createCloud() {
  const cloudTexture = new THREE.TextureLoader().load(
    "img/cloud-removebg-preview.png"
  )
  const cloudMaterial = new THREE.SpriteMaterial({
    map: cloudTexture,
    color: 0xffffff,
  })
  // const cloudMaterial = new THREE.SpriteMaterial( { map: cloudTexture, color: 0xffffff, transparent:true, opacity:0.7 } );
  const cloud = new THREE.Sprite(cloudMaterial)
  cloud.scale.set(20, 10, 1)
  cloud.position.set(5, 22, -5)
  scene.add(cloud)
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
  createParticles()
  createWheel(tire)
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
