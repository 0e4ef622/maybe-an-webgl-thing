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

    world.camera.pos.z = -13;

    var pressedKeys = {};
    var pt = (new Date()).getTime();
    setInterval(function() {
        var t = (new Date()).getTime();
        var dt = t - pt;
        pt = t;

        world.objects[7].rotate(0, dt/1000, 0);
        world.objects[8].rotate(0, dt/1000, 0);
        world.objects[9].rotate(0, dt/1000, 0);

        pressedKeys['U+0057'] && world.camera.move(0, 0, .1);
        pressedKeys['U+0041'] && world.camera.move(.1, 0, 0);
        pressedKeys['U+0053'] && world.camera.move(0, 0, -.1);
        pressedKeys['U+0044'] && world.camera.move(-.1, 0, 0);
        pressedKeys['U+0051'] && world.camera.move(0, .1, 0);
        pressedKeys['U+0045'] && world.camera.move(0, -.1, 0);
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
            if (document.pointerLockElement == cnv) document.exitPointerLock();
            else cnv.requestPointerLock();
        });

        window.addEventListener("mousemove", function(e) {
            if (document.pointerLockElement != cnv) return;
            yaw += e.movementX/300;
            pitch += e.movementY/300;

            world.camera.resetRotation().rotate(0, yaw, 0).rotate(pitch, 0, 0);
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
        lightDir: { // unit vector
            x: .267261,
            y: -.534522,
            z: -.801784
        }
    };
}

function Generic(x, y, z) {
    x = typeof x == "undefined" ? 0 : x;
    y = typeof y == "undefined" ? 0 : y;
    z = typeof z == "undefined" ? 0 : z;

    this.tmat = [
            1, 0, 0, x,
            0, 1, 0, y,
            0, 0, 1, z,
            0, 0, 0, 1
    ];

    var t = this;
    this.pos = {
        get x() {
            return t.tmat[3];
        },
        set x(v) {
            t.tmat[3] = v; },
        get y() {
            return t.tmat[7];
        },
        set y(v) {
            t.tmat[7] = v;
        },
        get z() {
            return t.tmat[11];
        },
        set z(v) {
            t.tmat[11] = v;
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

        var r = mat3xmat3([ cy*cz, sx*sy*cz-cx*sz, cx*sy*cz+sx*sz,
                cy*sz, sx*sy*sz+cx*cz, cx*sy*sz-sx*cz,
                -sy,          sx*cy,          cx*cy ], mat4tomat3(this.tmat));
        this.tmat = [
                r[0], r[1], r[2],  this.tmat[3],
                r[3], r[4], r[5],  this.tmat[7],
                r[6], r[7], r[8], this.tmat[11],
                   0,    0,    0,             1
        ];

        return this;
    };
    this.resetRotation = function() {
        this.tmat = [
                1,0,0,this.tmat[3],
                0,1,0,this.tmat[7],
                0,0,1,this.tmat[11],
                0,0,0,1
        ];
        return this;
    };
    this.move = function(x, y, z) {
        var r = this.tmat;
        this.tmat = [
            r[0], r[1], r[2], x*r[0]+y*r[1]+z*r[2]+r[3],
            r[4], r[5], r[6], x*r[4]+y*r[5]+z*r[6]+r[7],
            r[8], r[9], r[10], x*r[8]+y*r[9]+z*r[10]+r[11],
            r[12], r[13], r[14], r[15]
        ];
        return this;
    };
}

function Camera(x, y, z) { // camera needs its own special move function for some reason .-.
    Generic.call(this, x, y, z);

    this.move = function(x, y, z) {
        var m = this.tmat;
        var r = mat3inverse(mat4tomat3(m));
        this.tmat = [
            r[0], r[3], r[6], x*r[0]+y*r[1]+z*r[2]+m[3],
            r[1], r[4], r[7], x*r[3]+y*r[4]+z*r[5]+m[7],
            r[2], r[5], r[8], x*r[6]+y*r[7]+z*r[8]+m[11],
            m[12], m[13], m[14], m[15]
        ];
        return this;
    };
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

    this.tmat[0] = sx;
    this.tmat[5] = sy;
    this.tmat[10] = sz;

    this.color = {
        r: r,
        g: g,
        b: b,
        a: a
    };
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

// HARD CODING FTW

function mat4transpose(m) {
    return [
        m[0], m[4], m[8], m[12],
        m[1], m[5], m[9], m[13],
        m[2], m[6], m[10], m[14],
        m[3], m[7], m[11], m[15]
    ];
}

function mat3transpose(m) {
    return [
        m[0], m[3], m[6],
        m[1], m[4], m[7],
        m[2], m[5], m[8]
    ];
}

function mat4tomat3(m) {
    return [
        m[0], m[1], m[2],
        m[4], m[5], m[6],
        m[8], m[9], m[10]
    ];
}

function mat3xmat3(a, b) {
    return [a[0]*b[0]+a[1]*b[3]+a[2]*b[6],a[0]*b[1]+a[1]*b[4]+a[2]*b[7],a[0]*b[2]+a[1]*b[5]+a[2]*b[8],a[3]*b[0]+a[4]*b[3]+a[5]*b[6],a[3]*b[1]+a[4]*b[4]+a[5]*b[7],a[3]*b[2]+a[4]*b[5]+a[5]*b[8],a[6]*b[0]+a[7]*b[3]+a[8]*b[6],a[6]*b[1]+a[7]*b[4]+a[8]*b[7],a[6]*b[2]+a[7]*b[5]+a[8]*b[8]];
}

function mat4xmat4(a, b) {
    return [a[0]*b[0]+a[1]*b[4]+a[2]*b[8]+a[3]*b[12],a[0]*b[1]+a[1]*b[5]+a[2]*b[9]+a[3]*b[13],a[0]*b[2]+a[1]*b[6]+a[2]*b[10]+a[3]*b[14],a[0]*b[3]+a[1]*b[7]+a[2]*b[11]+a[3]*b[15],a[4]*b[0]+a[5]*b[4]+a[6]*b[8]+a[7]*b[12],a[4]*b[1]+a[5]*b[5]+a[6]*b[9]+a[7]*b[13],a[4]*b[2]+a[5]*b[6]+a[6]*b[10]+a[7]*b[14],a[4]*b[3]+a[5]*b[7]+a[6]*b[11]+a[7]*b[15],a[8]*b[0]+a[9]*b[4]+a[10]*b[8]+a[11]*b[12],a[8]*b[1]+a[9]*b[5]+a[10]*b[9]+a[11]*b[13],a[8]*b[2]+a[9]*b[6]+a[10]*b[10]+a[11]*b[14],a[8]*b[3]+a[9]*b[7]+a[10]*b[11]+a[11]*b[15],a[12]*b[0]+a[13]*b[4]+a[14]*b[8]+a[15]*b[12],a[12]*b[1]+a[13]*b[5]+a[14]*b[9]+a[15]*b[13],a[12]*b[2]+a[13]*b[6]+a[14]*b[10]+a[15]*b[14],a[12]*b[3]+a[13]*b[7]+a[14]*b[11]+a[15]*b[15]];
}
