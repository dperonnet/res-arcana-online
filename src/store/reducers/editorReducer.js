import { camelCase, snakeCase } from 'lodash';

const initTime = Date.now()
const initState = {
    component: {
      id: '',
      class: '',
      name: '',
      type: 'artefact',
      hasStandardCollectAbility: false,
      hasSpecificCollectAbility: false,
      isDragon: false,
      isCreature: false
    },
    pristineComponent: {},
    filter: 'artefact',
    timeIndicator: initTime
  }
  
  const editorReducer = (state = initState, action) => {
    switch (action.type) {
      case 'SAVE_COMPONENT':
        console.log('save component', action.component);
        return {
          ...state,
          component: action.component,
          pristineComponent: action.component
        };
      case 'SAVE_COMPONENT_ERROR':
        console.log('save component error', action.err);
        return state;
      case 'DELETE_COMPONENT':
        console.log('component deleted', action.componentId);
        return initState;
      case 'DELETE_COMPONENT_ERROR':
        console.log('delete component error', action.err);
        return state;
      case 'CREATE_COMPONENT':
        return {
          ...state,
          component: action.component,
          pristineComponent: action.component
        }
      case 'FILTER_COMPONENTS':
        return {
          ...state,
          filter: action.filter
        }
      case 'SELECT_COMPONENT':
        const time = Date.now()
        return {
          ...state,
          component: JSON.parse(JSON.stringify(action.component)),
          pristineComponent: JSON.parse(JSON.stringify(action.component)),
          timeIndicator: time
        }
      case 'RESET_COMPONENT':
        return {
          ...state,
          component: JSON.parse(JSON.stringify(state.pristineComponent))
        }
      case 'FORM_CHANGE':
        return {
          ...state,
          component: {
            ...action.component,
            id: camelCase(action.component.name),
            class: snakeCase(action.component.name)
          }
        }
      default:
        return state;
    }
  };
  
  export default editorReducer;
  