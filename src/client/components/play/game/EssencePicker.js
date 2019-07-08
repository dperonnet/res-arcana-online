import React, { Component } from 'react';
import { Button } from 'react-bootstrap'
import { addToEssencePickerSelection, resetEssencePickerSelection } from '../../../../store/actions/gameActions'
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

class EssencePicker extends Component {
  componentDidMount() {
    console.log('componentDidMount');
    this.props.resetEssencePickerSelection()
  }

  handleAddEssence = (essenceType) => {
    console.log('handleAddEssence',essenceType);
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
      return essenceList.map((type, index) => {
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
      console.log('essencePickerSelection',essencePickerSelection);
      return essenceList.map((essence, index) => {
        console.log('essence',essence);
        console.log('index',index);
        let isLast =  index === Object.entries(essenceList).length -1
        return <div key={essence} className="collect-option" onClick={() => this.handleReset()}>
          <div className={'type essence ' + essence}>{essencePickerSelection[essence] || 0}</div>
          {!isLast && <div className="option-and">
            <FontAwesomeIcon icon={faPlus} size="sm" />
          </div>}
        </div>
      })
    }
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