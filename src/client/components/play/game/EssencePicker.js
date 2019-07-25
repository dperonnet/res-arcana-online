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
    this.props.addToEssencePickerSelection(essenceType)
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
    const { essenceListType, essenceNumber, essencePickerSelection, enabledEssencesList, asCost, sumDiscount, validCost } = this.props
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
      let pointer = enabled ? isValid ? ' delete-cursor' : ' pointer-cursor' : ''
      let isLast =  index === essenceList.length -1

      if (isValid) {
        renderedCount = essencePickerSelection[type] ? renderedCount + 1 : renderedCount
        let refListLength = Object.values(essencePickerSelection).filter((value) => value > 0).length
        hidePlus = enabled && !fade && renderedCount === refListLength ? ' fade-option' : ''
      } else {
        if (index < essenceList.length - 1) {
          let nextEssenceInList = essenceList[index+1]
          console.log('index:',index,',nextEssenceInList',nextEssenceInList);
          hidePlus = enabled && !fade && !enabledEssences.includes(nextEssenceInList) ? ' fade-option' : ''
        }
      }
      
      return <div key={type} className={'collect-option ' + fade} onClick={ () => enabled ? handleOnClick(type) : null}>
          <div className={'essence ' + type + pointer}>{essencePickerSelection[type] || 0}
        </div>
        {!isLast && <div className={'option-and ' + hidePlus}>
          <FontAwesomeIcon icon={faPlus} size="sm" />
        </div>}
      </div>
    })
    
    return <div className={isValid ? ' delete-cursor' : ' '}>
      {picker}
      <div>## isValid ? {isValid ? 'true': 'false'}</div>
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
