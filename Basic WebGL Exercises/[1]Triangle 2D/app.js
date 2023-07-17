function Run(vs_source, fs_source) {
  canvas = document.getElementById("mycanvas");
  gl = canvas.getContext("webgl2"); // Initialize WebGL2

  if (!gl) {
    console.log("WebGL not supported, falling back on experimental-webgl");
    gl = canvas.getContext("experimental-webgl");
  }
  if (!gl) {
    alert("Your browser does not support WebGL");
  }

  ///////////////////////////////////////////////////////////////////////
  // Initialize the vertex buffer objects
  // We can update the contents of the vertex buffer objects anytime.
  // We do NOT need to create them again.

  var positions = [-1, 0, 0, 1, 0, 0, 0, 1, 0];

  var colors = [1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1];

  var position_buffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  var color_buffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  ///////////////////////////////////////////////////////////////////////
  // Compile the vertex and fragment shaders into a program
  // We can modify the shader source code and recompile later,
  // though typically a WebGL application would compile its shaders only once.
  // An application can have multiple shader programs and bind a different
  // shader program for rendering different objects in a scene.
  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, vs_source);
  gl.compileShader(vs);

  if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(vs));
    gl.deleteShader(vs);
  }

  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, fs_source);
  gl.compileShader(fs);

  if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(fs));
    gl.deleteShader(fs);
  }

  prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);

  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    alert(gl.getProgramInfoLog(prog));
  }

  gl.useProgram(prog); //link active program

  ///////////////////////////////////////////////////////////////////////
  // Update shader uniform variables
  // Before we render, we must set the values of the uniform variables.
  // The uniform variables can be updated as frequently as needed.

  var m = gl.getUniformLocation(prog, "transformMatrix");

  var transformationmatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; // identity matrix for transformation of vertices in vertex shader (no transformation applied, the coordinates remain the same)

  gl.uniformMatrix4fv(m, false, transformationmatrix);

  ///////////////////////////////////////////////////////////////////////
  // Set the vertex buffers used for rendering
  // Before we render, we must specify which vertex attributes are used
  // and which vertex buffer objects contain their data.
  // Note that different objects can use different sets of attributes
  // stored in different vertex buffer objects.

  var p = gl.getAttribLocation(prog, "pos");
  gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
  gl.vertexAttribPointer(p, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(p);

  var c = gl.getAttribLocation(prog, "clr");
  gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
  gl.vertexAttribPointer(c, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(c);

  ///////////////////////////////////////////////////////////////////////
  // Render the scene
  // Now that everything is ready, we can render the scene.
  // Rendering begins with clearing the image.
  // Every time the scene changes, we must render again.

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

var Main = function () {
  // Load shader resources
  loadTextResource("shader.vs.glsl", function (vsErr, vsText) {
    if (vsErr) {
      alert("Fatal error getting vertex shader (see console)");
      console.error(vsErr);
    } else {
      loadTextResource("shader.fs.glsl", function (fsErr, fsText) {
        if (fsErr) {
          alert("Fatal error getting fragment shader (see console)");
          console.error(fsErr);
        } else {
          Run(vsText, fsText);
        }
      });
    }
  });
};
