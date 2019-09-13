const initState = {
  authError: null
}

const authReducer = (state = initState, action) => {
  switch(action.type) {
    case 'LOGIN_ERROR':
      console.log('login error', action.err.message)
      return {
        ...state,
        authError: action.err.message
      }
    case 'LOGIN_SUCCESS':
      console.log('login success')
      return {
        ...state,
        authError: null
      }
    case 'SIGNOUT_SUCCESS':
      console.log('signout success')
      return {
        ...state,
        authError: null
      }
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
    case 'GET_USER_SUCCESS': 
      console.log('Get user success')
      let error = (action.user && action.user.size > 0) ? "Mage name is not available" : null
      return {
        ...state,
        authError: error
      }
    case 'GET_USER_FAIL': 
      console.log('Get user error')
      return {
        ...state,
        authError: action.err.message
      }
    default:
      return state;
  }
};

export default authReducer;
