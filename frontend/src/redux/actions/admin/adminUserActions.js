import apiClient from '../../../api/client';

const adminUsersActions = {
  getUsers: () => {
    return async (dispatch) => {
      let response = await apiClient.get('/admin/user');
      if (response.data?.success) {
        dispatch({ type: 'GET_USERS', payload: response.data.response });
        return response.data;
      }
    };
  },
  createUser: (user) => {
    return async (dispatch) => {
      let response = await apiClient.post('/admin/user', user);
      if (response.data?.success) {
        await dispatch({ type: 'ADD_USER', payload: response.data.response });
        return response.data;
      }
    };
  },
  updateUser: (newUser) => {
    return async (dispatch) => {
      let response = await apiClient.put('/admin/user', newUser);
      if (response.data?.success) {
        await dispatch({ type: 'DELETE_USER', payload: newUser });
        return response.data;
      }
    };
  },

  deleteUser: (userId) => {
    return async (dispatch) => {
      let response = await apiClient.delete('/admin/user/' + userId);
      if (response.data?.success) {
        await dispatch({ type: 'DELETE_USER', payload: userId });
        return response.data;
      }
    };
  },
  getReviews: () => {
    return async (dispatch) => {
      let response = await apiClient.get('/review');
      if (response.data?.success) {
        dispatch({ type: 'GET_REVIEWS', payload: response.data.response });
        return response.data;
      }
    };
  }
};
export default adminUsersActions;
