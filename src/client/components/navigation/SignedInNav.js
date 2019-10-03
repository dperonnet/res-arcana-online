import React, { Component } from 'react'
import { Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import './navigation.css'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { firestoreConnect } from 'react-redux-firebase'
import { deleteLobby, leaveLobby } from '../../../store/actions/lobbyActions'
import { saveOptions, signOut } from '../../../store/actions/authActions'
import { toggleChat } from '../../../store/actions/chatActions'
import { toggleCommonBoard } from '../../../store/actions/gameActions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArchway, faComments, faSearchMinus, faSearchPlus } from '@fortawesome/free-solid-svg-icons'

const cardSizeList = ['small', 'normal', 'large', 'x-large']

class SignedInNav extends Component {
  handleLeaveGame = () => {
    const { currentLobby, deleteLobby, setLoading } = this.props
    setLoading(false)
    deleteLobby(currentLobby.lobbyId)
  }

  deleteLobby = () => {
    const { currentLobby, deleteLobby, setLoading } = this.props
    setLoading(false)
    deleteLobby(currentLobby.lobbyId)
  }

  leaveLobby = () => {
    const { currentLobby, leaveLobby, setLoading } = this.props
    setLoading(false)
    leaveLobby(currentLobby.lobbyId)
  }

  toggleChat = () => {
    this.props.toggleChat()
  }

  toggleCommonBoard = () => {
    this.props.toggleCommonBoard()
  }

  setCardSize = size => {
    const { profile, saveOptions } = this.props
    let newProfile = { ...profile }
    newProfile.cardSize = size
    saveOptions(newProfile)
  }

  setCardSizeMinus = () => {
    console.log('setCardSizeMinus')
    const { profile } = this.props
    let index = cardSizeList.findIndex(size => size === profile.cardSize)
    if (index > 0) {
      this.setCardSize(cardSizeList[index - 1])
    }
  }

  setCardSizePlus = () => {
    console.log('setCardSizePlus')
    const { profile } = this.props
    let index = cardSizeList.findIndex(size => size === profile.cardSize)
    if (index < cardSizeList.length - 1) {
      this.setCardSize(cardSizeList[index + 1])
    }
  }

  render() {
    const { chatDisplay, commonBoardDisplay, currentLobby, profile, signOut } = this.props

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
            {currentLobby && currentLobby.lobbyId != null && (
              <Nav.Link onClick={this.handleLeaveGame}>Leave game</Nav.Link>
            )}
          </Nav>
          <Nav>
            {currentLobby && currentLobby.lobbyId != null && (
              <Nav.Link onClick={this.toggleCommonBoard} active={commonBoardDisplay}>
                <FontAwesomeIcon icon={faArchway} />
              </Nav.Link>
            )}
            {currentLobby && currentLobby.lobbyId != null && (
              <Nav.Link onClick={this.toggleChat} active={chatDisplay}>
                <FontAwesomeIcon icon={faComments} />
              </Nav.Link>
            )}
            {currentLobby && currentLobby.lobbyId != null && (
              <Nav.Link
                onClick={this.setCardSizeMinus}
                active={profile.cardSize !== cardSizeList[0]}
                disabled={profile.cardSize === cardSizeList[0]}
              >
                <FontAwesomeIcon icon={faSearchMinus} />
              </Nav.Link>
            )}
            {currentLobby && currentLobby.lobbyId != null && (
              <Nav.Link
                onClick={this.setCardSizePlus}
                active={profile.cardSize !== cardSizeList[cardSizeList.length - 1]}
                disabled={profile.cardSize === cardSizeList[cardSizeList.length - 1]}
              >
                <FontAwesomeIcon icon={faSearchPlus} />
              </Nav.Link>
            )}
            {/*<Navbar.Text> {games ? Object.keys(games).length : 0} games
            </Navbar.Text>*/}
            <NavDropdown alignRight title={profile.login} id="collasible-nav-dropdown">
              <LinkContainer to="/profile" active={false}>
                <NavDropdown.Item>Profile</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/logout" active={false}>
                <NavDropdown.Item onClick={signOut}>Logout</NavDropdown.Item>
              </LinkContainer>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

const mapStateToProps = state => {
  return {
    auth: state.firebase.auth,
    chatDisplay: state.chat.chatDisplay,
    commonBoardDisplay: state.game.commonBoardDisplay,
    currentLobby: state.firestore.data.currentLobby,
    profile: state.firebase.profile,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    deleteLobby: lobbyId => dispatch(deleteLobby(lobbyId)),
    leaveLobby: (gameId, baseUrl) => dispatch(leaveLobby(gameId, baseUrl)),
    saveOptions: profile => dispatch(saveOptions(profile)),
    setLoading: value => dispatch({ type: 'LOADING', loading: value }),
    signOut: () => dispatch(signOut()),
    toggleChat: () => dispatch(toggleChat()),
    toggleCommonBoard: () => dispatch(toggleCommonBoard()),
  }
}

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  firestoreConnect(props => [
    { collection: 'gameLobbys' },
    { collection: 'currentLobbys', doc: props.auth.uid, storeAs: 'currentLobby' },
  ])
)(SignedInNav)
