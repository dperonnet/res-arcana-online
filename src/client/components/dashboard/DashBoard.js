import React, { Component } from 'react';
import SideBar from './sidebar/SideBar';
import Chat from '../common/chat/Chat';
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
    return this.props.history.push("/signIn");
  }

  render() {
    const { auth, mainChat, users } = this.props;
    const localStorageExpanded = JSON.parse(window.localStorage.getItem(LOCALSTORAGE_KEY));
    const isExpanded = localStorageExpanded === true || localStorageExpanded === false  ? localStorageExpanded: true;
    const chatName = 'Lobby Chat' + (auth.uid && users ? ' (' + users.length + ' online)' : '');
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
        />
      )}
        <div className={"dashboard-content" + (auth.uid && isExpanded ? ' expanded' : '')}>
          <Chat chat={mainChat} chatId='mainChat' chatName={chatName}/>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    mainChat : state.firestore.ordered.mainChat && state.firestore.ordered.mainChat[0],
    games: state.firestore.ordered.games,
    users: state.firestore.ordered.users,
    auth: state.firebase.auth
  }
}

export default compose(
  connect(mapStateToProps),
  firestoreConnect((props) => [
    { collection: 'games'},
    { collection: 'users',
		  where: ['state', '==', 'online'],},
    { collection: 'chats',
      doc: 'mainChat',
      storeAs: 'mainChat'
    }
  ])
)(DashBoard);

const LOCALSTORAGE_KEY = 'RAO_options';
