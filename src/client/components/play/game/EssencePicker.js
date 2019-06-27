import React, { Component } from 'react';
import { Button } from 'react-bootstrap'
import { resetCollectAction, resetCollectOnComponentAction, setCollectAction, setCollectOnComponentAction, tapComponent } from '../../../../store/actions/gameActions'
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSlash, faUndoAlt } from '@fortawesome/free-solid-svg-icons';
import GameComponent from './GameComponent'

class EssencePicker extends Component {
  
  buildCollectAction = (component, essenceList, from = 'COLLECT_ABILITY', collectType = 'GAIN', valid = true) => {
    return {
      id: component.id,
      name: component.name,
      essences: essenceList,
      from: from,
      collectType: collectType,
      valid: valid
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
        const action = this.buildCollectAction(component, essenceList, 'ON_COMPONENT')
        setCollectOnComponentAction(action)
      } else {
        resetCollectOnComponentAction(component.id)
      }
    }
  }

  renderCollectAbility = (essenceList, handleOnClick) => {
    return Object.entries(essenceList).map((essence, index) => {
      let isLast =  index === Object.entries(essenceList).length -1
      return <div key={essence[0]} className="collect-option" onClick={handleOnClick}>
        {index === 0 && <div className="collect-icon"></div>}
        <div className={'type essence ' + essence[0]}>{essence[1]}</div>
        {!isLast && <div className="option-and">
          <FontAwesomeIcon icon={faPlus} size="sm" />
        </div>}
      </div>
    })
  }

  renderEssencePicker = () => {
    const { component, collectActions } = this.props
    let typeIsAny = Object.keys(component.standardCollectAbility.essenceList).filter((type)=>{
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
      return Object.entries(component.standardCollectAbility.essenceList).map((essence, index) => {
        let isLast =  index === Object.entries(component.standardCollectAbility.essenceList).length -1
        return <div key={essence[0]} className="collect-option">
          <Button variant="secondary" className={'essence ' + essence[0]} onClick={() => this.handleSelectOption(essence[0])}>{essence[1]}</Button>
          {!isLast && <div className="option-or">
            <FontAwesomeIcon icon={faSlash} size="sm" rotation={90} />
          </div>}
        </div>
      })
    }
  }

  renderCollectOnComponent = () => {
    const { component, collectOnComponentActions, essencesOnComponent } = this.props
    if (essencesOnComponent || collectOnComponentActions[component.id]) {
      const essences = collectOnComponentActions[component.id] ? collectOnComponentActions[component.id].essences : null
      return essences ?
        Object.entries(essences).map((essence, index) => {
          let isLast =  index === Object.entries(essences).length -1
          return <div key={essence[0]} className="collect-option">
          {index === 0 && <div className="collect-icon"></div>}
          <div className={'type essence ' + essence[0]}>{essence[1]}</div>
          {!isLast && <div className="option-and">
            <FontAwesomeIcon icon={faPlus} size="sm" />
          </div>}
        </div>
        })
      : 
        <div className="collect-option">
          <div className="collect-icon"></div>
          <div className="on-component-icon"></div>
        </div>
    } else {
      return null
    }
  }

  renderAutomateCollectAbility = () => {
    return <div className="collect-option">
      <Button variant="secondary" className="collect-icon" onClick={null}></Button>
      <div className="option-or">
        <FontAwesomeIcon icon={faSlash} size="sm" rotation={90} />
      </div>
      <Button variant="secondary" className="on-component-icon" onClick={null}></Button>
    </div>
  }

  render() {
    const { component, collectActions, collectOnComponentActions, essencesOnComponent, resetCollectAction } = this.props
    let collectAbilities
    let collectOnComponent
    let actionValid = Object.keys(collectActions).includes(component.id)
    if (actionValid && collectActions[component.id].valid) {
      collectAbilities = this.renderCollectAbility(collectActions[component.id].essences , () => resetCollectAction(component.id))
      collectOnComponent = this.renderCollectOnComponent()
    } else if (component.hasStandardCollectAbility) {
      if (component.standardCollectAbility.multipleCollectOptions) {
        collectAbilities = this.renderEssencePicker()
      } else {
        collectAbilities = this.renderCollectAbility(component.standardCollectAbility.essenceList)
      }
      collectOnComponent = this.renderCollectOnComponent()
    } else if (component.hasSpecificCollectAbility) {
      switch (component.id) {
        case 'automate':
          if (essencesOnComponent && essencesOnComponent.length > 0) {
            collectAbilities = this.renderAutomateCollectAbility()
            collectOnComponent = this.renderCollectOnComponent()
          }
          break
        case 'coffreFort':
          if (essencesOnComponent && essencesOnComponent['gold'] > 0) {
            
          }
          collectOnComponent = collectOnComponentActions[component.id] ? null : this.renderCollectOnComponent()
          break
        case 'forgeMaudite':
          collectOnComponent = this.renderCollectOnComponent()
          break
        default:
      }
    }
    

    const requireAction = ((component.hasStandardCollectAbility && component.standardCollectAbility.multipleCollectOptions)
      || component.hasSpecificCollectAbility)
      const valid = Object.keys(collectActions).includes(component.id) && collectActions[component.id].valid
      const classes = requireAction && !valid ? ' active ' : ''
    const cursorCollectAbility = collectActions[component.id] ? ' delete-cursor' : ' '
    const cursorOnComponent = collectOnComponentActions[component.id] ? ' delete-cursor' : ' pointer-cursor'
    const onClickEvent = collectOnComponentActions[component.id] ? null : (() => this.handleCollectEssenceOnComponent())

    return <div className="essence-picker">
      <div className={'collect-options '+ cursorCollectAbility}>
        {collectAbilities}
      </div>
      <GameComponent component={component} classes={classes} essencesOnComponent={essencesOnComponent} onClick={onClickEvent}/>
      <div className={'collect-options '+ cursorOnComponent} onClick={() => this.handleCollectEssenceOnComponent()}>
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
    selectedCard: state.game.selectedCard,
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

export default connect(mapStateToProps, mapDispatchToProps)(EssencePicker)