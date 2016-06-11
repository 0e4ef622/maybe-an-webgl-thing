function World() {
    this.objects = [];
    this.camera = new Camera();
    this.lighting = {
        ambient: { // 0 to 255
            r: 100,
            g: 100,
            b: 100
        },
        lightDir: new Vec3(0.267261, -0.534522, -0.801784) // unit vector
    };
}

function Generic(x, y, z) {
    x = typeof x == "undefined" ? 0 : x;
    y = typeof y == "undefined" ? 0 : y;
    z = typeof z == "undefined" ? 0 : z;

    this.tmat = new Mat4([
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z,
        0, 0, 0, 1
    ]);

    var t = this;

    Object.defineProperty(t, "pos", { // keep the position and tmat in sync
        get: function() {
            var v = new Vec3();
            Object.defineProperties(v, {
                x: {
                    get: function() {
                        return t.tmat.mat[3];
                    },
                    set: function(v) {
                        t.tmat.mat[3] = v;
                    }
                },
                y: {
                    get: function() {
                        return t.tmat.mat[7];
                    },
                    set: function(v) {
                        t.tmat.mat[7] = v;
                    }
                },
                z: {
                    get: function() {
                        return t.tmat.mat[11];
                    },
                    set: function(v) {
                        t.tmat.mat[11] = v;
                    }
                }
            });
            return v;
        },
        set: function(v) {
            t.tmat.mat[3] = v.x;
            t.tmat.mat[7] = v.y;
            t.tmat.mat[11] = v.z;
        }
    });
}
Generic.prototype.rotate = function(x, y, z) { // radians
    var c = Math.cos,
        s = Math.sin,
        cx = c(x),
        sx = s(x),
        cy = c(y),
        sy = s(y),
        cz = c(z),
        sz = s(z);

    var t = new Mat3(this.tmat);
    var r = new Mat3([cy*cz, sx*sy*cz-cx*sz, cx*sy*cz+sx*sz,
                      cy*sz, sx*sy*sz+cx*cz, cx*sy*sz-sx*cz,
                        -sy,          sx*cy,          cx*cy]);
    r = r.mult(t).mat;
    this.tmat.mat = [r[0], r[1], r[2],  this.tmat.mat[3],
                     r[3], r[4], r[5],  this.tmat.mat[7],
                     r[6], r[7], r[8], this.tmat.mat[11],
                        0,    0,    0,                  1];

    return this;
};
Generic.prototype.resetRotation = function() {
    this.tmat.mat = [1, 0, 0, this.tmat.mat[3],
                     0, 1, 0, this.tmat.mat[7],
                     0, 0, 1, this.tmat.mat[11],
                     0, 0, 0, 1];
    return this;
};
Generic.prototype.move = function(x, y, z) {
    var r = this.tmat.mat;
    this.tmat.mat = [
        r[0], r[1], r[2], x*r[0]+y*r[1]+z*r[2]+r[3],
        r[4], r[5], r[6], x*r[4]+y*r[5]+z*r[6]+r[7],
        r[8], r[9], r[10], x*r[8]+y*r[9]+z*r[10]+r[11],
        r[12], r[13], r[14], r[15]
    ];
    return this;
};

Generic.prototype.lookAt = function(pos) {
    var up = new Vec3(0, 1, 0);
    var dir = pos.subtract(this.pos).norm();
    var x = up.cross(dir).norm();
    var y = dir.cross(x);

    this.tmat = new Mat4([
                x.x,   y.x, dir.x, this.pos.x,
                x.y,   y.y, dir.y, this.pos.y,
                x.z,   y.z, dir.z, this.pos.z,
                0,     0,     0,     1
    ]);
    return this;
};


function Camera(x, y, z) {
    if (typeof x == "undefined") x = 0;
    if (typeof y == "undefined") y = 0;
    if (typeof z == "undefined") z = 0;

    this.pos = new Vec3(x, y, z);
    this.dir = new Vec3(0, 0, -1); // must be a normal vector
}

Camera.prototype.move = function (x, y, z) {
    var up = new Vec3(0, 1, 0);
    var right = up.cross(this.dir).norm();
    up = this.dir.cross(right);
    this.pos = this.pos.add(right.mult(x)).add(up.mult(y)).add(this.dir.mult(z));

    return this;
}

// source can be an ImageData, HTMLImageElement, HTMLCanvasElement, HTMLVideoElement, or
// an ArrayBufferView, for which an wh and type must be given
// such as gl.UNSIGNED_BYTE
// image must be an power of 2
function Texture(source, sample, wh, type) {
    if (source.constructor === Texture) {
        this.gltexture = source.gltexture;
    } else {
        this.gltexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.gltexture);
        if (wh)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, wh, wh, 0, gl.RGBA, type, source);
        else
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, sample || gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, sample || gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    this.repeat = [1, 1];
}

function Cube(x, y, z, r, g, b, a, sx, sy, sz) {
    x = typeof x == "undefined" ? 0 : x;
    y = typeof y == "undefined" ? 0 : y;
    z = typeof z == "undefined" ? 0 : z;
    r = typeof r == "undefined" ? 0 : r; /* 0 to 255 */
    g = typeof g == "undefined" ? 0 : g;
    b = typeof b == "undefined" ? 0 : b;
    a = typeof a == "undefined" ? 255 : a;
    sx = typeof sx == "undefined" ? 1 : sx;
    sy = typeof sy == "undefined" ? 1 : sy;
    sz = typeof sz == "undefined" ? 1 : sz;

    Generic.call(this, x, y, z);

    this.tmat.mat[0] = sx;
    this.tmat.mat[5] = sy;
    this.tmat.mat[10] = sz;

    this.color = {
        r: r,
        g: g,
        b: b,
        a: a
    };

    var tex = this.textures = [null, null, null, null, null, null];
    Object.defineProperties(this.textures, {
        front: {
            set: function(v) {
                tex[0] = v;
            }
        },
        back: {
            set: function(v) {
                tex[1] = v;
            }
        },
        left: {
            set: function(v) {
                tex[2] = v;
            }
        },
        right: {
            set: function(v) {
                tex[3] = v;
            }
        },
        top: {
            set: function(v) {
                tex[4] = v;
            }
        },
        bottom: {
            set: function(v) {
                tex[5] = v;
            }
        }
    });

}

Cube.prototype = Object.create(Generic.prototype);
