import React, { Component } from 'react';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from "react-router-bootstrap";
import LoginNav from './LoginNav';
import './navigation.css';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect } from 'react-redux-firebase';
import { leaveGame } from '../../../store/actions/gameActions';

class Navigation extends Component {

  leaveGame = () => {
    const { currentGame, leaveGame } = this.props;
    console.log('leaving game',currentGame.gameId);
    leaveGame(currentGame.gameId);
  }

  render() {
    const { currentGame, games } = this.props;
    return (
      <Navbar collapseOnSelect expand="md" variant="dark" fixed="top">
        <LinkContainer to="/"><Navbar.Brand>Res Arcana Online</Navbar.Brand></LinkContainer>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <LinkContainer to="/play" active={false}><Nav.Link>Play</Nav.Link></LinkContainer>
            <LinkContainer to="/editor" active={false}><Nav.Link>Editor</Nav.Link></LinkContainer>
            <NavDropdown title="Help" id="collasible-nav-dropdown">
              <LinkContainer to="/editor" active={false}><NavDropdown.Item>How To Play</NavDropdown.Item></LinkContainer>
              <LinkContainer to="/game" active={false}><NavDropdown.Item>About action</NavDropdown.Item></LinkContainer>
              <LinkContainer to="/Help" active={false}><NavDropdown.Item>Community</NavDropdown.Item></LinkContainer>
              <NavDropdown.Divider />
              <LinkContainer to="/" active={false}><NavDropdown.Item>Privacy Policy</NavDropdown.Item></LinkContainer>
            </NavDropdown>
            {currentGame && currentGame.gameId && <Nav.Link onClick={this.leaveGame}>Leave game</Nav.Link>}
          </Nav>
          <Nav>
            <Navbar.Text> {games ? Object.keys(games).length : 0} games
            </Navbar.Text>
            <LoginNav />
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

const mapStateToProps = (state) =>{
  return {
    games: state.firestore.ordered.games,
    auth: state.firebase.auth,
    currentGame: state.firestore.data.currentGame
  }
}

const mapDispatchToProps = (dispatch) =>{
  return {
    leaveGame: (gameId) => dispatch(leaveGame(gameId))
  }
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  firestoreConnect((props) => [
    { collection: 'games'},
    { collection: 'currentGames',
      doc: props.auth.uid,
      storeAs: 'currentGame'
    }
  ]
))(Navigation)
