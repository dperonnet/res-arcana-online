import React, { Component } from 'react';
import io from 'socket.io-client';
import { LOGOUT, USER_CONNECTED } from '../../../../server/Events';
import LoginForm from './LoginForm';
import LogoutForm from './LogoutForm'
import ChatContainer from './chats/ChatContainer'

const socketUrl = "http://127.0.0.1:3231"

export default class LoginPanel extends Component {
  constructor(props){
    super(props);
    const socket = io(socketUrl);
    socket.on('connect', ()=>{
      console.log("Connected");
    })
    this.state = {
      socket:socket,
      user:null
    }
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
          socket ? (
            !user ?
              <LoginForm
                socket={socket}
                setUser={this.setUser}
              />
            :
              <ChatContainer socket={socket} user={user} logout={this.logout} />
          ) : null
        }
      </>
    );
  }
}
