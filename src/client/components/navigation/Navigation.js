import React, { Component } from 'react';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from "react-router-bootstrap";
import LoginNav from './LoginNav';
import './navigation.css';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect } from 'react-redux-firebase';

class Navigation extends Component {

  render() {
    const { games } = this.props;
    return (
      <Navbar collapseOnSelect expand="md" variant="dark" fixed="top">
        <LinkContainer to="/"><Navbar.Brand>Res Arcana Online</Navbar.Brand></LinkContainer>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <LinkContainer to="/play"><Nav.Link>Play</Nav.Link></LinkContainer>
            <LinkContainer to="/editor"><Nav.Link>Editor</Nav.Link></LinkContainer>
            <NavDropdown title="Help" id="collasible-nav-dropdown">
              <LinkContainer to="/editor"><NavDropdown.Item>How To Play</NavDropdown.Item></LinkContainer>
              <LinkContainer to="/game"><NavDropdown.Item>About action</NavDropdown.Item></LinkContainer>
              <LinkContainer to="/Help"><NavDropdown.Item>Community</NavDropdown.Item></LinkContainer>
              <NavDropdown.Divider />
              <LinkContainer to="/"><NavDropdown.Item>Privacy Policy</NavDropdown.Item></LinkContainer>
            </NavDropdown>
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
  }
}

export default
compose(
  connect(mapStateToProps),
  firestoreConnect([
    { collection: 'games'}
  ])
)(Navigation)
