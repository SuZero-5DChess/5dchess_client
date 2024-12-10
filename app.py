from flask import Flask, render_template, request, url_for
from flask_socketio import SocketIO, emit
import sys

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('request_data')
def handle_request(data):
    print(f"Received request for data: {data}")
    response = {
        'metadata': {
            "size" : "8x8",
            "mode" : "odd"
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
                'c':0,
                'fen':'rnbqkbnr/pppppppp/6n1/8/8/8/PPPPPPPP/RNBQKBNR'
            },
        ],
        "focus": {
            'l':-1,
            't':1,
            'c':0
        },
        "highlights": {
            '#ffff80': [
                {'l':0, 't':1, 'c':1, 'x':4, 'y':1},
                {'l':0, 't':1, 'c':1, 'x':4, 'y':2},
            ],
            '#8080ff': [
                {'l':0, 't':2, 'c':0, 'x':6, 'y':7},
                {'l':-1, 't':1, 'c':0, 'x':6, 'y':5},
            ],
        }
    }
    emit('response_data', response)

if __name__ == '__main__':
    socketio.run(app, debug=True)
  