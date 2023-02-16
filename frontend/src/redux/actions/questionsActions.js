import apiClient from '../../api/client';

const questionActions = {
  rouletteRender: () => {
    return (dispatch) => {
      dispatch({ type: 'RENDER_ROULETTE' });
    };
  },
  getQuestion: (category, game) => {
    return async (dispatch, getState) => {
      try {
        let response = await apiClient.post('/question/', {
          category,
          game
        });
        return response.data.response;
      } catch (error) {
        alert('network error');
      }
    };
  }
};
export default questionActions;
