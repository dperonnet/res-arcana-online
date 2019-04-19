import React, { Component } from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { LinkContainer } from "react-router-bootstrap";
import { connect } from 'react-redux';
import { signOut } from '../../../store/actions/authActions';

class LoginPanel extends Component {
  render() {
    const { auth, signOut } = this.props;
    console.log(auth);
    return (
      auth.uid ?
        <>
          <Navbar.Text onClick={signOut}>{auth.email}</Navbar.Text>
        </>
        :
        <>
          <LinkContainer to="/signIn"><Nav.Link>Login</Nav.Link></LinkContainer>
          <LinkContainer to="/register"><Nav.Link>Register</Nav.Link></LinkContainer>
        </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.firebase.auth
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    signOut: () => dispatch(signOut())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPanel);
