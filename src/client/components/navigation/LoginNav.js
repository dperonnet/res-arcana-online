import React, { Component } from 'react';
import { Nav, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from "react-router-bootstrap";
import { connect } from 'react-redux';
import { signOut } from '../../../store/actions/authActions';

class LoginPanel extends Component {
  render() {
    const { auth, profile, signOut } = this.props;
    return (
      auth.uid ?
        <>
          <NavDropdown title={profile.login} id="collasible-nav-dropdown">
            <LinkContainer to="/"><NavDropdown.Item onClick={signOut}>Logout</NavDropdown.Item></LinkContainer>
          </NavDropdown>
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
    auth: state.firebase.auth,
    profile: state.firebase.profile
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    signOut: () => dispatch(signOut())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPanel);
