import React, { Component } from 'react';
import Card from '../../common/card/Card'
import { connect } from 'react-redux';

const COMPONENTS_STYLES = {
  artefact: 'card',
  backArtefact: 'card',
  backMonument: 'card',
  backMage: 'card',
  mage: 'card', 
  magicItem: 'magic-item',
  monument: 'card',
  placeOfPower: 'place-of-power'
}

class GameComponent extends Component {
  
  renderEssences = () => {
    const {essencesOnComponent} = this.props
    let essences
    if (essencesOnComponent) {
      essences = essencesOnComponent.map((essence) => {
         return essence.quantity > 0 && <div key={essence.type} className={'essence ' + essence.type}>{essence.quantity}</div>
      })
    }
    return <div className="essence-on-component">
      <div className="essence-wrapper">
        {essences}
      </div>
    </div>
  }

  render() {
    const {component, classes, discard, onClick, onDoubleClick, onMouseOut, onMouseOver, profile, selectedComponent, specificName, turnedComponents } = this.props
    let src = null
    if (component.class) {
      const folder = component.type.startsWith('back') ? 'back' : component.type
      const imageName = specificName ? specificName : component.class
      src = require('../../../assets/image/components/' + folder + '/' + imageName + '.jpg')
    }
    const cardSize = (profile.cardSize ? profile.cardSize : ' normal ')
    const componentType = COMPONENTS_STYLES[component.type]
    const propsClasses = classes ? classes : ''
    const active = selectedComponent && selectedComponent.id === component.id ? ' active ' : ''
    const turned = (turnedComponents && turnedComponents[component.id]) ? ' turned ' : discard ? ' discarded' : ''
    const layout = ' vertical ';
    const essences = this.renderEssences()
    return (
      <div
        key={component.id}
        className={cardSize + layout + componentType + active + turned + propsClasses}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
      >
        {essences}
        {component.class && <Card
          classes={cardSize + layout + componentType}
          src={ src }
          show={ true } 
          alt={ component.name ? component.name : null } 
        />}
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    profile: state.firebase.profile,
    selectedComponent: state.game.selectedComponent,
  }
}

export default connect(mapStateToProps)(GameComponent)