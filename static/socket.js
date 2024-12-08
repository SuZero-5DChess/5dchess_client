'use strict';

const socket = io();

// Function to request data from the server
function requestData() {
    socket.emit('request_data', { request: 'Send me user data!' });
}

// Listen for the response from the server
socket.on('response_data', function(data) {
    console.log('Data received from server:', data);
    //document.getElementById('output').textContent = JSON.stringify(data, null, 2);
    draw_boards = function(context, l_min=-Infinity, l_max=Infinity, v_min=-Infinity, v_max=Infinity) {
        for(const board of data.boards)
        {
            let l = board.l, v = board.t << 1 | board.c;
            if(l < l_min || l > l_max || v < v_min || v > v_max || board.fen == null)
            {
                continue;
            }
            // the boards's origin is (shift_x, shify_y)
            const shift_x = v*board_skip;
            const shift_y = l*board_skip;
            //draw margin
            context.fillStyle = (board.c==1) ? '#555555' : '#dfdfdf';
            context.fillRect(shift_x - board_margin, shift_y - board_margin,
                board_length*square_size + 2*board_margin,
                board_length*square_size + 2*board_margin);
            //parse
            let parsed_board = parse_FEN(board.fen);
            //draw checkerboard
            context.fillStyle = '#7f7f7f';
            for (let row = 0; row < board_length; row++) 
            {
                for (let col = 0; col < board_length; col++)
                {
                    if((row + col) % 2 === 1)
                    {
                        context.fillRect(col*square_size + shift_x,
                            row*square_size + shift_y,
                            square_size, square_size);
                    }
                }
            }
            context.fillStyle = '#cccccc';
            for (let row = 0; row < board_length; row++) 
            {
                for (let col = 0; col < board_length; col++)
                {
                    if((row + col) % 2 === 0)
                    {
                        context.fillRect(col*square_size + shift_x,
                            row*square_size + shift_y,
                            square_size, square_size);
                    }
                }
            }
            for (let row = 0; row < board_length; row++) 
            {
                for (let col = 0; col < board_length; col++)
                {
                    const piece = parsed_board[row][col];
                    if(isNaN(piece))
                    {
                        context.drawImage(svg_images[piece], col*square_size + shift_x, row*square_size + shift_y, square_size, square_size);
                    }
                }
            }
        }
    }
    animation_manager.new_task();
});
