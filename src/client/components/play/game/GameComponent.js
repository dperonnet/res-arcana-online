import React, { Component } from 'react';
import Card from '../../common/card/Card'
import { connect } from 'react-redux';

const COMPONENTS_STYLES = {
  artefact: 'card',
  back: 'card',
  mage: 'card', 
  magicItem: 'magic-item',
  monument: 'card',
  placeOfPower: 'place-of-power'
}

class GameComponent extends Component {
  
  renderEssences = () => {
    const {essencesOnComponent} = this.props
    let essences
    if(essencesOnComponent) {
      essences = Object.entries(essencesOnComponent).map((essence) => {
         return essence[1] > 0 && <div key={essence[0]} className={'essence ' + essence[0]}>{essence[1]}</div>
      })
    }
    return <div className="essence-on-component">
      {essences}
    </div>
  }

  render() {
    const {component, classes, discard, onClick, onDoubleClick, onMouseOut, onMouseOver, profile, selectedComponent, tappedComponents } = this.props
    let src = null
    if (component.class) {
      src = require('../../../assets/image/components/' + component.type + '/' + component.class + '.jpg')
    }
    const cardSize = (profile.cardSize ? profile.cardSize : ' normal ')
    const componentType = COMPONENTS_STYLES[component.type]
    const propsClasses = classes ? classes : ''
    const active = selectedComponent && selectedComponent.id === component.id ? ' active ' : ''
    const tapped = (tappedComponents && tappedComponents[component.id]) || discard ? ' tapped ' : ''
    const layout = ' vertical ';
    const essences = this.renderEssences()
    return (
      <div
        key={component.id}
        className={cardSize + layout + componentType + active + tapped + propsClasses}
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