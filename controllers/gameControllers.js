const SinglePlayer = require("../models/Game").singlePlayer;
const MultiPlayer = require("../models/Game").multiPlayer;
const User = require("../models/User");

const gameControllers = {
  newGame: async (req, res) => {
    let game;
    try {
      if (req.body.username) {
        game = new MultiPlayer({
          players: { $push: { user: req.user._id } },
          current_player: req.user.username,
        });

        game = await game.save();

        let userInvitated = await User.findOneAndUpdate(
          { username: req.body.username },
          {
            $push: {
              game_requests: {
                creator: false,
                game_id: game._id,
                user: req.user._id,
              },
            },
          },
          { new: true }
        ).populate({
          path: "game_requests",
          populate: {
            path: "user",
            model: "user",
            select: "username avatar connected",
          },
        });
        let user = await User.findOneAndUpdate(
          { username: req.user.username },
          {
            $push: {
              game_requests: {
                creator: true,
                game_id: game._id,
                user: userInvitated._id,
              },
            },
          },
          { new: true }
        ).populate({
          path: "game_requests",
          populate: {
            path: "user",
            model: "user",
            select: "username avatar connected",
          },
        });
        res.json({
          success: true,
          game_requests: {
            invitator: user.game_requests,
            invitated: userInvitated.game_requests,
          },
        });
      } else {
        game = new SinglePlayer({
          player: { user: req.user._id },
        });
        await game.save();
        await User.findOneAndUpdate(
          { _id: req.user._id },
          {
            $set: {
              playing_now: {
                status: true,
                game_id: game._id,
                multi_player: false,
              },
            },
          },
          { new: true }
        );
        res.json({
          success: true,
          response: { game, coins: req.user.coins },
        });
      }
    } catch (error) {
      res.json({ success: false, error: error.message });
    }
  },
  acceptGameRequest: async (req, res) => {
    const { accept, game_id, username } = req.body;
    try {
      if (accept) {
        await User.updateMany(
          { "game_requests.game_id": game_id },
          {
            $set: { playing_now: { status: true, game_id } },
            $pull: { game_requests: { game_id } },
          },
          { new: true }
        );
        let game = await MultiPlayer.findOneAndUpdate(
          { _id: game_id },
          {
            $push: { players: { user: req.user._id } },
            $set: { status: true },
          },
          { new: true }
        ).populate({
          path: "players",
          populate: {
            path: "user",
            model: "user",
            select: "username avatar connected",
          },
        });
        res.json({
          success: true,
          game,
          coins: { invitated: player2.coins, invitator: player1.coins },
          game_requests: {
            invitator: player1.game_requests,
            invitated: player2.game_requests,
          },
          playing_now: {
            invitator: player1.playing_now,
            invitated: player2.playing_now,
          },
        });
      } else {
        await MultiPlayer.findOneAndDelete({ _id: req.body.game_id });
        throw new Error("Declined");
      }
    } catch (error) {
      res.json({ success: false, error: error.message });
    }
  },
  getCurrentGame: (req, res) => {
    res.json({
      success: true,
      response: { game: req.user.playing_now.game_id, coins: req.user.coins },
    });
  },
  answer: async (req, res) => {
    console.log(req.body);
    const { question, answer, nosy, powers_used, coins_spent } = req.body;
    const { _id, playing_now } = req.user;
    const { game_id, multi_player } = playing_now;
    try {
      if (multi_player) {
      } else {
        if (nosy && answer) {
          await SinglePlayer.findOneAndUpdate(
            { _id: game_id._id },
            {
              $push: { "player.medals": question.category },
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
            $push: { "player.questions": thisquestion },
            $inc: {
              lifes: lifes,
              "player.coins_spent": coins_spent,
              "player.powers_used": powers_used,
              "player.nosys": nosys,
            },
          },
          { new: true }
        );
        let coins = answer ? 5 : 0;
        coins -= coins_spent;
        let newUserState = await User.findOneAndUpdate(
          { _id },
          { $inc: { coins: coins } },
          { new: true }
        );
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
                "statistics.single_player.total": 1,
                "statistics.single_player.wins": 1,
              },
              $set: {
                "statistics.single_player.win_pct": win_pct,
                "playing_now.status": false,
                "playing_now.game_id": null,
                "playing_now.multi_player": true,
              },
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
                "statistics.single_player.total": 1,
                "statistics.single_player.losses": 1,
              },
              $set: {
                "statistics.single_player.win_pct": win_pct,
                "playing_now.status": false,
                "playing_now.game_id": null,
                "playing_now.multi_player": true,
              },
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
              $inc: { "statistics.single_player.total": 1 },
              $inc: { "statistics.single_player.losses": 1 },
              $inc: { "statistics.single_player.win_pct": win_pct },
              $set: { "playing_now.status": false },
              $set: { "playing_now.game_id": null },
              $set: { "playing_now.multi_player": true },
            },
            { new: true }
          );
        }
        res.json({
          success: true,
          response: { newGameState, newUserState, statistics: null },
        });
      }
    } catch (error) {
      res.json({ success: false });
    }
  },
};

module.exports = gameControllers;
