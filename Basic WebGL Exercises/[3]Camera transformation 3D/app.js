// https://webglfundamentals.org/webgl/lessons/webgl-3d-camera.html
var cameraAngleRadians = 0;

var Main = function () {
  // Load shader resources
  loadTextResource("shader.vs.glsl", function (vsErr, vsSource) {
    if (vsErr) {
      alert("Fatal error getting vertex shader (see console)");
      console.error(vsErr);
    } else {
      loadTextResource("shader.fs.glsl", function (fsErr, fsSource) {
        if (fsErr) {
          alert("Fatal error getting fragment shader (see console)");
          console.error(fsErr);
        } else {
          const canvas = document.getElementById("mycanvas");
          const gl =
            canvas.getContext("webgl2") ||
            canvas.getContext("experimental-webgl");

          if (!gl) {
            alert(
              "Unable to initialize WebGL. Your browser or machine may not support it.",
            );
            return;
          }

          const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

          const programInfo = {
            program: shaderProgram,
            attribLocations: {
              vertexPosition: gl.getAttribLocation(
                shaderProgram,
                "aVertexPosition",
              ),
              vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
            },
            uniformLocations: {
              projectionMatrix: gl.getUniformLocation(
                shaderProgram,
                "uProjectionMatrix",
              ),
              modelViewMatrix: gl.getUniformLocation(
                shaderProgram,
                "uModelViewMatrix",
              ),
            },
          };

          const buffers = initBuffers(gl); // Routine that builds all the objects we'll be drawing.

          // Draw the scene repeatedly
          var then = 0;

          function render(now) {
            now *= 0.001; // convert to seconds
            const deltaTime = now - then;
            then = now;

            drawScene(gl, programInfo, buffers, deltaTime);
            requestAnimationFrame(render);
          }

          requestAnimationFrame(render);
        }
      });
    }
  });
};

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
function initBuffers(gl) {
  // Create a buffer for the cube's vertex positions.
  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Create an array of positions for the cube.
  const positions = [
    // Front face
    -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

    // Back face
    -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

    // Top face
    -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

    // Right face
    1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,

    // Left face
    -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
  ];

  // Pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Set up the colors for the faces. We'll use solid colors
  // for each face.
  const faceColors = [
    [0.0, 0.6, 0.6, 1.0], // Front face: light blue
    [0.9, 0.0, 0.0, 1.0], // Back face: red
    [0.0, 0.8, 0.3, 1.0], // Top face: green
    [0.2, 0.2, 1.0, 1.0], // Bottom face: blue
    [0.8, 1.0, 0.0, 1.0], // Right face: yellow
    [0.8, 0.0, 0.5, 1.0], // Left face: purple/pink
  ];

  // Convert the array of colors into a table for all the vertices.

  var colors = [];

  for (var j = 0; j < faceColors.length; ++j) {
    const c = faceColors[j];

    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(c, c, c, c);
  }

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.

  const indices = [
    0,
    1,
    2,
    0,
    2,
    3, // front
    4,
    5,
    6,
    4,
    6,
    7, // back
    8,
    9,
    10,
    8,
    10,
    11, // top
    12,
    13,
    14,
    12,
    14,
    15, // bottom
    16,
    17,
    18,
    16,
    18,
    19, // right
    20,
    21,
    22,
    20,
    22,
    23, // left
  ];

  // Now send the element array to GL

  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW,
  );

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
  };
}

function drawScene(gl, programInfo, buffers, deltaTime) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // TODO create a projectionMatrix, a viewMatrix, a modelMatrix and a modelViewMatrix.
  // TODO projectionMatrix: specify with mat4.perspective(matrix, fieldOfView - pick appropriate maybe convert from degree to radians for better readability, aspect use canvas width and height, zNear pick appropriate, zFar pick appropriate)
  // TODO viewMatrix: rotate around y-axis based on the changing cameraAngleRadians variable; do an appropriate translation otherwise we sit inside of the cube; invert the view matrix
  // TODO modelMatrix: create it as identity matrix, add a rotation on x axis around itself
  // TODO modelViewMatrix: do mat4.multiply() with modelMatrix and viewMatrix

  const projectionMatrix = mat4.create();

  var viewMatrix = mat4.create();

  var modelMatrix = mat4.create();

  const modelViewMatrix = mat4.create();

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset,
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexColor,
      numComponents,
      type,
      normalize,
      stride,
      offset,
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
  }

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix,
  );
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix,
  );

  {
    const vertexCount = 36;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  cameraAngleRadians += (deltaTime * Math.PI) / 10;
}

// Initialize a shader program, so WebGL knows how to draw our data
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      "Unable to initialize the shader program: " +
        gl.getProgramInfoLog(shaderProgram),
    );
    return null;
  }
  return shaderProgram;
}

// creates a shader of the given type, uploads the source and compiles it.
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source); // Send the source to the shader object
  gl.compileShader(shader); // Compile the shader program

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    // See if it compiled successfully
    alert(
      "An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader),
    );
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}
