5D Chess Client
=================

This is a web software that helps displaying 5d chessboard. Elements including:

+ Board with pieces on it.

+ The present line.

+ Highlighted squares/timelines/arrows.

Additional functionalities:

+ Report which square is clicked to the server.

+ Three optional buttons, <kbd>Undo</kbd>, <kbd>Redo</kbd>, and <kbd>Submit</kbd>. If pressed, the server will recieve a request. These buttons can be turned on/off from server side.

+ A toggable text window.

+ Additional <kbd>Submit</kbd> and <kbd>Screenshot</kbd> buttons.

*Remark.* This software is front-end only, with just a dummy python flask server for demonstration. It does not make moves or detect checkmate.

### How to use?

1. Make sure you have `flask` and `flask_socketio` installed. If not, run
```
pip install flask flask_socketio
```
(Remark: if something goes wrong, try update `flask` to its latest version)

2. Go to `app.py`, and change the `response` element in `handle_request` function to what you would like to display.

3. Start hosting by running `python app.py`.

4. Visit `http://127.0.0.1:5000` with your favorite browser.

### Syntax of the data

Datum passed to this program is converted to JSON format.

The LTCXY axes stand for Time-**L**ine, **T**ime, **C**olor, **X** and **Y** respectively. L and T can be positive or negative. For colors, `0` represents white and `1` represents black. For axes X and Y, values are coordinates of usual chess minus `'a'` and `'1'`, respectively.

To illustrate, if a piece is on the white's board of `(0T3)` and it is at square `b5`, then in the context of this program it has coordinate `l=0, t=3, c=0, x='b'-'a'=1, y=5-1=4`.

| Key in response data |                   Allowed Value                   | Is This Mandatory? | Comments                                                                     |
|:--------------------:|:-------------------------------------------------:|:------------------:|------------------------------------------------------------------------------|
|    `submit-button`   |       `None` \| `'enabled'` \| `'disabled'`       |         No         |                                                                              |
|     `undo-button`    |                   same as above                   |         No         |                                                                              |
|     `redo-button`    |                   same as above                   |         No         |                                                                              |
|        `size`        |             a dict with keys `x` and `y`          |         No         | The size of a board (If not specified, default is 8x8)                       |
|      `metadata`      |                  any dict object                  |         No         | It is completely ignored by the client                                       |
|        `data`        | a list of dicts with keys `l`, `t`, `c` and `fen` |         Yes        | `fen` is the chess FEN string for the board on coordinate specified by l,t,c |
|       `present`      |            a dict with keys `t` and `c`           |         No         | Coordinate of the present line                                               |
|        `focus`       |         a dict with keys `l`, `t` and `c`         |         No         | The board to look at when 'Center' button  in the client is pressed          |
|     `highlights`     |              a list of colored blocks             |         No         | See below                                                                    |

A colored block is a dict with following entries:

| Key in colored block |                                         Allowed Value                                         | Is This Mandatory? | Comments                                    |
|:--------------------:|:---------------------------------------------------------------------------------------------:|:------------------:|---------------------------------------------|
| `color`              | html color such as `'#fcff80'`                                                              | Yes                |                                             |
| `coordinates`        | a list of dicts with keys `l`,`t` ,`c`,`x`,`y` (the LTCXY coordinate of squares)              | No                 | squares to be highlighted with this color   |
| `arrows`             | a list of dicts with keys `from` and `to`  whose values are dicts containing LTCXY coordinate | No                 | arrows to be highlighted with this color    |
| `timelines`          | a list of integers (in l axis)                                                                | No                 | timelines to be highlighted with this color |
