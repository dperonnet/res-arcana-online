import React, { Component } from 'react'
import moment from 'moment'

class Message extends Component {
  render() {
    const { message } = this.props
    const createdAt = moment(
      typeof message.createdAt === 'number' ? new Date(message.createdAt) : message.createdAt.toDate()
    ).calendar()
    return (
      <div>
        <span className="username">{message.creatorName}</span>
        <span className="created-at">{createdAt}</span>
        <div className="message-content">{message.content}</div>
      </div>
    )
  }
}

export default Message
