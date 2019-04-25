import React, { Component } from 'react';
import SideBar from './sidebar/SideBar';
import './dashboard.css';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Container } from 'react-bootstrap';
import GameList from './loby/GameList';
import { firestoreConnect } from 'react-redux-firebase';
import { Redirect } from 'react-router-dom';

class DashBoard extends Component {
  constructor(props) {
    super(props);
    const localStorageExpanded = JSON.parse(window.localStorage.getItem(LOCALSTORAGE_KEY));
    const expanded = localStorageExpanded ? localStorageExpanded : true;
    this.state = {
      expanded: expanded
    }
  }

  handleExpand = () => {
    this.setState({expanded: true})
    window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(true));
  }

  handleCollapse = () => {
    this.setState({expanded: false})
    window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(false));
  }

  clearLocalStorage = (changeEvent) => {
    window.localStorage.removeItem(LOCALSTORAGE_KEY);
  }

  render() {
    const { games, auth } = this.props;
    if(!auth.uid) return <Redirect to='/signin'/>

    const localStorageExpanded = JSON.parse(window.localStorage.getItem(LOCALSTORAGE_KEY));
    const isExpanded = localStorageExpanded === true || localStorageExpanded === false  ? localStorageExpanded: true;

    return (
      <>
        <SideBar
          expanded={isExpanded}
          collapse={this.handleCollapse}
          expand={this.handleExpand}
        />
        <Container className="dashBoard-content">
          <GameList games={games}></GameList>
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

const LOCALSTORAGE_KEY = 'RAO_options';
