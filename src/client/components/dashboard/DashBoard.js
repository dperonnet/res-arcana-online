import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import SideBar from './sidebar/SideBar';
import Chat from './chat/Chat';
//import Lobby from './lobby/Lobby';
import './dashboard.css';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect } from 'react-redux-firebase';

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

  handleLogin = () => {
    console.log('redirect')
    return this.props.history.push("/signIn");
  }

  render() {
    const { auth, users } = this.props;
    const localStorageExpanded = JSON.parse(window.localStorage.getItem(LOCALSTORAGE_KEY));
    const isExpanded = localStorageExpanded === true || localStorageExpanded === false  ? localStorageExpanded: true;

    return (
      <>
        {auth.uid ?
          (
          <SideBar
            expanded={isExpanded}
            collapse={this.handleCollapse}
            expand={this.handleExpand}
            users={users}
          />
        ) : (
        <SideBar
          expanded={false}
          collapse={this.handleLogin}
          expand={this.handleLogin}
          users={users}
        />
      )}
        <Container className={"dashBoard-content" + (auth.uid && isExpanded ? ' expanded' : '')}>
          <Chat chatId='lobbyChat'/>
          {/*<Lobby games={games}></Lobby>*/}
        </Container>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    games: state.firestore.ordered.games,
    users: state.firestore.ordered.users,
    auth: state.firebase.auth
  }
}

export default compose(
  connect(mapStateToProps),
  firestoreConnect([
    { collection: 'games'},
    { collection: 'users',
		  where: ['state', '==', 'online'],}
  ])
)(DashBoard);

const LOCALSTORAGE_KEY = 'RAO_options';
