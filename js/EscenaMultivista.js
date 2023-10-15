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
import {OrbitControls} from '../lib/OrbitControls.module.js'

// Variables de consenso
let renderer, scene, camera;

// Variables globales
let esferacubo, angulo = 0;

// controlador de camara
let cameraControls;

// camaras adicionales
let planta, alzado, perfil;	
const L = 5;

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
    // scene.background = new THREE.Color(0,0,0.7); // esto da problemas con multivista

    // Camara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(2, 2, 5);
    cameraControls = new OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(0, 1, 0);
    camera.lookAt(0, 1, 0);

    // Camaras adicionales
    setOrtograhicCamera(window.innerWidth / window.innerHeight);

    // Captura de eventos
    window.addEventListener('resize', updateAspectRatio);
    window.addEventListener('dblclick', rotateElement);

}

function setOrtograhicCamera(ar){
    let camaraOrtografica;

    if (ar > 1){
        camaraOrtografica = new THREE.OrthographicCamera(-L*ar, L*ar, L, -L, -100, 100);
    }else{
        camaraOrtografica = new THREE.OrthographicCamera(-L, L, L/ar, -L/ar, -100, 100);
    }

    alzado = camaraOrtografica.clone();
    alzado.position.set(0, 0, L);
    alzado.lookAt(0, 1, 0);

    perfil = camaraOrtografica.clone();
    perfil.position.set(L, 0, 0);
    perfil.lookAt(0, 1, 0);

    planta = camaraOrtografica.clone();
    planta.position.set(0, L, 0);
    planta.lookAt(0, 1, 0);
    planta.up = new THREE.Vector3(0, 0, -1);

}


function loadScene() {
    const material = new THREE.MeshBasicMaterial({color: 'lightgray', wireframe: true});

    const geoCube = new THREE.BoxGeometry(2, 2, 2)
    const geoEsfera = new THREE.SphereGeometry(1, 30, 30)

    const cube = new THREE.Mesh(geoCube, material);
    const esfera = new THREE.Mesh(geoEsfera, material);

    cube.position.set(-1, 0, 0);
    esfera.position.set(1, 0, 0);

    esferacubo = new THREE.Object3D();
    esferacubo.add(cube);
    esferacubo.add(esfera);
    esferacubo.name = 'grupoEC';

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

// TODO: no funciona con multivista, ejercicio
function rotateElement(event){
    // capturo la posicion del click (s.r. top left)
    let x = event.clientX;
    let y = event.clientY;

    // esto cambia al sistema de referencia que es un cuadrado de 2x2
    x = (x/window.innerWidth) * 2 - 1;
    y = -(y/window.innerHeight) * 2 + 1;

    // creo un rayo que va desde la camara hasta donde he hecho click
    const rayo = new THREE.Raycaster();
    rayo.setFromCamera(new THREE.Vector2(x,y), camera);
    // TODO: no funciona
    // const intersecciones = rayo.intersectObjects(scene.getObjectByName('grupoEC'), false);
    const intersecciones = rayo.intersectObjects(scene.children, true);
    
    console.log(intersecciones.length);

    if (intersecciones.length > 0){
        intersecciones[0].object.rotation.y += Math.PI / 4;
    }

}

function updateAspectRatio(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    const ar = window.innerWidth / window.innerHeight;
    camera.aspect = ar;
    camera.updateProjectionMatrix();

    // camaras ortograficas
    if (ar > 1){
        alzado.left = perfil.left = planta.left = -L*ar;
        alzado.right = perfil.right = planta.right = L*ar;
        alzado.top = perfil.top = planta.top = L;
        alzado.bottom = perfil.bottom = planta.bottom = -L;
    }else{
        alzado.left = perfil.left = planta.left = -L;
        alzado.right = perfil.right = planta.right = L;
        alzado.top = perfil.top = planta.top = L/ar;
        alzado.bottom = perfil.bottom = planta.bottom = -L/ar;
    }

    alzado.updateProjectionMatrix();
    perfil.updateProjectionMatrix();
    planta.updateProjectionMatrix();

}


function update() {
    // angulo += Math.PI / 400;
    // esferacubo.rotation.y = angulo;
}

function render() {
    renderer.clear();
    requestAnimationFrame(render);
    update();

    renderer.setViewport(0, 0, window.innerWidth/2, window.innerHeight/2);
    renderer.render(scene, perfil);
    renderer.setViewport(0, window.innerHeight/2, window.innerWidth/2, window.innerHeight/2);
    renderer.render(scene, planta);
    renderer.setViewport(window.innerWidth/2, 0, window.innerWidth/2, window.innerHeight/2);
    renderer.render(scene, alzado);
    renderer.setViewport(window.innerWidth/2, window.innerHeight/2, window.innerWidth/2, window.innerHeight/2);
    renderer.render(scene, camera);
}
