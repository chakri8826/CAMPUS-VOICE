import { createSlice } from '@reduxjs/toolkit';

const getInitialAuthState = () => {
  let user = null;
  let token = null;
  let isAuthenticated = false;
  try {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      user = JSON.parse(storedUser);
      token = storedToken;
      isAuthenticated = true;
    }
  } catch { }
  return { user, token, isAuthenticated };
};

const initialState = getInitialAuthState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      // Persist to localStorage
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      // Remove from localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    updateAvatar: (state, action) => {
      if (state.user) {
        state.user.avatar = action.payload;
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
});

export const { loginSuccess, logout, updateAvatar } = authSlice.actions;
export default authSlice.reducer;
