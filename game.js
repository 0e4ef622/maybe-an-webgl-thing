// TODO fullscreen
var world = new World();

(function() {

    // H
    world.objects.push(new Cube(-4, .5, 0, 230, 230, 0, 255));
    world.objects.push(new Cube(-5, 0, 0, 230, 230, 0, 255, 1, 4, 1));
    world.objects.push(new Cube(-3, 0, 0, 230, 230, 0, 255, 1, 4, 1));
    // A
    world.objects.push(new Cube(0, -.5, 0, 230, 230, 0, 255));
    world.objects.push(new Cube(-1, -.5, 0, 230, 230, 0, 255, 1, 3, 1));
    world.objects.push(new Cube(1, -.5, 0, 230, 230, 0, 255, 1, 3, 1));
    world.objects.push(new Cube(0, 1.5, 0, 230, 230, 0, 255));
    // I
    world.objects.push(new Cube(4, 0, 0, 230, 230, 0, 255, 1, 2, 1));
    world.objects.push(new Cube(4, 1.5, 0, 230, 230, 0, 255, 3, 1, 1));
    world.objects.push(new Cube(4, -1.5, 0, 230, 230, 0, 255, 3, 1, 1));
    // A
    world.objects.push(new Cube(5, -.5, 26, 0, 150, 0, 255));
    world.objects.push(new Cube(6, -.5, 26, 0, 150, 0, 255, 1, 3, 1));
    world.objects.push(new Cube(4, -.5, 26, 0, 150, 0, 255, 1, 3, 1));
    world.objects.push(new Cube(5, 1.5, 26, 0, 150, 0, 255));
    // S
    world.objects.push(new Cube(2, .5, 26, 0, 150, 0, 255));
    world.objects.push(new Cube(1.5, 1.5, 26, 0, 150, 0, 255, 2, 1, 1));
    world.objects.push(new Cube(1, -.5, 26, 0, 150, 0, 255));
    world.objects.push(new Cube(1.5, -1.5, 26, 0, 150, 0, 255, 2, 1, 1));
    // D
    world.objects.push(new Cube(-1, 0, 26, 0, 150, 0, 255, 1, 4, 1));
    world.objects.push(new Cube(-2, -1.5, 26, 0, 150, 0, 255));
    world.objects.push(new Cube(-2, 1.5, 26, 0, 150, 0, 255));
    world.objects.push(new Cube(-3, 0, 26, 0, 150, 0, 255, 1, 2, 1));
    // F
    world.objects.push(new Cube(-5, 0, 26, 0, 150, 0, 255, 1, 4, 1));
    world.objects.push(new Cube(-6.5, 1.5, 26, 0, 150, 0, 255, 2, 1, 1));
    world.objects.push(new Cube(-6, -.5, 26, 0, 150, 0, 255));
    // teh graund
    world.objects.push(new Cube(0, -3, 0, 128, 128, 128, 255, 200, 1, 200));

    world.camera.pos.z = 13;

    var pressedKeys = {};
    var pt = (new Date()).getTime();
    setInterval(function() {
        var t = (new Date()).getTime();
        var dt = t - pt;
        pt = t;

        world.objects[7].rotate(0, dt/1000, 0);
        world.objects[8].rotate(0, dt/1000, 0);
        world.objects[9].rotate(0, dt/1000, 0);

        /*
        pressedKeys['U+0057'] && world.camera.move(0, 0, .1);
        pressedKeys['U+0041'] && world.camera.move(.1, 0, 0);
        pressedKeys['U+0053'] && world.camera.move(0, 0, -.1);
        pressedKeys['U+0044'] && world.camera.move(-.1, 0, 0);
        pressedKeys['U+0051'] && world.camera.move(0, .1, 0);
        pressedKeys['U+0045'] && world.camera.move(0, -.1, 0);
        */

    }, 10);

    window.addEventListener("keydown", function(e) {
        pressedKeys[e.key || e.keyIdentifier] = 1;
    });
    window.addEventListener("keyup", function(e) {
        pressedKeys[e.key || e.keyIdentifier] = 0;
    });

    window.addEventListener("load", function() {
        var cnv = document.getElementById("cnv");

        var pitch = 0,
            yaw = 0;

        // for people with an touchscreen
        var prevTouch = {x: 0, y: 0};
        var touch = false;
        cnv.addEventListener("touchstart", function(e) {
            e.preventDefault();
            prevTouch.x = e.touches[0].pageX;
            prevTouch.y = e.touches[0].pageY;
            touch = true;
        });

        window.addEventListener("touchmove", function(e) {
            if (!touch) return;
            yaw += (prevTouch.x - e.touches[0].pageX)/300;
            pitch += (prevTouch.y - e.touches[0].pageY)/300;

            world.camera.resetRotation().rotate(0, yaw, 0).rotate(pitch, 0, 0);

            prevTouch.x = e.touches[0].pageX;
            prevTouch.y = e.touches[0].pageY;
        });

        window.addEventListener("touchend", function() {
            touch = false;
        });

        // for people with an mouse
        cnv.addEventListener("click", function() {
            if (document.pointerLockElement != cnv) cnv.requestPointerLock();
        });

        window.addEventListener("mousemove", function(e) {
            if (document.pointerLockElement != cnv) return;
            yaw += e.movementX/300;
            pitch += e.movementY/300;

            world.camera.dir.x = Math.cos(pitch) * Math.cos(yaw);
            world.camera.dir.y = Math.sin(pitch);
            world.camera.dir.z = Math.cos(pitch) * Math.sin(yaw);;
        });

    });

})();

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
    this.pos = {
        get x() {
            return t.tmat.mat[3];
        },
        set x(v) {
            t.tmat.mat[3] = v; },
        get y() {
            return t.tmat.mat[7];
        },
        set y(v) {
            t.tmat.mat[7] = v;
        },
        get z() {
            return t.tmat.mat[11];
        },
        set z(v) {
            t.tmat.mat[11] = v;
        }
    };

    this.rotate = function(x, y, z) { // radians
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
    this.resetRotation = function() {
        this.tmat.mat = [1, 0, 0, this.tmat.mat[3],
                         0, 1, 0, this.tmat.mat[7],
                         0, 0, 1, this.tmat.mat[11],
                         0, 0, 0, 1];
        return this;
    };
    this.move = function(x, y, z) {
        var r = this.tmat.mat;
        this.tmat.mat = [
            r[0], r[1], r[2], x*r[0]+y*r[1]+z*r[2]+r[3],
            r[4], r[5], r[6], x*r[4]+y*r[5]+z*r[6]+r[7],
            r[8], r[9], r[10], x*r[8]+y*r[9]+z*r[10]+r[11],
            r[12], r[13], r[14], r[15]
        ];
        return this;
    };
}

function Camera(x, y, z) {
    if (typeof x == "undefined") x = 0;
    if (typeof y == "undefined") y = 0;
    if (typeof z == "undefined") z = 0;

    this.pos = new Vec3(x, y, z);
    this.dir = new Vec3(0, 0, -1); // must be a normal vector
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
}

function lookAt(pos, dir, up) {
    if (typeof up == undefined) up = new Vec3(0, 1, 0);
    var x = up.cross(dir).norm();
    var y = dir.cross(x);

    return [
          x.x,   x.y,   x.z, pos.x,
          y.x,   y.y,   y.z, pos.y,
        dir.x, dir.y, dir.z, pos.z,
            0,     0,     0,     1
    ];
}

// everything is row major order
function mat3inverse(m) { // kinda copied off wikipedia
    var a = m[0],
        b = m[1],
        c = m[2],
        d = m[3],
        e = m[4],
        f = m[5],
        g = m[6],
        h = m[7],
        i = m[8],
        A = e*i-f*h,
        B = f*g-d*i,
        C = d*h-e*g,
        D = c*h-b*i,
        E = a*i-c*g,
        F = b*g-a*h,
        G = b*f-c*e,
        H = c*d-a*f,
        I = a*e-b*d,
        s = 1/(a*A+b*B+c*C); // s for scalar :P
    return [s*A,s*D,s*G,s*B,s*E,s*H,s*C,s*F,s*I];
}
