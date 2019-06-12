const initState = {
  authError: null
}

const authReducer = (state = initState, action) => {
  switch(action.type) {
    case 'LOGIN_ERROR':
      console.log('login error')
      return {
        ...state,
        authError: 'Login failed'
      }
    case 'LOGIN_SUCCESS':
      console.log('login success')
      return {
        ...state,
        authError: null
      }
    case 'SIGNOUT_SUCCESS':
      console.log('signout success')
      return state;
    case 'REGISTER_SUCCESS':
      console.log('register success')
      return {
        ...state,
        authError: null
      }
    case 'REGISTER_FAIL':
      console.log('register error')
      return {
        ...state,
        authError: action.err.message
      }
    case 'SAVE_PROFILE_SUCCESS':
      console.log('save profile success')
      return {
        ...state,
        authError: null
      }
    case 'SAVE_PROFILE_FAIL':
      console.log('save profile error')
      return {
        ...state,
        authError: action.err.message
      }
    case 'GET_ONLINE_USERS_SUCCESS':
      console.log('Get online users list success')
      return {
        ...state,
        authError: null
      }
    case 'GET_ONLINE_USERS_ERROR':
      console.log('Get online users list error')
      return {
        ...state,
        authError: action.err.message
      }
    default:
      return state;
  }
};

export default authReducer;
