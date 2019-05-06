import React, { Component } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import './chat.css';
import Message from './Message';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect } from 'react-redux-firebase';
import { createChat, sendMessage } from '../../../../store/actions/chatActions';

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chatId: this.props.chatId,
      chatName: this.props.chatName,
      message: ''
    };
    this.scrollDown = this.scrollDown.bind(this)
  }

  scrollDown(){
    const { chatArea } = this.refs
    chatArea.scrollTop = chatArea.scrollHeight
  }

  componentDidMount() {
    this.scrollDown()
  }

	componentDidUpdate(prevProps, prevState) {
		this.scrollDown()
	}

  handleChange = (event) => {
    this.setState({message: event.target.value});
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { chatId, chatName, message } = this.state;
    const { chat, createChat } = this.props;
    if (!chat) {
      createChat(chatId, chatName);
    }
    if(message && message.trim() !== '') {
      this.props.sendMessage(message, chatId);
      this.setState({message:''});
    }
  }

  createChat = () => {

  }

  render() {
    const { chat, chatName, auth } = this.props;
    const { message } = this.state;
    let messages = null;
    if (chat && chat.messages) {
      messages = chat.messages.map((message) => {
        return <Message key={message.createdAt} message={message} />;
      })
    }

    return (
      <div className="chatContainer flex-container">
          <div className="chatPanel">
            <h5 className="chatName">{chatName}</h5>
            <div>
            <div className="chatArea" ref='chatArea'>
              {messages}
            </div></div>
            <div className="sendForm">
              <Form onSubmit={this.handleSubmit} autoComplete="off">
                <InputGroup>
                  {auth.uid ?
                  (
                    <Form.Control
                      size="sm"
                      autoFocus
                      placeholder="Enter a message..."
                      type="text"
                      name="message"
                      value={message}
                      onChange={this.handleChange}
                    />
                  ) : (
                    <Form.Control
                      size="sm"
                      disabled
                      placeholder="You must be logged in to send lobby chat messages"
                      type="text"
                      name="message"
                      value={message}
                    />
                  )}
                  <InputGroup.Append>
                    <Button variant="secondary" size="sm"
                      disabled={!auth.uid}
                      onClick={this.handleSubmit}> Send</Button>
                  </InputGroup.Append>
                </InputGroup>
              </Form>
            </div>
          </div>
      </div>
    );
  }

}

const mapStateToProps = (state, props) => {
  return {
    auth: state.firebase.auth,
    chat : state.firestore.data.chat
  }
}

const mapDispatchToProps = dispatch => {
  return {
    sendMessage: (message, chatId) => dispatch(sendMessage(message, chatId)),
    createChat: (chatId, chatName) => dispatch(createChat(chatId, chatName))
  }
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  firestoreConnect((props) => [
    { collection: 'chats',
      doc: props.chatId,
      storeAs: 'chat'
    }
  ])
)(Chat);
