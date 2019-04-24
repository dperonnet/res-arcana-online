import React, { Component } from 'react';
import SideBar from './sidebar/SideBar';
import './dashboard.css';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Container } from 'react-bootstrap';
import GameList from './loby/GameList';
import { firestoreConnect } from 'react-redux-firebase';
import { Redirect } from 'react-router-dom';
import Notifications from './Notifications'

class DashBoard extends Component {
  render() {
    const { games, auth } = this.props;
    if(!auth.uid) return <Redirect to='/signin'/>

    return (
      <>
        <SideBar />
        <Container className="dashBoard-content">
          <GameList games={games}></GameList>
          <Notifications />
        </Container>
      </>
    );
  }
}

const mapStateToProps = (state) =>{
  return {
    games: state.firestore.ordered.games,
    auth: state.firebase.auth
  }
}

export default compose(
  connect(mapStateToProps),
  firestoreConnect([
    { collection: 'games'}
  ])
)(DashBoard);
