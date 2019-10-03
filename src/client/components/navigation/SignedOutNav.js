import React, { Component } from 'react'
import { Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import './navigation.css'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { firestoreConnect } from 'react-redux-firebase'

class SignedOutNav extends Component {
  render() {
    const { profile } = this.props
    return (
      <Navbar collapseOnSelect expand="md" variant="dark" fixed="top">
        <LinkContainer to="/">
          <Navbar.Brand>Res Arcana Online</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <LinkContainer to="/play" active={false}>
              <Nav.Link>Play</Nav.Link>
            </LinkContainer>
            {profile.role === 'admin' && (
              <LinkContainer to="/editor" active={false}>
                <Nav.Link>Editor</Nav.Link>
              </LinkContainer>
            )}
            <NavDropdown title="Help" id="collasible-nav-dropdown">
              <LinkContainer to="/howToPlay" active={false}>
                <NavDropdown.Item>How To Play</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/about" active={false}>
                <NavDropdown.Item>About</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/community" active={false}>
                <NavDropdown.Item>Community</NavDropdown.Item>
              </LinkContainer>
              <NavDropdown.Divider />
              <LinkContainer to="/privatePolicy" active={false}>
                <NavDropdown.Item>Privacy Policy</NavDropdown.Item>
              </LinkContainer>
            </NavDropdown>
          </Nav>
          <Nav>
            <LinkContainer to="/signIn" active={false}>
              <Nav.Link>Login</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/register" active={false}>
              <Nav.Link>Register</Nav.Link>
            </LinkContainer>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

const mapStateToProps = state => {
  return {
    games: state.firestore.ordered.games,
    auth: state.firebase.auth,
    profile: state.firebase.profile,
  }
}

export default compose(
  connect(mapStateToProps),
  firestoreConnect(() => [{ collection: 'games' }])
)(SignedOutNav)
