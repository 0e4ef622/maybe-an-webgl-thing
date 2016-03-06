var world = new World();

(function() {

world.objects.push(new Cube(3, 0, 0, 255));
world.objects.push(new Cube(0, 0, 0, 0, 255));
world.objects.push(new Cube(-3, 0, 0, 0, 0, 255));
world.camera.pos.z = 10;

var pt = (new Date()).getTime();
setInterval(function() {
   var t = (new Date()).getTime();
   var dt = t - pt;
   pt = t;
   world.objects[0].rotate(0, 0, dt/1000);
   world.objects[1].rotate(0, dt/1000, 0);
   world.objects[2].rotate(Math.sqrt(1/3)*dt/1000, Math.sqrt(1/3)*dt/1000, Math.sqrt(1/3)*dt/1000);
}, 10);

var pitch = 0,
    yaw = 0;

var prevTouch = {x: 0, y: 0};
var touch = false;
window.touchStart = function(e) {
   e.preventDefault();
   prevTouch.x = e.touches[0].pageX;
   prevTouch.y = e.touches[0].pageY;
   touch = true;
};

window.touchMove = function(e) {
   if (!touch) return;
   yaw += (prevTouch.x - e.touches[0].pageX)/300;
   pitch += (prevTouch.y - e.touches[0].pageY)/300;

   world.camera.resetRotation().rotate(0, yaw, 0).rotate(pitch, 0, 0);

   prevTouch.x = e.touches[0].pageX;
   prevTouch.y = e.touches[0].pageY;
};

window.touchEnd = function() {
   touch = false;
};

})();


function World() {
   this.objects = [];
   this.camera = new Generic();
   this.lighting = {
      ambient: { // 0 to 255
         r: 100,
         g: 100,
         b: 100
      },
      lightDir: { // unit vector
         x: .207514,
         y: -.691714,
         z: -.691714
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
                            -sy,          sx*cy,          cx*cy ],
                        [ this.tmat[0], this.tmat[1], this.tmat[2],
                          this.tmat[4], this.tmat[5], this.tmat[6],
                          this.tmat[8], this.tmat[9], this.tmat[10] ]);
      this.rotation = [
         r[0], r[1], r[2], this.tmat[3],
         r[3], r[4], r[5], this.tmat[7],
         r[6], r[7], r[8], this.tmat[11],
            0,    0,    0,             1
      ];

      return this;
   };
   this.resetRotation = function() {
      this.rotation = [
         1,0,0,
         0,1,0,
         0,0,1
      ];
      return this;
   };
}

function Cube(x, y, z, r, g, b, a) {
   x = typeof x == "undefined" ? 0 : x;
   y = typeof y == "undefined" ? 0 : y;
   z = typeof z == "undefined" ? 0 : z;
   r = typeof r == "undefined" ? 0 : r; /* 0 to 255 */
   g = typeof g == "undefined" ? 0 : g;
   b = typeof b == "undefined" ? 0 : b;
   a = typeof a == "undefined" ? 255 : a;

   Generic.call(this, x, y, z);

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

function mat3xmat3(a, b) {
   return [a[0]*b[0]+a[1]*b[3]+a[2]*b[6],a[0]*b[1]+a[1]*b[4]+a[2]*b[7],a[0]*b[2]+a[1]*b[5]+a[2]*b[8],a[3]*b[0]+a[4]*b[3]+a[5]*b[6],a[3]*b[1]+a[4]*b[4]+a[5]*b[7],a[3]*b[2]+a[4]*b[5]+a[5]*b[8],a[6]*b[0]+a[7]*b[3]+a[8]*b[6],a[6]*b[1]+a[7]*b[4]+a[8]*b[7],a[6]*b[2]+a[7]*b[5]+a[8]*b[8]];
}

function mat4xmat4(a, b) {
   return [a[0]*b[0]+a[1]*b[4]+a[2]*b[8]+a[3]*b[12],a[0]*b[1]+a[1]*b[5]+a[2]*b[9]+a[3]*b[13],a[0]*b[2]+a[1]*b[6]+a[2]*b[10]+a[3]*b[14],a[0]*b[3]+a[1]*b[7]+a[2]*b[11]+a[3]*b[15],a[4]*b[0]+a[5]*b[4]+a[6]*b[8]+a[7]*b[12],a[4]*b[1]+a[5]*b[5]+a[6]*b[9]+a[7]*b[13],a[4]*b[2]+a[5]*b[6]+a[6]*b[10]+a[7]*b[14],a[4]*b[3]+a[5]*b[7]+a[6]*b[11]+a[7]*b[15],a[8]*b[0]+a[9]*b[4]+a[10]*b[8]+a[11]*b[12],a[8]*b[1]+a[9]*b[5]+a[10]*b[9]+a[11]*b[13],a[8]*b[2]+a[9]*b[6]+a[10]*b[10]+a[11]*b[14],a[8]*b[3]+a[9]*b[7]+a[10]*b[11]+a[11]*b[15],a[12]*b[0]+a[13]*b[4]+a[14]*b[8]+a[15]*b[12],a[12]*b[1]+a[13]*b[5]+a[14]*b[9]+a[15]*b[13],a[12]*b[2]+a[13]*b[6]+a[14]*b[10]+a[15]*b[14],a[12]*b[3]+a[13]*b[7]+a[14]*b[11]+a[15]*b[15]];
}
