'use strict';

const socket = io();

// Function to request data from the server
function request_data() {
    socket.emit('request_data', { request: 'Send me user data!' });
}

function report_click(l, t, c, x, y) {
    socket.emit('click', {l: l, t: t, c: c, x: x, y: y});
}

function report_right_click(l, t, c, x, y) {
    socket.emit('right_click', {l: l, t: t, c: c, x: x, y: y});
}

function request_prev() {
    if(request_prev.enabled)
    {
        socket.emit('request_prev');
    }
}
function request_next() {
    if(request_next.enabled)
    {
        var value = document.getElementById("next-select").value;
        socket.emit('request_next', value);
    }
}

function request_undo() {
    if(request_undo.enabled)
    {
        socket.emit('request_undo');
    }
}

function request_redo() {
    if(request_redo.enabled)
    {
        socket.emit('request_redo');
    }
}

function request_submit() {
    if(request_submit.enabled)
    {
        socket.emit('request_submit');
    }
}

function request_hint() {
    if(request_hint.enabled)
    {
        socket.emit('request_hint');
    }
}

function request_load() {
    let pgn = document.getElementById('txt-area').value;
    socket.emit('request_load', pgn);
}

socket.on('response_load', function(data) {
    alert(data);
});

socket.on('response_text', function(data) {
    let textWindow = document.getElementById('text-window').innerHTML = data;
});

// Listen for the response from the server
socket.on('response_data', function(data) {
    console.log('Data received from server:', data);

    function change_btn_status(btn, status, callback)
    {
        if(status)
        {
            btn.style.display = 'block';
            if(status == "enabled")
            {
                btn.classList.remove('btn-inactive');
                btn.classList.add('btn-active');
                callback.enabled = true;
            }
            else if(status == "disabled")
            {
                btn.classList.remove('btn-active');
                btn.classList.add('btn-inactive');
                callback.enabled = false;
            }
        }
        else
        {
            btn.style.display = 'none';
            callback.enabled = true;
        }
    }

    change_btn_status(document.getElementById('submit-btn'), data['submit-button'], request_submit);
    change_btn_status(document.getElementById('undo-btn'), data['undo-button'], request_undo);
    change_btn_status(document.getElementById('redo-btn'), data['redo-button'], request_redo);
    change_btn_status(document.getElementById('prev-btn'), data['prev-button'], request_prev);
    change_btn_status(document.getElementById('next-btn'), data['next-button'], request_next);
    change_btn_status(document.getElementById('hint-btn'), data['hint-button'], request_hint);
    let next_options = data['next-options'];
    if(next_options && Object.keys(next_options).length > 0)
    {
        const sel = document.getElementById("next-select");
        sel.classList.remove('select-inactive');
        sel.classList.add('select-active');
        sel.innerHTML = "";
        for (const [key, value] of Object.entries(next_options)) 
        {
            const opt = document.createElement("option");
            opt.value = key;
            opt.textContent = value;
            console.log({key, value});
            sel.appendChild(opt);
        }
    }
    else
    {
        const sel = document.getElementById("next-select");
        sel.classList.remove('select-active');
        sel.classList.add('select-inactive');
    }


    if(data.size)
    {
        board_length_x = data.size.x;
        board_length_y = data.size.y;
        board_skip_x = board_length_x * square_size + 20;
        board_skip_y = Math.max(board_length_y * square_size + 20, Math.floor(board_skip_x * 1.12));
    }
    
    let record = {};
    let filtered_board_data = [];
    let filtered_coordinate_highlight = {};
    let filtered_arrow_highlight = {};
    let filtered_timeline_highlight = {};
    let filtered_board_highlight = {};
    
    //document.getElementById('output').textContent = JSON.stringify(data, null, 2);
    draw_boards = function(context, l_min=-Infinity, l_max=Infinity, v_min=-Infinity, v_max=Infinity) {
        if(![l_min,l_max,v_min,v_max].every((v,i)=> v === record[i]))
        {
            filtered_board_data = data.boards.filter((board) => {
                let l = board.l, v = board.t << 1 | board.c;
                return !(l < l_min || l > l_max || v < v_min || v > v_max || board.fen == null);
            });
            filtered_coordinate_highlight = [];
            if(data.highlights)
            {
                for(let color_block of data.highlights)
                {
                    if(color_block.coordinates)
                    {
                        filtered_coordinate_highlight[color_block.color] = color_block.coordinates.filter((pos) => {
                            let l = pos.l, v = pos.t << 1 | pos.c;
                            return !(l < l_min || l > l_max || v < v_min || v > v_max);
                        });
                    }
                    if(color_block.arrows)
                    {
                        filtered_arrow_highlight[color_block.color] = color_block.arrows.filter((pos)=>{
                            let l1 = pos.from.l, v1 = pos.from.t << 1 | pos.from.c;
                            let l2 = pos.to.l, v2 = pos.to.t << 1 | pos.to.c;
                            return !(l1 < l_min || l1 > l_max || v1 < v_min || v1 > v_max)
                                ||!(l2 < l_min || l2 > l_max || v2 < v_min || v2 > v_max);
                        });
                        //console.log("filtered arrows:", filtered_arrow_highlight);
                    }
                    if(color_block.timelines)
                    {
                        filtered_timeline_highlight[color_block.color] = color_block.timelines.filter((l) => {
                            return !(l < l_min || l > l_max);
                        });
                    }
                    if(color_block.boards)
                    {
                        filtered_board_highlight[color_block.color] = color_block.boards.filter((pos) =>{
                            let l = pos.l, v = pos.t << 1 | pos.c;
                            return !(l < l_min || l > l_max || v < v_min || v > v_max);
                        })
                    }
                }
            }
            record = [l_min,l_max,v_min,v_max];
            //console.log(`changed record to ${record}`);
        }
        // console.log(filtered_coordinate_data);
        // console.log(filtered_arrow_data);
        var status_camera = document.getElementById("camera");
        status_camera.innerHTML = `(L${l_min}V${v_min}) -- (L${l_max}V${v_max})`;

        // layer 1 (bottom): grids on multiverse 
        const background_shift_x = (board_skip_x - square_size * board_length_x)/2;
        const background_shift_y = (board_skip_y - square_size * board_length_y)/2;
        context.fillStyle = '#ffffff';
        context.fillRect(v_min*board_skip_x-background_shift_x,l_min*board_skip_y-background_shift_y,(v_max-v_min+1)*board_skip_x,(l_max-l_min+1)*board_skip_y);
        
        context.fillStyle = '#f5f5f5';
        for(let l = l_min - 1; l <= l_max; l++)
        {
            for(let t = v_min >> 1; t <= v_max >> 1; t++)
            {
                if((l+t)%2===0)
                {
                    context.fillRect(t*2*board_skip_x-background_shift_x,l*board_skip_y-background_shift_y, 2*board_skip_x, board_skip_y);
                }
            }
        }
        // layer 1.1: highlighted timelines
        context.save();
        context.globalAlpha = 0.2;
        for(let color in filtered_timeline_highlight)
        {
            context.fillStyle = color;
            for(let l of filtered_timeline_highlight[color])
            {
                context.fillRect(v_min*board_skip_x-background_shift_x, l*board_skip_y-background_shift_y, (v_max-v_min+1)*board_skip_x, board_skip_y);
            }
        }
        context.restore();
        // layer 1.2: present column
        if(data.present)
        {
            let t = data.present.t, c = data.present.c;
            let color = data.present.color || 'rgba(219,172,52,0.4)';
            context.fillStyle = color;
            context.fillRect((t*2+c)*board_skip_x-background_shift_x, l_min*board_skip_y-background_shift_y, board_skip_x, (l_max-l_min+1)*board_skip_y);
        }
        

        // layer 2: boards
        for(const board of filtered_board_data)
        {
            let l = board.l, v = board.t << 1 | board.c;
            // the boards's origin is (shift_x, shify_y)
            const shift_x = v*board_skip_x;
            const shift_y = l*board_skip_y;
            //draw margin
            context.fillStyle = (board.c==1) ? '#555555' : '#dfdfdf';
            context.fillRect(shift_x - board_margin, shift_y - board_margin,
                board_length_x*square_size + 2*board_margin,
                board_length_y*square_size + 2*board_margin);
        }
        for(let color in filtered_board_highlight)
        {
            context.fillStyle = color;
            for(let pos of filtered_board_highlight[color])
            {
                let l = pos.l, v = pos.t << 1 | pos.c;
                const shift_x = v*board_skip_x;
                const shift_y = l*board_skip_y;
                context.fillRect(shift_x - board_margin, shift_y - board_margin,
                    board_length_x*square_size + 2*board_margin,
                    board_length_y*square_size + 2*board_margin);
            }
        }
        for(const board of filtered_board_data)
        {
            let l = board.l, v = board.t << 1 | board.c;
            // the boards's origin is (shift_x, shify_y)
            const shift_x = v*board_skip_x;
            const shift_y = l*board_skip_y;
            //draw checkerboard
            context.fillStyle = '#7f7f7f';
            context.fillRect(shift_x, shift_y, board_length_x*square_size, board_length_y*square_size);
            context.fillStyle = '#cccccc';
            for(let row = 0; row < board_length_y; row++) 
            {
                for(let col = 0; col < board_length_x; col++)
                {
                    if((row + col) % 2 === 0)
                    {
                        context.fillRect(col*square_size + shift_x,
                            row*square_size + shift_y,
                            square_size, square_size);
                    }
                }
            }
        }

        // layer 3: highlighted squares
        function get_coordinate(pos)
        {
            const l = pos.l, v = pos.t << 1 | pos.c;
            // the boards's origin is (shift_x, shify_y)
            const shift_x = v*board_skip_x;
            const shift_y = l*board_skip_y;
            return [pos.x*square_size + shift_x, (board_length_y-1-pos.y)*square_size + shift_y];
        }

        context.save();
        context.globalAlpha = 0.5;
        for(let color in filtered_coordinate_highlight)
        {
            context.fillStyle = color;
            for(let pos of filtered_coordinate_highlight[color])
            {
                context.fillRect(...get_coordinate(pos), square_size, square_size);
            }
        }
        context.restore();

        // layer 4: pieces
        for(const board of filtered_board_data)
        {
            let l = board.l, v = board.t << 1 | board.c;
            // the boards's origin is (shift_x, shify_y)
            const shift_x = v*board_skip_x;
            const shift_y = l*board_skip_y;
            //parse
            let parsed_board = parse_FEN(board.fen);
            for(let row = 0; row < board_length_y; row++) 
            {
                for(let col = 0; col < board_length_x; col++)
                {
                    const piece = parsed_board[row][col];
                    if(isNaN(piece))
                    {
                        context.drawImage(svg_images[piece], col*square_size + shift_x, row*square_size + shift_y, square_size, square_size);
                    }
                }
            }
        }

        // layer 5: arrows
        for(let color in filtered_arrow_highlight)
        {
            context.save();
            context.globalAlpha = 0.8;
            context.lineWidth = 1;
            for(let arrow of filtered_arrow_highlight[color])
            {
                context.save();
                //console.log("drawing arrow:",arrow);
                const [from_x, from_y] = get_coordinate(arrow.from);
                const [to_x, to_y] = get_coordinate(arrow.to);
                const r = square_size/2;
                canvas_arrow(context, from_x+r, from_y+r, to_x+r, to_y+r);
                const gradient = context.createLinearGradient(from_x+r, from_y+r, to_x+r, to_y+r);
                let u = board_length_x/2.0/Math.sqrt((from_x-to_x)**2+(from_y-to_y)**2);
                gradient.addColorStop(0, "rgba(255,255,255,0.0)");
                gradient.addColorStop(u/3, "rgba(255,255,255,0.0)");
                gradient.addColorStop(u, "rgba(255,255,255,0.8)");
                gradient.addColorStop(1, color);
                //context.clip();
                context.fillStyle = gradient;
                context.fill();
                // const gradient2 = context.createLinearGradient(from_x+r, from_y+r, to_x+r, to_y+r);
                // gradient2.addColorStop(0, "rgba(255,255,255,0.0)");
                // gradient2.addColorStop(0.1, "rgba(255,255,255,1.0)");
                // context.strokeStyle = gradient2;
                //context.stroke();
                context.restore();
            }
            context.restore();
        }
    }
    if(data.focus)
    {
        focus = data.focus;
    }

    animation_manager.new_task();
});

function canvas_arrow(context, fromx, fromy, tox, toy) {
    const headlen = 8; // length of head in pixels
    const width = 3/2; // with of the arrow line
    const tip_span = Math.PI / 7; // angle between arrow line and arrow tip side
    var dx = tox - fromx;
    var dy = toy - fromy;
    var angle = Math.atan2(dy, dx);
    
    // Calculate the angles for the arrowhead
    var leftAngle = angle - tip_span;
    var rightAngle = angle + tip_span;

    // Coordinates of the triangle tip
    var leftX = tox - headlen * Math.cos(leftAngle);
    var leftY = toy - headlen * Math.sin(leftAngle);
    var rightX = tox - headlen * Math.cos(rightAngle);
    var rightY = toy - headlen * Math.sin(rightAngle);

    let midx = tox - headlen * Math.cos(tip_span) * Math.cos(angle);
    let midy = toy - headlen * Math.cos(tip_span) * Math.sin(angle);

    // Draw the arrow
    context.beginPath();
    context.moveTo(fromx - width*Math.sin(angle), fromy + width*Math.cos(angle));
    context.lineTo(fromx + width*Math.sin(angle), fromy - width*Math.cos(angle));
    context.lineTo(midx + width*Math.sin(angle), midy - width*Math.cos(angle));
    context.lineTo(rightX, rightY); // Right side of the triangle
    context.lineTo(tox, toy); // Tip of the arrow
    context.lineTo(leftX, leftY); // Left side of the triangle
    context.lineTo(midx - width*Math.sin(angle), midy + width*Math.cos(angle));
    context.closePath(); // Close the path to form a triangle
}