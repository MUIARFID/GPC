import {GLTFLoader} from '../lib/GLTFLoader.module.js'
import * as THREE from '../../lib/three.module.js'

async function loadModel(path,scene,
    position = [0,0,0],
    rotation =  [0,0,0],
    scale = [1,1,1]
) {
    const loaderGLTF = new GLTFLoader();
    await loaderGLTF.loadAsync(path).
    then(
        (gltf) => {
            for(let node of gltf.scene.children){
                for(let mesh of node.children){
                    mesh.material.metalness = 0;
                }
            }
            let ret = gltf.scene;
            ret.position.set(...position);
            rotation = rotation.map((val) => val * Math.PI/2);
            ret.rotation.set(...rotation);
            ret.scale.set(...scale);

            scene.add(ret);
            

            let bbox = new THREE.Box3().setFromObject(ret);
            scene.add(new THREE.Box3Helper(bbox, new THREE.Color(0,0,0.7)));
        }
    ).then(
        (ret) => {
            return ret;
        }
    )
    return rret;
}

export async function loadRoad(name,scene,
    position = [0,0,0],
    rotation =  0,
) {
    const pathRoad = `../models/proyecto/roads/road_${name}.glb`;
    const pathBarrier = `../models/proyecto/roads/road_${name}Barrier.glb`;
    const barrierPosition = [position[0],position[0]+0.02,position[0]]
    const block = new THREE.Object3D();
    const road = await loadModel(pathRoad, scene, position, [0,rotation,0], [1,1,1]) 
    console.log(road);
    const barrier = await loadModel(pathBarrier, scene, barrierPosition, [0,rotation,0], [1,1,1])
    block.add(road);
    block.add(barrier);
    return block;
}