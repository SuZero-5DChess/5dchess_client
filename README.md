5D Chess Client
=================

This is a software that helps displaying 5d chessboard. It is also capable of reporting which squre is clicked. WIP.

### How to use?

1. Make sure you have `flask` and `flask_socketio` installed. If not, run
```
pip install flask flask_socketio
```
(Remark: if something goes wrong, try update `flask` to its latest version)

2. Go to `app.py`, and change the response data to what you would like to display. 

3. Start hosting by running `python app.py`.

4. Visit `http://127.0.0.1:5000` with your favorite browser.

### Syntax of the data

Datum passed to this program is converted to JSON format. For colors, `0` represents white and `1` represents black. For axes `x` and `y`, values are coordinates of usual chess minus `'a'` and `'1'`, respectively.

For example, if a piece is on the white's board of `(0T3)` and it is at square `b5`, then in the context of this program it has coordinate `l=0, t=3, c=0, x='b'-'a'=1, y=5-1=4`.
