import React from 'react';
import PropTypes from 'prop-types';
import './card.css';

class CardZoom extends React.Component {

  render() {
    const { alt, show, src } = this.props;
    return (
      show ?
        <div className='card-zoomed shadow no-highlight'>
            <span className='card-name'>{alt}</span>
            <img src={src} alt={alt} />
        </div>
        : null
    )
  }
}

CardZoom.displayName = 'CardZoom';
CardZoom.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  show: PropTypes.bool
};

export default CardZoom;
