import React, { Component } from 'react'
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { createGameLobby } from '../../../../store/actions/lobbyActions'

class CreateLobby extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isCreatingGame: false,
      gameOptions: {
        name: null,
        password: '',
        numberOfPlayers: '2',
        boardGameId: null,
        skipDraftPhase: true,
      },
    }
  }

  static getDerivedStateFromProps(props, state) {
    let { gameOptions } = state

    if (gameOptions.name === null && props.profile.login) {
      return {
        gameOptions: {
          ...gameOptions,
          // eslint-disable-next-line prettier/prettier
          name: props.profile.login + '\'s game',
        },
      }
    }
    return state
  }

  handleClose = () => {
    this.setState({ isCreatingGame: false })
  }

  handleShow = () => {
    this.setState({
      isCreatingGame: true,
    })
  }

  handleChange = e => {
    const { checked, name, value, type } = e.target
    const { gameOptions } = this.state
    const valueToUpdate = type === 'checkbox' ? checked : value
    gameOptions[name] = valueToUpdate
    this.setState({ gameOptions })
  }

  handleSubmit = e => {
    e.preventDefault()
    const { gameOptions } = this.state
    this.props.createGameLobby(gameOptions)
  }

  render() {
    const { isCreatingGame, gameOptions } = this.state
    const numberOfPlayers = ['1', '2', '3', '4']

    return (
      <div className="create-game-panel">
        {isCreatingGame ? (
          <div className="game">
            <div className="game-header">
              <h5>Create new game</h5>
            </div>
            <div className="game-options">
              <Form onSubmit={this.handleSubmit}>
                <Form.Group as={Row} controlId="name">
                  <Form.Label column xs="4">
                    Name
                  </Form.Label>
                  <Col xs="8">
                    <Form.Control
                      size="sm"
                      autoFocus
                      placeholder="Game name"
                      type="text"
                      name="name"
                      value={gameOptions.name}
                      onChange={this.handleChange}
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row}>
                  <Form.Label column xs={4}>
                    Number of mages
                  </Form.Label>
                  <Col xs={8} className="mt-2">
                    {numberOfPlayers.map(number => (
                      <Form.Check
                        inline
                        type="radio"
                        name="numberOfPlayers"
                        key={number}
                        id={number}
                        value={number}
                        label={number}
                        checked={gameOptions.numberOfPlayers === number}
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
                      <Form.Check
                        inline
                        type="checkbox"
                        name="skipDraftPhase"
                        id="skipDraftPhase"
                        label="Skip draft phase ?"
                        value={gameOptions.skipDraftPhase}
                        checked={gameOptions.skipDraftPhase}
                        onChange={this.handleChange}
                      />
                    </InputGroup>
                  </Col>
                </Form.Group>
              </Form>
            </div>
            <div className="game-button">
              <Button type="submit" variant="secondary" size="sm" onClick={this.handleSubmit}>
                Create
              </Button>
              <Button variant="secondary" size="sm" onClick={this.handleClose}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="game-button">
            <Button variant="secondary" size="sm" onClick={this.handleShow}>
              New Game
            </Button>
          </div>
        )}
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    auth: state.firebase.auth,
    profile: state.firebase.profile,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    createGameLobby: gameOptions => dispatch(createGameLobby(gameOptions)),
  }
}

export default compose(
  withRouter, //TODO REMOVE ?
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(CreateLobby)
