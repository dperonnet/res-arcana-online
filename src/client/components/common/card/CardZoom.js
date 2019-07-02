import React from 'react';
import PropTypes from 'prop-types';
import './card.scss';

class CardZoom extends React.Component {

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
    const { alt, src, essencesOnComponent } = this.props;
    const essences = essencesOnComponent ? this.renderEssences() : null
    return src && <>
      <div className='card-zoomed'>
        <span className='card-name'>{alt}</span>
        <img src={src} alt={alt} />
      </div>
      {essences}
    </>
  }
}

CardZoom.displayName = 'CardZoom';
CardZoom.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string
};

export default CardZoom;
