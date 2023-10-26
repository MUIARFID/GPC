/**
 * Escena.js
 * 
 * Seminario 2 de GPC: pintar una escena básica con transformaciones, animacion y modelos importados
 * 
 * @author <miedgo@upv.es>,2023
*/

//TODO: pinza sin solaparse

// Modulos necesarios
import * as THREE from '../lib/three.module.js'
import {OrbitControls} from '../lib/OrbitControls.module.js'
import {GUI} from '../lib/lil-gui.module.min.js'

// Variables de consenso
let renderer, scene, camera;

// Variables globales
let robot, cameraControls, material;
let robotControls = {
    giroBase: 0,
    giroBrazo: 0,
    giroAntebrazoY: 0,
    giroAntebrazoZ: 0,
    giroPinza: 0,
    separacionPinza: 15,
    wireframe: false, animacion: () => {}};

// Camaras adicionales
let minimap;
const L = 100;

// partes
//TODO: esto me parece una chapuza, pero no se me ocurre otra forma de hacerlo
let pinzaIzq, pinzaDer, mano, antebrazo, brazo, base;


// Acciones
init()
loadScene()
render()
initGui()

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
    camera.position.set(200, 300, 200);
    cameraControls = new OrbitControls(camera, renderer.domElement);
    cameraControls.minDistance = 200;
    cameraControls.maxDistance = 500;

    // Camaras adicionales
    setMinimapCamera();

    // Captura de eventos
    window.addEventListener('resize', updateAspectRatio);
    // movimiento flechas teclado
    document.addEventListener('keydown', onKeyDown);
    initGui();
}

function onKeyDown(event) {
    // move robot with arrows
    switch (event.key) {
        case "ArrowLeft":
            robot.position.x -= 10;
            break;
        case "ArrowRight":
            robot.position.x += 10;
            break;
        case "ArrowUp":
            robot.position.z -= 10;
            break;
        case "ArrowDown":
            robot.position.z += 10;
            break;
    }
}

function initGui() {
    // Interfaz grafica de usuario
    const gui = new GUI();
    
    const robotFolder  = gui.addFolder("Control robot");
    robotFolder.add(robotControls, "giroBase", -180, 180, 1).name("Giro Base")
        .onChange((value) => robot.rotation.y = value * (Math.PI / 180));

    robotFolder.add(robotControls, "giroBrazo", -45, 45, 1).name("Giro Brazo")
        .onChange((value) => brazo.rotation.z = value * (Math.PI / 180));

    robotFolder.add(robotControls, "giroAntebrazoY", -180, 180, 1).name("Giro Antebrazo Y")
        .onChange((value) => antebrazo.rotation.y = value * (Math.PI / 180));

    robotFolder.add(robotControls, "giroAntebrazoZ", -90, 90, 1).name("Giro Antebrazo Z")
        .onChange((value) => antebrazo.rotation.z = value * (Math.PI / 180));

    robotFolder.add(robotControls, "giroPinza", -40, 220, 1).name("Giro Pinza")
        .onChange((value) => mano.rotation.z = value * (Math.PI / 180));

    robotFolder.add(robotControls, "separacionPinza", 0, 15, 1).name("Separacion Pinza")
        .onChange((value) => {
            pinzaIzq.position.z = value;
            pinzaDer.position.z = -value;
        });

    robotFolder.add(robotControls, "wireframe").name("Wireframe")
        .onChange((value) => material.wireframe = value);

    robotFolder.add(robotControls, "animacion").name("Animacion");
    
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

function loadScene() {
    material = new THREE.MeshNormalMaterial();
    // new THREE.MeshBasicMaterial({color: 'red', wireframe: true});

    //PINZA
    const pinza = new THREE.Object3D();
    //TODO: crear geometria correctamente

    const f1 = new THREE.Mesh(new THREE.BoxGeometry(19, 20, 4), material)
    f1.position.set(9.5, 0, 0);
    pinza.add(f1);

    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array( [
        // outer
        9.0, -6.0,  0.0,
        9.0,  6.0,  0.0, 
        -9.0, -10.0,  2.0, 
    
        9.0,  6.0,  0.0,
        -9.0,  10.0,  2.0,
        -9.0, -10.0,  2.0, 

        // inner
        9.0,  6.0,  -2.0, 
        9.0, -6.0,  -2.0, 
        -9.0, -10.0, -2.0, 

        -9.0, -10.0,  -2.0,
        -9.0,  10.0,  -2.0,
        9.0,  6.0,  -2.0,

        // top
        9.0,  6.0,  0.0,
        9.0,  6.0,  -2.0,
        -9.0,  10.0,  -2.0,

        -9.0,  10.0,  -2.0,
        -9.0,  10.0,  2.0,
        9.0,  6.0,  0.0,

        // bottom
        -9.0,  -10.0,  -2.0,
        9.0,  -6.0,  -2.0,
        9.0,  -6.0,  0.0,

        9.0,  -6.0,  0.0,
        -9.0,  -10.0,  2.0,
        -9.0,  -10.0,  -2.0,

        // front
        9.0,  6.0,  -2.0,
        9.0,  6.0,  0.0,
        9.0,  -6.0,  0.0,

        9.0,  -6.0,  0.0,
        9.0,  -6.0,  -2.0,
        9.0,  6.0,  -2.0,
    ] );

    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.computeVertexNormals();
    const f2 = new THREE.Mesh(geometry, material);
    f2.position.set(19 + 9, 0, 0);
    pinza.add(f2);


    // MANO
    mano = new THREE.Object3D();

    const palma = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 40, 10), material);
    palma.rotation.x = Math.PI / 2;
    mano.add(palma);

    pinzaIzq = pinza.clone();
    pinzaIzq.position.set(0, 0, 15);
    mano.add(pinzaIzq);
    
    pinzaDer = pinza.clone();
    pinzaDer.scale.z = -1;
    pinzaDer.position.set(0, 0, -15);
    mano.add(pinzaDer);

    mano.position.set(0, 80, 0);


    // ANTEBRAZO
    antebrazo = new THREE.Object3D();
    
    const disco = new THREE.Mesh(new THREE.CylinderGeometry(22, 22, 6, 15), material);
    antebrazo.add(disco);

    const nervio1 = new THREE.Mesh(new THREE.BoxGeometry(4, 80, 4), material);
    nervio1.position.set(8, 40, 8);
    antebrazo.add(nervio1);

    const nervio2 = new THREE.Mesh(new THREE.BoxGeometry(4, 80, 4), material);
    nervio2.position.set(-8, 40, 8);
    antebrazo.add(nervio2);

    const nervio3 = new THREE.Mesh(new THREE.BoxGeometry(4, 80, 4), material);
    nervio3.position.set(8, 40, -8);
    antebrazo.add(nervio3);

    const nervio4 = new THREE.Mesh(new THREE.BoxGeometry(4, 80, 4), material);
    nervio4.position.set(-8, 40, -8);
    antebrazo.add(nervio4);

    antebrazo.add(mano);
    antebrazo.position.set(0, 120, 0);

    // # BRAZO #
    brazo = new THREE.Object3D();

    const eje = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 18, 10), material);
    eje.rotation.x = Math.PI / 2;
    brazo.add(eje);

    const esparrago = new THREE.Mesh(new THREE.BoxGeometry(18, 120, 12), material);
    esparrago.position.set(0, 60, 0);
    brazo.add(esparrago);

    const rotula = new THREE.Mesh(new THREE.SphereGeometry(20, 10, 10), material);
    rotula.position.set(0, 120, 0);
    brazo.add(rotula);

    brazo.add(antebrazo);

    // BASE
    base = new THREE.Object3D();
    base.add(new THREE.Mesh(new THREE.CylinderGeometry(50, 50, 15, 20), material)); 
    base.add(brazo);
    
    //ROBOT
    robot = new THREE.Object3D();
    robot.add(base);

    // Suelo
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 10, 10), material);
    suelo.rotation.x = -Math.PI / 2;
    
    scene.add(suelo);
    scene.add(new THREE.AxesHelper(3));
    scene.add(robot);
}


function update() {
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
