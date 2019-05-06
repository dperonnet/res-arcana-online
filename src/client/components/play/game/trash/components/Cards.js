import React, { PureComponent } from 'react';
import card from '../../../assets/image/card01.png';

export default class Card extends PureComponent {
  render() {
    const { options } = this.props;
    const classes = `card ${options.cardSize}`;
    return (
      <div className={classes}>
        <img src={card} alt="" />
      </div>
    );
  }
}
