
import React from 'react';
import card from '../assets/image/card01.png';

export class Card extends React.Component {
  render() {
    const classes = `card ${this.props.options.cardSize}`;
    return (
      <div className={classes}>
        <img src={card} alt=""/>
      </div>
    );
  }
}

export default class TextCard extends React.Component {
  render() {
    const classes = `card ${this.props.options.cardSize}`;
    const essencesCollectables = ['Vie','Mort'];
    const collectibles = essencesCollectables.map((value, index) => {
      return (
        <li key={index}>
          <span>
            {value}
          </span>
        </li>
      );
    });

    const actionsList = ['action1', 'action2'];
    const actions = actionsList.map((value, index) => {
      return (
        <li key={index}>
          <span>
            {value}
          </span>
        </li>
      );
    });

    return (
      <div>
        <div className={classes}>
          <span className={"cardName"}>Guérisseur</span>
          <div>
            <ol>
              {collectibles}
            </ol>
          </div>
          <div>
            <ol>
              {actions}
            </ol>
          </div>
        </div>
      </div>
    );
  }
}
