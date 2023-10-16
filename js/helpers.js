import {GLTFLoader} from '../lib/GLTFLoader.module.js'
export default

function loadModel(path, onLoad) {
    const loaderGLTF = new GLTFLoader();
    let scene;
    loaderGLTF.load(path,
        function (gltf) {
            scene = gltf.scene;
            console.log(gltf);
            for(let node of gltf.scene.children){
                console.log(node);
                for(let mesh of node.children){
                    console.log(mesh);
                    mesh.material.metalness = 0;
                }
            }
            onLoad(scene);
        }
    );
    return scene;
}