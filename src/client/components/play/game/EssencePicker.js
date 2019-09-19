import React, { Component } from 'react';
import { addToEssencePickerSelection, resetEssencePickerSelection, setEssencePickerSelection } from '../../../../store/actions/gameActions'
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

class EssencePicker extends Component {
  componentDidMount() {
    const { asCost, selectionType } = this.props
    if(!asCost) {
      this.props.resetSelection(selectionType)
    }
  }

  handleAddEssence = (essenceType) => {
    const { addToSelection, asCost, defaultSelection, essencesPool, essencePickerSelection, setSelection, selectionType } = this.props
    let selection = essencePickerSelection[selectionType]
    const currentQtty = selection[essenceType] ? selection[essenceType] : 0
    if (!asCost || essencesPool[essenceType] > currentQtty) {
      addToSelection(selectionType, essenceType)
    } else {
      let newSelection = copy(selection)
      newSelection[essenceType] = (defaultSelection && defaultSelection[essenceType]) || 0
      setSelection(selectionType, newSelection)
    }
  }

  handleReset = () => {
    const { defaultSelection, resetSelection, setSelection, selectionType } = this.props
    if (defaultSelection) {
      setSelection(selectionType, defaultSelection)
    } else {
      resetSelection(selectionType)
    }
  }

  renderEssencePicker = () => {
    const { pickerType, selectionType, essencePickerSelection, pickQuantity, enabledEssencesList, asCost, sumDiscount, validCost, lock } = this.props
    let selection = essencePickerSelection[selectionType]
    let count = 0

    Object.values(selection).forEach((value) => count = count + value)
    let isValid = asCost ? validCost : pickQuantity === count + (asCost ? sumDiscount : 0)

    let essenceList
    switch (pickerType) {
      case 'any-but-gold':
        essenceList = ['elan', 'life', 'calm', 'death']
        break
      case 'any-but-death-gold':
        essenceList = ['elan', 'life', 'calm']
        break
      case 'any-but-life-gold':
        essenceList = ['elan', 'calm', 'death']
        break
      default:
        essenceList = ['elan', 'life', 'calm', 'death', 'gold']
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
    
    let picker = essenceList.map((type, index) => {
      let enabled = enabledEssences && enabledEssences.includes(type)
      let fade = (isValid && !selection[type]) || !enabled ? ' fade-option' : ''
      let pointer = !lock && enabled ? isValid ? ' delete-cursor' : ' pointer-cursor' : ''
      let isLast =  index === essenceList.length -1
      let pointerLock = lock ? ' not-allowed-cursor' : ''

      if (isValid) {
        renderedCount = selection[type] ? renderedCount + 1 : renderedCount
        let refListLength = Object.values(selection).filter((value) => value > 0).length
        hidePlus = enabled && !fade && renderedCount === refListLength ? ' fade-option' : ''
      } else {
        if (index < essenceList.length - 1) {
          let nextEssenceInList = essenceList[index+1]
          hidePlus = enabled && !fade && !enabledEssences.includes(nextEssenceInList) ? ' fade-option' : ''
        }
      }
      
      return <div key={type} className={'collect-option ' + fade + pointerLock} onClick={ () => isValid && !lock ? handleOnClick(type) : null}>
          <div className={'essence ' + type + pointer} onClick={ () => !isValid && enabled && !lock ? handleOnClick(type) : null}>
          {selection[type] || 0}
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
    addToSelection: (selectionType, essenceType) => dispatch(addToEssencePickerSelection(selectionType, essenceType)),
    resetSelection: (selectionType) => dispatch(resetEssencePickerSelection(selectionType)),
    setSelection: (selectionType, selection) => dispatch(setEssencePickerSelection(selectionType, selection)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EssencePicker)

function copy(value){
  return JSON.parse(JSON.stringify(value))
}
