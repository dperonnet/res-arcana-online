import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './sidebar.css';

export default class SideBar extends Component {
  render() {
    const { expanded, collapse, expand, users } = this.props;

    return (
      expanded ?
      <div className="sidebar expanded">
        <div className="sidebarHeader">
          Online Users
          <div className="pull-right close" onClick={collapse}>
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </div>
        </div>
        <div className="userlist">
          {
            users ?
              users.map((user) => (
                <div
                  key={user.id}
                  className="user-row">
                  <img className="gravatar" src={`../../../../assets/image/avatar/${user.avatar}`} alt=''/>
                  <span>{user.login}</span>
                </div>
              )
              )
            :
            null
          }
        </div>
      </div>
      :
      <div className="sidebar">
        <div className="sidebarHeader">
          <div className="pull-right close">
            <FontAwesomeIcon icon={faAngleRight} size="lg" onClick={expand}/>
          </div>
        </div>
      </div>
    );
  }
}
