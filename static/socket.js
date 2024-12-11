'use strict';

const socket = io();

// Function to request data from the server
function requestData() {
    socket.emit('request_data', { request: 'Send me user data!' });
}

function report_click(l, t, c, x, y) {
    socket.emit('click', {l: l, t: t, c: c, x: x, y: y});
}

// Listen for the response from the server
socket.on('response_data', function(data) {
    console.log('Data received from server:', data);
    let record = {};
    let filtered_board_data = [];
    let filtered_highlight_data = {};
    let filtered_arrow_data = [];
    
    //document.getElementById('output').textContent = JSON.stringify(data, null, 2);
    draw_boards = function(context, l_min=-Infinity, l_max=Infinity, v_min=-Infinity, v_max=Infinity) {
        if(![l_min,l_max,v_min,v_max].every((v,i)=> v === record[i]))
        {
            filtered_board_data = data.boards.filter((board) => {
                let l = board.l, v = board.t << 1 | board.c;
                return !(l < l_min || l > l_max || v < v_min || v > v_max || board.fen == null);
            });
            filtered_highlight_data = {};
            if(data.highlights)
            {
                for(let color_block of data.highlights)
                {
                    filtered_highlight_data[color_block.color] = color_block.coordinates.filter((pos) => {
                        let l = pos.l, v = pos.t << 1 | pos.c;
                        return !(l < l_min || l > l_max || v < v_min || v > v_max);
                    });
                }
            }
            if(data.arrows)
            {
                for(let setting_block of data.arrows)
                {
                    filtered_arrow_data.push({
                        'color':setting_block.color,
                        'coordinates': setting_block.coordinates.filter((pos) => {
                            let l1 = pos.from.l, v1 = pos.from.t << 1 | pos.from.c;
                            let l2 = pos.to.l, v2 = pos.to.t << 1 | pos.to.c;
                            return !(l1 < l_min || l1 > l_max || v1 < v_min || v1 > v_max)
                                 ||!(l2 < l_min || l2 > l_max || v2 < v_min || v2 > v_max);
                        })
                    });
                }
            }
            record = [l_min,l_max,v_min,v_max];
            //console.log(`changed record to ${record}`);
        }
        var status_camera = document.getElementById("camera");
        status_camera.innerHTML = `(L${l_min}V${v_min}) -- (L${l_max}V${v_max})`;

        // layer 1 (bottom): grids on multiverse 
        const background_shift_x = (board_skip_x - square_size * board_length)/2;
        const background_shift_y = (board_skip_y - square_size * board_length)/2;
        context.fillStyle = '#ffffff';
        context.fillRect(v_min*board_skip_x-background_shift_x,l_min*board_skip_y-background_shift_y,(v_max-v_min+1)*board_skip_x,(l_max-l_min+1)*board_skip_y);
        
        context.fillStyle = '#f5f5f5';
        for(let l = l_min - 1; l <= l_max; l++)
        {
            for(let t = v_min >> 1; t <= v_max >> 1; t++)
            {
                if((l+t)%2===0)
                {
                    context.fillRect(t*2*board_skip_x-background_shift_x,l*board_skip_y-background_shift_y,2*board_skip_x,board_skip_y);
                }
            }
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
                board_length*square_size + 2*board_margin,
                board_length*square_size + 2*board_margin);
            //draw checkerboard
            context.fillStyle = '#7f7f7f';
            context.fillRect(shift_x, shift_y, board_length*square_size, board_length*square_size);
            context.fillStyle = '#cccccc';
            for(let row = 0; row < board_length; row++) 
            {
                for(let col = 0; col < board_length; col++)
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
            return [pos.x*square_size + shift_x, (board_length-1-pos.y)*square_size + shift_y];
        }

        context.save();
        context.globalAlpha = 0.5;
        for(let color in filtered_highlight_data)
        {
            context.fillStyle = color;
            for(let pos of filtered_highlight_data[color])
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
            for(let row = 0; row < board_length; row++) 
            {
                for(let col = 0; col < board_length; col++)
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
        for(const setting_block of filtered_arrow_data)
        {
            context.save();
            context.beginPath();
            context.fillStyle = setting_block.color;
            context.strokeStyle = setting_block.color;
            for(const arrow of setting_block.coordinates)
            {
                const [from_x, from_y] = get_coordinate(arrow.from);
                const [to_x, to_y] = get_coordinate(arrow.to);
                const r = square_size/2;
                canvas_arrow(context, from_x+r, from_y+r, to_x+r, to_y+r);
            }
            context.stroke();
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
    var headlen = 3; // length of head in pixels
    var dx = tox - fromx;
    var dy = toy - fromy;
    var angle = Math.atan2(dy, dx);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
}
