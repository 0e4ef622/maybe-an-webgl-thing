window.addEventListener("load", function(){

    var cube = {};
    cube.vertices = new Float32Array([
            // front face    normal vector     texture mapping  face number
            .5, -.5, -.5,       0,  0, -1,     1, 1,           0,
            .5,  .5, -.5,       0,  0, -1,     1, 0,           0,
           -.5,  .5, -.5,       0,  0, -1,     0, 0,           0,
           -.5, -.5, -.5,       0,  0, -1,     0, 1,           0,
            // back face
           -.5, -.5,  .5,       0,  0,  1,     1, 1,           1,
           -.5,  .5,  .5,       0,  0,  1,     1, 0,           1,
            .5,  .5,  .5,       0,  0,  1,     0, 0,           1,
            .5, -.5,  .5,       0,  0,  1,     0, 1,           1,
            // left face
           -.5, -.5, -.5,      -1,  0,  0,     1, 1,           2,
           -.5,  .5, -.5,      -1,  0,  0,     1, 0,           2,
           -.5,  .5,  .5,      -1,  0,  0,     0, 0,           2,
           -.5, -.5,  .5,      -1,  0,  0,     0, 1,           2,
            // right face
            .5, -.5,  .5,       1,  0,  0,     1, 1,           3,
            .5,  .5,  .5,       1,  0,  0,     1, 0,           3,
            .5,  .5, -.5,       1,  0,  0,     0, 0,           3,
            .5, -.5, -.5,       1,  0,  0,     0, 1,           3,
            // top face
            .5,  .5, -.5,       0,  1,  0,     1, 1,           4,
            .5,  .5,  .5,       0,  1,  0,     1, 0,           4,
           -.5,  .5,  .5,       0,  1,  0,     0, 0,           4,
           -.5,  .5, -.5,       0,  1,  0,     0, 1,           4,
            // bottom face
            .5, -.5,  .5,       0, -1,  0,     1, 1,           5,
            .5, -.5, -.5,       0, -1,  0,     1, 0,           5,
           -.5, -.5, -.5,       0, -1,  0,     0, 0,           5,
           -.5, -.5,  .5,       0, -1,  0,     0, 1,           5
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
            0, 0, -2*f*n/(f-n), 0]);

    var cnv = document.getElementById("cnv");
    cnv.width = width;
    cnv.height = height;
    gl = cnv.getContext("webgl", {stencil: true}) || cnv.getContext("webgl-experimental", {stencil: true});

    if (!gl) {
        alert("Your browser does not support WebGL");
        return;
    }

    var vtxSrc =
        "attribute vec3 pos;"+
        "attribute vec3 norm;"+
        "attribute vec2 texture_coord;"+
        "attribute float in_face;"+

        "uniform vec3 light_dir;"+
        "uniform mat4 tmat;"+
        "uniform mat4 cmat;"+
        "uniform mat4 pmat;"+
        "uniform mat3 nmat;"+
        "uniform mat4 lightSpaceMatrix;"+

        "varying lowp vec3 diffuse;"+
        "varying mediump vec3 reflect_dir;"+
        "varying mediump vec3 frag_pos;"+
        "varying vec2 uv_texture;"+
        "varying float face;"+

        "void main() {"+
            "gl_Position = pmat * cmat * tmat * vec4(pos, 1.0);"+
            "vec3 normal = normalize(nmat * norm);"+
            "diffuse = vec3(max(dot(normal, -light_dir), 0.0));"+
            "reflect_dir = reflect(light_dir, normal);"+
            "frag_pos = vec3(tmat * vec4(pos, 1.0));"+

            "uv_texture = texture_coord;"+
            "face = in_face;"+
        "}";
    var fragSrc =
        "varying mediump vec3 reflect_dir;"+
        "varying mediump vec3 frag_pos;"+
        "varying mediump vec2 uv_texture;"+
        "varying mediump float face;"+
        "varying lowp vec3 diffuse;"+

        "uniform lowp vec3 ambient;"+
        "uniform lowp vec4 color;"+
        "uniform highp mat4 cmat;"+
        "uniform mediump vec3 cam_pos;"+
        "uniform sampler2D cube_front;"+
        "uniform sampler2D cube_back;"+
        "uniform sampler2D cube_left;"+
        "uniform sampler2D cube_right;"+
        "uniform sampler2D cube_top;"+
        "uniform sampler2D cube_bottom;"+
        "uniform mediump vec2 cube_front_repeat;"+
        "uniform mediump vec2 cube_back_repeat;"+
        "uniform mediump vec2 cube_left_repeat;"+
        "uniform mediump vec2 cube_right_repeat;"+
        "uniform mediump vec2 cube_top_repeat;"+
        "uniform mediump vec2 cube_bottom_repeat;"+
        "uniform mediump float lighting;"+

        "lowp float pow64(mediump float b) {"+
            "mediump float acc = 1.0;"+
            "for (int i = 0; i < 64; i++) {"+
                "acc *= b;"+
            "}"+
            "return acc;"+
        "}"+

        "void main() {"+
            "mediump vec3 cam_dir = normalize(cam_pos - frag_pos);"+
            "lowp float spec = pow64(max(dot(cam_dir, reflect_dir), 0.0));"+
            "lowp vec3 specular = spec * vec3(.5, .5, .5);"+

            "lowp vec4 texColor;"+
            "if (face == 0.0)"+
                "texColor = texture2D(cube_front, uv_texture * cube_front_repeat);"+
            "else if (face == 1.0)"+
                "texColor = texture2D(cube_back, uv_texture * cube_back_repeat);"+
            "else if (face == 2.0)"+
                "texColor = texture2D(cube_left, uv_texture * cube_left_repeat);"+
            "else if (face == 3.0)"+
                "texColor = texture2D(cube_right, uv_texture * cube_right_repeat);"+
            "else if (face == 4.0)"+
                "texColor = texture2D(cube_top, uv_texture * cube_top_repeat);"+
            "else if (face == 5.0)"+
                "texColor = texture2D(cube_bottom, uv_texture * cube_bottom_repeat);"+

            "gl_FragColor = vec4(ambient + lighting * (diffuse + specular), 1) * mix(color, texColor, texColor.a);"+
        "}";
    var shadowVolVtxSrc =
        "attribute vec4 pos;"+

        "uniform mat4 cmat;"+
        "uniform mat4 pmat;"+

        "void main() {"+
            "gl_Position = pmat * cmat * pos;"+
        "}";
    var shadowVolFragSrc =
        "void main() {}";
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(.5, .6, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var prgm = compileShaders(gl, vtxSrc, fragSrc);
    var shadowVolPrgm = compileShaders(gl, shadowVolVtxSrc, shadowVolFragSrc);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, cube.vertices, gl.STATIC_DRAW);

    var elemBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elemBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cube.indices, gl.STATIC_DRAW);

    var shadowVolBuf = gl.createBuffer();

    var tmatLoc = gl.getUniformLocation(prgm, "tmat"),
        nmatLoc = gl.getUniformLocation(prgm, "nmat"),
        cmatLoc = gl.getUniformLocation(prgm, "cmat"),
        pmatLoc = gl.getUniformLocation(prgm, "pmat"),
        colorLoc = gl.getUniformLocation(prgm, "color"),
        lightDirLoc = gl.getUniformLocation(prgm, "light_dir"),
        ambientLoc = gl.getUniformLocation(prgm, "ambient"),
        camPosLoc = gl.getUniformLocation(prgm, "cam_pos"),
        LSMLoc = gl.getUniformLocation(prgm, "lightSpaceMatrix"),
        lightingLoc = gl.getUniformLocation(prgm, "lighting"),
        cubeTexLocs = [gl.getUniformLocation(prgm, "cube_front"),
                       gl.getUniformLocation(prgm, "cube_back"),
                       gl.getUniformLocation(prgm, "cube_left"),
                       gl.getUniformLocation(prgm, "cube_right"),
                       gl.getUniformLocation(prgm, "cube_top"),
                       gl.getUniformLocation(prgm, "cube_bottom")],
        cubeTexRepeatLocs = [gl.getUniformLocation(prgm, "cube_front_repeat"),
                             gl.getUniformLocation(prgm, "cube_back_repeat"),
                             gl.getUniformLocation(prgm, "cube_left_repeat"),
                             gl.getUniformLocation(prgm, "cube_right_repeat"),
                             gl.getUniformLocation(prgm, "cube_top_repeat"),
                             gl.getUniformLocation(prgm, "cube_bottom_repeat")],
        shadowVolCmatLoc = gl.getUniformLocation(shadowVolPrgm, "cmat"),
        shadowVolPmatLoc = gl.getUniformLocation(shadowVolPrgm, "pmat");

    window.requestAnimationFrame = (window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(f){setTimeout(f,10);});

    var blankTexSrc = new ArrayBuffer(4);
    var src = new Uint8Array(blankTexSrc);
    var blankTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, blankTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    var frames = 0;
    function render() {

        gl.viewport(0, 0, cnv.width, cnv.height);
        gl.colorMask(1, 1, 1, 1);
        gl.frontFace(gl.CW);
        gl.depthMask(true);
        gl.disable(gl.STENCIL_TEST);
        gl.enable(gl.CULL_FACE);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

        gl.useProgram(prgm);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elemBuf);
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.vertexAttribPointer(gl.getAttribLocation(prgm, "pos"), 3, gl.FLOAT, false, 36, 0);
        gl.enableVertexAttribArray(gl.getAttribLocation(prgm, "pos"));
        gl.vertexAttribPointer(gl.getAttribLocation(prgm, "norm"), 3, gl.FLOAT, false, 36, 12);
        gl.enableVertexAttribArray(gl.getAttribLocation(prgm, "norm"));
        gl.vertexAttribPointer(gl.getAttribLocation(prgm, "texture_coord"), 2, gl.FLOAT, false, 36, 24);
        gl.enableVertexAttribArray(gl.getAttribLocation(prgm, "texture_coord"));
        gl.vertexAttribPointer(gl.getAttribLocation(prgm, "in_face"), 1, gl.FLOAT, false, 36, 32);
        gl.enableVertexAttribArray(gl.getAttribLocation(prgm, "in_face"));

        gl.uniformMatrix4fv(pmatLoc, false, pmat);

        // obscure code that i probably by now forgot how it works
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
        var cmat = new Float32Array(lookat.mult(p).transpose().mat);
        gl.uniformMatrix4fv(cmatLoc, false, cmat);
        gl.uniform3f(camPosLoc, world.camera.pos.x, world.camera.pos.y, world.camera.pos.z);
        gl.uniform3f(lightDirLoc, world.lighting.lightDir.x, world.lighting.lightDir.y, world.lighting.lightDir.z);
        gl.uniform3f(ambientLoc, world.lighting.ambient.r/255, world.lighting.ambient.g/255, world.lighting.ambient.b/255);

        drawWorld(gl, world, false);

        gl.enable(gl.STENCIL_TEST);
        gl.disable(gl.CULL_FACE);
        gl.colorMask(0, 0, 0, 0);
        gl.depthMask(false);
        gl.stencilFunc(gl.ALWAYS, 0, -1);
        gl.stencilOpSeparate(gl.BACK, gl.KEEP, gl.INCR_WRAP, gl.KEEP);
        gl.stencilOpSeparate(gl.FRONT, gl.KEEP, gl.DECR_WRAP, gl.KEEP);

        gl.useProgram(shadowVolPrgm);
        gl.uniformMatrix4fv(shadowVolCmatLoc, false, cmat);
        gl.uniformMatrix4fv(shadowVolPmatLoc, false, pmat);
        var shadowVolume = genShadowVolume(world);
        gl.bindBuffer(gl.ARRAY_BUFFER, shadowVolBuf);
        gl.bufferData(gl.ARRAY_BUFFER, shadowVolume, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(gl.getAttribLocation(shadowVolPrgm, "pos"), 4, gl.FLOAT, false, 16, 0);
        gl.enableVertexAttribArray(gl.getAttribLocation(shadowVolPrgm, "pos"));
        gl.drawArrays(gl.TRIANGLES, 0, shadowVolume.length/4);

        gl.stencilFunc(gl.EQUAL, 0, -1);
        gl.depthMask(true);
        gl.enable(gl.CULL_FACE);
        gl.colorMask(1, 1, 1, 1);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
        gl.clear(gl.DEPTH_BUFFER_BIT);

        gl.useProgram(prgm);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elemBuf);
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.vertexAttribPointer(gl.getAttribLocation(prgm, "pos"), 3, gl.FLOAT, false, 36, 0);
        gl.enableVertexAttribArray(gl.getAttribLocation(prgm, "pos"));
        gl.vertexAttribPointer(gl.getAttribLocation(prgm, "norm"), 3, gl.FLOAT, false, 36, 12);
        gl.enableVertexAttribArray(gl.getAttribLocation(prgm, "norm"));
        gl.vertexAttribPointer(gl.getAttribLocation(prgm, "texture_coord"), 2, gl.FLOAT, false, 36, 24);
        gl.enableVertexAttribArray(gl.getAttribLocation(prgm, "texture_coord"));
        gl.vertexAttribPointer(gl.getAttribLocation(prgm, "in_face"), 1, gl.FLOAT, false, 36, 32);
        gl.enableVertexAttribArray(gl.getAttribLocation(prgm, "in_face"));

        drawWorld(gl, world, true);

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

    function drawWorld(gl, world, lighting) {
        gl.uniform1f(lightingLoc, lighting);
        for (var i = 0; i < world.objects.length; i++) {
            var obj = world.objects[i];

            var nmat = (new Mat3(obj.tmat)).inverse().mat; // since webgl expects the matrix to be in column major order, we dont need to transpose

            gl.uniformMatrix3fv(nmatLoc, false, new Float32Array(nmat));
            gl.uniformMatrix4fv(tmatLoc, false, new Float32Array(obj.tmat.transpose().mat));
            gl.uniform4f(colorLoc, obj.color.r/255, obj.color.g/255, obj.color.b/255, obj.color.a/255);

            var texUnits = [gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2, gl.TEXTURE3, gl.TEXTURE4, gl.TEXTURE5];
            for (var j = 0; j < texUnits.length; j++) {
                gl.activeTexture(texUnits[j]);
                if (obj.textures[j]) {
                    gl.bindTexture(gl.TEXTURE_2D, obj.textures[j].gltexture);
                    gl.uniform2fv(cubeTexRepeatLocs[j], obj.textures[j].repeat);
                } else {
                    gl.bindTexture(gl.TEXTURE_2D, blankTex);
                }
                gl.uniform1i(cubeTexLocs[j], j);
            }

            gl.drawElements(gl.TRIANGLES, cube.indices.length, gl.UNSIGNED_BYTE, 0);
        }
    }

    function genShadowVolume(world) {
        function edgeInArray(arr, p1, p2) {
            for (var i = 0; i < arr.length; i += 2) {
                if ((arr[i].equals(p1) && arr[i+1].equals(p2)) || (arr[i].equals(p2) && arr[i+1].equals(p1))) return i;
            }
            return -1;
        }
        var edges = [];
        var faces = [];
        for (var i = 0; i < world.objects.length; i++) {

            var obj = world.objects[i];
            var faceEdges = [];
            for (var face = 0; face < 6; face++) {
                var j = face*9*4;

                var norm = new Vec3(cube.vertices[j+3], cube.vertices[j+4], cube.vertices[j+5]);
                norm = (new Mat3(obj.tmat)).inverse().transpose().mult(norm);

                if (norm.dot(world.lighting.lightDir) >= 0) { // if the face is facing away from the light

                    for (var edge = 0; edge < 4; edge++) {

                        var pos1, pos2;
                        if (edge == 3) {
                            //special stuff
                            pos1 = new Vec4(cube.vertices[j+edge*9], cube.vertices[j+edge*9+1], cube.vertices[j+edge*9+2], 1);
                            pos2 = new Vec4(cube.vertices[j], cube.vertices[j+1], cube.vertices[j+2], 1);
                        } else {
                            pos1 = new Vec4(cube.vertices[j+edge*9], cube.vertices[j+edge*9+1], cube.vertices[j+edge*9+2], 1);
                            pos2 = new Vec4(cube.vertices[j+edge*9+9], cube.vertices[j+edge*9+10], cube.vertices[j+edge*9+11], 1);
                        }
                        pos1 = obj.tmat.mult(pos1);
                        pos2 = obj.tmat.mult(pos2);

                        var e = edgeInArray(faceEdges, pos1, pos2);
                        if (e == -1) {
                            faceEdges.push(pos1, pos2);
                        } else {
                            faceEdges.splice(e, 2);
                        }
                    }
                    var pos1 = new Vec4(cube.vertices[j], cube.vertices[j+1], cube.vertices[j+2], 1);
                    var pos2 = new Vec4(cube.vertices[j+9], cube.vertices[j+10], cube.vertices[j+11], 1);
                    var pos3 = new Vec4(cube.vertices[j+18], cube.vertices[j+19], cube.vertices[j+20], 1);
                    var pos4 = new Vec4(cube.vertices[j+27], cube.vertices[j+28], cube.vertices[j+29], 1);

                    // cap near end of shadow
                    pos1 = obj.tmat.mult(pos1);
                    pos2 = obj.tmat.mult(pos2);
                    pos3 = obj.tmat.mult(pos3);
                    pos4 = obj.tmat.mult(pos4);
                    faces.push(pos1, pos4, pos3, pos3, pos2, pos1);
                    // TODO cap the far end of shadow
                    var ld = world.lighting.lightDir;
                    var pn = world.camera.dir.neg();
                    var pp = world.camera.pos.add(pn.mult(maxDepth));
                    if (pos1 = rayPlaneIntersect(new Vec3(pos1), ld, pp, pn)) {
                        pos1 = new Vec4(pos1, 1);
                        pos2 = new Vec4(rayPlaneIntersect(new Vec3(pos2), ld, pp, pn), 1)
                        pos3 = new Vec4(rayPlaneIntersect(new Vec3(pos3), ld, pp, pn), 1);
                        pos4 = new Vec4(rayPlaneIntersect(new Vec3(pos4), ld, pp, pn), 1);
                        faces.push(pos1, pos2, pos3, pos3, pos4, pos1);
                    }
                }
            }
            edges = edges.concat(faceEdges);
        }
        var vertices = new Float32Array(edges.length*12 + faces.length*4);
        for (var i = 0; i < edges.length; i += 2) {
            var v1 = edges[i];
            var v2 = edges[i+1];
            var v3 = v4 = new Vec4(world.lighting.lightDir, 0);

            vertices[i*12] = v1.x;
            vertices[i*12+1] = v1.y;
            vertices[i*12+2] = v1.z;
            vertices[i*12+3] = v1.w;
            vertices[i*12+4] = v2.x;
            vertices[i*12+5] = v2.y;
            vertices[i*12+6] = v2.z;
            vertices[i*12+7] = v2.w;
            vertices[i*12+8] = v3.x;
            vertices[i*12+9] = v3.y;
            vertices[i*12+10] = v3.z;
            vertices[i*12+11] = v3.w;
            vertices[i*12+12] = v3.x;
            vertices[i*12+13] = v3.y;
            vertices[i*12+14] = v3.z;
            vertices[i*12+15] = v3.w;
            vertices[i*12+16] = v4.x;
            vertices[i*12+17] = v4.y;
            vertices[i*12+18] = v4.z;
            vertices[i*12+19] = v4.w;
            vertices[i*12+20] = v1.x;
            vertices[i*12+21] = v1.y;
            vertices[i*12+22] = v1.z;
            vertices[i*12+23] = v1.w;
        }
        for (var i = 0; i < faces.length; i++) {
            var vi = edges.length*12 + i*4;
            var v = faces[i];
            vertices[vi] = v.x;
            vertices[vi+1] = v.y;
            vertices[vi+2] = v.z;
            vertices[vi+3] = v.w;
        }
        return vertices;
    }

});
