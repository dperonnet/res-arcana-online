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

  render() {
    const {component, discard, onClick, onDoubleClick, profile, selectedCard, tappedComponents } = this.props
    const src = require('../../../assets/image/components/' + component.type + '/' + component.class + '.png')
    const cardSize = (profile.cardSize ? profile.cardSize : ' normal ')
    const componentType = COMPONENTS_STYLES[component.type]
    const active = selectedCard && selectedCard.id === component.id ? ' active ' : ''
    const tapped = (tappedComponents.indexOf(component.id) >= 0) || discard ? ' tapped ' : ''
    const layout = ' vertical ';
    return (
      <div
        key={component.id}
        className={cardSize + layout + componentType + active + tapped}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onMouseOver={() => this.handleMouseOver(component)}
        onMouseOut={() => this.handleMouseOut()}
      >
        <Card
          classes={cardSize + layout + componentType}
          src={ src }
          show={ true } 
          alt={ component.name ? component.name : null } 
        />
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