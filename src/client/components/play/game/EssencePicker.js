import React, { Component } from 'react';
import { addToEssencePickerSelection, resetEssencePickerSelection, setEssencePickerSelection } from '../../../../store/actions/gameActions'
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

class EssencePicker extends Component {
  componentDidMount() {
    const { asCost } = this.props
    if(!asCost) {
      this.props.resetEssencePickerSelection()
    }
  }

  handleAddEssence = (essenceType) => {
    const { addToEssencePickerSelection, asCost, essencesPool, essencePickerSelection, setEssencePickerSelection } = this.props
    const currentQtty = essencePickerSelection[essenceType] ? essencePickerSelection[essenceType] : 0
    if (!asCost || essencesPool[essenceType] > currentQtty) {
      addToEssencePickerSelection(essenceType)
    } else {
      let selection = copy(essencePickerSelection)
      selection[essenceType] = 0
      setEssencePickerSelection(selection)
    }
  }

  handleReset = () => {
    const { defaultSelection, resetEssencePickerSelection, setEssencePickerSelection } = this.props
    if (defaultSelection) {
      setEssencePickerSelection(defaultSelection)
    } else {
      resetEssencePickerSelection()
    }
  }

  renderEssencePicker = () => {
    const { essenceListType, essenceNumber, essencePickerSelection, enabledEssencesList, asCost, sumDiscount, validCost, lock } = this.props
    let count = 0
    Object.values(essencePickerSelection).forEach((value) => count = count + value)
    let isValid = asCost ? validCost : essenceNumber === count + (asCost ? sumDiscount : 0)
    let picker

    const essenceList = ['elan', 'life', 'calm', 'death', 'gold']
    switch (essenceListType) {
      case 'anyButGold':
        essenceList.pop()
        break
      case 'anyButDeathGold':
        essenceList.pop()
        essenceList.pop()
        break
      default:
    }

    let handleOnClick
    // when valid, the picker allow to reset the selection
    if (isValid) {
      handleOnClick = () => this.handleReset()
    // when not valid, the picker allow to add essence to the selection
    } else {
      handleOnClick = (type) => this.handleAddEssence(type)
    }
    
    // renderedCount is used to fade the last Plus icon
    let hidePlus
    let renderedCount = 0
    let enabledEssences = !!enabledEssencesList ? enabledEssencesList : essenceList
    picker = essenceList.map((type, index) => {
      let enabled = enabledEssences && enabledEssences.includes(type)
      let fade = (isValid && !essencePickerSelection[type]) || !enabled ? ' fade-option' : ''
      let pointer = !lock && enabled ? isValid ? ' delete-cursor' : ' pointer-cursor' : ''
      let isLast =  index === essenceList.length -1
      let pointerLock = lock ? ' not-allowed-cursor' : ''

      if (isValid) {
        renderedCount = essencePickerSelection[type] ? renderedCount + 1 : renderedCount
        let refListLength = Object.values(essencePickerSelection).filter((value) => value > 0).length
        hidePlus = enabled && !fade && renderedCount === refListLength ? ' fade-option' : ''
      } else {
        if (index < essenceList.length - 1) {
          let nextEssenceInList = essenceList[index+1]
          hidePlus = enabled && !fade && !enabledEssences.includes(nextEssenceInList) ? ' fade-option' : ''
        }
      }
      
      return <div key={type} className={'collect-option ' + fade + pointerLock} onClick={ () => isValid && !lock ? handleOnClick(type) : null}>
          <div className={'essence ' + type + pointer} onClick={ () => !isValid && enabled && !lock ? handleOnClick(type) : null}>
          {essencePickerSelection[type] || 0}
        </div>
        {!isLast && <div className={'operator ' + hidePlus}>
          <FontAwesomeIcon icon={faPlus} size="sm" />
        </div>}
      </div>
    })
    
    return <div className={isValid ? ' delete-cursor' : ' '}>
      {picker}
    </div>
  }

  render() {
    return <div className="essence-picker">
      <div className={'collect-options'}>
        {this.renderEssencePicker()}
      </div>
    </div>
  }
}

const mapStateToProps = (state) => {
  return {
    essencePickerSelection: state.game.essencePickerSelection,
    selectedComponent: state.game.selectedComponent
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addToEssencePickerSelection: (essenceType) => dispatch(addToEssencePickerSelection(essenceType)),
    resetEssencePickerSelection: () => dispatch(resetEssencePickerSelection()),
    setEssencePickerSelection: (selection) => dispatch(setEssencePickerSelection(selection)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EssencePicker)

function copy(value){
  return JSON.parse(JSON.stringify(value))
}
