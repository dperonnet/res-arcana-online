import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import Lobby from "./lobby/Lobby";
import './play.css';

export default class Play extends Component {
  render() {
    return (
      <Container className="playContainer">
        <Lobby />
      </Container>
    );
  }
}
