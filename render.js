window.addEventListener("load", function(){

    var cube = {};
    cube.vertices = new Float32Array([
            // front face    normal vector
            1, -1, -1,       0,  0, -1,
            1,  1, -1,       0,  0, -1,
           -1,  1, -1,       0,  0, -1,
           -1, -1, -1,       0,  0, -1,
            // back face
           -1, -1,  1,       0,  0,  1,
           -1,  1,  1,       0,  0,  1,
            1,  1,  1,       0,  0,  1,
            1, -1,  1,       0,  0,  1,
            // left face
           -1, -1, -1,      -1,  0,  0,
           -1,  1, -1,      -1,  0,  0,
           -1,  1,  1,      -1,  0,  0,
           -1, -1,  1,      -1,  0,  0,
            // right face
            1, -1,  1,       1,  0,  0,
            1,  1,  1,       1,  0,  0,
            1,  1, -1,       1,  0,  0,
            1, -1, -1,       1,  0,  0,
            // top face
            1,  1, -1,       0,  1,  0,
            1,  1,  1,       0,  1,  0,
           -1,  1,  1,       0,  1,  0,
           -1,  1, -1,       0,  1,  0,
            // bottom face
            1, -1,  1,       0, -1,  0,
            1, -1, -1,       0, -1,  0,
           -1, -1, -1,       0, -1,  0,
           -1, -1,  1,       0, -1,  0
    ]);
    cube.indices = new Uint8Array([
             0,  1,  2, // front face
             2,  3,  0,
             4,  5,  6, // back face
             6,  7,  4,
             8,  9, 10, // left face
            10, 11,  8,
            12, 13, 14, // right face
            14, 15, 12,
            16, 17, 18, // top face
            18, 19, 16,
            20, 21, 22, // bottom face
            22, 23, 20
    ]);

    var width = 640;
    var height = 480;
    var aspectRatio = width/height;

    var fov = 85; // degrees
    var minDepth = n = 2;
    var maxDepth = f = 500;
    var r = Math.tan(fov/180*Math.PI/2)*n;
    var t = r/aspectRatio;

    var pmat = new Float32Array([ // column major order
            n/r, 0, 0, 0,
            0,n/t, 0, 0,
            0, 0,-(f+n)/(f-n), -1,
            0, 0, -2*f*n/(f-n), 0
    ]);

    var vtxSrc =
        "attribute vec3 pos;"+
        "attribute vec3 norm;"+
        "uniform vec3 light_dir;"+
        "uniform vec3 ambient;"+
        "uniform mat4 tmat;"+
        "uniform mat4 cmat;"+
        "uniform mat4 pmat;"+
        "varying lowp vec3 lighting;"+

        "void main() {"+
        "gl_Position = pmat * cmat * tmat * vec4(pos, 1.0);"+
        "lighting = ambient + vec3(max(dot(mat3(tmat)*norm, -light_dir), 0.0));"+
        "}";
    var fragSrc =
        "varying lowp vec3 lighting;"+
        "uniform lowp vec4 color;"+

        "void main() {"+
        "gl_FragColor = vec4(lighting, 1) * color;"+
        "}";

    var cnv = document.getElementById("cnv");
    cnv.width = width;
    cnv.height = height;
    var gl = cnv.getContext("webgl") || cnv.getContext("webgl-experimental");

    if (!gl) {
        alert("Your browser does not support WebGL");
        return;
    }

    gl.enable(gl.DEPTH_TEST);
    //gl.enable(gl.CULL_FACE);
    gl.clearColor(.5, .6, 1, 1);

    var prgm = compileShaders(gl, vtxSrc, fragSrc);
    gl.useProgram(prgm);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, cube.vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(gl.getAttribLocation(prgm, "pos"), 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(gl.getAttribLocation(prgm, "pos"));
    gl.vertexAttribPointer(gl.getAttribLocation(prgm, "norm"), 3, gl.FLOAT, false, 24, 12);
    gl.enableVertexAttribArray(gl.getAttribLocation(prgm, "norm"));

    var elemBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elemBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cube.indices, gl.STATIC_DRAW);

    gl.uniformMatrix4fv(gl.getUniformLocation(prgm, "pmat"), false, pmat);

    var tmatLoc = gl.getUniformLocation(prgm, "tmat"),
    cmatLoc = gl.getUniformLocation(prgm, "cmat"),
    colorLoc = gl.getUniformLocation(prgm, "color");
    lightDirLoc = gl.getUniformLocation(prgm, "light_dir"),
    ambientLoc = gl.getUniformLocation(prgm, "ambient");

    window.requestAnimationFrame = (window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame);

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var t = world.camera.tmat;
        gl.uniformMatrix4fv(cmatLoc, false, new Float32Array(mat4transpose([
                        // abe, if you are staring at this attempting to comprehend exactly what this does, i recommend you stop
                        t[0], t[1], t[2], t[0]*t[3]+t[1]*t[7]+t[2]*t[11],   //        ┌            ┐              ┌            ┐┌            ┐
                        t[4], t[5], t[6], t[4]*t[3]+t[5]*t[7]+t[6]*t[11],   //        │ a  b  c  d │    this      │ 1  0  0  d ││ a  b  c  0 │   this makes the camera appear to
                        t[8], t[9], t[10], t[8]*t[3]+t[9]*t[7]+t[10]*t[11], // tmat = │ e  f  g  h │    code      │ 0  1  0  h ││ e  f  g  0 │   rotate around the camera's center
                        t[12], t[13], t[14], t[15]                          //        │ i  j  k  l │    effec-    │ 0  0  1  l ││ i  j  k  0 │   instead of the world's center
                        ])));                                               //        │ m  n  o  p │    tively    │ 0  0  0  p ││ 0  0  0  1 │
                                                                            //        └            ┘    does      └            ┘└            ┘
        gl.uniform3f(lightDirLoc, world.lighting.lightDir.x, world.lighting.lightDir.y, world.lighting.lightDir.z);
        gl.uniform3f(ambientLoc, world.lighting.ambient.r/255, world.lighting.ambient.g/255, world.lighting.ambient.b/255);

        for (var i = 0; i < world.objects.length; i++) {
            var obj = world.objects[i];

            gl.uniformMatrix4fv(tmatLoc, false, new Float32Array(mat4transpose(obj.tmat)));
            gl.uniform4f(colorLoc, obj.color.r/255, obj.color.g/255, obj.color.b/255, obj.color.a/255);

            gl.drawElements(gl.TRIANGLES, cube.indices.length, gl.UNSIGNED_BYTE, 0);
        }
        requestAnimationFrame(render);
    }
    render();

    function compileShaders(gl, vtxSrc, fragSrc) {
        var prgm = gl.createProgram();

        var vtx = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vtx, vtxSrc);
        gl.compileShader(vtx);

        var success = gl.getShaderParameter(vtx, gl.COMPILE_STATUS);
        if (!success)
            alert("error compiling vertex shader\n" + gl.getShaderInfoLog(vtx));

        var frag = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(frag, fragSrc);
        gl.compileShader(frag);

        success = gl.getShaderParameter(frag, gl.COMPILE_STATUS);
        if (!success)
            alert("error compiling fragment shader\n" + gl.getShaderInfoLog(frag));

        gl.attachShader(prgm, vtx);
        gl.attachShader(prgm, frag);
        gl.linkProgram(prgm);
        success = gl.getProgramParameter(prgm, gl.LINK_STATUS);
        if (!success)
            alert("error linking shader program\n" + gl.getProgramInfoLog(prgm));

        gl.deleteShader(vtx);
        gl.deleteShader(frag);

        return prgm;
    }

});
