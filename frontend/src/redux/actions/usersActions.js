import apiClient from '../../api/client';
import { toast } from 'react-hot-toast';

const usersActions = {
  signUpUser: (newUser) => {
    return async (dispatch) => {
      try {
        let response = await apiClient.post('/user/signup', {
          ...newUser
        });
        response.data.success &&
          dispatch({ type: 'LOG_IN_USER', payload: response.data });
        return response;
      } catch {
        toast.error('Something went wrong', {
          position: 'top-right',
          style: {
            borderRadius: '10px',
            background: '#453ab7',
            color: '#fff',
            fontFamily: 'Ubuntu, sans-serif'
          }
        });
      }
    };
  },
  logInUser: (newUser) => {
    return async (dispatch) => {
      try {
        let response = await apiClient.post('/user/login', {
          ...newUser
        });
        if (response.data?.success === false) {
          toast.error(response.data.error, {
            position: 'top-right',
            style: {
              borderRadius: '10px',
              background: '#453ab7',
              color: '#fff',
              fontFamily: 'Ubuntu, sans-serif'
            }
          });
        }
        response.data.success &&
          dispatch({ type: 'LOG_IN_USER', payload: response.data });
        return response;
      } catch {
        toast.error('Something went wrong', {
          position: 'top-right',
          style: {
            borderRadius: '10px',
            background: '#453ab7',
            color: '#fff',
            fontFamily: 'Ubuntu, sans-serif'
          }
        });
      }
    };
  },
  addFriend: (username) => {
    return async (dispatch) => {
      try {
        let response = await apiClient.post('/user/friend_request', {
          username
        });
        if (!response.data.success) throw new Error(response.data.error);
        return dispatch({
          type: 'SEND_FRIEND_REQUEST',
          payload: { username, friend_requests: response.data.friend_requests }
        });
      } catch (error) {
        toast.error(
          error.message.includes('User') ? error.message : 'Session expired',
          {
            position: 'top-right',
            style: {
              borderRadius: '10px',
              background: '#453ab7',
              color: '#fff',
              fontFamily: 'Ubuntu, sans-serif'
            }
          }
        );
        // return dispatch({ type: "LOG_OUT" });
      }
    };
  },
  answerFriendRequest: (accept, username) => {
    return async (dispatch) => {
      try {
        let response = await apiClient.put('/user/friend_request', {
          accept,
          username
        });
        if (!response.data.success) throw new Error(response.data.error);
        if (accept) {
          return dispatch({
            type: 'ACCEPT_FRIEND_REQUEST',
            payload: {
              username,
              friend_requests: response.data.friend_requests,
              friends: response.data.friends
            }
          });
        } else {
          return dispatch({
            type: 'DECLINE_FRIEND_REQUEST',
            payload: { friend_requests: response.data.friend_requests }
          });
        }
      } catch (error) {
        toast.error('Session expired', {
          position: 'top-right',
          style: {
            borderRadius: '10px',
            background: '#453ab7',
            color: '#fff',
            fontFamily: 'Ubuntu, sans-serif'
          }
        });
        return dispatch({ type: 'LOG_OUT' });
      }
    };
  },
  sendGameRequest: (friend) => {
    return async (dispatch) => {
      const { username, _id: user_id } = friend;

      try {
        let response = await apiClient.post('/game/newgame', { user_id });

        if (!response.data.success) throw new Error();
        dispatch({
          type: 'SEND_GAME_REQUEST',
          payload: { username, game_requests: response.data.game_requests }
        });
      } catch (error) {
        toast.error('There was a problem', {
          position: 'top-right',
          style: {
            borderRadius: '10px',
            background: '#453ab7',
            color: '#fff',
            fontFamily: 'Ubuntu, sans-serif'
          }
        });
        // return dispatch({ type: 'LOG_OUT' })
      }
    };
  },
  answerGameRequest: (accept, username, game_id) => {
    return async (dispatch) => {
      try {
        let response = await apiClient.put('/game/newgame', {
          username,
          accept,
          game_id
        });
        if (!response.data.success) throw new Error();
        if (accept) {
          return dispatch({
            type: 'ACCEPT_GAME_REQUEST',
            payload: {
              username,
              playing_now: response.data.playing_now,
              game_requests: response.data.game_requests,
              game: response.data.game,
              coins: response.data.coins.invitator
            }
          });
        } else {
          return dispatch({
            type: 'DECLINE_GAME_REQUEST',
            payload: { game_requests: response.data.game_requests }
          });
        }
      } catch (error) {
        toast.error('Session expired', {
          position: 'top-right',
          style: {
            borderRadius: '10px',
            background: '#453ab7',
            color: '#fff',
            fontFamily: 'Ubuntu, sans-serif'
          }
        });
        // return dispatch({ type: "LOG_OUT" });
      }
    };
  },

  logInLS: () => {
    return async (dispatch) => {
      let token = localStorage.getItem('token');
      try {
        let response = await apiClient.get('/user/token');
        dispatch({
          type: 'LOG_IN_USER',
          payload: { ...response.data, token }
        });
      } catch {
        toast.error('Session expired', {
          position: 'top-right',
          style: {
            borderRadius: '10px',
            background: '#453ab7',
            color: '#fff',
            fontFamily: 'Ubuntu, sans-serif'
          }
        });
        return dispatch({ type: 'LOG_OUT' });
      }
    };
  },
  logOutUser: () => {
    return async (dispatch) => {
      toast('Hope to see you soon!', {
        icon: '👋',
        position: 'top-right',
        style: {
          borderRadius: '10px',
          background: '#453ab7',
          color: '#fff',
          fontFamily: 'Ubuntu, sans-serif'
        }
      });
      try {
        let res = await apiClient.put('/user/logout');
        if (!res.data.success) throw new Error();
        dispatch({ type: 'LOG_OUT' });
      } catch (error) {
        console.error(error);
      }
    };
  },
  sendMail: (newUser) => {
    return async () => {
      let response = await apiClient.post('/mail', {
        ...newUser
      });
      return response;
    };
  },

  postNewReview: (newReview, token) => {
    return async () => {
      try {
        let response = await apiClient.post(
          `/review`,

          newReview
        );
        if (response.data?.success) {
          return { success: true, response: response.data.response };
        } else {
          return { success: false, response: response.data.response };
        }
      } catch (err) {
        console.log(err.message);
        return { success: false, response: err.message };
      }
    };
  },

  getReviews: () => {
    return async () => {
      try {
        let response = await apiClient.get('/review');
        if (response.data?.success) {
          return { success: true, response: response.data.response };
        } else {
          return { success: false, response: response.data.response };
        }
      } catch (error) {
        return { success: false, response: error.message };
      }
    };
  },
  deleteReview: (id) => {
    return async () => {
      try {
        let response = await apiClient.delete('/review/' + id);
        if (response.data?.success) {
          return { success: true };
        } else {
          return { success: false };
        }
      } catch (error) {
        return { success: false, response: error.message };
      }
    };
  },

  setEmoji: (emoji) => {
    return async (dispatch) => {
      const token = localStorage.getItem('token');
      try {
        let response = await apiClient.put(`/user/emoji`, { emoji });
        if (!response.data.success) throw new Error();
        dispatch({ type: 'LOG_IN_USER', payload: { ...response.data, token } });
        return response.data;
      } catch (err) {
        return { success: false, response: err.message };
      }
    };
  },
  searchUser: (username) => {
    return async () => {
      try {
        var response = await apiClient.post('/user/add_friend', { username });
        if (!response.data.success) throw new Error(response.data.response);
        let user = {
          username: response.data.response.username,
          avatar: response.data.response.avatar
        };
        return user;
      } catch (error) {
        toast.error(response.data.response, {
          position: 'top-center',
          style: {
            borderRadius: '10px',
            background: '#453ab7',
            color: '#fff',
            fontFamily: 'Ubuntu, sans-serif'
          }
        });
      }
    };
  }
};

export default usersActions;
