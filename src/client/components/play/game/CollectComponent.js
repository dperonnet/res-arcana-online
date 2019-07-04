import React, { Component } from 'react';
import { Button } from 'react-bootstrap'
import { resetCollectAction, resetCollectOnComponentAction, setCollectAction, setCollectOnComponentAction, tapComponent } from '../../../../store/actions/gameActions'
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSlash } from '@fortawesome/free-solid-svg-icons';
import GameComponent from './GameComponent'

class CollectComponent extends Component {
  
  buildCollectAction = (component, essenceList = {}) => {
    return {
      id: component.id,
      name: component.name,
      essences: essenceList,
      from: 'COLLECT_ABILITY',
      type: 'GAIN',
      valid: true
    }
  }
  
  handleSelectOption = (type) => {
    const { component } = this.props
    let essenceList = {}
    essenceList[type] = component.standardCollectAbility.essenceList[type]
    const action = this.buildCollectAction(component, essenceList)
    this.props.setCollectAction(action)
  }

  handleAddTypeToOption = (type) => {
    const { component, collectActions } = this.props
    const collectAction = collectActions[component.id]
    let essenceList = {}
    essenceList[type] = 0
    const action =  collectAction ? collectAction: this.buildCollectAction(component, essenceList)
    action.essences[type] = action.essences[type] ? action.essences[type] + 1 : 1
    let count = 0
    Object.values(action.essences).forEach((value) => count = count + value)
    action.valid = Object.values(component.standardCollectAbility.essenceList)[0] === count
    this.props.setCollectAction(action)
  }

  handleCollectEssenceOnComponent = () => {
    const { component, collectOnComponentActions, essencesOnComponent, setCollectOnComponentAction, resetCollectOnComponentAction } = this.props
    if (essencesOnComponent || collectOnComponentActions[component.id]) {
      if (!collectOnComponentActions[component.id]) {
        let essenceList = essencesOnComponent
        const action = this.buildCollectAction(component, essenceList)
        action.from = 'ON_COMPONENT'
        setCollectOnComponentAction(action)
      } else {
        resetCollectOnComponentAction(component.id)
      }
    }
  }

  renderCollectAbility = (essenceList, handleOnClick, onComponent, cost) => {
    const { status } = this.props
    const ready = status === 'READY'
    let essences = Object.entries(essenceList).map((essence, index) => {
      let isLast =  index === Object.entries(essenceList).length -1
      return <div key={essence[0]} className="collect-option" onClick={!ready ? handleOnClick : null}>
        {cost ?
            <div className={'type essence ' + essence[0] + ' cost-container'}><div className="cost"></div>{essence[1]}</div>
          :
            <div className={'type essence ' + essence[0]}>{essence[1]}</div>
        }
        {!isLast && <div className="option-and">
          <FontAwesomeIcon icon={faPlus} size="sm" />
        </div>}
      </div>
    })
    return <>
      {essences}
      {onComponent && <div className="on-component-icon"></div>}
    </>
  }

  renderCollectOnComponent = (collectOnComponentActionsRef) => {
    const { component, essencesOnComponent } = this.props
    if (essencesOnComponent || collectOnComponentActionsRef[component.id]) {
      const essences = collectOnComponentActionsRef[component.id] ? collectOnComponentActionsRef[component.id].essences : null
      return essences &&
        Object.entries(essences).map((essence, index) => {
          let isLast =  index === Object.entries(essences).length -1
          return <div key={essence[0]} className="collect-option">
          <div className={'type essence ' + essence[0]}>{essence[1]}</div>
          {!isLast && <div className="option-and">
            <FontAwesomeIcon icon={faPlus} size="sm" />
          </div>}
        </div>
        })
    } else {
      return null
    }
  }

  renderEssencePicker = (essenceList) => {
    const { component, collectActions } = this.props
    let typeIsAny = Object.keys(essenceList).filter((type)=>{
      return type.startsWith('any')
    })

    // When the collect ability is type 'any', display add buttons for all type allowed.
    if (typeIsAny.length > 0) {
      const essenceList = ['elan', 'life', 'calm', 'death', 'gold']
      switch (typeIsAny[0]) {
        case 'anyButGold':
          essenceList.pop()
          break
        case 'anyButDeathGold':
          essenceList.pop()
          essenceList.pop()
          break
        default:
      }
      let selection = collectActions && collectActions[component.id] && collectActions[component.id].essences
      return essenceList.map((type, index) => {
        let isLast = index === (Object.entries(essenceList).length -1)
        return <div key={type} className="collect-option">
          <Button variant="secondary" className={'essence ' + type} 
            onClick={() => this.handleAddTypeToOption(type)}>
            {(selection && selection[type]) || 0}
          </Button>
          {!isLast && <div className="option-or">
            <FontAwesomeIcon icon={faPlus} size="sm" rotation={90} />
          </div>}
        </div>
      })

    } else {
      // else display selection buttons for each possible collect option
      return Object.entries(essenceList).map((essence, index) => {
        let isLast =  index === Object.entries(essenceList).length -1
        return <div key={essence[0]} className="collect-option">
          <Button variant="secondary" className={'essence ' + essence[0]} onClick={() => this.handleSelectOption(essence[0])}>{essence[1]}</Button>
          {!isLast && <div className="option-or">
            <FontAwesomeIcon icon={faSlash} size="sm" rotation={90} />
          </div>}
        </div>
      })
    }
  }

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
    return <div className="collect-option">
      <Button variant="secondary" className="type essence death cost-container" onClick={!ready ? () => handleCost() : null}><div className="cost"></div>1</Button>
      <div className="option-or">
        <FontAwesomeIcon icon={faSlash} size="sm" rotation={90} />
      </div>
      <div className="tap-component-icon pointer-cursor" onClick={() => handleTap()}></div>
    </div>
  }

  renderTapComponent = (handleOnClick) => {
    const { status } = this.props
    const ready = status === 'READY'
    return <div className="collect-option" onClick={!ready ? handleOnClick : null}>
      <div className="tap-component-icon"></div>
    </div>
  }

  render() {
    const { component, collectActions, collectOnComponentActions, essencesOnComponent, onMouseOut, onMouseOver, resetCollectAction, status, ui } = this.props
    // Once the collect phase is done for a player, the ui.collectAction keep tracks of player's actions until all players are
    let collectActionsRef = ui.collectActions ? ui.collectActions : collectActions
    let collectOnComponentActionsRef = ui.collectOnComponentActions ? ui.collectOnComponentActions : collectOnComponentActions
    
    let collectAbilities
    let collectOnComponent = this.renderCollectOnComponent(collectOnComponentActionsRef)
    
    let handleClickComponent = collectOnComponentActionsRef[component.id] ? null : (() => this.handleCollectEssenceOnComponent())
    let handleClickEssenceOnComponent = !collectOnComponentActionsRef[component.id] ? null :  (() => this.handleCollectEssenceOnComponent())

    let actionValid = Object.keys(collectActionsRef).includes(component.id)
    const componentsWithSpecificAction = ['coffreFort','forgeMaudite']
    let validSpecific = false

    const ready = status === 'READY'

    if (component.hasSpecificCollectAbility) {
      switch (component.id) {
        case 'automate':
          if (essencesOnComponent && Object.keys(essencesOnComponent).length > 0) {
            let essenceList = {}
            Object.keys(essencesOnComponent).forEach((type) => essenceList[type] = 2)

            collectAbilities = collectOnComponentActionsRef[component.id] ? null : this.renderCollectAbility(essenceList, null, true)
            handleClickComponent = collectOnComponentActionsRef[component.id] ? null : (() => this.handleCollectEssenceOnComponent())
            handleClickEssenceOnComponent = (() => this.handleCollectEssenceOnComponent())
          }
          break
        case 'coffreFort':
          if (essencesOnComponent && essencesOnComponent['gold'] > 0 && !collectOnComponentActionsRef[component.id]) {
            if (actionValid && collectActionsRef[component.id].valid) {
              collectAbilities = this.renderCollectAbility(collectActionsRef[component.id].essences , () => resetCollectAction(component.id))
            } else {
              collectAbilities = this.renderEssencePicker(component.standardCollectAbility.essenceList)
            }
            validSpecific = collectOnComponentActionsRef[component.id]
          } else {
            validSpecific = true
          }
          handleClickComponent = collectOnComponentActionsRef[component.id] ? null : (() => {
            this.handleCollectEssenceOnComponent()
            resetCollectAction(component.id)
          })
          handleClickEssenceOnComponent = (() => {
            this.handleCollectEssenceOnComponent()
            resetCollectAction(component.id)
          })
          break
        case 'forgeMaudite':
          if (actionValid && collectActionsRef[component.id].valid) {
            const handleClick = !ready ? () => resetCollectAction(component.id) : null
            collectAbilities = collectActionsRef[component.id].type === 'COST' ? 
                this.renderCollectAbility(collectActionsRef[component.id].essences , handleClick, false, true)
              :
                this.renderTapComponent(() => resetCollectAction(component.id))
          } else {
            collectAbilities = this.renderForgeMauditePicker()
          }
          break
        default:
      }
    } else if (component.hasStandardCollectAbility) {
      if (actionValid && collectActionsRef[component.id].valid) {
        collectAbilities = this.renderCollectAbility(collectActionsRef[component.id].essences , () => resetCollectAction(component.id))
      } else if (component.standardCollectAbility.multipleCollectOptions) {
        collectAbilities = this.renderEssencePicker(component.standardCollectAbility.essenceList)
      } else {
        collectAbilities = this.renderCollectAbility(component.standardCollectAbility.essenceList)
      }
    }

    const requireAction = ((component.hasStandardCollectAbility && component.standardCollectAbility.multipleCollectOptions)
      || componentsWithSpecificAction.includes(component.id))
    const valid = (collectActionsRef[component.id] && collectActionsRef[component.id].valid) || validSpecific
    const active = requireAction && !valid ? ' active ' : ''
    const cursorGameComponent = !ready && essencesOnComponent && Object.keys(essencesOnComponent).length > 0 ? ' pointer-cursor ' : ''
    const classes = active + cursorGameComponent
    const cursorCollectAbility = !ready && collectActionsRef[component.id] ? ' delete-cursor' : ' '
    const cursorOnComponent = !ready && collectOnComponentActionsRef[component.id] ? ' delete-cursor' : ' '

    const handleOnClick = (event) => {
      event.stopPropagation(); 
      handleClickComponent && !ready && handleClickComponent()
    }

    return <div className="essence-picker">
      <div className={'collect-options '+ cursorCollectAbility}>
        {collectAbilities}
      </div>
      <GameComponent 
        component={component}
        classes={classes}
        essencesOnComponent={essencesOnComponent}
        onClick={(event) => handleOnClick(event)}
        onMouseOut={() => onMouseOut()}
        onMouseOver={() => onMouseOver(component)}
      />
      <div className={'collect-options '+ cursorOnComponent} onClick={!ready ? handleClickEssenceOnComponent : null}>
        {collectOnComponent}
      </div>
    </div>
  }
}

const mapStateToProps = (state) => {
  return {
    collectActions: state.game.collectActions,
    collectOnComponentActions: state.game.collectOnComponentActions,
    profile: state.firebase.profile,
    tappedComponents: state.game.tappedComponents,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    resetCollectAction: (componentId) => dispatch(resetCollectAction(componentId)),
    resetCollectOnComponentAction: (componentId) => dispatch(resetCollectOnComponentAction(componentId)),
    setCollectAction: (action) => dispatch(setCollectAction(action)),
    setCollectOnComponentAction: (action) => dispatch(setCollectOnComponentAction(action)),
    tapComponent: (card) => dispatch(tapComponent(card)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CollectComponent)