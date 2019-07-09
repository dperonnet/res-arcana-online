import React, { Component } from 'react';
import { Button } from 'react-bootstrap'
import { addToEssencePickerSelection, resetEssencePickerSelection } from '../../../../store/actions/gameActions'
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

class EssencePicker extends Component {
  componentDidMount() {
    this.props.resetEssencePickerSelection()
  }

  handleAddEssence = (essenceType) => {
    this.props.addToEssencePickerSelection(essenceType)
  }

  handleReset = () => {
    this.props.resetEssencePickerSelection()
  }

  renderEssencePicker = () => {
    const { essenceNumber, essencePickerSelection, essencePickerType } = this.props
    let count = 0
    Object.values(essencePickerSelection).forEach((value) => count = count + value)
    let isValid = essenceNumber === count
    let picker
    const essenceList = ['elan', 'life', 'calm', 'death', 'gold']
    switch (essencePickerType) {
      case 'anyButGold':
        essenceList.pop()
        break
      case 'anyButDeathGold':
        essenceList.pop()
        essenceList.pop()
        break
      default:
    }
    
    if (!isValid) {
      picker =  essenceList.map((type, index) => {
        let isLast = index === (Object.entries(essenceList).length -1)
        return <div key={type} className="collect-option">
          <Button variant="secondary" className={'essence ' + type}
            onClick={() => this.handleAddEssence(type)}>
            {essencePickerSelection[type] || 0}
          </Button>
          {!isLast && <div className="option-or">
            <FontAwesomeIcon icon={faPlus} size="sm" rotation={90} />
          </div>}
        </div>
      })
    } else {
      // renderedCount is used to fade the last Plus icon
      let renderedCount = 0
      picker = essenceList.map((essence, index) => {
        let isLast =  index === essenceList.length -1
        renderedCount = essencePickerSelection[essence] ? renderedCount + 1 : renderedCount
        let lastToRender = renderedCount === Object.keys(essencePickerSelection).length ? ' fade-option' : ''
        let fade = !essencePickerSelection[essence] ? ' fade-option' : ''
        return <div key={essence} className={'collect-option ' + fade} onClick={() => this.handleReset()}>
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
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addToEssencePickerSelection: (essenceType) => dispatch(addToEssencePickerSelection(essenceType)),
    resetEssencePickerSelection: () => dispatch(resetEssencePickerSelection()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EssencePicker)