import React, { Component } from 'react';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from "react-router-bootstrap";
import './navigation.css';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect } from 'react-redux-firebase';
import { leaveGame } from '../../../store/actions/gameActions';
import { signOut } from '../../../store/actions/authActions';

class SignedInNav extends Component {

  leaveGame = () => {
    const { currentGames, leaveGame, gameServerUrl, setLoading } = this.props;
    setLoading(false);
    leaveGame(currentGames.gameId, gameServerUrl);
  }

  render() {
    const { currentGames, games, profile, signOut } = this.props;
    return (
      <Navbar collapseOnSelect expand="md" variant="dark" fixed="top">
        <LinkContainer to="/"><Navbar.Brand>Res Arcana Online</Navbar.Brand></LinkContainer>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <LinkContainer to="/play" active={false}><Nav.Link>Play</Nav.Link></LinkContainer>
            <LinkContainer to="/editor" active={false}><Nav.Link>Editor</Nav.Link></LinkContainer>
            <NavDropdown title="Help" id="collasible-nav-dropdown">
              <LinkContainer to="/howToPlay" active={false}><NavDropdown.Item>How To Play</NavDropdown.Item></LinkContainer>
              <LinkContainer to="/about" active={false}><NavDropdown.Item>About</NavDropdown.Item></LinkContainer>
              <LinkContainer to="/community" active={false}><NavDropdown.Item>Community</NavDropdown.Item></LinkContainer>
              <NavDropdown.Divider />
              <LinkContainer to="/privatePolicy" active={false}><NavDropdown.Item>Privacy Policy</NavDropdown.Item></LinkContainer>
            </NavDropdown>
            {currentGames && currentGames.gameId != null && <Nav.Link onClick={this.leaveGame}>Leave game</Nav.Link>}
          </Nav>
          <Nav>
            <Navbar.Text> {games ? Object.keys(games).length : 0} games
            </Navbar.Text>
            <NavDropdown title={profile.login} id="collasible-nav-dropdown">
              <LinkContainer to="/" active={false}><NavDropdown.Item onClick={signOut}>Logout</NavDropdown.Item></LinkContainer>
            </NavDropdown>
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
    currentGames: state.firestore.data.currentGames,
    profile: state.firebase.profile
  }
}

const mapDispatchToProps = (dispatch) =>{
  return {
    leaveGame: (gameId, baseUrl) => dispatch(leaveGame(gameId, baseUrl)),
    signOut: () => dispatch(signOut()),
    setLoading: (value) => dispatch({type: 'LOADING', loading: value})
  }
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  firestoreConnect((props) => [
    { collection: 'games'},
    { collection: 'currentGames',
      doc: props.auth.uid,
      storeAs: 'currentGames'
    }
  ]
))(SignedInNav)
