attribute vec3 pos;
attribute vec4 clr;

uniform mat4 transformMatrix;

varying vec4 vcolor;

void main()
{
    gl_Position = transformMatrix * vec4(pos, 1);
    vcolor = clr;
}