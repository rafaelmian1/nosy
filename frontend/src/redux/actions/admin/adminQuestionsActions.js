import axios from "axios";

const adminQuestionActions = {
  getQuestions: () => {
    return async (dispatch) => {
      let response = await axios.get(
        "https://nosygame.herokuapp.com/api/admin/questions"
      );
      if (response.data.success) {
        dispatch({ type: "GET_QUESTIONS", payload: response.data.response });
        return response.data;
      }
    };
  },
  createQuestion: (newQuestion) => {
    return async (dispatch) => {
      let response = await axios.post(
        "https://nosygame.herokuapp.com/api/admin/question/" +
          newQuestion.correctAnswer,
        newQuestion
      );
      if (response.data.success) {
        dispatch({ type: "ADD_QUESTION", payload: response.data.response });
        return response.data;
      }
    };
  },
  updateQuestion: (editedQuestion) => {
    return async () => {
      await axios.put(
        "https://nosygame.herokuapp.com/question/id",
        editedQuestion
      );
    };
  },

  deleteQuestion: (id) => {
    return async () => {
      let response = await axios.delete(
        "https://nosygame.herokuapp.com/api/admin/question/" + id
      );
      return response.data;
    };
  },
  reload: () => {
    return (dispatch) => {
      dispatch({ type: "RELOAD" });
    };
  },
};

export default adminQuestionActions;
