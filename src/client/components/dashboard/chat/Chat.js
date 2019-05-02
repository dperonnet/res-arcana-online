import React, { Component } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import './chat.css';
import Message from './Message';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect } from 'react-redux-firebase';
import { sendMessage } from '../../../../store/actions/chatActions';

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chatId: this.props.chatId,
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
    const { chatId, message } = this.state;
    if(message && message.trim() !== '') {
      this.props.sendMessage(message, chatId);
      this.setState({message:''});
    }
  }

  render() {
    const { chat } = this.props;
    const { message } = this.state;
    let messages = null;
    if (chat) {
      messages = chat.messages.map((message) => {
        return <Message key={message.createdAt} message={message} />;
      })
    }

    return (
      <div className="chatContainer flex-container">
          <div className="chatPanel">
            <h5 className="chatName">Lobby chat (x online)</h5>
            <div>
            <div className="chatArea" ref='chatArea'>
              {messages}
            </div></div>
            <div className="sendForm">
              <Form onSubmit={this.handleSubmit} autoComplete="off">
                <InputGroup>
                  <Form.Control
                    size="sm"
                    autoFocus
                    placeholder="Enter a message..."
                    type="text"
                    name="message"
                    value={message}
                    onChange={this.handleChange}
                  />
                  <InputGroup.Append>
                    <Button variant="secondary" size="sm"
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
    chat : state.firestore.data.chat
  }
}

const mapDispatchToProps = dispatch => {
  return {
    sendMessage: (message, chatId) => dispatch(sendMessage(message, chatId))
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
