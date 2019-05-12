import React, { Component } from 'react';
import SignedInNav from './SignedInNav';
import SignedOutNav from './SignedOutNav';
import './navigation.css';
import { connect } from 'react-redux';

class Navigation extends Component {
  render() {
    const { auth } = this.props;
    return  auth.uid ? <SignedInNav /> : <SignedOutNav />
  }
}

const mapStateToProps = (state) =>{
  return {
    auth: state.firebase.auth
  }
}

export default connect(mapStateToProps)(Navigation)
