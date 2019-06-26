import React, { Component } from 'react';
import Card from '../../common/card/Card'
import { clearZoom, selectCard, tapComponent, zoomCard } from '../../../../store/actions/gameActions'
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
  
  /**
   * Define the component to zoom on mouse over.
   */
  handleMouseOver = (component) => {
    if (component.type !== 'back')
    this.props.zoomCard(component)
  }

  /**
   * Hide the card to zoom on mouse out.
   */
  handleMouseOut = () => {
    this.props.clearZoom()
  }

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
    const {component, classes, discard, onClick, onDoubleClick, profile, selectedCard, tappedComponents } = this.props
    let src = null
    if (component.class) {
      src = require('../../../assets/image/components/' + component.type + '/' + component.class + '.png')
    }
    const cardSize = (profile.cardSize ? profile.cardSize : ' normal ')
    const componentType = COMPONENTS_STYLES[component.type]
    const propsClasses = classes ? classes : ''
    const active = selectedCard && selectedCard.id === component.id ? ' active ' : ''
    const tapped = (tappedComponents.indexOf(component.id) >= 0) || discard ? ' tapped ' : ''
    const layout = ' vertical ';
    const essences = this.renderEssences()
    return (
      <div
        key={component.id}
        className={cardSize + layout + componentType + active + tapped + propsClasses}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onMouseOver={() => this.handleMouseOver(component)}
        onMouseOut={() => this.handleMouseOut()}
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
    selectedCard: state.game.selectedCard,
    tappedComponents: state.game.tappedComponents,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    clearZoom: () => dispatch(clearZoom()),
    selectCard: (card) => dispatch(selectCard(card)),
    tapComponent: (card) => dispatch(tapComponent(card)),
    zoomCard: (card) => dispatch(zoomCard(card)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GameComponent)