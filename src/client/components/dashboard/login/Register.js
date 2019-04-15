import React, { Component } from 'react';
import { Button, Container, Form } from 'react-bootstrap'
import { VERIFY_USER } from '../../../../server/Events';
import './login.css';

export default class Login extends Component {
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
    const { socket } = this.props;
    const { login } = this.state;
    socket.emit(VERIFY_USER, login, this.setUser);
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
    return (
      <Container>
        <div className="login register">
          <h2>Register</h2>
          <Form onSubmit={this.handleSubmit}>
            <Form.Group controlId="email">
              <Form.Control
                disabled
                placeholder="email"
                type="email"
                value={this.state.email}
                onChange={this.handleChange}
              />
            </Form.Group>
            <Form.Group controlId="login">
              <Form.Control
                autoFocus
                placeholder="Login"
                type="text"
                value={this.state.email}
                onChange={this.handleChange}
              />
            </Form.Group>
            <Form.Group controlId="password">
              <Form.Control
                disabled
                placeholder="Password"
                type="password"
                value={this.state.password}
                onChange={this.handleChange}
              />
            </Form.Group>
            <Form.Group controlId="passwordConfirmation">
              <Form.Control
                disabled
                placeholder="Confirm password"
                type="password"
                value={this.state.password}
                onChange={this.handleChange}
              />
            </Form.Group>
            <Button
              block
              disabled={!this.validateForm()}
              type="submit"
            >
              Login
            </Button>
          </Form>
        </div>
      </Container>
    );
  }
}
