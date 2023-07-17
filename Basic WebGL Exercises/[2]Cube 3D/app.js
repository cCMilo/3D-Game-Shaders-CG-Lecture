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
              modelMatrix: gl.getUniformLocation(shaderProgram, "uModelMatrix"),
            },
          };

          const buffers = initBuffers(gl); // Routine that builds all the objects we'll be drawing.
          drawScene(gl, programInfo, buffers);
        }
      });
    }
  });
};

//
// initBuffers
// buffers for the 3D cube
//
function initBuffers(gl) {
  const positionBuffer = gl.createBuffer(); // Create a buffer for the cube's vertex positions.

  // Select the positionBuffer as the one to apply buffer operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // TODO: Create an array of positions. Each face has 4 vertices. Each vertex consists of a position x,y,z.
  const positions = [];

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // TODO: Set up the colors for the faces. Pick what you want. The notation is of type [[r,g,b,a]]
  const faceColors = [];

  var colors = []; // Convert the array of colors into a table for all vertices.
  for (var j = 0; j < faceColors.length; ++j) {
    const c = faceColors[j];
    colors = colors.concat(c, c, c, c); // Repeat each color four times for the four vertices of the face
  }

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // TODO: The indices array defines each face as 2 triangles. Indices are mapped to vertices. With indices we can specify each triangle's position.
  const indices = [];

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

function drawScene(gl, programInfo, buffers) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas.
  // We only want to see objects between 0.1 units
  // and 100 units away from the camera.
  const fieldOfView = (45 * Math.PI) / 180; // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const perspProjMat = mat4.create(); // Perspective projection matrix

  // note: glmatrix.js always has the first argument as the destination to receive the result.
  mat4.perspective(perspProjMat, fieldOfView, aspect, zNear, zFar);

  // Set the drawing position to the "identity" point, which is the center of the scene.
  const modelMat = mat4.create();
  // TODO: Perform a translation of z -6 on the modelMat to move the drawing position closer
  mat4.translate();

  // TODO: Rotate the cube in any direction to see more faces
  // You can use the rotate method from here: https://glmatrix.net/docs/module-mat4.html
  // Radian refresher: https://en.wikipedia.org/wiki/Radian
  mat4.rotate();

  {
    // Tell WebGL how to pull out the positions from the position buffer into the vertexPosition attribute
    const numComponents = x; // TODO for positions array
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

  {
    // Tell WebGL how to pull out the colors from the color buffer into the vertexColor attribute.
    const numComponents = x; // TODO for color array
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

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices); // Tell WebGL which indices to use to index the vertices
  gl.useProgram(programInfo.program); // Tell WebGL to use our program when drawing

  // Set the shader uniforms
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    perspProjMat,
  );
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelMatrix,
    false,
    modelMat,
  );

  {
    const vertexCount = x; // TODO how many indices do we have to consider?
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }
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
