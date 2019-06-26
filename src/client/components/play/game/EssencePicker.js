import React, { Component } from 'react';
import { Button } from 'react-bootstrap'
import { resetCollectAction, setCollectAction, tapComponent } from '../../../../store/actions/gameActions'
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSlash, faUndoAlt } from '@fortawesome/free-solid-svg-icons';

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
    console.log('add',type)
    const { component, collectActions } = this.props
    const collectAction = collectActions[component.id]
    let essenceList = {}
    essenceList[type] = 0
    const action =  collectAction ? collectAction: this.buildCollectAction(component, essenceList)
    action.essences[type] = action.essences[type] ? action.essences[type]++ : 1
    let count = 0
    Object.values(action.essences).forEach((value) => count = count + value)
    action.valid = Object.values(component.standardCollectAbility.essenceList)[0] === count
    console.log('action',action)
    this.props.setCollectAction(action)
  }

  renderSelectedEssences = () => {
    const { component, collectActions, resetCollectAction } = this.props
    return Object.entries(collectActions[component.id].essences).map((essence, index) => {
      let isLast = index === Object.entries(collectActions[component.id].essences).length -1
      return <div key={essence[0]} className="collect-option">
        {index === 0 && <div className="collect-icon"></div>}
        <div className={'type essence ' + essence[0]}>{essence[1]}</div>
        {!isLast && <div className="option-and">
          <FontAwesomeIcon icon={faPlus} size="sm" />
        </div>}
        {isLast && <div className="option-reset" onClick={() => resetCollectAction(component.id)}>
          <FontAwesomeIcon icon={faUndoAlt} size="1x" />
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
      console.log('selection',selection)
      return essenceList.map((type, index) => {
        let isLast = index === (Object.entries(essenceList).length -1)
        return <div key={type} className="collect-option">
          <Button variant="secondary" className={'essence ' + type} 
            onClick={() => this.handleAddTypeToOption(type)}>
            {selection && selection[type] || 0}
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

  render() {
    const { component, collectActions } = this.props
    let essences
    let actionValid = Object.keys(collectActions).includes(component.id)
    if (actionValid && collectActions[component.id].valid) {
      essences = this.renderSelectedEssences()
    } else if (component.hasStandardCollectAbility) {
      if (component.standardCollectAbility.multipleCollectOptions) {
        essences = this.renderEssencePicker()
      } else {
        essences = Object.entries(component.standardCollectAbility.essenceList).map((essence, index) => {
          let isLast =  index === Object.entries(component.standardCollectAbility.essenceList).length -1
          return <div key={essence[0]} className="collect-option">
            {index === 0 && <div className="collect-icon"></div>}
            <div className={'type essence ' + essence[0]}>{essence[1]}</div>
            {!isLast && <div className="option-and">
              <FontAwesomeIcon icon={faPlus} size="sm" />
            </div>}
          </div>
        })
        // Render essences à collecter
      }
    }

    return <div className="collect-options">
      {essences}
    </div>
  }
}

const mapStateToProps = (state) => {
  return {
    collectActions: state.game.collectActions,
    profile: state.firebase.profile,
    selectedCard: state.game.selectedCard,
    tappedComponents: state.game.tappedComponents,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    resetCollectAction: (componentId) => dispatch(resetCollectAction(componentId)),
    setCollectAction: (action) => dispatch(setCollectAction(action)),
    tapComponent: (card) => dispatch(tapComponent(card)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EssencePicker)