const initState = {
  cardToZoom: undefined,
  commonBoardDisplay: true,
  games: [],
  selectedComponent: undefined,
  selectedAction: undefined,
  selectedActionPower: undefined,
  turnedComponents: [],
  collectActions: {},
  collectOnComponentActions: {},
  essencePickerSelection: {
    actionCost: {},
    actionGain: {},
    discardGain: {},
    placementCost: {},
  },
  focusZoom: true,
  canPayCost: {
    valid: false,
  },
  targetedComponent: undefined,
}

const gameReducer = (state = initState, action) => {
  const debug = false
  let collectActions
  let collectOnComponentActions
  let essencePickerSelection
  switch (action.type) {
  case 'CREATE_GAME':
    debug && console.log('create game lobby', action.gameLobby.id)
    return state
  case 'CREATE_GAME_LOBBY_ERROR':
    debug && console.log('create game lobby error', action.err)
    return state
  case 'JOIN_GAME':
    debug && console.log('join game', action.gameId)
    return state
  case 'JOIN_GAME_ERROR':
    debug && console.log('join game error', action.err)
    return state
  case 'LEAVE_CURRENT_GAME':
    debug && console.log('left game')
    state.gameId = null
    return state
  case 'LEAVE_CURRENT_GAME_ERROR':
    debug && console.log('left game error', action.err)
    return state
  case 'GAME_STARTED':
    debug && console.log('start game ', action.gameId)
    return state
  case 'GAME_OVER':
    debug && console.log('end game ', action.gameId)
    return state
  case 'SELECT_COMPONENT':
    return Object.assign({}, state, {
      selectedComponent: action.component,
    })
  case 'TARGET_COMPONENT':
    return Object.assign({}, state, {
      targetedComponent: action.component,
    })
  case 'ZOOM_CARD':
    return Object.assign({}, state, {
      zoomCard: action.card,
    })
  case 'CLEAR_ZOOM':
    return Object.assign({}, state, {
      zoomCard: undefined,
    })
  case 'TAP_COMPONENT':
    const { turnedComponents } = state
    debug && console.log('card.id', action.card.id)
    let index = turnedComponents.indexOf(action.card.id)
    if (index >= 0) {
      turnedComponents.splice(index, 1)
    } else {
      turnedComponents.push(action.card.id)
    }
    return Object.assign({}, state, {
      turnedComponents,
    })
  case 'RESET_COLLECT':
    return Object.assign({}, state, {
      collectActions: {},
      collectOnComponentActions: {},
    })
  case 'RESET_COLLECT_ACTION':
    collectActions = JSON.parse(JSON.stringify(state.collectActions))
    delete collectActions[action.id]
    return Object.assign({}, state, {
      collectActions,
    })
  case 'SET_COLLECT_ACTION':
    collectActions = JSON.parse(JSON.stringify(state.collectActions))
    collectActions[action.action.id] = action.action
    return Object.assign({}, state, {
      collectActions,
    })
  case 'RESET_COLLECT_ON_COMPONENT_ACTION':
    collectOnComponentActions = JSON.parse(JSON.stringify(state.collectOnComponentActions))
    delete collectOnComponentActions[action.id]
    return Object.assign({}, state, {
      collectOnComponentActions,
    })
  case 'SET_COLLECT_ON_COMPONENT_ACTION':
    collectOnComponentActions = JSON.parse(JSON.stringify(state.collectOnComponentActions))
    collectOnComponentActions[action.action.id] = action.action
    return Object.assign({}, state, {
      collectOnComponentActions,
    })
  case 'SET_FOCUS_ZOOM':
    return Object.assign({}, state, {
      focusZoom: action.flag,
    })
  case 'SET_ACTION':
    return Object.assign({}, state, {
      selectedAction: action.action,
    })
  case 'SET_ACTION_POWER':
    return Object.assign({}, state, {
      selectedActionPower: action.actionPowerIndex,
    })
  case 'RESET_ESSENCE_PICKER':
    if (action.selectionType) {
      essencePickerSelection = JSON.parse(JSON.stringify(state.essencePickerSelection))
      essencePickerSelection[action.selectionType] = {}
    } else {
      essencePickerSelection = {
        actionCost: {},
        actionGain: {},
        discardGain: {},
        placementCost: {},
      }
    }
    return Object.assign({}, state, {
      essencePickerSelection,
    })
  case 'ADD_ESSENCE_TO_SELECTION':
    essencePickerSelection = JSON.parse(JSON.stringify(state.essencePickerSelection))
    essencePickerSelection[action.selectionType][action.essenceType] = essencePickerSelection[action.selectionType][
      action.essenceType
    ]
      ? essencePickerSelection[action.selectionType][action.essenceType] + 1
      : 1
    return Object.assign({}, state, {
      essencePickerSelection,
    })
  case 'SET_ESSENCE_SELECTION':
    essencePickerSelection = JSON.parse(JSON.stringify(state.essencePickerSelection))
    essencePickerSelection[action.selectionType] = JSON.parse(JSON.stringify(action.essenceSelection))

    return Object.assign({}, state, {
      essencePickerSelection,
    })
  case 'CAN_PAY_COST':
    return Object.assign({}, state, {
      canPayCost: action.info,
    })
  case 'TOGGLE_COMMON_BOARD':
    return {
      ...state,
      commonBoardDisplay: !state.commonBoardDisplay,
    }
  default:
    return state
  }
}

export default gameReducer
