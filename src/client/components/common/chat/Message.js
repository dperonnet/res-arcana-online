import React, { Component } from 'react'
import moment from 'moment'

class Message extends Component {
  render() {
    const { message } = this.props
    return (
      <div>
        <span className="username">{message.creatorName}</span>
        <span className="created-at">{moment(message.createdAt.toDate()).calendar()}</span>
        <div className="message-content">{message.content}</div>
      </div>
    )
  }
}

export default Message
