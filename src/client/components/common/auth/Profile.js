import React, { Component } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap'
import './auth.css';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect } from 'react-redux-firebase';
import { saveProfile } from '../../../../store/actions/authActions';
import { Redirect } from 'react-router-dom';
import Card from '../card/Card'

class Profile extends Component {
  constructor(props){
    super(props);
    this.state = {
      profile: {
        cardSize: ''
      },
    }
  }

  static getDerivedStateFromProps(props, state) {
    let { profile } = state;
    if (profile.cardSize === '') {
      return {
        profile: {
          cardSize: props.profile.cardSize || 'normal',
        }
      }
    }
    return state;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.profile.cardSize !== this.props.profile.cardSize) {
      const { profile } = this.state;
      profile.cardSize = this.props.profile.cardSize;
      this.setState({profile});
    }
  }

  validateForm() {
    const { credentials } = this.state;
    return credentials.email.length > 0 && credentials.password.length > 0;
  }

  handleSelectCardSize = (event, size) => {
    event.preventDefault();
    const { profile } = this.state;
    profile.cardSize = size
    this.setState({profile});
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.props.saveProfile(this.state.profile);
    this.forceUpdate()
  }

  setError = (error) => {
    this.setState({error});
  }

  renderCard = (size) => {
    const { profile } = this.state;
    const src = require('../../../assets/image/components/back/back_artefact.png');
    return (
      <div className="card-settings">
        <div
          className={"preview-card" + (profile.cardSize === size ? ' active ': ' ') + size +' card vertical'}
          onClick={event => this.handleSelectCardSize(event, size)}
        >
          <Card
            classes={size + ' card vertical'}
            src={ src }
            show={ true } 
            alt={ size } 
          />
        </div>
        <div className="label-card-size">
          <span>{size}</span>
        </div>
      </div>
    );
  }

  render() {
    const { auth, profile } = this.props;
    
    if(!auth.uid) return <Redirect to='/signIn'/>

    return (
      <div className="profil-container">
        <div className="profil-panel">
          <h2>Profile</h2>
          <Form onSubmit={this.handleSubmit}>
            <div className="card-size-selector">
              {this.renderCard('x-small')}
              {this.renderCard('small')}
              {this.renderCard('normal')}
            </div>
            <div className="card-size-selector">
              {this.renderCard('large')}
              {this.renderCard('x-large')}
            </div>
            <div className="game-button">
              <Button type="submit" variant="secondary" size="sm">Save</Button>
            </div>
          </Form>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    authError: state.auth.authError,
    auth: state.firebase.auth,
    currentGame: state.firestore.data.currentGame,
    profile: state.firebase.profile
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    saveProfile: (profile) => dispatch(saveProfile(profile))
  }
}

export default
compose(
  connect(mapStateToProps, mapDispatchToProps),
  firestoreConnect((props) => [
    { collection: 'currentGames',
      doc: props.auth.uid,
      storeAs: 'currentGame'
    }
  ]
))(Profile);
