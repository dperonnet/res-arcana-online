import React, { Component } from 'react';
import io from 'socket.io-client';
import { LOGOUT, USER_CONNECTED } from '../../../../server/Events';
import LoginForm from './LoginForm';
import LogoutForm from './LogoutForm'

const socketUrl = "http://localhost:3231"

export default class LoginPanel extends Component {
  constructor(props){
    super(props);
    this.state = {
      socket:null,
      user:null
    }
  }

  componentWillMount() {
      this.initSocket();
  }

  initSocket = ()=>{
    const socket = io(socketUrl);
    socket.on('connect', ()=>{
      console.log("Connected");
    })
    this.setState({socket});
  }

  setUser = (user)=>{
    const { socket } = this.state;
    socket.emit(USER_CONNECTED, user);
    this.setState({user});
  }

  logout = ()=>{
    const { socket } = this.state;
    socket.emit(LOGOUT);
    this.setState({user:null});
  }

  handleChange = ()=>{

  }

  render() {
    const { socket, user } = this.state;
    console.log(user);
    return (
      <>
      {
        !user ?
        <LoginForm
          socket={socket}
          setUser={this.setUser}
        />
        :
        <LogoutForm
          user={user}
          logout={this.logout}
        />
      }
      </>
    );
  }
}
