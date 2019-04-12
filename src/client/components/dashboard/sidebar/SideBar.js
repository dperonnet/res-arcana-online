import React, { Component } from 'react';
import './sidebar.css';

export default class SideBar extends Component {

  constructor(props){
    super(props);
    this.state = {
      users: [
        {
          id:1,
          name:'Bender',
          avatar: 'bender.gif'
        },
        {
          id:2,
          name:'Frey',
          avatar: ''
        },
        {
          id:3,
          name:'Kenny',
          avatar: ''
        }]
    }
  }

  render() {
    const { users } = this.state;
    return (
      <div className="sidebar expanded">
        <div href="#" className="btn pull-right">
          <span className="glyphicon glyphicon-remove"/>
        </div>
        <div className="userlist">
          Online Users
          {
            users ?
              users.map((user) => (
                <div
                  key={user.id}
                  className="user-row">
                  <img className="gravatar" src={`../../../../assets/image/avatar/${user.avatar}`} alt=''/>
                  <span>{user.name}</span>
                </div>
              )
              )
            :
            null
          }
        </div>
      </div>
    );
  }
}
