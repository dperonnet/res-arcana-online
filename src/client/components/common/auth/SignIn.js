import React, { Component } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap'
import './auth.css';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect } from 'react-redux-firebase';
import { signIn } from '../../../../store/actions/authActions';
import { Redirect } from 'react-router-dom';

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

  handleChange = (event) => {
    const { credentials } = this.state;
    credentials[event.target.id] = event.target.value
    this.setState({credentials});
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.props.signIn(this.state.credentials);
    this.forceUpdate()
  }

  setError = (error) => {
    this.setState({error});
  }

  render() {
    const { forgotPassword } = this.state;
    const { auth, authError, currentGame } = this.props;
    if(auth.uid) {
       let path = currentGame && currentGame.gameId ? '/play' : '/';
       return <Redirect to={path}/>
    }

    return (
      <Container>
        <div className="auth col-md-8 col-offset-2">
          <h2>Sign In</h2>
          <Form onSubmit={this.handleSubmit}>
            <Form.Group as={Row} controlId="email">
              <Form.Label column xs="3">Magic email</Form.Label>
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
                <span className="ml-3 forgot-password" onClick={() => {this.setState({forgotPassword:true})}}>{ forgotPassword ? "Well, that sucks ! (not implemented yet)" : "Forgot your password?"}</span>
              </div>
              <div className="offset-3 col-9">
                <div className="error mt-2">{ authError ? authError : null }</div>
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
    auth: state.firebase.auth,
    currentGame: state.firestore.data.currentGame
  }
}

const mapDispatchToProps = (dispatch) =>{
  return {
    signIn: (creds) => dispatch(signIn(creds))
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
))(SignIn);
