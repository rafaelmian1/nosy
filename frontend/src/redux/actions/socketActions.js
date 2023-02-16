import apiClient from '../../api/client';

const socketActions = {
  setFriendRequests: (requests) => {
    return (dispatch) => {
      dispatch({
        type: 'SET_FRIEND_REQUESTS',
        payload: { friend_requests: requests }
      });
    };
  },
  setFriends: (requests, friends) => {
    return (dispatch) =>
      dispatch({
        type: 'SET_FRIENDS',
        payload: { friend_requests: requests, friends }
      });
  },
  setGameRequests: (requests, playing_now) => {
    return (dispatch) => {
      dispatch({
        type: 'SET_GAME_REQUESTS',
        payload: { game_requests: requests, playing_now }
      });
    };
  },
  setFriendsList: () => {
    return async (dispatch) => {
      try {
        let response = await apiClient.get('/user/friend_list');
        if (!response.data.success) throw new Error();
        dispatch({
          type: 'SET_FRIENDS_LIST',
          payload: response.data.friends_list
        });
      } catch (error) {
        console.error(error);
      }
    };
  },
  setMultiGame: (game, coins) => {
    return (dispatch) => {
      dispatch({
        type: 'SET_GAME',
        payload: { game, coins, statistics: null }
      });
    };
  }
};
export default socketActions;
