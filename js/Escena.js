/**
 * Escena.js
 * 
 * Seminario 2 de GPC: pintar una escena básica con transformaciones, animacion y modelos importados
 * 
 * @author <miedgo@upv.es>,2023
*/

// Modulos necesarios
import * as THREE from '../lib/three.module.js'
import {GLTFLoader} from '../lib/GLTFLoader.module.js'

// Variables de consenso
let renderer, scene, camera;

// Variables globales
let esferacubo, angulo = 0;

// Acciones
init()
loadScene()
render()

function init() {
    // Motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);
    // renderer.setClearColor(new THREE.Color("0000AA")); // lo mismo que scene.background

    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0,0,0.7);

    // Camara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(2, 2, 5);
    camera.lookAt(0, 1, 0);
}


function loadScene() {
    const material = new THREE.MeshBasicMaterial({color: 'yellow', wireframe: true});

    const geoCube = new THREE.BoxGeometry(2, 2, 2)
    const geoEsfera = new THREE.SphereGeometry(1, 30, 30)

    const cube = new THREE.Mesh(geoCube, material);
    const esfera = new THREE.Mesh(geoEsfera, material);

    cube.position.set(-1, 0, 0);
    esfera.position.set(1, 0, 0);

    esferacubo = new THREE.Object3D();
    esferacubo.add(cube);
    esferacubo.add(esfera);

    // Suelo
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(10, 10, 12, 12), material);
    suelo.rotation.x = -Math.PI / 2;
    scene.add(suelo);

    // Importar modelo json
    const loader = new THREE.ObjectLoader();
    loader.load('/models/soldado/soldado.json',
        function (obj) {
            cube.add(obj);
            obj.position.set(0, 1, 0);
        }
    );
            
    // Importar modelo GLTF
    const loaderGLTF = new GLTFLoader();
    loaderGLTF.load('/models/ambulance.glb',
        function (gltf) {
            esfera.add(gltf.scene);
            gltf.scene.position.y = 1;
            }
    );


    scene.add(esferacubo);
    scene.add(new THREE.AxesHelper(3));
}


function update() {
    angulo += Math.PI / 400;
    esferacubo.rotation.y = angulo;
}


function render() {
    requestAnimationFrame(render);
    update();
    renderer.render(scene, camera);
}
