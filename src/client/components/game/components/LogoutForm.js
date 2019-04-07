import React, { Component } from 'react'
import { Button } from 'react-bootstrap'

export default class LogoutForm extends Component {
  render() {
    const { user, logout } = this.props
    return (
      <>
        <h1>
          Welcome {user.name}
        </h1>
        <Button onClick={logout}>Logout</Button>
      </>
    )
  }
}
