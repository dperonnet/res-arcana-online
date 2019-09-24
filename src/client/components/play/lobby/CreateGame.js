import React, { Component } from 'react';
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap';
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
        numberOfPlayers: '2',
        boardGameId: null,
        skipDraftPhase: true
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
    const { setLoading } = this.props
    setLoading(false);
    this.setState({ isCreatingGame: false });
  }

  handleShow = () => {
    this.setState({
      isCreatingGame: true
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
    const { createGame, joinGame, gameServer, setLoading } = this.props
    const { game } = this.state;
    setLoading(true);
    const setupData = {
      skipDraftPhase: game.skipDraftPhase
    }
    createGame('res-arcana', this.state.game.numberOfPlayers, setupData).then((resp) => {
      game.boardGameId = resp.gameID
      this.props.createAndJoinGame(game, joinGame, gameServer);
    })
  }

  render() {
    const { isCreatingGame, game } = this.state;
    const numberOfPlayers = ["1","2","3","4"];

    return (
      <div className='create-game-panel'>
        {
          isCreatingGame ?
            <div className='game'>
              <div className="game-header"><h5>Create new game</h5></div>
              <div className="game-options">
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
                    <Form.Label column xs={4}>Number of mages</Form.Label>
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
                  <Form.Group as={Row}>
                    <Form.Label column xs={4}>
                      Draft Options
                    </Form.Label>
                    <Col xs={8} className="mt-2">
                      <InputGroup className="mb-3">
                        <Form.Check inline type="checkbox" name="skipDraftPhase"
                          id="skipDraftPhase" label="Skip draft phase ?"
                          value={game.skipDraftPhase}
                          checked={game.skipDraftPhase}
                          onChange={this.handleChange}/>
                      </InputGroup>
                    </Col>
                  </Form.Group>
                </Form>
              </div>
              <div className="game-button">
                <Button type="submit" variant="secondary" size="sm" onClick={this.handleSubmit}>Create</Button>
                <Button variant="secondary" size="sm" onClick={this.handleClose}>Cancel</Button>
              </div>
            </div>
          :
          <div className='game-button'>
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
    createAndJoinGame: (game, callback, gameServer) => dispatch(createAndJoinGame(game, callback, gameServer)),
    setLoading: (value) => dispatch({type: 'LOADING', loading: value})
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(CreateGame);
