'use strict';

const board_length = 8; // 8x8 grid
const square_size = 10; // size of each square (px)
const board_margin = 4; // margin outside boards
const board_skip = 120; 


class Camera
{
    constructor(x, y, scale) {
        this.x = x;
        this.y = y;
        this.scale = scale;
    }
    close_to(camera)
    {
        return Math.abs(this.x-camera.x) < 1 
            && Math.abs(this.y-camera.y) < 1 
            && Math.abs(this.scale/camera.scale - 1) < 0.02;
    }
    lean_to(camera, time_delta)
    {
        if(this.close_to(camera))
        {
            this.x = camera.x
            this.y = camera.y
            this.scale = camera.scale
        }
        else
        {
            // Move this camera a bit closer to the target camera
            // adjust the floating number for speed
            const lerp_factor = (1.0 - 1.0/(1.0 + time_delta * 0.005)); 
            this.x += (camera.x - this.x) * lerp_factor;
            this.y += (camera.y - this.y) * lerp_factor;
            this.scale += (camera.scale - this.scale) * lerp_factor;
        }
    }
    inverse(point)
    {
        const t = 1 / this.scale;
        return { x: t * (point.x - this.x), y: t * (point.y - this.y) };
    }
}


let camera_now = new Camera(0,0,-1.0);
let camera_target = new Camera(0,0,1.0);
let time_record = 0, time_diff=16;

//dummy function that does nothing
let draw_boards = (context) => null;

function draw(time_now) {
    var canvas = document.getElementById("display");
    var context = canvas.getContext("2d");
    var status_camera = document.getElementById("camera");

    if(time_now)
    {
        time_diff = time_now - time_record;
        time_record = time_now;
        console.log(time_diff);
    }
    else
    {
        time_diff = 20;
    }

    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(camera_now.x, camera_now.y);
    let scale = 2**camera_now.scale;
    context.scale(scale, scale);

    draw_boards(context);   
    /*
    context.beginPath(); // begin custom shape
    context.moveTo(-119, -20);
    context.bezierCurveTo(-159, 0, -159, 50, -59, 50);
    context.bezierCurveTo(-39, 80, 31, 80, 51, 50);
    context.bezierCurveTo(131, 50, 131, 20, 101, 0);
    context.bezierCurveTo(141, -60, 81, -70, 51, -50);
    context.bezierCurveTo(31, -95, -39, -80, -39, -50);
    context.bezierCurveTo(-89, -95, -139, -80, -119, -20);
    context.closePath(); // complete custom shape
    var grd = context.createLinearGradient(-59, -100, 81, 100);
    grd.addColorStop(0, "#FFD700"); // light blue
    grd.addColorStop(1, "#CD853F"); // dark blue
    context.fillStyle = grd;
    context.fill();

    context.lineWidth = 5;
    context.strokeStyle = "#CD853F";
    context.stroke();
    context.drawImage(svg_images['Q'], 0, 0, 32, 32);
    */
    status_camera.innerHTML = `camera_now: x = ${camera_now.x.toFixed(2)} `
    + `y = ${camera_now.y.toFixed(2)} `
    + `scale = ${camera_now.scale.toFixed(2)} `;
    context.restore();
    //if the camera has not moved to the designated location, draw next frame
    if( camera_now.x != camera_target.x 
     || camera_now.x != camera_target.x
     || camera_now.scale != camera_target.scale )
    {
        camera_now.lean_to(camera_target, time_diff);
        requestAnimationFrame(draw);
    }
}

window.onload = function() {
    let canvas = document.getElementById("display");
    let status = document.getElementById("status");

    function go_to_center() {
        camera_target.x = canvas.width/6 ;
        camera_target.y = canvas.width/6;
        camera_target.scale = canvas.width / 360;
        window.requestAnimationFrame(draw);
    }

    
    var is_mouse_down = false;
    var start_drag = {x:0, y:0};

    document.getElementById("center").addEventListener("click", go_to_center, false);

    // add event listeners to handle screen drag
    canvas.addEventListener("mousedown", function(e) {
        is_mouse_down = true;
        start_drag.x = e.clientX - camera_target.x;
        start_drag.y = e.clientY - camera_target.y;
    });

    canvas.addEventListener("mouseup", function(e) {
        is_mouse_down = false;
    });

    canvas.addEventListener("mouseover", function(e) {
        is_mouse_down = false;
    });

    canvas.addEventListener("mouseout", function(e) {
        is_mouse_down = false;
    });

    canvas.addEventListener("mousemove", function(e) {
        if (is_mouse_down) {
            camera_target.x = Math.trunc(e.clientX - start_drag.x);
            camera_target.y = Math.trunc(e.clientY - start_drag.y);
            window.requestAnimationFrame(draw);
        }

        var rect = canvas.getBoundingClientRect();
        let mouse_pos = {
            x: (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
            y: (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
        };
        let coordinate = camera_now.inverse(mouse_pos);
        status.innerHTML = `x = ${coordinate.x} y = ${coordinate.y}`;
        //status.innerHTML = `x = ${mouse_pos.x} y = ${mouse_pos.y}`;
    });

    const scale_factor = -0.005;

    canvas.addEventListener("wheel", function(e) {
        e.preventDefault();
        camera_target.scale += e.deltaY * scale_factor;
        window.requestAnimationFrame(draw);
    });

    go_to_center();
}


