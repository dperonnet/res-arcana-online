import React, { Component } from 'react'
import { Button, Form, InputGroup } from 'react-bootstrap'
import './chat.css'
import Message from './Message'
import { connect } from 'react-redux'
import { createChat, sendMessage } from '../../../../store/actions/chatActions'

class Chat extends Component {
  constructor(props) {
    super(props)
    this.state = {
      chatId: this.props.chatId,
      chatName: this.props.chatName,
      message: '',
    }
    this.scrollDown = this.scrollDown.bind(this)
  }

  scrollDown() {
    if (this.chatArea) this.chatArea.scrollTop = this.chatArea.scrollHeight
  }

  componentDidMount() {
    this.scrollDown()
  }

  componentDidUpdate() {
    this.scrollDown()
  }

  handleChange = event => {
    this.setState({ message: event.target.value })
  }

  handleSubmit = e => {
    e.preventDefault()
    const { chatId, chatName, message } = this.state
    const { chat, createChat } = this.props
    if (!chat) {
      createChat(chatId, chatName)
    }
    if (message && message.trim() !== '') {
      this.props.sendMessage(message, chatId)
      this.setState({ message: '' })
    }
  }

  createChat = () => {}

  render() {
    const { chat, chatId, chatName, auth } = this.props
    const { message } = this.state
    let messages = null
    if (chat && chat.messages) {
      if (chat.id !== chatId) return null

      messages = chat.messages.map(message => {
        return <Message key={message.createdAt} message={message} />
      })
    }

    return (
      <div className="chat-container">
        <div className="chat-panel">
          <h5 className="chat-name">{chatName}</h5>
          <div className="chat-area" ref={c => (this.chatArea = c)}>
            {messages}
          </div>
          <div className="send-form">
            <Form onSubmit={this.handleSubmit} autoComplete="off">
              <InputGroup>
                {auth.uid ? (
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
                  <Button variant="secondary" size="sm" disabled={!auth.uid} onClick={this.handleSubmit}>
                    {' '}
                    Send
                  </Button>
                </InputGroup.Append>
              </InputGroup>
            </Form>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    auth: state.firebase.auth,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    sendMessage: (message, chatId) => dispatch(sendMessage(message, chatId)),
    createChat: (chatId, chatName) => dispatch(createChat(chatId, chatName)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Chat)
