/**
 * Escena.js
 * 
 * Seminario 2 de GPC: pintar una escena básica con transformaciones, animacion y modelos importados
 * 
 * @author <miedgo@upv.es>,2023
*/

// Modulos necesarios
import * as THREE from '../../lib/three.module.js'
import {OrbitControls} from '../lib/OrbitControls.module.js'
import {GLTFLoader} from '../lib/GLTFLoader.module.js'
import loadModel from './helpers.js'

// Variables de consenso
let renderer, scene, camera;

// Variables globales
let robot, cameraControls;

// Camaras adicionales
let minimap;
const L = 100;

// Acciones
init()
loadScene()
render()

function init() {
    // Motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);
    renderer.setClearColor(new THREE.Color(0,0,0.7));
    renderer.autoClear = false; 

    // Escena
    scene = new THREE.Scene();

    // Camara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(15, 15, 15);
    cameraControls = new OrbitControls(camera, renderer.domElement);
    cameraControls.minDistance = 5;
    cameraControls.maxDistance = 500;

    // Camaras adicionales
    setMinimapCamera();

    // Captura de eventos
    window.addEventListener('resize', updateAspectRatio);
}

function setMinimapCamera() {
    //TODO: por que el brazo en mi camara apunta hacia la derecha??
    minimap = new THREE.OrthographicCamera(-L, L, L, -L, -1, 1000);
    minimap.position.set(0, 300, 0);
    minimap.lookAt(0, 0, 0);
}

function updateAspectRatio(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    const ar = window.innerWidth / window.innerHeight;
    camera.aspect = ar;
    camera.updateProjectionMatrix();
    minimap.updateProjectionMatrix();

}

async function loadScene() {
    let material = new THREE.MeshNormalMaterial();

    // Importar modelo GLTF
    // const loaderGLTF = new GLTFLoader();
    // loaderGLTF.load("../models/proyecto/buildings/low_buildingE.glb",
    //     function (gltf) {
    //         scene.add(gltf.scene);
    //         console.log(gltf);
    //         for(let node of gltf.scene.children){
    //             console.log(node);
    //             for(let mesh of node.children){
    //                 console.log(mesh);8½¾t.¥’00
    //                 mesh.material.metalness = 0;
    //             }
    //         }
    //     }
    // );

    loadModel("../models/proyecto/buildings/low_buildingE.glb", scene);

    let m1 = scene.getObjectByName("asd")
    // let m2 = m1.clone()
    // m2.position.x = 20
    console.log(m1);


    // Suelo
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 10, 10), material);
    suelo.rotation.x = -Math.PI / 2;

    scene.add(suelo);
    scene.add(new THREE.AxesHelper(3));

    // add directional light
    var hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
    hemiLight.position.set( 0, 300, 0 );
    scene.add( hemiLight );
    
    var dirLight = new THREE.DirectionalLight( 0xffffff );
    dirLight.position.set( 75, 300, -75 );
    scene.add( dirLight );

    // add ambient light
    // const ambientLight = new THREE.AmbientLight(0x404040, 1);
    // scene.add(ambientLight);


}


function update() {
    // angulo += Math.PI / 400;
    // robot.rotation.y = angulo;
}


function render() {
    renderer.clear();
    requestAnimationFrame(render);
    update();
    const ar = window.innerWidth / window.innerHeight;
    const minimap_size = ar > 1 ? window.innerHeight / 4 : window.innerWidth / 4;
    renderer.setViewport(0, window.innerHeight - minimap_size, minimap_size, minimap_size);
    renderer.render(scene, minimap);

    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
}
