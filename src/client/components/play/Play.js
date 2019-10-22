import React, { Component } from 'react'
import { Container } from 'react-bootstrap'
import { Redirect } from 'react-router-dom'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { firestoreConnect } from 'react-redux-firebase'
import './play.css'
import CreateLobby from './lobby/CreateLobby'
import GameLobby from './lobby/GameLobby'
import LobbyList from './lobby/LobbyList'

class Play extends Component {
  render() {
    const { auth, currentLobby, loading } = this.props

    if (!auth.uid) return <Redirect to="/signIn" />

    return (
      <Container className="play-container">
        {currentLobby && currentLobby.lobbyId ? (
          <GameLobby />
        ) : (
          <div className="lobby-container">
            <CreateLobby />
            {loading ? (
              <div className="loading-panel align-center">
                <img className="loader" alt="Loading..." />
                Loading...
              </div>
            ) : (
              <LobbyList />
            )}
          </div>
        )}
      </Container>
    )
  }
}

const mapStateToProps = state => {
  return {
    auth: state.firebase.auth,
    currentLobby: state.firestore.data.currentLobby,
    loading: state.ui.loading,
  }
}

export default compose(
  connect(mapStateToProps),
  firestoreConnect(props => [{ collection: 'currentLobbys', doc: props.auth.uid, storeAs: 'currentLobby' }])
)(Play)
