import React, { PureComponent } from 'react';

export default class TextCard extends PureComponent {
  render() {
    const { options } = this.props;
    const classes = `card ${options.cardSize}`;
    const essencesCollectables = ['Vie', 'Mort'];
    const collectibles = essencesCollectables.map(value => (
      <li>
        <span>
          {value}
        </span>
      </li>
    ));

    const actionsList = ['action1', 'action2'];
    const actions = actionsList.map(value => (
      <li>
        <span>
          {value}
        </span>
      </li>
    ));

    return (
      <div>
        <div className={classes}>
          <span className="cardName">Guérisseur</span>
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
