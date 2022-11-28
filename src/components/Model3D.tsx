import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { listenResize } from '@/utils/three-util'

const Model3D = () => {
  const mainCanvas = useRef<HTMLCanvasElement>(null)
  const loadModel = () => {
    let mixer: THREE.AnimationMixer | null = null
    const scene = new THREE.Scene()
    // Size
    const sizes = {
      width: 1000,
      height: 1000,
    }
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100
    )
    camera.position.set(4, 4, 6)

    /**
     * Objects
     */
    // plane
    // const plane = new THREE.Mesh(
    //   new THREE.PlaneGeometry(15, 15),
    //   new THREE.MeshStandardMaterial({
    //     color: '#607D8B',
    //   })
    // )
    // plane.rotateX(-Math.PI / 2)
    // plane.receiveShadow = true
    // scene.add(plane)
    /**
     * Models
     */
    const gltfLoader = new GLTFLoader()
    // draco
    // Optional: Provide a DRACOLoader instance to decode compressed mesh data
    const dracoLoader = new DRACOLoader()
    // Specify path to a folder containing WASM/JS decoding libraries.
    dracoLoader.setDecoderPath('../assets/draco/')
    // Optional: Pre-fetch Draco WASM/JS module.
    dracoLoader.preload()
    gltfLoader.setDRACOLoader(dracoLoader)
    gltfLoader.load(
      // '../assets/models/Duck/glTF/Duck.gltf',
      // '../assets/models/Duck/glTF-Binary/Duck.glb',
      '../assets/models/Fox/glTF/Fox.gltf',
      // '../assets/models/FlightHelmet/glTF/FlightHelmet.gltf',
      (gltf) => {
        gltf.scene.scale.set(0.02, 0.02, 0.02)
        scene.add(gltf.scene)

        mixer = new THREE.AnimationMixer(gltf.scene)
        const action = mixer.clipAction(gltf.animations[0])
        action.play()
      },
      (progress) => {
        console.log('progress')
        console.log(progress)
      },
      (error) => {
        console.log('error')
        console.log(error)
      }
    )
    /**
     * Light
     */
    const directionLight = new THREE.DirectionalLight()
    directionLight.castShadow = true
    directionLight.position.set(5, 5, 6)
    directionLight.shadow.camera.near = 1
    directionLight.shadow.camera.far = 20
    directionLight.shadow.camera.top = 10
    directionLight.shadow.camera.right = 10
    directionLight.shadow.camera.bottom = -10
    directionLight.shadow.camera.left = -10

    const directionLightHelper = new THREE.DirectionalLightHelper(
      directionLight,
      2
    )
    directionLightHelper.visible = false
    scene.add(directionLightHelper)

    const directionalLightCameraHelper = new THREE.CameraHelper(
      directionLight.shadow.camera
    )
    directionalLightCameraHelper.visible = false
    scene.add(directionalLightCameraHelper)

    const ambientLight = new THREE.AmbientLight(new THREE.Color('#ffffff'), 0.3)
    scene.add(ambientLight, directionLight)

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: mainCanvas.current,
      antialias: true,
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    const clock = new THREE.Clock()
    let previousTime = 0
    const tick = () => {
      const elapsedTime = clock.getElapsedTime()
      const deltaTime = elapsedTime - previousTime
      previousTime = elapsedTime

      // update mixer
      if (mixer) {
        mixer.update(deltaTime)
      }

      // Render
      renderer.render(scene, camera)
      requestAnimationFrame(tick)
    }

    tick()

    // listenResize(sizes, camera, renderer)
  }
  useEffect(() => {
    loadModel()
  }, [])
  return (
    <div>
      <canvas ref={mainCanvas} className=""></canvas>
    </div>
  )
}

export default Model3D
