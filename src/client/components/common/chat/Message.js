import React, { Component } from 'react';
import moment from 'moment';

class Message extends Component {
  render() {
    const { message } = this.props;
    return (
      <div>
        <span className="username">{message.creatorName}</span>
        <span className="createdAt">{moment(message.createdAt.toDate()).calendar()}</span>
        <div className="messageContent">{message.content}</div>
      </div>
    );
  }
}

export default Message;
