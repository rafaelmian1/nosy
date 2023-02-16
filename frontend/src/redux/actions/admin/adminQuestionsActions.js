import apiClient from '../../../api/client';

const adminQuestionActions = {
  getQuestions: () => {
    return async (dispatch) => {
      let response = await apiClient.get('/admin/questions');
      if (response.data?.success) {
        dispatch({ type: 'GET_QUESTIONS', payload: response.data.response });
        return response.data;
      }
    };
  },
  createQuestion: (newQuestion) => {
    return async (dispatch) => {
      let response = await apiClient.post(
        '/admin/question/' + newQuestion.correctAnswer,
        newQuestion
      );
      if (response.data?.success) {
        dispatch({ type: 'ADD_QUESTION', payload: response.data.response });
        return response.data;
      }
    };
  },
  updateQuestion: (editedQuestion) => {
    return async () => {
      await apiClient.put(
        'https://nosygame.rafaelmiandev.com/question/id',
        editedQuestion
      );
    };
  },

  deleteQuestion: (id) => {
    return async () => {
      let response = await apiClient.delete('/admin/question/' + id);
      return response.data;
    };
  },
  reload: () => {
    return (dispatch) => {
      dispatch({ type: 'RELOAD' });
    };
  }
};

export default adminQuestionActions;
