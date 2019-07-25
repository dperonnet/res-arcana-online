import React, { Component } from 'react';
import { addToEssencePickerSelection, resetEssencePickerSelection, setEssencePickerSelection } from '../../../../store/actions/gameActions'
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

class EssencePicker extends Component {
  componentDidMount() {
    const { placement } = this.props
    if(!placement) {
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
    const { essenceNumber, essencePickerSelection, essenceList, fixedCost, placement, sumDiscount } = this.props
    let count = 0
    Object.values(essencePickerSelection).forEach((value) => count = count + value)
    console.log('essencePickerSelection',essencePickerSelection);
    let isValid = essenceNumber === count + (placement ? sumDiscount : 0)
    let picker

    // while not valid, the picker allow to add essence to the selection
    if (!isValid) {
      picker =  essenceList.map((type, index) => {
        let isLast = index === (Object.entries(essenceList).length -1)
        return <div key={type} className="collect-option">
          <div className={'essence pointer-cursor ' + type}
            onClick={() => this.handleAddEssence(type)}>
            {essencePickerSelection[type] || 0}
          </div>
          {!isLast && <div className="option-or">
            <FontAwesomeIcon icon={faPlus} size="sm" rotation={90} />
          </div>}
        </div>
      })
    } else {
      // renderedCount is used to fade the last Plus icon
      let renderedCount = 0
      let essenceListRef = !!fixedCost ? fixedCost : essenceList
      picker = essenceListRef.map((essence, index) => {
        let isLast =  index === essenceListRef.length -1
        renderedCount = essencePickerSelection[essence] ? renderedCount + 1 : renderedCount
        let lastToRender = renderedCount === Object.keys(essencePickerSelection).length ? ' fade-option' : ''
        let fade = !essencePickerSelection[essence] ? ' fade-option' : ''
        return <div key={essence} className={'collect-option ' + fade} onClick={() => !fixedCost ? this.handleReset() : null}>
          <div className={'type essence ' + essence}>{essencePickerSelection[essence] || 0}</div>
          {!isLast && <div className={'option-and ' + lastToRender}>
            <FontAwesomeIcon icon={faPlus} size="sm" />
          </div>}
        </div>
      })
    }

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
