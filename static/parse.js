'use strict';

function parse_FEN(fen) 
{
    const rows = fen.split('/');
    if (rows.length !== board_length) {
        throw new Error(`Invalid FEN format: must have exactly ${board_length} rows.`);
    }

    return rows.map(row => {
        let parsedRow = [];

        // Parse each character in the row
        for (let char of row) {
        	if(isNaN(char))
            {
                if ("BCDKNPSQRYUbcdknpsqryu".includes(char)) 
                {
                    parsedRow.push(char);
            	}
                else
                {
              	    throw new Error('Invalid FEN format: invalid piece:'+ char);
                }
            }
            else
            {
                let emptySquares = parseInt(char);
                parsedRow.push(...Array(emptySquares).fill('1'));
            }
        }
        if (parsedRow.length != board_length) {
            throw new Error(`Invalid FEN format: each row must have exactly ${board_length} squares. `+row);
        }
        return parsedRow;
    });
}
