import React, { PureComponent } from 'react';
import './card.css';

export default class Card extends PureComponent {
  render() {
    const { alt, onMouseOut, onMouseOver, size, src } = this.props;
    const classes = `card ${size} vertical`;
    return (
      <div className="card-frame" onMouseOut={onMouseOut} onMouseOver={onMouseOver}>
        <div className={classes}>
          <div>
            <span className="card-name">{alt}</span>
            <img className="card-image vertical x-large" src={src} alt={alt} />
          </div>
          {/*<div className="counters ignore-mouse-events">
            <div className="counter elan">
              <span>1</span>
            </div>
          </div>*/}
        </div>
      </div>
    );
  }
}
