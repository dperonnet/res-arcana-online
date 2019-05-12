import React, { Component } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { createAndJoinGame } from '../../../../store/actions/gameActions';

class CreateGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isCreatingGame: false,
      game: {
        name: null,
        password: '',
        numberOfPlayers: '4'
      }
    };
  }

  static getDerivedStateFromProps(props, state) {
    let { game } = state;
    if (game.name === null) {
      return {
        game: {
          ...game,
          name: props.profile.login + '\'s game',
        }
      }
    }
    return state;
  }

  handleClose = () => {
    this.setState({ isCreatingGame: false });
  }

  handleShow = () => {
    this.setState({
      isCreatingGame: true,
      game: {
        name: null,
        password: '',
        numberOfPlayers: '4',
        allowSpectators: true
      }
    });
  }

  handleChange = (e) => {
    const { checked, name, value, type } = e.target;
    const { game } = this.state;
    const valueToUpdate = type === 'checkbox' ? checked : value;
    game[name] = valueToUpdate;
    this.setState({game});
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { auth, profile } = this.props;
    const { game } = this.state;
    game.players = {};
    game.players[auth.uid] = profile.login;
    this.setState({game});
    this.props.createAndJoinGame(this.state.game);
  }

  render() {
    const { isCreatingGame, game } = this.state;
    const numberOfPlayers = ["2","3","4"];

    return (
      <div className='createGamePanel'>
        {
          isCreatingGame ?
            <div className='game'>
              <div className="gameHeader"><h5>Create new game</h5></div>
              <div className="gameOptions">
                <Form onSubmit={this.handleSubmit}>
                  <Form.Group as={Row} controlId="name">
                    <Form.Label column xs="4">Name</Form.Label>
                    <Col xs="8">
                      <Form.Control
                        size="sm"
                        autoFocus
                        placeholder="Game name"
                        type="text"
                        name="name"
                        value={game.name}
                        onChange={this.handleChange}
                      />
                    </Col>
                  </Form.Group>
                  <Form.Group as={Row}>
                    <Form.Label as="legend" column xs={4}>Number of mages</Form.Label>
                    <Col xs={8} className="mt-2">
                      {numberOfPlayers.map((number) => (
                        <Form.Check inline type="radio" name="numberOfPlayers"
                          key={number} id={number} value={number} label={number}
                          checked={game.numberOfPlayers === number}
                          onChange={this.handleChange}
                        />
                      ))}
                    </Col>
                  </Form.Group>
                </Form>
              </div>
              <div className="gameButton">
                <Button type="submit" variant="secondary" size="sm" onClick={this.handleSubmit}>Start</Button>
                <Button variant="secondary" size="sm" onClick={this.handleClose}>Cancel</Button>
              </div>
            </div>
          :
          <div className='gameButton'>
            <Button variant="secondary" size="sm"
              onClick={this.handleShow}>New Game</Button>
          </div>
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.firebase.auth,
    profile: state.firebase.profile
  }
}

const mapDispatchToProps = dispatch => {
  return {
    createAndJoinGame: (game) => dispatch(createAndJoinGame(game))
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(CreateGame);
