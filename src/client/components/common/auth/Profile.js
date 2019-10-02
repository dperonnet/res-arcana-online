import React, { Component } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap'
import './auth.scss';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect } from 'react-redux-firebase';
import { saveProfile, saveOptions } from '../../../../store/actions/authActions';
import { Redirect } from 'react-router-dom';
import Card from '../card/Card'
import * as ERROR from './AuthConstants';

class Profile extends Component {
  constructor(props){
    super(props);
    this.state = {
      cardSize: '',
      layout: '',
      email: '',
      login: '',
      password: '',
      passwordConfirm: '',
      error: [],
      disableSaveOption: true
    }
  }

  static getDerivedStateFromProps(props, state) {
    let profile = state
    if (state.cardSize === '') {
      profile = {
        ...state,
        cardSize: props.profile.cardSize || 'normal',
      }
    }
    if (state.layout === '') {
      profile = {
        ...state,
        layout: props.profile.layout || 'vertical',
      }
    }
    return {profile};
  }

  componentDidMount() {
    if (this.props.profile.cardSize || this.props.profile.layout) {
      let state = this.state;
      state.cardSize = this.props.profile.cardSize;
      state.layout = this.props.profile.layout;
      this.setState(state);
    }
  }

  componentDidUpdate(prevProps) {
    if ((prevProps.profile.cardSize !== this.props.profile.cardSize) || (prevProps.profile.layout !== this.props.profile.layout)) {
      let state = this.state;
      state.cardSize = this.props.profile.cardSize;
      state.layout = this.props.profile.layout;
      this.setState(state);
    }
  }

  /**
   * When focusing a field, remove the errors about that field.
   */
  setCurrentFocus = (field) => {
    let { error } = this.state
    let { clearAuthError } = this.props
    error = error.filter((error) => error.field !== field)
    this.setState({ error})
    clearAuthError(field)
  }

  updateError = (field, message) => {
    const { error } = this.state
    let errorList = error.filter(error => error.field !== field)
    if (message) {
      let newError = { field, message }
      errorList.push(newError)
    }
    this.setState({ error: errorList})
  }
  
  /**
   * Validate field on change/blur
   */
  validateField = (field, fieldValue) => {
    const { password } = this.state
    let error
    let value = fieldValue ? fieldValue : this.state[field]
    
    if (value.length > 0) {
      switch (field) {
        case 'email':
          if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
            error = ERROR.EMAIL_INVALID
          }
          break
        case 'password':
          if (value.length < 6) {
            error = ERROR.PASSWORD_TOO_SHORT
          } else if (value.length > 128) {
            error = ERROR.PASSWORD_TOO_LONG
          }
          break
        case 'passwordConfirm':
          if (password !== value) {
            error = ERROR.PASSWORD_CONFIRM_INVALID
          }
          break
        default:
      }
    }
    this.updateError(field, error)
  }

  /**
   * Disable the submit button if the form is not valid.
   */
  disableSubmit() {
    const { authError } = this.props
    const { error, email, password, passwordConfirm } = this.state
    let formNotCompleted = email.length === 0 && password.length === 0 && passwordConfirm.length === 0
    let formNotValid = (authError && authError.length !== 0)  || error.length !== 0
    let wrongPassword = password !== passwordConfirm
    return formNotCompleted || formNotValid || wrongPassword
  }

  handleChange = (event) => {
    this.setState({
      [event.target.id]: event.target.value
    });
    this.validateField(event.target.id, event.target.value)
  }

  handleOptionChange = (event) => {
    const { name, value } = event.target;
    let state = this.state;
    state[name] = value
    state.disableSaveOption = false
    this.setState(state);
  }

  handleSelectCardSize = (event, size) => {
    event.preventDefault();
    let state = this.state;
    state.cardSize = size
    state.disableSaveOption = false
    this.setState(state);
  }

  handleSubmitProfile = (event) => {
    event.preventDefault();
    this.props.saveProfile(this.state.profile);
    this.forceUpdate()
  }
  
  handleSubmitOptions = (event) => {
    event.preventDefault();
    this.props.saveOptions(this.state.profile);
    this.forceUpdate()
  }

  renderProfileSetting = () => {
    return <>
      <Form.Group as={Row} controlId="email" autoComplete="off">
        <Form.Label column xs="4">Magic email</Form.Label>
        <Col xs="7">
          <Form.Control
            size="sm"
            autoFocus
            placeholder="Enter your magic email"
            type="text"
            value={this.state.email}
            onBlur={() => this.validateField('email')}
            onChange={this.handleChange}
            onFocus={() => this.setCurrentFocus('email')}
          />
          {this.renderError('email')}
        </Col>
      </Form.Group>
      <Form.Group as={Row} controlId="password">
        <Form.Label column xs="4">New Password</Form.Label>
        <Col xs="7">
          <Form.Control
            size="sm"
            placeholder="Enter your new password"
            type="password"
            value={this.state.password}
            onBlur={() => this.validateField('password')}
            onChange={this.handleChange}
            onFocus={() => this.setCurrentFocus('password')}
            autoComplete="off"
          />
          {this.renderError('password')}
        </Col>
      </Form.Group>
      <Form.Group as={Row} controlId="passwordConfirm">
        <Form.Label column xs="4">New Password (again)</Form.Label>
        <Col xs="7">
          <Form.Control
            size="sm"
            placeholder="Confirm your new password"
            type="password"
            value={this.state.passwordConfirm}
            onBlur={() => this.validateField('passwordConfirm')}
            onChange={this.handleChange}
            onFocus={() => this.setCurrentFocus('passwordConfirm')}
            autoComplete="off"
          />
          {this.renderError('passwordConfirm')}
        </Col>
      </Form.Group>
    </>
  }

  renderLayout = () => {
    const { layout } = this.state;
    return <Form.Group as={Row} controlId="layout">
      <Form.Label column xs="2">Layout</Form.Label>
      <Col xs="10">
        <div className="align-radio">
          <Form.Check inline type="radio" name="layout"
            id="vertical" value='vertical' label="Vertical"
            checked={layout === 'vertical'}
            onChange={this.handleOptionChange}
          />
          <Form.Check inline type="radio" name="layout"
            id="horizontal" value='horizontal' label="Horizontal"
            checked={layout === 'horizontal'}
            onChange={this.handleOptionChange}
          />
        </div>
      </Col>
    </Form.Group>
  }

  renderCard = (size) => {
    const { cardSize } = this.state;
    const src = require('../../../assets/image/components/back/back_artefact.jpg');
    return (
      <div className="card-settings">
        <div
          className={"preview-card" + (cardSize === size ? ' active ': ' ') + size +' card vertical'}
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

  renderError = (field) => {
    const { error } = this.state
    const { authError } = this.props
    let errors = authError ? error.concat(authError) : error
    return errors.filter((err) => err.field === field).map((err, index) => {
      return <div key={index} className="error">{err.message}</div>
    })
  }
  
  render() {
    const { auth } = this.props;
    const { disableSaveOption } = this.state
    
    if(!auth.uid) return <Redirect to='/signIn'/>

    return (
      <div className="auth-container">
        <div className="auth-panel">
          <h2>Player profile</h2>
          <Form onSubmit={this.handleSubmitProfile}>
            {this.renderProfileSetting()}
            <Row>
              <div className="offset-4 col-7">
                <Button type="submit" size="sm" disabled={this.disableSubmit()}>Save</Button>
              </div>
            </Row>
          </Form>
        </div>
        <div className="auth-panel">
          <h2>Game options</h2>
          <Form onSubmit={this.handleSubmitOptions}>
            {false && this.renderLayout()}
            <div className="align-center">
              <div className="card-size-selector">
                {this.renderCard('small')}
                {this.renderCard('normal')}
              </div>
              <div className="card-size-selector">
                {this.renderCard('large')}
                {this.renderCard('x-large')}
              </div>
            </div>
            <Row>
              <div className="offset-4 col-7">
                <Button type="submit" size="sm" disabled={disableSaveOption}>Save</Button>
              </div>
            </Row>
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
    clearAuthError: (field) => dispatch({ type: 'CLEAR_AUTH_ERROR', err: {field}}),
    saveProfile: (profile) => dispatch(saveProfile(profile)),
    saveOptions: (profile) => dispatch(saveOptions(profile)),
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
