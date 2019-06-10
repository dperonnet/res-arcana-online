import React, { PureComponent } from 'react';
import './card.css';

export default class Card extends PureComponent {
  render() {
    const { alt, classes, onMouseOut, onMouseOver, src } = this.props;
    return (
      <div className='card-frame' onMouseOut={onMouseOut} onMouseOver={onMouseOver}>
        <div>
          <img className={'card-image ' + classes} src={src} alt={alt} />
        </div>
        {/*<div className="counters ignore-mouse-events">
          <div className="counter elan">
            <span>1</span>
          </div>
        </div>*/}
      </div>
    );
  }
}
