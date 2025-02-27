'use strict';

const board_length = 8; // 8x8 grid
const square_size = 10; // size of each square (px)
const board_margin = 4; // margin outside boards
const board_skip_x = 120;
const board_skip_y = 180;

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
                time_diff = Math.min(time_now - this.time_record,100);
                this.time_record = time_now;
                //console.log(`now ${time_now}  diff ${time_diff}`);
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
    // Next two are dummy value, please change them before using .inverse()
    static center_shift_x = 0.0;
    static center_shift_y = 0.0;
    constructor(x, y, scale) {
        this.x = x;
        this.y = y;
        this.scale = scale;
    }
    close_to(camera)
    {
        return Math.abs(this.x-camera.x) < 0.1 
            && Math.abs(this.y-camera.y) < 0.1 
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
        return { x: t * (point.x - Camera.center_shift_x) - this.x,
                 y: t * (point.y - Camera.center_shift_y) - this.y };
    }
}


let camera_now = new Camera(0,0,-1.0,1.0);
let camera_target = new Camera(0,0,-1.0,1.0);
let cursor_coordinate = {x:0, y:0};
let focus = {'l':0, 't':0, 'c':0};

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
    Camera.center_shift_x = canvas.width /2.0;
    Camera.center_shift_y = canvas.height /2.0;

    context.translate(Camera.center_shift_x, Camera.center_shift_y);
    context.scale(scale, scale);
    context.translate(camera_now.x, camera_now.y);

    // calculate drawing area
    let upleft_corner = camera_now.inverse({x:0, y:0});
    let downright_corner = camera_now.inverse({x:canvas.width, y:canvas.height});
    let l_min = Math.floor(upleft_corner.y / board_skip_y);
    let v_min = Math.floor(upleft_corner.x / board_skip_x);
    let l_max = Math.ceil(downright_corner.y / board_skip_y);
    let v_max = Math.ceil(downright_corner.x / board_skip_x);
    
    // draw the chessboard
    draw_boards(context, l_min, l_max, v_min, v_max);
    
    // origin indicator (for debugging)
    context.fillRect(0,0,10,10);

    /* status_camera.innerHTML = `camera_target: x = ${camera_target.x.toFixed(2)} `
    + `y = ${camera_target.y.toFixed(2)} `
    + `scale = ${camera_target.scale.toFixed(2)} camera_now: x = ${camera_now.x.toFixed(2)} `
    + `y = ${camera_now.y.toFixed(2)} `
    + `scale = ${camera_now.scale.toFixed(2)} `; */
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

function setup_canvas() {
    let canvas = document.getElementById("display");
    let status = document.getElementById("status");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    camera_now.center_shift_x = canvas.width / 2;
    camera_now.center_shift_y = canvas.width / 2;

    function go_to_center() {
        let actual_scale = canvas.width/120;
        camera_target.scale = Math.log2(actual_scale);
        camera_target.x = - board_skip_x * (focus.t << 1 | focus.c) - board_length * square_size/2;
        camera_target.y = - board_skip_y * (focus.l) - board_length * square_size/2;
        animation_manager.new_task();
    }

    var is_mouse_down = false;
    var start_drag = {x:0, y:0};
    // drag speed
    const speed_factor = 1.0;
    let drag_flag = false;

    document.getElementById("center-btn").addEventListener("click", go_to_center, false);

    // add event listeners to handle screen drag
    canvas.addEventListener("mousedown", function(e) {
        is_mouse_down = true;
        let drag_speed = speed_factor / 2**camera_now.scale;
        start_drag.x = drag_speed * e.clientX - camera_target.x;
        start_drag.y = drag_speed * e.clientY - camera_target.y;
        drag_flag = false;
    });

    canvas.addEventListener("mouseup", function(e) {
        is_mouse_down = false;
        if(!drag_flag)
        {
            var rect = canvas.getBoundingClientRect();
            let mouse_pos = {
                x: (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
                y: (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
            };
            cursor_coordinate = camera_now.inverse(mouse_pos);
            let l = Math.floor(cursor_coordinate.y/board_skip_y);
            let v = Math.floor(cursor_coordinate.x/board_skip_x);
            let c = v & 1, t = v >> 1;
            let x = Math.floor((cursor_coordinate.x - v*board_skip_x)/square_size);
            let y = 7 - Math.floor((cursor_coordinate.y - l*board_skip_y)/square_size);
            status.innerHTML = `click at (${l}T${t}${c?'b':'w'})${String.fromCharCode(97 + x)}${y+1}`;
            if(x < 8 && y >= 0)
            {
                report_click(l, t, c, x, y);
            }
        }
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
        drag_flag = true;
    });

    const scale_factor = -0.005;

    canvas.addEventListener("wheel", function(e) {
        e.preventDefault();
        camera_target.scale += e.deltaY * scale_factor;
        animation_manager.new_task();
    });

    go_to_center();
}


