/**
 * Escena.js
 * 
 * Seminario 2 de GPC: pintar una escena básica con transformaciones, animacion y modelos importados
 * 
 * @author <miedgo@upv.es>,2023
*/

// Modulos necesarios
import * as THREE from '../lib/three.module.js'
import {OrbitControls} from '../lib/OrbitControls.module.js'
import {GUI} from '../lib/lil-gui.module.min.js'
import {TWEEN} from '../lib/tween.module.min.js'

// Variables de consenso
let renderer, scene, camera;

// Globales
//TODO: esto me parece una chapuza, pero no se me ocurre otra forma de hacerlo
let pinzaIzq, pinzaDer, mano, antebrazo, brazo, base;
let robot, cameraControls;

let robotControls = {
    giroBase: 0,
    giroBrazo: 0,
    giroAntebrazoY: 0,
    giroAntebrazoZ: 0,
    giroPinza: 0,
    separacionPinza: 15,
    wireframe: false,
    animacion: () => tween1.start() };

function updateArm(anim) {
    robot.rotation.y = anim.giroBase * (Math.PI / 180);
    brazo.rotation.z = anim.giroBrazo * (Math.PI / 180);
    antebrazo.rotation.y = anim.giroAntebrazoY * (Math.PI / 180);
    antebrazo.rotation.z = anim.giroAntebrazoZ * (Math.PI / 180);
    mano.rotation.z = anim.giroPinza * (Math.PI / 180);
    pinzaIzq.position.z = anim.separacionPinza + 2;
    pinzaDer.position.z = -anim.separacionPinza - 2;

    robotControls.giroBase = anim.giroBase;
    robotControls.giroBrazo = anim.giroBrazo;
    robotControls.giroAntebrazoY = anim.giroAntebrazoY;
    robotControls.giroAntebrazoZ = anim.giroAntebrazoZ;
    robotControls.giroPinza = anim.giroPinza;
    robotControls.separacionPinza = anim.separacionPinza;
}

let animationData = {giroBase: 0, giroBrazo: 0, giroAntebrazoY: 0, giroAntebrazoZ: 0, giroPinza: 0, separacionPinza: 15}

const tween1 = new TWEEN.Tween(animationData)
.to({...animationData, giroAntebrazoZ: -90}, 1000)
.easing(TWEEN.Easing.Quadratic.Out)
.onUpdate(() => {updateArm(animationData)})

const tween2 = new TWEEN.Tween(animationData)
.to({...animationData, separacionPinza: 4, giroAntebrazoZ: -90}, 500)
.easing(TWEEN.Easing.Quadratic.Out)
.onUpdate(() => {updateArm(animationData)})

const tween3 = new TWEEN.Tween(animationData)
.to({...animationData, separacionPinza: 4, giroAntebrazoZ: -45}, 500)
.easing(TWEEN.Easing.Quadratic.Out)
.onUpdate(() => {updateArm(animationData)})

const tween4 = new TWEEN.Tween(animationData)
.to({...animationData, separacionPinza: 4, giroAntebrazoZ: -45, giroBase: -180}, 1000)
.easing(TWEEN.Easing.Quadratic.Out)
.onUpdate(() => {updateArm(animationData)})

const tween5 = new TWEEN.Tween(animationData)
.to({...animationData, separacionPinza: 4, giroAntebrazoZ: -90, giroBase: -180}, 500)
.easing(TWEEN.Easing.Quadratic.Out)
.onUpdate(() => {updateArm(animationData)})

const tween6 = new TWEEN.Tween(animationData)
.to({...animationData, separacionPinza: 15, giroAntebrazoZ: -90, giroBase: -180}, 500)
.easing(TWEEN.Easing.Quadratic.Out)
.onUpdate(() => {updateArm(animationData)})

const tween7 = new TWEEN.Tween(animationData)
.to({...animationData}, 1000)
.easing(TWEEN.Easing.Quadratic.Out)
.onUpdate(() => {updateArm(animationData)})

tween1.chain(tween2);
tween2.chain(tween3);
tween3.chain(tween4);
tween4.chain(tween5);
tween5.chain(tween6);
tween6.chain(tween7);



// Camaras adicionales
let minimap;
const L = 100;

// Acciones
init()
loadScene()
render()
initGui()

function init() {
    // Motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.antialias = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);
    renderer.setClearColor(new THREE.Color(0,0,0.7));
    renderer.shadowMap.enabled = true;
    renderer.autoClear = false; 

    // Escena
    scene = new THREE.Scene();

    // Camara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(200, 300, 200);
    cameraControls = new OrbitControls(camera, renderer.domElement);
    cameraControls.minDistance = 200;
    cameraControls.maxDistance = 500;

    // Luces 
    // Luz ambiental
    const ambiental = new THREE.AmbientLight(0xFFFFFF, 0.2);
    scene.add(ambiental);

    // Luz direccional
    const directional = new THREE.DirectionalLight('pink', 0.5);
    directional.position.set(100, 300, 200);
    directional.castShadow = true;
    directional.shadow.camera.near = 0.1;
    directional.shadow.camera.far = 500;
    directional.shadow.camera.left = -500;
    directional.shadow.camera.right = 500;
    directional.shadow.camera.top = 500;
    directional.shadow.camera.bottom = -500;
    // scene.add(new THREE.CameraHelper(directional.shadow.camera));
    scene.add(directional);

    // Luz focal
    const focal = new THREE.SpotLight('lightblue', 0.5);
    focal.position.set(300, 500, 100);
    focal.target.position.set(0, 0, 0);
    focal.shadow.camera.near = 10
    focal.shadow.camera.far = 4000;
    focal.penumbra = 0.5;
    focal.castShadow = true;
    // scene.add(new THREE.CameraHelper(focal.shadow.camera));
    scene.add(focal);

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
        .onChange((value) => robot.rotation.y = value * (Math.PI / 180)).listen();

    robotFolder.add(robotControls, "giroBrazo", -45, 45, 1).name("Giro Brazo")
        .onChange((value) => brazo.rotation.z = value * (Math.PI / 180)).listen();

    robotFolder.add(robotControls, "giroAntebrazoY", -180, 180, 1).name("Giro Antebrazo Y")
        .onChange((value) => antebrazo.rotation.y = value * (Math.PI / 180)).listen();

    robotFolder.add(robotControls, "giroAntebrazoZ", -90, 90, 1).name("Giro Antebrazo Z")
        .onChange((value) => antebrazo.rotation.z = value * (Math.PI / 180)).listen();

    robotFolder.add(robotControls, "giroPinza", -40, 220, 1).name("Giro Pinza")
        .onChange((value) => mano.rotation.z = value * (Math.PI / 180)).listen();

    robotFolder.add(robotControls, "separacionPinza", 0, 15, 1).name("Separacion Pinza")
        .onChange((value) => {
            pinzaIzq.position.z = value +2;
            pinzaDer.position.z = -value -2;
        }).listen();

    robotFolder.add(robotControls, "wireframe").name("Wireframe")
        .onChange((value) => {
            scene.traverseVisible(function(obj) {
                if (obj instanceof THREE.Mesh) {
                    obj.material.wireframe = value;
                }
            });
        });

    robotFolder.add(robotControls, "animacion").name("Animacion")
    
}

function setMinimapCamera() {
    minimap = new THREE.OrthographicCamera(-L, L, L, -L, -1, 1000);
    minimap.position.set(0, 300, 0);
    minimap.up = new THREE.Vector3(1, 0, 0);
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
    // Materiales
    const entorno = [
        '../images/posx.jpg', '../images/negx.jpg',
        '../images/posy.jpg', '../images/negy.jpg',
        '../images/posz.jpg', '../images/negz.jpg',
    ];	
    const texEsfera = new THREE.CubeTextureLoader().load(entorno);
    const matEsfera = new THREE.MeshPhongMaterial({ envMap: texEsfera,
        specular: 'white', shininess: 50});

    const woodTexture = new THREE.TextureLoader().load('../images/wood512.jpg');
    const woodMaterial = new THREE.MeshLambertMaterial({map: woodTexture});

    const metalTexture = new THREE.TextureLoader().load('../images/metal_128.jpg');
    const metalMaterial = new THREE.MeshPhongMaterial({
        map: metalTexture,
        specular: 'white',
        shininess: 30,
    });
    

    //PINZA
    const pinza = new THREE.Object3D();
    //TODO: crear geometria correctamente

    const f1 = new THREE.Mesh(new THREE.BoxGeometry(19, 20, 4), metalMaterial)
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
    const f2 = new THREE.Mesh(geometry, metalMaterial);
    f2.position.set(19 + 9, 0, 0);
    pinza.add(f2);


    // MANO
    mano = new THREE.Object3D();

    const palma = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 40, 10), woodMaterial);
    palma.rotation.x = Math.PI / 2;
    mano.add(palma);

    pinzaIzq = pinza.clone();
    pinzaIzq.position.set(0, 0, 17);
    mano.add(pinzaIzq);
    
    pinzaDer = pinza.clone();
    pinzaDer.scale.z = -1;
    pinzaDer.position.set(0, 0, -17);
    mano.add(pinzaDer);

    mano.position.set(0, 80, 0);


    // ANTEBRAZO
    antebrazo = new THREE.Object3D();
    
    const disco = new THREE.Mesh(new THREE.CylinderGeometry(22, 22, 6, 15), metalMaterial);
    antebrazo.add(disco);

    const nervio1 = new THREE.Mesh(new THREE.BoxGeometry(4, 80, 4), metalMaterial);
    nervio1.position.set(8, 40, 8);
    antebrazo.add(nervio1);

    const nervio2 = new THREE.Mesh(new THREE.BoxGeometry(4, 80, 4), metalMaterial);
    nervio2.position.set(-8, 40, 8);
    antebrazo.add(nervio2);

    const nervio3 = new THREE.Mesh(new THREE.BoxGeometry(4, 80, 4), metalMaterial);
    nervio3.position.set(8, 40, -8);
    antebrazo.add(nervio3);

    const nervio4 = new THREE.Mesh(new THREE.BoxGeometry(4, 80, 4), metalMaterial);
    nervio4.position.set(-8, 40, -8);
    antebrazo.add(nervio4);

    antebrazo.add(mano);
    antebrazo.position.set(0, 120, 0);

    // # BRAZO #
    brazo = new THREE.Object3D();

    const eje = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 18, 10), woodMaterial);
    eje.rotation.x = Math.PI / 2;
    brazo.add(eje);

    const esparrago = new THREE.Mesh(new THREE.BoxGeometry(18, 120, 12), woodMaterial);
    esparrago.position.set(0, 60, 0);
    brazo.add(esparrago);

    const rotula = new THREE.Mesh(new THREE.SphereGeometry(20, 10, 10), matEsfera);
    rotula.position.set(0, 120, 0);
    brazo.add(rotula);

    brazo.add(antebrazo);

    // BASE
    base = new THREE.Object3D();
    base.add(new THREE.Mesh(new THREE.CylinderGeometry(50, 50, 15, 20), metalMaterial));
    base.add(brazo);
    
    //ROBOT
    robot = new THREE.Object3D();
    robot.add(base);

    // Suelo
    const floorText = new THREE.TextureLoader().load('../images/pisometalico_1024.jpg');
    // floorText.repeat = 2
    // floorText.wrapS = floorText.wrapT = THREE.MirroredRepeatWrapping;
    const floorMat = new THREE.MeshStandardMaterial({ map: floorText});
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 10, 10), floorMat);
    suelo.rotation.x = -Math.PI / 2;

    // Habitación
    const paredes = []
    paredes.push(new THREE.MeshBasicMaterial({side: THREE.BackSide, map: new THREE.TextureLoader().load('../images/posx.jpg')}));
    paredes.push(new THREE.MeshBasicMaterial({side: THREE.BackSide, map: new THREE.TextureLoader().load('../images/negx.jpg')}));
    paredes.push(new THREE.MeshBasicMaterial({side: THREE.BackSide, map: new THREE.TextureLoader().load('../images/posy.jpg')}));
    paredes.push(new THREE.MeshBasicMaterial({side: THREE.BackSide, map: new THREE.TextureLoader().load('../images/negy.jpg')}));
    paredes.push(new THREE.MeshBasicMaterial({side: THREE.BackSide, map: new THREE.TextureLoader().load('../images/posz.jpg')}));
    paredes.push(new THREE.MeshBasicMaterial({side: THREE.BackSide, map: new THREE.TextureLoader().load('../images/negz.jpg')}));
    const habitacion = new THREE.Mesh(new THREE.BoxGeometry(4000, 4000, 4000), paredes);
    
    scene.add(habitacion);
    
    scene.add(suelo);
    scene.add(new THREE.AxesHelper(3));
    scene.add(robot);

    //make all objects project shadows
    scene.traverseVisible(function(obj) {
        if (obj instanceof THREE.Mesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });
}


function update() {
    TWEEN.update();
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
