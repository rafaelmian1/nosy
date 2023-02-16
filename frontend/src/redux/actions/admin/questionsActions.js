import apiClient from '../../../api/client';

const questionActions = {
  getQuestions: () => {
    return async () => {
      let response = await apiClient.get('/admin/questions');
      return response;
    };
  },
  updateQuestion: () => {
    return async () => {};
  },
  createQuestion: (newQuestion) => {
    return async () => {
      let response = await apiClient.post('/admin/questions', newQuestion);
      return response;
    };
  },
  deleteQuestion: () => {
    return async () => {};
  }
};
export default questionActions;
