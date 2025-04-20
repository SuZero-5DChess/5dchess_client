from flask import Flask, render_template, request, url_for
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')

# Load Browser Favorite Icon
@app.route('/favicon.ico')
def favicon():
    return url_for('static', filename='favicon.ico')

@socketio.on('click')
def handle_click(data):
    l = data['l']
    t = data['t']
    c = "wb"[data['c']]
    x = chr(data['x']+ord('a'))
    y = chr(data['y']+ord('1'))
    print(f"Received mouse click: ({l}T{t}{c}){x}{y}")

@socketio.on('right_click')
def handle_right_click(data):
    print("Recieved right click")
    emit('response_text', 'The server writes: '+str(data))

@socketio.on('request_data')
def handle_request(data):
    print(f"Received request for data: {data}")
    response = {
        'submit-button': None,
        'undo-button': 'enabled',
        'redo-button': 'disabled',
        'size': {
            'x': 8,
            'y': 8
        },
        'boards': [
            {
                'l':0,
                't':1,
                'c':0,
                'fen':'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
            },
            {
                'l':0,
                't':0,
                'c':1,
                'fen':'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
            },
            {
                'l':0,
                't':1,
                'c':1,
                'fen':'rnbqkbnr/pppppppp/8/8/8/4P3/PPPP1PPP/RNBQKBNR'
            },
            {
                'l':0,
                't':2,
                'c':0,
                'fen':'rnbqkb1r/pppppppp/8/8/8/4P3/PPPP1PPP/RNBQKBNR'
            },
            {
                'l':-1,
                't':1,
                'c':1,
                'fen':'rnbqkbnr/pppppppp/6n1/8/8/8/PPPPPPPP/RNBQKBNR'
            },
        ],
        "present": {
            't':1,
            'c':1,
            'color':'rgba(80,75,34,0.12)'
        },
        "focus": [
            {
                'l':-1,
                't':1,
                'c':1
            },
            {    
                'l':0,
                't':1,
                'c':1
            }
        ],
        "highlights": [
            {
                'color': '#ffff80',
                'coordinates': [
                    {'l':0, 't':1, 'c':1, 'x':4, 'y':1},
                    {'l':0, 't':1, 'c':1, 'x':4, 'y':2},
                ]
            },
            {
                'color': '#8080ff',
                'coordinates': [
                    {'l':0, 't':2, 'c':0, 'x':6, 'y':7},
                    {'l':-1, 't':1, 'c':1, 'x':6, 'y':5},
                ]
            },
            {
                'color': '#80cc3f',
                'arrows': [
                    {
                        'from': {'l':0, 't':2, 'c':0, 'x':6, 'y':7},
                        'to': {'l':0, 't':1, 'c':0, 'x':6, 'y':5},
                    }
                ]
            },
            {
                'color': '#7070ff',
                'timelines': [-1,],
            },
            {
                'color': '#cc2222',
                'boards': [
                    {'l':0, 't':2, 'c':0},
                    {'l':-1, 't':1, 'c':1}
                ]
            }
        ]
    }
    emit('response_data', response)

@socketio.on('request_undo')
def handle_undo():
    print('client requests undo')

@socketio.on('request_redo')
def handle_undo():
    print('client requests redo')

@socketio.on('request_submit')
def handle_undo():
    print('client requests submit')

if __name__ == '__main__':
    socketio.run(app, debug=True)
  