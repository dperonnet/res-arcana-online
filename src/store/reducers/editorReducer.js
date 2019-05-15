const initState = {
    component: {},
    pristineComponent: {},
    filter: 'artefact'
  }
  
  const editorReducer = (state = initState, action) => {
    switch (action.type) {
      case 'SAVE_COMPONENT':
        console.log('save component', action.componentRef);
        return {
          ...state,
          component: action.componentRef.data()
        };
      case 'SAVE_COMPONENT_ERROR':
        console.log('save component error', action.err);
        return state;
      case 'CREATE_COMPONENT':
        return {
          ...state,
          component: action.component
        }
      case 'FILTER_COMPONENTS':
        return {
          ...state,
          filter: action.filter
        }
      case 'SELECT_COMPONENT':
        return {
          ...state,
          component: JSON.parse(JSON.stringify(action.component)),
          pristineComponent: JSON.parse(JSON.stringify(action.component))
        }
      case 'RESET_COMPONENT':
        return {
          ...state,
          component: JSON.parse(JSON.stringify(state.pristineComponent))
        }
      case 'FORM_CHANGE':
        console.log(action.component)
        return {
          ...state,
          component: action.component
        }
      default:
        return state;
    }
  };
  
  export default editorReducer;
  