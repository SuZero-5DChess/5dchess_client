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
        ]
    }
    emit('response_data', response)

if __name__ == '__main__':
    socketio.run(app, debug=True)
  