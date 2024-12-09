'use strict';

const board_length = 8; // 8x8 grid
const square_size = 10; // size of each square (px)
const board_margin = 4; // margin outside boards
const board_skip = 120; 

class AnimationManager
{
    constructor(callback) {
        this.running = false;
        this.time_record = 0;
        this.stop_animation = () => {
            this.running = false;
            console.log("Animation stopped");
        }
        this.wrapper = (time_now) => {
            let time_diff = 20;
            if(time_now)
            {
                time_diff = time_now - this.time_record;
                this.time_record = time_now;
                console.log(`now ${time_now}  diff ${time_diff}`);
            }
            callback(time_diff, this.stop_animation);
            if(this.running)
            {
                requestAnimationFrame(this.wrapper);
            }
        }
    }
    new_task() {
        if(this.running)
        {
            return;
        }
        this.running = true;
        requestAnimationFrame(this.wrapper);
    }
}

class Camera
{
    constructor(x, y, scale) {
        this.x = x;
        this.y = y;
        this.scale = scale;
        // Next two are dummy value, please change them before using .inverse()
        this.center_shift_x = 0;
        this.center_shift_y = 0; 
    }
    close_to(camera)
    {
        return Math.abs(this.x-camera.x) < 1 
            && Math.abs(this.y-camera.y) < 1 
            && Math.abs(this.scale/camera.scale - 1) < 0.02;
    }

    // Move this camera a bit closer to the target camera (iff needed)
    lean_to(camera, time_delta)
    {
        //console.log(`${this.x} ${this.y} ${camera.x} ${camera.y} ${time_delta}`);
        if(this.close_to(camera))
        {
            this.x = camera.x
            this.y = camera.y
            this.scale = camera.scale
        }
        else
        {
            // adjust the floating number for speed
            const lerp_factor = (1.0 - 1.0/(1.0 + time_delta * 0.005)); 
            this.x += (camera.x - this.x) * lerp_factor;
            this.y += (camera.y - this.y) * lerp_factor;
            this.scale += (camera.scale - this.scale) * lerp_factor;
        }
    }

    // calculated the inverse of this linear transform:
    // point => shift by (center_shift_x,center_shift_y)
    //       => scale by 2**scale
    //       => shift by (x,y)
    inverse(point)
    {
        const t = 1.0 / 2**this.scale;
        return { x: t * (point.x - this.center_shift_x) - this.x,
                 y: t * (point.y - this.center_shift_y) - this.y };
    }
}


let camera_now = new Camera(0,0,-1.0);
let camera_target = new Camera(0,0,-1.0);
let cursor_coordinate = {x:0, y:0};

//dummy function that does nothing
let draw_boards = (context) => null;

function draw(time_diff, stop_animation) {
    var canvas = document.getElementById("display");
    var context = canvas.getContext("2d");
    var status_camera = document.getElementById("camera");

    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    let scale = 2**camera_now.scale;
    let shift = canvas.width /2.0;
    context.translate(shift, shift);
    context.scale(scale, scale);
    context.translate(camera_now.x, camera_now.y);

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
    context.fillRect(0,0,10,10);
    status_camera.innerHTML = `camera_target: x = ${camera_target.x.toFixed(2)} `
    + `y = ${camera_target.y.toFixed(2)} `
    + `scale = ${camera_target.scale.toFixed(2)} camera_now: x = ${camera_now.x.toFixed(2)} `
    + `y = ${camera_now.y.toFixed(2)} `
    + `scale = ${camera_now.scale.toFixed(2)} `;
    context.restore();
    //if the camera has not moved to the designated location, draw next frame
    if( camera_now.x == camera_target.x 
     && camera_now.x == camera_target.x
     && camera_now.scale == camera_target.scale )
    {
        stop_animation();
    }
    camera_now.lean_to(camera_target, time_diff);
}

let animation_manager = new AnimationManager(draw);

window.onload = function() {
    let canvas = document.getElementById("display");
    let status = document.getElementById("status");

    camera_now.center_shift_x = canvas.width / 2;
    camera_now.center_shift_y = canvas.width / 2;

    function go_to_center() {
        let actual_scale = canvas.width/120;
        camera_target.scale = Math.log2(actual_scale);
        camera_target.x = 0;
        camera_target.y = 0;
        animation_manager.new_task();
    }

    
    var is_mouse_down = false;
    var start_drag = {x:0, y:0};
    // drag speed
    const speed_factor = 1.0;

    document.getElementById("center").addEventListener("click", go_to_center, false);

    // add event listeners to handle screen drag
    canvas.addEventListener("mousedown", function(e) {
        is_mouse_down = true;
        let drag_speed = speed_factor / 2**camera_now.scale;
        start_drag.x = drag_speed * e.clientX - camera_target.x;
        start_drag.y = drag_speed * e.clientY - camera_target.y;
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
            let drag_speed = speed_factor / 2**camera_now.scale;
            camera_target.x = Math.trunc(drag_speed * e.clientX - start_drag.x);
            camera_target.y = Math.trunc(drag_speed * e.clientY - start_drag.y);
            animation_manager.new_task();
        }

        var rect = canvas.getBoundingClientRect();
        let mouse_pos = {
            x: (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
            y: (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
        };
        cursor_coordinate = camera_now.inverse(mouse_pos);
        status.innerHTML = `x = ${cursor_coordinate.x.toFixed(2)} y = ${cursor_coordinate.y.toFixed(2)}`;
        //status.innerHTML = `x = ${mouse_pos.x} y = ${mouse_pos.y}`;
    });

    const scale_factor = -0.005;

    canvas.addEventListener("wheel", function(e) {
        e.preventDefault();
        camera_target.scale += e.deltaY * scale_factor;
        animation_manager.new_task();
    });

    go_to_center();
}


