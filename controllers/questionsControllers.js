const Question = require('../models/Question');

const questionsControllers = {
  getQuestion: async (req, res) => {
    const { category, game } = req.body;
    const { player } = req.user.playing_now;
    let questions;
    if (game.current_player) {
      questions = game[player].questions;
    } else {
      questions = game.player.questions;
    }
    questions = questions.length > 0 && questions.map((qs) => qs.question);
    try {
      let allQuestions;
      if (questions) {
        allQuestions = await Question.find({ category }).find({
          _id: { $nin: questions }
        });
      } else {
        allQuestions = await Question.find({ category });
      }
      let randomQuestion = allQuestions[Math.floor(Math.random() * allQuestions.length)];
      res.json({ success: true, response: randomQuestion });
    } catch (error) {
      res.json({ success: false, error: error.message });
    }
  }
};

module.exports = questionsControllers;
