//Requirements and Declarations
require('dotenv').config();
require('./config/database');
const express = require('express');
const cors = require('cors');
require('./config/passport');
const router = require('./routes/index');
const admin = require('./routes/admin');
const socket = require('socket.io');
const path = require('path');

//App
const app = express();

//Middelwares
app.use(cors());
app.use(express.json());

//Routers
app.use('/api', router);
app.use('/api/admin', admin);

//Validate production state
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
  });
}

const PORT = process.env.PORT;
const HOST = process.env.HOST || '0.0.0.0';

//Server listening
const server = app.listen(PORT, HOST, () => console.log(`Server listening on port ${PORT} (${HOST})`));

const io = socket(server, {
  cors: {
    origin: '*',
    credentials: true
  }
});

const socketioJwt = require('socketio-jwt');

io.use(
  socketioJwt.authorize({
    secret: process.env.SECRETORKEY,
    handshake: true
  })
);

io.on('connection', (socket) => {
  const socketUsername = socket.decoded_token._doc.username;

  socket.join(socketUsername);

  io.sockets.emit('connected', socketUsername);

  socket.on('game_request', ({ username, requests }) => {
    io.to(username).emit('game_request', {
      username: socketUsername,
      requests
    });
  });
  socket.on('accepted_game_request', ({ username, requests, playing_now, game, coins }) => {
    io.to(username).emit('accepted_game_request', {
      username: socketUsername,
      requests,
      playing_now,
      game,
      coins
    });
  });
  socket.on('oponent_answered_question', ({ username, game, answer }) => {
    io.to(username).emit('oponent_answered_question', {
      username: socketUsername,
      game,
      answer
    });
  });

  socket.on('friend_request', ({ username, requests }) => {
    io.to(username).emit('friend_request', {
      username: socketUsername,
      requests
    });
  });

  socket.on('accepted_friend_request', ({ username, requests, friends }) => {
    io.to(username).emit('accepted_friend_request', {
      username: socketUsername,
      requests,
      friends
    });
  });

  socket.on('change_current_player', (username) => {
    io.to(username).emit('change_current_player', socketUsername);
  });

  socket.on('direct_message', (username) => {
    io.to(username).emit('direct_message', socketUsername);
  });

  socket.on('disconnection', () => {
    io.sockets.emit('disconnection', socketUsername);
  });
});
