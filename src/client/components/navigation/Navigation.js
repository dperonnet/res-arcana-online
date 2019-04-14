import React, { Component } from 'react';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from "react-router-bootstrap";
import LoginForm from './login/LoginForm';
import './navigation.css';

export default class Navigation extends Component {

  render() {
    return (
      <Navbar collapseOnSelect expand="md" variant="dark" fixed="top">
        <LinkContainer to="/"><Navbar.Brand>Res Arcana Online</Navbar.Brand></LinkContainer>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <LinkContainer to="/game"><Nav.Link>Play</Nav.Link></LinkContainer>
            <LinkContainer to="/editor"><Nav.Link>Editor</Nav.Link></LinkContainer>
            <NavDropdown title="Help" id="collasible-nav-dropdown">
              <LinkContainer to="/editor"><NavDropdown.Item>How To Play</NavDropdown.Item></LinkContainer>
              <LinkContainer to="/game"><NavDropdown.Item>About action</NavDropdown.Item></LinkContainer>
              <LinkContainer to="/Help"><NavDropdown.Item>Community</NavDropdown.Item></LinkContainer>
              <NavDropdown.Divider />
              <LinkContainer to="/"><NavDropdown.Item>Privacy Policy</NavDropdown.Item></LinkContainer>
            </NavDropdown>
          </Nav>
          <Navbar.Text>
            70 games
          </Navbar.Text>
          <Nav>

          </Nav>
        </Navbar.Collapse>
        <LoginForm />
      </Navbar>
    );
  }
}
