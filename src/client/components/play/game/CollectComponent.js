import React, { Component } from 'react'
import {
  resetCollectAction,
  resetCollectOnComponentAction,
  setCollectAction,
  setCollectOnComponentAction,
  tapComponent,
} from '../../../../store/actions/gameActions'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faSlash } from '@fortawesome/free-solid-svg-icons'
import GameComponent from './GameComponent'

class CollectComponent extends Component {
  /**
   * Build the collect action
   */
  buildCollectAction = (component, essenceList = {}) => {
    let collectAction = {
      id: component.id,
      name: component.name,
      essences: [],
      from: 'COLLECT_ABILITY',
      type: 'GAIN',
      valid: true,
    }
    Object.entries(essenceList).forEach(essence => {
      let newEssence = { type: essence[0], quantity: essence[1] }
      collectAction.essences.push(newEssence)
    })

    return collectAction
  }

  /**
   * Set the selected collect action for the component.
   */
  handleSelectOption = type => {
    const { component } = this.props
    let essenceList = {}
    essenceList[type] = component.specificCollectAbility.essenceList.find(essence => essence.type === type).quantity
    const action = this.buildCollectAction(component, essenceList)
    this.props.setCollectAction(action)
  }

  /**
   * Add one essence of the selected type to the collect action.
   */
  handleAddTypeToOption = type => {
    const { component, collectActions } = this.props
    const collectAction = collectActions[component.id]
    let essenceList = {}
    essenceList[type] = 0
    const action = collectAction ? collectAction : this.buildCollectAction(component, essenceList)
    let essenceIndex = action.essences.findIndex(essence => {
      return essence.type === type
    })
    if (essenceIndex > -1) {
      action.essences[essenceIndex].quantity++
    } else {
      action.essences.push({ type, quantity: 1 })
    }
    let count = 0
    action.essences.forEach(essence => (count = count + essence.quantity))
    action.valid = component.specificCollectAbility.essenceList[0].quantity === count
    this.props.setCollectAction(action)
  }

  /**
   * Set the collect essence on component action for the component.
   * Or reset the action if it already exist.
   */
  handleCollectEssenceOnComponent = () => {
    const {
      component,
      collectOnComponentActions,
      essencesOnComponent,
      setCollectOnComponentAction,
      resetCollectOnComponentAction,
    } = this.props
    if (essencesOnComponent || collectOnComponentActions[component.id]) {
      if (!collectOnComponentActions[component.id]) {
        let essenceList = {}
        essencesOnComponent.forEach(essence => (essenceList[essence.type] = essence.quantity))
        const action = this.buildCollectAction(component, essenceList)
        action.from = 'ON_COMPONENT'
        setCollectOnComponentAction(action)
      } else {
        resetCollectOnComponentAction(component.id)
      }
    }
  }

  /**
   * Render the collect ability of a component: show all essences and their corresponding number to collect.
   *
   * @param {*} essenceList list of the essence to collect.
   * @param {*} handleOnClick on click event to bind.
   * @param {*} onComponent flag used to render the "on this component" icon.
   * @param {*} cost flag used to render the cost icon on the component.
   */
  renderCollectAbility = (essenceList, handleOnClick, onComponent, cost) => {
    const { status } = this.props
    const ready = status === 'READY'
    let essences =
      essenceList &&
      essenceList.map(essence => {
        return (
          <div key={essence.type} className="collect-option">
            {cost ? (
              <div className={'type essence ' + essence.type + ' cost-container'}>
                <div className="cost"></div>
                {essence.quantity}
              </div>
            ) : (
              <div className={'type essence ' + essence.type}>{essence.quantity}</div>
            )}
          </div>
        )
      })
    return (
      <div onClick={!ready ? handleOnClick : null}>
        {essences}
        {onComponent && (
          <>
            {' '}
            on <div className="on-component-icon"></div>
          </>
        )}
      </div>
    )
  }

  /**
   * Render the collect on component essence list.
   */
  renderCollectOnComponent = collectOnComponentActionsRef => {
    const { component, essencesOnComponent } = this.props
    if (essencesOnComponent || collectOnComponentActionsRef[component.id]) {
      const essences = collectOnComponentActionsRef[component.id]
        ? collectOnComponentActionsRef[component.id].essences
        : null
      return (
        essences &&
        essences.map(essence => {
          return (
            <div key={essence.type} className="collect-option">
              <div className={'type essence ' + essence.type}>{essence.quantity}</div>
            </div>
          )
        })
      )
    } else {
      return null
    }
  }

  /**
   * Render the essence options to select when the player has a collect choice to make.
   */
  renderEssencePicker = essenceList => {
    const { component, collectActions } = this.props
    let typeIsAny = essenceList.filter(item => {
      return item.type.startsWith('any')
    })

    // When the collect ability is type 'any', display add buttons for all type allowed.
    if (typeIsAny.length > 0) {
      const essenceList = ['elan', 'life', 'calm', 'death', 'gold']
      switch (typeIsAny[0].type) {
        case 'any-but-gold':
          essenceList.pop()
          break
        case 'any-but-death-gold':
          essenceList.pop()
          essenceList.pop()
          break
        default:
      }
      return essenceList.map((type, index) => {
        let essenceIndex =
          collectActions &&
          collectActions[component.id] &&
          collectActions[component.id].essences.findIndex(essence => essence.type === type)
        let selection = essenceIndex > -1 ? collectActions[component.id].essences[essenceIndex] : null
        let isLast = index === essenceList.length - 1
        return (
          <div key={type} className="collect-option">
            <div className={'essence pointer-cursor ' + type} onClick={() => this.handleAddTypeToOption(type)}>
              {(selection && selection.quantity) || 0}
            </div>
            {!isLast && (
              <div className="operator">
                <FontAwesomeIcon icon={faPlus} size="sm" />
              </div>
            )}
          </div>
        )
      })
    } else {
      // else display selection buttons for each possible collect option
      return essenceList.map((essence, index) => {
        let isLast = index === essenceList.length - 1
        return (
          <div key={essence.type} className="collect-option">
            <div
              className={'essence pointer-cursor ' + essence.type}
              onClick={() => this.handleSelectOption(essence.type)}
            >
              {essence.quantity}
            </div>
            {!isLast && (
              <div className="operator">
                <FontAwesomeIcon icon={faSlash} size="sm" rotation={90} />
              </div>
            )}
          </div>
        )
      })
    }
  }

  /**
   * Render the specific collect ability for the "Forge Maudite" component.
   * Set a collect action to either "tap" the component or pay 1 death essence.
   */
  renderForgeMauditePicker = () => {
    const { component, setCollectAction, status } = this.props
    const ready = status === 'READY'
    const handleCost = () => {
      const action = this.buildCollectAction(component, { death: 1 })
      action.type = 'COST'
      setCollectAction(action)
    }
    const handleTap = () => {
      const action = this.buildCollectAction(component)
      action.type = 'TAP'
      setCollectAction(action)
    }
    return (
      <div className="collect-option">
        <div className="type essence death cost-container pointer-cursor" onClick={!ready ? () => handleCost() : null}>
          <div className="cost"></div>1
        </div>
        <div className="operator">
          <FontAwesomeIcon icon={faSlash} size="sm" rotation={90} />
        </div>
        <div className="turn-component-icon pointer-cursor" onClick={() => handleTap()}></div>
      </div>
    )
  }

  /**
   * Render the tap component choice.
   */
  renderTapComponent = handleOnClick => {
    const { status } = this.props
    const ready = status === 'READY'
    return (
      <div onClick={!ready ? handleOnClick : null}>
        <div className="collect-option">
          <div className="turn-component-icon"></div>
        </div>
      </div>
    )
  }

  /**
   * Main render function for the collect phase.
   */
  render() {
    const {
      component,
      collectActions,
      collectOnComponentActions,
      essencesOnComponent,
      onMouseOut,
      onMouseOver,
      resetCollectAction,
      status,
      ui,
    } = this.props
    // Once the collect phase is done for a player, the ui.collectAction keep tracks of player's actions until all players are
    let collectActionsRef = ui.collectActions ? ui.collectActions : collectActions
    let collectOnComponentActionsRef = ui.collectOnComponentActions
      ? ui.collectOnComponentActions
      : collectOnComponentActions

    let collectAbilities
    let collectOnComponent = this.renderCollectOnComponent(collectOnComponentActionsRef)

    let handleClickComponent = collectOnComponentActionsRef[component.id]
      ? null
      : () => this.handleCollectEssenceOnComponent()
    let handleClickEssenceOnComponent = !collectOnComponentActionsRef[component.id]
      ? null
      : () => this.handleCollectEssenceOnComponent()

    let actionValid = collectActionsRef[component.id] && collectActionsRef[component.id].valid
    let validSpecific = false

    const ready = status === 'READY'
    if (component.hasSpecificCollectAbility) {
      switch (component.id) {
        case 'automate':
          // if there is at least one type of essence on the automate
          if (essencesOnComponent && essencesOnComponent.length > 0) {
            let essenceList = []
            essencesOnComponent.forEach(essence => essenceList.push({ type: essence.type, quantity: 2 }))
            collectAbilities = collectOnComponentActionsRef[component.id]
              ? null
              : this.renderCollectAbility(essenceList, null, true)
            handleClickComponent = collectOnComponentActionsRef[component.id]
              ? null
              : () => this.handleCollectEssenceOnComponent()
            handleClickEssenceOnComponent = () => this.handleCollectEssenceOnComponent()
            actionValid = !(
              collectOnComponentActionsRef[component.id] &&
              collectOnComponentActionsRef[component.id].valid &&
              actionValid
            )
          } else {
            // else there is no essence on component and the action is valid
            validSpecific = true
          }
          // if there is no collect on component action, the "add 2 of each essence type on component" action is done server side.
          break
        case 'coffreFort':
          // if there is gold on component and there is no collect on component action
          if (
            essencesOnComponent &&
            essencesOnComponent.filter(essence => essence.type === 'gold').length > 0 &&
            !collectOnComponentActionsRef[component.id]
          ) {
            if (actionValid) {
              collectAbilities = this.renderCollectAbility(collectActionsRef[component.id].essences, () =>
                resetCollectAction(component.id)
              )
            } else {
              collectAbilities = this.renderEssencePicker(component.specificCollectAbility.essenceList)
            }
            validSpecific = collectOnComponentActionsRef[component.id]
          } else {
            // else there is no gold on component and the action is valid
            validSpecific = true
          }
          // on click to collect the essences on component, reset the collect action
          if (!collectOnComponentActionsRef[component.id]) {
            handleClickComponent = () => {
              this.handleCollectEssenceOnComponent()
              resetCollectAction(component.id)
            }
          }
          handleClickEssenceOnComponent = () => {
            this.handleCollectEssenceOnComponent()
            resetCollectAction(component.id)
          }
          break
        case 'forgeMaudite':
          if (actionValid) {
            const handleClick = !ready ? () => resetCollectAction(component.id) : null
            let essenceList = [{ type: 'death', quantity: 1 }]
            collectAbilities =
              collectActionsRef[component.id].type === 'COST'
                ? this.renderCollectAbility(essenceList, handleClick, false, true)
                : this.renderTapComponent(() => resetCollectAction(component.id))
          } else {
            collectAbilities = this.renderForgeMauditePicker()
          }
          break
        default:
          if (actionValid) {
            collectAbilities = this.renderCollectAbility(collectActionsRef[component.id].essences, () =>
              resetCollectAction(component.id)
            )
          } else if (component.specificCollectAbility.multipleCollectOptions) {
            collectAbilities = this.renderEssencePicker(component.specificCollectAbility.essenceList)
          }
      }
    } else if (component.hasStandardCollectAbility) {
      collectAbilities = this.renderCollectAbility(component.standardCollectAbility.essenceList)
    }

    const requireAction = component.hasSpecificCollectAbility
    const valid = actionValid || validSpecific
    const invalid = requireAction && !valid ? ' invalid ' : ''
    const cursorGameComponent =
      !ready && essencesOnComponent && Object.keys(essencesOnComponent).length > 0 ? ' pointer-cursor ' : ''
    const classes = invalid + cursorGameComponent
    const cursorCollectAbility = !ready && collectActionsRef[component.id] && valid ? ' delete-cursor' : ' '
    const cursorOnComponent = !ready && collectOnComponentActionsRef[component.id] ? ' delete-cursor' : ' '
    const flat = component.type === 'placeOfPower' ? ' no-min-height' : ''

    const handleOnClick = event => {
      event.stopPropagation()
      handleClickComponent && !ready && handleClickComponent()
    }

    return (
      <div className="essence-picker">
        <div className={'collect-options' + cursorCollectAbility}>{collectAbilities}</div>
        <GameComponent
          component={component}
          classes={classes}
          essencesOnComponent={essencesOnComponent}
          onClick={event => handleOnClick(event)}
          onMouseOut={() => onMouseOut()}
          onMouseOver={() => onMouseOver(component)}
        />
        <div
          className={'collect-options' + cursorOnComponent + flat}
          onClick={!ready ? handleClickEssenceOnComponent : null}
        >
          {collectOnComponent}
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    collectActions: state.game.collectActions,
    collectOnComponentActions: state.game.collectOnComponentActions,
    profile: state.firebase.profile,
    turnedComponents: state.game.turnedComponents,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    resetCollectAction: componentId => dispatch(resetCollectAction(componentId)),
    resetCollectOnComponentAction: componentId => dispatch(resetCollectOnComponentAction(componentId)),
    setCollectAction: action => dispatch(setCollectAction(action)),
    setCollectOnComponentAction: action => dispatch(setCollectOnComponentAction(action)),
    tapComponent: card => dispatch(tapComponent(card)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectComponent)
