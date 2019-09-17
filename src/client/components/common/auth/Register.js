import React, { Component } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap'
import './auth.css';
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom';
import { getUserByName, register } from '../../../../store/actions/authActions';

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
    this.setState({
      error
    });
    clearAuthError()
  }

  updateError = (newError) => {
    const { error } = this.state
    error.push(newError)
    this.setState({
      error
    });
    return false
  }

  validateField = (field) => {
    const { email, login, password, passwordConfirm } = this.state
    const { getUserByName } = this.props
    if (field === 'login' && login.length > 0) {
      if (login.length < 3) {
        return this.updateError({field: 'login', message: 'Your Magename is too short (min 3 characters)'})
      } else if (login.length > 25) {
        return this.updateError({field: 'login', message: 'Your Magename is too long (max 25 characters)'})
      } else {
        getUserByName(login)
        return true
      }
    } else if (field === 'email' && email.length > 0) {
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
        return this.updateError({field: 'email', message: 'Invalid email address'})
      }
    } else if (field === 'password' && password.length > 0) {
      if (password.length <= 3) {
        return this.updateError({field: 'password', message: 'Your password is too short (min 6 characters)'})
      } else if (login.length > 128) {
        return this.updateError({field: 'password', message: 'Your password is too long (max 128 characters)'})
      }
    } else if (field === 'passwordConfirm' && password.length > 0) {
      if (password !== passwordConfirm) {
        return this.updateError({field: 'passwordConfirm', message: 'Your confirmation password does not match your password'})
      }
    }

    return true
  }

  /**
   * Return true when at least one field length is 0.
   */
  disableSubmit() {
    const { authError } = this.props
    return this.state.login.length === 0 ||  this.state.email.length === 0 || this.state.password.length === 0 || this.state.passwordConfirm.length === 0 || authError;
  }

  handleChange = (event)=>{
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = (event)=>{
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
      <Container>
        <div className="auth col-md-8 col-offset-2">
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
    getUserByName: (name) => dispatch(getUserByName(name)),
    register: (newUser) => dispatch(register(newUser)),
    clearAuthError: () => dispatch({ type: 'CLEAR_AUTH_ERROR' })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Register);
