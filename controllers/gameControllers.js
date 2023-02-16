const SinglePlayer = require('../models/Game').singlePlayer;
const MultiPlayer = require('../models/Game').multiPlayer;
const User = require('../models/User');

const gameControllers = {
  newGame: async (req, res) => {
    let game;
    try {
      if (req.body?.user_id) {
        game = new MultiPlayer({
          player1: { user: req.user._id },
          player2: { user: req.body.user_id }
        });

        game = await game.save();

        let userInvitated = await User.findOneAndUpdate(
          { _id: req.body.user_id },
          {
            $push: {
              game_requests: {
                creator: false,
                game_id: game._id,
                user: req.user._id
              }
            }
          },
          { new: true }
        ).populate({
          path: 'game_requests',
          populate: {
            path: 'user',
            model: 'user',
            select: 'username avatar connected'
          }
        });
        let user = await User.findOneAndUpdate(
          { username: req.user.username },
          {
            $push: {
              game_requests: {
                creator: true,
                game_id: game._id,
                user: req.body.user_id
              }
            }
          },
          { new: true }
        ).populate({
          path: 'game_requests',
          populate: {
            path: 'user',
            model: 'user',
            select: 'username avatar connected'
          }
        });
        res.json({
          success: true,
          game_requests: {
            invitator: user.game_requests,
            invitated: userInvitated.game_requests
          }
        });
      } else {
        game = new SinglePlayer({
          player: { user: req.user._id }
        });
        await game.save();
        await User.findOneAndUpdate(
          { _id: req.user._id },
          {
            $set: {
              playing_now: {
                status: true,
                game_id: game._id,
                multi_player: false
              }
            }
          },
          { new: true }
        );
        res.json({
          success: true,
          response: { game, coins: req.user.coins }
        });
      }
    } catch (error) {
      console.log(error);
      res.json({ success: false, error: error.message });
    }
  },
  acceptGameRequest: async (req, res) => {
    const { accept, game_id } = req.body;
    try {
      if (accept) {
        await User.updateMany(
          { 'game_requests.game_id': game_id },
          {
            $set: { playing_now: { status: true, game_id, multi_player: true } },
            $pull: { game_requests: { game_id } }
          },
          { new: true }
        );
        let game = await MultiPlayer.findOneAndUpdate(
          { _id: game_id },
          {
            $set: { status: true }
          },
          { new: true }
        );

        const player1 = await User.findOneAndUpdate(
          { _id: game.player1.user },
          { $set: { 'playing_now.player': 'player1' } },
          { new: true }
        );
        const player2 = await User.findOneAndUpdate(
          { _id: game.player2.user },
          { $set: { 'playing_now.player': 'player2' } },
          { new: true }
        );

        game = await MultiPlayer.findOne({ _id: game_id })
          .populate({ path: 'player1.user', model: 'user', select: 'username avatar' })
          .populate({ path: 'player2.user', model: 'user', select: 'username avatar' });
        res.json({
          success: true,
          game,
          coins: { invitated: player2.coins, invitator: player1.coins },
          game_requests: {
            invitator: player1.game_requests,
            invitated: player2.game_requests
          },
          playing_now: { invitator: player1.playing_now, invitated: player2.playing_now }
        });
      } else {
        await MultiPlayer.findOneAndDelete({ _id: req.body.game_id });
        await User.updateMany(
          { 'game_requests.game_id': game_id },
          {
            $pull: { game_requests: { game_id } }
          },
          { new: true }
        );
        res.json({
          success: true
        });
      }
    } catch (error) {
      res.json({ success: false, error: error.message });
    }
  },
  getCurrentGame: async (req, res) => {
    try {
      let game;
      if (req.user.playing_now.multi_player)
        game = await MultiPlayer.findOne({ _id: req.user.playing_now.game_id })
          .populate({ path: 'player1.user', model: 'user', select: 'username avatar' })
          .populate({ path: 'player2.user', model: 'user', select: 'username avatar' });
      else game = await SinglePlayer.findOne({ _id: req.user.playing_now.game_id });
      res.json({
        success: true,
        response: { game, coins: req.user.coins }
      });
    } catch (error) {
      res.json({ success: false, error: error.message });
    }
  },
  answer: async (req, res) => {
    const { question, answer, nosy, powers_used, coins_spent } = req.body;
    const { _id, playing_now } = req.user;
    const { game_id, multi_player, player } = playing_now;
    const opposite_player = { player1: 'player2', player2: 'player1' };
    try {
      if (multi_player) {
        if (nosy && answer) {
          await MultiPlayer.findOneAndUpdate(
            { _id: game_id._id },
            {
              $push: { [`${player}.medals`]: question.category }
            },
            { new: true }
          );
        }
        const thisquestion = { question: question._id, answer };
        let nosys = nosy ? 1 : 0;
        let newGameState = await MultiPlayer.findOneAndUpdate(
          { _id: game_id },
          {
            $push: { [`${player}.questions`]: thisquestion },
            $inc: {
              [`${player}.coins_spent`]: coins_spent,
              [`${player}.powers_used`]: powers_used,
              [`${player}.nosys`]: nosys
            }
          },
          { new: true }
        );
        let coins = answer ? 5 : 0;
        coins -= coins_spent;
        let newUserState = await User.findOneAndUpdate({ _id }, { $inc: { coins } }, { new: true });

        if (newGameState[player].medals.length === 5) {
          newGameState = await MultiPlayer.findOneAndUpdate(
            { _id: game_id._id },
            { $set: { status: false } },
            { new: true }
          );
          const { total: winner_total, wins: winner_wins } = newUserState.statistics.multi_player;
          const winner_win_pct = ((winner_wins + 1) / (winner_total + 1)) * 100;
          newUserState = await User.findOneAndUpdate(
            { _id },
            {
              $inc: {
                'statistics.multi_player.total': 1,
                'statistics.multi_player.wins': 1
              },
              $set: {
                'statistics.multi_player.win_pct': winner_win_pct,
                'playing_now.status': false,
                'playing_now.game_id': null,
                'playing_now.multi_player': false
              }
            },
            { new: true }
          );

          const loser = await User.findOne({ _id: newGameState[opposite_player[player]].user });
          const { total: loser_total, wins: loser_wins } = loser.statistics.multi_player;
          const loser_win_pct = ((loser_wins + 1) / (loser_total + 1)) * 100;

          await User.findOneAndUpdate(
            { _id: newGameState[opposite_player[player]].user },
            {
              $inc: {
                'statistics.multi_player.total': 1,
                'statistics.multi_player.losses': 1
              },
              $set: {
                'statistics.multi_player.win_pct': loser_win_pct,
                'playing_now.status': false,
                'playing_now.game_id': null,
                'playing_now.multi_player': true
              }
            },
            { new: true }
          );
        }

        const oponent = await User.findOne({ _id: newGameState[opposite_player[player]].user });

        if (!answer) {
          newGameState = await MultiPlayer.findOneAndUpdate(
            { _id: game_id._id },
            { $set: { current_player: opposite_player[player] } }
          );
        }

        newGameState = await MultiPlayer.findOne({ _id: game_id._id })
          .populate({ path: 'player1.user', model: 'user', select: 'username avatar' })
          .populate({ path: 'player2.user', model: 'user', select: 'username avatar' });

        res.json({
          success: true,
          response: { newGameState, newUserState, statistics: null, oponent_username: oponent.username }
        });
      } else {
        if (nosy && answer) {
          await SinglePlayer.findOneAndUpdate(
            { _id: game_id._id },
            {
              $push: { 'player.medals': question.category }
            },
            { new: true }
          );
        }
        const thisquestion = { question: question._id, answer: answer };
        let nosys = nosy ? 1 : 0;
        let lifes = answer ? 0 : -1;
        let newGameState = await SinglePlayer.findOneAndUpdate(
          { _id: game_id },
          {
            $push: { 'player.questions': thisquestion },
            $inc: {
              lifes: lifes,
              'player.coins_spent': coins_spent,
              'player.powers_used': powers_used,
              'player.nosys': nosys
            }
          },
          { new: true }
        );
        let coins = answer ? 5 : 0;
        coins -= coins_spent;
        let newUserState = await User.findOneAndUpdate({ _id }, { $inc: { coins: coins } }, { new: true });
        if (newGameState.player.medals.length === 5) {
          newGameState = await SinglePlayer.findOneAndUpdate(
            { _id: game_id._id },
            { $set: { status: false } },
            { new: true }
          );
          const { total, wins } = newUserState.statistics.single_player;
          const win_pct = ((wins + 1) / (total + 1)) * 100;
          newUserState = await User.findOneAndUpdate(
            { _id: req.user._id },
            {
              $inc: {
                'statistics.single_player.total': 1,
                'statistics.single_player.wins': 1
              },
              $set: {
                'statistics.single_player.win_pct': win_pct,
                'playing_now.status': false,
                'playing_now.game_id': null,
                'playing_now.multi_player': true
              }
            },
            { new: true }
          );
        }
        if (newGameState.lifes === 0) {
          newGameState = await SinglePlayer.findOneAndUpdate(
            { _id: game_id._id },
            { $set: { status: false } },
            { new: true }
          );
          const { total, wins } = newUserState.statistics.single_player;
          const win_pct = (wins / (total + 1)) * 100;
          newUserState = await User.findOneAndUpdate(
            { _id: req.user._id },
            {
              $inc: {
                'statistics.single_player.total': 1,
                'statistics.single_player.losses': 1
              },
              $set: {
                'statistics.single_player.win_pct': win_pct,
                'playing_now.status': false,
                'playing_now.game_id': null,
                'playing_now.multi_player': true
              }
            },
            { new: true }
          );
        }

        res.json({
          success: true,
          response: { newGameState, newUserState, statistics: null }
        });
      }
    } catch (error) {
      res.json({ success: false });
    }
  }
};

module.exports = gameControllers;
