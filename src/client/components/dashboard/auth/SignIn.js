import React, { Component } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap'
import './auth.css';
import { connect } from 'react-redux';
import { signIn } from '../../../../store/actions/authActions';

class SignIn extends Component {
  constructor(props){
    super(props);
    this.state = {
      credentials: {
        email:"",
        login:"",
        password:"",
      },
      error:"",
      forgotPassword:false
    }
  }

  validateForm() {
    const { credentials } = this.state;
    return credentials.email.length > 0 && credentials.password.length > 0;
  }

  handleChange = (event)=>{
    const { credentials } = this.state;
    credentials[event.target.id] = event.target.value
    this.setState({credentials});
  }

  handleSubmit = (event)=>{
    event.preventDefault();
    this.props.signIn(this.state.credentials);
  }

  setError = (error)=>{
    this.setState({error});
  }

  render() {
    const { credentials, forgotPassword } = this.state;
      const { authError } = this.props;
    return (
      <Container>
        <div className="auth col-md-8 col-offset-2">
          <h2>Sign In</h2>
          <Form onSubmit={this.handleSubmit}>
            <Form.Group as={Row} controlId="email">
              <Form.Label column xs="3">Magename</Form.Label>
              <Col xs="8">
                <Form.Control
                  size="sm"
                  autoFocus
                  placeholder="Enter your mage name"
                  type="text"
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
                  onChange={this.handleChange}
                />
              </Col>
            </Form.Group>
            <Row>
              <div className="offset-3 col-9">
                <Button
                  size="sm"
                  className=""
                  disabled={!this.validateForm()}
                  type="submit"
                >
                  Login
                </Button>
                <span className="ml-3 forgotPassword" onClick={() => {this.setState({forgotPassword:true})}}>{ forgotPassword ? "Well, that sucks !" : "Forgot your password?"}</span>
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
  return {
    authError: state.auth.authError
  }
}

const mapDispatchToProps = (dispatch) =>{
  return {
    signIn: (creds) => dispatch(signIn(creds))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignIn);
