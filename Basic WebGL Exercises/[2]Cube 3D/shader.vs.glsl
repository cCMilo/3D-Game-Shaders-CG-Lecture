attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;
uniform mat4 uModelMatrix;
uniform mat4 uProjectionMatrix;
varying lowp vec4 vColor;


void main(void) {
    gl_Position = uProjectionMatrix * uModelMatrix * aVertexPosition;
    vColor = aVertexColor;
}