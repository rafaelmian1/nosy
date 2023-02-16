import apiClient from '../../api/client';

const gamesActions = {
  createGame: (username = null) => {
    return async (dispatch) => {
      let response = await apiClient.post('/game/newgame', username, {});
      if (!response.data.success) {
        throw new Error();
      }
      const { game, coins } = response.data.response;
      dispatch({
        type: 'SET_GAME',
        payload: { game, coins, statistics: null }
      });
    };
  },
  sendAnswer: (question, answer, nosy, powers_used, coins_spent) => {
    return async (dispatch) => {
      let response = await apiClient.put('/game/answer', {
        question,
        answer,
        nosy,
        powers_used,
        coins_spent
      });
      if (!response.data.success) {
        throw new Error();
      }
      dispatch({
        type: 'SET_GAME',
        payload: {
          statistics: response.data.response.newUserState.statistics,
          game: response.data.response.newGameState,
          coins: response.data.response.newUserState.coins
        }
      });
      if (response.data.response.newUserState.playing_now.multi_player) {
        dispatch({
          type: 'OPONENT_ANSWERED_QUESTION',
          payload: {
            game: response.data.response.newGameState,
            username: response.data.response.oponent_username,
            answer
          }
        });
      }

      return response.data.response;
    };
  },
  setGame: () => {
    return async (dispatch) => {
      let response = await apiClient.get('/game/current_game');
      if (!response.data.success) {
        throw new Error();
      }
      dispatch({
        type: 'SET_GAME',
        payload: {
          game: response.data.response.game,
          coins: response.data.response.coins,
          statistics: null
        }
      });
    };
  }
};
export default gamesActions;
