const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, path: 'user' },
  questions: [
    {
      question: { type: mongoose.Types.ObjectId, path: 'question' },
      answer: { type: Boolean }
    }
  ],
  medals: [String],
  nosys: { type: Number, default: 0 },
  powers_used: { type: Number, default: 0 },
  coins_spent: { type: Number, default: 0 }
});

const MultiPlayerGame = new mongoose.Schema({
  status: { type: Boolean, default: false },
  player1: playerSchema,
  player2: playerSchema,
  current_player: { type: String, default: 'player1' },
  chat: [
    {
      autor: { type: String, required: true },
      comentario: { type: String, required: true }
    }
  ]
});

const SinglePlayerGame = new mongoose.Schema({
  status: { type: Boolean, default: true },
  player: playerSchema,
  lifes: { type: Number, default: 5 }
});

module.exports = {
  singlePlayer: mongoose.model('singleplayer game', SinglePlayerGame, 'singleplayer games'),
  multiPlayer: mongoose.model('multiplayer game', MultiPlayerGame, 'multiplayer games')
};
