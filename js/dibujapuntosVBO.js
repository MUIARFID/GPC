/*
dibujaPuntosVBO.js
Programa que dibuja puntos que marca le ususario
*/

// Vertex shader
const VSHADER_SOURCE = `
attribute vec3 posicion;
void main(){
    gl_Position = vec4(posicion, 1.0);
    gl_PointSize = 10.0;
}
`

// Fragment shader
const FSHADER_SOURCE = `
uniform highp vec3 color;
void main(){
    gl_FragColor = vec4(color, 1.0);
}
`

// Global variables
const clicks = []; // array to store clicks
let colorFragment = [1.0, 0.0, 0.0]; // color of the points


// Main function
function main(){
    // Retrieve <canvas> element
    const canvas = document.getElementById('canvas');

    // Get the rendering context for WebGL
    const gl = getWebGLContext(canvas);
    if (!gl){
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
        console.log('Failed to initialize shaders.');
        return;
    }

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.3, 1.0);

    const coordenadas = gl.getAttribLocation(gl.program, 'posicion');
    const bufferVertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferVertices);
    gl.vertexAttribPointer(coordenadas, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coordenadas);

    colorFragment = gl.getUniformLocation(gl.program, 'color');

    canvas.onmousedown = function(ev){ click(ev, gl, canvas, coordenadas); };

    render(gl);
}

function click(ev, gl, canvas){
    let x = ev.clientX; // x coordinate of a mouse pointer
    let y = ev.clientY; // y coordinate of a mouse pointer
    let rect = ev.target.getBoundingClientRect();

    const xCanvas = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    const yCanvas = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    clicks.push([xCanvas, yCanvas, 0.0]);

}