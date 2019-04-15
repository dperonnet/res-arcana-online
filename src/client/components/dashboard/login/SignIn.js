import React, { Component } from 'react';
import { Button, Container, Form } from 'react-bootstrap'
import { VERIFY_USER } from '../../../../server/Events';
import './login.css';

export default class SignIn extends Component {
  constructor(props){
    super(props);
    this.state = {
      login:"",
      password:"",
      error:"",
      forgotPassword:false
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
      const { forgotPassword } = this.state;

      return (
        <Container>
          <div className="login">
            <h2>Sign In</h2>
            <Form onSubmit={this.handleSubmit}>
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
              <Button
                className="col-sm-offset-2 col-sm-3"
                disabled={!this.validateForm()}
                type="submit"
              >
                Login
              </Button>
              <span className="ml-3 forgotPassword" onClick={() => {this.setState({forgotPassword:true})}}>{ forgotPassword ? "Well, that sucks !" : "Forgot your password?"}</span>
            </Form>
          </div>
        </Container>
      );
    }
}
