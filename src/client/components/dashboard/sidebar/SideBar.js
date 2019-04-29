import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect } from 'react-redux-firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './sidebar.css';

class SideBar extends Component {
  render() {
    const { expanded, collapse, expand, users } = this.props;
    console.log(this.props)

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
                  <span>{user.name}</span>
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

const mapStateToProps = (state) => {
  return {
    users: state.firestore.ordered.users,
    presence: state.firebase.auth.presence,
  }
}

export default compose(
  connect(mapStateToProps),
  firestoreConnect([
    { collection: 'users'}
  ])
)(SideBar)
