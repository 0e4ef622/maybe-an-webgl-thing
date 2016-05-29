// TODO shadows
window.addEventListener("load", function(){

    var cube = {};
    cube.vertices = new Float32Array([
            // front face    normal vector
            .5, -.5, -.5,       0,  0, -1,
            .5,  .5, -.5,       0,  0, -1,
           -.5,  .5, -.5,       0,  0, -1,
           -.5, -.5, -.5,       0,  0, -1,
            // back face
           -.5, -.5,  .5,       0,  0,  1,
           -.5,  .5,  .5,       0,  0,  1,
            .5,  .5,  .5,       0,  0,  1,
            .5, -.5,  .5,       0,  0,  1,
            // left face
           -.5, -.5, -.5,      -1,  0,  0,
           -.5,  .5, -.5,      -1,  0,  0,
           -.5,  .5,  .5,      -1,  0,  0,
           -.5, -.5,  .5,      -1,  0,  0,
            // right face
            .5, -.5,  .5,       1,  0,  0,
            .5,  .5,  .5,       1,  0,  0,
            .5,  .5, -.5,       1,  0,  0,
            .5, -.5, -.5,       1,  0,  0,
            // top face
            .5,  .5, -.5,       0,  1,  0,
            .5,  .5,  .5,       0,  1,  0,
           -.5,  .5,  .5,       0,  1,  0,
           -.5,  .5, -.5,       0,  1,  0,
            // bottom face
            .5, -.5,  .5,       0, -1,  0,
            .5, -.5, -.5,       0, -1,  0,
           -.5, -.5, -.5,       0, -1,  0,
           -.5, -.5,  .5,       0, -1,  0
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

    var shadowResolution = [1024, 1024];

    var width = 640;
    var height = 480;
    var aspectRatio = width/height;

    var fov = 60; // degrees
    var minDepth = n = .1;
    var maxDepth = f = 500;
    var r = Math.tan(fov/180*Math.PI/2)*n;
    var t = r/aspectRatio;

    var pmat = new Float32Array([ // column major order
            n/r, 0, 0, 0,
            0,n/t, 0, 0,
            0, 0,-(f+n)/(f-n), -1,
            0, 0, -2*f*n/(f-n), 0
    ]);
    var depthPmat = new Float32Array([
            //ortho matrix here
    ]);

    var vtxSrc =
        "attribute vec3 pos;"+
        "attribute vec3 norm;"+
        "uniform vec3 light_dir;"+
        "uniform vec3 ambient;"+
        "uniform mat4 tmat;"+
        "uniform mat4 cmat;"+
        "uniform mat4 pmat;"+
        "uniform mat3 nmat;"+
        "varying lowp vec3 lighting;"+
        "varying mediump vec3 reflect_dir;"+
        "varying mediump vec3 frag_pos;"+

        "void main() {"+
            "gl_Position = pmat * cmat * tmat * vec4(pos, 1.0);"+
            "vec3 normal = normalize(nmat * norm);"+
            "vec3 diffuse = vec3(max(dot(normal, -light_dir), 0.0));"+
            "lighting = ambient + diffuse;"+
            "reflect_dir = reflect(light_dir, normal);"+
            "frag_pos = vec3(tmat * vec4(pos, 1.0));"+
        "}";
    var fragSrc =
        "varying lowp vec3 lighting;"+
        "varying mediump vec3 reflect_dir;"+
        "varying mediump vec3 frag_pos;"+
        "uniform lowp vec4 color;"+
        "uniform highp mat4 cmat;"+
        "uniform mediump vec3 cam_pos;"+

        "lowp float pow32(mediump float b) {"+
            "mediump float acc = 1.0;"+
            "for (int i = 0; i < 64; i++) {"+
                "acc *= b;"+
            "}"+
            "return acc;"+
        "}"+

        "void main() {"+
            "mediump vec3 cam_dir = normalize(cam_pos - frag_pos);"+
            "lowp float spec = pow32(max(dot(cam_dir, reflect_dir), 0.0));"+
            "lowp vec3 specular = spec * vec3(.5, .5, .5);"+
            "gl_FragColor = vec4(lighting + specular, 1) * color;"+
        "}";
    var depthMapVtxSrc =
        "attribute vec3 pos;"+
        "uniform mat4 tmat;"+
        "uniform mat4 cmat;"+
        "uniform mat4 pmat;"+

        "void main() {"+
            "gl_Position = pmat * cmat * tmat * vec4(pos, 1.0);"+
        "}";
    var depthMapFragSrc = "void main(){}";

    var cnv = document.getElementById("cnv");
    cnv.width = width;
    cnv.height = height;
    var gl = cnv.getContext("webgl") || cnv.getContext("webgl-experimental");

    if (!gl) {
        alert("Your browser does not support WebGL");
        return;
    }

    /*var wglDepthTxtrExtension = gl.getExtension("WEBGL_depth_texture") || gl.getExtension("WEBKIT_WEBGL_depth_texture") || gl.getExtension("MOZ_WEBGL_depth_texture");
    if (!wglDepthTxtrExtension) {
        alert("Your browser does not support the WEBGL_depth_texture extension :(");
        return;
    }*/

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CW);
    gl.clearColor(.5, .6, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var prgm = compileShaders(gl, vtxSrc, fragSrc);
    var depthMapPrgm = compileShaders(gl, depthMapVtxSrc, depthMapFragSrc);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, cube.vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(gl.getAttribLocation(prgm, "pos"), 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(gl.getAttribLocation(prgm, "pos"));
    gl.vertexAttribPointer(gl.getAttribLocation(depthMapPrgm, "pos"), 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(gl.getAttribLocation(depthMapPrgm, "pos"));
    gl.vertexAttribPointer(gl.getAttribLocation(prgm, "norm"), 3, gl.FLOAT, false, 24, 12);
    gl.enableVertexAttribArray(gl.getAttribLocation(prgm, "norm"));

    var elemBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elemBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cube.indices, gl.STATIC_DRAW);

    var depthMapFBO = gl.createFramebuffer();
        depthMap = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, depthMap);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, shadowResolution[0], shadowResolution[1], 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.bindFramebuffer(gl.FRAMEBUFFER, depthMapFBO);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthMap, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    var tmatLoc = gl.getUniformLocation(prgm, "tmat"),
        nmatLoc = gl.getUniformLocation(prgm, "nmat"),
        cmatLoc = gl.getUniformLocation(prgm, "cmat"),
        pmatLoc = gl.getUniformLocation(prgm, "pmat"),
        colorLoc = gl.getUniformLocation(prgm, "color"),
        lightDirLoc = gl.getUniformLocation(prgm, "light_dir"),
        ambientLoc = gl.getUniformLocation(prgm, "ambient"),
        camPosLoc = gl.getUniformLocation(prgm, "cam_pos"),
        depthMapTmatLoc = gl.getUniformLocation(depthMapPrgm, "tmat"),
        depthMapCmatLoc = gl.getUniformLocation(depthMapPrgm, "cmat"),
        depthMapPmatLoc = gl.getUniformLocation(depthMapPrgm, "pmat");

    window.requestAnimationFrame = (window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(f){setTimeout(f,10);});

    var frames = 0;
    function render() {
        /*gl.bindFramebuffer(gl.FRAMEBUFFER, depthMapFBO);
          gl.clear(gl.DEPTH_BUFFER_BIT);
          gl.viewport(0, 0, shadowResolution[0], shadowResolution[1]);
          gl.colorMask(0, 0, 0, 0);
          /*gl.uniformMatrix4fv(depthMapCmatLoc, false, new Float32Array([
                      uh
          ]));
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);*/

        gl.viewport(0, 0, cnv.width, cnv.height);
        gl.colorMask(1, 1, 1, 1);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(prgm);

        gl.uniformMatrix4fv(gl.getUniformLocation(prgm, "pmat"), false, pmat);

        /* obscure code that i probably by now forgot how it works */
        var d = world.camera.dir;
        var p = world.camera.pos;
        var up = new Vec3(0, 1, 0);
        var right = up.cross(d).norm();
        up = d.cross(right);
        var lookat = new Mat4([
                right.x, right.y, right.z, 0,
                up.x, up.y, up.z, 0,
                d.x, d.y, d.z, 0,
                0, 0, 0, 1]);
        p = new Mat4([
                1, 0, 0, -p.x,
                0, 1, 0, -p.y,
                0, 0, 1, -p.z,
                0, 0, 0, 1]);
        var cmat = lookat.mult(p).transpose().mat;
        gl.uniformMatrix4fv(cmatLoc, false, new Float32Array(cmat));
        gl.uniform3f(camPosLoc, world.camera.pos.x, world.camera.pos.y, world.camera.pos.z);
        gl.uniform3f(lightDirLoc, world.lighting.lightDir.x, world.lighting.lightDir.y, world.lighting.lightDir.z);
        gl.uniform3f(ambientLoc, world.lighting.ambient.r/255, world.lighting.ambient.g/255, world.lighting.ambient.b/255);

        drawWorld(gl, world);

        frames++;
        requestAnimationFrame(render);
    }

    var fpsElem = document.getElementById("fps");
    setInterval(function(){
        fpsElem.innerHTML = frames + " fps";
        frames = 0;
    }, 1000);
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

    function drawWorld(gl, world) {
        for (var i = 0; i < world.objects.length; i++) {
            var obj = world.objects[i];

            var nmat = (new Mat3(obj.tmat)).inverse().mat; // since webgl expects the matrix to be in column major order, we dont need to transpose

            gl.uniformMatrix3fv(nmatLoc, false, new Float32Array(nmat));
            gl.uniformMatrix4fv(tmatLoc, false, new Float32Array(obj.tmat.transpose().mat));
            gl.uniform4f(colorLoc, obj.color.r/255, obj.color.g/255, obj.color.b/255, obj.color.a/255);

            gl.drawElements(gl.TRIANGLES, cube.indices.length, gl.UNSIGNED_BYTE, 0);
        }
    }

});
