import React, { PureComponent } from 'react';
import './card.scss';

export default class Card extends PureComponent {
  render() {
    const { alt, classes, onMouseOut, onMouseOver, src } = this.props;
    return <>
      <img className={'card-image ' + classes} src={src} alt={alt} onMouseOut={onMouseOut} onMouseOver={onMouseOver}/>
    </>
  }
}
