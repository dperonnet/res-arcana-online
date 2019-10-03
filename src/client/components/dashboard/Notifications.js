import React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { firestoreConnect } from 'react-redux-firebase'
import moment from 'moment'

const Notifications = props => {
  const { notifications } = props
  return (
    <div className="notifications">
      <div className="section">
        <div className="card z-depth-0">
          <div className="card-content">
            <span className="card-title">Notifications</span>
            <ul className="online-users">
              {notifications &&
                notifications.map(item => {
                  return (
                    <li key={item.id}>
                      <span className="pink-text">{item.user} </span>
                      <span>{item.content}</span>
                      <div className="note-date grey-text">{moment(item.time.toDate()).fromNow()}</div>
                    </li>
                  )
                })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = state => {
  return {
    notifications: state.firestore.ordered.notifications,
  }
}

export default compose(
  connect(mapStateToProps),
  firestoreConnect([
    { collection: 'games', orderBy: ['createdAt', 'desc'] },
    { collection: 'notifications', limit: 3, orderBy: ['time', 'desc'] },
  ])
)(Notifications)
