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
    var b = new Cube(4, 0, 0, 230, 230, 0, 255, 1, 2, 1);
    world.objects.push(b);
    world.objects.push(new Cube(4, 1.5, 0, 230, 230, 0, 255, 3, 1, 1));
    world.objects.push(new Cube(4, -1.5, 0, 230, 230, 0, 255, 3, 1, 1));
    // A
    world.objects.push(new Cube(5, -.5, 26, 0, 150, 0, 255));
    world.objects.push(new Cube(6, -.5, 26, 0, 150, 0, 255, 1, 3, 1));
    world.objects.push(new Cube(4, -.5, 26, 0, 150, 0, 255, 1, 3, 1));
    var c = new Cube(5, 1.5, 26, 0, 150, 0, 255);
    world.objects.push(c);
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
    var g = new Cube(0, -2.5, 0, 160, 160, 160, 255, 200, 1, 200);
    world.objects.push(g);
    addEventListener("load", function(){
        var img = new Image();
        img.src = "awesomeface.png";
        img.onload = function() {
            var a = new Texture(img);
            a.repeat = [4, 4];
            g.textures.top = a;
            var c = new Texture(a);
            c.repeat = [1, 2];
            b.textures.front = c;
        };
        var img2 = new Image();
        img2.src = "container.jpg";
        img2.onload = function() {
            var a = new Texture(img2);
            c.textures.front = a;
        };
        var img3 = new Image();
        img3.src = "M-32.png";
        img3.onload = function() {
            var a = new Texture(img3);
            a.repeat = [1, 2];
            b.textures.back = a;
        };
    });

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

        (pressedKeys['U+0057'] || pressedKeys['w']) && world.camera.move(0, 0, -.1);
        (pressedKeys['U+0041'] || pressedKeys['a']) && world.camera.move(-.1, 0, 0);
        (pressedKeys['U+0053'] || pressedKeys['s']) && world.camera.move(0, 0, .1);
        (pressedKeys['U+0044'] || pressedKeys['d']) && world.camera.move(.1, 0, 0);
        (pressedKeys['U+0051'] || pressedKeys['q']) && world.camera.move(0, -.1, 0);
        (pressedKeys['U+0045'] || pressedKeys['e']) && world.camera.move(0, .1, 0);

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
            yaw = -Math.PI/2;

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

            world.camera.dir.x = Math.cos(pitch) * Math.cos(yaw);
            world.camera.dir.y = Math.sin(pitch);
            world.camera.dir.z = Math.cos(pitch) * Math.sin(yaw);;

            prevTouch.x = e.touches[0].pageX;
            prevTouch.y = e.touches[0].pageY;
        });

        window.addEventListener("touchend", function() {
            touch = false;
        });

        // for people with an mouse
        cnv.addEventListener("click", function() {
            if ((document.pointerLockElement || document.mozPointerLockElement) != cnv) (cnv.requestPointerLock || cnv.mozRequestPointerLock).bind(cnv)();
        });

        window.addEventListener("mousemove", function(e) {
            if ((document.pointerLockElement || document.mozPointerLockElement) != cnv) return;
            if (!("movementX" in e)) {
                e.movementX = e.mozMovementX;
                e.movementY = e.mozMovementY;
            }
            yaw += e.movementX/300;
            pitch += e.movementY/300;

            world.camera.dir.x = Math.cos(pitch) * Math.cos(yaw);
            world.camera.dir.y = Math.sin(pitch);
            world.camera.dir.z = Math.cos(pitch) * Math.sin(yaw);;
        });

    });

})();
