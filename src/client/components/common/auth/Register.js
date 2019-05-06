import React, { Component } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap'
import './auth.css';
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom';
import { register } from '../../../../store/actions/authActions';

class Register extends Component {
  constructor(props){
    super(props);
    this.state = {
      email:"",
      login:"",
      password:"",
      error:""
    }
  }

  validateForm() {
    //return this.state.login.length > 0 && this.state.password.length > 0;
    return this.state.login.length > 0;
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

  setError = (error)=>{
    this.setState({error});
  }

  setUser = ({user, isUser})=>{
    if(isUser){
      this.setError("User name taken");
    }else{
      this.setError("");
      this.props.setUser(user);
    }
  }

  render() {
    const { auth, authError } = this.props;
    if(auth.uid) return <Redirect to='/'/>

    return (
      <Container>
        <div className="auth col-md-8 col-offset-2">
          <h2>Register</h2>
          <Form onSubmit={this.handleSubmit}>
            <Form.Group as={Row} controlId="login">
              <Form.Label column xs="3">Magename</Form.Label>
              <Col xs="8">
                <Form.Control
                  size="sm"
                  autoFocus
                  placeholder="Enter your mage name"
                  type="text"
                  value={this.state.login}
                  onChange={this.handleChange}
                />
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
                  onChange={this.handleChange}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="passwordConfirmation">
              <Form.Label column xs="3">Password (again)</Form.Label>
              <Col xs="8">
                <Form.Control
                  size="sm"
                  disabled
                  placeholder="Confirm your magic password"
                  type="password"
                  value={this.state.password}
                  onChange={this.handleChange}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="email">
              <Form.Label column xs="3">Magic Email</Form.Label>
              <Col xs="8">
                <Form.Control
                  size="sm"
                  placeholder="Enter your magic email"
                  type="email"
                  value={this.state.email}
                  onChange={this.handleChange}
                />
              </Col>
            </Form.Group>
            <Row>
              <div className="offset-3 col-9">
                <Button
                  size="sm"
                  disabled={!this.validateForm()}
                  type="submit"
                >
                Register
                </Button>
              </div>
            </Row>
            <Row>
              <div className="offset-3 col-9">
              <div className="error">
                { authError ? <p>{authError}</p> : null }
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
  console.log(state);
  return {
    authError: state.auth.authError,
    auth: state.firebase.auth
  }
}

const mapDispatchToProps = (dispatch) =>{
  return {
    register: (newUser) => dispatch(register(newUser))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Register);
