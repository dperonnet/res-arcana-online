import React, { Component } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap'
import './auth.scss';
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom';
import { validateAndRegister } from '../../../../store/actions/authActions';
import * as ERROR from './AuthConstants';

class Register extends Component {
  constructor(props){
    super(props);
    this.state = {
      email: '',
      login: '',
      password: '',
      passwordConfirm: '',
      error: []
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
        case 'login':
          if (value.length < 3) {
            error = ERROR.LOGIN_TOO_SHORT
          } else if (value.length > 25) {
            error = ERROR.LOGIN_TOO_LONG
          } 
          break
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
    const { error, email, login, password, passwordConfirm } = this.state
    let formNotCompleted = login.length === 0 ||  email.length === 0 || password.length === 0 || passwordConfirm.length === 0
    let formNotValid = (authError && authError.length !== 0) || error.length !== 0
    let wrongPassword = password !== passwordConfirm
    return formNotCompleted || formNotValid || wrongPassword
  }

  handleChange = (event) => {
    this.setState({
      [event.target.id]: event.target.value
    });
    this.validateField(event.target.id, event.target.value)
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.props.register(this.state);
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
    const { auth, authError } = this.props;
    
    if(auth.uid) return <Redirect to='/'/>
    
    let error
    if ( typeof authError === "string") {
      error = authError
    }

    return (
      <Container className="auth-container">
        <div className="auth-panel col-md-8 col-offset-2">
          <h2>Register</h2>
          <Form onSubmit={this.handleSubmit}>
            <Form.Group as={Row} controlId="login">
              <Form.Label column xs="3">Mage name</Form.Label>
              <Col xs="8">
                <Form.Control
                  size="sm"
                  autoFocus
                  placeholder="Enter your mage name"
                  type="text"
                  value={this.state.login}
                  onBlur={() => this.validateField('login')}
                  onChange={this.handleChange}
                  onFocus={() => this.setCurrentFocus('login')}
                />
                {this.renderError('login')}
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="email">
              <Form.Label column xs="3">Magic email</Form.Label>
              <Col xs="8">
                <Form.Control
                  size="sm"
                  placeholder="Enter your magic email"
                  type="email"
                  value={this.state.email}
                  onBlur={() => this.validateField('email')}
                  onChange={this.handleChange}
                  onFocus={() => this.setCurrentFocus('email')}
                />
                {this.renderError('email')}
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="password">
              <Form.Label column xs="3">Password</Form.Label>
              <Col xs="8">
                <Form.Control
                  size="sm"
                  placeholder="Enter your magic password"
                  type="password"
                  value={this.state.password}
                  onBlur={() => this.validateField('password')}
                  onChange={this.handleChange}
                  onFocus={() => this.setCurrentFocus('password')}
                />
                {this.renderError('password')}
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="passwordConfirm">
              <Form.Label column xs="3">Password (again)</Form.Label>
              <Col xs="8">
                <Form.Control
                  size="sm"
                  placeholder="Confirm your magic password"
                  type="password"
                  value={this.state.passwordConfirm}
                  onBlur={() => this.validateField('passwordConfirm')}
                  onChange={this.handleChange}
                  onFocus={() => this.setCurrentFocus('passwordConfirm')}
                />
                {this.renderError('passwordConfirm')}
              </Col>
            </Form.Group>
            <Row>
              <div className="offset-3 col-9">
                <Button
                  size="sm"
                  disabled={this.disableSubmit()}
                  type="submit"
                >
                Register
                </Button>
                <div className="error mt-2">
                  { error ? error : null }
                </div>
              </div>
            </Row>
          </Form>
        </div>
      </Container>
    );
  }
}

const mapStateToProps = (state) =>{
  return {
    authError: state.auth.authError,
    auth: state.firebase.auth
  }
}

const mapDispatchToProps = (dispatch) =>{
  return {
    register: (newUser) => dispatch(validateAndRegister(newUser)),
    clearAuthError: (field) => dispatch({ type: 'CLEAR_AUTH_ERROR', err: {field} })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Register);
